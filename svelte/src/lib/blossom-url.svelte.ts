import { NDKBlossom } from "@nostr-dev-kit/ndk-blossom";
import type { NDKUser } from "@nostr-dev-kit/ndk";

export type UrlStatus = "pending" | "loading" | "success" | "error" | "healing";

export class BlossomUrl {
    #status = $state<UrlStatus>("pending");
    #currentUrl = $state<string>("");
    #originalUrl = $state<string>("");
    #error = $state<Error | null>(null);

    constructor(
        private blossom: NDKBlossom,
        private user: NDKUser,
        url: string,
    ) {
        this.#originalUrl = url;
        this.#currentUrl = url;
    }

    get status(): UrlStatus {
        return this.#status;
    }

    get url(): string {
        return this.#currentUrl;
    }

    get originalUrl(): string {
        return this.#originalUrl;
    }

    get error(): Error | null {
        return this.#error;
    }

    async onError(): Promise<void> {
        if (this.#status === "healing") return;

        this.#status = "healing";
        this.#error = null;

        try {
            const healedUrl = await this.blossom.fixUrl(this.user, this.#originalUrl);
            this.#currentUrl = healedUrl;
            this.#status = "success";
        } catch (error) {
            this.#error = error instanceof Error ? error : new Error(String(error));
            this.#status = "error";
        }
    }

    reset(): void {
        this.#currentUrl = this.#originalUrl;
        this.#status = "pending";
        this.#error = null;
    }
}

export function useBlossomUrl(blossom: NDKBlossom, user: NDKUser, url: string): BlossomUrl {
    return new BlossomUrl(blossom, user, url);
}
