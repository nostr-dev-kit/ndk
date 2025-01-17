import { WalletState } from ".";
import { MintUrl } from "../../mint/utils";
import { GetProofsOpts } from "./proofs";

export function getBalance(
    this: WalletState,
    opts?: GetProofsOpts
) {
    const proofs = this.getProofEntries(opts);
    return proofs.reduce((sum, proof) => sum + proof.proof.amount, 0);
}

export function getMintsBalances(
    this: WalletState,
    { onlyAvailable }: GetProofsOpts = { onlyAvailable: true }
) {
    const balances: Record<MintUrl, number> = {};

    const proofs = this.getProofEntries({ onlyAvailable });
    for (const proof of proofs) {
        if (!proof.mint) continue;

        balances[proof.mint] ??= 0;
        balances[proof.mint] += proof.proof.amount;
    }

    return balances;
}
