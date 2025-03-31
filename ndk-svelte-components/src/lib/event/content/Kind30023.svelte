<script lang="ts">
import type { NDKArticle } from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import defaultRenderers from "./renderer";

import type { UrlFactory } from "$lib";
import { markdownToHtml } from "$lib/utils/markdown";
import type { MarkedExtension } from "marked";
import { type Token, marked } from "marked";
import markedFootnote from "marked-footnote";
import { type ComponentType, onDestroy, setContext } from "svelte";
import SvelteMarkdown from "svelte-markdown";
import EventCard from "../EventCard.svelte";

export let ndk: NDK;
export let article: NDKArticle;
export const showMedia = true;
export const content = article.content;
export const mediaCollectionComponent: ComponentType | undefined = undefined;
export const eventCardComponent: ComponentType = EventCard;
export const markedExtensions: MarkedExtension[] = [];
export let urlFactory: UrlFactory;
export const walkTokens: (token: Token) => void = () => {};

setContext("ndk", ndk);
setContext("showMedia", showMedia);

// let footnoteRenderers: Record<string, ComponentType> = {};

// if (footnote.extensions) {
//     console.log('it has a footnote extension', footnote.extensions)
//     footnoteRenderers = footnote.extensions.filter(e => e.renderer).map(e => e.renderer)
//     console.log({footnoteRenderers})
// }else {
//     console.log('no footnote renderers', footnote.extensions, {footnote})
// }

const _renderers = {
    ...defaultRenderers,
    ...($$props.renderers || {}),
};

const _contentTokens = markdownToHtml(content, markedExtensions);
</script>

<div class="article {$$props.class??""}">
    <SvelteMarkdown
        source={contentTokens}
        {renderers}
    />
</div>

<style lang="postcss">
    * > :global(.article img) {
        object-fit: contain;
        width: 100%;
        height: 100%;
    }
</style>
