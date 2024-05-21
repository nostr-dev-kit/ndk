import { NDKEvent, type NDKTag, type NostrEvent } from "../events";
import { NDKKind } from "../events/kinds";
import type { NDK } from "../ndk";

const SPEC_PATH = "/.well-known/nostr/nip96.json";

type PrepareUploadResult = {
    url: string;
    headers: { [key: string]: string };
};

/**
 * Provides utility methods for interacting with NIP-96 upload services
 */
export class Nip96 {
    private ndk: NDK;
    public spec: Nip96Spec | undefined;
    private url: string;
    public nip98Required: boolean = false;

    /**
     * @param domain domain of the NIP96 service
     */
    constructor(domain: string, ndk: NDK) {
        this.url = `https://${domain}${SPEC_PATH}`;
        this.ndk = ndk;
    }

    async prepareUpload(blob: Blob, httpVerb: string = "POST"): Promise<PrepareUploadResult> {
        this.validateHttpFetch();
        if (!this.spec) await this.fetchSpec();
        if (!this.spec) throw new Error("Failed to fetch NIP96 spec");

        let headers = {};

        if (this.nip98Required) {
            const authorizationHeader = await this.generateNip98Header(
                this.spec.api_url,
                httpVerb,
                blob
            );
            headers = { Authorization: authorizationHeader };
        }

        return {
            url: this.spec.api_url,
            headers,
        };
    }

    /**
     * Provides an XMLHttpRequest-based upload method for browsers.
     * @example
     * const xhr = new XMLHttpRequest();
     * xhr.upload.addEventListener("progress", function(e) {
     *    const percentComplete = e.loaded / e.total;
     *    console.log(percentComplete);
     * });
     * const nip96 = ndk.getNip96("nostrcheck.me");
     * const blob = new Blob(["Hello, world!"], { type: "text/plain" });
     * const response = await nip96.xhrUpload(xhr, blob);
     * console.log(response);
     * @returns Promise that resolves to the upload response
     */
    async xhrUpload(xhr: XMLHttpRequest, blob: Blob): Promise<Nip96UploadResponse> {
        const httpVerb = "POST";
        const { url, headers } = await this.prepareUpload(blob, httpVerb);

        xhr.open(httpVerb, url, true);
        if (headers["Authorization"]) {
            xhr.setRequestHeader("Authorization", headers["Authorization"]);
        }
        const formData = new FormData();
        formData.append("file", blob);

        return new Promise<Nip96UploadResponse>((resolve, reject) => {
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(xhr.statusText));
                }
            };

            xhr.onerror = function () {
                reject(new Error("Network Error"));
            };

            xhr.send(formData);
        });
    }

    /**
     * Fetch-based upload method. Note that this will use NDK's httpFetch
     * @param blob
     * @returns Promise that resolves to the upload response
     *
     * @example
     * const nip96 = ndk.getNip96("nostrcheck.me");
     * const blob = new Blob(["Hello, world!"], { type: "text/plain" });
     * const response = await nip96.upload(blob);
     * console.log(response);
     */
    async upload(blob: Blob) {
        const httpVerb = "POST";
        const { url, headers } = await this.prepareUpload(blob, httpVerb);
        const formData = new FormData();
        formData.append("file", blob);

        const res = await this.ndk.httpFetch!(this.spec!.api_url, {
            method: httpVerb,
            headers,
            body: formData,
        });

        if (res.status !== 200) throw new Error(`Failed to upload file to ${url}`);
        const json = (await res.json()) as Nip96UploadResponse;
        if (json.status !== "success") throw new Error(json.message);
        return json;
    }

    private validateHttpFetch() {
        if (!this.ndk) throw new Error("NDK is required to fetch NIP96 spec");
        if (!this.ndk.httpFetch)
            throw new Error("NDK must have an httpFetch method to fetch NIP96 spec");
    }

    public async fetchSpec() {
        this.validateHttpFetch();
        const res = await this.ndk.httpFetch!(this.url);
        if (res.status !== 200) throw new Error(`Failed to fetch NIP96 spec from ${this.url}`);
        const spec = await res.json();
        if (!spec) throw new Error(`Failed to parse NIP96 spec from ${this.url}`);
        this.spec = spec;
        this.nip98Required = this.spec!.plans.free.is_nip98_required;
    }

    public async generateNip98Header(
        requestUrl: string,
        httpMethod: string,
        blob: Blob
    ): Promise<string> {
        const event = new NDKEvent(this.ndk, {
            kind: NDKKind.HttpAuth,
            tags: [
                ["u", requestUrl],
                ["method", httpMethod],
            ],
        } as NostrEvent);

        if (["POST", "PUT", "PATCH"].includes(httpMethod)) {
            const sha256Hash = await this.calculateSha256(blob);
            event.tags.push(["payload", sha256Hash]);
        }

        await event.sign();
        const encodedEvent = btoa(JSON.stringify(event.rawEvent()));
        return `Nostr ${encodedEvent}`;
    }

    private async calculateSha256(blob: Blob): Promise<string> {
        const buffer = await blob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        return hashHex;
    }
}

export type Nip96Spec = {
    api_url: string;
    download_url?: string;
    delegated_to_url?: string;
    supported_nips?: number[];
    tos_url?: string;
    content_types?: string[];
    plans: {
        [key: string]: {
            name: string;
            is_nip98_required: boolean;
            url?: string;
            max_byte_size?: number;
            file_expiration?: [number, number];
            media_transformations?: {
                image?: string[];
            };
        };
    };
};

type Nip96UploadResponse = {
    status: "success" | "error";
    message: string;
    processing_url?: string;
    nip94_event?: {
        tags: NDKTag[];
        content: string;
    };
};
