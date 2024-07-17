import { MintKeys, type Proof } from "@cashu/cashu-ts";
import NDK, { NDKEvent, NDKKind, NostrEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "./wallet";

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

    constructor(ndk?: NDK, event?: NostrEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.CashuToken;
    }

    static from(event: NDKEvent) {
        const token = new NDKCashuToken(event.ndk, event.rawEvent());

        try {
            const content = JSON.parse(token.content);
            token.proofs = content.proofs;
            if (!Array.isArray(token.proofs)) {
                token.proofs = [];
            }
        } catch (e) {
            console.error("could not parse token content", token.content);
        }
        
        return token;
    }

    async toNostrEvent(pubkey?: string): Promise<NostrEvent> {
        this.content = JSON.stringify({
            proofs: this.proofs
        });
        return super.toNostrEvent(pubkey);
    }

    set wallet(wallet: NDKCashuWallet) {
        this.tags.push(["a", wallet.tagId()])
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