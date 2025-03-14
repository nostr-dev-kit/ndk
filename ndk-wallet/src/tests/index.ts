import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NDKNutzap } from "@nostr-dev-kit/ndk";
import NDK from "@nostr-dev-kit/ndk";

export type Proof = {
    id: string;
    amount: number;
    secret: string;
    C: string;
};

/**
 * Creates a nutzap for a given amount, optionally locking to a p2pk.
 * @param mint
 * @param amount
 * @param ndk
 * @param opts
 * @param opts.senderPk - The private key of the sender
 * @param opts.recipientPubkey - The nostr pubkey of the recipient
 * @param opts.content - The content of the nutzap
 */
export async function mockNutzap(
    mint: string,
    amount: number,
    ndk?: NDK | null,
    {
        senderPk = NDKPrivateKeySigner.generate(),
        recipientPubkey,
        content = "",
    }: {
        senderPk?: NDKPrivateKeySigner;
        recipientPubkey?: string;
        content?: string;
    } = {}
) {
    if (!recipientPubkey) {
        // Generate a recipient pubkey if not provided and ndk doesn't have a signer
        if (!ndk || !ndk.signer) {
            const tempSigner = NDKPrivateKeySigner.generate();
            recipientPubkey = (await tempSigner.user()).pubkey;
        } else {
            ndk.assertSigner();
            recipientPubkey = (await ndk.signer!.user()).pubkey;
        }
    }

    // Create NDK instance if not provided
    const ndkInstance = ndk || new NDK();

    const nutzap = new NDKNutzap(ndkInstance);
    nutzap.mint = mint;
    nutzap.proofs = [mockProof(mint, amount, recipientPubkey)];
    nutzap.content = content;
    await nutzap.sign(senderPk);
    return nutzap;
}

/**
 * Creates a proof for a given amount, optionally locking to a p2pk.
 * @param C
 * @param amount
 * @param p2pk
 * @returns
 */
export function mockProof(C: string, amount: number, p2pk?: string): Proof {
    const proof: Proof = {
        C,
        amount,
        id: "mint",
        secret:
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15),
    };

    if (p2pk) {
        proof.secret = JSON.stringify([
            "P2PK",
            {
                nonce: "4eb3d1430af5e2663634af4ff80a394cfe1d377d41ab34d6d92e03cb3f2cdc8c",
                data: "02" + p2pk,
            },
        ]);
    }

    return proof;
}
