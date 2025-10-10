import { mockNutzap, SignerGenerator } from "../../../../test";
import { NDK } from "../../../ndk";
import type { NDKUser } from "../../../user";
import type { NDKNutzap } from "../nutzap";
import { NDKCashuWalletTx } from "./tx";

const FAKE_MINT = "https://cashu.example.com";

const ndk = new NDK({
    signer: SignerGenerator.getSigner("bob"),
    clientName: "testing",
});

describe("NDKCashuWalletTx", () => {
    describe("alice nutzaps bob", () => {
        let senderUser: NDKUser;
        let nutzap: NDKNutzap;

        beforeEach(async () => {
            const signer = SignerGenerator.getSigner("alice");
            senderUser = await signer.user();
            nutzap = (await mockNutzap(FAKE_MINT, 100, ndk, {
                senderPk: signer,
            })) as unknown as NDKNutzap;
        });

        it("bob's wallet transaction p-tags alice", async () => {
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
