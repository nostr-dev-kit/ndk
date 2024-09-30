import { marked, type MarkedExtension } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { mangle } from "marked-mangle";
import markedFootnote from "marked-footnote";
import sanitizeHtml from "sanitize-html";
import { fromNostrURI, isEmbeddableMedia } from "./notes";
import { nip19 } from "nostr-tools";
import { NDKUser } from "@nostr-dev-kit/ndk";

const regex = /(nostr:)?n(event|ote|pub|profile|addr)\w{10,1000}/g;

const convertEntities = (markdown: string) => {
    for (const uri of markdown.match(regex) || []) {
        const entity = fromNostrURI(uri);

        let type,
            data,
            display = entity;

        try {
            ({ type, data } = nip19.decode(entity) as { type: string; data: any });
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

        // markdown = markdown.replace(uri, `<b>${entity}</b>`)
    }

    return markdown;
};

export const markdownToHtml = (
    content: string,
    sanitizeHtmlOptions?: sanitizeHtml.IOptions,
    extraMarkedExtensions?: MarkedExtension[]
): string => {
    marked.use(mangle());
    marked.use(gfmHeadingId());
    marked.use(markedFootnote());

    extraMarkedExtensions?.forEach((extension) => {
        marked.use(extension);
    });

    const renderer = new marked.Renderer();
    renderer.link = (href, title, text) => {
        if (isEmbeddableMedia(href)) {
            return `<img src="${href}" alt="${text}" />`;
        } else {
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
    };

    marked.setOptions({
        renderer,
    });

    let html = marked.parse(
        convertEntities(content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""))
    );

    // remove <p> from around URLs
    html = html.replace(/(<p>)?(https?:\/\/[^<]+)(<\/p>)?/g, "$2");

    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "mark"]),
        ...sanitizeHtmlOptions,
    });
};
