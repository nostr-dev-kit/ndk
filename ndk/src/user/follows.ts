import { nip19 } from "nostr-tools";
import {NDKUser} from "./index.js";

/**
 * @param outbox - Enables outbox data fetching for the returned users (if the NDK instance has outbox enabled)
 * @returns
 */
export async function follows(
    this: NDKUser,
    outbox?: boolean
): Promise<Set<NDKUser>> {
    if (!this.ndk) throw new Error("NDK not set");

    const contactListEvents = await this.ndk.fetchEvents({
        kinds: [3],
        authors: [this.hexpubkey],
    });

    if (contactListEvents) {
        const npubs = new Set<string>();

        contactListEvents.forEach((event) => {
            event.tags.forEach((tag: string[]) => {
                if (tag[0] === "p") {
                    try {
                        const npub = nip19.npubEncode(tag[1]);
                        npubs.add(npub);
                    } catch (e) {
                        /* empty */
                    }
                }
            });
        });

        return [...npubs].reduce((acc: Set<NDKUser>, npub: string) => {
            const user = new NDKUser({ npub });
            user.ndk = this.ndk;
            acc.add(user);
            return acc;
        }, new Set<NDKUser>());
    }

    return new Set<NDKUser>();
}
