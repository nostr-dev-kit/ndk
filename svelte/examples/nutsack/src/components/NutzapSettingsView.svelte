<script lang="ts">
  import type { WalletAPI } from '../lib/useWallet.svelte.js';
  import { NDKCashuMintList } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ndk from '../lib/ndk.js';

  interface Props {
    wallet: WalletAPI;
    onBack: () => void;
  }

  let { wallet, onBack }: Props = $props();

  // Local state for pending changes
  let pendingMints = $state<string[]>([]);
  let pendingRelays = $state<string[]>([]);

  // Initialize local state from wallet
  $effect(() => {
    pendingMints = (wallet.mints || []).map(m => m.url);
    pendingRelays = [...(wallet.relays || [])];
  });

  const mints = $derived(wallet.mints || []);
  const relays = $derived(wallet.relays || []);

  // Check if there are unsaved changes
  const hasChanges = $derived(() => {
    const currentMints = (wallet.mints || []).map(m => m.url).sort().join(',');
    const localMints = pendingMints.slice().sort().join(',');
    const currentRelays = (wallet.relays || []).sort().join(',');
    const localRelays = pendingRelays.slice().sort().join(',');

    return currentMints !== localMints || currentRelays !== localRelays;
  });

  let p2pkPubkey = $state('');
  let newMintUrl = $state('');
  let newRelayUrl = $state('');
  let error = $state('');
  let successMessage = $state('');
  let isSaving = $state(false);
  let activeTab = $state<'mints' | 'relays'>('mints');

  async function loadP2pk() {
    try {
      p2pkPubkey = await wallet.getP2PKPubkey();
    } catch (e: any) {
      error = e.message || 'Failed to load P2PK pubkey';
      console.error('Failed to load P2PK pubkey', e);
    }
  }

  $effect(() => {
    loadP2pk();
  });

  function addMint() {
    if (!newMintUrl.trim()) return;

    const url = newMintUrl.trim();
    if (pendingMints.includes(url)) {
      error = 'Mint already in list';
      return;
    }

    error = '';
    pendingMints = [...pendingMints, url];
    newMintUrl = '';
  }

  function removeMint(mintUrl: string) {
    if (confirm(`Remove mint ${mintUrl}?`)) {
      pendingMints = pendingMints.filter(m => m !== mintUrl);
    }
  }

  function addRelay() {
    if (!newRelayUrl.trim()) return;

    const url = newRelayUrl.trim();
    if (pendingRelays.includes(url)) {
      error = 'Relay already in list';
      return;
    }

    error = '';
    pendingRelays = [...pendingRelays, url];
    newRelayUrl = '';
  }

  function removeRelay(relayUrl: string) {
    if (confirm(`Remove relay ${relayUrl}?`)) {
      pendingRelays = pendingRelays.filter(r => r !== relayUrl);
    }
  }

  function resetChanges() {
    pendingMints = (wallet.mints || []).map(m => m.url);
    pendingRelays = [...(wallet.relays || [])];
    error = '';
    successMessage = '';
  }

  async function saveChanges() {
    isSaving = true;
    error = '';
    successMessage = '';

    try {
      // Create mint list event (kind 10019)
      const mintList = new NDKCashuMintList(ndk);
      mintList.mints = [...pendingMints];
      mintList.relays = [...pendingRelays];
      mintList.p2pk = p2pkPubkey;

      // Publish the mint list event
      await mintList.publish();

      successMessage = 'Zap settings saved successfully!';
      setTimeout(() => successMessage = '', 3000);
    } catch (e: any) {
      error = e.message || 'Failed to save zap settings';
      console.error(e);
    } finally {
      isSaving = false;
    }
  }
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

  {#if successMessage}
    <div class="success-message">{successMessage}</div>
  {/if}

  <!-- Info -->
  <div class="info-card">
    <p>
      Configure which mints and relays you accept for receiving nutzaps (NIP-61).
      This information is published so others can send you nutzaps.
    </p>
  </div>

  {#if hasChanges()}
    <div class="unsaved-changes-banner">
      <div class="banner-content">
        <span class="banner-icon">⚠️</span>
        <span>You have unsaved changes</span>
      </div>
      <div class="banner-actions">
        <button class="cancel-button" onclick={resetChanges} disabled={isSaving}>
          Cancel
        </button>
        <button class="save-button" onclick={saveChanges} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  {/if}

  <!-- Tabs -->
  <div class="tabs">
    <button
      class="tab"
      class:active={activeTab === 'mints'}
      onclick={() => activeTab = 'mints'}
    >
      <span class="tab-icon">🏦</span>
      Mints
    </button>
    <button
      class="tab"
      class:active={activeTab === 'relays'}
      onclick={() => activeTab = 'relays'}
    >
      <span class="tab-icon">🔗</span>
      Relays
    </button>
  </div>

  {#if activeTab === 'mints'}
    <!-- Mints Tab -->
    <div class="tab-info">
      <p>
        Configure which mints you accept for receiving nutzaps.
        Senders will use these mints when sending you ecash.
      </p>
    </div>

    <!-- Add Mint Form -->
    <div class="add-form">
      <input
        type="url"
        bind:value={newMintUrl}
        placeholder="https://mint.example.com"
      />
      <button
        class="primary"
        onclick={addMint}
        disabled={!newMintUrl.trim()}
      >
        Add
      </button>
    </div>

    <!-- Mint List -->
    {#if pendingMints.length === 0}
      <div class="empty-state">
        <div class="empty-icon">🏦</div>
        <p>No mints configured</p>
        <p class="hint">Add mints to accept nutzaps</p>
      </div>
    {:else}
      <div class="item-list">
        {#each pendingMints as mintUrl}
          {@const mintData = mints.find(m => m.url === mintUrl)}
          <div class="item">
            <div class="item-icon">🏦</div>
            <div class="item-info">
              <div class="item-url">{mintUrl}</div>
              {#if mintData?.balance}
                <div class="item-meta">
                  {new Intl.NumberFormat('en-US').format(mintData.balance)} sats
                </div>
              {/if}
            </div>
            <button class="remove-button" onclick={() => removeMint(mintUrl)}>
              🗑️
            </button>
          </div>
        {/each}
      </div>
    {/if}
  {:else}
    <!-- Relays Tab -->
    <div class="tab-info">
      <p>
        Configure which relays are advertised for nutzap reception.
        These relays tell senders where to publish nutzap events.
      </p>
    </div>

    <!-- Add Relay Form -->
    <div class="add-form">
      <input
        type="url"
        bind:value={newRelayUrl}
        placeholder="wss://relay.example.com"
      />
      <button
        class="primary"
        onclick={addRelay}
        disabled={!newRelayUrl.trim()}
      >
        Add
      </button>
    </div>

    <!-- Relay List -->
    {#if pendingRelays.length === 0}
      <div class="empty-state">
        <div class="empty-icon">🔗</div>
        <p>No relays configured</p>
        <p class="hint">Using your general relay list (kind 10002) as fallback</p>
      </div>
    {:else}
      <div class="item-list">
        {#each pendingRelays as relay}
          <div class="item">
            <div class="item-icon">🔗</div>
            <div class="item-info">
              <div class="item-url">{relay}</div>
            </div>
            <button class="remove-button" onclick={() => removeRelay(relay)}>
              🗑️
            </button>
          </div>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- P2PK Public Key Section (below tabs) -->
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

  .success-message {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    color: #4ade80;
    font-size: 0.875rem;
  }

  .unsaved-changes-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    background: rgba(249, 115, 22, 0.1);
    border: 1px solid rgba(249, 115, 22, 0.3);
    border-radius: 8px;
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }

  .banner-icon {
    font-size: 1.125rem;
  }

  .banner-actions {
    display: flex;
    gap: 0.5rem;
  }

  .cancel-button,
  .save-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-button {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .cancel-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  .save-button {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
  }

  .save-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  .cancel-button:disabled,
  .save-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab:hover {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
  }

  .tab.active {
    background: rgba(249, 115, 22, 0.15);
    border-color: rgba(249, 115, 22, 0.3);
    color: rgba(255, 255, 255, 0.95);
  }

  .tab-icon {
    font-size: 1.125rem;
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

  .tab-info {
    padding: 1rem;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
  }

  .tab-info p {
    margin: 0;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  }

  .add-form {
    display: flex;
    gap: 0.75rem;
  }

  .add-form input {
    flex: 1;
    padding: 0.8rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 0.875rem;
  }

  .add-form input:focus {
    outline: none;
    border-color: rgba(249, 115, 22, 0.5);
  }

  .add-form button {
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

  .add-form button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  .add-form button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

  .item-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    transition: all 0.2s;
  }

  .item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .item-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .item-info {
    flex: 1;
    min-width: 0;
  }

  .item-url {
    font-size: 0.9375rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-meta {
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
</style>
