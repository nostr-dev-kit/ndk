import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { NDKEvent } from "../events";
import { NDKCashuMintList } from "../events/kinds/nutzap/mint-list";
import { NDK } from "../ndk";
import { NDKPrivateKeySigner } from "../signers/private-key";
import type { NDKUser } from "../user";
import type { NDKUserProfile } from "../user/profile";
import type { NDKZapDetails } from ".";
import { NDKZapper } from ".";
import type { LnPaymentInfo } from "./ln";
import type { CashuPaymentInfo } from "./nip61";

vi.mock("./ln.js", () => ({
    getNip57ZapSpecFromLud: vi.fn(async () => {
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

describe("NDKZapper", () => {
    describe("getZapSplits", () => {
        const ndk = new NDK();
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
    let ndk: NDK;
    let signer: NDKPrivateKeySigner;
    let user: NDKUser;

    beforeAll(async () => {
        ndk = new NDK({
            explicitRelayUrls: ["wss://relay.example.com"],
        });
        signer = NDKPrivateKeySigner.generate();
        ndk.signer = signer;
        user = ndk.getUser({ pubkey: signer.pubkey });
        user.ndk = ndk;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("identifies when the user has signaled nutzaps", async () => {
        const mintList = new NDKCashuMintList();
        mintList.mints = ["https://mint1", "https://mint2"];
        await mintList.sign(signer);

        // Mock both profile and mint list fetching
        user.fetchProfile = vi.fn().mockResolvedValue(null);
        ndk.fetchEvent = vi.fn().mockResolvedValue(mintList);

        const zapper = new NDKZapper(user, 1000);
        zapper.cashuPay = async (_payment: NDKZapDetails<CashuPaymentInfo>) => undefined;

        const zapMethodMap = await zapper.getZapMethods(ndk, user.pubkey);
        const nip61Method = zapMethodMap.get("nip61");
        expect((nip61Method as CashuPaymentInfo).mints).toEqual(["https://mint1", "https://mint2"]);
    });

    it("defaults to nip57 when the user has not signaled nutzaps", async () => {
        const profile: NDKUserProfile = {
            name: "Pablo",
            displayName: "Pablo F",
            about: "Test user",
            lud06: "lnurl1dp68gurn8ghj7um5v93kketj9ehx2amn9wf6x7mp0xyyp6",
            lud16: "pablo@primal.net",
            created_at: Date.now() / 1000,
        };

        // Create a kind 0 event with the profile
        const profileEvent = new NDKEvent(ndk, {
            kind: 0,
            pubkey: user.pubkey,
            tags: [],
            created_at: Date.now() / 1000,
            content: JSON.stringify(profile),
        });

        // Mock both profile and mint list fetching
        const _fetchProfileMock = vi.fn().mockResolvedValue(profile);
        ndk.fetchEvent = vi.fn().mockImplementation((filter) => {
            if (filter.kinds?.[0] === 0) {
                return Promise.resolve(profileEvent);
            }
            return Promise.resolve(null);
        });

        const zapper = new NDKZapper(user, 1000);
        zapper.cashuPay = async (_payment: NDKZapDetails<CashuPaymentInfo>) => undefined;
        zapper.lnPay = async (_payment: NDKZapDetails<LnPaymentInfo>) => undefined;
        const zapMethodMap = await zapper.getZapMethods(ndk, user.pubkey);

        const nip57Method = zapMethodMap.get("nip57");
        expect(nip57Method).toBeDefined();
        expect((nip57Method as any).lud16).toBe("pablo@primal.net");
        expect((nip57Method as any).lud06).toBe("lnurl1dp68gurn8ghj7um5v93kketj9ehx2amn9wf6x7mp0xyyp6");
    });
});
