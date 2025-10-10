<script lang="ts">
  import type { WalletAPI } from '../lib/useWallet.svelte.js';
  import TokenCard from './TokenCard.svelte';

  interface Props {
    wallet: WalletAPI;
    onBack: () => void;
  }

  let { wallet, onBack }: Props = $props();

  let expandedTokens = $state<Set<string>>(new Set());
  let error = $state('');

  const tokens = $derived.by(() => {
    try {
      return wallet.getTokens({ includeDeleted: true });
    } catch (e: any) {
      error = e.message || 'Failed to load tokens';
      return [];
    }
  });

  function toggleToken(tokenId: string) {
    const newSet = new Set(expandedTokens);
    if (newSet.has(tokenId)) {
      newSet.delete(tokenId);
    } else {
      newSet.add(tokenId);
    }
    expandedTokens = newSet;
  }
</script>

<div class="tokens-view">
  <div class="view-header">
    <button class="back-button" onclick={onBack}>← Back</button>
    <h2>Token History</h2>
    <div></div>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <div class="tokens-list">
    {#if tokens.length === 0}
      <div class="empty-state">
        <p>No tokens found</p>
        <p class="subtitle">Received tokens will appear here</p>
      </div>
    {:else}
      {#each tokens as token (token.tokenId || token.mint)}
        {@const isExpanded = token.tokenId ? expandedTokens.has(token.tokenId) : false}
        <TokenCard
          {token}
          {isExpanded}
          onToggle={() => token.tokenId && toggleToken(token.tokenId)}
        />
      {/each}
    {/if}
  </div>
</div>

<style>
  .tokens-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  }

  .view-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.3);
  }

  .back-button {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  h2 {
    margin: 0;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
  }

  .error-message {
    margin: 1rem;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #f87171;
    font-size: 0.875rem;
  }

  .tokens-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .empty-state p {
    margin: 0.5rem 0;
  }

  .empty-state .subtitle {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.3);
  }

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

  .tokens-list::-webkit-scrollbar {
    width: 8px;
  }

  .tokens-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .tokens-list::-webkit-scrollbar-thumb {
    background: rgba(249, 115, 22, 0.5);
    border-radius: 4px;
  }

  .tokens-list::-webkit-scrollbar-thumb:hover {
    background: rgba(249, 115, 22, 0.7);
  }
</style>
