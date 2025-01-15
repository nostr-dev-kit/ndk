import debug from "debug";

import {
    type NostrEvent,
    type Npub,
    type Hexpubkey,
    NDKUser,
    type NDKEncryptionScheme,
    type NDKSigner,
} from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import * as IntentLauncher from "expo-intent-launcher";

const DEFAULT_ENCRYPTION_SCHEME = "nip44" as const;

const NO_EXTERNAL_SIGNER_ERR_MSG = "android.content.ActivityNotFoundException";

type NDKNip55Permissions = {
    permission: string;
    kind?: number;
};

// type Nip04QueueItem = {
//     type: "encrypt" | "decrypt";
//     counterpartyHexpubkey: string;
//     value: string;
//     resolve: (value: string) => void;
//     reject: (reason?: Error) => void;
// };

type GetPublicKeyResult = {
    pubkey?: Hexpubkey;
    canceled?: boolean;
    unsupportedResultCode?: boolean;
    error?: string;
};

type IntentExtra = {
    [key: string]: any;
};

/**
 * NDKNip55Signer implements the NDKSigner interface for signing Nostr events
 * with a NIP-55 compatible android mobile client.
 */
export class NDKNip55Signer implements NDKSigner {
    private _userPromise: Promise<NDKUser> | undefined;
    private _user: NDKUser | undefined;
    // public nip04Queue: Nip04QueueItem[] = [];
    // private nip04Processing = false;
    private debug: debug.Debugger;

    public constructor() {
        this.debug = debug("ndk:nip55");
    }

    public async blockUntilReady(permissions?: NDKNip55Permissions[]): Promise<NDKUser> {
        // TODO
        // Check if app has already been granted permissions
        let response = await this.getPublicKey(permissions);

        if (response?.canceled) {
            // If unable to obtain pubkey, due to activity operation being canceled, error out
            throw new Error("Canceled");
        } else if (response?.unsupportedResultCode) {
            // If unable to obtain pubkey, due to activity operation returning an unsupported user-defined custom value, error out
            throw new Error("Unsupported result code");
        } else if (response?.error) {
            // If unable to obtain pubkey, error out
            throw new Error("Unable to obtain pubkey from external signer");
        }

        this._user = new NDKUser({ pubkey: response.pubkey });
        return this._user;
    }

    /**
     * Getter for the user property.
     * @returns The NDKUser instance.
     */
    public async user(): Promise<NDKUser> {
        if (this._user) return this._user;

        if (!this._userPromise) {
            this._userPromise = this.blockUntilReady();
        }

        return this._userPromise;
    }

    /**
     * Signs the given Nostr event.
     * @param event - The Nostr event to be signed.
     * @returns The signature of the signed event.
     * @throws Error if the NIP-55 compatible android mobile client is not available and is unable to launch the sign intent
     */
    public async sign(event: NostrEvent): Promise<string> {
        const eventJson = JSON.stringify(event);

        const extraPayload: IntentExtra = {
            package: "com.greenart7c3.nostrsigner", // TODO Detect and specify a general app package
            type: "sign_event",
            id: event.id,
            current_user: this._user.pubkey,
        };

        try {
            const intent = await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
                category: "android.intent.category.BROWSABLE",
                data: `nostrsigner:${eventJson}`,
                flags: 0x20000000 | 0x04000000,
                extra: extraPayload,
            });

            console.log("intent", intent);

            // If the activity operation succeeded
            if (intent.resultCode === -1) {
                const intentExtra: IntentExtra = intent.extra;
                console.log("Signer result:", intentExtra);
                return intentExtra.result;
                // If the activity operation was canceled, error out
            } else if (intent.resultCode === 0) {
                throw new Error("Canceled");
                // If the activity operation returns an unsupported user-defined custom value, error out
            } else {
                throw new Error("Unsupported result code");
            }
        } catch (error) {
            console.error("Error unable to launch sign intent:", error);
            this.throwNoExternalSignerErr(error.message);
            throw error;
        }
    }

    public async encrypt(
        recipient: NDKUser,
        value: string,
        type: NDKEncryptionScheme = DEFAULT_ENCRYPTION_SCHEME
    ): Promise<string> {
        if (type === "nip44") {
            return this.nip44Encrypt(recipient, value);
        } else {
            return this.nip04Encrypt(recipient, value);
        }
    }

    public async decrypt(
        sender: NDKUser,
        value: string,
        type: NDKEncryptionScheme = DEFAULT_ENCRYPTION_SCHEME
    ): Promise<string> {
        if (type === "nip44") {
            return this.nip44Decrypt(sender, value);
        } else {
            return this.nip04Decrypt(sender, value);
        }
    }

    public async nip44Encrypt(recipient: NDKUser, value: string): Promise<string> {
        const recipientHexPubKey = recipient.pubkey;

        const extraPayload: IntentExtra = {
            package: "com.greenart7c3.nostrsigner", // TODO Detect and specify a general app package
            type: "nip44_encrypt",
            current_user: this._user.pubkey,
            pubkey: recipientHexPubKey,
        };

        try {
            const intent = await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
                category: "android.intent.category.BROWSABLE",
                data: `nostrsigner:${value}`,
                extra: extraPayload,
            });

            console.log("intent", intent);

            // If the activity operation succeeded
            if (intent.resultCode === -1) {
                const intentExtra: IntentExtra = intent.extra;
                console.log("Signer result:", intentExtra);
                return intentExtra.result;
                // If the activity operation was canceled, error out
            } else if (intent.resultCode === 0) {
                throw new Error("Canceled");
                // If the activity operation returns an unsupported user-defined custom value, error out
            } else {
                throw new Error("Unsupported result code");
            }
        } catch (error) {
            console.error("Error unable to launch NIP-44 encrypt intent:", error);
            this.throwNoExternalSignerErr(error.message);
            throw error;
        }
    }

    public async nip44Decrypt(sender: NDKUser, value: string): Promise<string> {
        const senderHexPubKey = sender.pubkey;

        const extraPayload: IntentExtra = {
            package: "com.greenart7c3.nostrsigner", // TODO Detect and specify a general app package
            type: "nip44_decrypt",
            current_user: this._user.pubkey,
            pubkey: senderHexPubKey,
        };

        try {
            const intent = await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
                category: "android.intent.category.BROWSABLE",
                data: `nostrsigner:${value}`,
                extra: extraPayload,
            });

            console.log("intent", intent);

            // TODO
            // If decryption is unsuccessful, a resultCode of -1 is still returned with the following value in the signature
            // "Could not decrypt the message", ideally a different resultCode or error should be returned
            // If the activity operation succeeded
            if (intent.resultCode === -1) {
                const intentExtra: IntentExtra = intent.extra;
                console.log("Signer result:", intentExtra);
                return intentExtra.result;
                // If the activity operation was canceled, error out
            } else if (intent.resultCode === 0) {
                throw new Error("Canceled");
                // If the activity operation returns an unsupported user-defined custom value, error out
            } else {
                throw new Error("Unsupported result code");
            }
        } catch (error) {
            console.error("Error unable to launch NIP-44 decrypt intent:", error);
            this.throwNoExternalSignerErr(error.message);
            throw error;
        }
    }

    public async nip04Encrypt(recipient: NDKUser, value: string): Promise<string> {
        const recipientHexPubKey = recipient.pubkey;

        const extraPayload: IntentExtra = {
            package: "com.greenart7c3.nostrsigner", // TODO Detect and specify a general app package
            type: "nip04_encrypt",
            current_user: this._user.pubkey,
            pubkey: recipientHexPubKey,
        };

        try {
            const intent = await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
                category: "android.intent.category.BROWSABLE",
                data: `nostrsigner:${value}`,
                extra: extraPayload,
            });

            console.log("intent", intent);

            // If the activity operation succeeded
            if (intent.resultCode === -1) {
                const intentExtra: IntentExtra = intent.extra;
                console.log("Signer result:", intentExtra);
                // TODO
                // Look into if we need a queue like for NIP-07
                // return this.queueNip04("encrypt", recipientHexPubKey, value);
                return intentExtra.result;
                // If the activity operation was canceled, error out
            } else if (intent.resultCode === 0) {
                throw new Error("Canceled");
                // If the activity operation returns an unsupported user-defined custom value, error out
            } else {
                throw new Error("Unsupported result code");
            }
        } catch (error) {
            console.error("Error unable to launch NIP-04 encrypt intent:", error);
            this.throwNoExternalSignerErr(error.message);
            throw error;
        }
    }

    public async nip04Decrypt(sender: NDKUser, value: string): Promise<string> {
        const senderHexPubKey = sender.pubkey;

        const extraPayload: IntentExtra = {
            package: "com.greenart7c3.nostrsigner", // TODO Detect and specify a general app package
            type: "nip04_decrypt",
            current_user: this._user.pubkey,
            pubkey: senderHexPubKey,
        };

        try {
            const intent = await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
                category: "android.intent.category.BROWSABLE",
                data: `nostrsigner:${value}`,
                extra: extraPayload,
            });

            console.log("intent", intent);

            // TODO
            // If decryption is unsuccessful, a resultCode of -1 is still returned with the following value in the signature
            // "Could not decrypt the message", ideally a different resultCode or error should be returned
            // If the activity operation succeeded
            if (intent.resultCode === -1) {
                const intentExtra: IntentExtra = intent.extra;
                console.log("Signer result:", intentExtra);
                // TODO
                // Look into if we need a queue like for NIP-07
                // return this.queueNip04("decrypt", senderHexPubKey, value);
                return intentExtra.result;
                // If the activity operation was canceled, error out
            } else if (intent.resultCode === 0) {
                throw new Error("Canceled");
                // If the activity operation returns an unsupported user-defined custom value, error out
            } else {
                throw new Error("Unsupported result code");
            }
        } catch (error) {
            console.error("Error unable to launch NIP-04 decrypt intent:", error);
            this.throwNoExternalSignerErr(error.message);
            throw error;
        }
    }

    // private async queueNip04(
    //     type: "encrypt" | "decrypt",
    //     counterpartyHexpubkey: string,
    //     value: string
    // ): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         this.nip04Queue.push({
    //             type,
    //             counterpartyHexpubkey,
    //             value,
    //             resolve,
    //             reject,
    //         });
    //
    //         if (!this.nip04Processing) {
    //             this.processNip04Queue();
    //         }
    //     });
    // }

    // private async processNip04Queue(item?: Nip04QueueItem, retries = 0): Promise<void> {
    //     if (!item && this.nip04Queue.length === 0) {
    //         this.nip04Processing = false;
    //         return;
    //     }
    //
    //     this.nip04Processing = true;
    //     const { type, counterpartyHexpubkey, value, resolve, reject } =
    //         item || this.nip04Queue.shift()!;
    //
    //     try {
    //         let result;
    //
    //         if (type === "encrypt") {
    //             result = await window.nostr!.nip04!.encrypt(counterpartyHexpubkey, value);
    //         } else {
    //             result = await window.nostr!.nip04!.decrypt(counterpartyHexpubkey, value);
    //         }
    //
    //         resolve(result);
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     } catch (error: any) {
    //         // retry a few times if the call is already executing
    //         if (error.message && error.message.includes("call already executing")) {
    //             if (retries < 5) {
    //                 this.debug("Retrying encryption queue item", {
    //                     type,
    //                     counterpartyHexpubkey,
    //                     value,
    //                     retries,
    //                 });
    //                 setTimeout(() => {
    //                     this.processNip04Queue(item, retries + 1);
    //                 }, 50 * retries);
    //
    //                 return;
    //             }
    //         }
    //         reject(error);
    //     }
    //
    //     this.processNip04Queue();
    // }

    private convertNpubToHex(npub: Npub): Hexpubkey {
        try {
            const { type, data } = nip19.decode(npub);

            if (type !== "npub") {
                throw new Error(
                    "Unable to convert npub to hex, provided string is not a valid npub"
                );
            }

            return data as Hexpubkey;
        } catch (error) {
            console.error("Error unable to convert npub to hex:", error);
            throw error;
        }
    }

    private throwNoExternalSignerErr(errMsg: string) {
        if (errMsg.startsWith(NO_EXTERNAL_SIGNER_ERR_MSG)) {
            throw new Error("NIP-55 external signer not available");
        }
    }

    private async getPublicKey(permissions?: NDKNip55Permissions[]): Promise<GetPublicKeyResult> {
        try {
            const extraPayload: IntentExtra = {
                package: "com.greenart7c3.nostrsigner", // TODO Detect and specify a general app package
                type: "get_public_key",
            };

            if (permissions) extraPayload.permissions = JSON.stringify(permissions);

            const intent = await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
                category: "android.intent.category.BROWSABLE",
                data: "nostrsigner:",
                extra: extraPayload,
            });

            console.log("intent", intent);

            // If the activity operation succeeded
            if (intent.resultCode === -1) {
                const intentExtra: IntentExtra = intent.extra;
                console.log("Signer result:", intentExtra);
                const npub: Npub = intentExtra.result;
                const pubkey: Hexpubkey = this.convertNpubToHex(npub);
                return { pubkey };
                // If the activity operation was canceled
            } else if (intent.resultCode === 0) {
                console.log("Get public key intent canceled");
                return { canceled: true };
                // If the activity operation returns an unsupported user-defined custom value
            } else {
                console.log("Get public key intent returned an unsupported result code");
                return { unsupportedResultCode: true };
            }
        } catch (error) {
            console.error("Error unable to launch get public key intent:", error);
            this.throwNoExternalSignerErr(error.message);
            return { error };
        }
    }
}
