<script lang="ts">
  import type { WalletAPI } from '../lib/useWallet.svelte.js';

  interface Props {
    wallet: WalletAPI;
  }

  let { wallet }: Props = $props();

  let showDetails = $state(false);

  const balance = $derived(wallet.balance || 0);
  const mints = $derived(wallet.mints || []);

  // Calculate mint percentages for pie chart
  const mintData = $derived(() => {
    if (mints.length === 0 || balance === 0) return [];

    return mints.map(mint => ({
      ...mint,
      percentage: (mint.balance / balance) * 100
    }));
  });

  function formatBalance(sats: number): string {
    return new Intl.NumberFormat('en-US').format(sats);
  }

  function formatMintUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      let host = urlObj.hostname;
      if (host.startsWith('www.')) host = host.slice(4);
      return host;
    } catch {
      return url;
    }
  }

  // Mock data for demo - will be replaced with real wallet data
  const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];
</script>

<div class="balance-card">
  <div class="balance-header">
    <div class="balance-label">Total Balance</div>
    <button class="details-toggle" onclick={() => showDetails = !showDetails}>
      {showDetails ? '▼' : '▶'}
    </button>
  </div>

  <div class="balance-amount">
    <span class="amount gradient-text">{formatBalance(balance)}</span>
    <span class="unit">sats</span>
  </div>

  <div class="balance-toggle">
    {#if mintData().length > 0}
      <button class="details-toggle-inline" onclick={() => showDetails = !showDetails}>
        {showDetails ? '▼ Hide details' : '▶ Show mints'}
      </button>
    {/if}
  </div>

  {#if wallet.status === 'loading'}
    <div class="status-badge loading">
      <div class="spinner"></div>
      <span>Loading wallet...</span>
    </div>
  {:else if wallet.status === 'error'}
    <div class="status-badge error">
      ⚠️ Error loading wallet
    </div>
  {:else if balance === 0}
    <div class="empty-state">
      <p>Your wallet is empty</p>
      <p class="hint">Tap Receive to add funds</p>
    </div>
  {/if}

  {#if showDetails && mintData().length > 0}
    <div class="mint-breakdown">
      <!-- Pie Chart -->
      <div class="pie-chart-container">
        <svg viewBox="0 0 200 200" class="pie-chart">
          {#each mintData() as mint, i}
            {@const startAngle = mintData().slice(0, i).reduce((sum, m) => sum + (m.percentage / 100) * 360, 0)}
            {@const sweepAngle = (mint.percentage / 100) * 360}
            {@const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180)}
            {@const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180)}
            {@const x2 = 100 + 80 * Math.cos((startAngle + sweepAngle - 90) * Math.PI / 180)}
            {@const y2 = 100 + 80 * Math.sin((startAngle + sweepAngle - 90) * Math.PI / 180)}
            {@const largeArc = sweepAngle > 180 ? 1 : 0}
            <path
              d="M 100 100 L {x1} {y1} A 80 80 0 {largeArc} 1 {x2} {y2} Z"
              fill={colors[i % colors.length]}
              opacity="0.9"
            />
          {/each}
          <circle cx="100" cy="100" r="50" fill="rgba(10, 10, 10, 0.9)" />
        </svg>
      </div>

      <!-- Legend -->
      <div class="mint-list">
        {#each mintData() as mint, i}
          <div class="mint-item">
            <div class="mint-dot" style="background: {colors[i % colors.length]}"></div>
            <div class="mint-info">
              <div class="mint-name">{formatMintUrl(mint.url)}</div>
              <div class="mint-balance">
                {formatBalance(mint.balance)} sats ({mint.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Decorative elements -->
  <div class="glow-orb orb-1"></div>
  <div class="glow-orb orb-2"></div>
</div>

<style>
  .balance-card {
    position: relative;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(10, 10, 10, 0.6) 100%);
    border: 1px solid rgba(249, 115, 22, 0.2);
    border-radius: 24px;
    padding: 2rem;
    overflow: hidden;
    backdrop-filter: blur(20px);
  }

  .balance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .balance-label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .balance-toggle {
    margin-top: 0.5rem;
  }

  .details-toggle-inline {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-size: 0.875rem;
    color: rgba(249, 115, 22, 0.9);
    transition: all 0.2s;
  }

  .details-toggle-inline:hover {
    background: rgba(249, 115, 22, 0.1);
    border-color: rgba(249, 115, 22, 0.3);
  }

  .balance-amount {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .amount {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .unit {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status-badge.loading {
    background: rgba(249, 115, 22, 0.1);
    border: 1px solid rgba(249, 115, 22, 0.2);
    color: #f97316;
  }

  .status-badge.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(249, 115, 22, 0.2);
    border-top-color: #f97316;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-state {
    margin-top: 1rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    text-align: center;
  }

  .empty-state p {
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
  }

  .empty-state .hint {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: rgba(249, 115, 22, 0.8);
  }

  .mint-breakdown {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .pie-chart-container {
    display: flex;
    justify-content: center;
    padding: 1rem 0;
  }

  .pie-chart {
    width: 200px;
    height: 200px;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  }

  .mint-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .mint-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
  }

  .mint-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .mint-info {
    flex: 1;
    min-width: 0;
  }

  .mint-name {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mint-balance {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 0.125rem;
  }

  .glow-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.3;
    pointer-events: none;
  }

  .orb-1 {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, #f97316 0%, transparent 70%);
    top: -100px;
    right: -100px;
  }

  .orb-2 {
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, #ea580c 0%, transparent 70%);
    bottom: -75px;
    left: -75px;
  }
</style>
