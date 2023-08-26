import { nip19 } from "nostr-tools";
import { EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { NDKTag } from "./index.js";

export function generateContentTags(
    content: string,
    tags: NDKTag[] = []
): { content: string; tags: NDKTag[] } {
    const tagRegex = /(@|nostr:)(npub|nprofile|note|nevent)[a-zA-Z0-9]+/g;

    content = content.replace(tagRegex, (tag) => {
        try {
            const entity = tag.split(/(@|nostr:)/)[2];
            const { type, data } = nip19.decode(entity);
            let t: NDKTag;

            switch (type) {
                case "npub":
                    t = ["p", data as string];
                    break;
                case "nprofile":
                    t = ["p", (data as ProfilePointer).pubkey as string];
                    break;
                case "nevent":
                    t = ["e", (data as EventPointer).id as string];
                    break;
                case "note":
                    t = ["e", data as string];
                    break;
                default:
                    return tag;
            }

            if (!tags.find((t2) => t2[0] === t[0] && t2[1] === t[1])) {
                tags.push(t);
            }

            return `nostr:${entity}`;
        } catch (error) {
            return tag;
        }
    });

    return { content, tags };
}
