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

        try {
            const proofTags = this.getMatchingTags("proof");

            if (proofTags.length) {
                // preferred version with proofs as tags
                this._proofs = proofTags.map((tag) => JSON.parse(tag[1])) as Proof[];
            } else {
                // old version with proofs in content?
                this._proofs = JSON.parse(this.content) as Proof[];
            }
        } catch {
            return;
        }
    }

    static from(event: NDKEvent) {
        const e = new NDKNutzap(event.ndk, event);
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
    }

    get proofs(): Proof[] {
        return this._proofs;
    }

    get rawP2pk(): string | undefined {
        const firstProof = this.proofs[0];
        try {
            const secret = JSON.parse(firstProof.secret);
            let payload: any;
            if (typeof secret === "string") {
                payload = JSON.parse(secret);
                this.debug("stringified payload", firstProof.secret);
            } else if (typeof secret === "object") {
                payload = secret;
            }

            // If payload is an array and has format ["P2PK", {data: "..."}]
            if (
                Array.isArray(payload) &&
                payload[0] === "P2PK" &&
                payload.length > 1 &&
                typeof payload[1] === "object" &&
                payload[1] !== null
            ) {
                return payload[1].data;
            }

            // Handle non-array case
            if (typeof payload === "object" && payload !== null && typeof payload[1]?.data === "string") {
                return payload[1].data;
            }
        } catch (e) {
            this.debug("error parsing p2pk pubkey", e, this.proofs[0]);
        }

        return undefined;
    }

    /**
     * Gets the p2pk pubkey that is embedded in the first proof.
     *
     * Note that this returns a nostr pubkey, not a cashu pubkey (no "02" prefix)
     */
    get p2pk(): string | undefined {
        const rawP2pk = this.rawP2pk;
        if (!rawP2pk) return;
        return rawP2pk.startsWith("02") ? rawP2pk.slice(2) : rawP2pk;
    }

    /**
     * Get the mint where this nutzap proofs exist
     */
    get mint(): string {
        return this.tagValue("u")!;
    }

    set mint(value: string) {
        this.replaceTag(["u", value]);
    }

    get unit(): string {
        let _unit = this.tagValue("unit") ?? "sat";
        if (_unit?.startsWith("msat")) _unit = "sat";
        return _unit;
    }

    set unit(value: string | undefined) {
        this.removeTag("unit");
        if (value?.startsWith("msat")) throw new Error("msat is not allowed, use sat denomination instead");
        if (value) this.tag(["unit", value]);
    }

    get amount(): number {
        const amount = this.proofs.reduce((total, proof) => total + proof.amount, 0);
        return amount;
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
            this.tags.push(target.tagReference());
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

    async toNostrEvent(): Promise<NostrEvent> {
        // if the unit is msat, convert to sats
        if (this.unit === "msat") {
            this.unit = "sat";
        }

        this.removeTag("amount");
        this.tags.push(["amount", this.amount.toString()]);

        const event = await super.toNostrEvent();
        event.content = this.comment;
        return event;
    }

    /**
     * Validates that the nutzap conforms to NIP-61
     */
    get isValid(): boolean {
        let eTagCount = 0;
        let pTagCount = 0;
        let mintTagCount = 0;

        for (const tag of this.tags) {
            if (tag[0] === "e") eTagCount++;
            if (tag[0] === "p") pTagCount++;
            if (tag[0] === "u") mintTagCount++;
        }

        return (
            // exactly one recipient and mint
            pTagCount === 1 &&
            mintTagCount === 1 &&
            // must have at most one e tag
            eTagCount <= 1 &&
            // must have at least one proof
            this.proofs.length > 0
        );
    }
}

/**
 * Returns the p2pk pubkey a proof is locked to.
 *
 * Note that this function does NOT make cashu pubkey into nostr pubkey
 * (i.e. it does NOT remove the "02" prefix)
 * @param proof
 */
export function proofP2pk(proof: Proof): Hexpubkey | undefined {
    try {
        const secret = JSON.parse(proof.secret);
        let payload: Record<string, any> = {};
        if (typeof secret === "string") {
            payload = JSON.parse(secret);
        } else if (typeof secret === "object") {
            payload = secret;
        }

        const isP2PKLocked = payload[0] === "P2PK" && payload[1]?.data;

        if (isP2PKLocked) {
            return payload[1].data;
        }
    } catch (e) {
        console.error("error parsing p2pk pubkey", e, proof);
    }
}

/**
 * Returns the p2pk pubkey a proof is locked to.
 *
 * Note that this function makes cashu pubkey into nostr pubkey
 * (i.e. it removes the "02" prefix)
 * @param proof
 */
export function proofP2pkNostr(proof: Proof): Hexpubkey | undefined {
    const p2pk = proofP2pk(proof);
    if (!p2pk) return;

    if (p2pk.startsWith("02") && p2pk.length === 66) return p2pk.slice(2);
    return p2pk;
}

/**
 *
 * @param cashuPubkey
 * @returns
 */
export function cashuPubkeyToNostrPubkey(cashuPubkey: string): string | undefined {
    if (cashuPubkey.startsWith("02") && cashuPubkey.length === 66) return cashuPubkey.slice(2);
    return undefined;
}
