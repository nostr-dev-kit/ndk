import { nip19 } from "nostr-tools";

import type { EventPointer, ProfilePointer } from "../user/index.js";
import { isValidPubkey } from "../utils/validation.js";
import type { ContentTaggingOptions, NDKEvent, NDKTag } from "./index.js";

export type ContentTag = {
    tags: NDKTag[];
    content: string;
};

/**
 * Merges two arrays of NDKTag, ensuring uniqueness and preferring more specific tags.
 *
 * This function consolidates `tags1` and `tags2` by:
 * - Combining both tag arrays.
 * - Removing duplicate tags based on containment (one tag containing another).
 * - Retaining the longer or more detailed tag when overlaps are found.
 *
 * @param tags1 - The first array of NDKTag.
 * @param tags2 - The second array of NDKTag.
 * @returns A merged array of unique NDKTag.
 */
export function mergeTags(tags1: NDKTag[], tags2: NDKTag[]): NDKTag[] {
    const tagMap = new Map<string, NDKTag>();

    // Function to generate a key for the hashmap
    const generateKey = (tag: NDKTag) => tag.join(",");

    // Function to determine if a tag is contained in another
    const isContained = (smaller: NDKTag, larger: NDKTag) => {
        return smaller.every((value, index) => value === larger[index]);
    };

    // Function to process and add a tag
    const processTag = (tag: NDKTag) => {
        for (const [key, existingTag] of tagMap) {
            if (isContained(existingTag, tag) || isContained(tag, existingTag)) {
                // Replace with the longer or equal-length tag
                if (tag.length >= existingTag.length) {
                    tagMap.set(key, tag);
                }
                return;
            }
        }
        // Add new tag if no containing relationship is found
        tagMap.set(generateKey(tag), tag);
    };

    // Process all tags
    tags1.concat(tags2).forEach(processTag);

    return Array.from(tagMap.values());
}

/**
 * Compares a tag to see if they are the same or if one is preferred
 * over the other (i.e. it includes more information) and returns
 * the tags that should be used.
 * @returns
 */
export function uniqueTag(a: NDKTag, b: NDKTag): NDKTag[] {
    const aLength = a.length;
    const bLength = b.length;
    const sameLength = aLength === bLength;

    // If sa    un length
    if (sameLength) {
        if (a.every((v, i) => v === b[i])) {
            // and same values (regardless of length), return one
            return [a];
        }
        // and different values, return both
        return [a, b];
    }
    if (aLength > bLength && a.every((v, i) => v === b[i])) {
        // If different length but the longer contains the shorter, return the longer
        return [a];
    }
    if (bLength > aLength && b.every((v, i) => v === a[i])) {
        return [b];
    }

    // Otherwise, return both
    return [a, b];
}

const hashtagRegex = /(?<=\s|^)(#[^\s!@#$%^&*()=+./,[{\]};:'"?><]+)/g;

/**
 * Generates a unique list of hashtags as used in the content. If multiple variations
 * of the same hashtag are used, only the first one will be used (#ndk and #NDK both resolve to the first one that was used in the content)
 * @param content
 * @returns
 */
export function generateHashtags(content: string): string[] {
    const hashtags = content.match(hashtagRegex);
    const tagIds = new Set<string>();
    const tag = new Set<string>();
    if (hashtags) {
        for (const hashtag of hashtags) {
            if (tagIds.has(hashtag.slice(1))) continue;
            tag.add(hashtag.slice(1));
            tagIds.add(hashtag.slice(1));
        }
    }
    return Array.from(tag);
}

export async function generateContentTags(
    content: string,
    tags: NDKTag[] = [],
    opts?: ContentTaggingOptions,
    ctx?: NDKEvent,
): Promise<ContentTag> {
    // Early return if content tagging is disabled
    if (opts?.skipContentTagging) {
        return { content, tags };
    }

    const tagRegex = /(@|nostr:)(npub|nprofile|note|nevent|naddr)[a-zA-Z0-9]+/g;

    const promises: Promise<void>[] = [];

    const addTagIfNew = (t: NDKTag) => {
        if (!tags.find((t2) => ["q", t[0]].includes(t2[0]) && t2[1] === t[1])) {
            tags.push(t);
        }
    };

    content = content.replace(tagRegex, (tag) => {
        try {
            const entity = tag.split(/(@|nostr:)/)[2];
            const { type, data } = nip19.decode(entity);
            let t: NDKTag | undefined;

            // Check if type should be filtered
            if (opts?.filters) {
                const shouldInclude = !opts.filters.includeTypes || opts.filters.includeTypes.includes(type as any);
                const shouldExclude = opts.filters.excludeTypes?.includes(type as any);
                if (!shouldInclude || shouldExclude) {
                    return tag;
                }
            }

            switch (type) {
                case "npub":
                    if (opts?.pTags !== false) {
                        t = ["p", data as string];
                    }
                    break;

                case "nprofile":
                    if (opts?.pTags !== false) {
                        t = ["p", (data as ProfilePointer).pubkey as string];
                    }
                    break;

                case "note":
                    promises.push(
                        new Promise(async (resolve) => {
                            const relay = await maybeGetEventRelayUrl(entity);
                            addTagIfNew(["q", data, relay]);
                            resolve();
                        }),
                    );
                    break;

                case "nevent":
                    promises.push(
                        new Promise(async (resolve) => {
                            const { id, author } = data as EventPointer;
                            let { relays } = data as EventPointer;

                            // If the nevent doesn't have a relay specified, try to get one
                            if (!relays || relays.length === 0) {
                                relays = [await maybeGetEventRelayUrl(entity)];
                            }

                            addTagIfNew(["q", id, relays[0]]);
                            if (author && opts?.pTags !== false && opts?.pTagOnQTags !== false)
                                addTagIfNew(["p", author]);
                            resolve();
                        }),
                    );
                    break;

                case "naddr":
                    promises.push(
                        new Promise(async (resolve) => {
                            const id = [data.kind, data.pubkey, data.identifier].join(":");
                            let relays = data.relays ?? [];

                            // If the naddr doesn't have a relay specified, try to get one
                            if (relays.length === 0) {
                                relays = [await maybeGetEventRelayUrl(entity)];
                            }

                            addTagIfNew(["q", id, relays[0]]);
                            if (opts?.pTags !== false && opts?.pTagOnQTags !== false && opts?.pTagOnATags !== false)
                                addTagIfNew(["p", data.pubkey]);
                            resolve();
                        }),
                    );
                    break;
                default:
                    return tag;
            }

            if (t) addTagIfNew(t);

            return `nostr:${entity}`;
        } catch (_error) {
            return tag;
        }
    });

    await Promise.all(promises);

    // Only add hashtags if not filtered out
    if (!opts?.filters?.excludeTypes?.includes("hashtag")) {
        const newTags = generateHashtags(content).map((hashtag) => ["t", hashtag]);
        tags = mergeTags(tags, newTags);
    }

    // Copy p-tags from target event if requested
    if (opts?.pTags !== false && opts?.copyPTagsFromTarget && ctx) {
        const pTags = ctx.getMatchingTags("p");
        for (const pTag of pTags) {
            if (!pTag[1] || !isValidPubkey(pTag[1])) continue;
            if (!tags.find((t) => t[0] === "p" && t[1] === pTag[1])) {
                tags.push(pTag);
            }
        }
    }

    return { content, tags };
}

/**
 * Get the event from the cache, if there is one, so we can get the relay.
 * @param nip19Id
 * @returns Relay URL or an empty string
 */
async function maybeGetEventRelayUrl(_nip19Id: string): Promise<string> {
    /* TODO */

    return "";
}
