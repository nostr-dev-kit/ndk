import { NDKNutzap } from "../../src/events/kinds/nutzap";
import { NDKPrivateKeySigner } from "../../src/signers/private-key";

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
 * @param opts.eventId - Event ID being zapped (for replay protection)
 */
export async function mockNutzap(
    mint: string,
    amount: number,
    ndk: any,
    {
        senderPk = NDKPrivateKeySigner.generate(),
        recipientPubkey,
        content = "",
        eventId,
    }: {
        senderPk?: any;
        recipientPubkey?: string;
        content?: string;
        eventId?: string;
    } = {},
) {
    if (!recipientPubkey) {
        ndk.assertSigner();
        recipientPubkey = (await ndk.signer?.user()).pubkey;
    }

    const senderUser = await senderPk.user();
    const senderPubkey = senderUser.pubkey;

    // Build proof tags
    const proofTags: [string, string][] = [];
    if (eventId) proofTags.push(["e", eventId]);
    proofTags.push(["P", senderPubkey]);

    const nutzap = new NDKNutzap(ndk);
    nutzap.mint = mint;
    nutzap.proofs = [mockProof(mint, amount, recipientPubkey, proofTags)];
    if (recipientPubkey) {
        nutzap.recipientPubkey = recipientPubkey;
    }
    if (eventId) {
        nutzap.tag(["e", eventId]);
    }
    nutzap.comment = content;
    await nutzap.sign(senderPk);
    return nutzap;
}

/**
 * Creates a proof for a given amount, optionally locking to a p2pk.
 * @param C
 * @param amount
 * @param p2pk
 * @param proofTags - Tags to include in proof secret (e.g., [["e", "event-id"], ["P", "sender-pubkey"]])
 * @returns
 */
export function mockProof(
    C: string,
    amount: number,
    p2pk?: string,
    proofTags?: [string, string][]
): Proof {
    const proof: Proof = {
        C,
        amount,
        id: "mint",
        secret: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    };

    if (p2pk) {
        proof.secret = JSON.stringify([
            "P2PK",
            {
                nonce: "4eb3d1430af5e2663634af4ff80a394cfe1d377d41ab34d6d92e03cb3f2cdc8c",
                data: `02${p2pk}`,
                ...(proofTags && proofTags.length > 0 ? { tags: proofTags } : {}),
            },
        ]);
    }

    return proof;
}
