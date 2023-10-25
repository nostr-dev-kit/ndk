<script lang="ts">
    import type { NDKEvent } from "@nostr-dev-kit/ndk";
    import NoteContentLink from "./NoteContentLink.svelte";
    import { urlIsMedia } from "$lib/utils/notes";
    import sanitizeHtml from "sanitize-html";

    export let event: NDKEvent;
    // export const showMedia = false; // Unused so far

    const ref = event?.tagValue("r");
    let context = event?.tagValue("context");
    context = context?.replace(event?.content as string, `<mark>${event?.content}</mark>`);
</script>

<div class="{$$props.class??""}">
    <blockquote class="highlight--blockquote">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html sanitizeHtml(context || event.content)}
    </blockquote>
</div>

{#if ref}
    <div class="highlight--reference">
        <NoteContentLink showMedia={false} value={{ url: ref, isMedia: urlIsMedia(ref) }} />
    </div>
{/if}
