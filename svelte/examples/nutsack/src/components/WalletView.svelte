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
  import TokensView from './TokensView.svelte';
  import BlacklistedMintsView from './BlacklistedMintsView.svelte';
  import WalletConfigView from './WalletConfigView.svelte';
  import NutzapSettingsView from './NutzapSettingsView.svelte';
  import DebugView from './DebugView.svelte';

  interface Props {
    user: NDKUser;
  }

  let { user }: Props = $props();

  const wallet = useWallet(ndk);

  type TabView = 'wallet' | 'send' | 'receive' | 'nutzap' | 'settings';
  type SettingsSubView = 'proofs' | 'tokens' | 'blacklist' | 'mints' | 'nutzaps' | 'debug';

  let currentTab = $state<TabView>('wallet');
  let settingsSubView = $state<SettingsSubView | null>(null);

  function logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('nutsack-nsec');
      ndk.$sessions.logout();
      location.reload();
    }
  }

  function handleSettingsNavigate(view: string) {
    settingsSubView = view as SettingsSubView;
  }

  function handleBackFromSettings() {
    settingsSubView = null;
  }
</script>

<div class="wallet-container">
  <!-- Header - simplified for mobile -->
  <header class="wallet-header">
    <div class="header-content">
      <h1 class="gradient-text">Nutsack</h1>
      {#if settingsSubView}
        <button class="icon-button" onclick={handleBackFromSettings}>
          ←
        </button>
      {:else if currentTab === 'settings'}
        <button class="icon-button logout" onclick={logout}>
          🚪
        </button>
      {/if}
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="main-content">
    {#if settingsSubView === 'proofs'}
      <ProofManagementView wallet={wallet} onBack={handleBackFromSettings} />
    {:else if settingsSubView === 'tokens'}
      <TokensView wallet={wallet} onBack={handleBackFromSettings} />
    {:else if settingsSubView === 'blacklist'}
      <BlacklistedMintsView wallet={wallet} onBack={handleBackFromSettings} />
    {:else if settingsSubView === 'mints'}
      <WalletConfigView wallet={wallet} {ndk} onBack={handleBackFromSettings} />
    {:else if settingsSubView === 'nutzaps'}
      <NutzapSettingsView wallet={wallet} onBack={handleBackFromSettings} />
    {:else if settingsSubView === 'debug'}
      <DebugView {ndk} onBack={handleBackFromSettings} />
    {:else}
      <div class="tab-content" class:visible={currentTab === 'wallet'}>
        <BalanceCard {wallet} />
        <TransactionList {wallet} />
      </div>

      <div class="tab-content" class:visible={currentTab === 'send'}>
        <SendView {wallet} onBack={() => currentTab = 'wallet'} />
      </div>

      <div class="tab-content" class:visible={currentTab === 'receive'}>
        <ReceiveView {wallet} onBack={() => currentTab = 'wallet'} />
      </div>

      <div class="tab-content" class:visible={currentTab === 'nutzap'}>
        <NutzapView {wallet} onBack={() => currentTab = 'wallet'} />
      </div>

      <div class="tab-content" class:visible={currentTab === 'settings'}>
        <SettingsView {wallet} {user} onBack={() => currentTab = 'wallet'} onNavigate={handleSettingsNavigate} />
      </div>
    {/if}
  </main>

  <!-- Bottom Navigation -->
  {#if !settingsSubView}
    <nav class="bottom-nav">
      <button
        class="nav-item"
        class:active={currentTab === 'wallet'}
        onclick={() => currentTab = 'wallet'}
      >
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </button>

      <button
        class="nav-item"
        class:active={currentTab === 'send'}
        onclick={() => currentTab = 'send'}
      >
        <span class="nav-icon">↑</span>
        <span class="nav-label">Send</span>
      </button>

      <button
        class="nav-item"
        class:active={currentTab === 'receive'}
        onclick={() => currentTab = 'receive'}
      >
        <span class="nav-icon">↓</span>
        <span class="nav-label">Receive</span>
      </button>

      <button
        class="nav-item"
        class:active={currentTab === 'nutzap'}
        onclick={() => currentTab = 'nutzap'}
      >
        <span class="nav-icon">⚡</span>
        <span class="nav-label">Zap</span>
      </button>

      <button
        class="nav-item"
        class:active={currentTab === 'settings'}
        onclick={() => currentTab = 'settings'}
      >
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">Settings</span>
      </button>
    </nav>
  {/if}
</div>

<style>
  .wallet-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .wallet-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1rem;
    min-height: 60px;
    display: flex;
    align-items: center;
  }

  .header-content {
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
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
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    position: relative;
  }

  .tab-content {
    display: none;
    padding: 1rem;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    padding-bottom: 80px;
  }

  .tab-content.visible {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Bottom Navigation */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(10, 10, 10, 0.98);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    padding: 0.5rem 0;
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
    z-index: 1000;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    color: rgba(255, 255, 255, 0.5);
  }

  .nav-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: linear-gradient(90deg, #f97316 0%, #ea580c 100%);
    border-radius: 0 0 3px 3px;
    transition: width 0.3s;
  }

  .nav-item.active::before {
    width: 60%;
  }

  .nav-item.active {
    color: #f97316;
  }

  .nav-item:active {
    transform: scale(0.95);
  }

  .nav-icon {
    font-size: 1.5rem;
    line-height: 1;
    transition: transform 0.2s;
  }

  .nav-item.active .nav-icon {
    transform: scale(1.1);
  }

  .nav-label {
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  @media (hover: hover) {
    .nav-item:hover:not(.active) {
      color: rgba(255, 255, 255, 0.8);
    }
  }

  /* Responsive adjustments */
  @media (min-width: 600px) {
    .bottom-nav {
      max-width: 600px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 16px 16px 0 0;
    }
  }
</style>
