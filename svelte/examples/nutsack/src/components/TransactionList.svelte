<script lang="ts">
  import type { WalletAPI } from '../lib/useWallet.svelte.js';

  interface Props {
    wallet: WalletAPI;
  }

  let { wallet }: Props = $props();

  const transactions = $derived(wallet.transactions || []);

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  function formatAmount(sats: number): string {
    return new Intl.NumberFormat('en-US').format(sats);
  }
</script>

<div class="transaction-list">
  <div class="list-header">
    <h3>Recent Activity</h3>
    {#if transactions.length > 0}
      <span class="count">{transactions.length}</span>
    {/if}
  </div>

  {#if transactions.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📝</div>
      <p>No transactions yet</p>
      <p class="hint">Your wallet activity will appear here</p>
    </div>
  {:else}
    <div class="transactions">
      {#each transactions as tx}
        <div class="transaction-item">
          <div class="tx-icon" class:receive={tx.type === 'receive'} class:send={tx.type === 'send'}>
            {tx.type === 'receive' ? '↓' : '↑'}
          </div>

          <div class="tx-info">
            <div class="tx-title">
              {tx.type === 'receive' ? 'Received' : 'Sent'}
              {#if tx.memo}
                <span class="tx-memo">· {tx.memo}</span>
              {/if}
            </div>
            <div class="tx-date">{formatDate(tx.timestamp)}</div>
          </div>

          <div class="tx-amount" class:receive={tx.type === 'receive'} class:send={tx.type === 'send'}>
            {tx.type === 'receive' ? '+' : '-'}{formatAmount(tx.amount)}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .transaction-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
  }

  .count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 0.5rem;
    background: rgba(249, 115, 22, 0.15);
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #f97316;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 3rem 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    text-align: center;
  }

  .empty-icon {
    font-size: 3rem;
    opacity: 0.5;
  }

  .empty-state p {
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
  }

  .empty-state .hint {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .transactions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .transaction-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    transition: all 0.2s;
  }

  .transaction-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .tx-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .tx-icon.receive {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
    color: #10b981;
  }

  .tx-icon.send {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.2) 100%);
    color: #f97316;
  }

  .tx-info {
    flex: 1;
    min-width: 0;
  }

  .tx-title {
    font-weight: 600;
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tx-memo {
    font-weight: 400;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tx-date {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 0.125rem;
  }

  .tx-amount {
    font-weight: 700;
    font-size: 0.9375rem;
    white-space: nowrap;
  }

  .tx-amount.receive {
    color: #10b981;
  }

  .tx-amount.send {
    color: #f97316;
  }
</style>
