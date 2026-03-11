import { describe, expect, it } from "vitest";
import { ThompsonSampler } from "./thompson.js";

// Deterministic RNG — always returns 0.5
const fixedRng = () => 0.5;

// Incrementing RNG for differentiation tests
function seqRng() {
    let i = 0;
    return () => {
        i = (i + 1) % 1000;
        return i / 1000;
    };
}

describe("ThompsonSampler", () => {
    describe("weightedScore", () => {
        it("returns weight × rng for unknown relays (uniform prior)", () => {
            const sampler = new ThompsonSampler({ rng: fixedRng });
            // authorCount = 1 → weight = 1 + ln(1) = 1
            // rng() = 0.5 → score = 1 * 0.5 = 0.5
            expect(sampler.weightedScore("wss://unknown.com/", 1)).toBeCloseTo(0.5, 5);
        });

        it("scores higher for relays with more authors", () => {
            const sampler = new ThompsonSampler({ rng: fixedRng });
            const score1 = sampler.weightedScore("wss://relay.com/", 1);
            const score10 = sampler.weightedScore("wss://relay.com/", 10);
            expect(score10).toBeGreaterThan(score1);
        });

        it("uses Beta priors when available", () => {
            const sampler = new ThompsonSampler({ rng: fixedRng });
            // Set up a relay with strong success record
            sampler.relayScores.set("wss://good.com/", { alpha: 10, beta: 2 });
            // Set up a relay with poor record
            sampler.relayScores.set("wss://bad.com/", { alpha: 2, beta: 10 });

            // With fixed rng, the sampling should reflect the priors
            // Run many times to test the relative ordering
            let goodWins = 0;
            const rng = seqRng();
            const s = new ThompsonSampler({ rng });
            s.relayScores.set("wss://good.com/", { alpha: 10, beta: 2 });
            s.relayScores.set("wss://bad.com/", { alpha: 2, beta: 10 });

            for (let i = 0; i < 100; i++) {
                const good = s.weightedScore("wss://good.com/", 5);
                const bad = s.weightedScore("wss://bad.com/", 5);
                if (good > bad) goodWins++;
            }

            // Good relay should win most of the time
            expect(goodWins).toBeGreaterThan(60);
        });
    });

    describe("observe", () => {
        it("updates priors on delivery", () => {
            const sampler = new ThompsonSampler();
            sampler.observe("wss://relay.com/", "pubkey1", true);

            const prior = sampler.relayScores.get("wss://relay.com/")!;
            expect(prior.alpha).toBe(2); // 1 + 1
            expect(prior.beta).toBe(1); // unchanged
        });

        it("updates priors on miss", () => {
            const sampler = new ThompsonSampler();
            sampler.observe("wss://relay.com/", "pubkey1", false);

            const prior = sampler.relayScores.get("wss://relay.com/")!;
            expect(prior.alpha).toBe(1); // unchanged
            expect(prior.beta).toBe(2); // 1 + 1
        });

        it("deduplicates observations within a round (P8)", () => {
            const sampler = new ThompsonSampler();
            sampler.observe("wss://relay.com/", "pubkey1", true);
            sampler.observe("wss://relay.com/", "pubkey1", true); // duplicate
            sampler.observe("wss://relay.com/", "pubkey1", false); // duplicate, different result

            const prior = sampler.relayScores.get("wss://relay.com/")!;
            // Only first observation counts
            expect(prior.alpha).toBe(2);
            expect(prior.beta).toBe(1);
        });

        it("allows same relay-author pair in new round after decay", () => {
            const sampler = new ThompsonSampler();
            sampler.observe("wss://relay.com/", "pubkey1", true);
            sampler.decay(); // resets dedup set
            sampler.observe("wss://relay.com/", "pubkey1", true);

            const prior = sampler.relayScores.get("wss://relay.com/")!;
            // After decay: alpha was 2 → 1 + (2-1)*0.95 = 1.95
            // After second observe: 1.95 + 1 = 2.95
            expect(prior.alpha).toBeCloseTo(2.95, 5);
        });

        it("supports weighted observations", () => {
            const sampler = new ThompsonSampler();
            sampler.observe("wss://relay.com/", "pubkey1", true, 0.3);

            const prior = sampler.relayScores.get("wss://relay.com/")!;
            expect(prior.alpha).toBeCloseTo(1.3, 5);
            expect(prior.beta).toBe(1);
        });
    });

    describe("decay", () => {
        it("decays priors toward uniform (1,1)", () => {
            const sampler = new ThompsonSampler({ decayFactor: 0.5 });
            sampler.relayScores.set("wss://relay.com/", { alpha: 5, beta: 3 });
            sampler.decay();

            const prior = sampler.relayScores.get("wss://relay.com/")!;
            // alpha: 1 + (5-1) * 0.5 = 3
            // beta: 1 + (3-1) * 0.5 = 2
            expect(prior.alpha).toBe(3);
            expect(prior.beta).toBe(2);
        });

        it("prunes near-uniform priors", () => {
            const sampler = new ThompsonSampler({ decayFactor: 0.001 });
            sampler.relayScores.set("wss://relay.com/", { alpha: 1.005, beta: 1.005 });
            sampler.decay();

            // Should be pruned since decayed values are nearly 1
            expect(sampler.relayScores.has("wss://relay.com/")).toBe(false);
        });
    });

    describe("export/import", () => {
        it("round-trips priors correctly", () => {
            const sampler = new ThompsonSampler();
            sampler.relayScores.set("wss://relay1.com/", { alpha: 5, beta: 3 });
            sampler.relayScores.set("wss://relay2.com/", { alpha: 2, beta: 8 });

            const exported = sampler.exportPriors();
            const sampler2 = new ThompsonSampler();
            sampler2.importPriors(exported);

            expect(sampler2.relayScores.get("wss://relay1.com/")).toEqual({ alpha: 5, beta: 3 });
            expect(sampler2.relayScores.get("wss://relay2.com/")).toEqual({ alpha: 2, beta: 8 });
        });

        it("clamps imported values to minimum of 1", () => {
            const sampler = new ThompsonSampler();
            sampler.importPriors({
                "wss://relay.com/": { alpha: 0.5, beta: -1 },
            });

            const prior = sampler.relayScores.get("wss://relay.com/")!;
            expect(prior.alpha).toBe(1);
            expect(prior.beta).toBe(1);
        });

        it("exports as JSON-serializable", () => {
            const sampler = new ThompsonSampler();
            sampler.relayScores.set("wss://relay.com/", { alpha: 3, beta: 7 });

            const json = JSON.stringify(sampler.exportPriors());
            const parsed = JSON.parse(json);

            expect(parsed["wss://relay.com/"]).toEqual({ alpha: 3, beta: 7 });
        });
    });
});
