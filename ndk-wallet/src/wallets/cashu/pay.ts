import { Proof } from "@cashu/cashu-ts";
import type { NDKCashuWallet } from "./wallet";
import createDebug from "debug";
import type { CashuPaymentInfo, LnPaymentInfo, NDKZapDetails } from "@nostr-dev-kit/ndk";
import { payLn } from "./pay/ln.js";
import { decode as decodeBolt11 } from "light-bolt11-decoder";

export function correctP2pk(p2pk?: string) {
    if (p2pk) {
        if (p2pk.length === 64) p2pk = `02${p2pk}`;
    }

    return p2pk;
}
