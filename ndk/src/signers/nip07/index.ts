import debug from "debug";

import type { NostrEvent } from "../../events/index.js";
import { NDKUser } from "../../user/index.js";
import type { NDKSigner } from "../index.js";
import { NDKRelay } from "../../relay/index.js";
import type { NDK } from "../../ndk/index.js";

type Nip04QueueItem = {
    type: "encrypt" | "decrypt";
    counterpartyHexpubkey: string;
    value: string;
    resolve: (value: string) => void;
    reject: (reason?: Error) => void;
};

type Nip07RelayMap = {
    [key: string]: {
        read: boolean;
        write: boolean;
    };
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
    private waitTimeout: number;

    /**
     * @param waitTimeout - The timeout in milliseconds to wait for the NIP-07 to become available
     */
    public constructor(waitTimeout: number = 1000) {
        this.debug = debug("ndk:nip07");
        this.waitTimeout = waitTimeout;
    }

    public async blockUntilReady(): Promise<NDKUser> {
        await this.waitForExtension();

        const pubkey = await window.nostr!.getPublicKey();

        // If the user rejects granting access, error out
        if (!pubkey) {
            throw new Error("User rejected access");
        }

        return new NDKUser({ pubkey: pubkey });
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
        await this.waitForExtension();

        const signedEvent = await window.nostr!.signEvent(event);
        return signedEvent.sig;
    }

    public async relays(ndk?: NDK): Promise<NDKRelay[]> {
        await this.waitForExtension();

        const relays = (await window.nostr!.getRelays?.()) || {};

        const activeRelays = [];
        for (const url of Object.keys(relays)) {
            // Currently only respects relays that are both readable and writable.
            if (relays[url].read && relays[url].write) {
                activeRelays.push(url);
            }
        }
        return activeRelays.map((url) => new NDKRelay(url, ndk?.relayAuthDefaultPolicy, ndk));
    }

    public async encrypt(recipient: NDKUser, value: string): Promise<string> {
        await this.waitForExtension();

        const recipientHexPubKey = recipient.pubkey;
        return this.queueNip04("encrypt", recipientHexPubKey, value);
    }

    public async decrypt(sender: NDKUser, value: string): Promise<string> {
        await this.waitForExtension();

        const senderHexPubKey = sender.pubkey;
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

    private async processNip04Queue(item?: Nip04QueueItem, retries = 0): Promise<void> {
        if (!item && this.nip04Queue.length === 0) {
            this.nip04Processing = false;
            return;
        }

        this.nip04Processing = true;
        const { type, counterpartyHexpubkey, value, resolve, reject } =
            item || this.nip04Queue.shift()!;

        try {
            let result;

            if (type === "encrypt") {
                result = await window.nostr!.nip04!.encrypt(counterpartyHexpubkey, value);
            } else {
                result = await window.nostr!.nip04!.decrypt(counterpartyHexpubkey, value);
            }

            resolve(result);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            // retry a few times if the call is already executing
            if (error.message && error.message.includes("call already executing")) {
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

    private waitForExtension(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (window.nostr) {
                resolve();
                return;
            }

            let timerId: NodeJS.Timeout | number;

            // Create an interval to repeatedly check for window.nostr
            const intervalId = setInterval(() => {
                if (window.nostr) {
                    clearTimeout(timerId as number);
                    clearInterval(intervalId);
                    resolve();
                }
            }, 100);

            // Set a timer to reject the promise if window.nostr is not available within the timeout
            timerId = setTimeout(() => {
                clearInterval(intervalId);
                reject(new Error("NIP-07 extension not available"));
            }, this.waitTimeout);
        });
    }
}

declare global {
    interface Window {
        nostr?: {
            getPublicKey(): Promise<string>;
            signEvent(event: NostrEvent): Promise<{ sig: string }>;
            getRelays?: () => Promise<Nip07RelayMap>;
            nip04?: {
                encrypt(recipientHexPubKey: string, value: string): Promise<string>;
                decrypt(senderHexPubKey: string, value: string): Promise<string>;
            };
        };
    }
}
