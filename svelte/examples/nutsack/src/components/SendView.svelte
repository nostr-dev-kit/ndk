<script lang="ts">
  import type { WalletAPI } from '../lib/useWallet.svelte.js';

  interface Props {
    wallet: WalletAPI;
    onBack: () => void;
  }

  let { wallet, onBack }: Props = $props();

  let amount = $state('');
  let memo = $state('');
  let recipient = $state('');
  let isSending = $state(false);
  let token = $state<string | null>(null);
  let error = $state('');

  const balance = $derived(wallet.balance || 0);
  const amountNum = $derived(Number(amount) || 0);
  const canSend = $derived(amountNum > 0 && amountNum <= balance && !isSending);

  function formatBalance(sats: number): string {
    return new Intl.NumberFormat('en-US').format(sats);
  }

  async function handleSend() {
    if (!canSend) return;

    isSending = true;
    error = '';

    try {
      // Use wallet to generate token
      const result = await wallet.send(amountNum, memo || undefined);
      token = result.token;
    } catch (e: any) {
      error = e.message || 'Failed to send';
      console.error(e);
    } finally {
      isSending = false;
    }
  }

  function copyToken() {
    if (token) {
      navigator.clipboard.writeText(token);
    }
  }

  function reset() {
    amount = '';
    memo = '';
    recipient = '';
    token = null;
    error = '';
  }
</script>

<div class="send-view">
  <div class="view-header">
    <button class="back-button" onclick={onBack}>← Back</button>
    <h2>Send Ecash</h2>
    <div></div>
  </div>

  {#if !token}
    <div class="send-form">
      <div class="form-section">
        <label for="amount">Amount</label>
        <div class="amount-input-group">
          <input
            id="amount"
            type="number"
            bind:value={amount}
            placeholder="0"
            min="1"
            max={balance}
          />
          <span class="amount-unit">sats</span>
        </div>
        <div class="balance-info">
          Available: {formatBalance(balance)} sats
        </div>
      </div>

      <div class="form-section">
        <label for="memo">Memo (optional)</label>
        <textarea
          id="memo"
          bind:value={memo}
          placeholder="What's this for?"
        ></textarea>
      </div>

      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <button
        class="primary"
        onclick={handleSend}
        disabled={!canSend}
      >
        {#if isSending}
          Generating Token...
        {:else}
          Generate Token
        {/if}
      </button>
    </div>
  {:else}
    <div class="token-result">
      <div class="success-icon">✓</div>
      <h3>Token Generated!</h3>
      <p class="success-message">{formatBalance(amountNum)} sats ready to send</p>

      <div class="token-display">
        <div class="token-text">{token}</div>
        <button class="copy-button" onclick={copyToken}>
          📋 Copy
        </button>
      </div>

      {#if memo}
        <div class="memo-display">
          <strong>Memo:</strong> {memo}
        </div>
      {/if}

      <div class="actions">
        <button onclick={reset}>Send Another</button>
        <button class="primary" onclick={onBack}>Done</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .send-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .view-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 1rem;
  }

  .back-button {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  h2 {
    text-align: center;
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .send-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .amount-input-group {
    position: relative;
    display: flex;
    align-items: center;
  }

  .amount-input-group input {
    padding-right: 60px;
  }

  .amount-unit {
    position: absolute;
    right: 1rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
    pointer-events: none;
  }

  .balance-info {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    color: #f87171;
    font-size: 0.875rem;
  }

  .token-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem 1rem;
  }

  .success-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: white;
  }

  h3 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
  }

  .success-message {
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
  }

  .token-display {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1rem;
  }

  .token-text {
    font-family: monospace;
    font-size: 0.75rem;
    word-break: break-all;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  }

  .copy-button {
    width: 100%;
  }

  .memo-display {
    width: 100%;
    padding: 1rem;
    background: rgba(249, 115, 22, 0.05);
    border: 1px solid rgba(249, 115, 22, 0.2);
    border-radius: 8px;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  .actions button {
    flex: 1;
  }
</style>
