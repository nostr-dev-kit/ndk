<script lang="ts">
  import type { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createZapSendAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '../../utils/cn.js';
  import User from '../../ui/user';
  import ZapIcon from '../../icons/zap.svelte';

  interface Props {
    ndk?: NDKSvelte;
    event?: NDKEvent;
    user?: NDKUser;
    open?: boolean;
    class?: string;
  }

  let {
    ndk: ndkProp,
    event,
    user,
    open = $bindable(false),
    class: className = ''
  }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ndkContext;
  const target = $derived(event || user);

  const zap = $derived(
    target && open ? createZapSendAction(() => ({ target }), ndk) : null
  );

  const presets = [21, 100, 1000, 5000, 10000];

  async function handleSend() {
    if (!zap) return;

    try {
      await zap.send();
      open = false;
      zap.amount = 1000;
      zap.comment = '';
    } catch (error) {
      console.error('Failed to send zap:', error);
    }
  }

  function handleClose() {
    open = false;
    if (zap) {
      zap.amount = 1000;
      zap.comment = '';
    }
  }
</script>

{#if open && zap}
  <div class={cn('zap-send-classic-overlay', className)} data-zap-send-classic-overlay="">
    <div class="zap-send-classic" data-zap-send-classic="">
      <!-- Header -->
      <div class="header" data-header="">
        <h2>Send a Zap</h2>
        <button
          class="close-btn"
          onclick={handleClose}
          data-close-btn=""
        >
          ×
        </button>
      </div>

      <!-- Amount Selection -->
      <div class="section" data-section="">
        <label class="label" data-label="">Amount</label>
        <div class="amount-presets" data-amount-presets="">
          {#each presets as preset}
            <button
              class="preset-btn"
              class:active={zap.amount === preset}
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
          class="amount-input"
          data-amount-input=""
        />
      </div>

      <!-- Recipients -->
      {#if zap.splits.length > 0}
        <div class="section" data-section="">
          <label class="label" data-label="">
            Recipients ({zap.splits.length})
          </label>
          <div class="recipients" data-recipients="">
            {#each zap.splits as split}
              <div class="recipient" data-recipient="">
                <User.Root {ndk} pubkey={split.pubkey}>
                  <User.Avatar class="avatar" />
                  <div class="recipient-info" data-recipient-info="">
                    <User.Name class="name" />
                    <div class="split-amount" data-split-amount="">
                      <ZapIcon class="zap-icon" />
                      <span>{split.amount}</span>
                      <span class="percentage">({split.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                </User.Root>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Comment -->
      <div class="section" data-section="">
        <label class="label" data-label="">Comment (optional)</label>
        <textarea
          bind:value={zap.comment}
          placeholder="Say something nice..."
          rows="3"
          class="comment-input"
          data-comment-input=""
        />
      </div>

      <!-- Error -->
      {#if zap.error}
        <div class="error" data-error="">
          {zap.error.message}
        </div>
      {/if}

      <!-- Actions -->
      <div class="actions" data-actions="">
        <button
          class="cancel-btn"
          onclick={handleClose}
          data-cancel-btn=""
        >
          Cancel
        </button>
        <button
          class="send-btn"
          onclick={handleSend}
          disabled={zap.sending}
          data-send-btn=""
          data-sending={zap.sending ? '' : undefined}
        >
          {#if zap.sending}
            Zapping...
          {:else}
            <ZapIcon class="btn-icon" />
            Zap {zap.amount} sats
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .zap-send-classic-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .zap-send-classic {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    max-width: 500px;
    width: 100%;
    padding: 1.5rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    color: var(--muted-foreground);
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: var(--muted);
    color: var(--foreground);
  }

  .section {
    margin-bottom: 1.5rem;
  }

  .label {
    display: block;
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    color: var(--foreground);
  }

  .amount-presets {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
  }

  .preset-btn {
    flex: 1;
    min-width: 60px;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .preset-btn:hover {
    background: var(--muted);
    border-color: var(--primary);
  }

  .preset-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .amount-input {
    width: 100%;
    padding: 0.625rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    font-size: 1rem;
    font-family: inherit;
  }

  .amount-input:focus {
    outline: none;
    border-color: var(--primary);
  }

  .recipients {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 200px;
    overflow-y: auto;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--muted);
  }

  .recipient {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--background);
    border-radius: 0.375rem;
  }

  .recipient :global(.avatar) {
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
  }

  .recipient-info {
    flex: 1;
    min-width: 0;
  }

  .recipient-info :global(.name) {
    font-weight: 600;
    font-size: 0.875rem;
    display: block;
    margin-bottom: 0.25rem;
  }

  .split-amount {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  .split-amount :global(.zap-icon) {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--primary);
  }

  .percentage {
    color: var(--muted-foreground);
  }

  .comment-input {
    width: 100%;
    padding: 0.625rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    font-family: inherit;
    font-size: 0.875rem;
    resize: vertical;
  }

  .comment-input:focus {
    outline: none;
    border-color: var(--primary);
  }

  .error {
    padding: 0.75rem;
    background: color-mix(in srgb, red 10%, transparent);
    border: 1px solid red;
    border-radius: 0.375rem;
    color: red;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .cancel-btn,
  .send-btn {
    padding: 0.625rem 1.25rem;
    border-radius: 0.375rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .cancel-btn {
    background: var(--muted);
    color: var(--foreground);
  }

  .cancel-btn:hover {
    background: var(--border);
  }

  .send-btn {
    background: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .send-btn:hover:not(:disabled) {
    opacity: 0.9;
  }

  .send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .send-btn :global(.btn-icon) {
    width: 1rem;
    height: 1rem;
  }
</style>
