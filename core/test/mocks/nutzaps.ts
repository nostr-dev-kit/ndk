import { NDKNutzap } from "../../src/events/kinds/nutzap";
import { NDKPrivateKeySigner } from "../../src/signers/private-key";

export type Proof = {
    id: string;
    amount: number;
    secret: string;
    C: string;
};

/**
 * Creates a mock Cashu nutzap for testing zap/payment features in your application.
 *
 * Generates a complete NIP-61 nutzap event with Cashu tokens, perfect for testing
 * payment flows, zap handling, and wallet integration in your Nostr app without
 * requiring real mints or tokens.
 *
 * @param mint The mint URL
 * @param amount The amount in satoshis
 * @param ndk The NDK instance
 * @param opts Configuration options
 * @param opts.senderPk The private key signer of the sender (defaults to random)
 * @param opts.recipientPubkey The nostr pubkey of the recipient
 * @param opts.content Optional comment/message with the nutzap
 * @param opts.eventId Optional event ID being zapped (for replay protection)
 * @returns A signed nutzap event ready for testing
 *
 * @example
 * ```typescript
 * import { mockNutzap, UserGenerator } from '@nostr-dev-kit/ndk/test';
 *
 * const alice = await UserGenerator.getUser('alice', ndk);
 * const bob = await UserGenerator.getUser('bob', ndk);
 *
 * // Create a nutzap from alice to bob
 * const nutzap = await mockNutzap(
 *   'https://mint.example.com',
 *   1000, // 1000 sats
 *   ndk,
 *   {
 *     recipientPubkey: bob.pubkey,
 *     content: 'Great post!',
 *     eventId: originalEvent.id
 *   }
 * );
 *
 * // Test your app's nutzap handling
 * await myApp.handleNutzap(nutzap);
 * ```
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
 * Creates a mock Cashu proof for testing token handling in your application.
 *
 * Generates individual Cashu proofs with optional P2PK locking, useful for testing
 * token validation, redemption, and wallet operations without real Cashu tokens.
 *
 * @param C The commitment point (usually mint URL for testing)
 * @param amount The amount in satoshis
 * @param p2pk Optional pubkey for P2PK locking the proof
 * @param proofTags Optional tags for proof secret (e.g., [["e", "event-id"], ["P", "sender-pubkey"]])
 * @returns A mock Cashu proof object
 *
 * @example
 * ```typescript
 * import { mockProof } from '@nostr-dev-kit/ndk/test';
 *
 * // Create a simple proof
 * const proof = mockProof('https://mint.example.com', 100);
 *
 * // Create a P2PK-locked proof
 * const lockedProof = mockProof(
 *   'https://mint.example.com',
 *   500,
 *   bobPubkey, // locked to bob
 *   [['P', alicePubkey]] // from alice
 * );
 *
 * // Test your app's proof validation
 * const isValid = await myApp.validateProof(lockedProof);
 * ```
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
