import { vi } from "vitest";

export class TimeController {
    static advanceTime(ms: number): void {
        vi.advanceTimersByTime(ms);
    }

    static async tickAsync(ms: number = 0): Promise<void> {
        await vi.advanceTimersByTimeAsync(ms);
    }

    static reset(): void {
        vi.clearAllTimers();
    }

    static async waitForNextTick(): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 0));
        await vi.advanceTimersByTimeAsync(0);
    }
}

export function withTimeControl(
    fn: (timeController: TimeController) => Promise<void>
): () => Promise<void> {
    return async () => {
        vi.useFakeTimers();
        try {
            await fn(TimeController);
        } finally {
            vi.useRealTimers();
        }
    };
}
