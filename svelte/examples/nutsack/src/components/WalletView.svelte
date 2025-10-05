<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { useWallet } from '../lib/useWallet.svelte.js';
  import {  } from '@nostr-dev-kit/svelte';
  import ndk from '../lib/ndk';
  import BalanceCard from './BalanceCard.svelte';
  import SendView from './SendView.svelte';
  import ReceiveView from './ReceiveView.svelte';
  import NutzapView from './NutzapView.svelte';
  import TransactionList from './TransactionList.svelte';
  import SettingsView from './SettingsView.svelte';
  import ProofManagementView from './ProofManagementView.svelte';
  import BlacklistedMintsView from './BlacklistedMintsView.svelte';
  import MintManagementView from './MintManagementView.svelte';
  import NutzapSettingsView from './NutzapSettingsView.svelte';

  interface Props {
    user: NDKUser;
  }

  let { user }: Props = $props();

  const wallet = useWallet(ndk);

  let currentView = $state<'wallet' | 'send' | 'receive' | 'nutzap' | 'settings' | 'proofs' | 'blacklist' | 'mints' | 'nutzaps'>('wallet');
  let showScanner = $state(false);

  function logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('nutsack-nsec');
      ndk.sessions.logout();
      location.reload();
    }
  }
</script>

<div class="wallet-container">
  <!-- Header -->
  <header class="wallet-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="gradient-text">Nutsack</h1>
        <span class="version">v1.0</span>
      </div>
      <div class="header-right">
        <button class="icon-button" onclick={() => currentView = 'settings'}>
          ⚙️
        </button>
        <button class="icon-button logout" onclick={logout}>
          🚪
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <div class="main-content">
    {#if currentView === 'wallet'}
      <div class="wallet-main">
        <!-- Balance Card -->
        <BalanceCard wallet={wallet} />

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button class="action-button receive" onclick={() => currentView = 'receive'}>
            <div class="action-icon">↓</div>
            <span>Receive</span>
          </button>

          <button class="action-button nutzap" onclick={() => currentView = 'nutzap'}>
            <div class="action-icon">⚡</div>
            <span>Zap</span>
          </button>

          <button class="action-button send" onclick={() => currentView = 'send'}>
            <div class="action-icon">↑</div>
            <span>Send</span>
          </button>
        </div>

        <!-- Transactions -->
        <TransactionList wallet={wallet} />
      </div>
    {:else if currentView === 'send'}
      <SendView
        wallet={wallet}
        onBack={() => currentView = 'wallet'}
      />
    {:else if currentView === 'receive'}
      <ReceiveView
        wallet={wallet}
        onBack={() => currentView = 'wallet'}
      />
    {:else if currentView === 'nutzap'}
      <NutzapView
        wallet={wallet}
        onBack={() => currentView = 'wallet'}
      />
    {:else if currentView === 'settings'}
      <SettingsView
        wallet={wallet}
        user={user}
        onBack={() => currentView = 'wallet'}
        onNavigate={(view) => currentView = view}
      />
    {:else if currentView === 'proofs'}
      <ProofManagementView
        wallet={wallet}
        onBack={() => currentView = 'settings'}
      />
    {:else if currentView === 'blacklist'}
      <BlacklistedMintsView
        wallet={wallet}
        onBack={() => currentView = 'settings'}
      />
    {:else if currentView === 'mints'}
      <MintManagementView
        wallet={wallet}
        onBack={() => currentView = 'settings'}
      />
    {:else if currentView === 'nutzaps'}
      <NutzapSettingsView
        wallet={wallet}
        onBack={() => currentView = 'settings'}
      />
    {/if}
  </div>
</div>

<style>
  .wallet-container {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .wallet-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1rem;
  }

  .header-content {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    margin: 0;
  }

  .version {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 500;
  }

  .header-right {
    display: flex;
    gap: 0.5rem;
  }

  .icon-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
  }

  .icon-button:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }

  .icon-button.logout:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.3);
  }

  .main-content {
    flex: 1;
    padding: 1.5rem 1rem;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }

  .wallet-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .action-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .action-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .action-button:hover::before {
    opacity: 1;
  }

  .action-button:hover {
    transform: translateY(-2px);
    border-color: rgba(249, 115, 22, 0.3);
    box-shadow: 0 8px 24px rgba(249, 115, 22, 0.15);
  }

  .action-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    position: relative;
    z-index: 1;
  }

  .action-button.receive .action-icon {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  .action-button.nutzap .action-icon {
    background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%);
  }

  .action-button span {
    font-weight: 600;
    font-size: 0.875rem;
    position: relative;
    z-index: 1;
  }
</style>
