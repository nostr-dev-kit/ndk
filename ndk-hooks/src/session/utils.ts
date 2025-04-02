import type { NDKEvent } from '@nostr-dev-kit/ndk';

/**
 * Processes a Kind 10000 (Mute List) event to extract muted items.
 * @param muteListEvent The NDKEvent of kind 10000.
 * @returns An object containing sets of muted pubkeys, hashtags, words, and event IDs.
 */
export function processMuteList(muteListEvent: NDKEvent): {
    mutedPubkeys: Set<string>;
    mutedHashtags: Set<string>;
    mutedWords: Set<string>;
    mutedEventIds: Set<string>;
} {
    const mutedPubkeys = new Set<string>();
    const mutedHashtags = new Set<string>();
    const mutedWords = new Set<string>();
    const mutedEventIds = new Set<string>();

    if (muteListEvent.kind !== 10000) {
        console.warn(
            'Attempted to process non-mute list event:',
            muteListEvent
        );
        return { mutedPubkeys, mutedHashtags, mutedWords, mutedEventIds };
    }

    muteListEvent.tags.forEach((tag) => {
        if (tag[0] === 'p' && tag[1]) {
            mutedPubkeys.add(tag[1]);
        } else if (tag[0] === 't' && tag[1]) {
            mutedHashtags.add(tag[1].toLowerCase()); // Store hashtags lowercase
        } else if (tag[0] === 'word' && tag[1]) {
            mutedWords.add(tag[1]);
        } else if (tag[0] === 'e' && tag[1]) {
            mutedEventIds.add(tag[1]);
        }
        // Note: Kind 10000 can also be encrypted. Decryption needs to happen
        // before this processing step if the content is encrypted.
        // This basic implementation assumes decrypted tags.
    });

    // TODO: Handle potential encrypted content in muteListEvent.content

    return { mutedPubkeys, mutedHashtags, mutedWords, mutedEventIds };
}
