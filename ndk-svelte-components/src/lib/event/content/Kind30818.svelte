<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type NDK from "@nostr-dev-kit/ndk"; import { NDKEvent } from "@nostr-dev-kit/ndk";
    import SvelteAsciidoc from "svelte-asciidoc";
    import AsciidocWikiLinkOrReferenceComponent from "../../utils/components/AsciidocWikiLinkOrReferenceComponent.svelte";

    export let ndk: NDK;
    export let event: NDKEvent;

    const dispatch = createEventDispatcher();

    const content = event.content.replace(/\[\[(.*?)\]\]/g, (_: string, content: string) => {
      let [target, display] = content.split('|');
      display = display || target;
      target = normalizeArticleName(target);
      return `link:wikilink:${target}[${display}]`;
    }).replace(/\bnostr:[0-9a-z]{50,}/g, (match: string) => 'link:' + match);

    function normalizeArticleName(input: string): string {
      return input.trim().toLowerCase().replace(/\W/g, '-');
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="wiki-article {$$props.class??""}" on:click>
    <SvelteAsciidoc
      source={content}
      naturalRenderers={{ a: AsciidocWikiLinkOrReferenceComponent}}
      extra={{dispatch, ndk}}
    />
</div>

<style lang="postcss">
    * > :global(.article img) {
        object-fit: contain;
        width: 100%;
        height: 100%;
    }
</style>
