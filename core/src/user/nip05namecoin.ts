/**
 * NIP-05 over Namecoin (`.bit`)
 *
 * Companion module to {@link ./nip05.ts} that resolves NIP-05 identifiers
 * rooted in the Namecoin blockchain instead of DNS.
 *
 * This module is **transport-free**: it only parses identifiers, builds
 * ElectrumX query primitives, and extracts NIP-05 profile data from raw
 * Namecoin name values. The caller is responsible for fetching the
 * underlying name value (typically from an ElectrumX server over WSS) and
 * handing the resulting JSON string to {@link extractNostrFromValue}.
 *
 * To support callers that *do* want to drive an ElectrumX query, the helpers
 * {@link buildNameIndexScript} and {@link electrumScriptHash} produce the
 * script and scripthash required by `blockchain.scripthash.get_history`, and
 * {@link parseNameUpdateScript} decodes the `NAME_UPDATE` output script
 * returned by `blockchain.transaction.get`.
 *
 * # Identifiers accepted
 *
 * - `alice@example.bit`
 * - `example.bit` (uses the `_` root entry)
 * - `d/example` (domain namespace, root)
 * - `id/alice` (identity namespace)
 * - A leading `nostr:` NIP-21 prefix is tolerated.
 *
 * # Local-part priority
 *
 * Inside an extended-form `nostr.names` object, the parser tries:
 * exact local-part match → `_` root → first valid pubkey (only when the
 * caller asked for the root). This matches the Kotlin/Swift/Go references
 * byte-for-byte.
 *
 * Ported from the Rust implementation at `rust-nostr/nostr` and the Go
 * reference at `mstrofnone/nostrlib-nip05-namecoin`, themselves ports of
 * the Kotlin implementation in Amethyst and the Swift port in Nostur.
 *
 * Upstream NIP PR: https://github.com/nostr-protocol/nips/pull/2349
 */

import { sha256 } from "@noble/hashes/sha2.js";
import type { Hexpubkey, ProfilePointer } from "./index.js";

// -----------------------------------------------------------------------------
// Identifier validation
// -----------------------------------------------------------------------------

/** Matches a bare or user-prefixed `.bit` identifier. */
export const NIP05_NAMECOIN_REGEX_BIT = /^(?:([\w.+-]+)@)?([\w-]+(?:\.[\w-]+)*\.bit)$/i;

/** Matches a Namecoin `d/` or `id/` namespaced identifier. */
export const NIP05_NAMECOIN_REGEX_NAMESPACED = /^(d|id)\/([\w.+-]+)$/i;

/**
 * Reports whether an identifier should be routed to Namecoin resolution
 * instead of DNS-based NIP-05.
 *
 * Matches any of:
 *
 * - `<anything>.bit`
 * - `alice@<anything>.bit`
 * - `d/<name>` or `id/<name>`
 *
 * A leading `nostr:` NIP-21 prefix is tolerated. Intentionally cheap so
 * callers can use it as a front-door check in hot paths before opening any
 * network connection.
 */
export function isValidNamecoinIdentifier(input: string): boolean {
    if (typeof input !== "string") return false;
    const trimmed = input.trim();
    if (trimmed.length === 0) return false;
    const stripped = stripNostrPrefix(trimmed).toLowerCase();
    if (stripped.startsWith("d/") || stripped.startsWith("id/")) {
        return true;
    }
    return stripped.endsWith(".bit");
}

/** Alias for {@link isValidNamecoinIdentifier}. */
export const isDotBit = isValidNamecoinIdentifier;

function stripNostrPrefix(s: string): string {
    if (s.length >= 6 && s.slice(0, 6).toLowerCase() === "nostr:") {
        return s.slice(6);
    }
    return s;
}

// -----------------------------------------------------------------------------
// NamecoinAddress
// -----------------------------------------------------------------------------

/**
 * A parsed Namecoin identifier ready to be queried against the Namecoin
 * blockchain.
 */
export class NamecoinAddress {
    /** Namecoin name to look up on-chain (e.g. `d/example`, `id/alice`). */
    public readonly namecoinName: string;
    /** Local-part to match inside the name's value, or `_` for the root. */
    public readonly localPart: string;
    /** `true` for the `d/` domain namespace, `false` for `id/`. */
    public readonly isDomain: boolean;

    constructor(namecoinName: string, localPart: string, isDomain: boolean) {
        this.namecoinName = namecoinName;
        this.localPart = localPart;
        this.isDomain = isDomain;
    }

    /**
     * Parse a Namecoin identifier (e.g. `alice@example.bit`, `example.bit`,
     * `d/example`, `id/alice`).
     *
     * Returns `null` on invalid input rather than throwing, so it composes
     * cleanly with NDK's existing `getNip05For` shape.
     */
    static parse(identifier: string): NamecoinAddress | null {
        if (typeof identifier !== "string") return null;
        const input = stripNostrPrefix(identifier.trim());
        if (input.length === 0) return null;
        const lower = input.toLowerCase();

        // Explicit namespace references.
        if (lower.startsWith("d/")) {
            const rest = lower.slice(2);
            if (rest.length === 0) return null;
            return new NamecoinAddress(lower, "_", true);
        }
        if (lower.startsWith("id/")) {
            const rest = lower.slice(3);
            if (rest.length === 0) return null;
            return new NamecoinAddress(lower, "_", false);
        }

        // NIP-05 shape: user@domain.bit
        if (input.includes("@") && lower.endsWith(".bit")) {
            const atIdx = input.indexOf("@");
            const localRaw = input.slice(0, atIdx);
            const domainRaw = input.slice(atIdx + 1);
            const local = localRaw.length === 0 ? "_" : localRaw.toLowerCase();
            const domainLower = domainRaw.toLowerCase();
            if (!domainLower.endsWith(".bit")) return null;
            const domain = domainLower.slice(0, -4);
            if (domain.length === 0) return null;
            return new NamecoinAddress(`d/${domain}`, local, true);
        }

        // Bare domain: example.bit
        if (lower.endsWith(".bit")) {
            const domain = lower.slice(0, -4);
            if (domain.length === 0) return null;
            return new NamecoinAddress(`d/${domain}`, "_", true);
        }

        return null;
    }

    /** Render the identifier back to canonical form. */
    toString(): string {
        if (this.isDomain && this.localPart !== "_") {
            return `${this.localPart}@${this.suffix()}`;
        }
        return this.suffix();
    }

    /**
     * Build the ElectrumX scripthash for this name. Pass to
     * `blockchain.scripthash.get_history` to find the latest `NAME_UPDATE`.
     */
    electrumScriptHash(): string {
        const script = buildNameIndexScript(utf8Encode(this.namecoinName));
        return electrumScriptHash(script);
    }

    private suffix(): string {
        if (this.isDomain) {
            const name = this.namecoinName.startsWith("d/") ? this.namecoinName.slice(2) : this.namecoinName;
            return `${name}.bit`;
        }
        return this.namecoinName;
    }
}

// -----------------------------------------------------------------------------
// JSON extraction
// -----------------------------------------------------------------------------

/** Result of extracting a NIP-05 record from a Namecoin name value. */
export interface NamecoinNip05Extract {
    pubkey: Hexpubkey;
    relays?: string[];
    nip46?: string[];
}

/**
 * Extract the nostr pubkey + relay list from a Namecoin name value.
 *
 * Supports both the simple `"nostr": "hex"` form and the extended
 * `"nostr": { "names": {...}, "relays": {...}, "nip46": {...} }` form used
 * by Amethyst and the `.bit` NIP-05 spec draft.
 *
 * Returns `null` when the JSON does not contain a resolvable nostr record
 * for the given address.
 */
export function extractNostrFromValue(address: NamecoinAddress, json: unknown): NamecoinNip05Extract | null {
    if (json === null || typeof json !== "object") return null;
    const nostrField = (json as Record<string, unknown>).nostr;
    if (nostrField === undefined) return null;

    // Simple form: "nostr": "hex-pubkey"
    if (typeof nostrField === "string") {
        if (address.isDomain && address.localPart !== "_") {
            // Simple form has no local-part addressing.
            return null;
        }
        if (!isHexPubkey(nostrField)) return null;
        return { pubkey: nostrField.toLowerCase() };
    }

    if (typeof nostrField !== "object") return null;
    const obj = nostrField as Record<string, unknown>;

    if (address.isDomain) {
        return extractFromDomainNamesObject(obj, address);
    }
    return extractFromIdentityObject(obj);
}

function extractFromDomainNamesObject(
    obj: Record<string, unknown>,
    address: NamecoinAddress,
): NamecoinNip05Extract | null {
    const namesField = obj.names;
    if (namesField === null || typeof namesField !== "object") return null;
    const names = namesField as Record<string, unknown>;

    // Match priority: exact local-part → "_" root → first valid (only when
    // the caller asked for the root). Matches the Kotlin reference.
    let picked: string | undefined;

    const exact = names[address.localPart];
    if (typeof exact === "string" && isHexPubkey(exact)) {
        picked = exact;
    }

    if (picked === undefined) {
        const root = names._;
        if (typeof root === "string" && isHexPubkey(root)) {
            picked = root;
        }
    }

    if (picked === undefined && address.localPart === "_") {
        for (const v of Object.values(names)) {
            if (typeof v === "string" && isHexPubkey(v)) {
                picked = v;
                break;
            }
        }
    }

    if (picked === undefined) return null;
    const pubkey = picked.toLowerCase();
    const relays = extractRelaysFor(obj, pubkey);
    const nip46 = extractNip46For(obj, pubkey);
    const out: NamecoinNip05Extract = { pubkey };
    if (relays !== undefined) out.relays = relays;
    if (nip46 !== undefined) out.nip46 = nip46;
    return out;
}

function extractFromIdentityObject(obj: Record<string, unknown>): NamecoinNip05Extract | null {
    // Try the `pubkey` field first.
    const pkStr = obj.pubkey;
    if (typeof pkStr === "string" && isHexPubkey(pkStr)) {
        const pubkey = pkStr.toLowerCase();
        const relays = extractRelayList(obj.relays);
        const out: NamecoinNip05Extract = { pubkey };
        if (relays !== undefined) out.relays = relays;
        return out;
    }

    // Fall back to NIP-05-like `names` with the `_` root.
    const namesField = obj.names;
    if (namesField !== null && typeof namesField === "object") {
        const root = (namesField as Record<string, unknown>)._;
        if (typeof root === "string" && isHexPubkey(root)) {
            const pubkey = root.toLowerCase();
            const relays = extractRelaysFor(obj, pubkey);
            const nip46 = extractNip46For(obj, pubkey);
            const out: NamecoinNip05Extract = { pubkey };
            if (relays !== undefined) out.relays = relays;
            if (nip46 !== undefined) out.nip46 = nip46;
            return out;
        }
    }
    return null;
}

function extractRelaysFor(obj: Record<string, unknown>, pubkey: string): string[] | undefined {
    const relaysField = obj.relays;
    if (relaysField === null || typeof relaysField !== "object") return undefined;
    const entry = (relaysField as Record<string, unknown>)[pubkey];
    if (!Array.isArray(entry)) return undefined;
    const out = entry.filter((r): r is string => typeof r === "string");
    return out.length > 0 ? out : undefined;
}

function extractNip46For(obj: Record<string, unknown>, pubkey: string): string[] | undefined {
    const field = obj.nip46;
    if (field === null || typeof field !== "object") return undefined;
    const entry = (field as Record<string, unknown>)[pubkey];
    if (!Array.isArray(entry)) return undefined;
    const out = entry.filter((r): r is string => typeof r === "string");
    return out.length > 0 ? out : undefined;
}

function extractRelayList(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) return undefined;
    const out = value.filter((r): r is string => typeof r === "string");
    return out.length > 0 ? out : undefined;
}

function isHexPubkey(s: string): boolean {
    if (s.length !== 64) return false;
    for (let i = 0; i < 64; i++) {
        const c = s.charCodeAt(i);
        const isDigit = c >= 48 && c <= 57;
        const isLower = c >= 97 && c <= 102;
        const isUpper = c >= 65 && c <= 70;
        if (!isDigit && !isLower && !isUpper) return false;
    }
    return true;
}

/**
 * Convenience adaptor: given a Namecoin name value as a raw JSON string,
 * return a {@link ProfilePointer} (or `null` if the value did not contain
 * a resolvable nostr record for the address).
 */
export function profilePointerFromRawJson(address: NamecoinAddress, rawJson: string): ProfilePointer | null {
    let value: unknown;
    try {
        value = JSON.parse(rawJson);
    } catch {
        return null;
    }
    const extracted = extractNostrFromValue(address, value);
    if (extracted === null) return null;
    const pointer: ProfilePointer = { pubkey: extracted.pubkey };
    if (extracted.relays) pointer.relays = extracted.relays;
    if (extracted.nip46) pointer.nip46 = extracted.nip46;
    return pointer;
}

// -----------------------------------------------------------------------------
// Namecoin script + ElectrumX scripthash helpers
// -----------------------------------------------------------------------------

const OP_NAME_UPDATE = 0x53; // OP_3, repurposed as OP_NAME_UPDATE in the Namecoin fork
const OP_2DROP = 0x6d;
const OP_DROP = 0x75;
const OP_RETURN = 0x6a;
const OP_PUSHDATA1 = 0x4c;
const OP_PUSHDATA2 = 0x4d;
const OP_PUSHDATA4 = 0x4e;

/**
 * Build the canonical name-index script used by the Namecoin ElectrumX fork.
 *
 * Format:
 *
 * ```text
 * OP_NAME_UPDATE <push(name)> <push(empty)> OP_2DROP OP_DROP OP_RETURN
 * ```
 *
 * The resulting script's SHA-256, reversed and hex-encoded, is the
 * scripthash queried via `blockchain.scripthash.get_history`. See
 * {@link electrumScriptHash}.
 */
export function buildNameIndexScript(name: Uint8Array): Uint8Array {
    // Estimate: 1 + framing(name) + framing(empty) + 3 trailing ops.
    const chunks: Uint8Array[] = [];
    chunks.push(new Uint8Array([OP_NAME_UPDATE]));
    chunks.push(pushData(name));
    chunks.push(pushData(new Uint8Array(0)));
    chunks.push(new Uint8Array([OP_2DROP, OP_DROP, OP_RETURN]));
    return concatBytes(chunks);
}

function pushData(data: Uint8Array): Uint8Array {
    const n = data.length;
    if (n < OP_PUSHDATA1) {
        const out = new Uint8Array(1 + n);
        out[0] = n;
        out.set(data, 1);
        return out;
    }
    if (n <= 0xff) {
        const out = new Uint8Array(2 + n);
        out[0] = OP_PUSHDATA1;
        out[1] = n;
        out.set(data, 2);
        return out;
    }
    if (n <= 0xffff) {
        const out = new Uint8Array(3 + n);
        out[0] = OP_PUSHDATA2;
        out[1] = n & 0xff;
        out[2] = (n >>> 8) & 0xff;
        out.set(data, 3);
        return out;
    }
    const out = new Uint8Array(5 + n);
    out[0] = OP_PUSHDATA4;
    out[1] = n & 0xff;
    out[2] = (n >>> 8) & 0xff;
    out[3] = (n >>> 16) & 0xff;
    out[4] = (n >>> 24) & 0xff;
    out.set(data, 5);
    return out;
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
    let total = 0;
    for (const c of chunks) total += c.length;
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
        out.set(c, off);
        off += c.length;
    }
    return out;
}

/**
 * Compute the Electrum scripthash: SHA-256 of `script`, byte-reversed, then
 * hex-encoded lowercase. Expected by `blockchain.scripthash.get_history`
 * and friends.
 */
export function electrumScriptHash(script: Uint8Array): string {
    const digest = sha256(script);
    // Reverse in place on a copy and hex-encode.
    let s = "";
    for (let i = digest.length - 1; i >= 0; i--) {
        s += digest[i].toString(16).padStart(2, "0");
    }
    return s;
}

/**
 * Parse a Namecoin `NAME_UPDATE` output script and return `{ name, value }`.
 *
 * Layout:
 *
 * ```text
 * OP_NAME_UPDATE <push(name)> <push(value)> OP_2DROP OP_DROP <address-script>
 * ```
 *
 * The trailing address-paying script is ignored. Throws on malformed
 * input.
 */
export function parseNameUpdateScript(script: Uint8Array): { name: Uint8Array; value: Uint8Array } {
    if (script.length === 0 || script[0] !== OP_NAME_UPDATE) {
        throw new Error("nip05namecoin: invalid NAME_UPDATE script");
    }
    const first = readPushData(script, 1);
    const second = readPushData(script, first.next);
    return { name: first.data, value: second.data };
}

function readPushData(script: Uint8Array, pos: number): { data: Uint8Array; next: number } {
    if (pos >= script.length) {
        throw new Error("nip05namecoin: invalid NAME_UPDATE script (truncated)");
    }
    const op = script[pos];
    if (op === 0x00) {
        return { data: new Uint8Array(0), next: pos + 1 };
    }
    if (op < OP_PUSHDATA1) {
        const length = op;
        const end = pos + 1 + length;
        if (end > script.length) {
            throw new Error("nip05namecoin: invalid NAME_UPDATE script (direct push)");
        }
        return { data: script.slice(pos + 1, end), next: end };
    }
    if (op === OP_PUSHDATA1) {
        if (pos + 2 > script.length) {
            throw new Error("nip05namecoin: invalid NAME_UPDATE script (PUSHDATA1)");
        }
        const length = script[pos + 1];
        const end = pos + 2 + length;
        if (end > script.length) {
            throw new Error("nip05namecoin: invalid NAME_UPDATE script (PUSHDATA1)");
        }
        return { data: script.slice(pos + 2, end), next: end };
    }
    if (op === OP_PUSHDATA2) {
        if (pos + 3 > script.length) {
            throw new Error("nip05namecoin: invalid NAME_UPDATE script (PUSHDATA2)");
        }
        const length = script[pos + 1] | (script[pos + 2] << 8);
        const end = pos + 3 + length;
        if (end > script.length) {
            throw new Error("nip05namecoin: invalid NAME_UPDATE script (PUSHDATA2)");
        }
        return { data: script.slice(pos + 3, end), next: end };
    }
    if (op === OP_PUSHDATA4) {
        if (pos + 5 > script.length) {
            throw new Error("nip05namecoin: invalid NAME_UPDATE script (PUSHDATA4)");
        }
        const length = script[pos + 1] | (script[pos + 2] << 8) | (script[pos + 3] << 16) | (script[pos + 4] << 24);
        const end = pos + 5 + length;
        if (end > script.length) {
            throw new Error("nip05namecoin: invalid NAME_UPDATE script (PUSHDATA4)");
        }
        return { data: script.slice(pos + 5, end), next: end };
    }
    throw new Error(`nip05namecoin: invalid NAME_UPDATE script (op 0x${op.toString(16)})`);
}

// -----------------------------------------------------------------------------
// ElectrumX server defaults
// -----------------------------------------------------------------------------

/**
 * A Namecoin ElectrumX server endpoint pair.
 *
 * Operators currently serve **self-signed** TLS certificates; callers that
 * pin to those certificates should ship them out of band — this module
 * keeps no transport surface and does not bundle pinned PEMs.
 */
export interface ElectrumXServer {
    /** Hostname (or IP) of the operator. */
    host: string;
    /** TCP + TLS port. ElectrumX convention is `5xxx2`. */
    portTcpTls: number;
    /** WebSocket Secure port. ElectrumX convention is `5xxx4`. */
    portWss: number;
}

/**
 * Default ElectrumX server endpoints maintained by the Namecoin ecosystem.
 *
 * Mirrors the Kotlin / Swift / Go / Rust reference implementations. Both
 * TCP+TLS (port `+0`) and WSS (port `+2`) endpoints are listed.
 */
export const DEFAULT_ELECTRUMX_SERVERS: ReadonlyArray<ElectrumXServer> = Object.freeze([
    { host: "electrumx.testls.space", portTcpTls: 50002, portWss: 50004 },
    { host: "nmc2.bitcoins.sk", portTcpTls: 57002, portWss: 57004 },
    { host: "46.229.238.187", portTcpTls: 57002, portWss: 57004 },
]);

// -----------------------------------------------------------------------------
// UTF-8 helper (isomorphic; avoids depending on TextEncoder runtime semantics)
// -----------------------------------------------------------------------------

function utf8Encode(s: string): Uint8Array {
    // TextEncoder is available in all NDK target runtimes (Node 18+, modern
    // browsers, React Native ≥0.71). Fall back to a manual encoder if not.
    if (typeof TextEncoder !== "undefined") {
        return new TextEncoder().encode(s);
    }
    const out: number[] = [];
    for (let i = 0; i < s.length; i++) {
        let c = s.charCodeAt(i);
        if (c < 0x80) {
            out.push(c);
        } else if (c < 0x800) {
            out.push(0xc0 | (c >>> 6), 0x80 | (c & 0x3f));
        } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
            const c2 = s.charCodeAt(i + 1);
            i++;
            c = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
            out.push(0xf0 | (c >>> 18), 0x80 | ((c >>> 12) & 0x3f), 0x80 | ((c >>> 6) & 0x3f), 0x80 | (c & 0x3f));
        } else {
            out.push(0xe0 | (c >>> 12), 0x80 | ((c >>> 6) & 0x3f), 0x80 | (c & 0x3f));
        }
    }
    return new Uint8Array(out);
}
