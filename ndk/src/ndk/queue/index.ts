type QueueItem<T> = {
    /**
     * Deterministic id of the item
     */
    id: string;

    /**
     * A function to process the item
     * @returns
     */
    func: () => Promise<T>;
};

export class Queue<T> {
    private queue: QueueItem<T>[] = [];
    private maxConcurrency: number;
    private processing: Set<string> = new Set();
    private promises: Map<string, Promise<T>> = new Map();

    constructor(name: string, maxConcurrency: number) {
        this.maxConcurrency = maxConcurrency;
    }

    public add(item: QueueItem<T>): Promise<T> {
        if (this.promises.has(item.id)) {
            return this.promises.get(item.id)!;
        } else {
        }

        const promise = new Promise<T>((resolve, reject) => {
            this.queue.push({
                ...item,
                func: () =>
                    item.func().then(
                        (result) => {
                            resolve(result);
                            return result; // Return the result to match the expected type.
                        },
                        (error) => {
                            reject(error);
                            // It's important to rethrow the error here to not accidentally resolve the promise.
                            // However, since TypeScript 4.4, you can set "useUnknownInCatchVariables" to false if this line errors.
                            throw error;
                        }
                    ),
            });
            this.process();
        });

        this.promises.set(item.id, promise);
        promise.finally(() => {
            this.promises.delete(item.id);
            this.processing.delete(item.id);
            this.process();
        });

        return promise;
    }

    private process() {
        if (this.processing.size >= this.maxConcurrency || this.queue.length === 0) {
            return;
        }

        const item = this.queue.shift();
        if (!item || this.processing.has(item.id)) {
            return;
        }

        this.processing.add(item.id);
        item.func();
    }

    public clear() {
        this.queue = [];
    }

    public clearProcessing() {
        this.processing.clear();
    }

    public clearAll() {
        this.clear();
        this.clearProcessing();
    }

    public length() {
        return this.queue.length;
    }
}
