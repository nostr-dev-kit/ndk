import debug from 'debug';

import {
    type NostrEvent,
    type Npub,
    type Hexpubkey,
    NDKUser,
    DEFAULT_ENCRYPTION_SCHEME,
    type ENCRYPTION_SCHEMES,
    type NDKSigner,
} from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';
import * as IntentLauncher from 'expo-intent-launcher';

type Nip04QueueItem = {
    type: 'encrypt' | 'decrypt';
    counterpartyHexpubkey: string;
    value: string;
    resolve: (value: string) => void;
    reject: (reason?: Error) => void;
};

type Nip44 = {
    encrypt: (recipient: Hexpubkey, value: string) => Promise<string>;
    decrypt: (sender: Hexpubkey, value: string) => Promise<string>;
};

type Nip55RelayMap = {
    [key: string]: {
        read: boolean;
        write: boolean;
    };
};

type GetPublicKeyResult = {
    pubkey?: Hexpubkey;
    canceled?: boolean;
    unsupportedResultCode?: boolean;
    error?: string;
};

type IntentExtra = {
    [key: string]: any;
};

declare global {
    interface Window {
        nostr?: {
            getPublicKey(): Promise<string>;
            signEvent(event: NostrEvent): Promise<{ sig: string }>;
            getRelays?: () => Promise<Nip55RelayMap>;
            nip04?: {
                encrypt(recipientHexPubKey: string, value: string): Promise<string>;
                decrypt(senderHexPubKey: string, value: string): Promise<string>;
            };
            nip44?: Nip44;
        };
    }
}

/**
 * NDKNip55Signer implements the NDKSigner interface for signing Nostr events
 * with a NIP-55 compatible android mobile client.
 */
export class NDKNip55Signer implements NDKSigner {
    private _userPromise: Promise<NDKUser> | undefined;
    public nip04Queue: Nip04QueueItem[] = [];
    private nip04Processing = false;
    private debug: debug.Debugger;
    private waitTimeout: number;

    /**
     * @param waitTimeout - The timeout in milliseconds to wait for the NIP-55 compatible android mobile client to become available
     */
    public constructor(waitTimeout: number = 1000) {
        this.debug = debug('ndk:nip55');
        this.waitTimeout = waitTimeout;
    }

    public async blockUntilReady(): Promise<NDKUser> {
        let response = await this.getPublicKey();

        // TODO
        // Also add check to to see if an external signer is installed before getting the pubkey
        // Check if app has already been granted permissions

        // TODO
        // A response with a structure, e.g., { data?: NDKUser; canceled?: boolean; error?: string; } may be preferable to just returning a Promise<NDKUser> unless NDKUser supports a similar structure
        if (response?.canceled) {
            // If unable to obtain pubkey, due to activity operation being canceled, error out
            throw new Error('Canceled');
        } else if (response?.unsupportedResultCode) {
            // If unable to obtain pubkey, due to activity operation returning an unsupported user-defined custom value, error out
            throw new Error('Unsupported result code');
        } else if (response?.error) {
            // If unable to obtain pubkey, error out
            throw new Error('Unable to obtain pubkey from external signer');
        }

        return new NDKUser({ pubkey: response.pubkey });
    }

    // TODO
    // Test this method
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
     * @throws Error if the NIP-55 compatible android mobile client is not available and is unable to launch the sign intent
     */
    // TODO
    // Look into handling canceled and unsupported result code without throwing errors
    public async sign(event: NostrEvent): Promise<string> {
        // TODO
        // Look into implementing a similar waiting fcn
        // await this.waitForExtension();

        const eventJson = JSON.stringify(event);
        const npub: Npub = this.convertHexToNpub(event.pubkey);

        try {
            const intent = await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                category: 'android.intent.category.BROWSABLE',
                data: `nostrsigner:${eventJson}`,
                // TODO
                // Look into setting flags
                extra: {
                    package: 'com.greenart7c3.nostrsigner', // TODO Detect and specify a general app package
                    type: 'sign_event',
                    id: event.id,
                    current_user: npub,
                },
            });

            console.log('intent', intent);

            // If the activity operation succeeded
            if (intent.resultCode === -1) {
                const intentExtra: IntentExtra = intent.extra;
                console.log('Signer result:', intentExtra);
                // TODO
                // Check for a sig type
                const sig: string = intentExtra?.signature;
                return sig;
                // If the activity operation was canceled, error out
            } else if (intent.resultCode === 0) {
                throw new Error('Canceled');
                // If the activity operation returns an unsupported user-defined custom value, error out
            } else {
                throw new Error('Unsupported result code');
            }
        } catch (error) {
            console.error('Error unable to launch sign intent:', error);
            throw error;
        }
    }

    // TODO
    // Implement these methods
    public async encrypt(
        recipient: NDKUser,
        value: string,
        type: ENCRYPTION_SCHEMES = DEFAULT_ENCRYPTION_SCHEME
    ): Promise<string> {
        if (type === 'nip44') {
            return this.nip44Encrypt(recipient, value);
        } else {
            return this.nip04Encrypt(recipient, value);
        }
    }

    public async decrypt(
        sender: NDKUser,
        value: string,
        type: ENCRYPTION_SCHEMES = DEFAULT_ENCRYPTION_SCHEME
    ): Promise<string> {
        if (type === 'nip44') {
            return this.nip44Decrypt(sender, value);
        } else {
            return this.nip04Decrypt(sender, value);
        }
    }

    public async nip44Encrypt(recipient: NDKUser, value: string): Promise<string> {
        await this.waitForExtension();
        return await this.nip44.encrypt(recipient.pubkey, value);
    }

    get nip44(): Nip44 {
        if (!window.nostr?.nip44) {
            throw new Error('NIP-44 not supported by your browser extension');
        }

        return window.nostr.nip44;
    }

    public async nip44Decrypt(sender: NDKUser, value: string): Promise<string> {
        await this.waitForExtension();
        return await this.nip44.decrypt(sender.pubkey, value);
    }

    public async nip04Encrypt(recipient: NDKUser, value: string): Promise<string> {
        await this.waitForExtension();

        const recipientHexPubKey = recipient.pubkey;
        return this.queueNip04('encrypt', recipientHexPubKey, value);
    }

    public async nip04Decrypt(sender: NDKUser, value: string): Promise<string> {
        await this.waitForExtension();

        const senderHexPubKey = sender.pubkey;
        return this.queueNip04('decrypt', senderHexPubKey, value);
    }

    private async queueNip04(
        type: 'encrypt' | 'decrypt',
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

            if (type === 'encrypt') {
                result = await window.nostr!.nip04!.encrypt(counterpartyHexpubkey, value);
            } else {
                result = await window.nostr!.nip04!.decrypt(counterpartyHexpubkey, value);
            }

            resolve(result);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            // retry a few times if the call is already executing
            if (error.message && error.message.includes('call already executing')) {
                if (retries < 5) {
                    this.debug('Retrying encryption queue item', {
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

    // TODO
    // Convert this to wait for the external signer app existence
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
                reject(new Error('NIP-07 extension not available'));
            }, this.waitTimeout);
        });
    }

    private convertNpubToHex(npub: Npub): Hexpubkey {
        try {
            const { type, data } = nip19.decode(npub);

            if (type !== 'npub') {
                throw new Error(
                    'Unable to convert npub to hex, provided string is not a valid npub'
                );
            }

            return data as Hexpubkey;
        } catch (error) {
            console.error('Error unable to convert npub to hex:', error);
            throw error;
        }
    }

    private convertHexToNpub(pubkey: Hexpubkey): Npub {
        try {
            const npub = nip19.npubEncode(pubkey);

            return npub;
        } catch (error) {
            console.error('Error unable to convert hex to npub:', error);
            throw error;
        }
    }

    // TODO
    // Should a timeout be added like in the waitForExtension
    private async getPublicKey(): Promise<GetPublicKeyResult> {
        try {
            const permissions = [
                { permission: 'sign_event', kind: 22242 },
                { permission: 'nip04_encrypt' },
                { permission: 'nip04_decrypt' },
                { permission: 'nip44_encrypt' },
                { permission: 'nip44_decrypt' },
                { permission: 'decrypt_zap_event' },
            ];

            const intent = await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                category: 'android.intent.category.BROWSABLE',
                data: 'nostrsigner:',
                extra: {
                    package: 'com.greenart7c3.nostrsigner', // TODO Detect and specify a general app package
                    permissions: JSON.stringify(permissions),
                    type: 'get_public_key',
                },
            });

            console.log('intent', intent);

            // If the activity operation succeeded
            if (intent.resultCode === -1) {
                const intentExtra: IntentExtra = intent.extra;
                console.log('Signer result:', intentExtra);
                const npub: Npub = intentExtra?.signature;
                const pubkey: Hexpubkey = this.convertNpubToHex(npub);
                return { pubkey };
                // TODO
                // Handle the "Manully approve each permission menu selection"
                // Amber should return a different resultCode, should specify a data property saying a menu selection occurred, or the same behavior should occur as when selecting "I fully trust this application"
                // If the activity operation was canceled
            } else if (intent.resultCode === 0) {
                console.log('Get public key intent canceled');
                return { canceled: true };
                // If the activity operation returns an unsupported user-defined custom value
            } else {
                console.log('Get public key intent returned an unsupported result code');
                return { unsupportedResultCode: true };
            }
        } catch (error) {
            console.error('Error unable to launch get public key intent:', error);
            return { error };
        }
    }
}
