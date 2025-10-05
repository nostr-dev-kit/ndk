<script lang="ts">
  import type { WalletAPI } from '../lib/useWallet.svelte.js';

  interface Props {
    wallet: WalletAPI;
    onBack: () => void;
  }

  let { wallet, onBack }: Props = $props();

  const mints = $derived(wallet.mints || []);

  let newMintUrl = $state('');
  let isAddingMint = $state(false);
  let error = $state('');

  async function addMint() {
    if (!newMintUrl.trim()) return;

    isAddingMint = true;
    error = '';

    try {
      await wallet.addMint(newMintUrl.trim());
      newMintUrl = '';
    } catch (e: any) {
      error = e.message || 'Failed to add mint';
      console.error(e);
    } finally {
      isAddingMint = false;
    }
  }

  async function removeMint(mintUrl: string) {
    if (confirm(`Remove mint ${mintUrl}?`)) {
      try {
        await wallet.removeMint(mintUrl);
      } catch (e: any) {
        error = e.message || 'Failed to remove mint';
        console.error(e);
      }
    }
  }
</script>

<div class="mint-management">
  <div class="view-header">
    <button class="back-button" onclick={onBack}>← Back</button>
    <h2>Mints</h2>
    <div></div>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <!-- Info -->
  <div class="info-card">
    <p>
      Mints store your ecash tokens. You can use multiple mints for better privacy and redundancy.
    </p>
  </div>

  <!-- Add Mint Form -->
  <div class="add-mint-form">
    <input
      type="url"
      bind:value={newMintUrl}
      placeholder="https://mint.example.com"
    />
    <button
      class="primary"
      onclick={addMint}
      disabled={!newMintUrl.trim() || isAddingMint}
    >
      {isAddingMint ? 'Adding...' : 'Add'}
    </button>
  </div>

  <!-- Mint List -->
  {#if mints.length === 0}
    <div class="empty-mints">
      <div class="empty-icon">🏦</div>
      <p>No mints configured</p>
      <p class="hint">Add a mint URL to start using your wallet</p>
    </div>
  {:else}
    <div class="mint-list">
      {#each mints as mint}
        <div class="mint-item">
          <div class="mint-icon">🏦</div>
          <div class="mint-info">
            <div class="mint-url">{mint.url}</div>
            {#if mint.balance}
              <div class="mint-balance">
                {new Intl.NumberFormat('en-US').format(mint.balance)} sats
              </div>
            {/if}
          </div>
          <button class="remove-button" onclick={() => removeMint(mint.url)}>
            🗑️
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .mint-management {
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

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    color: #f87171;
    font-size: 0.875rem;
  }

  .info-card {
    padding: 1rem;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
  }

  .info-card p {
    margin: 0;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  }

  .add-mint-form {
    display: flex;
    gap: 0.75rem;
  }

  .add-mint-form input {
    flex: 1;
    padding: 0.8rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 0.875rem;
  }

  .add-mint-form input:focus {
    outline: none;
    border-color: rgba(249, 115, 22, 0.5);
  }

  .add-mint-form button {
    padding: 0.8em 1.5em;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-mint-form button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  .add-mint-form button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .empty-mints {
    padding: 3rem 1rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-mints p {
    margin: 0.25rem 0;
    color: rgba(255, 255, 255, 0.6);
  }

  .empty-mints .hint {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .mint-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mint-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    transition: all 0.2s;
  }

  .mint-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .mint-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .mint-info {
    flex: 1;
    min-width: 0;
  }

  .mint-url {
    font-size: 0.9375rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mint-balance {
    font-size: 0.8125rem;
    color: rgba(249, 115, 22, 0.9);
    margin-top: 0.25rem;
  }

  .remove-button {
    width: 36px;
    height: 36px;
    padding: 0;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    font-size: 1.125rem;
    flex-shrink: 0;
    cursor: pointer;
    transition: all 0.2s;
  }

  .remove-button:hover {
    background: rgba(239, 68, 68, 0.2);
    transform: scale(1.05);
  }
</style>
