<script lang="ts">
  import type { ProcessedZap } from '@nostr-dev-kit/svelte';

  interface Props {
    zap: ProcessedZap;
    class?: string;
  }

  let { zap, class: className = '' }: Props = $props();
</script>

{#if zap.comment}
  <span class={className}>
    {zap.comment}
  </span>
{/if}
