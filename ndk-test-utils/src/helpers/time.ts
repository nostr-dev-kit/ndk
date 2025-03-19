/**
 * Utility class for controlling time in tests
 */
export class TimeController {
    private static viObject: any;

    /**
     * Set the Vitest object to use for time control
     */
    static setViObject(vi: any): void {
        this.viObject = vi;
    }

    /**
     * Advance timers by a specified number of milliseconds
     */
    static advanceTime(ms: number): void {
        this.viObject?.advanceTimersByTime(ms);
    }

    /**
     * Advance timers asynchronously by a specified number of milliseconds
     */
    static async tickAsync(ms: number = 0): Promise<void> {
        await this.viObject?.advanceTimersByTimeAsync(ms);
    }

    /**
     * Clear all timers
     */
    static reset(): void {
        this.viObject?.clearAllTimers();
    }

    /**
     * Wait for the next tick of the event loop
     */
    static async waitForNextTick(): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 0));
        await this.viObject?.advanceTimersByTimeAsync(0);
    }
}

/**
 * Higher-order function for using time control in tests
 */
export function withTimeControl(viObject: any) {
    return function(fn: (timeController: typeof TimeController) => Promise<void>): () => Promise<void> {
        return async () => {
            TimeController.setViObject(viObject);
            viObject.useFakeTimers();
            try {
                await fn(TimeController);
            } finally {
                viObject.useRealTimers();
            }
        };
    };
} 