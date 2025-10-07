<script lang="ts">
  import { NDKPrivateKeySigner, NDKNip07Signer } from '@nostr-dev-kit/ndk';
  import {  } from '@nostr-dev-kit/svelte';
  import ndk from '../lib/ndk';

  let isLoading = $state(false);
  let error = $state('');
  let showKeyInput = $state(false);
  let privateKeyInput = $state('');

  async function loginWithExtension() {
    isLoading = true;
    error = '';

    try {
      const signer = new NDKNip07Signer();
      await ndk.$sessions.login(signer);
    } catch (e) {
      error = 'Failed to connect with extension. Make sure you have a Nostr extension installed (Alby, nos2x, etc.)';
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  async function loginWithNewKey() {
    isLoading = true;
    error = '';

    try {
      const signer = NDKPrivateKeySigner.generate();
      await ndk.$sessions.login(signer);

      // Store the key for later (sessions store will also persist it)
      localStorage.setItem('nutsack-nsec', signer.nsec);
      console.log('🔑 New private key stored. Keep it safe!');
    } catch (e) {
      error = 'Failed to create new account';
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  function showPrivateKeyInput() {
    showKeyInput = true;
    error = '';
  }

  async function submitPrivateKey() {
    if (!privateKeyInput.trim()) {
      error = 'Please enter a private key';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const signer = new NDKPrivateKeySigner(privateKeyInput.trim());
      await ndk.$sessions.login(signer);

      localStorage.setItem('nutsack-nsec', privateKeyInput.trim());
      privateKeyInput = '';
      showKeyInput = false;
    } catch (e) {
      error = 'Invalid private key';
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  function cancelKeyInput() {
    showKeyInput = false;
    privateKeyInput = '';
    error = '';
  }
</script>

<div class="login-container">
  <div class="login-card">
    <div class="nut-icon">🥜</div>
    <h1 class="gradient-text">Nutsack</h1>
    <p class="subtitle">Your private Cashu wallet on Nostr</p>

    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}

    {#if showKeyInput}
      <div class="key-input-form">
        <label for="private-key">Enter your private key</label>
        <input
          id="private-key"
          type="password"
          bind:value={privateKeyInput}
          placeholder="nsec... or hex"
          disabled={isLoading}
          onkeydown={(e) => e.key === 'Enter' && submitPrivateKey()}
        />
        <div class="key-input-actions">
          <button
            class="secondary"
            onclick={cancelKeyInput}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            class="primary"
            onclick={submitPrivateKey}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    {:else}
      <div class="login-options">
        <button
          class="primary"
          onclick={loginWithExtension}
          disabled={isLoading}
        >
          🔐 Login with Nostr Extension
        </button>

        <button
          onclick={loginWithNewKey}
          disabled={isLoading}
        >
          ✨ Create New Account
        </button>

        <button
          onclick={showPrivateKeyInput}
          disabled={isLoading}
        >
          🔑 Use Existing Key
        </button>
      </div>
    {/if}

    <p class="info-text">
      NIP-60 compliant • End-to-end encrypted • Non-custodial
    </p>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    padding: 2.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    text-align: center;
  }

  .nut-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
  }

  .subtitle {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
    font-size: 1rem;
  }

  .login-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .login-options button {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 1rem;
    color: #f87171;
    font-size: 0.875rem;
  }

  .info-text {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.75rem;
    margin: 0;
  }

  .key-input-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .key-input-form label {
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    text-align: left;
    margin-bottom: -0.5rem;
  }

  .key-input-form input {
    width: 100%;
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: white;
    font-size: 0.9rem;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
    transition: all 0.2s;
  }

  .key-input-form input:focus {
    outline: none;
    border-color: rgba(168, 85, 247, 0.5);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
  }

  .key-input-form input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .key-input-form input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .key-input-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .key-input-actions button {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }

  button.secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.7);
  }

  button.secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.9);
  }
</style>
