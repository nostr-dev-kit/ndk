<script lang="ts">
  import { getZapSendContext } from './zap-send.context.js';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const ctx = getZapSendContext();
</script>

<div data-zap-send-splits="" class={className}>
  {#if ctx.splits && ctx.splits.length > 0}
    <div class="text-sm text-gray-600">
      <p class="font-medium">Splits:</p>
      <ul class="mt-1 space-y-1">
        {#each ctx.splits as split (split.pubkey)}
          <li>{split.pubkey.slice(0, 8)}... - {split.amount} sats</li>
        {/each}
      </ul>
    </div>
  {:else}
    <p class="text-sm text-gray-500">No splits configured</p>
  {/if}
</div>
