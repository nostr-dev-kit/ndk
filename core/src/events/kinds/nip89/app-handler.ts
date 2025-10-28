import type { NDK } from "../../../ndk/index.js";
import type { NDKUserProfile } from "../../../user/profile.js";
import type { NDKTag, NostrEvent } from "../../index.js";
import { NDKEvent } from "../../index.js";
import { NDKKind } from "../index.js";

/**
 * This is a NIP-89 app handler wrapper.
 *
 * @summary NIP-89 App Handler
 * @group Kind Wrapper
 * @implements kind:31990
 */
export class NDKAppHandlerEvent extends NDKEvent {
    private profile: NDKUserProfile | null | undefined;
    static kind = NDKKind.AppHandler;
    static kinds = [NDKKind.AppHandler];

    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.AppHandler;
    }

    static from(ndkEvent: NDKEvent): NDKAppHandlerEvent | null {
        const event = new NDKAppHandlerEvent(ndkEvent.ndk, ndkEvent.rawEvent());
        if (event.isValid) {
            return event;
        }

        return null;
    }

    get isValid(): boolean {
        const combinations = new Map<string, string>();
        const combinationFromTag = (tag: NDKTag): string => [tag[0], tag[2]].join(":").toLowerCase();
        const tagsToInspect = ["web", "android", "ios"];

        for (const tag of this.tags) {
            if (tagsToInspect.includes(tag[0])) {
                const combination = combinationFromTag(tag);
                if (combinations.has(combination)) {
                    if (combinations.get(combination) !== tag[1].toLowerCase()) {
                        return false;
                    }
                }
                combinations.set(combination, tag[1].toLowerCase());
            }
        }

        return true;
    }

    /**
     * Fetches app handler information
     * If no app information is available on the kind:31990,
     * we fetch the event's author's profile and return that instead.
     */
    async fetchProfile(): Promise<NDKUserProfile | undefined> {
        if (this.profile === undefined && this.content.length > 0) {
            try {
                const profile = JSON.parse(this.content);

                // make sure there is something
                if (profile?.name) {
                    return profile as NDKUserProfile;
                }
                this.profile = null;
            } catch (_e) {
                this.profile = null;
            }
        }

        return new Promise((resolve, reject) => {
            const author = this.author;
            author
                .fetchProfile()
                .then(() => {
                    resolve(author.profile);
                })
                .catch(reject);
        });
    }
}
