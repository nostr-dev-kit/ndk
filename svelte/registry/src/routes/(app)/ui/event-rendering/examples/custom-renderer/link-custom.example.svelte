<script lang="ts">
  interface Props {
    url: string | string[];
    class?: string;
  }

  let { url, class: className = '' }: Props = $props();

  // Normalize to array
  const urls = $derived(Array.isArray(url) ? url : [url]);
</script>

{#each urls as linkUrl, i (i)}
  <a href={linkUrl} class="custom-link {className}" target="_blank" rel="noopener noreferrer">
    {linkUrl}
  </a>
{/each}

<style>
  .custom-link {
    color: #3b82f6;
    text-decoration: underline;
  }

  .custom-link:hover {
    color: #2563eb;
  }
</style>
