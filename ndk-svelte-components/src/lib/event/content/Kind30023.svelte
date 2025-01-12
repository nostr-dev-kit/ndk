<script lang="ts">
    import type { NDKArticle } from "@nostr-dev-kit/ndk";
    import type NDK from "@nostr-dev-kit/ndk";
    import defaultRenderers from "./renderer";

    import EventCard from "../EventCard.svelte";
    import { markdownToHtml } from "$lib/utils/markdown";
    import { onDestroy, setContext, type ComponentType } from "svelte";
    import type { MarkedExtension } from "marked";
    import type { UrlFactory } from "$lib";
    import SvelteMarkdown from "svelte-markdown";
    import { marked, type Token } from "marked";
    import markedFootnote from "marked-footnote";

    export let ndk: NDK;
    export let article: NDKArticle;
    export let showMedia: boolean = true;
    export let content = article.content;
    export let mediaCollectionComponent: ComponentType | undefined = undefined;
    export let eventCardComponent: ComponentType = EventCard;
    export let markedExtensions: MarkedExtension[] = [];
    export let urlFactory: UrlFactory;
    export let walkTokens: (token: Token) => void = () => {};

    setContext('ndk', ndk);
    setContext('showMedia', showMedia);

    // let footnoteRenderers: Record<string, ComponentType> = {};
    
    // if (footnote.extensions) {
    //     console.log('it has a footnote extension', footnote.extensions)
    //     footnoteRenderers = footnote.extensions.filter(e => e.renderer).map(e => e.renderer)
    //     console.log({footnoteRenderers})
    // }else {
    //     console.log('no footnote renderers', footnote.extensions, {footnote})
    // }

    const renderers = {
        ...defaultRenderers,
        ...$$props.renderers||{},
    }

    let contentTokens = markdownToHtml(content, markedExtensions);
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
