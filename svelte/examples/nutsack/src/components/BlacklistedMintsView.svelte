<script lang="ts">
  import type { WalletAPI } from '../lib/useWallet.svelte.js';

  interface Props {
    wallet: WalletAPI;
    onBack: () => void;
  }

  let { wallet, onBack }: Props = $props();

  // TODO: blacklistedMints not yet exposed in WalletAPI
  let blacklistedMints = $derived([]);
  let availableMints = $derived(wallet.mints);

  let showAddSheet = $state(false);
  let manualMintUrl = $state('');
  let error = $state('');
  let isBlocking = $state(false);

  let availableMintsToBlock = $derived.by(() => {
    return availableMints.filter(url => !blacklistedMints.has(url));
  });

  async function blockMint(mintUrl: string) {
    isBlocking = true;
    error = '';

    try {
      // TODO: blacklistMint not yet exposed in WalletAPI
      console.warn('Blacklist mint not implemented:', mintUrl);
      manualMintUrl = '';
      showAddSheet = false;
    } catch (e: any) {
      error = e.message || 'Failed to blacklist mint';
    } finally {
      isBlocking = false;
    }
  }

  async function unblockMint(mintUrl: string) {
    error = '';

    try {
      // TODO: unblacklistMint not yet exposed in WalletAPI
      console.warn('Unblacklist mint not implemented:', mintUrl);
    } catch (e: any) {
      error = e.message || 'Failed to remove mint from blacklist';
    }
  }

  function formatMintName(url: string): string {
    try {
      const u = new URL(url);
      return u.host.replace('www.', '').replace('mint.', '');
    } catch {
      return url;
    }
  }
</script>

<div class="blacklist-view">
  <div class="view-header">
    <button class="back-button" onclick={onBack}>← Back</button>
    <h2>Blocked Mints</h2>
    <div></div>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <!-- Info -->
  <div class="info-card">
    <p>
      Blocked mints will not be used or displayed in your wallet.
      This setting is stored as a NIP-51 list (kind 10020).
    </p>
  </div>

  <!-- Blacklisted Mints -->
  {#if blacklistedMints.size === 0}
    <div class="empty-state">
      <div class="empty-icon">🚫</div>
      <p>No mints blocked</p>
      <p class="hint">Add mints to your blacklist to prevent using them</p>
    </div>
  {:else}
    <div class="mint-list">
      <h3>Blocked Mints ({blacklistedMints.size})</h3>
      {#each Array.from(blacklistedMints).sort() as mintUrl}
        <div class="mint-item blocked">
          <div class="mint-icon">🔴</div>
          <div class="mint-info">
            <div class="mint-name">{formatMintName(mintUrl)}</div>
            <div class="mint-url">{mintUrl}</div>
          </div>
          <button
            class="action-btn unblock"
            onclick={() => unblockMint(mintUrl)}
          >
            Unblock
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Add to Blacklist Button -->
  <button
    class="add-button"
    onclick={() => showAddSheet = true}
  >
    + Add to Blacklist
  </button>
</div>

<!-- Add Mint Sheet -->
{#if showAddSheet}
  <div class="modal-overlay" onclick={() => showAddSheet = false}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3>Add to Blacklist</h3>
        <button class="close-btn" onclick={() => showAddSheet = false}>✕</button>
      </div>

      <div class="modal-body">
        {#if availableMintsToBlock.length > 0}
          <div class="section">
            <h4>Active Mints</h4>
            <div class="mint-list">
              {#each availableMintsToBlock as mintUrl}
                <div class="mint-item">
                  <div class="mint-info">
                    <div class="mint-name">{formatMintName(mintUrl)}</div>
                    <div class="mint-url">{mintUrl}</div>
                  </div>
                  <button
                    class="action-btn block"
                    onclick={() => blockMint(mintUrl)}
                    disabled={isBlocking}
                  >
                    Block
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <div class="section">
          <h4>Manual Entry</h4>
          <input
            type="url"
            bind:value={manualMintUrl}
            placeholder="https://mint.example.com"
          />
          <button
            class="action-btn block full-width"
            onclick={() => manualMintUrl && blockMint(manualMintUrl)}
            disabled={!manualMintUrl || isBlocking}
          >
            {isBlocking ? 'Blocking...' : 'Add to Blacklist'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .blacklist-view {
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

  .empty-state {
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

  .empty-state p {
    margin: 0.25rem 0;
    color: rgba(255, 255, 255, 0.6);
  }

  .empty-state .hint {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .mint-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .mint-list h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .mint-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
  }

  .mint-item.blocked {
    border-color: rgba(239, 68, 68, 0.3);
  }

  .mint-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .mint-info {
    flex: 1;
    min-width: 0;
  }

  .mint-name {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .mint-url {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .action-btn {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .action-btn.unblock {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #10b981;
  }

  .action-btn.unblock:hover {
    background: rgba(16, 185, 129, 0.2);
  }

  .action-btn.block {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
  }

  .action-btn.block:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.2);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .add-button {
    padding: 1rem;
    background: rgba(249, 115, 22, 0.1);
    border: 1px solid rgba(249, 115, 22, 0.3);
    border-radius: 12px;
    font-weight: 600;
    color: #f97316;
    transition: all 0.2s;
  }

  .add-button:hover {
    background: rgba(249, 115, 22, 0.2);
    transform: translateY(-1px);
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    width: 100%;
    max-width: 500px;
    background: rgba(20, 20, 20, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .modal-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  input[type="url"] {
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }

  input[type="url"]:focus {
    outline: none;
    border-color: rgba(249, 115, 22, 0.5);
  }

  .full-width {
    width: 100%;
  }
</style>
