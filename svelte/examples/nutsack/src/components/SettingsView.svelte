<script lang="ts">
  import type { WalletAPI } from '../lib/useWallet.svelte.js';
  import type { NDKUser } from '@nostr-dev-kit/ndk';

  interface Props {
    wallet: WalletAPI;
    user: NDKUser;
    onBack: () => void;
    onNavigate?: (view: 'proofs' | 'blacklist' | 'mints' | 'nutzaps') => void;
  }

  let { wallet, user, onBack, onNavigate }: Props = $props();

  let copiedNpub = $state(false);

  function copyPubkey() {
    navigator.clipboard.writeText(user.pubkey);
    copiedNpub = true;
    setTimeout(() => copiedNpub = false, 2000);
  }
</script>

<div class="settings-view">
  <div class="view-header">
    <button class="back-button" onclick={onBack}>← Back</button>
    <h2>Settings</h2>
    <div></div>
  </div>

  <!-- User Info -->
  <div class="section">
    <h3>Account</h3>
    <div class="card">
      <div class="info-row">
        <span class="label">Public Key</span>
        <button class="copy-button-small" onclick={copyPubkey}>
          {copiedNpub ? '✓' : '📋'}
        </button>
      </div>
      <div class="pubkey-display">
        {user.pubkey.slice(0, 16)}...{user.pubkey.slice(-16)}
      </div>
    </div>
  </div>

  <!-- Wallet Management -->
  <div class="section">
    <h3>Wallet</h3>

    <button class="nav-button" onclick={() => onNavigate?.('mints')}>
      <div class="nav-icon">🏦</div>
      <div class="nav-label">
        <div class="nav-title">Mints</div>
        <div class="nav-subtitle">Manage your mints</div>
      </div>
      <div class="nav-arrow">›</div>
    </button>

    <button class="nav-button" onclick={() => onNavigate?.('nutzaps')}>
      <div class="nav-icon">⚡</div>
      <div class="nav-label">
        <div class="nav-title">Zap Settings</div>
        <div class="nav-subtitle">Configure nutzap reception</div>
      </div>
      <div class="nav-arrow">›</div>
    </button>

    <button class="nav-button" onclick={() => onNavigate?.('proofs')}>
      <div class="nav-icon">🔑</div>
      <div class="nav-label">
        <div class="nav-title">Proof Management</div>
        <div class="nav-subtitle">View and validate proofs</div>
      </div>
      <div class="nav-arrow">›</div>
    </button>

    <button class="nav-button" onclick={() => onNavigate?.('blacklist')}>
      <div class="nav-icon">🚫</div>
      <div class="nav-label">
        <div class="nav-title">Blocked Mints</div>
        <div class="nav-subtitle">Manage mint blacklist</div>
      </div>
      <div class="nav-arrow">›</div>
    </button>
  </div>

  <!-- About -->
  <div class="section">
    <h3>About</h3>
    <div class="card about-card">
      <p>
        <strong>Nutsack</strong> is a NIP-60 compliant Cashu wallet built with NDK and Svelte 5.
      </p>
      <p class="features">
        ✓ End-to-end encrypted<br>
        ✓ Non-custodial<br>
        ✓ Multi-mint support<br>
        ✓ NIP-61 Nutzaps
      </p>
      <p class="version-info">
        Version 1.0.0
      </p>
    </div>
  </div>
</div>

<style>
  .settings-view {
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

  .section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h3 {
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }

  .copy-button-small {
    width: 32px;
    height: 32px;
    padding: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .copy-button-small:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }

  .pubkey-display {
    font-family: monospace;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    word-break: break-all;
  }


  .about-card p {
    margin: 0 0 1rem 0;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }

  .about-card p:last-child {
    margin-bottom: 0;
  }

  .features {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
  }

  .version-info {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .nav-button {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    text-align: left;
    transition: all 0.2s;
  }

  .nav-button:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(249, 115, 22, 0.3);
  }

  .nav-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .nav-label {
    flex: 1;
    min-width: 0;
  }

  .nav-title {
    font-size: 0.9375rem;
    font-weight: 600;
    margin-bottom: 0.125rem;
  }

  .nav-subtitle {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .nav-arrow {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.3);
    flex-shrink: 0;
  }
</style>
