import NDK, { NDKNip46Signer, NDKPrivateKeySigner, NDKSigner, NDKUser } from '@nostr-dev-kit/ndk';
import { withNip46 } from './nip46';
import { SettingsStore } from '../../../types';

export async function withPrivateKey(key: string): Promise<NDKSigner | null> {
    return new NDKPrivateKeySigner(key);
}

export async function withPayload(
    ndk: NDK,
    payload: string,
    settingsStore: SettingsStore
): Promise<NDKSigner | null> {
    if (payload.startsWith('nsec1')) return withPrivateKey(payload);

    let pk = await settingsStore.get('nip46.pk');
    let isNewKey = false;
    if (!pk) {
        const localSigner = NDKPrivateKeySigner.generate();
        pk = localSigner.privateKey;
        console.log('NIP-46: Generating new key', pk);
        isNewKey = true;
    }

    const signer = await withNip46(ndk, payload, pk);

    if (signer instanceof NDKNip46Signer && isNewKey) {
        settingsStore.set('nip46.pk', pk);
    }

    return signer;
}

