<script lang="ts">
  import type { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createZapSendAction } from '$lib/registry/builders/zap-send/index.svelte.js';
  import { getContext } from 'svelte';
  import { cn } from '../../../utils/cn';
  import {User} from '../../../ui/user';
  import ZapIcon from '../../icons/zap.svelte';

  interface Props {
    ndk?: NDKSvelte;
    target: NDKEvent | NDKUser;
    class?: string;
    onsuccess?: () => void;
    oncancel?: () => void;
  }

  let {
    ndk: ndkProp,
    target,
    class: className = '',
    onsuccess,
    oncancel
  }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ndkContext;

  const zap = $derived(
    target ? createZapSendAction(() => ({ target }), ndk) : null
  );

  const presets = [21, 100, 1000, 5000, 10000];

  async function handleSend() {
    if (!zap) return;

    try {
      await zap.send();
      zap.amount = 1000;
      zap.comment = '';
      onsuccess?.();
    } catch (error) {
      console.error('Failed to send zap:', error);
    }
  }

  function handleCancel() {
    if (zap) {
      zap.amount = 1000;
      zap.comment = '';
    }
    oncancel?.();
  }
</script>

{#if zap}
  <div class={cn('bg-background border border-border rounded-xl max-w-[500px] w-full p-6', className)} data-zap-send-classic="">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6" data-header="">
      <h2 class="text-xl font-semibold m-0">Send a Zap</h2>
    </div>

    <!-- Amount Selection -->
    <div class="mb-6" data-section="">
      <label class="block font-semibold text-sm mb-2 text-foreground" data-label="">Amount</label>
      <div class="flex gap-2 mb-3 flex-wrap" data-amount-presets="">
        {#each presets as preset}
          <button
            class="flex-1 min-w-[60px] px-4 py-2 border border-border rounded-md bg-background cursor-pointer text-sm font-medium transition-all hover:bg-muted hover:border-primary {zap.amount === preset ? 'bg-primary text-white border-primary' : ''}"
            onclick={() => zap.amount = preset}
            data-preset-btn=""
            data-active={zap.amount === preset ? '' : undefined}
          >
            {#if preset >= 1000}
              {preset / 1000}K
            {:else}
              {preset}
            {/if}
          </button>
        {/each}
      </div>
      <input
        type="number"
        bind:value={zap.amount}
        min="1"
        class="w-full px-2.5 py-2.5 border border-border rounded-md bg-background text-base font-[inherit] focus:outline-none focus:border-primary"
        data-amount-input=""
      />
    </div>

    <!-- Recipients -->
    {#if zap.splits.length > 0}
      <div class="mb-6" data-section="">
        <label class="block font-semibold text-sm mb-2 text-foreground" data-label="">
          Recipients ({zap.splits.length})
        </label>
        <div class="flex flex-col gap-3 max-h-[200px] overflow-y-auto p-2 border border-border rounded-md bg-muted" data-recipients="">
          {#each zap.splits as split}
            <div class="flex items-center gap-3 p-3 bg-background rounded-md" data-recipient="">
              <User.Root {ndk} pubkey={split.pubkey}>
                <User.Avatar class="w-10 h-10 flex-shrink-0" />
                <div class="flex-1 min-w-0" data-recipient-info="">
                  <User.Name class="font-semibold text-sm block mb-1" />
                  <div class="flex items-center gap-1.5 text-sm text-muted-foreground" data-split-amount="">
                    <ZapIcon class="w-3.5 h-3.5 text-primary" />
                    <span>{split.amount}</span>
                    {#if zap.splits.length > 1}
                      <span class="text-muted-foreground">({split.percentage.toFixed(1)}%)</span>
                    {/if}
                  </div>
                </div>
              </User.Root>
            </div>
          {/each}
          </div>
        </div>
      {/if}

    <!-- Comment -->
    <div class="mb-6" data-section="">
      <label class="block font-semibold text-sm mb-2 text-foreground" data-label="">Comment (optional)</label>
      <textarea
        bind:value={zap.comment}
        placeholder="Say something nice..."
        rows="3"
        class="w-full px-2.5 py-2.5 border border-border rounded-md bg-background font-[inherit] text-sm resize-y focus:outline-none focus:border-primary"
        data-comment-input=""
      />
    </div>

    <!-- Error -->
    {#if zap.error}
      <div class="p-3 bg-red-500/10 border border-red-500 rounded-md text-red-500 text-sm mb-4" data-error="">
        {zap.error.message}
      </div>
    {/if}

    <!-- Actions -->
    <div class="flex gap-3 justify-end" data-actions="">
      <button
        class="px-5 py-2.5 rounded-md font-semibold text-sm cursor-pointer transition-all border-none bg-muted text-foreground hover:bg-border"
        onclick={handleCancel}
        data-cancel-btn=""
      >
        Cancel
      </button>
      <button
        class="px-5 py-2.5 rounded-md font-semibold text-sm cursor-pointer transition-all border-none bg-primary text-white flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={handleSend}
        disabled={zap.sending}
        data-send-btn=""
        data-sending={zap.sending ? '' : undefined}
      >
        {#if zap.sending}
          Zapping...
        {:else}
          <ZapIcon class="w-4 h-4" />
          Zap {zap.amount} sats
        {/if}
      </button>
    </div>
  </div>
{/if}
