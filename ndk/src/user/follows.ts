import { type Hexpubkey, NDKUser } from "./index.js";
import type { NDKSubscriptionOptions } from "../subscription/index.js";

/**
 * @param outbox - Enables outbox data fetching for the returned users (if the NDK instance has outbox enabled)
 * @returns
 */
export async function follows(
    this: NDKUser,
    opts?: NDKSubscriptionOptions,
    outbox?: boolean
): Promise<Set<NDKUser>> {
    if (!this.ndk) throw new Error("NDK not set");

    const contactListEvent = await this.ndk.fetchEvent(
        {
            kinds: [3],
            authors: [this.hexpubkey],
        },
        opts || { groupable: false }
    );

    if (contactListEvent) {
        const pubkeys = new Set<Hexpubkey>();

        contactListEvent.tags.forEach((tag: string[]) => {
            if (tag[0] === "p") {
                try {
                    pubkeys.add(tag[1]);
                    if (outbox) {
                        this.ndk?.outboxTracker?.trackUsers([tag[1]]);
                    }
                } catch (e) {
                    /* empty */
                }
            }
        });

        return [...pubkeys].reduce((acc: Set<NDKUser>, hexpubkey: Hexpubkey) => {
            const user = new NDKUser({ hexpubkey });
            user.ndk = this.ndk;
            acc.add(user);
            return acc;
        }, new Set<NDKUser>());
    }

    return new Set<NDKUser>();
}
