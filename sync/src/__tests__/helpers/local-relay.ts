/**
 * Minimal Nostr relay on 127.0.0.1 for exercising the real sync code path over a real WebSocket.
 *
 * - NIP-01: EVENT / REQ (honours `limit`, so `limit: 0` returns no history) / CLOSE
 * - NIP-11: GET returns an info document; `supported_nips` includes 77 when `nip77` is true
 * - NEG-OPEN handling depends on `mode`:
 *     "notice"     -> ["NOTICE", "ERROR: bad msg: unknown cmd"]  (relay without negentropy)
 *     "neg-err"    -> ["NEG-ERR", id, "blocked: ..."]            (relay advertises NIP-77 but refuses)
 *     "negentropy" -> real reconciliation using this package's Negentropy engine.
 *                     NOTE: this mode is permissive about the NEG-OPEN envelope: it ignores the filter
 *                     element entirely and reconciles against every stored event. It proves the
 *                     reconciliation and callback flow, not envelope interoperability with real relays
 *                     (strfry/khatru require a single filter object there).
 */
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import type NDK from "@nostr-dev-kit/ndk";
import type {
    NDKCacheAdapter,
    NDKCacheRelayInfo,
    NDKEvent,
    NDKFilter,
    NDKRelay,
    NDKSubscription,
} from "@nostr-dev-kit/ndk";
import { type Filter, matchFilter, type NostrEvent } from "nostr-tools";
import { finalizeEvent, generateSecretKey, getPublicKey } from "nostr-tools/pure";
import { WebSocketServer } from "ws";
import { Negentropy } from "../../negentropy/core.js";
import { NegentropyStorage } from "../../negentropy/storage.js";
import { hexToUint8Array, uint8ArrayToHex } from "../../negentropy/utils.js";

export type LocalRelayMode = "notice" | "neg-err" | "negentropy";

export interface LocalRelay {
    url: string;
    /** Every frame received from clients, parsed */
    received: unknown[][];
    close(): Promise<void>;
}

export async function startLocalRelay(opts: {
    mode: LocalRelayMode;
    nip77: boolean;
    events: NostrEvent[];
    /** When false the relay serves matching events but never sends EOSE (default: true) */
    eose?: boolean;
}): Promise<LocalRelay> {
    const store = new Map(opts.events.map((e) => [e.id, e]));
    const received: unknown[][] = [];

    const server: Server = createServer((_req, res) => {
        res.setHeader("content-type", "application/nostr+json");
        res.setHeader("access-control-allow-origin", "*");
        res.end(JSON.stringify({ name: "local-test-relay", supported_nips: opts.nip77 ? [1, 11, 77] : [1, 11] }));
    });
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        const send = (msg: unknown[]) => ws.send(JSON.stringify(msg));
        const negSessions = new Map<string, Negentropy>();

        ws.on("message", async (raw) => {
            const msg = JSON.parse(raw.toString()) as unknown[];
            received.push(msg);
            const [cmd, ...rest] = msg;

            switch (cmd) {
                case "EVENT": {
                    const e = rest[0] as NostrEvent;
                    store.set(e.id, e);
                    send(["OK", e.id, true, ""]);
                    return;
                }
                case "REQ": {
                    const [subId, ...filters] = rest as [string, ...NDKFilter[]];
                    const sent = new Set<string>();
                    for (const f of filters) {
                        const matched = [...store.values()]
                            .filter((e) => matchFilter(f as Filter, e))
                            .sort((a, b) => b.created_at - a.created_at);
                        const cap = typeof f.limit === "number" ? f.limit : matched.length;
                        for (const e of matched.slice(0, cap)) {
                            if (sent.has(e.id)) continue;
                            sent.add(e.id);
                            send(["EVENT", subId, e]);
                        }
                    }
                    if (opts.eose !== false) send(["EOSE", subId]);
                    return;
                }
                case "CLOSE":
                    return;
                case "NEG-OPEN": {
                    const [id, , initialMsg] = rest as [string, unknown, string];
                    if (opts.mode === "notice") return send(["NOTICE", "ERROR: bad msg: unknown cmd"]);
                    if (opts.mode === "neg-err") return send(["NEG-ERR", id, "blocked: negentropy disabled"]);
                    const storage = new NegentropyStorage();
                    for (const e of store.values()) storage.insert(e.created_at, e.id);
                    storage.seal();
                    const neg = new Negentropy(storage);
                    negSessions.set(id, neg);
                    const { nextMessage } = await neg.reconcile(hexToUint8Array(initialMsg));
                    if (nextMessage) send(["NEG-MSG", id, uint8ArrayToHex(nextMessage)]);
                    return;
                }
                case "NEG-MSG": {
                    const [id, payload] = rest as [string, string];
                    const neg = negSessions.get(id);
                    if (!neg) return send(["NEG-ERR", id, "closed: unknown session"]);
                    const { nextMessage } = await neg.reconcile(hexToUint8Array(payload));
                    if (nextMessage) send(["NEG-MSG", id, uint8ArrayToHex(nextMessage)]);
                    return;
                }
                case "NEG-CLOSE":
                    negSessions.delete(rest[0] as string);
                    return;
                default:
                    send(["NOTICE", "ERROR: bad msg: unknown cmd"]);
            }
        });
    });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;

    return {
        url: `ws://127.0.0.1:${port}`,
        received,
        close: () =>
            new Promise<void>((resolve) => {
                for (const client of wss.clients) client.terminate();
                wss.close(() => server.close(() => resolve()));
            }),
    };
}

/** Signed kind-1 events from a throwaway key, so the relay serves valid events. */
export function makeSignedEvents(count: number): { pubkey: string; events: NostrEvent[] } {
    const sk = generateSecretKey();
    const pubkey = getPublicKey(sk);
    const base = Math.floor(Date.now() / 1000) - 3600;
    const events = Array.from({ length: count }, (_, i) =>
        finalizeEvent({ kind: 1, created_at: base + i * 60, tags: [], content: `event ${i}` }, sk),
    );
    return { pubkey, events };
}

/** Minimal in-memory cache adapter: enough for ndkSync() (query/setEvent) and NDKSync capability tracking. */
export class TestCacheAdapter
    implements
        Pick<NDKCacheAdapter, "locking" | "ready" | "query" | "setEvent" | "updateRelayStatus" | "getRelayStatus">
{
    locking = false;
    ready = true;
    events = new Map<string, NDKEvent>();
    relayStatus = new Map<string, NDKCacheRelayInfo>();

    async query(subscription: NDKSubscription): Promise<NDKEvent[]> {
        const out: NDKEvent[] = [];
        for (const event of this.events.values()) {
            if (subscription.filters.some((f) => matchFilter(f as Filter, event.rawEvent() as NostrEvent)))
                out.push(event);
        }
        return out;
    }

    async setEvent(event: NDKEvent, _filters: NDKFilter[], _relay?: NDKRelay): Promise<void> {
        this.events.set(event.id, event);
    }

    updateRelayStatus(relayUrl: string, info: NDKCacheRelayInfo): void {
        const existing = this.relayStatus.get(relayUrl) ?? {};
        this.relayStatus.set(relayUrl, {
            ...existing,
            ...info,
            metadata: { ...existing.metadata, ...info.metadata },
        });
    }

    getRelayStatus(relayUrl: string): NDKCacheRelayInfo | undefined {
        return this.relayStatus.get(relayUrl);
    }
}

export async function waitFor(condition: () => boolean, timeoutMs = 5000): Promise<void> {
    const end = Date.now() + timeoutMs;
    while (!condition()) {
        if (Date.now() > end) throw new Error("waitFor: timed out");
        await new Promise((r) => setTimeout(r, 20));
    }
}

export async function connectedRelay(ndk: NDK): Promise<NDKRelay> {
    await ndk.connect(2000);
    const relay = [...ndk.pool.relays.values()][0];
    await waitFor(() => relay.connected, 3000);
    return relay;
}
