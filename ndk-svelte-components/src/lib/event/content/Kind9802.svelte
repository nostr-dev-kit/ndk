<script lang="ts">
import { urlIsMedia } from "$lib/utils/notes";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import sanitizeHtml from "sanitize-html";
import NoteContentLink from "./NoteContentLink.svelte";

export let event: NDKEvent;
// export const showMedia = false; // Unused so far

const _ref = event?.tagValue("r");
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
