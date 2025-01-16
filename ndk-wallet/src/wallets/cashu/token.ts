import { type Proof } from "@cashu/cashu-ts";
import type { NDKRelay, NDKRelaySet, NostrEvent } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent, NDKKind, normalizeUrl } from "@nostr-dev-kit/ndk";
import type { NDKCashuWallet } from "./wallet/index.js";
import { decrypt } from "./decrypt.js";

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
    private original: NDKEvent | undefined;

    constructor(ndk?: NDK, event?: NostrEvent | NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.CashuToken;
    }

    static async from(event: NDKEvent): Promise<NDKCashuToken | undefined> {
        const token = new NDKCashuToken(event.ndk, event);

        token.original = event;
        try {
            await decrypt(token);
        } catch {
            token.content = token.original.content;
        }

        try {
            const content = JSON.parse(token.content);
            token.proofs = content.proofs;
            if (!Array.isArray(token.proofs)) return;
        } catch (e) {
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
            .filter(proof => {
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
            secret: proof.secret
        };
    }

    async toNostrEvent(pubkey?: string): Promise<NostrEvent> {
        this.content = JSON.stringify({
            proofs: this.proofs.map(this.cleanProof),
        });

        const user = await this.ndk!.signer!.user();
        await this.encrypt(user, undefined, "nip44");

        return super.toNostrEvent(pubkey);
    }

    get walletId(): string | undefined {
        const aTag = this.tags.find(([tag]) => tag === "a");
        if (!aTag) return;
        return aTag[1]?.split(":")[2];
    }

    set wallet(wallet: NDKCashuWallet) {
        const id = wallet.tagId();
        if (id)this.tags.push(["a", id]);
    }

    set mint(mint: string) {
        this.removeTag("mint");
        this.tags.push(["mint", normalizeUrl(mint)]);
    }

    get mint(): string | undefined {
        const t = this.tagValue("mint");
        if (t) return normalizeUrl(t);
    }

    get amount(): number {
        return proofsTotalBalance(this.proofs);
    }

    public async publish(
        relaySet?: NDKRelaySet,
        timeoutMs?: number,
        requiredRelayCount?: number
    ): Promise<Set<NDKRelay>> {
        if (this.original) {
            return this.original.publish(relaySet, timeoutMs, requiredRelayCount);
        } else {
            return super.publish(relaySet, timeoutMs, requiredRelayCount);
        }
    }
}
