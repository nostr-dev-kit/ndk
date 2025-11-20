<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKNip07Signer, NDKPrivateKeySigner, nip19 } from '@nostr-dev-kit/ndk';
  import { getContext } from 'svelte';

  interface Props {
    ndk?: NDKSvelte;
    onComplete?: (signer?: NDKPrivateKeySigner) => void;
  }

  let { ndk: ndkProp, onComplete }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = $derived(ndkProp || ndkContext);

  let loginCredential = $state('');
  let signupName = $state('');
  let signupBio = $state('');
  let error = $state('');
  let isLoading = $state(false);

  async function handleSignIn() {
    if (!ndk || !ndk.$sessions || !loginCredential.trim()) return;

    try {
      isLoading = true;
      error = '';

      const trimmed = loginCredential.trim();

      if (trimmed.startsWith('nsec1')) {
        const decoded = nip19.decode(trimmed);
        if (decoded.type !== 'nsec') throw new Error('Invalid nsec format');
        const signer = new NDKPrivateKeySigner(decoded.data as string);
        await ndk.$sessions.login(signer as any);
        onComplete?.();
      } else if (trimmed.startsWith('npub1')) {
        const decoded = nip19.decode(trimmed);
        if (decoded.type !== 'npub') throw new Error('Invalid npub format');
        const user = ndk.getUser({ pubkey: decoded.data as string });
        await user.fetchProfile();
        ndk.activeUser = user;
        onComplete?.();
      } else if (trimmed.includes('@') && trimmed.includes('.')) {
        const [name, domain] = trimmed.split('@');
        const response = await fetch(`https://${domain}/.well-known/nostr.json?name=${name}`);
        if (!response.ok) throw new Error('NIP-05 address not found');
        const data = await response.json();
        const pubkey = data.names?.[name];
        if (!pubkey) throw new Error('NIP-05 address not found');
        const user = ndk.getUser({ pubkey });
        await user.fetchProfile();
        ndk.activeUser = user;
        onComplete?.();
      } else {
        error = 'Unsupported credential format';
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to sign in';
    } finally {
      isLoading = false;
    }
  }

  async function handleExtensionSignIn() {
    if (!ndk || !ndk.$sessions) return;

    try {
      isLoading = true;
      error = '';
      await ndk.$sessions.login(new NDKNip07Signer() as any);
      onComplete?.();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to login with browser extension';
    } finally {
      isLoading = false;
    }
  }

  async function handleCreateAccount() {
    if (!ndk || !signupName.trim()) {
      error = 'Name is required';
      return;
    }

    try {
      isLoading = true;
      error = '';

      const signer = NDKPrivateKeySigner.generate();

      if (ndk.$sessions) {
        await ndk.$sessions.login(signer as any);
      }

      onComplete?.(signer);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to create account';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="auth-section">
  <div class="auth-columns">
    <!-- Sign Up Column (Left) -->
    <div class="auth-column signup-column">
      <h3 class="column-title">Create Account</h3>

      <div class="form-group">
        <label for="signup-name">Your Name</label>
        <input
          id="signup-name"
          type="text"
          bind:value={signupName}
          placeholder="What should we call you?"
          disabled={isLoading}
        />
      </div>

      <div class="form-group">
        <label for="signup-bio">About You (Optional)</label>
        <textarea
          id="signup-bio"
          bind:value={signupBio}
          placeholder="Tell us a bit about yourself..."
          disabled={isLoading}
        ></textarea>
      </div>

      <button class="btn btn-primary" onclick={handleCreateAccount} disabled={isLoading || !signupName.trim()}>
        {isLoading ? 'Creating...' : 'Create Account'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>

    <!-- Divider -->
    <div class="vertical-divider"></div>

    <!-- Sign In Column (Right) -->
    <div class="auth-column signin-column">
      <h3 class="column-title">Sign In</h3>

      <div class="form-group">
        <label for="login-credential">Your Credentials</label>
        <input
          id="login-credential"
          type="text"
          bind:value={loginCredential}
          placeholder="nsec, npub, bunker://, or name@domain.com"
          disabled={isLoading}
        />
        <p class="hint">Enter your credentials to access your account</p>
      </div>

      <button class="btn btn-primary" onclick={handleSignIn} disabled={isLoading || !loginCredential.trim()}>
        {isLoading ? 'Signing In...' : 'Sign In'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>

      <div class="divider"><span>or</span></div>

      <button class="btn btn-secondary" onclick={handleExtensionSignIn} disabled={isLoading}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        {isLoading ? 'Connecting...' : 'Browser Extension'}
      </button>
    </div>
  </div>

  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}
</div>

<style>
  .auth-section {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .auth-columns {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 2rem;
    align-items: start;
  }

  .auth-column {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .column-title {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--foreground);
  }

  .vertical-divider {
    width: 1px;
    background: var(--border);
    align-self: stretch;
    margin: 0 0.5rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 0.5rem;
  }

  input[type="text"],
  textarea {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1.5px solid var(--border);
    border-radius: 0.75rem;
    font-size: 0.875rem;
    background: var(--background);
    color: var(--foreground);
    transition: all 0.2s;
    font-family: inherit;
  }

  textarea {
    min-height: 80px;
    resize: vertical;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.05);
  }

  input:disabled,
  textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-primary {
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: var(--background);
    color: var(--foreground);
    border: 1.5px solid var(--border);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--muted);
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hint {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    margin-top: 0.5rem;
  }

  .divider {
    display: flex;
    align-items: center;
    margin: 1.25rem 0;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .divider span {
    padding: 0 1rem;
  }

  .error-message {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background: color-mix(in srgb, var(--destructive) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--destructive) 20%, transparent);
    border-radius: 0.75rem;
    color: var(--destructive);
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .auth-columns {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .vertical-divider {
      display: none;
    }
  }
</style>
