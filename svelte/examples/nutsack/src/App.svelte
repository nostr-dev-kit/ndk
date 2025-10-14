<script lang="ts">
  import { onMount } from 'svelte';
  import ndk, { ndkReady } from './lib/ndk';
  import WalletView from './components/WalletView.svelte';
  import LoginView from './components/LoginView.svelte';
  import WalletOnboardingFlow from './components/WalletOnboardingFlow.svelte';
  import { useWallet } from './lib/useWallet.svelte.js';

  let isConnecting = $state(true);

  // Initialize wallet
  const wallet = useWallet(ndk);

  // Derive onboarding state from session and wallet state
  const showOnboarding = $derived.by(() => {
    const currentUser = ndk.$currentUser;
    if (!currentUser) return false;
    return wallet.needsOnboarding;
  });

  onMount(async () => {
    // Wait for NDK to be ready
    await ndkReady;
    isConnecting = false;
  });

  async function handleOnboardingComplete(config: { mints: string[]; relays: string[] }) {
    try {
      await wallet.setupWallet(config);
      // showOnboarding will automatically become false when wallet.needsOnboarding becomes false
    } catch (error) {
      console.error('Failed to setup wallet:', error);
      throw error;
    }
  }
</script>

<main>
  {#if isConnecting}
    <div class="loading-screen">
      <div class="nut-icon">🥜</div>
      <h1 class="gradient-text">Nutsack</h1>
      <p class="shimmer">Loading your wallet...</p>
    </div>
  {:else if !ndk.$currentUser}
    <LoginView />
  {:else if showOnboarding}
    <WalletOnboardingFlow {ndk} onComplete={handleOnboardingComplete} />
  {:else}
    <WalletView user={ndk.$currentUser} />
  {/if}
</main>

<style>
  main {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 1rem;
  }

  .nut-icon {
    font-size: 4rem;
    animation: bounce 1s infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
  }

  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 1rem;
  }
</style>
