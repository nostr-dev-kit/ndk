import { marked, type MarkedExtension, type TokenizerAndRendererExtension, type TokensList } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { mangle } from "marked-mangle";
import markedFootnote from "marked-footnote";

export const markdownToHtml = (
    content: string,
    extraMarkedExtensions?: MarkedExtension[]
): TokensList => {
    marked.use(mangle());
    marked.use(gfmHeadingId());
    marked.use(markedFootnote());

    extraMarkedExtensions?.forEach((extension) => {
        console.log('adding extension', extension)
        marked.use(extension);
    });

    const mentionRegexp = /^(nostr:|@)npub1[a-zA-Z0-9]+/;
    const eventRegexp = /^(nostr:|@)n(event|ote|addr)1[0-9a-zA-Z]+/;
    const hashtagRegexp = /^#\w+/;

    marked.use({
        extensions: [{
            name: "mention",
            level: "inline",
            start(src: string) {
                return src.indexOf("nostr:npub1");
            },
            tokenizer(src: string, tokens) {
                const match = mentionRegexp.exec(src);
                if (!match) return;

                const token = { type: 'mention', raw: match[0], npub: match[0].replace(/^(nostr:|@)/, '') };
                return token;


                // if (match.index > 0) {
                //     const text = src.slice(0, match.index); 
                //     tokens.push({ type: 'text', raw: text, text });
                // }

                // const npub = match[0].replace(/^(nostr:|@)/, '');
                // tokens.push({ type: 'nostrMention', raw: "nostr:" + npub, npub });

                // // if there is more after the mention, add it as text
                // if (match.index + match[0].length < src.length) {
                //     const text = src.slice(match.index + match[0].length);
                //     tokens.push({ type: 'text', raw: text, text });
                // }

                // return { type: 'block', raw: src, text: src, tokens };
            }
        }, {
            name: "nostrEvent",
            level: "inline",
            start(src: string) {
                return src.indexOf("nostr:note") ?? src.indexOf("nostr:nevent") ?? src.indexOf("nostr:naddr");
            },
            tokenizer(src: string, tokens) {
                const match = eventRegexp.exec(src);
                if (!match) return;

                const token = { type: 'nostrEvent', raw: match[0], id: match[0].replace(/^(nostr:|@)/, '') };
                return token;
                
                // const match = eventRegexp.exec(src); // Use extracted event regex
                // if (match) {
                //     const id = match[0].replace(/^(nostr:|@)/, '');
                    
                //     // Add prefix as text token
                //     const prefix = src.slice(0, match.index);
                //     if (prefix) {
                //         tokens.push({ type: 'text', raw: prefix, text: prefix });
                //     }

                //     // Add the main event token
                //     tokens.push({ type: "nostrEvent", raw: match[0], id });

                //     // Add suffix as text token if there's more text after the match
                //     const suffix = src.slice(match.index + match[0].length);
                //     if (suffix) {
                //         tokens.push({ type: 'text', raw: suffix, text: suffix });
                //     }

                //     return { type: 'block', raw: src, text: src, tokens };
                // }
            }
        }, {
            name: 'hashtag',
            level: 'inline',
            start(src: string) {
                return src.indexOf('#');
            },
            tokenizer(src: string, tokens) {
                const match = hashtagRegexp.exec(src);
                if (!match) return;

                const token = { type: 'hashtag', raw: match[0], hashtag: match[0], tokens };
                // this.lexer.inline(token.text, token.tokens);

                return token;
            }
        }]
    });

    // marked.Lexer.lex(content)

    const tokens = marked.lexer(content);
    return tokens;
};
