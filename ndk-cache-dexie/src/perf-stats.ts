import createDebug from "debug";

const debug = createDebug("ndk:dexie-adapter:perf");

interface OperationStats {
    count: number;
    totalTime: number;
}

export class PerfStats {
    private static stats: Map<string, OperationStats> = new Map();
    private static lastLogTime: number = Date.now();
    private static LOG_INTERVAL = 10000; // Log every 10 seconds

    static trackOperation(operation: string, startTime: number) {
        const time = Date.now() - startTime;
        const stats = this.stats.get(operation) || { count: 0, totalTime: 0 };
        stats.count++;
        stats.totalTime += time;
        this.stats.set(operation, stats);

        // Log periodically
        const now = Date.now();
        if (now - this.lastLogTime > this.LOG_INTERVAL) {
            this.logStats();
            this.lastLogTime = now;
        }
    }

    private static logStats() {
        const stats: Record<string, { avg: number; count: number }> = {};
        this.stats.forEach((value, key) => {
            stats[key] = {
                avg: value.totalTime / value.count,
                count: value.count
            };
        });
        debug("Performance stats:", stats);
        // Reset stats after logging
        this.stats.clear();
    }

    static startOperation() {
        return Date.now();
    }
}