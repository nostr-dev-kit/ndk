<script lang="ts">
    const imageRegexp = /(?<!\!\[.*?\]\()https?:\/\/[^ ]+\.(jpg|jpeg|png|gif|webp|bmp|svg)(?!\))/;
    const isImage = (url: string) => imageRegexp.test(url);
</script>

{#if isImage($$props.href)}
    <img src={$$props.href} />
{:else}
    <a href={$$props.href}>{$$props.children??$$props.text}</a>
{/if}
