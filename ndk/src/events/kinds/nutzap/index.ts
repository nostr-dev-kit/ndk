import debug from "debug";
import type { Hexpubkey, NostrEvent } from "../../../index.js";
import type NDK from "../../../index.js";
import { NDKEvent, NDKKind, NDKUser } from "../../../index.js";
import type { Proof } from "./proof.js";

/**
 * Represents a NIP-61 nutzap
 */
export class NDKNutzap extends NDKEvent {
    private debug: debug.Debugger;
    private _proofs: Proof[] = [];

    static kind = NDKKind.Nutzap;
    static kinds = [NDKNutzap.kind];

    constructor(ndk?: NDK, event?: NostrEvent | NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.Nutzap;
        this.debug = ndk?.debug.extend("nutzap") ?? debug("ndk:nutzap");

        // ensure we have an alt tag
        if (!this.alt) this.alt = "This is a nutzap";
    }

    static from(event: NDKEvent) {
        const e = new this(event.ndk, event);

        try {
            const proofTags = e.getMatchingTags("proof");

            if (proofTags.length) {
                // preferred version with proofs as tags
                e._proofs = proofTags.map((tag) => JSON.parse(tag[1])) as Proof[];
            } else {
                // old version with proofs in content?
                e._proofs = JSON.parse(e.content) as Proof[];
            }
        } catch {
            return;
        }

        if (!e._proofs || !e._proofs.length) return;

        return e;
    }

    set comment(comment: string | undefined) {
        this.content = comment ?? "";
    }

    get comment(): string {
        const c = this.tagValue("comment");
        if (c) return c;
        return this.content;
    }

    set proofs(proofs: Proof[]) {
        this._proofs = proofs;

        // remove old proof tags
        this.tags = this.tags.filter((tag) => tag[0] !== "proof");

        // add these proof tags
        for (const proof of proofs) {
            this.tags.push(["proof", JSON.stringify(proof)]);
        }

        // remove amount tags
        this.removeTag("amount");
        this.tags.push(["amount", this.amount.toString()]);
    }

    get proofs(): Proof[] {
        return this._proofs;
    }

    /**
     * Gets the p2pk pubkey that is embedded in the first proof
     */
    get p2pk(): string | undefined {
        const firstProof = this.proofs[0];
        try {
            const secret = JSON.parse(firstProof.secret);
            let payload: Record<string, any> = {};
            if (typeof secret === "string") {
                payload = JSON.parse(secret);
                this.debug("stringified payload", firstProof.secret);
            } else if (typeof secret === "object") {
                payload = secret;
            }
            const isP2PKLocked = payload[0] === "P2PK" && payload[1]?.data;

            if (isP2PKLocked) {
                const paddedp2pk = payload[1].data;
                const p2pk = paddedp2pk.slice(2, -1);

                if (p2pk) return p2pk;
            }
        } catch (e) {
            this.debug("error parsing p2pk pubkey", e, this.proofs[0]);
        }
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

    get unit(): string {
        return this.tagValue("unit") ?? "msat";
    }

    set unit(value: string | undefined) {
        this.removeTag("unit");
        if (value) this.tag(["unit", value]);
    }

    get amount(): number {
        const count = this.proofs.reduce((total, proof) => total + proof.amount, 0);
        return count * 1000;
    }

    public sender = this.author;

    /**
     * Set the target of the nutzap
     * @param target The target of the nutzap (a user or an event)
     */
    set target(target: NDKEvent | NDKUser) {
        // ensure we only have a single "p"-tag
        this.tags = this.tags.filter((t) => t[0] !== "p");

        if (target instanceof NDKEvent) {
            this.tags.push();
        }
    }

    set recipientPubkey(pubkey: Hexpubkey) {
        this.removeTag("p");
        this.tag(["p", pubkey]);
    }

    get recipientPubkey(): Hexpubkey {
        return this.tagValue("p")!;
    }

    get recipient(): NDKUser {
        const pubkey = this.recipientPubkey;
        if (this.ndk) return this.ndk.getUser({ pubkey });

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
