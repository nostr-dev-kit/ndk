import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { mangle } from "marked-mangle";
import markedFootnote from "marked-footnote";
import sanitizeHtml from "sanitize-html";
import { fromNostrURI, isEmbeddableMedia } from "./notes.js";
import { decode } from "nostr-tools/nip19";
import { NDKUser } from "@nostr-dev-kit/ndk";

const regex = /(nostr:)?n(event|ote|pub|profile|addr)\w{10,1000}/g;

const convertEntities = (markdown: string) => {
    for (const uri of markdown.match(regex) || []) {
        const entity = fromNostrURI(uri);

        let type,
            data,
            display = entity;

        try {
            ({ type, data } = decode(entity) as { type: string; data: any });
        } catch (e) {
            console.log(e);
        }

        try {
            switch (type) {
                case "nprofile": {
                    const user = new NDKUser({ pubkey: data.pubkey });
                    display = "@" + user.npub;
                    break;
                }
                case "npub": {
                    const user = new NDKUser({ pubkey: data });
                    display = "@" + user.npub;
                    break;
                }
                case "naddr": {
                    display = data.slice(0, 16) + "...";
                    break;
                }
            }
        } catch {
            /**/
        }

        markdown = markdown.replace(uri, `[${display}](${entity})`);
    }

    return markdown;
};

export const markdownToHtml = (content: string): string => {
    marked.use(mangle());
    marked.use(gfmHeadingId());
    marked.use(markedFootnote());

    const renderer = new marked.Renderer();
    renderer.link = (href, title, text) => {
        if (isEmbeddableMedia(href)) {
            return href;
        } else if (text.startsWith("nostr:") || text.match(/^@(npub|note1|naddr|nevent1)/)) {
            return text;
        } else {
            return `<a href="${href}" title="${title}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
    };

    marked.setOptions({
        renderer,
    });

    let html = marked.parse(
        convertEntities(content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""))
    );

    // remove <p> from around URLs
    html = html.replace(/<p>(https?:\/\/[^<]+)<\/p>/g, "$1");

    return sanitizeHtml(html);

    // return sanitizeHtml(
    // eslint-disable-next-line no-misleading-character-class
    return marked.parse(
        convertEntities(content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""))
    );
    // );
};
