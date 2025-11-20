<script lang="ts">
  import type { ProcessedZap } from '@nostr-dev-kit/svelte';

  interface Props {
    zap: ProcessedZap;
    class?: string;
  }

  let { zap, class: className = '' }: Props = $props();
</script>

<span class={className}>
  {zap.amount}
</span>
