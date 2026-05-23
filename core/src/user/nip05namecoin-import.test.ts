/**
 * Hermetic tests for the Namecoin `import` chain resolver and the
 * import-aware NIP-05 path through `getNamecoinNip05For`.
 *
 * Tests do NOT touch the network: every "imported" name is served by
 * an in-memory map keyed by Namecoin name. Ported from the Kotlin
 * reference at amethyst:quartz/.../NamecoinImportTest.kt.
 */

import { describe, expect, it, vi } from "vitest";
import { NDK } from "../ndk";
import type { NamecoinAddress } from "./nip05namecoin";
import { expandImports } from "./nip05namecoin-import";
import { getNamecoinNip05For } from "./nip05namecoin-resolver";

// Realistic 64-hex pubkeys for the integration cases.
const PK_ROOT = "460c25e682fda7832b52d1f22d3d22b3176d972f60dcdc3212ed8c92ef85065c";
const PK_M = "6cdebccabda1dfa058ab85352a79509b592b2bdfa0370325e28ec1cb4f18667d";
const PK_A = "aaaa000000000000000000000000000000000000000000000000000000000001";
const PK_B = "bbbb000000000000000000000000000000000000000000000000000000000002";

/**
 * Build a lookup callback over a static name → raw-JSON map.
 *
 * Names not present in the map resolve to `null`. The returned helper
 * exposes a `queried` array for regression assertions on I/O cost.
 */
function makeLookup(records: Record<string, string>) {
    const queried: string[] = [];
    const fn = vi.fn(async (name: string): Promise<string | null> => {
        queried.push(name);
        return Object.hasOwn(records, name) ? records[name] : null;
    });
    return { fn, queried };
}

describe("nip05namecoin-import / expandImports (unit)", () => {
    it("returns object unchanged when there is no import key", async () => {
        const root = { ip: "1.2.3.4" };
        const lookup = vi.fn(async (_: string): Promise<string | null> => {
            throw new Error("lookup must not be called for non-import records");
        });
        const expanded = await expandImports(root, lookup);
        expect(expanded).toBe(root);
        expect(lookup).not.toHaveBeenCalled();
    });

    it("accepts the bare-string shorthand for `import`", async () => {
        // `"import": "d/lib"` ↔ `[["d/lib", ""]]`
        const { fn } = makeLookup({
            "d/lib": JSON.stringify({ ip: "9.9.9.9", nostr: { names: { _: "abc" } } }),
        });
        const expanded = await expandImports({ import: "d/lib", ip: "1.1.1.1" }, fn);
        // Importer wins on `ip`, imports fill in `nostr.names`.
        expect(expanded.ip).toBe("1.1.1.1");
        expect((expanded.nostr as Record<string, unknown>).names).toEqual({ _: "abc" });
        expect("import" in expanded).toBe(false);
    });

    it('accepts the single-element-array shorthand `["d/foo"]`', async () => {
        const { fn } = makeLookup({
            "d/lib": JSON.stringify({ tag: "from-lib" }),
        });
        const expanded = await expandImports({ import: ["d/lib"] }, fn);
        expect(expanded.tag).toBe("from-lib");
    });

    it('accepts the pair-array shorthand `["d/foo", "selector"]`', async () => {
        const { fn } = makeLookup({
            "d/lib": JSON.stringify({
                ip: "1.1.1.1",
                map: { relay: { ip: "7.7.7.7", tag: "selected" } },
            }),
        });
        const expanded = await expandImports({ import: ["d/lib", "relay"] }, fn);
        // The selected `map.relay` node contents (not the d/lib root) get merged.
        expect(expanded.ip).toBe("7.7.7.7");
        expect(expanded.tag).toBe("selected");
    });

    it("accepts the canonical array-of-arrays form and merges in order", async () => {
        const { fn } = makeLookup({
            "d/a": JSON.stringify({ ip: "10.0.0.1", tag: "from-a" }),
            "d/b": JSON.stringify({ ip: "10.0.0.2", extra: "from-b" }),
        });
        const expanded = await expandImports({ import: [["d/a"], ["d/b"]] }, fn);
        // d/b is processed after d/a, so its `ip` overrides d/a's; the
        // importer itself has no `ip`, so the last imported one wins.
        expect(expanded.ip).toBe("10.0.0.2");
        expect(expanded.tag).toBe("from-a");
        expect(expanded.extra).toBe("from-b");
    });

    it("merges with importer-wins precedence on plain keys", async () => {
        const { fn } = makeLookup({
            "d/lib": JSON.stringify({ ip: "9.9.9.9", extra: "remote", only: "yes" }),
        });
        const expanded = await expandImports(
            { import: "d/lib", ip: "1.1.1.1", extra: "local" },
            fn,
        );
        expect(expanded.ip).toBe("1.1.1.1");
        expect(expanded.extra).toBe("local");
        expect(expanded.only).toBe("yes");
    });

    it("treats `null` in importer as a delete marker (semantic suppression)", async () => {
        // ifa-0001: a null in the importer is "present for precedence"
        // and nullifies the imported value.
        const { fn } = makeLookup({
            "d/lib": JSON.stringify({ ip: "9.9.9.9", other: "keep" }),
        });
        const expanded = await expandImports({ import: "d/lib", ip: null }, fn);
        // The merged object still has `ip` as null. Downstream parsers
        // ignore null as if absent (same outcome).
        expect("ip" in expanded).toBe(true);
        expect(expanded.ip).toBeNull();
        expect(expanded.other).toBe("keep");
    });

    it("supports the spec-mandated four-level recursion happy path", async () => {
        const { fn } = makeLookup({
            "d/a": JSON.stringify({ import: "d/b", layer: "a" }),
            "d/b": JSON.stringify({ import: "d/c", layer: "b" }),
            "d/c": JSON.stringify({ import: "d/d", layer: "c" }),
            "d/d": JSON.stringify({ layer: "d", deep: "reached" }),
        });
        const expanded = await expandImports({ import: "d/a" }, fn);
        // Each layer overrides "layer" so the importer sees "a"; "deep"
        // only exists on d/d and survives to the top.
        expect(expanded.layer).toBe("a");
        expect(expanded.deep).toBe("reached");
    });

    it("silently truncates recursion past the depth budget", async () => {
        const { fn } = makeLookup({
            "d/a": JSON.stringify({ import: "d/b", tag: "from-a" }),
            "d/b": JSON.stringify({ tag: "from-b", leaf: "wont-show" }),
        });
        // maxDepth=1: only one level of imports is expanded.
        const expanded = await expandImports({ import: "d/a", local: "keep" }, fn, 1);
        expect(expanded.tag).toBe("from-a");
        expect(expanded.local).toBe("keep");
        // d/b was never expanded so its keys are NOT present.
        expect(expanded.leaf).toBeUndefined();
    });

    it("treats a lookup returning null as an empty object", async () => {
        // Spec MAY fail the whole record on a missing import; we choose
        // lenient semantics so transient ElectrumX hiccups don't kill
        // resolution outright.
        const lookup = vi.fn(async (_: string): Promise<string | null> => null);
        const expanded = await expandImports({ import: "d/missing", local: "survives" }, lookup);
        expect(expanded.local).toBe("survives");
        expect("import" in expanded).toBe(false);
    });

    it("treats a lookup that throws as an empty object", async () => {
        const lookup = vi.fn(async (_: string): Promise<string | null> => {
            throw new Error("electrumx down");
        });
        const expanded = await expandImports({ import: "d/broken", local: "survives" }, lookup);
        expect(expanded.local).toBe("survives");
    });

    it("treats a lookup returning malformed JSON as an empty object", async () => {
        const { fn } = makeLookup({
            "d/broken": "not valid json {{{",
        });
        const expanded = await expandImports({ import: "d/broken", local: "keep" }, fn);
        expect(expanded.local).toBe("keep");
    });

    it("treats a malformed `import` value (number) as no-op", async () => {
        const lookup = vi.fn(async (_: string): Promise<string | null> => null);
        const expanded = await expandImports({ import: 42, local: "keep" }, lookup);
        expect(expanded.local).toBe("keep");
        expect("import" in expanded).toBe(false);
        expect(lookup).not.toHaveBeenCalled();
    });

    it("breaks cycles in import chains without infinite recursion", async () => {
        // d/a imports d/b which imports d/a. The visited-set guard
        // breaks the loop; the importer's own items still apply.
        const { fn } = makeLookup({
            "d/a": JSON.stringify({ import: "d/b", fromA: "yes" }),
            "d/b": JSON.stringify({ import: "d/a", fromB: "yes" }),
        });
        const expanded = await expandImports({ import: "d/a", local: "top" }, fn);
        expect(expanded.local).toBe("top");
        // At least one of fromA/fromB should have made it through; we
        // don't pin which because the cycle break point is an
        // implementation detail. The call MUST terminate.
        expect("fromA" in expanded || "fromB" in expanded).toBe(true);
    });

    it("walks a multi-label selector in DNS order via the `map` tree", async () => {
        // selector "a.b" → descend map.b, then map.a (DNS-rightmost first).
        const { fn } = makeLookup({
            "d/lib": JSON.stringify({
                map: { b: { map: { a: { value: "deep" } } } },
            }),
        });
        const expanded = await expandImports({ import: [["d/lib", "a.b"]] }, fn);
        expect(expanded.value).toBe("deep");
    });

    it("falls back to the `*` wildcard when the exact selector label is missing", async () => {
        const { fn } = makeLookup({
            "d/lib": JSON.stringify({
                map: { "*": { value: "wildcard" } },
            }),
        });
        const expanded = await expandImports({ import: ["d/lib", "ghost"] }, fn);
        expect(expanded.value).toBe("wildcard");
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration: getNamecoinNip05For end-to-end with a fake ElectrumX transport
// ─────────────────────────────────────────────────────────────────────────────

/**
 * In-memory ElectrumX double. `addr.namecoinName` keys the records map.
 * `queriedNames` records every call so tests can assert exact I/O cost
 * (the "zero extra cost" regression guard for non-import records).
 */
function makeFakeResolver(records: Record<string, string>) {
    const queriedNames: string[] = [];
    const resolver = async (addr: NamecoinAddress): Promise<string> => {
        queriedNames.push(addr.namecoinName);
        const v = records[addr.namecoinName];
        if (v === undefined) throw new Error(`name not registered: ${addr.namecoinName}`);
        return v;
    };
    return { resolver, queriedNames };
}

describe("nip05namecoin-import / getNamecoinNip05For (integration)", () => {
    it("resolves a bare `.bit` identifier via an import chain", async () => {
        // The real-world `testls.bit` deployment: apex record at
        // d/testls is up against the 520-byte limit and delegates its
        // `nostr.names` block to dd/testls via `"import":"dd/testls"`.
        const { resolver, queriedNames } = makeFakeResolver({
            "d/testls": JSON.stringify({
                import: "dd/testls",
                ip: "107.152.38.155",
            }),
            "dd/testls": JSON.stringify({
                nostr: {
                    names: { _: PK_ROOT, m: PK_M },
                },
            }),
        });
        const ndk = new NDK();
        const result = await getNamecoinNip05For(ndk, "testls.bit", { resolver });
        expect(result?.pubkey).toBe(PK_ROOT);
        // Both names must have been queried (parent + import target).
        expect(queriedNames).toContain("d/testls");
        expect(queriedNames).toContain("dd/testls");
    });

    it("resolves a named NIP-05 (`m@testls.bit`) through an import chain", async () => {
        const { resolver } = makeFakeResolver({
            "d/testls": JSON.stringify({ import: "dd/testls" }),
            "dd/testls": JSON.stringify({
                nostr: { names: { m: PK_M } },
            }),
        });
        const ndk = new NDK();
        const result = await getNamecoinNip05For(ndk, "m@testls.bit", { resolver });
        expect(result?.pubkey).toBe(PK_M);
    });

    it("issues exactly one query for a record without `import` (zero-cost regression guard)", async () => {
        // Pure regression guard: ensure non-import records pay zero
        // I/O cost beyond the apex query.
        const { resolver, queriedNames } = makeFakeResolver({
            "d/plain": JSON.stringify({
                nostr: { names: { _: PK_ROOT } },
            }),
        });
        const ndk = new NDK();
        const result = await getNamecoinNip05For(ndk, "plain.bit", { resolver });
        expect(result?.pubkey).toBe(PK_ROOT);
        expect(queriedNames).toEqual(["d/plain"]);
    });

    it("applies importer-wins to `nostr.names` so the apex can override an imported entry", async () => {
        // The importer's whole `nostr` object replaces the imported one
        // (shallow merge per spec). PK_A from d/testls wins over PK_B
        // from dd/testls.
        const { resolver } = makeFakeResolver({
            "d/testls": JSON.stringify({
                import: "dd/testls",
                nostr: { names: { m: PK_A } },
            }),
            "dd/testls": JSON.stringify({
                nostr: { names: { m: PK_B } },
            }),
        });
        const ndk = new NDK();
        const result = await getNamecoinNip05For(ndk, "m@testls.bit", { resolver });
        expect(result?.pubkey).toBe(PK_A);
    });

    it("still resolves when an import target is unreachable but the importer has its own names", async () => {
        // Importer has its own `nostr.names`; the imported boilerplate
        // happens to be unreachable. Resolution still succeeds from the
        // importer's own data.
        const { resolver } = makeFakeResolver({
            "d/testls": JSON.stringify({
                import: "dd/missing",
                nostr: { names: { _: PK_ROOT } },
            }),
            // dd/missing is intentionally NOT registered.
        });
        const ndk = new NDK();
        const result = await getNamecoinNip05For(ndk, "testls.bit", { resolver });
        expect(result?.pubkey).toBe(PK_ROOT);
    });
});
