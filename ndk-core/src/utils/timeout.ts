/**
 * Run a promise with a timeout if one is provided.
 * @returns
 */
export async function runWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs?: number,
    timeoutMessage?: string
): Promise<T> {
    if (!timeoutMs) return fn();
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(timeoutMessage || `Timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        fn()
            .then(resolve, reject)
            .finally(() => clearTimeout(timeout));
    });
}
