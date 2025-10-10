/**
 * Utility class for controlling time in tests
 */
export class TimeController {
    private static viObject: any;

    /**
     * Set the Vitest object to use for time control
     */
    static setViObject(vi: any): void {
        TimeController.viObject = vi;
    }

    /**
     * Advance timers by a specified number of milliseconds
     */
    static advanceTime(ms: number): void {
        TimeController.viObject?.advanceTimersByTime(ms);
    }

    /**
     * Advance timers asynchronously by a specified number of milliseconds
     */
    static async tickAsync(ms = 0): Promise<void> {
        await TimeController.viObject?.advanceTimersByTimeAsync(ms);
    }

    /**
     * Clear all timers
     */
    static reset(): void {
        TimeController.viObject?.clearAllTimers();
    }

    /**
     * Wait for the next tick of the event loop
     */
    static async waitForNextTick(): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 0));
        await TimeController.viObject?.advanceTimersByTimeAsync(0);
    }
}

/**
 * Higher-order function for using time control in tests
 */
export function withTimeControl(viObject: any) {
    return (fn: (timeController: typeof TimeController) => Promise<void>): (() => Promise<void>) =>
        async () => {
            TimeController.setViObject(viObject);
            viObject.useFakeTimers();
            try {
                await fn(TimeController);
            } finally {
                viObject.useRealTimers();
            }
        };
}
