import { EventEmitter } from "tseep";
import type { NDKCashuWallet } from "./wallet";

class NDKCashuSend extends EventEmitter {
    constructor(wallet: NDKCashuWallet, target: NDKUser | NDKEvent);
}
