import { generateSecretKey, getPublicKey, serializeEvent } from "nostr-tools";
import type { NostrEvent } from "nostr-tools";
import {
    getNonceBounds,
    deserializeEvent,
    incrementNonceBuffer,
    setNonceBuffer,
    countLeadingZeroesBin,
} from "./Miner";

describe("miner.ts", () => {
    let privKey: Uint8Array;
    let pubkey: string;
    let event: NostrEvent;
    let serializedEvent: string;
    let binaryEvent: Uint8Array;

    beforeAll(() => {
        privKey = generateSecretKey();
        pubkey = getPublicKey(privKey);

        event = {
            id: "",
            sig: "",
            pubkey: pubkey,
            created_at: 1234567890,
            kind: 1,
            tags: [
                ["nonce", "0000000000000000", "20"],
                ["exampleTagKey", "exampleTagValue"],
            ],
            content: "exampleContent",
        } as NostrEvent;

        serializedEvent = serializeEvent(event);
        binaryEvent = new TextEncoder().encode(serializedEvent);
    });

    describe("getNonceBounds", () => {
        it("should return the beginning and ending index of the nonce in the serialized event", () => {
            const [startIndex, endIndex] = getNonceBounds(serializedEvent);
            expect(startIndex).toBeGreaterThan(0);
            expect(endIndex).toBeGreaterThan(0);
            expect(endIndex).toBeGreaterThan(startIndex);
            // We're using a 16-bit nonce, so we expect the difference between the start and end index to be 16
            expect(endIndex - startIndex).toBe(16);
        });
    });

    describe("deserializeEvent", () => {
        it("should deserialize a nostr event from a string", () => {
            const deserializedEvent = deserializeEvent(serializedEvent);

            expect(deserializedEvent.content).toBe(event.content);
            expect(deserializedEvent.created_at).toBe(event.created_at);
            expect(deserializedEvent.kind).toBe(event.kind);
            expect(deserializedEvent.pubkey).toBe(event.pubkey);
            expect(deserializedEvent.tags).toStrictEqual(event.tags);
        });
    });

    describe("incrementNonceBuffer", () => {
        it("should increment the values in a Uint8Array buffer from a specified start index to an end index", () => {
            const startIndex = 94;
            const endIndex = 110;
            const modifiedBuffer = incrementNonceBuffer(binaryEvent, startIndex, endIndex);
            // Assertions here
        });
    });

    describe("setNonceBuffer", () => {
        it("should set the nonce value in the given buffer at the specified range", () => {
            const buffer = new Uint8Array([1, 2, 3, 4, 5]);
            const startIndex = 1;
            const endIndex = 3;
            const nonce = 10;
            const modifiedBuffer = setNonceBuffer(buffer, startIndex, endIndex, nonce);
            // Assertions here
        });
    });

    describe("countLeadingZeroesBin", () => {
        it("should count the number of leading zeroes in a binary array", () => {
            const hex1 = "000000000e9d97a1ab09fc381030b346cdd7a142ad57e6df0b46dc9bef6c7e2d";
            const binary1 = new Uint8Array(Buffer.from(hex1, "hex"));
            const leadingZeroesCount1 = countLeadingZeroesBin(binary1);
            expect(leadingZeroesCount1).toBe(36);

            const hex2 = "0000a7f81e9d97a1ab09fc381030b346cdd7a142ad57e6df0b46dc9bef6c7e2d";
            const binary2 = new Uint8Array(Buffer.from(hex2, "hex"));
            const leadingZeroesCount2 = countLeadingZeroesBin(binary2);
            expect(leadingZeroesCount2).toBe(16);

            const hex3 = "abc1a7f81e9d97a1ab09fc381030b346cdd7a142ad57e6df0b46dc9bef6c7e2d";
            const binary3 = new Uint8Array(Buffer.from(hex3, "hex"));
            const leadingZeroesCount3 = countLeadingZeroesBin(binary3);
            expect(leadingZeroesCount3).toBe(0);
        });
    });
});
