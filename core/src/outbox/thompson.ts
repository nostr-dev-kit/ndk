import createDebug from "debug";
import { sampleBeta } from "../utils/sample-beta.js";

const d = createDebug("ndk:thompson");

export interface RelayPrior {
    alpha: number; // successes + 1
    beta: number; // failures + 1
}

export interface ThompsonSamplerOptions {
    /** Decay factor applied each observation round. Default: 0.95 */
    decayFactor?: number;
    /** Injectable RNG for deterministic tests. Default: Math.random */
    rng?: () => number;
}

/**
 * Thompson Sampling relay scorer.
 *
 * Maintains Beta(α,β) priors per relay, updated from binary delivery
 * observations after each subscription EOSE. Uses Bayesian sampling
 * to balance exploration vs exploitation when ranking relays.
 *
 * **Key design decisions:**
 * - Binary signal only (P1): hit/miss per (relay, author) pair
 * - Per-round dedup (P8): multiple subs querying same relay-author
 *   only generate one observation per round
 * - No NDKRelayScore type change (P6): uses separate RelayPrior type
 * - Persistence via export/import (P9): plain JSON-serializable
 */
export class ThompsonSampler {
    public relayScores = new Map<string, RelayPrior>();
    private observedThisRound = new Set<string>(); // "relay|author" dedup [P8]
    private readonly decayFactor: number;
    private readonly rng: () => number;
    private readonly debug: ReturnType<typeof createDebug>;

    constructor(options?: ThompsonSamplerOptions) {
        this.decayFactor = options?.decayFactor ?? 0.95;
        this.rng = options?.rng ?? Math.random;
        this.debug = d;
    }

    /**
     * Weighted Thompson score: (1 + ln(authorCount)) × sampleBeta(α, β)
     *
     * The log-weighted author count gives relays serving more authors a
     * higher baseline, while the Beta sample introduces Bayesian exploration.
     *
     * P16: On invalid priors, returns fallback of (1 + ln(authorCount)) × 0.5.
     */
    weightedScore(relayUrl: string, authorCount: number): number {
        const weight = 1 + Math.log(Math.max(1, authorCount));
        const prior = this.relayScores.get(relayUrl);

        if (!prior) {
            // No data — uniform prior
            return weight * this.rng();
        }

        const sample = sampleBeta(prior.alpha, prior.beta, this.rng);
        return weight * sample;
    }

    /**
     * Observe delivery outcome for a (relay, author) pair.
     *
     * P8: Deduplicates — skips if this (relay, author) pair was already
     * observed this round. First observer wins.
     *
     * P4: Caller must skip inactive authors (authors for which no relay
     * delivered events).
     *
     * @param weight - Observation weight (default 1.0). Use 0.3 for sole-source relays.
     */
    observe(relayUrl: string, authorPubkey: string, delivered: boolean, weight = 1.0): void {
        const key = `${relayUrl}|${authorPubkey}`;
        if (this.observedThisRound.has(key)) return; // P8 dedup
        this.observedThisRound.add(key);

        const prior = this.relayScores.get(relayUrl) ?? { alpha: 1, beta: 1 };

        if (delivered) {
            prior.alpha += weight;
        } else {
            prior.beta += weight;
        }

        this.relayScores.set(relayUrl, prior);
    }

    /**
     * Apply decay and reset dedup set.
     * Call once per observation round (after processing all observations for a subscription).
     */
    decay(): void {
        for (const [url, prior] of this.relayScores) {
            prior.alpha = 1 + (prior.alpha - 1) * this.decayFactor;
            prior.beta = 1 + (prior.beta - 1) * this.decayFactor;

            // Prune relays that have decayed back to near-uniform
            if (Math.abs(prior.alpha - 1) < 0.01 && Math.abs(prior.beta - 1) < 0.01) {
                this.relayScores.delete(url);
            }
        }

        this.observedThisRound.clear();
    }

    /**
     * Export priors for persistence (P9).
     * Returns a plain JSON-serializable object.
     */
    exportPriors(): Record<string, RelayPrior> {
        const result: Record<string, RelayPrior> = {};
        for (const [url, prior] of this.relayScores) {
            result[url] = { alpha: prior.alpha, beta: prior.beta };
        }
        return result;
    }

    /**
     * Import priors from persistence (P9).
     * Clamps all α,β to Math.max(1, value) to prevent corrupt data.
     */
    importPriors(priors: Record<string, RelayPrior>): void {
        for (const [url, prior] of Object.entries(priors)) {
            this.relayScores.set(url, {
                alpha: Math.max(1, prior.alpha),
                beta: Math.max(1, prior.beta),
            });
        }
    }
}
