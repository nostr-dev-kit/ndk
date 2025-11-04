<script lang="ts">
  interface Props {
    url: string;
    class?: string;
  }

  let { url, class: className = '' }: Props = $props();
</script>

<a href={url} class="custom-link {className}" target="_blank" rel="noopener noreferrer">
  {url}
</a>

<style>
  .custom-link {
    color: #3b82f6;
    text-decoration: underline;
  }

  .custom-link:hover {
    color: #2563eb;
  }
</style>
