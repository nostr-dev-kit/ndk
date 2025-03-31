import { NDKNip07Signer, type NDKUser } from "@nostr-dev-kit/ndk";

export async function loginWithNip07() {
    const signer = new NDKNip07Signer();
    return signer.user().then(async (user: NDKUser) => {
        if (user.npub) {
            return { user: user, npub: user.npub, signer: signer };
        }
    });
}
