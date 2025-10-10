import debug from "debug";
import type { NDK } from "../ndk/index.js";

/**
 * SignatureVerificationStats - A class to track and report signature verification statistics
 * for all relays in an NDK instance.
 */
export class SignatureVerificationStats {
    private ndk: NDK;
    private debug: debug.Debugger;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private intervalMs: number;

    /**
     * Creates a new SignatureVerificationStats instance
     *
     * @param ndk - The NDK instance to track stats for
     * @param intervalMs - How often to print stats (in milliseconds)
     */
    constructor(ndk: NDK, intervalMs = 10000) {
        this.ndk = ndk;
        this.debug = debug("ndk:signature-verification-stats");
        this.intervalMs = intervalMs;
    }

    /**
     * Start tracking and reporting signature verification statistics
     */
    public start(): void {
        if (this.intervalId) {
            this.debug("Stats tracking already started");
            return;
        }

        this.debug(`Starting signature verification stats reporting every ${this.intervalMs}ms`);

        this.intervalId = setInterval(() => {
            this.reportStats();
        }, this.intervalMs);
    }

    /**
     * Stop tracking and reporting signature verification statistics
     */
    public stop(): void {
        if (!this.intervalId) {
            this.debug("Stats tracking not started");
            return;
        }

        clearInterval(this.intervalId);
        this.intervalId = null;
        this.debug("Stopped signature verification stats reporting");
    }

    /**
     * Report current signature verification statistics for all relays
     */
    public reportStats(): void {
        const stats = this.collectStats();

        console.log("\n=== Signature Verification Sampling Stats ===");
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`Total Relays: ${stats.totalRelays}`);
        console.log(`Connected Relays: ${stats.connectedRelays}`);

        if (stats.relayStats.length === 0) {
            console.log("No relay statistics available");
        } else {
            console.log("\nRelay Statistics:");

            // Sort relays by URL for consistent output
            stats.relayStats.sort((a, b) => a.url.localeCompare(b.url));

            stats.relayStats.forEach((relayStat) => {
                console.log(`\n  ${relayStat.url} ${relayStat.connected ? "(connected)" : "(disconnected)"}`);
                console.log(`    Validated Events: ${relayStat.validatedCount}`);
                console.log(`    Non-validated Events: ${relayStat.nonValidatedCount}`);
                console.log(`    Total Events: ${relayStat.totalEvents}`);
                console.log(
                    `    Current Validation Ratio: ${relayStat.validationRatio.toFixed(4)} (${(relayStat.validationRatio * 100).toFixed(2)}%)`,
                );
                console.log(
                    `    Target Validation Ratio: ${relayStat.targetValidationRatio?.toFixed(4) || "N/A"} (${relayStat.targetValidationRatio ? (relayStat.targetValidationRatio * 100).toFixed(2) + "%" : "N/A"})`,
                );
                console.log(`    Trusted: ${relayStat.trusted ? "Yes" : "No"}`);
            });
        }

        console.log("\nGlobal Settings:");
        console.log(
            `  Initial Validation Ratio: ${stats.initialValidationRatio.toFixed(4)} (${(stats.initialValidationRatio * 100).toFixed(2)}%)`,
        );
        console.log(
            `  Lowest Validation Ratio: ${stats.lowestValidationRatio.toFixed(4)} (${(stats.lowestValidationRatio * 100).toFixed(2)}%)`,
        );
        console.log("===========================================\n");
    }

    /**
     * Collect statistics from all relays
     */
    private collectStats() {
        const relayStats: Array<{
            url: string;
            connected: boolean;
            validatedCount: number;
            nonValidatedCount: number;
            totalEvents: number;
            validationRatio: number;
            targetValidationRatio?: number;
            trusted: boolean;
        }> = [];

        // Collect stats from all relays in the pool
        for (const relay of this.ndk.pool.relays.values()) {
            relayStats.push({
                url: relay.url,
                connected: relay.connected,
                validatedCount: relay.validatedEventCount,
                nonValidatedCount: relay.nonValidatedEventCount,
                totalEvents: relay.validatedEventCount + relay.nonValidatedEventCount,
                validationRatio: relay.validationRatio,
                targetValidationRatio: relay.targetValidationRatio,
                trusted: relay.trusted,
            });
        }

        return {
            totalRelays: this.ndk.pool.relays.size,
            connectedRelays: this.ndk.pool.connectedRelays().length,
            relayStats,
            initialValidationRatio: this.ndk.initialValidationRatio,
            lowestValidationRatio: this.ndk.lowestValidationRatio,
        };
    }
}

/**
 * Create and start a signature verification stats tracker for the given NDK instance
 *
 * @param ndk - The NDK instance to track stats for
 * @param intervalMs - How often to print stats (in milliseconds)
 * @returns The created SignatureVerificationStats instance
 */
export function startSignatureVerificationStats(ndk: NDK, intervalMs = 10000): SignatureVerificationStats {
    const stats = new SignatureVerificationStats(ndk, intervalMs);
    stats.start();
    return stats;
}
