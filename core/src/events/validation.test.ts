import { beforeEach, describe, expect, test, vi } from "vitest";
import { NDK } from "../ndk/index";
import { NDKRelay } from "../relay/index";
import { NDKPrivateKeySigner } from "../signers/private-key/index";
import { NDKSubscription } from "../subscription/index";
import { NDKEvent, type NDKRawEvent } from "./index";
import { verifySignatureAsync } from "./signature";
import { verifiedSignatures } from "./validation";

// Well formed, and the hash of none of the events below.
const UNRELATED_ID = "e".repeat(64);
const JUNK_SIG = "a".repeat(128);

async function signedEvent(content: string, signer = NDKPrivateKeySigner.generate()): Promise<NDKRawEvent> {
    const event = new NDKEvent(undefined, { kind: 1, content, created_at: 1_700_000_000, tags: [] });
    await event.sign(signer);
    return event.rawEvent();
}

function verify(raw: NDKRawEvent, ndk?: NDK): boolean | undefined {
    return new NDKEvent(ndk, raw).verifySignature(true);
}

beforeEach(() => {
    verifiedSignatures.clear();
});

describe("verifySignature", () => {
    test("accepts an honestly signed event and remembers its signature by its id", async () => {
        const honest = await signedEvent("hello");

        expect(verify(honest)).toBe(true);
        expect(verifiedSignatures.get(honest.id)).toBe(honest.sig);
    });

    test("rejects an event whose id is not the hash of the event, although its signature is good", async () => {
        const honest = await signedEvent("hello");

        expect(verify({ ...honest, id: UNRELATED_ID })).toBe(false);
        expect(verifiedSignatures.has(UNRELATED_ID)).toBe(false);
    });

    test("a forged event does not borrow the verification of the event whose id it claims", async () => {
        const honest = await signedEvent("hello");
        const forgerSigner = NDKPrivateKeySigner.generate();
        const forged: NDKRawEvent = {
            ...honest,
            pubkey: (await forgerSigner.user()).pubkey,
            content: "forged",
            sig: JUNK_SIG,
        };

        expect(verify(honest)).toBe(true);
        expect(verify(forged)).toBe(false);
        expect(verify({ ...forged, sig: honest.sig })).toBe(false);
    });

    test("a relabelled event does not lend its verification to a forgery sent under the same id", async () => {
        const honest = await signedEvent("hello");
        const victim = (await NDKPrivateKeySigner.generate().user()).pubkey;
        const forged: NDKRawEvent = { ...honest, id: UNRELATED_ID, pubkey: victim, content: "forged", sig: JUNK_SIG };

        expect(verify({ ...honest, id: UNRELATED_ID })).toBe(false);
        expect(verify(forged)).toBe(false);
    });

    test("a remembered verification does not vouch for a different signature", async () => {
        const honest = await signedEvent("hello");
        const other = await signedEvent("other");

        expect(verify(honest)).toBe(true);
        expect(verify({ ...honest, sig: JUNK_SIG })).toBe(false);
        expect(verify({ ...honest, sig: other.sig })).toBe(false);
        expect(verifiedSignatures.get(honest.id)).toBe(honest.sig);
    });

    test("a failed verification is not held against the genuine event", async () => {
        const honest = await signedEvent("hello");

        expect(verify({ ...honest, sig: JUNK_SIG })).toBe(false);
        expect(verify(honest)).toBe(true);
    });

    test("with asynchronous verification, an id that is not the hash is refused before the check is sent", async () => {
        const check = vi.fn(async () => true);
        const ndk = new NDK({ signatureVerificationFunction: check });
        const honest = await signedEvent("hello");

        expect(ndk.asyncSigVerification).toBe(true);
        expect(verify({ ...honest, id: UNRELATED_ID }, ndk)).toBe(false);
        expect(check).not.toHaveBeenCalled();

        const event = new NDKEvent(ndk, honest);
        expect(event.verifySignature(true)).toBeUndefined();
        await vi.waitFor(() => expect(event.signatureVerified).toBe(true));
        expect(check).toHaveBeenCalledTimes(1);
    });
});

describe("signature verification worker", () => {
    function workerMock() {
        const posted: { id: string; sig: string }[] = [];
        const worker = {
            postMessage: (message: { id: string; sig: string }) => posted.push(message),
        } as unknown as Worker;
        return { worker, posted };
    }

    test("a malformed signature is refused at once, without asking the worker", async () => {
        const { worker, posted } = workerMock();
        const ndk = new NDK({ signatureVerificationWorker: worker });
        const honest = await signedEvent("hello");

        expect(verify({ ...honest, sig: honest.sig.slice(2) }, ndk)).toBe(false);
        expect(verify({ ...honest, sig: honest.sig.toUpperCase() }, ndk)).toBe(false);
        expect(new NDKEvent(ndk, { ...honest, sig: undefined }).verifySignature(true)).toBe(false);
        expect(posted).toHaveLength(0);
    });

    test("the worker answers for a signature it cannot parse", async () => {
        const answers: unknown[] = [];
        vi.stubGlobal("postMessage", (answer: unknown) => answers.push(answer));
        try {
            await import("../workers/sig-verification");
            const honest = await signedEvent("hello");
            const serialized = new NDKEvent(undefined, honest).serialize();
            const onmessage = globalThis.onmessage as (msg: MessageEvent) => void;

            onmessage({ data: { serialized, id: honest.id, sig: "abc", pubkey: honest.pubkey } } as MessageEvent);
            onmessage({ data: { serialized, id: honest.id, sig: honest.sig, pubkey: honest.pubkey } } as MessageEvent);

            await vi.waitFor(() => expect(answers).toHaveLength(2));
            expect(answers).toEqual([
                [honest.id, false],
                [honest.id, true],
            ]);
        } finally {
            vi.unstubAllGlobals();
        }
    });
});

describe("verifySignatureAsync with a worker", () => {
    test("a signature waiting on the worker does not answer for another signature on the same event", async () => {
        const posted: { id: string; sig: string }[] = [];
        const worker = {
            postMessage: (message: { id: string; sig: string }) => posted.push(message),
        } as unknown as Worker;
        const ndk = new NDK({ signatureVerificationWorker: worker });
        const honest = await signedEvent("hello");
        const answer = (result: boolean) => {
            if (!worker.onmessage) throw new Error("NDK did not attach to the worker");
            worker.onmessage.call(worker, { data: [honest.id, result] } as MessageEvent);
        };

        const genuine = verifySignatureAsync(new NDKEvent(ndk, honest), true);
        const junk = verifySignatureAsync(new NDKEvent(ndk, { ...honest, sig: JUNK_SIG }), true);
        expect(posted.map((message) => message.sig)).toEqual([honest.sig]);

        answer(true);
        await expect(genuine).resolves.toBe(true);

        await vi.waitFor(() => expect(posted).toHaveLength(2));
        expect(posted[1].sig).toBe(JUNK_SIG);
        answer(false);
        await expect(junk).resolves.toBe(false);
    });
});

describe("events from a relay", () => {
    function subscription(ndk: NDK) {
        const relay = new NDKRelay("wss://relay.test", undefined, ndk);
        const sub = new NDKSubscription(ndk, { kinds: [1] });
        const emitted = vi.fn();
        const reported = vi.fn();
        sub.on("event", emitted);
        ndk.on("event:invalid-sig", reported);
        return { relay, sub, emitted, reported };
    }

    test("a relay cannot pass a forgery by first sending an honest event under the forgery's id", async () => {
        const ndk = new NDK();
        const { relay, sub, emitted, reported } = subscription(ndk);
        const honest = await signedEvent("hello");
        const victim = (await NDKPrivateKeySigner.generate().user()).pubkey;

        sub.eventReceived({ ...honest, id: UNRELATED_ID }, relay);
        sub.eventReceived({ ...honest, id: UNRELATED_ID, pubkey: victim, content: "forged", sig: JUNK_SIG }, relay);

        expect(emitted).not.toHaveBeenCalled();
        expect(reported).toHaveBeenCalledTimes(2);
        expect(reported.mock.calls.every(([, from]) => from === relay)).toBe(true);

        sub.eventReceived(honest, relay);
        expect(emitted).toHaveBeenCalledTimes(1);
    });

    test("with asynchronous verification, an event whose id is not its hash is not emitted", async () => {
        const ndk = new NDK({ signatureVerificationFunction: async () => true });
        const { relay, sub, emitted, reported } = subscription(ndk);
        const honest = await signedEvent("hello");

        sub.eventReceived({ ...honest, id: UNRELATED_ID }, relay);

        expect(emitted).not.toHaveBeenCalled();
        expect(reported).toHaveBeenCalledTimes(1);
        expect(reported.mock.calls[0][1]).toBe(relay);

        sub.eventReceived(honest, relay);
        expect(emitted).toHaveBeenCalledTimes(1);
    });
});
