import type { NDK } from "../../ndk/index.js";
import type { NDKRelaySet } from "../../relay/sets/index.js";
import type { NDKSigner } from "../../signers/index.js";
import { NDKUser } from "../../user/index.js";
import type { NostrEvent } from "../index.js";
import { NDKEvent } from "../index.js";
import { wrapEvent } from "../wrap.js";
import { NDKKind } from "./index.js";

/**
 * NIP-37 drafts.
 * @group Kind Wrapper
 *
 * @example
 * const myArticle = new NDKArticle();
 * myArticle.content = "This is my artic"
 *
 * const draft = new NDKDraft();
 * draft.event = myArticle;
 * draft.publish();
 */
export class NDKDraft extends NDKEvent {
    public _event?: NDKEvent;
    static kind = NDKKind.Draft;
    static kinds = [NDKKind.Draft, NDKKind.DraftCheckpoint];

    /**
     * Can be used to include a different pubkey as part of the draft.
     * This is useful when we want to make the draft a proposal for a different user to publish.
     */
    public counterparty?: NDKUser;

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.Draft;
    }

    static from(event: NDKEvent) {
        return new NDKDraft(event.ndk, event);
    }

    /**
     * Sets an identifier (i.e. d-tag)
     */
    set identifier(id: string) {
        this.removeTag("d");
        this.tags.push(["d", id]);
    }

    get identifier(): string | undefined {
        return this.dTag;
    }

    /**
     * Event that is to be saved.
     */
    set event(e: NDKEvent | NostrEvent) {
        if (!(e instanceof NDKEvent)) this._event = new NDKEvent(undefined, e);
        else this._event = e;

        this.prepareEvent();
    }

    /**
     * Marks the event as a checkpoint for another draft event.
     */
    set checkpoint(parent: NDKDraft | null) {
        if (parent) {
            this.tags.push(parent.tagReference());
            this.kind = NDKKind.DraftCheckpoint;
        } else {
            this.removeTag("a");
            this.kind = NDKKind.Draft;
        }
    }

    get isCheckpoint(): boolean {
        return this.kind === NDKKind.DraftCheckpoint;
    }

    get isProposal(): boolean {
        const pTag = this.tagValue("p");
        return !!pTag && pTag !== this.pubkey;
    }

    /**
     * Gets the event.
     * @param param0
     * @returns NDKEvent of the draft event or null if the draft event has been deleted (emptied).
     */
    async getEvent(signer?: NDKSigner) {
        if (this._event) return this._event;

        signer ??= this.ndk?.signer;
        if (!signer) throw new Error("No signer available");

        if (this.content && this.content.length > 0) {
            try {
                const ownPubkey = signer.pubkey;
                const pubkeys = [this.tagValue("p"), this.pubkey].filter(Boolean);

                // if there is a pubkey that is not ours, use that
                const counterpartyPubkey = pubkeys.find((pubkey) => pubkey !== ownPubkey);
                let user: NDKUser;
                user = new NDKUser({ pubkey: counterpartyPubkey ?? ownPubkey });

                await this.decrypt(user, signer);
                const payload = JSON.parse(this.content);
                this._event = await wrapEvent(new NDKEvent(this.ndk, payload));
                return this._event;
            } catch (e) {
                console.error(e);
                return undefined;
            }
        } else {
            return null;
        }
    }

    private prepareEvent() {
        if (!this._event) throw new Error("No event has been provided");
        this.removeTag("k");
        if (this._event.kind) this.tags.push(["k", this._event.kind.toString()]);

        this.content = JSON.stringify(this._event.rawEvent());
    }

    /**
     * Generates draft event.
     *
     * @param signer: Optional signer to encrypt with
     * @param publish: Whether to publish, optionally specifying relaySet to publish to
     */
    async save({ signer, publish, relaySet }: { signer?: NDKSigner; publish?: boolean; relaySet?: NDKRelaySet }) {
        signer ??= this.ndk?.signer;
        if (!signer) throw new Error("No signer available");

        // Get the user
        const user = this.counterparty || (await signer.user());
        await this.encrypt(user, signer);

        if (this.counterparty) {
            const pubkey = this.counterparty.pubkey;
            this.removeTag("p");
            this.tags.push(["p", pubkey]);
        }

        if (publish === false) return;

        return this.publishReplaceable(relaySet);
    }
}
