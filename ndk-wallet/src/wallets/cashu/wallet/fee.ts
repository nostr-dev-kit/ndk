import type { Proof } from "@cashu/cashu-ts";

export function calculateFee(intendedAmount: number, providedProofs: Proof[], returnedProofs: Proof[]) {
    const totalProvided = providedProofs.reduce((acc, p) => acc + p.amount, 0);
    const totalReturned = returnedProofs.reduce((acc, p) => acc + p.amount, 0);
    const totalFee = totalProvided - intendedAmount - totalReturned;

    if (totalFee < 0) {
        throw new Error("Invalid fee calculation: received more proofs than sent to mint");
    }

    return totalFee;
}
