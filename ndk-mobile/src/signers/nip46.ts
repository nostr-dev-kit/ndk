import type NDK from "@nostr-dev-kit/ndk";
import { NDKNip46Signer, NDKPrivateKeySigner, type NDKSigner } from "@nostr-dev-kit/ndk";

export async function withNip46(ndk: NDK, token: string, sk?: string): Promise<NDKSigner | null> {
    let localSigner = NDKPrivateKeySigner.generate();
    if (sk) {
        localSigner = new NDKPrivateKeySigner(sk);
    }

    const signer = new NDKNip46Signer(ndk, token, localSigner);

    return new Promise((resolve, reject) => {
        signer
            .blockUntilReady()
            .then(() => {
                resolve(signer);
            })
            .catch(reject);
    });
}
