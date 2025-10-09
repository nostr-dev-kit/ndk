<script lang="ts">
  import { onDestroy } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import type { WalletAPI } from '../lib/useWallet.svelte.js';
  import { NDKRelaySet } from '@nostr-dev-kit/ndk';
  import { NDKCashuWallet, createMintDiscoveryStore } from '@nostr-dev-kit/wallet';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { GetInfoResponse } from '@cashu/cashu-ts';
  import MintSelector from './MintSelector.svelte';

  interface Props {
    wallet: WalletAPI;
    ndk: NDKSvelte;
    onBack: () => void;
  }

  let { wallet, ndk, onBack }: Props = $props();

  // Local state for pending changes
  let pendingMints = $state<string[]>([]);
  let pendingRelays = $state<string[]>([]);

  // Browse mode
  let showBrowse = $state(false);
  let selectedBrowseMints = $state(new Set<string>());

  // Mint discovery
  const mintStore = createMintDiscoveryStore(ndk, { network: 'mainnet', timeout: 0 });
  let discoveredMints = $state<any[]>([]);

  // Subscribe to the Zustand store
  $effect(() => {
    const unsubscribe = mintStore.subscribe((state) => {
      discoveredMints = state.mints;
    });
    return unsubscribe;
  });

  // Cleanup on destroy
  onDestroy(() => {
    mintStore.getState().stop();
  });

  // Initialize local state from wallet
  $effect(() => {
    pendingMints = (wallet.mints || []).map(m => m.url);
    pendingRelays = [...(wallet.relays || [])];
  });

  const mints = $derived(wallet.mints || []);
  const relays = $derived(wallet.relays || []);

  // Check if there are unsaved changes
  const hasChanges = $derived.by(() => {
    const currentMints = (wallet.mints || []).map(m => m.url).sort().join(',');
    const localMints = pendingMints.slice().sort().join(',');
    const currentRelays = (wallet.relays || []).sort().join(',');
    const localRelays = pendingRelays.slice().sort().join(',');

    return currentMints !== localMints || currentRelays !== localRelays;
  });

  let newMintUrl = $state('');
  let newRelayUrl = $state('');
  let error = $state('');
  let successMessage = $state('');
  let isSaving = $state(false);
  let activeTab = $state<'mints' | 'relays'>('mints');
  let mintInfoMap = $state(new SvelteMap<string, GetInfoResponse>());

  // Load mint info for pending mints
  $effect(() => {
    const walletStore = ndk.$wallet;
    const w = walletStore.wallet;

    if (!(w instanceof NDKCashuWallet)) return;

    pendingMints.forEach(async (url) => {
      if (!mintInfoMap.has(url)) {
        try {
          const info = await w.getMintInfo(url);
          if (info) {
            mintInfoMap.set(url, info);
          }
        } catch (e) {
          console.error('Failed to load mint info for', url, e);
        }
      }
    });
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

  function toggleBrowse() {
    showBrowse = !showBrowse;
    if (showBrowse) {
      // Pre-select already added mints
      selectedBrowseMints = new Set(pendingMints);
    }
  }

  function addSelectedMints() {
    // Add selected mints that aren't already in the list
    const newMints = Array.from(selectedBrowseMints).filter(url => !pendingMints.includes(url));
    if (newMints.length > 0) {
      pendingMints = [...pendingMints, ...newMints];
    }
    showBrowse = false;
    selectedBrowseMints = new Set();
  }

  async function saveChanges() {
    isSaving = true;
    error = '';
    successMessage = '';

    try {
      const walletStore = ndk.$wallet;
      const w = walletStore.wallet;

      if (!(w instanceof NDKCashuWallet)) {
        throw new Error('No wallet available');
      }

      // Update mints
      w.mints = [...pendingMints];

      // Update relays
      if (pendingRelays.length > 0) {
        w.relaySet = NDKRelaySet.fromRelayUrls(pendingRelays, ndk);
      } else {
        w.relaySet = undefined;
      }

      // Publish the wallet event (kind 17375)
      await w.publish();

      successMessage = 'Configuration saved successfully!';
      setTimeout(() => successMessage = '', 3000);
    } catch (e: any) {
      error = e.message || 'Failed to save configuration';
      console.error(e);
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="wallet-config">
  <div class="view-header">
    <h2>Wallet Configuration</h2>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if successMessage}
    <div class="success-message">{successMessage}</div>
  {/if}

  {#if hasChanges}
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
    {#if showBrowse}
      <!-- Browse Mints View -->
      <div class="browse-view">
        <h3 class="browse-title">Browse Recommended Mints</h3>

        <MintSelector {discoveredMints} bind:selectedMints={selectedBrowseMints} {ndk} />

        <div class="browse-actions">
          <button class="button-secondary" onclick={toggleBrowse}>
            Cancel
          </button>
          <button class="button-primary" onclick={addSelectedMints}>
            Add {selectedBrowseMints.size > 0 ? `${selectedBrowseMints.size} ` : ''}Selected Mint{selectedBrowseMints.size === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    {:else}
      <!-- My Mints View -->
      <div class="info-card">
        <p>
          Mints store your ecash tokens. You can use multiple mints for better privacy and redundancy.
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
        <button
          class="button-browse"
          onclick={toggleBrowse}
        >
          🔍 Browse
        </button>
      </div>
    {/if}

    <!-- Mint List -->
    {#if !showBrowse}
      {#if pendingMints.length === 0}
        <div class="empty-state">
          <div class="empty-icon">🏦</div>
          <p>No mints configured</p>
          <p class="hint">Add a mint URL to start using your wallet</p>
        </div>
      {:else}
        <div class="item-list">
        {#each pendingMints as mintUrl}
          {@const mintData = mints.find(m => m.url === mintUrl)}
          {@const mintInfo = mintInfoMap.get(mintUrl)}
          <div class="item">
            <div class="item-icon">🏦</div>
            <div class="item-info">
              {#if mintInfo?.name}
                <div class="item-name">{mintInfo.name}</div>
                <div class="item-url secondary">{mintUrl}</div>
              {:else}
                <div class="item-url">{mintUrl}</div>
              {/if}
              {#if mintInfo?.description}
                <div class="item-description">{mintInfo.description}</div>
              {/if}
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
    {/if}
  {:else}
    <!-- Relays Tab -->
    <div class="info-card">
      <p>
        Relays are used to query and publish your wallet events (kinds 7374, 7375, 7376).
        These relays are stored in your wallet event and used instead of your general relay list.
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
        <p>No wallet relays configured</p>
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
</div>

<style>
  .wallet-config {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .view-header {
    margin-bottom: 0.5rem;
  }

  h2 {
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

  .button-browse {
    padding: 0.8em 1.5em;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 8px;
    color: #10b981;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .button-browse:hover {
    background: rgba(16, 185, 129, 0.25);
    border-color: rgba(16, 185, 129, 0.5);
    transform: translateY(-1px);
  }

  .browse-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .browse-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .browse-actions {
    display: flex;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .button-primary {
    flex: 1;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
  }

  .button-secondary {
    flex: 1;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
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

  .item-name {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 0.125rem;
  }

  .item-url {
    font-size: 0.9375rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-url.secondary {
    font-size: 0.8125rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 0.125rem;
  }

  .item-description {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 0.25rem;
    line-height: 1.4;
  }

  .item-meta {
    font-size: 0.8125rem;
    color: rgba(249, 115, 22, 0.9);
    margin-top: 0.25rem;
    font-weight: 500;
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
