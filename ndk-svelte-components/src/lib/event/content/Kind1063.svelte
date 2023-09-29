<script lang="ts">
    import type { NDKEvent, NDKTag } from "@nostr-dev-kit/ndk";
    import { humanFileSize } from "$lib/utils/event";

    export let event: NDKEvent;
    export let showMedia: boolean = true;

    const SUPPORTED_IMAGE_TYPES = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/webp",
        "image/gif",
    ];

    const SUPPORTED_VIDEO_TYPES = [
        "video/mp4",
        "video/ogg",
        "video/quicktime",
        "video/avi",
        "video/mpeg",
    ];

    const file: string = event.getMatchingTags("url")[0][1];
    const truncatedFile: string = file.substring(0, 32).concat("...");
    const mimeType: string = event.getMatchingTags("m")[0][1];
    const sizeTags: NDKTag[] = event.getMatchingTags("size");
    const size: string = sizeTags ? humanFileSize(parseInt(sizeTags[0][1])) : "";
    const dimTags: NDKTag[] = event.getMatchingTags("dim");
    const dim: string = dimTags.length > 0 ? dimTags[0][1] : "";
</script>

<div class="kind1063--content {$$props.class??""}">
    <h3>File metadata</h3>
    <div><span class="kind1063-label">Description:</span> {event.content}</div>
    <div>
        <span class="kind1063-label">File URL:</span>
        <a href={file} target="_blank">{truncatedFile}</a>
    </div>
    <div><span class="kind1063-label">MIME type:</span> {mimeType}</div>
    <div><span class="kind1063-label">File size:</span> {size}</div>
    <div><span class="kind1063-label">Dimensions:</span> {dim}</div>
    {#if showMedia && SUPPORTED_IMAGE_TYPES.includes(mimeType)}
        <div><span class="kind1063-label">File preview:</span></div>
        <div class="kind1063--filePreview">
            <img src={file} alt={event.content} />
        </div>
    {/if}
    {#if showMedia && SUPPORTED_VIDEO_TYPES.includes(mimeType)}
        <div><span class="kind1063-label">File preview:</span></div>
        <div class="kind1063--filePreview">
            <!-- svelte-ignore a11y-media-has-caption -->
            <video controls>
                <source src={file} type={mimeType} />
                <a href={file}>Download the video</a>
            </video>
        </div>
    {/if}
</div>

<style lang="postcss">
    .kind1063--content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
    }

    .kind1063--content h3 {
        margin: 1rem 0 0 0;
    }

    .kind1063--filePreview {
        width: 100%;
    }
    .kind1063--filePreview img,
    .kind1063--filePreview video {
        max-width: 100%;
        max-height: 100%;
    }
</style>
