<script lang="ts">
  import type { TokenEntry } from '../lib/useWallet.svelte.js';
  import ndk from '../lib/ndk.js';

  interface Props {
    token: TokenEntry;
    isExpanded: boolean;
    onToggle: () => void;
  }

  let { token, isExpanded, onToggle }: Props = $props();

  let relayCount = $state<number | null>(null);

  function getTokenBalance(token: TokenEntry): number {
    return token.proofEntries.reduce((sum, entry) => {
      if (entry.state === 'available') {
        return sum + entry.proof.amount;
      }
      return sum;
    }, 0);
  }

  function getTokenProofCount(token: TokenEntry): number {
    return token.proofEntries.length;
  }

  function getTokenMemo(token: TokenEntry): string | undefined {
    return token.token?.memo;
  }

  function formatMintName(url: string): string {
    try {
      const u = new URL(url);
      return u.host.replace('www.', '').replace('mint.', '');
    } catch {
      return url;
    }
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  function getStateColor(state: string): string {
    switch (state) {
      case 'available': return '#10b981';
      case 'reserved': return '#f59e0b';
      case 'spent': return '#6b7280';
      case 'deleted': return '#ef4444';
      default: return '#6b7280';
    }
  }

  function getStateLabel(state: string): string {
    return state.charAt(0).toUpperCase() + state.slice(1);
  }

  async function fetchRelayCount() {
    if (!token.tokenId) return;

    try {
      const event = await ndk.fetchEvent(token.tokenId);
      if (event) {
        relayCount = event.onRelays?.size || 0;
      } else {
        relayCount = 0;
      }
    } catch (e) {
      console.error(`Failed to fetch token ${token.tokenId.slice(0, 8)}:`, e);
      relayCount = 0;
    }
  }

  $effect(() => {
    if (token.tokenId) {
      fetchRelayCount();
    }
  });

  const balance = $derived(getTokenBalance(token));
  const proofCount = $derived(getTokenProofCount(token));
  const memo = $derived(getTokenMemo(token));
</script>

<div class="token-card">
  <div
    class="token-header"
    onclick={onToggle}
    role="button"
    tabindex="0"
    style="cursor: {token.tokenId ? 'pointer' : 'default'}"
  >
    <div class="token-info">
      <div class="token-title">
        {#if token.tokenId}
          <span class="token-id">{token.tokenId.slice(0, 8)}...</span>
        {:else}
          <span class="token-id">Local Proofs</span>
        {/if}
        {#if memo}
          <span class="token-memo">"{memo}"</span>
        {/if}
      </div>
      <div class="token-meta">
        <span class="mint-name">{formatMintName(token.mint)}</span>
        <span class="separator">•</span>
        <span class="proof-count">{proofCount} proof{proofCount !== 1 ? 's' : ''}</span>
        {#if token.tokenId}
          <span class="separator">•</span>
          {#if relayCount !== null}
            <span class="relay-count">📡 {relayCount} relay{relayCount !== 1 ? 's' : ''}</span>
          {:else}
            <span class="relay-count relay-loading">📡 ...</span>
          {/if}
        {/if}
      </div>
    </div>
    <div class="token-balance">
      <div class="balance-amount">{balance}</div>
      <div class="balance-unit">sats</div>
    </div>
  </div>

  {#if isExpanded}
    <div class="token-proofs">
      <div class="proofs-header">
        <h4>Proofs ({proofCount})</h4>
      </div>
      <div class="proofs-list">
        {#each token.proofEntries as entry}
          <div class="proof-item">
            <div class="proof-info">
              <div class="proof-amount">{entry.proof.amount} sats</div>
              <div class="proof-meta">
                <span class="proof-id">{entry.proof.C.slice(0, 12)}...</span>
                <span class="separator">•</span>
                <span class="proof-timestamp">{formatDate(entry.timestamp)}</span>
              </div>
            </div>
            <div
              class="proof-state"
              style="color: {getStateColor(entry.state)}"
            >
              {getStateLabel(entry.state)}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .token-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    margin-bottom: 0.75rem;
    overflow: hidden;
    transition: all 0.2s;
  }

  .token-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(249, 115, 22, 0.3);
  }

  .token-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
  }

  .token-info {
    flex: 1;
    min-width: 0;
  }

  .token-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .token-id {
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .token-memo {
    font-size: 0.875rem;
    color: rgba(168, 85, 247, 0.8);
    font-style: italic;
  }

  .token-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .separator {
    color: rgba(255, 255, 255, 0.3);
  }

  .relay-count {
    color: rgba(34, 197, 94, 0.8);
  }

  .relay-loading {
    opacity: 0.5;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }

  .token-balance {
    text-align: right;
  }

  .balance-amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f97316;
  }

  .balance-unit {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .token-proofs {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
  }

  .proofs-header {
    margin-bottom: 0.75rem;
  }

  .proofs-header h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
  }

  .proofs-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .proof-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .proof-info {
    flex: 1;
    min-width: 0;
  }

  .proof-amount {
    font-weight: 600;
    color: white;
    margin-bottom: 0.25rem;
  }

  .proof-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .proof-id {
    font-family: 'SF Mono', Monaco, monospace;
  }

  .proof-state {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
