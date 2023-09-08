<script lang="ts">
    import type { NDKEvent } from "@nostr-dev-kit/ndk";
    import NoteContentLink from "./NoteContentLink.svelte";
    import { urlIsMedia } from "$lib/utils/notes";
    import DOMPurify from "isomorphic-dompurify";

    export let event: NDKEvent;
    // export const showMedia = false; // Unused so far

    const ref = event?.tagValue("r");
    let context = event?.tagValue("context");
    context = context?.replace(
        event?.content as string,
        `<mark>${event?.content}</mark>`
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
