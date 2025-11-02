<!-- @ndk-version: login-compact@0.1.0 -->
<!--
  @component LoginCompact
  Smart login component with adaptive UI based on window.nostr detection.
  Supports nsec, ncryptsec (NIP-49), bunker://, NIP-05, and read-only mode.

  @example
  ```svelte
  <LoginCompact {ndk} onSuccess={() => console.log('Logged in!')} />
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKNip07Signer, NDKPrivateKeySigner, NDKNip46Signer, nip19 } from '@nostr-dev-kit/ndk';
  import { getContext } from 'svelte';
  import { cn } from '$lib/registry/utils/index.js';

  interface Props {
    ndk?: NDKSvelte;
    onSuccess?: () => void;
    class?: string;
    forceExtensionState?: boolean | null;
  }

  let { ndk: ndkProp, onSuccess, class: className = '', forceExtensionState = null }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = $derived(ndkProp || ndkContext);

  let detectedExtension = $state(false);
  const hasExtension = $derived(forceExtensionState !== null ? forceExtensionState : detectedExtension);
  let credentialInput = $state('');
  let password = $state('');
  let error = $state('');
  let isLoading = $state(false);

  // Detect credential type
  const credentialType = $derived.by(() => {
    const trimmed = credentialInput.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('nsec1')) return 'nsec';
    if (trimmed.startsWith('ncryptsec1')) return 'ncryptsec';
    if (trimmed.startsWith('npub1')) return 'npub';
    if (trimmed.startsWith('bunker://')) return 'bunker';
    if (trimmed.startsWith('nostrconnect://')) return 'nostrconnect';
    if (trimmed.includes('@') && trimmed.includes('.')) return 'nip05';

    return null;
  });

  const showPasswordField = $derived(credentialType === 'ncryptsec');

  $effect(() => {
    // Check for window.nostr extension
    if (typeof window !== 'undefined') {
      detectedExtension = !!window.nostr;
    }
  });

  async function handleExtensionLogin() {
    if (!ndk || !ndk.$sessions) return;

    try {
      isLoading = true;
      error = '';
      await ndk.$sessions.login(new NDKNip07Signer());
      onSuccess?.();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to login with browser extension';
    } finally {
      isLoading = false;
    }
  }

  async function handleCredentialLogin() {
    if (!ndk || !ndk.$sessions || !credentialInput.trim()) return;

    try {
      isLoading = true;
      error = '';

      switch (credentialType) {
        case 'nsec': {
          const decoded = nip19.decode(credentialInput.trim());
          if (decoded.type !== 'nsec') throw new Error('Invalid nsec format');
          const signer = new NDKPrivateKeySigner(decoded.data as string);
          await ndk.$sessions.login(signer);
          credentialInput = '';
          onSuccess?.();
          break;
        }

        case 'ncryptsec': {
          if (!password) {
            error = 'Password required for encrypted key';
            return;
          }
          const signer = await NDKPrivateKeySigner.fromNcryptsec(credentialInput.trim(), password);
          await ndk.$sessions.login(signer);
          credentialInput = '';
          password = '';
          onSuccess?.();
          break;
        }

        case 'npub': {
          const decoded = nip19.decode(credentialInput.trim());
          if (decoded.type !== 'npub') throw new Error('Invalid npub format');
          const user = ndk.getUser({ pubkey: decoded.data as string });
          await user.fetchProfile();
          ndk.activeUser = user;
          credentialInput = '';
          onSuccess?.();
          break;
        }

        case 'bunker': {
          const signer = new NDKNip46Signer(ndk, credentialInput.trim());
          await ndk.$sessions.login(signer);
          credentialInput = '';
          onSuccess?.();
          break;
        }

        case 'nip05': {
          const [name, domain] = credentialInput.trim().split('@');
          const response = await fetch(`https://${domain}/.well-known/nostr.json?name=${name}`);
          if (!response.ok) throw new Error('NIP-05 address not found');
          const data = await response.json();
          const pubkey = data.names?.[name];
          if (!pubkey) throw new Error('NIP-05 address not found');
          const user = ndk.getUser({ pubkey });
          await user.fetchProfile();
          ndk.activeUser = user;
          credentialInput = '';
          onSuccess?.();
          break;
        }

        default:
          error = 'Unsupported credential format';
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to login';
    } finally {
      isLoading = false;
    }
  }

  function handleBunkerSigner() {
    // TODO: Implement nostrconnect:// QR code generation
    error = 'Bunker signer (nostrconnect://) coming soon';
  }
</script>

<div class={cn('login', className)}>
  <h2>Connect to Nostr</h2>

  {#if !hasExtension}
    <!-- State 1: No Extension Detected -->
    <div class="primary-section">
      <label class="section-label">Enter your credentials</label>
      <div class="input-row">
        <input
          type="text"
          bind:value={credentialInput}
          disabled={isLoading}
        />
        <button class="qr-button" title="Scan QR code" disabled={isLoading}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
        </button>
      </div>

      {#if showPasswordField}
        <div class="password-field">
          <input
            type="password"
            placeholder="Password for encrypted key"
            bind:value={password}
            disabled={isLoading}
          />
        </div>
      {/if}

      <p class="hint">Supports nsec, ncryptsec (NIP-49), bunker://, and NIP-05</p>
      <button
        class="primary-button"
        onclick={handleCredentialLogin}
        disabled={isLoading || !credentialInput.trim() || (showPasswordField && !password)}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
    </div>

    <div class="divider-horizontal">
      <span>Quick connect</span>
    </div>

    <div class="quick-grid">
      <button class="secondary-button" onclick={handleExtensionLogin} disabled={isLoading}>
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
        Extension
      </button>
      <button class="secondary-button" onclick={handleBunkerSigner} disabled={isLoading}>
        <div style="text-align: center; width: 100%;">
          <div>Bunker Signer</div>
          <div class="button-subtitle">nostrconnect://</div>
        </div>
      </button>
    </div>
  {:else}
    <!-- State 2: Extension Detected -->
    <div class="primary-section">
      <label class="section-label">Quick connect</label>
      <button class="primary-button" onclick={handleExtensionLogin} disabled={isLoading}>
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
        {isLoading ? 'Connecting...' : 'Use Browser Extension'}
      </button>
    </div>

    <div class="divider-horizontal">
      <span>Other options</span>
    </div>

    <div class="quick-single">
      <label class="section-label">Enter your credentials</label>
      <div class="input-row">
        <input
          type="text"
          bind:value={credentialInput}
          disabled={isLoading}
        />
        <button class="qr-button" title="Scan QR code" disabled={isLoading}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
        </button>
      </div>

      {#if showPasswordField}
        <div class="password-field">
          <input
            type="password"
            placeholder="Password for encrypted key"
            bind:value={password}
            disabled={isLoading}
          />
        </div>
      {/if}

      <p class="hint">Supports nsec, ncryptsec (NIP-49), bunker://, and NIP-05</p>
      <button
        class="secondary-button"
        style="margin-top: 0.75rem;"
        onclick={handleCredentialLogin}
        disabled={isLoading || !credentialInput.trim() || (showPasswordField && !password)}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>

      <button class="secondary-button" style="margin-top: 0.5rem;" onclick={handleBunkerSigner} disabled={isLoading}>
        <div style="text-align: center; width: 100%;">
          <div>Bunker Signer</div>
          <div class="button-subtitle">nostrconnect://</div>
        </div>
      </button>
    </div>
  {/if}

  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}
</div>

<style>
  .login {
    width: 100%;
    max-width: 480px;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--color-foreground);
  }

  .section-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-foreground);
    margin-bottom: 0.75rem;
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .hint {
    font-size: 0.75rem;
    color: var(--color-muted-foreground);
    margin-top: 0.5rem;
    line-height: 1.4;
    margin-bottom: 0;
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.375rem;
  }

  input[type="text"],
  input[type="password"] {
    flex: 1;
    padding: 0.875rem;
    border: 1.5px solid var(--color-border);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-family: 'SF Mono', Monaco, monospace;
    background: var(--color-background);
    color: var(--color-foreground);
    transition: all 0.2s;
  }

  input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.05);
  }

  input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .password-field {
    margin-top: 0.5rem;
    margin-bottom: 0.375rem;
  }

  .password-field input {
    width: 100%;
  }

  .qr-button {
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: 1.5px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-background);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-foreground);
  }

  .qr-button:hover:not(:disabled) {
    border-color: var(--color-primary);
    background: var(--color-muted);
  }

  .qr-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .qr-button svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .primary-button {
    width: 100%;
    padding: 0.875rem;
    background: var(--color-primary);
    color: var(--color-primary-foreground);
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .primary-button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-primary) 90%, transparent);
  }

  .primary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .secondary-button {
    width: 100%;
    padding: 0.875rem;
    border: 1.5px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-background);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--color-foreground);
  }

  .secondary-button:hover:not(:disabled) {
    border-color: var(--color-primary);
    background: var(--color-muted);
  }

  .secondary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button-subtitle {
    font-size: 0.6875rem;
    color: var(--color-muted-foreground);
    font-weight: 400;
    display: block;
    margin-top: 0.125rem;
  }

  .primary-section {
    margin-bottom: 1.5rem;
  }

  .divider-horizontal {
    display: flex;
    align-items: center;
    margin: 1.5rem 0;
    color: var(--color-muted-foreground);
    font-size: 0.75rem;
  }

  .divider-horizontal::before,
  .divider-horizontal::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border);
  }

  .divider-horizontal span {
    padding: 0 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .quick-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .quick-single {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .icon {
    width: 1rem;
    height: 1rem;
  }

  .error-message {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background: color-mix(in srgb, var(--color-destructive) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-destructive) 20%, transparent);
    border-radius: 0.5rem;
    color: var(--color-destructive);
    font-size: 0.875rem;
  }
</style>
