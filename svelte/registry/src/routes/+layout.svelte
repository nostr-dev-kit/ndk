<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { NDKSvelte, createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import NDKCacheAdapterSqliteWasm from '@nostr-dev-kit/cache-sqlite-wasm';
  import { setContext } from 'svelte';
    import { LocalStorage } from '@nostr-dev-kit/sessions';

  const cacheAdapter = new NDKCacheAdapterSqliteWasm({
    dbName: 'ndk-registry',
    workerUrl: '/worker.js',
    wasmUrl: '/sql-wasm.wasm'
  });

  const ndk = new NDKSvelte({
    explicitRelayUrls: [
      'wss://relay.damus.io',
      'wss://relay.nostr.band',
      'wss://nos.lol'
    ],
    // cacheAdapter,
    session: {
      autoSave: true,
      storage: new LocalStorage(),
      fetches: {
        follows: true,
        mutes: true,
        wallet: false
      }
    }
  });

  setContext('ndk', ndk);

  $effect(() => {
    Promise.all([
      cacheAdapter.initializeAsync(),
      ndk.connect()
    ]).catch(err => {
      console.error('Initialization error:', err);
    });
  });

  const components = [
    { name: 'EventCard', path: '/components/event-card' },
    { name: 'RelayCard', path: '/components/relay-card' },
    { name: 'ReactionButton', path: '/components/reaction-button' },
    { name: 'Avatar', path: '/components/avatar' },
    { name: 'Name', path: '/components/name' },
    { name: 'User Card', path: '/components/user-card' },
    { name: 'User Profile', path: '/components/user-profile' },
    { name: 'Event Content', path: '/components/event-content' },
  ];

  let showLoginModal = $state(false);
  let loginMode = $state<'nip07' | 'nsec'>('nip07');
  let privateKey = $state('');
  let loginError = $state('');

  // Profile fetcher for current user
  const currentUserProfile = $derived(
    ndk.$currentUser && ndk.$currentPubkey
      ? createProfileFetcher({ ndk, user: () => ndk.$currentUser! })
      : null
  );

  const avatarUrl = $derived(currentUserProfile?.profile?.picture);
  const displayName = $derived(
    currentUserProfile?.profile?.displayName ||
    currentUserProfile?.profile?.name ||
    (ndk.$currentPubkey ? ndk.$currentPubkey.substring(0, 8) : 'Anon')
  );

  async function handleNIP07Login() {
    try {
      loginError = '';
      await ndk.$sessions.login(new NDKNip07Signer());
      showLoginModal = false;
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
      showLoginModal = false;
    } catch (e) {
      loginError = e instanceof Error ? e.message : 'Failed to login with private key';
    }
  }

  function handleLogout() {
    ndk.$sessions.logout();
  }
</script>

<div class="app">
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1>NDK Components</h1>
      <p>Svelte 5 Registry</p>
    </div>
    <nav class="nav">
      <a href="/" class:active={$page.url.pathname === '/'}>
        Home
      </a>
      {#each components as component}
        <a
          href={component.path}
          class:active={$page.url.pathname === component.path}
        >
          {component.name}
        </a>
      {/each}
    </nav>

    <div class="sidebar-footer">
      {#if ndk.$currentPubkey}
        <div class="user-info">
          <div class="user-details">
            {#if avatarUrl}
              <img src={avatarUrl} alt={displayName} class="avatar" />
            {:else}
              <div class="avatar avatar-fallback">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            {/if}
            <span class="user-name">{displayName}</span>
          </div>
          <button class="logout-btn" onclick={handleLogout}>
            Logout
          </button>
        </div>
      {:else}
        <button class="login-btn" onclick={() => showLoginModal = true}>
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Login
        </button>
      {/if}
    </div>
  </aside>

  <main class="main">
    <slot />
  </main>
</div>

{#if showLoginModal}
  <!-- Backdrop -->
  <div
    class="modal-backdrop"
    onclick={() => showLoginModal = false}
    role="button"
    tabindex="0"
  ></div>

  <!-- Login Modal -->
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <div>
        <h2 class="modal-title">Login to NDK Registry</h2>
        <p class="modal-subtitle">Connect your Nostr identity</p>
      </div>
      <button class="modal-close" onclick={() => showLoginModal = false}>
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
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #f9fafb;
  }

  .app {
    display: flex;
    min-height: 100vh;
  }

  .sidebar {
    width: 280px;
    background: white;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-header {
    padding: 2rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .sidebar-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }

  .sidebar-header p {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .nav {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 0.25rem;
  }

  .nav a {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    color: #374151;
    text-decoration: none;
    transition: all 0.2s;
    font-size: 0.875rem;
  }

  .nav a:hover {
    background: #f3f4f6;
    color: #111827;
  }

  .nav a.active {
    background: #8b5cf6;
    color: white;
  }

  .sidebar-footer {
    margin-top: auto;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .user-details {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }

  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    font-size: 0.75rem;
  }

  .user-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .login-btn, .logout-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .login-btn {
    background: #8b5cf6;
    color: white;
  }

  .login-btn:hover {
    background: #7c3aed;
  }

  .logout-btn {
    background: #f3f4f6;
    color: #374151;
  }

  .logout-btn:hover {
    background: #e5e7eb;
  }

  .login-btn .icon {
    width: 1rem;
    height: 1rem;
  }

  /* Modal Styles */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.6);
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
    background: white;
    border-radius: 1rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: start;
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .modal-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0.25rem 0 0 0;
  }

  .modal-close {
    padding: 0.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 0.5rem;
    transition: background 0.2s;
  }

  .modal-close:hover {
    background: #f3f4f6;
  }

  .modal-close svg {
    width: 1.25rem;
    height: 1.25rem;
    color: #6b7280;
  }

  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .login-mode-toggle {
    display: flex;
    gap: 0.5rem;
    padding: 0.25rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
  }

  .toggle-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    transition: all 0.2s;
  }

  .toggle-btn.active {
    background: #8b5cf6;
    color: white;
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
    border-radius: 0.5rem;
    display: flex;
    gap: 0.75rem;
  }

  .info-box.info {
    background: #ede9fe;
    border: 1px solid #c4b5fd;
  }

  .info-box.warning {
    background: #fef3c7;
    border: 1px solid #fcd34d;
  }

  .info-box.error {
    background: #fee2e2;
    border: 1px solid #fca5a5;
  }

  .info-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .info-box.info .info-icon {
    color: #7c3aed;
  }

  .info-box.warning .info-icon {
    color: #d97706;
  }

  .info-box.error .info-icon {
    color: #dc2626;
  }

  .info-box p {
    font-size: 0.875rem;
    margin: 0;
  }

  .info-box.info p {
    color: #5b21b6;
  }

  .info-box.warning p {
    color: #92400e;
  }

  .info-box.error p {
    color: #991b1b;
  }

  .key-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .key-input:focus {
    outline: none;
    border-color: #8b5cf6;
  }

  .submit-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #8b5cf6;
    color: white;
    border: none;
    border-radius: 0.5rem;
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
    background: #7c3aed;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .main {
    flex: 1;
    margin-left: 280px;
    padding: 2rem;
    max-width: 1200px;
  }

  @media (max-width: 768px) {
    .sidebar {
      display: none;
    }

    .main {
      margin-left: 0;
    }
  }
</style>
