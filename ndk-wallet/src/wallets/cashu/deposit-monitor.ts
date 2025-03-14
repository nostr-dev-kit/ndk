import { EventEmitter } from "tseep";
import { NDKCashuDeposit } from "./deposit";

/**
 * This class tracks the active deposits and emits a "change" event when there is a change.
 */
export class NDKCashuDepositMonitor extends EventEmitter<{
    change: () => void;
}> {
    public deposits: Map<string, NDKCashuDeposit> = new Map();

    constructor() {
        super();
    }

    public addDeposit(deposit: NDKCashuDeposit) {
        const { quoteId } = deposit;
        if (!quoteId) throw new Error("deposit has no quote ID");
        if (this.deposits.has(quoteId)) return false;

        deposit.once("success", (token) => {
            this.removeDeposit(quoteId);
        });

        this.deposits.set(quoteId, deposit);
        this.emit("change");

        return true;
    }

    public removeDeposit(quoteId: string) {
        this.deposits.delete(quoteId);
        this.emit("change");
    }
}
