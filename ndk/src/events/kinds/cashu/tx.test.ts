import { NDK } from "../../../ndk";
import { NDKPrivateKeySigner } from "../../../signers/private-key";
import { NDKNutzap } from "../nutzap";
import { NDKCashuWalletTx } from "./tx";
import { mockNutzap } from "../../../../test/utils/nutzaps/index.js";
import { NDKUser } from "../../../user";

const FAKE_MINT = 'https://cashu.example.com'

const ndk = new NDK({
    signer: NDKPrivateKeySigner.generate(),
    clientName: 'testing'
});

describe("NDKCashuWalletTx", () => {
    describe('redeeming nutzaps', () => {
        let senderUser: NDKUser;
        let nutzap: NDKNutzap;

        beforeEach(async () => {
            const signer = NDKPrivateKeySigner.generate();
            senderUser = await signer.user();
            nutzap = await mockNutzap(FAKE_MINT, 100, ndk, { senderPk: signer });
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
