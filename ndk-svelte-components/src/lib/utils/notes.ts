import { nip19 } from "nostr-tools";
import { identity, last, pluck } from "ramda";

export const NEWLINE = "newline";
export const TEXT = "text";
export const TOPIC = "topic";
export const LINK = "link";
export const LINKCOLLECTION = "link[]";
export const HTML = "html";
export const INVOICE = "invoice";
export const NOSTR_NOTE = "nostr:note";
export const NOSTR_NEVENT = "nostr:nevent";
export const NOSTR_NPUB = "nostr:npub";
export const NOSTR_NPROFILE = "nostr:nprofile";
export const NOSTR_NADDR = "nostr:naddr";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const first = (list: any) => (list ? list[0] : undefined);

export const fromNostrURI = (s: string) => s.replace(/^[\w+]+:\/?\/?/, "");

export const urlIsMedia = (url: string) =>
    !url.match(/\.(apk|docx|xlsx|csv|dmg)/) && last(url.split("://"))?.includes("/");

type ContentArgs = {
    content: string;
    tags?: Array<[string, string, string]>;
    html?: boolean;
};

type ParsedPart = {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
};

export const isImage = (url: string) => url.match(/^.*\.(jpg|jpeg|png|webp|gif|avif|svg)/gi);
export const isVideo = (url: string) => url.match(/^.*\.(mov|mkv|mp4|avi|m4v|webm)/gi);
export const isAudio = (url: string) => url.match(/^.*\.(ogg|mp3|wav)/gi);

/**
 * Groups content parts into link collections when they are consecutive media links
 */
export function groupContent(parts: ParsedPart[]): ParsedPart[] {
    // if there are multiple consecutive links, group them together, but if
    const result: ParsedPart[] = [];
    let buffer: ParsedPart | undefined;

    const popBuffer = () => {
        if (buffer) {
            if (buffer.value.length > 1) {
                result.push(buffer);
            } else {
                // If there is only one link in the buffer, just push the link to the result
                result.push({
                    type: LINK,
                    value: buffer.value[0].value,
                });
            }
            buffer = undefined;
        }
    }

    parts.forEach((part, index) => {
        if (part.type === LINK && (
            isImage(part.value.url) ||
            isVideo(part.value.url) ||
            isAudio(part.value.url)
        )) {
            if (!buffer) {
                buffer = {
                    type: LINKCOLLECTION,
                    value: [],
                };
            }

            buffer.value.push(part);
        } else {
            const isNewline = part.type === NEWLINE;
            const nextIsNotLink = parts[index + 1]?.type !== LINK;

            // Only pop the buffer if this is not a newline and the next part is not a link
            if (isNewline && nextIsNotLink) {
                popBuffer();
                result.push(part);
            } else if (!buffer) {
                result.push(part);
            }
        }
    });

    popBuffer();

    return result;
}

export const parseContent = ({ content, tags = [], html = false }: ContentArgs): ParsedPart[] => {
    const result: ParsedPart[] = [];
    let text = content.trim();
    let buffer = "";

    const parseNewline = () => {
        if (html) return;
        const newline = first(text.match(/^\n+/));

        if (newline) {
            return [NEWLINE, newline, newline];
        }
    };

    const parseMention = () => {
        // Convert legacy mentions to bech32 entities
        const mentionMatch = text.match(/^#\[(\d+)\]/i);

        if (mentionMatch) {
            const i = parseInt(mentionMatch[1]);

            if (tags[i]) {
                const [tag, value, url] = tags[i];
                const relays = [url].filter(identity);

                let type, data, entity;
                try {
                    if (tag === "p") {
                        type = "nprofile";
                        data = { pubkey: value, relays };
                        entity = nip19.nprofileEncode(data);
                    } else {
                        type = "nevent";
                        data = { id: value, relays, pubkey: null };
                        entity = nip19.neventEncode(data);
                    }
                } catch { /**/ }

                return [`nostr:${type}`, mentionMatch[0], { ...data, entity }];
            }
        }
    };

    const parseTopic = () => {
        const topic = first(text.match(/^#\w+/i));

        // Skip numeric topics
        if (topic && !topic.match(/^#\d+$/)) {
            return [TOPIC, topic, topic.slice(1)];
        }
    };

    const parseBech32 = () => {
        const bech32 = first(
            text.match(/^(web\+)?(nostr:)?\/?\/?n(event|ote|profile|pub|addr)1[\d\w]+/i)
        );

        if (bech32) {
            try {
                const entity = fromNostrURI(bech32);
                const { type, data } = nip19.decode(entity) as { type: string; data: object };

                let value = data;
                if (type === "note") {
                    value = { id: data };
                } else if (type === "npub") {
                    value = { pubkey: data };
                }

                return [`nostr:${type}`, bech32, { ...value, entity }];
            } catch (e) {
                console.log(e);
                // pass
            }
        }
    };

    const parseInvoice = () => {
        const invoice = first(text.match(/^ln(bc|url)[\d\w]{50,1000}/i));

        if (invoice) {
            return [INVOICE, invoice, invoice];
        }
    };

    const parseUrl = () => {
        if (html) return;
        const raw = first(text.match(/^([a-z+:]{2,30}:\/\/)?[^\s]+\.[a-z]{2,6}[^\s]*[^.!?,:\s]/gi));

        // Skip url if it's just the end of a filepath
        if (raw) {
            const prev = last(result);

            if (prev?.type === "text" && prev.value.endsWith("/")) {
                return;
            }

            let url = raw;

            // Skip ellipses and very short non-urls
            if (url.match(/\.\./)) {
                return;
            }

            if (!url.match("://")) {
                url = "https://" + url;
            }

            return [LINK, raw, { url, isMedia: urlIsMedia(url) }];
        }
    };

    const parseHtml = () => {
        // Only parse out specific html tags
        const raw = first(text.match(/^<(pre|code)>.*?<\/\1>/gis));

        if (raw) {
            return [HTML, raw, raw];
        }
    };

    while (text) {
        // The order that this runs matters
        const part =
            parseHtml() ||
            parseNewline() ||
            parseMention() ||
            parseTopic() ||
            parseBech32() ||
            parseUrl() ||
            parseInvoice();

        if (part) {
            if (buffer) {
                result.push({ type: "text", value: buffer });
                buffer = "";
            }

            const [type, raw, value] = part;

            result.push({ type, value });
            text = text.slice(raw.length);
        } else {
            // Instead of going character by character and re-running all the above regular expressions
            // a million times, try to match the next word and add it to the buffer
            const match = first(text.match(/^[\w\d]+ ?/i)) || text[0];

            buffer += match;
            text = text.slice(match.length);
        }
    }

    if (buffer) {
        result.push({ type: TEXT, value: buffer });
    }

    return result;
};

export const truncateContent = (content, { showEntire, maxLength, showMedia = false }) => {
    if (showEntire) {
        return content;
    }

    let length = 0;
    const result = [];
    const truncateAt = maxLength * 0.6;

    content.every((part, i) => {
        const isText =
            [TOPIC, TEXT].includes(part.type) || (part.type === LINK && !part.value.isMedia);
        const isMedia =
            part.type === INVOICE || part.type.startsWith("nostr:") || part.value.isMedia;

        if (isText) {
            length += part.value.length;
        }

        if (isMedia) {
            length += showMedia ? maxLength / 3 : part.value.length;
        }

        result.push(part);

        if (length > truncateAt && i < content.length - 1) {
            if (isText || (isMedia && !showMedia)) {
                result.push({ type: TEXT, value: "..." });
            }

            return false;
        }

        return true;
    });

    return result;
};

export const getLinks = (parts) =>
    pluck(
        "value",
        parts.filter((x) => x.type === LINK && x.isMedia)
    );
