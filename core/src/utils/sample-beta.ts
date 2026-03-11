import createDebug from "debug";

const d = createDebug("ndk:sample-beta");

/** Clamp rng() to avoid 0 (which breaks Math.log / Math.pow). */
const EPS = Number.MIN_VALUE;
function rngPos(rng: () => number): number {
    return Math.max(rng(), EPS);
}

/**
 * Sample from a Beta(alpha, beta) distribution.
 * Returns a value in [0, 1].
 *
 * Uses Jöhnk's algorithm for small alpha,beta and
 * gamma sampling (Marsaglia & Tsang) for larger values.
 *
 * **Production safety (P16):** Returns 0.5 on invalid inputs
 * (non-finite, zero, negative) instead of throwing.
 *
 * @param alpha - Shape parameter (successes + 1). Must be > 0.
 * @param beta - Shape parameter (failures + 1). Must be > 0.
 * @param rng - Random number generator. Default: Math.random.
 */
export function sampleBeta(alpha: number, beta: number, rng: () => number = Math.random): number {
    if (!Number.isFinite(alpha) || !Number.isFinite(beta) || alpha <= 0 || beta <= 0) {
        d("Invalid parameters alpha=%d beta=%d, returning 0.5", alpha, beta);
        return 0.5;
    }

    // For alpha=1, beta=1 (uniform prior), just return rng()
    if (alpha === 1 && beta === 1) return rng();

    // Jöhnk's algorithm for alpha < 1 and beta < 1
    if (alpha < 1 && beta < 1) {
        while (true) {
            const u = rngPos(rng);
            const v = rngPos(rng);
            const x = Math.pow(u, 1 / alpha);
            const y = Math.pow(v, 1 / beta);
            if (x + y <= 1) {
                if (x + y > 0) return x / (x + y);
                // Handle underflow by taking logs
                const logX = Math.log(u) / alpha;
                const logY = Math.log(v) / beta;
                const logM = logX > logY ? logX : logY;
                return Math.exp(logX - logM) / (Math.exp(logX - logM) + Math.exp(logY - logM));
            }
        }
    }

    // For larger alpha/beta, use gamma sampling approach
    const x = sampleGamma(alpha, rng);
    const y = sampleGamma(beta, rng);
    return x / (x + y);
}

/**
 * Sample from a Gamma(shape, 1) distribution using Marsaglia and Tsang's method.
 */
function sampleGamma(shape: number, rng: () => number): number {
    if (shape < 1) {
        // Boost: Gamma(shape) = Gamma(shape+1) * U^(1/shape)
        return sampleGamma(shape + 1, rng) * Math.pow(rngPos(rng), 1 / shape);
    }

    const dd = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * dd);

    while (true) {
        let x: number;
        let v: number;
        do {
            // Box-Muller for normal sample
            x = Math.sqrt(-2 * Math.log(rngPos(rng))) * Math.cos(2 * Math.PI * rng());
            v = 1 + c * x;
        } while (v <= 0);

        v = v * v * v;
        const u = rng();
        if (u < 1 - 0.0331 * (x * x) * (x * x)) return dd * v;
        if (Math.log(u) < 0.5 * x * x + dd * (1 - v + Math.log(v))) return dd * v;
    }
}
