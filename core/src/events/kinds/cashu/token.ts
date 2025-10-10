import type { NDKEventId, NDKRelay, NDKRelaySet, NostrEvent } from "../../../index.js";
import { NDKEvent, NDKKind } from "../../../index.js";
import type { NDK } from "../../../ndk/index.js";

type Proof = {
    id: string;
    amount: number;
    secret: string;
    C: string;
};

/**
 * Calculates the total balance from an array of proofs.
 *
 * @param {Proof[]} proofs - An array of Proof objects.
 * @returns {number} The total balance.
 * @throws {Error} If any proof has a negative amount.
 */
export function proofsTotalBalance(proofs: Proof[]): number {
    return proofs.reduce((acc, proof) => {
        if (proof.amount < 0) {
            throw new Error("proof amount is negative");
        }
        return acc + proof.amount;
    }, 0);
}

export class NDKCashuToken extends NDKEvent {
    private _proofs: Proof[] = [];
    private _mint: string | undefined;
    static kind = NDKKind.CashuToken;
    static kinds = [NDKKind.CashuToken];

    /**
     * Tokens that this token superseeds
     */
    private _deletes: NDKEventId[] = [];

    private original: NDKEvent | undefined;

    constructor(ndk?: NDK, event?: NostrEvent | NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.CashuToken;
    }

    static async from(event: NDKEvent): Promise<NDKCashuToken | undefined> {
        const token = new NDKCashuToken(event.ndk, event);

        token.original = event;
        try {
            await token.decrypt();
        } catch {
            token.content = token.original.content;
        }

        try {
            const content = JSON.parse(token.content);
            token.proofs = content.proofs;
            token.mint = content.mint ?? token.tagValue("mint");
            token.deletedTokens = content.del ?? [];
            if (!Array.isArray(token.proofs)) return;
        } catch (_e) {
            return;
        }

        return token;
    }

    get proofs(): Proof[] {
        return this._proofs;
    }

    set proofs(proofs: Proof[]) {
        const cs = new Set();
        this._proofs = proofs
            .filter((proof) => {
                if (cs.has(proof.C)) {
                    console.warn("Passed in proofs had duplicates, ignoring", proof.C);
                    return false;
                }
                if (proof.amount < 0) {
                    console.warn("Invalid proof with negative amount", proof);
                    return false;
                }
                cs.add(proof.C);
                return true;
            })
            .map(this.cleanProof);
    }

    /**
     * Returns a minimal proof object with only essential properties
     */
    private cleanProof(proof: Proof): Proof {
        return {
            id: proof.id,
            amount: proof.amount,
            C: proof.C,
            secret: proof.secret,
        };
    }

    async toNostrEvent(pubkey?: string): Promise<NostrEvent> {
        if (!this.ndk) throw new Error("no ndk");
        if (!this.ndk.signer) throw new Error("no signer");
        const payload = {
            proofs: this.proofs.map(this.cleanProof),
            mint: this.mint,
            del: this.deletedTokens ?? [],
        };
        this.content = JSON.stringify(payload);

        const user = await this.ndk.signer.user();
        await this.encrypt(user, undefined, "nip44");

        return super.toNostrEvent(pubkey);
    }

    set mint(mint: string) {
        this._mint = mint;
    }

    get mint(): string | undefined {
        return this._mint;
    }

    /**
     * Tokens that were deleted by the creation of this token.
     */
    get deletedTokens(): NDKEventId[] {
        return this._deletes;
    }

    /**
     * Marks tokens that were deleted by the creation of this token.
     */
    set deletedTokens(tokenIds: NDKEventId[]) {
        this._deletes = tokenIds;
    }

    get amount(): number {
        return proofsTotalBalance(this.proofs);
    }

    public async publish(
        relaySet?: NDKRelaySet,
        timeoutMs?: number,
        requiredRelayCount?: number,
    ): Promise<Set<NDKRelay>> {
        if (this.original) {
            return this.original.publish(relaySet, timeoutMs, requiredRelayCount);
        }
        return super.publish(relaySet, timeoutMs, requiredRelayCount);
    }
}
