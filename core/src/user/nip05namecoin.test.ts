import { sha256 } from "@noble/hashes/sha2.js";
import { describe, expect, it } from "vitest";
import { NDK } from "../ndk";
import {
    buildNameIndexScript,
    DEFAULT_ELECTRUMX_SERVERS,
    electrumScriptHash,
    extractNostrFromValue,
    isDotBit,
    isValidNamecoinIdentifier,
    NamecoinAddress,
    parseNameUpdateScript,
    profilePointerFromRawJson,
} from "./nip05namecoin";
import { getNamecoinNip05For } from "./nip05namecoin-resolver";

const PK1 = "460c25e682fda7832b52d1f22d3d22b3176d972f60dcdc3212ed8c92ef85065c";
const PK2 = "b0635d6a9851d3aed0cd6c495b282167acf761729078d975fc341b22650b07b9";

describe("nip05namecoin / isValidNamecoinIdentifier", () => {
    it("matches expected positive shapes", () => {
        expect(isValidNamecoinIdentifier("example.bit")).toBe(true);
        expect(isValidNamecoinIdentifier("alice@example.bit")).toBe(true);
        expect(isValidNamecoinIdentifier("d/example")).toBe(true);
        expect(isValidNamecoinIdentifier("id/alice")).toBe(true);
        expect(isValidNamecoinIdentifier("nostr:alice@example.bit")).toBe(true);
        expect(isValidNamecoinIdentifier("  EXAMPLE.BIT  ")).toBe(true);
    });

    it("rejects non-Namecoin identifiers", () => {
        expect(isValidNamecoinIdentifier("")).toBe(false);
        expect(isValidNamecoinIdentifier("alice@example.com")).toBe(false);
        expect(isValidNamecoinIdentifier("example.com")).toBe(false);
    });

    it("isDotBit is an alias", () => {
        expect(isDotBit("alice@example.bit")).toBe(true);
        expect(isDotBit("alice@example.com")).toBe(false);
    });
});

describe("nip05namecoin / NamecoinAddress.parse", () => {
    it("parses user@domain.bit", () => {
        const addr = NamecoinAddress.parse("alice@example.bit");
        expect(addr).not.toBeNull();
        expect(addr?.namecoinName).toBe("d/example");
        expect(addr?.localPart).toBe("alice");
        expect(addr?.isDomain).toBe(true);
        expect(addr?.toString()).toBe("alice@example.bit");
    });

    it("parses bare domain.bit", () => {
        const addr = NamecoinAddress.parse("example.bit");
        expect(addr?.namecoinName).toBe("d/example");
        expect(addr?.localPart).toBe("_");
        expect(addr?.isDomain).toBe(true);
        expect(addr?.toString()).toBe("example.bit");
    });

    it("parses d/<name>", () => {
        const addr = NamecoinAddress.parse("d/example");
        expect(addr?.namecoinName).toBe("d/example");
        expect(addr?.localPart).toBe("_");
        expect(addr?.isDomain).toBe(true);
    });

    it("parses id/<name>", () => {
        const addr = NamecoinAddress.parse("id/alice");
        expect(addr?.namecoinName).toBe("id/alice");
        expect(addr?.localPart).toBe("_");
        expect(addr?.isDomain).toBe(false);
        expect(addr?.toString()).toBe("id/alice");
    });

    it("strips leading nostr: prefix", () => {
        const addr = NamecoinAddress.parse("nostr:alice@example.bit");
        expect(addr?.namecoinName).toBe("d/example");
        expect(addr?.localPart).toBe("alice");
    });

    it("is case-insensitive", () => {
        const addr = NamecoinAddress.parse("ALICE@EXAMPLE.BIT");
        expect(addr?.namecoinName).toBe("d/example");
        expect(addr?.localPart).toBe("alice");
    });

    it("rejects garbage", () => {
        expect(NamecoinAddress.parse("alice@example.com")).toBeNull();
        expect(NamecoinAddress.parse("")).toBeNull();
        expect(NamecoinAddress.parse(".bit")).toBeNull();
        expect(NamecoinAddress.parse("d/")).toBeNull();
        expect(NamecoinAddress.parse("id/")).toBeNull();
    });

    it("treats empty local-part as `_`", () => {
        const addr = NamecoinAddress.parse("@example.bit");
        expect(addr?.namecoinName).toBe("d/example");
        expect(addr?.localPart).toBe("_");
    });
});

describe("nip05namecoin / extractNostrFromValue", () => {
    it("simple form: nostr: hex resolves the root", () => {
        const addr = NamecoinAddress.parse("example.bit") as NamecoinAddress;
        const json = { nostr: PK1 };
        const out = extractNostrFromValue(addr, json);
        expect(out?.pubkey).toBe(PK1);
        expect(out?.relays).toBeUndefined();
    });

    it("simple form rejects local-part addressing", () => {
        const addr = NamecoinAddress.parse("alice@example.bit") as NamecoinAddress;
        const json = { nostr: PK1 };
        expect(extractNostrFromValue(addr, json)).toBeNull();
    });

    it("extended form: exact local-part wins", () => {
        const addr = NamecoinAddress.parse("alice@example.bit") as NamecoinAddress;
        const json = {
            nostr: {
                names: { _: PK1, alice: PK2 },
                relays: { [PK2]: ["wss://relay.example.com"] },
                nip46: { [PK2]: ["wss://nip46.example.com"] },
            },
        };
        const out = extractNostrFromValue(addr, json);
        expect(out?.pubkey).toBe(PK2);
        expect(out?.relays).toEqual(["wss://relay.example.com"]);
        expect(out?.nip46).toEqual(["wss://nip46.example.com"]);
    });

    it("extended form: falls back to `_` when local-part missing", () => {
        const addr = NamecoinAddress.parse("ghost@example.bit") as NamecoinAddress;
        const json = { nostr: { names: { _: PK1 } } };
        const out = extractNostrFromValue(addr, json);
        expect(out?.pubkey).toBe(PK1);
    });

    it("extended form: first valid wins for `_` lookup with no underscore key", () => {
        const addr = NamecoinAddress.parse("example.bit") as NamecoinAddress;
        const json = { nostr: { names: { foo: PK1, bar: PK2 } } };
        const out = extractNostrFromValue(addr, json);
        // First valid hex pubkey iterated.
        expect(out?.pubkey === PK1 || out?.pubkey === PK2).toBe(true);
    });

    it("id/ namespace: pubkey field with relay list", () => {
        const addr = NamecoinAddress.parse("id/alice") as NamecoinAddress;
        const json = {
            nostr: {
                pubkey: PK1,
                relays: ["wss://relay.example.com"],
            },
        };
        const out = extractNostrFromValue(addr, json);
        expect(out?.pubkey).toBe(PK1);
        expect(out?.relays).toEqual(["wss://relay.example.com"]);
    });

    it("id/ namespace: falls back to names._", () => {
        const addr = NamecoinAddress.parse("id/alice") as NamecoinAddress;
        const json = { nostr: { names: { _: PK1 } } };
        const out = extractNostrFromValue(addr, json);
        expect(out?.pubkey).toBe(PK1);
    });

    it("missing nostr field returns null", () => {
        const addr = NamecoinAddress.parse("example.bit") as NamecoinAddress;
        expect(extractNostrFromValue(addr, { ip: "1.2.3.4" })).toBeNull();
    });

    it("rejects non-hex pubkey strings", () => {
        const addr = NamecoinAddress.parse("example.bit") as NamecoinAddress;
        expect(extractNostrFromValue(addr, { nostr: "not-a-pubkey" })).toBeNull();
    });

    it("profilePointerFromRawJson round-trips", () => {
        const addr = NamecoinAddress.parse("example.bit") as NamecoinAddress;
        const raw = JSON.stringify({ nostr: PK1 });
        const pp = profilePointerFromRawJson(addr, raw);
        expect(pp?.pubkey).toBe(PK1);
        expect(profilePointerFromRawJson(addr, "not json")).toBeNull();
    });
});

describe("nip05namecoin / Namecoin scripts", () => {
    const OP_NAME_UPDATE = 0x53;
    const OP_2DROP = 0x6d;
    const OP_DROP = 0x75;
    const OP_RETURN = 0x6a;
    const OP_PUSHDATA1 = 0x4c;

    it("buildNameIndexScript layout matches spec", () => {
        const name = new TextEncoder().encode("d/example");
        const script = buildNameIndexScript(name);
        expect(script[0]).toBe(OP_NAME_UPDATE);
        expect(script[1]).toBe(name.length);
        expect(Buffer.from(script.slice(2, 2 + name.length)).toString()).toBe("d/example");
        expect(script[11]).toBe(0x00); // empty push
        expect(script[12]).toBe(OP_2DROP);
        expect(script[13]).toBe(OP_DROP);
        expect(script[14]).toBe(OP_RETURN);
    });

    it("electrumScriptHash returns 64-char lowercase hex", () => {
        const script = buildNameIndexScript(new TextEncoder().encode("d/example"));
        const h = electrumScriptHash(script);
        expect(h.length).toBe(64);
        expect(/^[0-9a-f]{64}$/.test(h)).toBe(true);
    });

    it("electrumScriptHash is reversed sha256 hex", () => {
        const script = buildNameIndexScript(new TextEncoder().encode("d/example"));
        const h = electrumScriptHash(script);
        // Reverse the hex back to bytes; should equal forward sha256.
        const fromHex = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
            fromHex[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
        }
        fromHex.reverse();
        const forward = sha256(script);
        expect(Array.from(fromHex)).toEqual(Array.from(forward));
    });

    it("NamecoinAddress.electrumScriptHash agrees with the building blocks", () => {
        const addr = NamecoinAddress.parse("example.bit") as NamecoinAddress;
        const h1 = addr.electrumScriptHash();
        const h2 = electrumScriptHash(buildNameIndexScript(new TextEncoder().encode("d/example")));
        expect(h1).toBe(h2);
    });

    it("parseNameUpdateScript extracts name and value (direct push)", () => {
        const name = new TextEncoder().encode("d/example");
        const value = new TextEncoder().encode("{}");
        const script = new Uint8Array([
            OP_NAME_UPDATE,
            name.length,
            ...name,
            value.length,
            ...value,
            OP_2DROP,
            OP_DROP,
            0x76,
            0xa9,
            0x14,
            0xde,
            0xad,
            0xbe,
            0xef,
        ]);
        const parsed = parseNameUpdateScript(script);
        expect(new TextDecoder().decode(parsed.name)).toBe("d/example");
        expect(new TextDecoder().decode(parsed.value)).toBe("{}");
    });

    it("parseNameUpdateScript handles OP_PUSHDATA1 framing", () => {
        const name = new TextEncoder().encode("d/example");
        const value = new Uint8Array(200).fill(0x61); // 200x 'a'
        const script = new Uint8Array([
            OP_NAME_UPDATE,
            name.length,
            ...name,
            OP_PUSHDATA1,
            200,
            ...value,
            OP_2DROP,
            OP_DROP,
        ]);
        const parsed = parseNameUpdateScript(script);
        expect(new TextDecoder().decode(parsed.name)).toBe("d/example");
        expect(Array.from(parsed.value)).toEqual(Array.from(value));
    });

    it("parseNameUpdateScript rejects non-NAME_UPDATE scripts", () => {
        expect(() => parseNameUpdateScript(new Uint8Array([0x76, 0xa9]))).toThrow();
        expect(() => parseNameUpdateScript(new Uint8Array([]))).toThrow();
    });

    it("DEFAULT_ELECTRUMX_SERVERS is well-formed", () => {
        expect(DEFAULT_ELECTRUMX_SERVERS.length).toBeGreaterThan(0);
        for (const s of DEFAULT_ELECTRUMX_SERVERS) {
            expect(s.host.length).toBeGreaterThan(0);
            expect(s.portTcpTls).toBeGreaterThan(0);
            expect(s.portWss).toBeGreaterThan(0);
        }
    });
});

describe("nip05namecoin / getNamecoinNip05For (mock resolver)", () => {
    it("resolves a .bit identifier via injected resolver", async () => {
        const ndk = new NDK();
        const rawValue = JSON.stringify({
            nostr: {
                names: { alice: PK2 },
                relays: { [PK2]: ["wss://relay.example.com"] },
            },
        });
        const resolver = async (_addr: NamecoinAddress): Promise<string> => rawValue;
        const result = await getNamecoinNip05For(ndk, "alice@example.bit", { resolver });
        expect(result?.pubkey).toBe(PK2);
        expect(result?.relays).toEqual(["wss://relay.example.com"]);
    });

    it("returns null when no resolver is configured", async () => {
        const ndk = new NDK();
        const result = await getNamecoinNip05For(ndk, "alice@example.bit");
        expect(result).toBeNull();
    });

    it("returns null for non-Namecoin identifiers", async () => {
        const ndk = new NDK();
        const resolver = async (): Promise<string> => "should not be called";
        const result = await getNamecoinNip05For(ndk, "alice@example.com", { resolver });
        expect(result).toBeNull();
    });

    it("uses ndk.namecoinResolver when set", async () => {
        const ndk = new NDK();
        ndk.namecoinResolver = async (_addr: NamecoinAddress): Promise<string> => JSON.stringify({ nostr: PK1 });
        const result = await getNamecoinNip05For(ndk, "example.bit");
        expect(result?.pubkey).toBe(PK1);
    });

    it("treats resolver rejection as a resolution failure", async () => {
        const ndk = new NDK();
        const resolver = async (): Promise<string> => {
            throw new Error("electrumx down");
        };
        const result = await getNamecoinNip05For(ndk, "example.bit", { resolver });
        expect(result).toBeNull();
    });
});
