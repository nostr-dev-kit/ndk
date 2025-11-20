/**
 * Controls time in tests for testing time-dependent application logic.
 *
 * Provides utilities to advance fake timers, control async operations, and test
 * features like retries, delays, and scheduled tasks in your Nostr application.
 * Works with Vitest's fake timer system.
 *
 * @example
 * ```typescript
 * import { vi } from 'vitest';
 * import { TimeController } from '@nostr-dev-kit/ndk/test';
 *
 * beforeEach(() => {
 *   vi.useFakeTimers();
 *   TimeController.setViObject(vi);
 * });
 *
 * it('should retry after delay', async () => {
 *   const promise = myApp.retryPublish(event); // retries after 5 seconds
 *
 *   // Advance time by 5 seconds
 *   await TimeController.tickAsync(5000);
 *
 *   await expect(promise).resolves.toBeTruthy();
 * });
 *
 * afterEach(() => {
 *   TimeController.reset();
 *   vi.useRealTimers();
 * });
 * ```
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
 * Helper function to create a TimeController with automatic setup/teardown.
 *
 * Convenience wrapper that automatically sets up fake timers before your test
 * and restores real timers after, reducing boilerplate in your test files.
 *
 * @param viObject The Vitest `vi` object
 * @returns A TimeController instance configured for your test
 *
 * @example
 * ```typescript
 * import { vi } from 'vitest';
 * import { withTimeControl } from '@nostr-dev-kit/ndk/test';
 *
 * const timeController = withTimeControl(vi);
 *
 * it('should handle delays', async () => {
 *   const promise = myApp.delayedOperation();
 *   await timeController.tickAsync(1000);
 *   await expect(promise).resolves.toBeTruthy();
 * });
 * ```
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
