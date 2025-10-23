import type { BlossomUploadOptions, NDKBlossom } from "@nostr-dev-kit/blossom";
import type { NDKImetaTag } from "@nostr-dev-kit/ndk";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadState {
    status: UploadStatus;
    progress: UploadProgress | null;
    result: NDKImetaTag | null;
    error: Error | null;
}

export class BlossomUpload {
    #status = $state<UploadStatus>("idle");
    #progress = $state<UploadProgress | null>(null);
    #result = $state<NDKImetaTag | null>(null);
    #error = $state<Error | null>(null);

    constructor(private blossom: NDKBlossom) {}

    get status(): UploadStatus {
        return this.#status;
    }

    get progress(): UploadProgress | null {
        return this.#progress;
    }

    get result(): NDKImetaTag | null {
        return this.#result;
    }

    get error(): Error | null {
        return this.#error;
    }

    get state(): UploadState {
        return {
            status: this.#status,
            progress: this.#progress,
            result: this.#result,
            error: this.#error,
        };
    }

    async upload(file: File, options?: BlossomUploadOptions): Promise<NDKImetaTag> {
        this.#status = "uploading";
        this.#progress = { loaded: 0, total: file.size, percentage: 0 };
        this.#result = null;
        this.#error = null;

        try {
            const mergedOptions = {
                ...options,
                onProgress: (progress) => {
                    const percentage = Math.round((progress.loaded / progress.total) * 100);
                    this.#progress = {
                        loaded: progress.loaded,
                        total: progress.total,
                        percentage,
                    };
                    return "continue";
                },
            };
            const result = await this.blossom.upload(file, mergedOptions);

            this.#status = "success";
            this.#result = result;
            return result;
        } catch (error) {
            this.#status = "error";
            this.#error = error instanceof Error ? error : new Error(String(error));
            throw error;
        }
    }

    reset(): void {
        this.#status = "idle";
        this.#progress = null;
        this.#result = null;
        this.#error = null;
    }
}

export function createBlossomUpload(blossom: NDKBlossom): BlossomUpload {
    return new BlossomUpload(blossom);
}
