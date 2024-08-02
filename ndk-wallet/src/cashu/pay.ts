import { Proof } from "@cashu/cashu-ts";
import type { NDKCashuWallet } from "./wallet";
import createDebug from "debug";
import type { LnPaymentInfo } from "@nostr-dev-kit/ndk";
import type { NutPayment} from "./pay/nut.js";
import { payNut } from "./pay/nut.js";
import { payLn } from "./pay/ln.js";
import { decode as decodeBolt11 } from "light-bolt11-decoder";

function correctP2pk(p2pk?: string) {
    if (p2pk) {
        if (p2pk.length === 64) p2pk = `02${p2pk}`;
    }

    return p2pk;
}

/**
 * Uses cashu balance to make a payment, whether a cashu swap or a lightning
 */
export class NDKCashuPay {
    public wallet: NDKCashuWallet;
    public info: LnPaymentInfo | NutPayment;
    public type: "ln" | "nut" = "ln";
    public debug = createDebug("ndk-wallet:cashu:pay");
    public unit: string = "sat";

    constructor(wallet: NDKCashuWallet, info: LnPaymentInfo | NutPayment) {
        this.wallet = wallet;

        if ((info as LnPaymentInfo).pr) {
            this.type = "ln";
            this.info = info as LnPaymentInfo;
        } else {
            this.type = "nut";
            this.info = info as NutPayment;
            if (this.info.unit.startsWith("msat")) {
                this.info.unit = "sat";
                this.info.amount = this.info.amount / 1000;
                this.info.p2pk = correctP2pk(this.info.p2pk);
            }

            this.debug("nut payment %o", this.info);
        }
    }

    public getAmount() {
        if (this.type === "ln") {
            const bolt11 = (this.info as LnPaymentInfo).pr;
            const { sections } = decodeBolt11(bolt11);
            for (const section of sections) {
                if (section.name === "amount") {
                    const { value } = section;
                    return Number(value);
                }
            }
            // stab
            return 1;
        } else {
            return (this.info as NutPayment).amount;
        }
    }

    public async pay() {
        if (this.type === "ln") {
            return this.payLn();
        } else {
            return this.payNut();
        }
    }

    public payNut = payNut.bind(this);
    public payLn = payLn.bind(this);
}

/**
 * Finds mints in common in the intersection of the arrays of mints
 * @example
 * const user1Mints = ["mint1", "mint2"];
 * const user2Mints = ["mint2", "mint3"];
 * const user3Mints = ["mint1", "mint2"];
 *
 * findMintsInCommon([user1Mints, user2Mints, user3Mints]);
 *
 * // returns ["mint2"]
 */
export function findMintsInCommon(mintCollections: string[][]) {
    const mintCounts = new Map<string, number>();

    for (const mints of mintCollections) {
        for (const mint of mints) {
            if (!mintCounts.has(mint)) {
                mintCounts.set(mint, 1);
            } else {
                mintCounts.set(mint, mintCounts.get(mint)! + 1);
            }
        }
    }

    const commonMints: string[] = [];
    for (const [mint, count] of mintCounts.entries()) {
        if (count === mintCollections.length) {
            commonMints.push(mint);
        }
    }

    return commonMints;
}
