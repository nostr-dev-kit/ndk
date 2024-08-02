import type { NostrEvent } from "nostr-tools";
import type { NDKZapDetails} from ".";
import { NDKZapper } from ".";
import { NDKEvent } from "../events";
import { NDKCashuMintList } from "../events/kinds/nutzap/mint-list";
import { NDK } from "../ndk";
import { NDKPrivateKeySigner } from "../signers/private-key";
import type { NDKUser } from "../user";
import type { CashuPaymentInfo } from "./nip61";
import type { LnPaymentInfo } from "./ln";

jest.mock("./ln.js", () => ({
    getNip57ZapSpecFromLud: jest.fn(async () => {
        return {
            status: "OK",
            tag: "payRequest",
            callback: "https://primal.net/lnurlp/pablof7z/callback",
            metadata: '[["text/plain","sats for pablof7z@primal.net"]]',
            minSendable: 1000,
            maxSendable: 11000000000,
            nostrPubkey: "f81611363554b64306467234d7396ec88455707633f54738f6c4683535098cd3",
            allowsNostr: true,
            commentAllowed: 200,
        };
    }),
}));

const ndk = new NDK();

describe("NDKZapper", () => {
    describe("getZapSplits", () => {
        const event = new NDKEvent();
        event.ndk = ndk;

        it("uses the author pubkey when the target is the user", () => {
            const user = ndk.getUser({
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
            });
            const splits = new NDKZapper(user, 1000).getZapSplits();
            expect(splits).toEqual([
                {
                    pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                    amount: 1000,
                },
            ]);
        });

        it("uses the author pubkey when there are no splits", () => {
            event.pubkey = "author-pubkey";

            const zapper = new NDKZapper(event, 1000);
            const splits = zapper.getZapSplits();
            expect(splits).toEqual([
                {
                    pubkey: "author-pubkey",
                    amount: 1000,
                },
            ]);
        });

        it("properly calculates splits", () => {
            event.tags = [
                ["zap", "pubkey1", "1"],
                ["zap", "pubkey2", "2"], // pubkey2 gets double
            ];

            const zapper = new NDKZapper(event, 1000);
            const splits = zapper.getZapSplits();
            expect(splits).toEqual([
                { pubkey: "pubkey1", amount: 333 },
                { pubkey: "pubkey2", amount: 666 },
            ]);
        });
    });
});

describe("getZapMethod", () => {
    let signer: NDKPrivateKeySigner;
    let user: NDKUser;

    beforeAll(async () => {
        signer = NDKPrivateKeySigner.generate();
        user = await signer.user();
        user.ndk = ndk;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("identifies when the user has signaled nutzaps", async () => {
        const mintList = new NDKCashuMintList();
        mintList.mints = ["https://mint1", "https://mint2"];
        await mintList.sign(signer);
        ndk.fetchEvents = jest.fn().mockResolvedValue(new Set([mintList]));
        const zapper = new NDKZapper(user, 1000);
        zapper.onCashuPay = async (payment: NDKZapDetails<CashuPaymentInfo>) => undefined;
        const zapMethod = (await zapper.getZapMethods(ndk, user.pubkey))[0];
        expect(zapMethod.type).toBe("nip61");
        expect((zapMethod.data as CashuPaymentInfo).mints).toEqual([
            "https://mint1",
            "https://mint2",
        ]);
    });

    it("defaults to nip57 when the user has not signaled nutzaps", async () => {
        const profile = new NDKEvent(ndk, {
            content: JSON.stringify({ lud16: "pablo@primal.net" }),
            kind: 0,
        } as NostrEvent);
        ndk.fetchEvents = jest.fn().mockResolvedValue(new Set<NDKEvent>([profile]));
        const zapper = new NDKZapper(user, 1000);
        zapper.onCashuPay = async (payment: NDKZapDetails<CashuPaymentInfo>) => undefined;
        zapper.onLnPay = async (payment: NDKZapDetails<LnPaymentInfo>) => undefined;
        const zapMethod = (
            await zapper.getZapMethods(
                ndk,
                "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"
            )
        )[0];

        expect(zapMethod.type).toBe("nip57");
    });
});
