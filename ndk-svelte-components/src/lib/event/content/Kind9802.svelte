<script lang="ts">
    import type { NDKEvent } from "@nostr-dev-kit/ndk";
    import type NDK from "@nostr-dev-kit/ndk";
    import NoteContentLink from "./NoteContentLink.svelte";
    import { urlIsMedia } from "$lib/utils/notes";
    import DOMPurify from "isomorphic-dompurify";

    export let event: NDKEvent;
    // export const showMedia = false; // Unused so far

    const ref = event?.tagValue("r");
    let context = event?.tagValue("context");
    context = context?.replace(
        event?.content as string,
        `<span class='highlight--content'>${event?.content}</span>`
    );
</script>

<div>
    <blockquote class="highlight--blockquote">
        {@html DOMPurify.sanitize(context || "")}
    </blockquote>
</div>

{#if ref}
    <div class="highlight--reference">
        <NoteContentLink showMedia={false} value={{ url: ref, isMedia: urlIsMedia(ref) }} />
    </div>
{/if}

<style lang="postcss">
    * > :global(.highlight--content) {
        /* Bitcoin orange */
        background-color: rgba(242, 169, 0, 0.4);
    }

    .highlight--blockquote {
        border-left: 0.25rem solid #ccc;
        margin-left: 0;
        padding: 0.25rem 0 0.25rem 1rem;
    }

    .highlight--reference {
        margin-top: 1rem;
    }
</style>
