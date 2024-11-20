import NDK, { NDKNip46Signer, NDKPrivateKeySigner, NDKSigner, NDKUser } from '@nostr-dev-kit/ndk';
import { withNip46 } from './nip46';

export async function withPrivateKey(key: string): Promise<NDKSigner | null> {
    return new NDKPrivateKeySigner(key);
}

export async function withPayload(ndk: NDK, payload: string): Promise<NDKSigner | null> {
    if (payload.startsWith('nsec1')) return withPrivateKey(payload);

    return withNip46(ndk, payload);
}
