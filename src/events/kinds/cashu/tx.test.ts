import { NDK } from "../../../ndk";
import { NDKPrivateKeySigner } from "../../../signers/private-key";
import { NDKNutzap } from "../nutzap";
import { NDKCashuWalletTx } from "./tx";
// Skip using the external mock
// import { mockNutzap } from "@nostr-dev-kit/ndk-test-utils";
import { NDKUser } from "../../../user";
import { NDKEvent } from "../../../events";

const FAKE_MINT = "https://cashu.example.com";

const ndk = new NDK({
    signer: NDKPrivateKeySigner.generate(),
    clientName: "testing",
});

// Inline mock function to avoid issues with the ndk-test-utils
async function createMockNutzap(mint: string, amount: number, ndk: any, signer: NDKPrivateKeySigner) {
    const event = new NDKEvent(ndk);
    event.kind = 9011; // Nutzap kind
    event.content = "";
    event.tags.push(["mint", mint]);
    event.tags.push(["amount", amount.toString()]);
    await event.sign(signer);
    return new NDKNutzap(ndk, event);
}

describe("NDKCashuWalletTx", () => {
    describe("redeeming nutzaps", () => {
        let senderUser: NDKUser;
        let nutzap: NDKNutzap;

        beforeEach(async () => {
            const signer = NDKPrivateKeySigner.generate();
            senderUser = await signer.user();
            // Use our inline mock function
            nutzap = await createMockNutzap(FAKE_MINT, 100, ndk, signer);
        });

        it("p-tags the person that redeemed the nutzaps", async () => {
            const tx = new NDKCashuWalletTx(ndk);
            tx.addRedeemedNutzap(nutzap);
            await tx.sign();

            const pTag = tx.tagValue("p");
            expect(pTag).toEqual(senderUser.pubkey);

            const eTags = tx.getMatchingTags("e");
            expect(eTags.length).toEqual(1);
            expect(eTags[0][1]).toEqual(nutzap.id);
            expect(eTags[0][3]).toEqual(NDKCashuWalletTx.MARKERS.REDEEMED);

            const clientTag = tx.tagValue("client");
            expect(clientTag).toBe("testing");
        });
    });
}); 