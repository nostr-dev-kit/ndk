import type { NDK } from "../../ndk/index.js";
import type { NDKSubscription, NDKSubscriptionOptions } from "../../subscription/index.js";
import type { NDKUser } from "../../user/index.js";
import { NDKEvent, type NostrEvent } from "../index.js";
import { NDKKind } from "./index.js";

/**
 * Callback type for collaborative event updates
 */
export type CollaborativeEventUpdateCallback = (event: NDKEvent) => void;

/**
 * Represents a NIP-C1 collaborative event (kind 39382).
 *
 * Collaborative events allow multiple users to collaborate on a single document/event.
 * The pointer event contains p-tags for all authors/owners and references the target
 * event kind via a k-tag.
 *
 * @example Creating a collaborative document
 * ```typescript
 * const article = new NDKArticle(ndk);
 * article.title = "hello world";
 * article.content = "an article by bob, alice and me";
 * await article.publish();
 *
 * const collabDoc = new NDKCollaborativeEvent(ndk);
 * collabDoc.authors.push(new NDKUser({ pubkey: 'bob' }));
 * collabDoc.authors.push(alice);
 * collabDoc.save(article);
 * await collabDoc.publish();
 * ```
 *
 * @example Reading a collaborative document
 * ```typescript
 * const collabDoc = await ndk.fetchEvent('naddr1-to-collaborative-document');
 * collabDoc.start();
 *
 * collabDoc.onUpdate((e: NDKEvent) => {
 *   console.log('collaborative document updated by', e.pubkey);
 * });
 *
 * const latestVersion = collabDoc.currentVersion;
 * collabDoc.stop();
 * ```
 *
 * @group Kind Wrapper
 */
export class NDKCollaborativeEvent extends NDKEvent {
    static kind = NDKKind.CollaborativeEvent;
    static kinds = [NDKKind.CollaborativeEvent];

    /**
     * The list of authors/owners of the collaborative document.
     * These are reflected as p-tags in the event.
     */
    private _authors: NDKUser[] = [];

    /**
     * The current best version of the collaborative document.
     * This is the event with the highest created_at from any of the authors.
     */
    private _currentVersion: NDKEvent | undefined;

    /**
     * Active subscription for live updates
     */
    private _subscription: NDKSubscription | undefined;

    /**
     * Callbacks for update notifications
     */
    private _updateCallbacks: Set<CollaborativeEventUpdateCallback> = new Set();

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.CollaborativeEvent;

        // Parse existing p-tags into authors
        if (rawEvent) {
            this._parseAuthorsFromTags();
        }
    }

    /**
     * Creates an NDKCollaborativeEvent from an existing NDKEvent.
     *
     * @param event NDKEvent to create the NDKCollaborativeEvent from.
     * @returns NDKCollaborativeEvent
     */
    static from(event: NDKEvent): NDKCollaborativeEvent {
        return new NDKCollaborativeEvent(event.ndk, event);
    }

    /**
     * Parse p-tags from the event into NDKUser objects
     */
    private _parseAuthorsFromTags(): void {
        const ndk = this.ndk;
        if (!ndk) return;

        const pTags = this.getMatchingTags("p");
        this._authors = pTags.map((tag) => ndk.getUser({ pubkey: tag[1] }));
    }

    /**
     * Get the list of authors/owners of the collaborative document.
     * Modifying this array directly will update the p-tags on publish.
     */
    get authors(): NDKUser[] {
        return this._authors;
    }

    /**
     * Set the authors of the collaborative document.
     */
    set authors(users: NDKUser[]) {
        this._authors = users;
    }

    /**
     * Get all author pubkeys as an array of strings.
     */
    get authorPubkeys(): string[] {
        return this._authors.map((u) => u.pubkey);
    }

    /**
     * Get the target event kind that this collaborative event references.
     */
    get targetKind(): number | undefined {
        const kTag = this.tagValue("k");
        return kTag ? parseInt(kTag, 10) : undefined;
    }

    /**
     * Set the target event kind.
     */
    set targetKind(kind: number | undefined) {
        this.removeTag("k");
        if (kind !== undefined) {
            this.tags.push(["k", kind.toString()]);
        }
    }

    /**
     * Get the current best version of the collaborative document.
     * This is the event with the highest created_at from any of the authors.
     */
    get currentVersion(): NDKEvent | undefined {
        return this._currentVersion;
    }

    /**
     * Synchronize the internal tags with the current authors list.
     * This should be called before publishing.
     */
    private _syncAuthorsToTags(): void {
        // Remove existing p-tags
        this.removeTag("p");

        // Add p-tags for each author
        for (const author of this._authors) {
            this.tags.push(["p", author.pubkey]);
        }
    }

    /**
     * Save an event as the collaborative document.
     * This sets up the d-tag to match the target event's d-tag and the k-tag
     * to specify the target kind.
     *
     * @param targetEvent The event to be referenced by this collaborative pointer
     */
    save(targetEvent: NDKEvent): void {
        // Set the d-tag to match the target event's d-tag
        const targetDTag = targetEvent.dTag;
        if (!targetDTag) {
            throw new Error("Target event must have a d-tag for collaborative events");
        }
        this.dTag = targetDTag;

        // Set the k-tag to the target event's kind
        this.targetKind = targetEvent.kind;

        // Store the event reference
        this._currentVersion = targetEvent;

        // The pubkey of the target event author should be included in authors
        // if not already present
        if (!this._authors.find((a) => a.pubkey === targetEvent.pubkey)) {
            if (this.ndk) {
                this._authors.push(this.ndk.getUser({ pubkey: targetEvent.pubkey }));
            }
        }
    }

    /**
     * Publish the collaborative event.
     * This will:
     * 1. Sync authors to p-tags
     * 2. Publish the pointer event (kind 39382)
     * 3. Check if the target event has a backlink to this pointer
     * 4. If not, add the backlink and republish the target event
     */
    async publish(
        relaySet?: import("../../relay/sets/index.js").NDKRelaySet,
        timeoutMs?: number,
        requiredRelayCount?: number,
    ): Promise<Set<import("../../relay/index.js").NDKRelay>> {
        // Sync authors to p-tags before publishing
        this._syncAuthorsToTags();

        // Publish the pointer event
        const relays = await super.publish(relaySet, timeoutMs, requiredRelayCount);

        // Check if we have a target event and it needs a backlink
        if (this._currentVersion) {
            await this._ensureBacklink(this._currentVersion);
        }

        return relays;
    }

    /**
     * Ensure the target event has an 'a' tag pointing back to this collaborative pointer.
     * If not, add it and republish the target event.
     */
    private async _ensureBacklink(targetEvent: NDKEvent): Promise<void> {
        const pointerAddress = this.tagAddress();

        // Check if the target event already has a backlink
        const existingATags = targetEvent.getMatchingTags("a");
        const hasBacklink = existingATags.some((tag) => tag[1] === pointerAddress);

        if (!hasBacklink) {
            // Add the backlink
            targetEvent.tags.push(["a", pointerAddress]);

            // Republish the target event
            await targetEvent.publishReplaceable();
        }
    }

    /**
     * Start a live subscription for updates to this collaborative document.
     * This subscribes to all events from the authors with the matching d-tag and kind.
     *
     * @param opts Optional subscription options
     */
    start(opts?: NDKSubscriptionOptions): void {
        if (!this.ndk) {
            throw new Error("NDK instance is required to start subscription");
        }

        if (this._subscription) {
            // Already running
            return;
        }

        const authors = this.authorPubkeys;
        const dTag = this.dTag;
        const targetKind = this.targetKind;

        if (authors.length === 0) {
            throw new Error("No authors defined for collaborative event");
        }

        if (!dTag) {
            throw new Error("No d-tag defined for collaborative event");
        }

        if (targetKind === undefined || Number.isNaN(targetKind)) {
            throw new Error("No target kind defined for collaborative event");
        }

        // Create subscription filter
        const filter = {
            kinds: [targetKind],
            authors,
            "#d": [dTag],
        };

        this._subscription = this.ndk.subscribe(filter, {
            closeOnEose: false,
            ...opts,
        });

        this._subscription.on("event", (event: NDKEvent) => {
            this._handleIncomingEvent(event);
        });
    }

    /**
     * Handle an incoming event from the subscription.
     * Updates the current best version if this event is newer.
     */
    private _handleIncomingEvent(event: NDKEvent): void {
        // Check if this event is newer than our current best
        const isNewer = !this._currentVersion || (event.created_at ?? 0) > (this._currentVersion.created_at ?? 0);

        if (isNewer) {
            this._currentVersion = event;
        }

        // Notify all update callbacks
        for (const callback of this._updateCallbacks) {
            callback(event);
        }
    }

    /**
     * Register a callback to be called when the collaborative document is updated.
     *
     * @param callback Function to call when an update is received
     */
    onUpdate(callback: CollaborativeEventUpdateCallback): void {
        this._updateCallbacks.add(callback);
    }

    /**
     * Remove an update callback.
     *
     * @param callback The callback to remove
     */
    offUpdate(callback: CollaborativeEventUpdateCallback): void {
        this._updateCallbacks.delete(callback);
    }

    /**
     * Stop the live subscription and cleanup resources.
     */
    stop(): void {
        if (this._subscription) {
            this._subscription.stop();
            this._subscription = undefined;
        }
        this._updateCallbacks.clear();
    }

    /**
     * Check if the subscription is currently active.
     */
    get isRunning(): boolean {
        return this._subscription !== undefined;
    }
}
