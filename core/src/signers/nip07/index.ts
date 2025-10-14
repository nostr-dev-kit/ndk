import debug from "debug";

import type { EncryptionMethod } from "../../events/encryption.js";
import type { NostrEvent } from "../../events/index.js";
import type { NDK } from "../../ndk/index.js";
import { NDKRelay } from "../../relay/index.js";
import type { NDKEncryptionScheme } from "../../types.js";
import { type Hexpubkey, NDKUser } from "../../user/index.js";
import type { NDKSigner } from "../index.js";
import { registerSigner } from "../registry.js";

type EncryptionQueueItem = {
    scheme: NDKEncryptionScheme;
    method: EncryptionMethod;
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
    public encryptionQueue: EncryptionQueueItem[] = [];
    private encryptionProcessing = false;
    private debug: debug.Debugger;
    private waitTimeout: number;
    private _pubkey: string | undefined;
    private ndk?: NDK;
    private _user: NDKUser | undefined;

    /**
     * @param waitTimeout - The timeout in milliseconds to wait for the NIP-07 to become available
     */
    public constructor(waitTimeout = 1000, ndk?: NDK) {
        this.debug = debug("ndk:nip07");
        this.waitTimeout = waitTimeout;
        this.ndk = ndk;
    }

    get pubkey(): string {
        if (!this._pubkey) throw new Error("Not ready");
        return this._pubkey;
    }

    public async blockUntilReady(): Promise<NDKUser> {
        await this.waitForExtension();

        const pubkey = await window.nostr?.getPublicKey();

        // If the user rejects granting access, error out
        if (!pubkey) {
            throw new Error("User rejected access");
        }

        this._pubkey = pubkey;
        let user: NDKUser;
        if (this.ndk) user = this.ndk.getUser({ pubkey });
        else user = new NDKUser({ pubkey });
        this._user = user;

        return user;
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

    get userSync(): NDKUser {
        if (!this._user) throw new Error("User not ready");
        return this._user;
    }

    /**
     * Signs the given Nostr event.
     * @param event - The Nostr event to be signed.
     * @returns The signature of the signed event.
     * @throws Error if the NIP-07 is not available on the window object.
     */
    public async sign(event: NostrEvent): Promise<string> {
        await this.waitForExtension();

        const signedEvent = await window.nostr?.signEvent(event);
        if (!signedEvent) throw new Error("Failed to sign event");
        return signedEvent.sig;
    }

    public async relays(ndk: NDK): Promise<NDKRelay[]> {
        await this.waitForExtension();

        const relays = (await window.nostr?.getRelays?.()) || {};

        const activeRelays = [];
        for (const url of Object.keys(relays)) {
            // Currently only respects relays that are both readable and writable.
            if (relays[url].read && relays[url].write) {
                activeRelays.push(url);
            }
        }
        return activeRelays.map((url) => new NDKRelay(url, ndk?.relayAuthDefaultPolicy, ndk));
    }

    public async encryptionEnabled(nip?: NDKEncryptionScheme): Promise<NDKEncryptionScheme[]> {
        const enabled: NDKEncryptionScheme[] = [];
        // Check against the defined window.nostr type which includes optional nip04/nip44
        if ((!nip || nip === "nip04") && Boolean(window.nostr?.nip04)) enabled.push("nip04");
        if ((!nip || nip === "nip44") && Boolean(window.nostr?.nip44)) enabled.push("nip44");
        return enabled;
    }

    public async encrypt(recipient: NDKUser, value: string, nip: NDKEncryptionScheme = "nip04"): Promise<string> {
        if (!(await this.encryptionEnabled(nip)))
            throw new Error(`${nip}encryption is not available from your browser extension`);
        await this.waitForExtension();

        const recipientHexPubKey = recipient.pubkey;
        return this.queueEncryption(nip, "encrypt", recipientHexPubKey, value);
    }

    public async decrypt(sender: NDKUser, value: string, nip: NDKEncryptionScheme = "nip04"): Promise<string> {
        if (!(await this.encryptionEnabled(nip)))
            throw new Error(`${nip}encryption is not available from your browser extension`);
        await this.waitForExtension();

        const senderHexPubKey = sender.pubkey;
        return this.queueEncryption(nip, "decrypt", senderHexPubKey, value);
    }

    private async queueEncryption(
        scheme: NDKEncryptionScheme,
        method: EncryptionMethod,
        counterpartyHexpubkey: string,
        value: string,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            this.encryptionQueue.push({
                scheme,
                method,
                counterpartyHexpubkey,
                value,
                resolve,
                reject,
            });

            if (!this.encryptionProcessing) {
                this.processEncryptionQueue();
            }
        });
    }

    private async processEncryptionQueue(item?: EncryptionQueueItem, retries = 0): Promise<void> {
        if (!item && this.encryptionQueue.length === 0) {
            this.encryptionProcessing = false;
            return;
        }

        this.encryptionProcessing = true;
        const currentItem = item || this.encryptionQueue.shift();

        if (!currentItem) {
            this.encryptionProcessing = false;
            return;
        }

        const { scheme, method, counterpartyHexpubkey, value, resolve, reject } = currentItem;

        this.debug("Processing encryption queue item", {
            method,
            counterpartyHexpubkey,
            value,
        });

        try {
            const result = await window.nostr?.[scheme]?.[method](counterpartyHexpubkey, value);
            if (!result) throw new Error("Failed to encrypt/decrypt");
            resolve(result);
        } catch (error: unknown) {
            // Check if error is an instance of Error before accessing message
            const errorMessage = error instanceof Error ? error.message : String(error);

            // Retry a few times if the call is already executing
            if (errorMessage.includes("call already executing") && retries < 5) {
                this.debug("Retrying encryption queue item", {
                    method,
                    counterpartyHexpubkey,
                    value,
                    retries,
                });
                setTimeout(() => {
                    // Pass currentItem to avoid potential issues if item was undefined
                    this.processEncryptionQueue(currentItem, retries + 1);
                }, 50 * retries);

                return; // Exit after scheduling retry
            }

            // Ensure we reject with an Error object for other errors
            reject(error instanceof Error ? error : new Error(errorMessage));
        }

        this.processEncryptionQueue();
    }

    private waitForExtension(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (window.nostr) {
                resolve();
                return;
            }

            let timerId: NodeJS.Timeout | number | undefined; // Use let and allow undefined

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

    /**
     * Serializes the signer type into a storable format.
     * NIP-07 signers don't have persistent state to serialize beyond their type.
     * @returns A JSON string containing the type.
     */
    public toPayload(): string {
        const payload = {
            type: "nip07",
            payload: "", // No specific payload needed for NIP-07
        };
        return JSON.stringify(payload);
    }

    /**
     * Deserializes the signer from a payload string.
     * Creates a new NDKNip07Signer instance.
     * @param payloadString The JSON string obtained from toPayload().
     * @param ndk Optional NDK instance.
     * @returns An instance of NDKNip07Signer.
     */
    public static async fromPayload(payloadString: string, ndk?: NDK): Promise<NDKNip07Signer> {
        const payload = JSON.parse(payloadString);

        if (payload.type !== "nip07") {
            throw new Error(`Invalid payload type: expected 'nip07', got ${payload.type}`);
        }

        // NIP-07 doesn't need data from the payload, just create a new instance.
        // We might want to pass constructor args if they were stored, but they aren't here.
        return new NDKNip07Signer(undefined, ndk);
    }
}

type Nip44 = {
    encrypt: (recipient: Hexpubkey, value: string) => Promise<string>;
    decrypt: (sender: Hexpubkey, value: string) => Promise<string>;
};

declare global {
    interface Window {
        nostr?: {
            getPublicKey(): Promise<string>;
            signEvent(event: NostrEvent): Promise<{ sig: string }>;
            getRelays?: () => Promise<Nip07RelayMap>;
            // Make nip04 and nip44 optional properties directly on the nostr object type
            nip04?: {
                encrypt(recipientHexPubKey: string, value: string): Promise<string>;
                decrypt(senderHexPubKey: string, value: string): Promise<string>;
            };
            nip44?: Nip44;
        };
    }
}

registerSigner("nip07", NDKNip07Signer);
