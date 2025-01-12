<script lang="ts">
    import { isAudio, isImage, isVideo } from "$lib/utils/notes";
    import { getContext } from "svelte";

    export let href: string;
    export let text: string = href.replace(/https?:\/\/(www\.)?/, "");
    export let showMedia = getContext("showMedia") || false;
</script>

{#if showMedia}
    {#if !!isImage(href)}
        <img src={href} alt={""} />
    {:else if isVideo(href)}
        <!-- svelte-ignore a11y-media-has-caption -->
        <video src={href} controls />
    {:else if isAudio(href)}
        <audio src={href} controls>
            <a href={href}>{text}</a>
        </audio>
    {:else}
        <a href={href}>
            {text}
        </a>
    {/if}
{:else}
    <a href={href}>
        {text}
    </a>
{/if}
