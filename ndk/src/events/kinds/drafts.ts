import type { NDK } from "../../ndk/index.js";
import type { NDKRelaySet } from "../../relay/sets/index.js";
import type { NDKSigner } from "../../signers/index.js";
import type { NostrEvent } from "../index.js";
import { NDKEvent } from "../index.js";
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
    public _event: NostrEvent | undefined;

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
        if (e instanceof NDKEvent) this._event = e.rawEvent();
        else this._event = e;

        this.prepareEvent();
    }

    /**
     * Gets the event.
     * @param param0
     * @returns NDKEvent of the draft event or null if the draft event has been deleted (emptied).
     */
    async getEvent(signer?: NDKSigner) {
        if (this._event) return new NDKEvent(this.ndk, this._event);

        signer ??= this.ndk?.signer;
        if (!signer) throw new Error("No signer available");

        const user = await signer.user();

        if (this.content && this.content.length > 0) {
            try {
                await this.decrypt(user, signer);
                const payload = JSON.parse(this.content);
                this._event = payload;
                return new NDKEvent(this.ndk, payload);
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

        this.content = JSON.stringify(this._event);
    }

    /**
     * Generates draft event.
     *
     * @param signer: Optional signer to encrypt with
     * @param publish: Whether to publish, optionally specifying relaySet to publish to
     */
    async save({
        signer,
        publish,
        relaySet,
    }: {
        signer?: NDKSigner;
        publish?: boolean;
        relaySet?: NDKRelaySet;
    }) {
        signer ??= this.ndk?.signer;
        if (!signer) throw new Error("No signer available");

        // Get the user
        const user = await signer.user();
        await this.encrypt(user, signer);

        if (publish === false) return;

        return this.publish(relaySet);
    }
}
