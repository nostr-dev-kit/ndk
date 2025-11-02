<!--
  @component ZapSend.Splits
  UI component for configuring zap splits. Must be inside ZapSend.Root.
-->
<script lang="ts">
  import { getZapSendContext } from './context.svelte.js';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const ctx = getZapSendContext();
</script>

<div class={className}>
  {#if ctx.splits && ctx.splits.length > 0}
    <div class="text-sm text-gray-600">
      <p class="font-medium">Splits:</p>
      <ul class="mt-1 space-y-1">
        {#each ctx.splits as split}
          <li>{split.pubkey.slice(0, 8)}... - {split.amount} sats</li>
        {/each}
      </ul>
    </div>
  {:else}
    <p class="text-sm text-gray-500">No splits configured</p>
  {/if}
</div>
