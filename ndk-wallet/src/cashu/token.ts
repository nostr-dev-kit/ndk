import type { MintKeys} from "@cashu/cashu-ts";
import { type Proof } from "@cashu/cashu-ts";
import type { NDKRelay, NDKRelaySet, NostrEvent } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKCashuWallet } from "./wallet";

export function proofsTotalBalance(proofs: Proof[]): number {
    for (const proof of proofs) {
        if (proof.amount < 0) {
            throw new Error("proof amount is negative");
        }
    }

    return proofs.reduce((acc, proof) => acc + proof.amount, 0);
}

export class NDKCashuToken extends NDKEvent {
    public proofs: Proof[] = [];
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
            if (!Array.isArray(token.proofs)) return;
        } catch (e) {
            return;
        }

        return token;
    }

    async toNostrEvent(pubkey?: string): Promise<NostrEvent> {
        this.content = JSON.stringify({
            proofs: this.proofs,
        });

        const user = await this.ndk!.signer!.user();
        await this.encrypt(user);

        return super.toNostrEvent(pubkey);
    }

    get walletId(): string | undefined {
        const aTag = this.tags.find(([tag]) => tag === "a");
        if (!aTag) return;
        return aTag[1]?.split(":")[2];
    }

    set wallet(wallet: NDKCashuWallet) {
        this.tags.push(["a", wallet.tagId()]);
    }

    set mint(mint: string) {
        this.removeTag("mint");
        this.tags.push(["mint", mint]);
    }

    get mint(): string | undefined {
        return this.tagValue("mint");
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

export class NDKCashuWalletKey extends NDKEvent {
    constructor(ndk?: NDK, event?: NostrEvent) {
        super(ndk, event);
        this.kind ??= 37376;
    }

    set keys(payload: MintKeys) {
        this.content = JSON.stringify(payload);
    }

    get keys(): MintKeys {
        return JSON.parse(this.content);
    }

    set wallet(wallet: NDKCashuWallet) {
        this.dTag = wallet.dTag;
    }
}
