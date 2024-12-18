import { Proof } from "@cashu/cashu-ts";
import type { NDKCashuWallet } from "./wallet";
import createDebug from "debug";
import type { CashuPaymentInfo, LnPaymentInfo, NDKZapDetails } from "@nostr-dev-kit/ndk";
import type { NutPayment } from "./pay/nut.js";
import { payLn } from "./pay/ln.js";
import { decode as decodeBolt11 } from "light-bolt11-decoder";

export function correctP2pk(p2pk?: string) {
    if (p2pk) {
        if (p2pk.length === 64) p2pk = `02${p2pk}`;
    }

    return p2pk;
}

/**
 * Uses cashu balance to make a payment, whether a cashu swap or a lightning
 */
// export class NDKCashuPay {
//     public wallet: NDKCashuWallet;
//     public info: NDKZapDetails<LnPaymentInfo | CashuPaymentInfo>;
//     public type: "ln" | "nut" = "ln";
//     public debug = createDebug("ndk-wallet:cashu:pay");
//     public unit: string = "sat";

//     constructor(wallet: NDKCashuWallet, info: NDKZapDetails<LnPaymentInfo | CashuPaymentInfo>) {
//         this.wallet = wallet;

//         if ((info as LnPaymentInfo).pr) {
//             this.type = "ln";
//             this.info = info as NDKZapDetails<LnPaymentInfo>;
//         } else {
//             this.type = "nut";
//             this.info = info as NDKZapDetails<CashuPaymentInfo>;
//             if (this.info.unit.startsWith("msat")) {
//                 this.info.unit = "sat";
//                 this.info.amount = this.info.amount / 1000;
//                 this.info.p2pk = correctP2pk(this.info.p2pk);
//             }

//             this.debug("nut payment %o", this.info);
//         }
//     }

//     public getAmount() {
//         if (this.type === "ln") {
//             const bolt11 = (this.info as LnPaymentInfo).pr;
//             const { sections } = decodeBolt11(bolt11);
//             for (const section of sections) {
//                 if (section.name === "amount") {
//                     const { value } = section;
//                     return Number(value);
//                 }
//             }
//             // stab
//             return 1;
//         } else {
//             return (this.info as NutPayment).amount;
//         }
//     }

//     /**
//      * 
//      * @param description A description of what this payment is for to be added to the wallet history
//      * @param nutzap If this payment is a nutzap, this is the nutzap to be added to the wallet history
//      * @returns 
//      */
//     public async pay(payment: NDKZapDetails<LnPaymentInfo | NutPayment>) {
//         if (this.type === "ln") {
//             return this.payLn(payment as NDKZapDetails<LnPaymentInfo>)
//         } else {
//             return this.payNut(payment as NDKZapDetails<NutPayment>);
//         }
//     }

//     public payNut = createTokenForPayment.bind(this);

//     public payLn = payLn.bind(this);
// }
