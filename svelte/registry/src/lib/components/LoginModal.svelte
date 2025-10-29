<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

  interface Props {
    show: boolean;
    onClose: () => void;
  }

  let { show = $bindable(), onClose }: Props = $props();

  let loginMode = $state<'nip07' | 'nsec'>('nip07');
  let privateKey = $state('');
  let loginError = $state('');

  async function handleNIP07Login() {
    try {
      loginError = '';
      await ndk.$sessions.login(new NDKNip07Signer());
      show = false;
    } catch (e) {
      loginError = e instanceof Error ? e.message : 'Failed to login with NIP-07';
    }
  }

  async function handlePrivateKeyLogin() {
    try {
      loginError = '';
      const signer = new NDKPrivateKeySigner(privateKey);
      await ndk.$sessions.login(signer);
      privateKey = '';
      show = false;
    } catch (e) {
      loginError = e instanceof Error ? e.message : 'Failed to login with private key';
    }
  }

  function close() {
    show = false;
    onClose();
  }
</script>

{#if show}
  <div
    class="modal-backdrop"
    onclick={close}
    role="button"
    tabindex="0"
  ></div>

  <div class="modal" onclick={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <div>
        <h2 class="modal-title">Login to NDK Registry</h2>
        <p class="modal-subtitle">Connect your Nostr identity</p>
      </div>
      <button class="modal-close" onclick={close}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="modal-body">
      <div class="login-mode-toggle">
        <button
          class="toggle-btn"
          class:active={loginMode === 'nip07'}
          onclick={() => loginMode = 'nip07'}
        >
          <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Extension
        </button>
        <button
          class="toggle-btn"
          class:active={loginMode === 'nsec'}
          onclick={() => loginMode = 'nsec'}
        >
          <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Private Key
        </button>
      </div>

      {#if loginMode === 'nip07'}
        <div class="login-form">
          <div class="info-box info">
            <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Login using a NIP-07 compatible browser extension like <strong>Alby</strong>, <strong>nos2x</strong>, or <strong>Flamingo</strong>.</p>
          </div>
          <button class="submit-btn" onclick={handleNIP07Login}>
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Connect Extension
          </button>
        </div>
      {:else}
        <div class="login-form">
          <div class="info-box warning">
            <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p><strong>Warning:</strong> Only enter your private key if you trust this device. Consider using an extension instead.</p>
          </div>
          <input
            type="password"
            class="key-input"
            placeholder="nsec1... or hex private key"
            bind:value={privateKey}
          />
          <button
            class="submit-btn"
            onclick={handlePrivateKeyLogin}
            disabled={!privateKey}
          >
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login with Private Key
          </button>
        </div>
      {/if}

      {#if loginError}
        <div class="info-box error">
          <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{loginError}</p>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .modal {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 51;
    width: 90%;
    max-width: 500px;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid hsl(var(--color-border));
    display: flex;
    justify-content: space-between;
    align-items: start;
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: hsl(var(--color-foreground));
    margin: 0;
  }

  .modal-subtitle {
    font-size: 0.875rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0.25rem 0 0 0;
  }

  .modal-close {
    padding: 0.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 0.375rem;
    transition: background 0.2s;
    color: hsl(var(--color-muted-foreground));
  }

  .modal-close:hover {
    background: hsl(var(--color-accent));
    color: hsl(var(--color-accent-foreground));
  }

  .modal-close svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .login-mode-toggle {
    display: flex;
    gap: 0.25rem;
    padding: 0.25rem;
    background: hsl(var(--color-muted));
    border-radius: 0.375rem;
  }

  .toggle-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    background: transparent;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--color-muted-foreground));
    transition: all 0.2s;
  }

  .toggle-btn.active {
    background: hsl(var(--color-background));
    color: hsl(var(--color-foreground));
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .toggle-icon {
    width: 1rem;
    height: 1rem;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-box {
    padding: 1rem;
    border-radius: 0.375rem;
    display: flex;
    gap: 0.75rem;
    border: 1px solid hsl(var(--color-border));
  }

  .info-box.info {
    background: hsl(var(--color-primary) / 0.1);
    border-color: hsl(var(--color-primary) / 0.3);
  }

  .info-box.warning {
    background: hsl(40 100% 50% / 0.1);
    border-color: hsl(40 100% 50% / 0.3);
  }

  .info-box.error {
    background: hsl(var(--color-destructive) / 0.1);
    border-color: hsl(var(--color-destructive) / 0.3);
  }

  .info-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .info-box.info .info-icon {
    color: hsl(var(--color-primary));
  }

  .info-box.warning .info-icon {
    color: hsl(40 100% 40%);
  }

  .info-box.error .info-icon {
    color: hsl(var(--color-destructive));
  }

  .info-box p {
    font-size: 0.875rem;
    margin: 0;
    color: hsl(var(--color-foreground));
  }

  .key-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid hsl(var(--color-input));
    background: hsl(var(--color-background));
    color: hsl(var(--color-foreground));
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .key-input:focus {
    outline: none;
    border-color: hsl(var(--color-ring));
    box-shadow: 0 0 0 3px hsl(var(--color-ring) / 0.2);
  }

  .submit-btn {
    width: 100%;
    padding: 0.5rem 1rem;
    background: hsl(var(--color-primary));
    color: hsl(var(--color-primary-foreground));
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    opacity: 0.9;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
</style>
