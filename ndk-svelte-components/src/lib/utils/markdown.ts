import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { mangle } from "marked-mangle";
import sanitizeHtml from "sanitize-html";

export const markdownToHtml = (content: string): string => {
    marked.use(mangle());
    marked.use(gfmHeadingId());

    return sanitizeHtml(
        // eslint-disable-next-line no-misleading-character-class
        marked.parse(content.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""))
    );
};
