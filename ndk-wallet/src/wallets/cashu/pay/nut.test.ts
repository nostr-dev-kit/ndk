import { PaymentHandler } from "../wallet/payment";
import { NDKCashuWallet } from "../wallet";
import { findMintsInCommon } from "./nut";
import { MintUrl } from "../mint/utils";
import NDK from "@nostr-dev-kit/ndk";

const ndk = new NDK();

describe("nut.ts", () => {
    const wallet = new NDKCashuWallet(ndk);

    describe("findMintsInCommon", () => {
        it("should return mints that are common in all collections", () => {
            const user1Mints: MintUrl[] = ["https://mint1.com", "https://mint2.com"];
            const user2Mints: MintUrl[] = ["https://mint2.com", "https://mint3.com"];
            const user3Mints: MintUrl[] = ["https://mint1.com", "https://mint2.com"];

            const result = findMintsInCommon([user1Mints, user2Mints, user3Mints]);
            expect(result).toEqual(["https://mint2.com"]);
        });

        it("should return an empty array if no mints are common", () => {
            const user1Mints: MintUrl[] = ["https://mint1.com"];
            const user2Mints: MintUrl[] = ["https://mint2.com"];

            const result = findMintsInCommon([user1Mints, user2Mints]);
            expect(result).toEqual([]);
        });
    });

    // Remove tests for createTokenForPayment since it doesn't exist
});
