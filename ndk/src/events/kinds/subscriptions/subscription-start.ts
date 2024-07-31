import debug from "debug";
import { NDKKind } from "..";
import type { NostrEvent } from "../..";
import { NDKEvent } from "../..";
import type { NDK } from "../../../ndk";
import { NDKUser } from "../../../user";
import type { NDKSubscriptionAmount } from "./amount.js";
import { newAmount, parseTagToSubscriptionAmount } from "./amount.js";
import { NDKSubscriptionTier } from "./tier";

/**
 * Represents a subscription start event.
 * @example
 * const creator = new NDKUser;
 * const subscriber = new NDKUser;
 *
 * const subscriptionStart = new NDKSubscriptionStart(ndk);
 * subscriptionStart.amount = { amount: 100, currency: "USD", term: "monthly" };
 * subscriptionStart.recipient = creator;
 * subscriptionStart.author = subscriber;
 *
 * // {
 * //   kind: 7001,
 * //   pubkey: "<subscriber-pubkey>"
 * //   tags: [
 * //     ["amount", "100", "USD", "monthly"],
 * //     ["p", "<creator-pubkey>"]
 * //   ]
 * // }
 */
export class NDKSubscriptionStart extends NDKEvent {
    private debug: debug.Debugger;

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.Subscribe;
        this.debug = ndk?.debug.extend("subscription-start") ?? debug("ndk:subscription-start");
    }

    static from(event: NDKEvent) {
        return new NDKSubscriptionStart(event.ndk, event.rawEvent());
    }

    /**
     * Recipient of the subscription. I.e. The author of this event subscribes to this user.
     */
    get recipient(): NDKUser | undefined {
        const pTag = this.getMatchingTags("p")?.[0];
        if (!pTag) return undefined;

        const user = new NDKUser({ pubkey: pTag[1] });
        return user;
    }

    set recipient(user: NDKUser | undefined) {
        this.removeTag("p");
        if (!user) return;
        this.tags.push(["p", user.pubkey]);
    }

    /**
     * The amount of the subscription.
     */
    get amount(): NDKSubscriptionAmount | undefined {
        const amountTag = this.getMatchingTags("amount")?.[0];
        if (!amountTag) return undefined;
        return parseTagToSubscriptionAmount(amountTag);
    }

    set amount(amount: NDKSubscriptionAmount | undefined) {
        this.removeTag("amount");
        if (!amount) return;
        this.tags.push(newAmount(amount.amount, amount.currency, amount.term));
    }

    /**
     * The event id or NIP-33 tag id of the tier that the user is subscribing to.
     */
    get tierId(): string | undefined {
        const eTag = this.getMatchingTags("e")?.[0];
        const aTag = this.getMatchingTags("a")?.[0];

        if (!eTag || !aTag) return undefined;

        return eTag[1] ?? aTag[1];
    }

    set tier(tier: NDKSubscriptionTier | undefined) {
        this.removeTag("e");
        this.removeTag("a");
        this.removeTag("event");
        if (!tier) return;

        this.tag(tier);
        this.removeTag("p");
        this.tags.push(["p", tier.pubkey]);
        this.tags.push(["event", JSON.stringify(tier.rawEvent())]);
    }

    /**
     * Fetches the tier that the user is subscribing to.
     */
    async fetchTier(): Promise<NDKSubscriptionTier | undefined> {
        const eventTag = this.tagValue("event");

        if (eventTag) {
            try {
                const parsedEvent = JSON.parse(eventTag);
                return new NDKSubscriptionTier(this.ndk, parsedEvent);
            } catch {
                this.debug("Failed to parse event tag");
            }
        }

        const tierId = this.tierId;
        if (!tierId) return undefined;

        const e = await this.ndk?.fetchEvent(tierId);
        if (!e) return undefined;

        return NDKSubscriptionTier.from(e);
    }

    get isValid(): boolean {
        // has exactly one valid amount tag
        if (this.getMatchingTags("amount").length !== 1) {
            this.debug("Invalid # of amount tag");
            return false;
        }
        if (!this.amount) {
            this.debug("Invalid amount tag");
            return false;
        }

        // has exactly one valid p tag
        if (this.getMatchingTags("p").length !== 1) {
            this.debug("Invalid # of p tag");
            return false;
        }
        if (!this.recipient) {
            this.debug("Invalid p tag");
            return false;
        }

        return true;
    }
}
