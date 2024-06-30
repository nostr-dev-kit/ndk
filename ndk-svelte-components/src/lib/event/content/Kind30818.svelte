<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    // import type NDK from "@nostr-dev-kit/ndk";
    import { NDKEvent } from "@nostr-dev-kit/ndk";
    import SvelteAsciidoc from "svelte-asciidoc";
    import WikilinkComponent from "../../utils/components/WikilinkComponent.svelte";

    // export let ndk: NDK;
    export let event: NDKEvent;

    const dispatch = createEventDispatcher();

    const content = event.content.replace(/\[\[(.*?)\]\]/g, (_: any, content: any) => {
      let [target, display] = content.split('|');
      display = display || target;
      target = normalizeArticleName(target);
      return `link:wikilink:${target}[${display}]`;
    });

    function normalizeArticleName(input: string): string {
      return input.trim().toLowerCase().replace(/\W/g, '-');
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="wiki-article {$$props.class??""}" on:click>
    <SvelteAsciidoc
      source={content}
      naturalRenderers={{ a: WikilinkComponent }}
      extra={{dispatch}}
    />
</div>

<style lang="postcss">
    * > :global(.article img) {
        object-fit: contain;
        width: 100%;
        height: 100%;
    }
</style>
