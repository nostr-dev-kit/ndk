import { Proof } from "@cashu/cashu-ts";
import NDK, { Hexpubkey, NDKEvent, NDKKind, NDKUser, NostrEvent } from "@nostr-dev-kit/ndk";
import createDebug from "debug";

const d = createDebug("ndk-wallet:lifecycle:nutzap");

/**
 * Represents a NIP-61 nutzap
 */
export class NDKNutzap extends NDKEvent {
    public proofs: Proof[] = [];
    
    static kind = NDKKind.Nutzap;
    static kinds = [NDKNutzap.kind];

    constructor(ndk?: NDK, event?: NostrEvent | NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.Nutzap;
    }

    static from(event: NDKEvent) {
        const e = new this(event.ndk, event);

        try {
            e.proofs = JSON.parse(e.content) as Proof[];
        } catch { return; }

        return e;
    }

    /**
     * Gets the p2pk pubkey that is embedded in the first proof
     */
    get p2pkPubkey(): string | undefined {
        const firstProof = this.proofs[0];
        try {
            const secret = JSON.parse(firstProof.secret);
            let payload: Record<string, any> = {};
            if (typeof secret === "string") {
                payload = JSON.parse(secret);
                d("stringified payload", firstProof.secret);
            } else if (typeof secret === "object") {
                payload = secret;
                d("object payload", firstProof.secret);
            }
            const isP2PKLocked = payload[0] === 'P2PK' && payload[1]?.data;
            
            if (isP2PKLocked) {
                const paddedp2pk = payload[1].data;
                const p2pk = paddedp2pk.slice(2, -1);

                if (p2pk) return p2pk;
            }
        } catch (e) {
            d("error parsing p2pk pubkey", e, this.proofs[0])
        }
    }

    get comment(): string | undefined {
        return this.tagValue("comment");
    }

    set comment(value: string | undefined) {
        this.removeTag("comment");
        if (value) this.tag(["comment", value]);
    }

    /**
     * Get the mint where this nutzap proofs exist
     */
    get mint(): string {
        return this.tagValue("u")!;
    }

    set mint(value: string) {
        this.removeTag("u");
        this.tag(["u", value]);
    }

    get amount(): number {
        const count = this.proofs.reduce((total, proof) => total + proof.amount, 0);
        return count * 1000;
    }

    public sender = this.author;

    get recipientPubkey(): Hexpubkey {
        return this.tagValue("p")!;
    }

    get recipient(): NDKUser {
        const pubkey = this.recipientPubkey;
        if (this.ndk) return this.ndk.getUser({ pubkey })

        return new NDKUser({ pubkey });
    }

    /**
     * Validates that the nutzap conforms to NIP-61
     */
    get isValid(): boolean {
        let pTagCount = 0;
        let mintTagCount = 0;

        for (const tag of this.tags) {
            if (tag[0] === "p") pTagCount++;
            if (tag[0] === "u") mintTagCount++;
        }

        return (
            // exactly one recipient and mint
            pTagCount === 1 &&
            mintTagCount === 1 &&

            // must have at least one proof
            this.proofs.length > 0
        );
    }
}