import {nip19} from 'nostr-tools';
import { NDKTag } from './index.js';
import { EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';

export function generateContentTags(content: string, tags: NDKTag[] = []): {content: string; tags: NDKTag[]} {
    const tagRegex = /@(npub|nprofile|note)[a-zA-Z0-9]+/g;

    content = content.replace(tagRegex, (tag) => {
        try {
            const {type, data} = nip19.decode(tag.slice(1));
            const tagIndex = tags.length;

            switch (type) {
                case 'npub':
                    tags.push(['p', data as string]);
                    break;
                case 'nprofile':
                    tags.push(['p', (data as ProfilePointer).pubkey as string]);
                    break;
                case 'nevent':
                    tags.push(['e', (data as EventPointer).id as string]);
                    break;
                case 'note':
                    tags.push(['e', data as string]);
                    break;
            }

            return `#[${tagIndex}]`;
        } catch (error) {
            return tag;
        }
    });

    return {content, tags};
}