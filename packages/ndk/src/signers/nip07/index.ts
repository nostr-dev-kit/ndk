import debug from "debug";
import type { NostrEvent } from "../../events/index.js";
import NDKUser from "../../user/index.js";
import { NDKSigner } from "../index.js";

type Nip04QueueItem = {
    type: "encrypt" | "decrypt";
    counterpartyHexpubkey: string;
    value: string;
    resolve: (value: string) => void;
    reject: (reason?: Error) => void;
};

/**
 * NDKNip07Signer implements the NDKSigner interface for signing Nostr events
 * with a NIP-07 browser extension (e.g., getalby, nos2x).
 */
export class NDKNip07Signer implements NDKSigner {
    private _userPromise: Promise<NDKUser> | undefined;
    public nip04Queue: Nip04QueueItem[] = [];
    private nip04Processing = false;
    private debug: debug.Debugger;

    public constructor() {
        if (!window.nostr) {
            throw new Error("NIP-07 extension not available");
        }

        this.debug = debug("ndk:nip07");
    }

    public async blockUntilReady(): Promise<NDKUser> {
        const pubkey = await window.nostr?.getPublicKey();

        // If the user rejects granting access, error out
        if (!pubkey) {
            throw new Error("User rejected access");
        }

        return new NDKUser({ hexpubkey: pubkey });
    }

    /**
     * Getter for the user property.
     * @returns The NDKUser instance.
     */
    public async user(): Promise<NDKUser> {
        if (!this._userPromise) {
            this._userPromise = this.blockUntilReady();
        }

        return this._userPromise;
    }

    /**
     * Signs the given Nostr event.
     * @param event - The Nostr event to be signed.
     * @returns The signature of the signed event.
     * @throws Error if the NIP-07 is not available on the window object.
     */
    public async sign(event: NostrEvent): Promise<string> {
        if (!window.nostr) {
            throw new Error("NIP-07 extension not available");
        }

        const signedEvent = await window.nostr.signEvent(event);
        return signedEvent.sig;
    }

    public async encrypt(recipient: NDKUser, value: string): Promise<string> {
        if (!window.nostr) {
            throw new Error("NIP-07 extension not available");
        }

        const recipientHexPubKey = recipient.hexpubkey();
        return this.queueNip04("encrypt", recipientHexPubKey, value);
    }

    public async decrypt(sender: NDKUser, value: string): Promise<string> {
        if (!window.nostr) {
            throw new Error("NIP-07 extension not available");
        }

        const senderHexPubKey = sender.hexpubkey();
        return this.queueNip04("decrypt", senderHexPubKey, value);
    }

    private async queueNip04(
        type: "encrypt" | "decrypt",
        counterpartyHexpubkey: string,
        value: string
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            this.nip04Queue.push({
                type,
                counterpartyHexpubkey,
                value,
                resolve,
                reject,
            });

            if (!this.nip04Processing) {
                this.processNip04Queue();
            }
        });
    }

    private async processNip04Queue(
        item?: Nip04QueueItem,
        retries = 0
    ): Promise<void> {
        if (!item && this.nip04Queue.length === 0) {
            this.nip04Processing = false;
            return;
        }

        this.nip04Processing = true;
        const { type, counterpartyHexpubkey, value, resolve, reject } =
            item || this.nip04Queue.shift()!;

        this.debug("Processing encryption queue item", {
            type,
            counterpartyHexpubkey,
            value,
        });

        try {
            let result;

            if (type === "encrypt") {
                result = await window.nostr!.nip04.encrypt(
                    counterpartyHexpubkey,
                    value
                );
            } else {
                result = await window.nostr!.nip04.decrypt(
                    counterpartyHexpubkey,
                    value
                );
            }

            resolve(result);
        } catch (error: any) {
            // retry a few times if the call is already executing
            if (
                error.message &&
                error.message.includes("call already executing")
            ) {
                if (retries < 5) {
                    this.debug("Retrying encryption queue item", {
                        type,
                        counterpartyHexpubkey,
                        value,
                        retries,
                    });
                    setTimeout(() => {
                        this.processNip04Queue(item, retries + 1);
                    }, 50 * retries);

                    return;
                }
            }
            reject(error);
        }

        this.processNip04Queue();
    }
}

declare global {
    interface Window {
        nostr?: {
            getPublicKey(): Promise<string>;
            signEvent(event: NostrEvent): Promise<{ sig: string }>;
            nip04: {
                encrypt(
                    recipientHexPubKey: string,
                    value: string
                ): Promise<string>;
                decrypt(
                    senderHexPubKey: string,
                    value: string
                ): Promise<string>;
            };
        };
    }
}
