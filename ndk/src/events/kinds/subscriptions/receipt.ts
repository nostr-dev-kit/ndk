import debug from "debug";
import { NDKKind } from "..";
import type { NostrEvent } from "../..";
import { NDKEvent, NDKTag } from "../..";
import type { NDK } from "../../../ndk";
import type { NDKSubscriptionStart } from "./subscription-start";
import { NDKUser } from "../../../user";

type ValidPeriod = { start: Date; end: Date };

/**
 * A subscription receipt event.
 *
 * @example
 * const creator = new NDKUser;
 * const subscriber = new NDKUser;
 * const receipt = new NDKSubscriptionReceipt(ndk, event);
 * event.recipient = creator;
 * event.subscriber = subscriber;
 */
export class NDKSubscriptionReceipt extends NDKEvent {
    private debug: debug.Debugger;

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.SubscriptionReceipt;
        this.debug = ndk?.debug.extend("subscription-start") ?? debug("ndk:subscription-start");
    }

    static from(event: NDKEvent) {
        return new NDKSubscriptionReceipt(event.ndk, event.rawEvent());
    }

    /**
     * This is the person being subscribed to
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
     * This is the person subscribing
     */
    get subscriber(): NDKUser | undefined {
        const PTag = this.getMatchingTags("P")?.[0];
        if (!PTag) return undefined;

        const user = new NDKUser({ pubkey: PTag[1] });
        return user;
    }

    set subscriber(user: NDKUser | undefined) {
        this.removeTag("P");
        if (!user) return;
        this.tags.push(["P", user.pubkey]);
    }

    set subscriptionStart(event: NDKSubscriptionStart) {
        // remove any existing subscription tags
        this.debug(`before setting subscription start: ${this.rawEvent}`);
        this.removeTag("e");
        this.tag(event, "subscription", true);
        this.debug(`after setting subscription start: ${this.rawEvent}`);
    }

    get tierName(): string | undefined {
        const tag = this.getMatchingTags("tier")?.[0];
        return tag?.[1];
    }

    get isValid(): boolean {
        const period = this.validPeriod;
        if (!period) {
            return false;
        }

        if (period.start > period.end) {
            return false;
        }

        // it must have exactly one p-tag and one P-tag
        const pTags = this.getMatchingTags("p");
        const PTags = this.getMatchingTags("P");
        if (pTags.length !== 1 || PTags.length !== 1) {
            return false;
        }

        return true;
    }

    get validPeriod(): ValidPeriod | undefined {
        const tag = this.getMatchingTags("valid")?.[0];
        if (!tag) return undefined;
        try {
            return {
                start: new Date(parseInt(tag[1]) * 1000),
                end: new Date(parseInt(tag[2]) * 1000),
            };
        } catch {
            return undefined;
        }
    }

    set validPeriod(period: ValidPeriod | undefined) {
        this.removeTag("valid");
        if (!period) return;
        this.tags.push([
            "valid",
            Math.floor(period.start.getTime() / 1000).toString(),
            Math.floor(period.end.getTime() / 1000).toString(),
        ]);
    }

    get startPeriod(): Date | undefined {
        return this.validPeriod?.start;
    }

    get endPeriod(): Date | undefined {
        return this.validPeriod?.end;
    }

    /**
     * Whether the subscription is currently active
     */
    public isActive(time?: Date): boolean {
        time ??= new Date();

        // check if the subscription is valid at the given time
        const period = this.validPeriod;
        if (!period) return false;
        if (time < period.start) return false;
        if (time > period.end) return false;

        return true;
    }
}
