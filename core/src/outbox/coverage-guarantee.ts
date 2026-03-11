import createDebug from "debug";
import type { Hexpubkey } from "../user/index.js";

const d = createDebug("ndk:coverage-guarantee");

export interface CoverageGuaranteeResult {
    /** Relays force-selected for sole-source authors: relay → sole-source pubkeys */
    forcedRelays: Map<string, Set<string>>;
    /** True if CG3 was skipped (too many sole-source relays to fit in budget) */
    skipped: boolean;
}

/**
 * Apply Coverage Guarantee v3 (CG3) for sole-source authors.
 *
 * Protects authors who have only one write relay. Without CG3,
 * Thompson Sampling may deprioritize their sole relay if it scored
 * poorly on other authors.
 *
 * **Algorithm:**
 * 1. Scan pubkeysToRelays for authors with exactly 1 relay
 * 2. Group by relay: Map<relay, Set<soleSourcePubkeys>>
 * 3. If unique sole-source relays >= budget, skip (conditional skip)
 * 4. Sort sole-source relays by coverage value (most pubkeys first)
 * 5. Return top relays up to budget cap
 *
 * @param pubkeysToRelays - Map of author → their write relays
 * @param maxConnections - Maximum outbox relay connections
 * @param budgetFraction - Fraction of maxConnections reserved for CG3 (default 0.5)
 */
export function applyCoverageGuarantee(
    pubkeysToRelays: Map<Hexpubkey, Set<string>>,
    maxConnections: number,
    budgetFraction: number,
): CoverageGuaranteeResult {
    const budget = Math.floor(maxConnections * budgetFraction);

    // Step 1-2: Find sole-source authors and group by relay
    const soleSourceRelays = new Map<string, Set<string>>();

    for (const [author, relays] of pubkeysToRelays) {
        if (relays.size === 1) {
            const relay = relays.values().next().value!;
            const pubkeys = soleSourceRelays.get(relay) ?? new Set();
            pubkeys.add(author);
            soleSourceRelays.set(relay, pubkeys);
        }
    }

    // Step 3: Conditional skip
    if (soleSourceRelays.size >= budget) {
        d(
            "CG3 skipped: %d sole-source relays >= budget %d (maxConn=%d × fraction=%f)",
            soleSourceRelays.size,
            budget,
            maxConnections,
            budgetFraction,
        );
        return { forcedRelays: new Map(), skipped: true };
    }

    // Step 4: Sort by coverage value (most sole-source pubkeys first)
    const sorted = Array.from(soleSourceRelays.entries()).sort(
        (a, b) => b[1].size - a[1].size,
    );

    // Step 5: Take top relays up to budget
    const forcedRelays = new Map<string, Set<string>>();
    for (const [relay, pubkeys] of sorted) {
        if (forcedRelays.size >= budget) break;
        forcedRelays.set(relay, pubkeys);
    }

    if (forcedRelays.size > 0) {
        d("CG3 force-selected %d relays for %d sole-source authors",
            forcedRelays.size,
            Array.from(forcedRelays.values()).reduce((sum, s) => sum + s.size, 0),
        );
    }

    return { forcedRelays, skipped: false };
}
