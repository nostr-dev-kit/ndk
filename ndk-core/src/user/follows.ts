import { NDKKind } from "../events/kinds/index.js";
import type { NDKSubscriptionOptions } from "../subscription/index.js";
import { type Hexpubkey, NDKUser } from "./index.js";

/**
 * @param outbox - Enables outbox data fetching for the returned users (if the NDK instance has outbox enabled)
 * @returns
 */
export async function follows(
    this: NDKUser,
    opts?: NDKSubscriptionOptions,
    outbox?: boolean,
    kind: number = NDKKind.Contacts
): Promise<Set<NDKUser>> {
    if (!this.ndk) throw new Error("NDK not set");

    const contactListEvent = await this.ndk.fetchEvent(
        { kinds: [kind], authors: [this.pubkey] },
        opts || { groupable: false }
    );

    if (contactListEvent) {
        const pubkeys = new Set<Hexpubkey>();

        contactListEvent.tags.forEach((tag: string[]) => {
            if (tag[0] === "p") pubkeys.add(tag[1]);
        });

        if (outbox) {
            this.ndk?.outboxTracker?.trackUsers(Array.from(pubkeys));
        }

        return [...pubkeys].reduce((acc: Set<NDKUser>, pubkey: Hexpubkey) => {
            const user = new NDKUser({ pubkey });
            user.ndk = this.ndk;
            acc.add(user);
            return acc;
        }, new Set<NDKUser>());
    }

    return new Set<NDKUser>();
}
