<script lang="ts">
  import type { WalletAPI } from '../lib/useWallet.svelte.js';
  import { wallet as walletStore } from '../lib/ndk.js';

  interface Props {
    wallet: WalletAPI;
    onBack: () => void;
  }

  let { wallet, onBack }: Props = $props();

  const mints = $derived(wallet.mints || []);

  let p2pkPubkey = $state('');
  let error = $state('');

  async function loadP2pk() {
    try {
      p2pkPubkey = await walletStore.getP2PKPubkey();
    } catch (e: any) {
      error = e.message || 'Failed to load P2PK pubkey';
      console.error('Failed to load P2PK pubkey', e);
    }
  }

  $effect(() => {
    loadP2pk();
  });
</script>

<div class="nutzap-settings">
  <div class="view-header">
    <button class="back-button" onclick={onBack}>← Back</button>
    <h2>Zap Settings</h2>
    <div></div>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <!-- Info -->
  <div class="info-card">
    <p>
      Your wallet automatically publishes zap reception information (NIP-61) so others can send you nutzaps.
      Wallets automatically discover this information - you don't need to share anything manually.
    </p>
  </div>

  <!-- P2PK Public Key (Read-only info) -->
  <div class="section">
    <h3>Your Zap Receiving Key</h3>
    <div class="card">
      <div class="info-row">
        <span class="label">P2PK Public Key</span>
      </div>
      <div class="pubkey-display">
        {p2pkPubkey || 'Loading...'}
      </div>
      <div class="info-footer">
        Wallets use this automatically when sending you nutzaps
      </div>
    </div>
  </div>

  <!-- Accepted Mints -->
  <div class="section">
    <h3>Accepted Mints</h3>

    {#if mints.length === 0}
      <div class="empty-state">
        <p>No mints configured</p>
        <p class="hint">Add mints to receive nutzaps</p>
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
          </div>
        {/each}
      </div>
      <div class="mint-footer">
        People can only send you nutzaps using these mints
      </div>
    {/if}
  </div>
</div>

<style>
  .nutzap-settings {
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

  .section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section h3 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .card {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .info-row {
    margin-bottom: 0.5rem;
  }

  .label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }

  .pubkey-display {
    font-family: monospace;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    word-break: break-all;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }

  .info-footer {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
  }

  .empty-state {
    padding: 2rem 1rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: 12px;
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

  .mint-footer {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 0.5rem;
    font-style: italic;
  }
</style>
