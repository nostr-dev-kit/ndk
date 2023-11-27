<script lang="ts">
    import { isAudio, isImage, isVideo } from "$lib/utils/notes";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export let value: any;
    export let showMedia = false;
</script>

{#if showMedia && value.isMedia}
    {#if isImage(value.url)}
        <img src={value.url} alt={value.url} />
    {:else if isVideo(value.url)}
        <!-- svelte-ignore a11y-media-has-caption -->
        <video src={value.url} controls />
    {:else if isAudio(value.url)}
        <audio src={value.url} controls>
            <a href={value.url}>{value.url.replace(/https?:\/\/(www\.)?/, "")}</a>
        </audio>
    {:else}
        <a href={value.url}>
            {value.url.replace(/https?:\/\/(www\.)?/, "")}
        </a>
    {/if}
{:else}
    <a href={value.url}>
        {value.url.replace(/https?:\/\/(www\.)?/, "")}
    </a>
{/if}
