<script lang="ts">
  import { onMount } from 'svelte';
  import type NDK from '@nostr-dev-kit/ndk';
  import RelaySelector from './RelaySelector.svelte';
  import MintSelector from './MintSelector.svelte';
  import { MintDiscoveryService } from '../lib/mintDiscoveryService.svelte.js';

  interface Props {
    ndk: NDK;
    onComplete: (config: { mints: string[]; relays: string[] }) => void;
    onCancel?: () => void;
  }

  let { ndk, onComplete, onCancel }: Props = $props();

  // Current step (0 = welcome, 1 = relays, 2 = mints)
  let currentStep = $state(0);

  // Selections
  let selectedRelays = $state<Set<string>>(new Set());
  let selectedMints = $state<Set<string>>(new Set());

  // Mint discovery
  let mintDiscovery = $state<MintDiscoveryService | undefined>();
  let discoveredMints = $derived(mintDiscovery?.mints || []);

  // UI state
  let isSettingUp = $state(false);
  let setupError = $state<string | undefined>();

  // Animation states
  let logoScale = $state(0.3);
  let logoOpacity = $state(0);
  let logoRotation = $state(-180);
  let titleOpacity = $state(0);
  let contentOpacity = $state(0);
  let glowOpacity = $state(0);
  let pulseScale = $state(1);

  const stepTitles = ['SETUP', 'RELAYS', 'MINTS'];
  const currentTitle = $derived(stepTitles[currentStep]);

  onMount(() => {
    // Start animations
    setTimeout(() => {
      logoScale = 1;
      logoOpacity = 1;
      logoRotation = 0;
    }, 100);

    setTimeout(() => {
      titleOpacity = 1;
    }, 600);

    setTimeout(() => {
      contentOpacity = 1;
    }, 900);

    setTimeout(() => {
      glowOpacity = 1;
      // Start pulse animation
      const pulseInterval = setInterval(() => {
        pulseScale = pulseScale === 1 ? 1.15 : 1;
      }, 1500);

      return () => clearInterval(pulseInterval);
    }, 500);

    // Start mint discovery
    mintDiscovery = new MintDiscoveryService(ndk);
    mintDiscovery.start();

    return () => {
      mintDiscovery?.stop();
    };
  });

  function nextStep() {
    if (currentStep < 2) {
      currentStep++;
    }
  }

  function previousStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }

  async function completeSetup() {
    if (selectedMints.size === 0 || selectedRelays.size === 0) {
      setupError = 'Please select at least one mint and one relay';
      return;
    }

    isSettingUp = true;
    setupError = undefined;

    try {
      await onComplete({
        mints: Array.from(selectedMints),
        relays: Array.from(selectedRelays),
      });
    } catch (error) {
      setupError = error instanceof Error ? error.message : 'Setup failed';
      isSettingUp = false;
    }
  }

  const canProceed = $derived(
    currentStep === 0 || (currentStep === 1 && selectedRelays.size > 0)
  );
</script>

<div class="onboarding-container">
  <!-- Background gradient -->
  <div class="background-gradient"></div>

  <!-- Header -->
  <div class="header">
    <div class="logo-section">
      <div
        class="logo-glow"
        style="opacity: {logoOpacity * 0.7}; transform: scale({pulseScale})"
      ></div>
      <div
        class="logo"
        style="transform: scale({logoScale}) rotate({logoRotation}deg); opacity: {logoOpacity}"
      >
        🥜
      </div>
    </div>

    <h1 class="title" style="opacity: {titleOpacity}">
      {currentTitle}
    </h1>

    <!-- Step indicator -->
    <div class="step-indicator" style="opacity: {contentOpacity}">
      {#each Array(3) as _, i}
        <div class="step-dot" class:active={currentStep >= i}></div>
      {/each}
    </div>
  </div>

  <!-- Content -->
  <div class="content" style="opacity: {contentOpacity}">
    {#if currentStep === 0}
      <!-- Welcome step -->
      <div class="welcome-step">
        <h2>Let's set up your Cashu wallet</h2>
        <p class="subtitle">
          Enable instant, private payments on Nostr with end-to-end encryption
        </p>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <div class="feature-content">
              <h3>Lightning Fast</h3>
              <p>Instant payments with minimal fees</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">🔒</div>
            <div class="feature-content">
              <h3>Private & Secure</h3>
              <p>Your transactions stay private</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">🔄</div>
            <div class="feature-content">
              <h3>Decentralized</h3>
              <p>No single point of failure</p>
            </div>
          </div>
        </div>
      </div>
    {:else if currentStep === 1}
      <!-- Relay selection step -->
      <RelaySelector bind:selectedRelays />
    {:else if currentStep === 2}
      <!-- Mint selection step -->
      <MintSelector {discoveredMints} bind:selectedMints />
    {/if}
  </div>

  <!-- Footer actions -->
  <div class="footer" style="opacity: {contentOpacity}">
    {#if setupError}
      <div class="error-banner">
        {setupError}
      </div>
    {/if}

    <div class="action-buttons">
      {#if currentStep > 0}
        <button class="button button-secondary" onclick={previousStep}>
          ← Back
        </button>
      {/if}

      {#if currentStep < 2}
        <button class="button button-primary" onclick={nextStep} disabled={!canProceed}>
          {currentStep === 0 ? "Let's Go" : 'Next: Select Mints'} →
        </button>
      {:else}
        <button
          class="button button-primary"
          onclick={completeSetup}
          disabled={selectedMints.size === 0 || isSettingUp}
        >
          {isSettingUp ? 'Setting up...' : 'Complete Setup'} ✓
        </button>
      {/if}
    </div>

    {#if currentStep === 0 && onCancel}
      <button class="button-text" onclick={onCancel}>
        Cancel
      </button>
    {/if}
  </div>
</div>

<style>
  .onboarding-container {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .background-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(5, 2, 8, 1) 0%,
      rgba(2, 1, 3, 1) 50%,
      rgba(0, 0, 0, 1) 100%
    );
    z-index: -1;
  }

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem 1rem;
    gap: 1rem;
  }

  .logo-section {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-glow {
    position: absolute;
    inset: -20px;
    background: radial-gradient(
      circle,
      rgba(249, 115, 22, 0.6) 0%,
      rgba(168, 85, 247, 0.3) 40%,
      transparent 70%
    );
    filter: blur(20px);
    transition: all 1.5s ease-in-out;
  }

  .logo {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    box-shadow:
      0 4px 20px rgba(249, 115, 22, 0.4),
      0 0 40px rgba(249, 115, 22, 0.2);
    transition: all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .title {
    font-size: 2.5rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
    margin: 0;
    transition: opacity 0.8s ease-out;
  }

  .step-indicator {
    display: flex;
    gap: 0.75rem;
    transition: opacity 0.4s ease-out;
  }

  .step-dot {
    width: 24px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  .step-dot.active {
    background: #f97316;
    width: 32px;
  }

  .content {
    flex: 1;
    padding: 1.5rem 1rem;
    max-width: 600px;
    width: 100%;
    margin: 0 auto;
    overflow-y: auto;
    transition: opacity 0.8s ease-out;
  }

  .welcome-step {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }

  .welcome-step h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    line-height: 1.6;
  }

  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .feature-item {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    text-align: left;
    transition: all 0.3s ease;
  }

  .feature-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(249, 115, 22, 0.3);
    transform: translateY(-2px);
  }

  .feature-icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.1));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .feature-content {
    flex: 1;
  }

  .feature-content h3 {
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin: 0 0 0.25rem 0;
  }

  .feature-content p {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  .footer {
    padding: 1.5rem 1rem 2rem;
    max-width: 600px;
    width: 100%;
    margin: 0 auto;
    transition: opacity 0.8s ease-out;
  }

  .error-banner {
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 12px;
    color: #f87171;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .action-buttons {
    display: flex;
    gap: 0.75rem;
  }

  .button {
    flex: 1;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button-primary {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  .button-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
  }

  .button-secondary {
    background: rgba(255, 255, 255, 0.05);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .button-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .button-text {
    width: 100%;
    padding: 0.75rem;
    margin-top: 0.75rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;
  }

  .button-text:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  /* Scrollbar styling */
  .content::-webkit-scrollbar {
    width: 8px;
  }

  .content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .content::-webkit-scrollbar-thumb {
    background: rgba(249, 115, 22, 0.5);
    border-radius: 4px;
  }

  .content::-webkit-scrollbar-thumb:hover {
    background: rgba(249, 115, 22, 0.7);
  }
</style>
