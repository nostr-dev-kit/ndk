<script lang="ts">
  import type { WalletAPI } from '../lib/useWallet.svelte.js';
  import type { NDKCashuDeposit } from '@nostr-dev-kit/ndk-wallet';
  import QRCode from './QRCode.svelte';

  interface Props {
    wallet: WalletAPI;
    onBack: () => void;
  }

  let { wallet, onBack }: Props = $props();

  let activeTab = $state<'paste' | 'mint'>('mint'); // Default to mint tab
  let tokenInput = $state('');
  let mintAmount = $state('');
  let isProcessing = $state(false);
  let error = $state('');
  let success = $state<{ amount: number } | null>(null);
  let depositInstance = $state<NDKCashuDeposit | null>(null);
  let depositInvoice = $state<string | null>(null);
  let isCheckingPayment = $state(false);

  // Get available mints from wallet
  let availableMints = $derived(wallet.mints || []);
  let selectedMint = $state<string>('');

  // Set default mint when mints become available
  $effect(() => {
    if (availableMints.length > 0 && !selectedMint) {
      selectedMint = availableMints[0].url;
    }
  });

  async function handleReceive() {
    if (!tokenInput.trim()) return;

    isProcessing = true;
    error = '';

    try {
      await wallet.receiveToken(tokenInput.trim());

      // Show success with estimated amount (we don't get it back from receiveToken currently)
      success = { amount: 0 }; // Amount will be reflected in balance
      tokenInput = '';
    } catch (e: any) {
      error = e.message || 'Failed to receive token';
      console.error(e);
    } finally {
      isProcessing = false;
    }
  }

  async function handleMint() {
    const amount = Number(mintAmount);
    if (!amount || amount <= 0) return;

    if (!selectedMint) {
      error = 'No mint selected';
      return;
    }

    isProcessing = true;
    error = '';

    try {
      // Create a real deposit request using the wallet
      const deposit = wallet.deposit(amount, selectedMint);

      if (!deposit) {
        throw new Error('Failed to create deposit request');
      }

      depositInstance = deposit;

      // Listen for deposit completion
      deposit.on('success', (amount) => {
        success = { amount };
        mintAmount = '';
        depositInstance = null;
        depositInvoice = null;
        isCheckingPayment = false;
      });

      deposit.on('error', (err) => {
        error = err.message || 'Deposit failed';
        isCheckingPayment = false;
      });

      // Start the deposit flow
      await deposit.start();

      // Get the lightning invoice
      if (deposit.pr) {
        depositInvoice = deposit.pr;
      }

    } catch (e: any) {
      error = e.message || 'Failed to create mint request';
      console.error(e);
    } finally {
      isProcessing = false;
    }
  }

  async function checkMintQuote() {
    if (!depositInstance) return;

    isCheckingPayment = true;
    error = '';

    try {
      // Check if the deposit has been paid
      await depositInstance.checkStatus();
    } catch (e: any) {
      error = e.message || 'Failed to check payment status';
      console.error(e);
    } finally {
      isCheckingPayment = false;
    }
  }

  function copyInvoice() {
    if (depositInvoice) {
      navigator.clipboard.writeText(depositInvoice);
    }
  }

  function cancelMint() {
    depositInstance = null;
    depositInvoice = null;
    isCheckingPayment = false;
    error = '';
  }

  function reset() {
    success = null;
    error = '';
  }
</script>

<div class="receive-view">
  <div class="view-header">
    <button class="back-button" onclick={onBack}>← Back</button>
    <h2>Receive Ecash</h2>
    <div></div>
  </div>

  {#if success}
    <div class="success-screen">
      <div class="success-icon">✓</div>
      <h3>Received!</h3>
      <p class="success-amount">{new Intl.NumberFormat('en-US').format(success.amount)} sats</p>
      <button class="primary" onclick={() => { reset(); onBack(); }}>
        Done
      </button>
    </div>
  {:else}
    <div class="tabs">
      <button
        class:active={activeTab === 'mint'}
        onclick={() => activeTab = 'mint'}
      >
        Deposit
      </button>
      <button
        class:active={activeTab === 'paste'}
        onclick={() => activeTab = 'paste'}
      >
        Paste Token
      </button>
    </div>

    {#if activeTab === 'paste'}
      <div class="tab-content">
        <div class="form-section">
          <label for="token">Cashu Token</label>
          <textarea
            id="token"
            bind:value={tokenInput}
            placeholder="Paste cashu token here..."
            rows="6"
          ></textarea>
          <p class="hint">Paste a cashu token to redeem it into your wallet</p>
        </div>

        {#if error}
          <div class="error-message">{error}</div>
        {/if}

        <button
          class="primary"
          onclick={handleReceive}
          disabled={!tokenInput.trim() || isProcessing}
        >
          {#if isProcessing}
            Processing...
          {:else}
            Redeem Token
          {/if}
        </button>
      </div>
    {:else}
      <div class="tab-content">
        {#if !depositInstance}
          <div class="form-section">
            <label for="mint">Select Mint</label>
            <select id="mint" bind:value={selectedMint}>
              {#each availableMints as mint}
                <option value={mint.url}>{mint.url}</option>
              {/each}
            </select>
            {#if availableMints.length === 0}
              <p class="hint">No mints configured in your wallet</p>
            {/if}
          </div>

          <div class="form-section">
            <label for="amount">Amount (sats)</label>
            <div class="amount-input-group">
              <input
                id="amount"
                type="number"
                bind:value={mintAmount}
                placeholder="100"
                min="1"
              />
              <span class="amount-unit">sats</span>
            </div>
          </div>

          {#if error}
            <div class="error-message">{error}</div>
          {/if}

          <button
            class="primary"
            onclick={handleMint}
            disabled={!mintAmount || Number(mintAmount) <= 0 || !selectedMint || isProcessing}
          >
            {#if isProcessing}
              Creating Deposit...
            {:else}
              Create Deposit
            {/if}
          </button>
        {:else}
          <div class="quote-display">
            <h4>💳 Payment Request Created</h4>
            <p class="quote-amount">{mintAmount} sats</p>

            {#if depositInvoice}
              <div class="qr-container">
                <QRCode value={depositInvoice.toUpperCase()} size={280} />
              </div>

              <div class="invoice-box">
                <label>Lightning Invoice</label>
                <div class="invoice-text">{depositInvoice}</div>
                <button class="copy-button" onclick={copyInvoice}>
                  📋 Copy Invoice
                </button>
              </div>
            {/if}

            {#if isCheckingPayment}
              <div class="checking-status">
                <div class="spinner"></div>
                <p>Checking payment status...</p>
              </div>
            {:else}
              <div class="quote-actions">
                <button onclick={checkMintQuote} class="primary">
                  Check Status
                </button>
                <button onclick={cancelMint}>
                  Cancel
                </button>
              </div>
            {/if}

            {#if error}
              <div class="error-message">{error}</div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .receive-view {
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

  .tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    padding: 0.25rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .tabs button {
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .tabs button.active {
    background: rgba(249, 115, 22, 0.15);
    color: #f97316;
    font-weight: 600;
  }

  .tab-content {
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

  select {
    width: 100%;
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  select:focus {
    outline: none;
    border-color: rgba(249, 115, 22, 0.5);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }

  select option {
    background: #1a1a1a;
    color: white;
  }

  .hint {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
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

  .testnet-info {
    padding: 1.5rem;
    background: rgba(139, 92, 246, 0.08);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 12px;
  }

  .testnet-info h4 {
    margin: 0 0 0.5rem 0;
    color: #a78bfa;
    font-size: 1rem;
  }

  .testnet-info p {
    margin: 0.5rem 0 0 0;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .testnet-info .warning {
    color: rgba(251, 191, 36, 0.9);
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    color: #f87171;
    font-size: 0.875rem;
  }

  .success-screen {
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

  .success-amount {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .success-screen button {
    width: 100%;
    max-width: 200px;
  }

  .quote-display {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem 0;
  }

  .quote-display h4 {
    text-align: center;
    margin: 0;
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .quote-amount {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .qr-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .invoice-box {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1rem;
  }

  .invoice-box label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.6);
  }

  .invoice-text {
    font-family: monospace;
    font-size: 0.75rem;
    word-break: break-all;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }

  .copy-button {
    width: 100%;
  }

  .checking-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem 1rem;
    background: rgba(249, 115, 22, 0.05);
    border: 1px solid rgba(249, 115, 22, 0.2);
    border-radius: 12px;
  }

  .checking-status p {
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
  }

  .auto-settle {
    font-size: 0.875rem;
    color: rgba(249, 115, 22, 0.9);
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(249, 115, 22, 0.2);
    border-top-color: #f97316;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .quote-actions {
    display: flex;
    gap: 0.75rem;
  }

  .quote-actions button {
    flex: 1;
  }
</style>
