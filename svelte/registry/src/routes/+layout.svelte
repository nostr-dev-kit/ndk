<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { NDKSvelte, createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { NDKInterestList, NDKNip07Signer, NDKPrivateKeySigner, NDKRelayFeedList } from '@nostr-dev-kit/ndk';
  import NDKCacheAdapterSqliteWasm from '@nostr-dev-kit/cache-sqlite-wasm';
  import { setContext } from 'svelte';
  import { LocalStorage } from '@nostr-dev-kit/sessions';
  import { HugeiconsIcon } from '@hugeicons/svelte';
  import {
    Home01Icon,
    Book02Icon,
    Building01Icon,
    Layers01Icon,
    CodeIcon,
    UserAdd01Icon,
    FavouriteIcon,
    MailReply01Icon,
    RepeatIcon,
    VolumeMute01Icon,
    ZapIcon,
    Calendar01Icon,
    Chat01Icon,
    File01Icon,
    UserCircleIcon,
    Tag01Icon,
    IdentificationIcon,
    UserIcon,
    NewsIcon,
    ServerStack01Icon,
    UserIdVerificationIcon,
    Search01Icon,
    PaintBoardIcon
  } from '@hugeicons/core-free-icons';

  let isDark = $state(false);
  let isInitialized = $state(false);

  // Initialize dark mode from system preference or localStorage
  $effect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') {
        isDark = true;
        document.documentElement.classList.add('dark');
      } else if (stored === 'light') {
        isDark = false;
        document.documentElement.classList.remove('dark');
      } else {
        // Follow system preference
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
      }
    }
  });

  function toggleTheme() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

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
    cacheAdapter,
    session: {
        autoSave: true,
        storage: new LocalStorage(),
        follows: true,
        mutes: true,
        wallet: false,
        monitor: [
          NDKInterestList,
          NDKRelayFeedList
        ]
      }
  });

  setContext('ndk', ndk);

  $effect(() => {
    Promise.all([
      cacheAdapter.initializeAsync(),
      ndk.connect()
    ])
    .then(() => {
      isInitialized = true;
    })
    .catch(err => {
      console.error('Initialization error:', err);
      isInitialized = true;
    });
  });

  const docs = [
    { name: 'Introduction', path: '/docs', icon: Book02Icon },
    { name: 'Architecture', path: '/docs/architecture', icon: Building01Icon },
    { name: 'Builders', path: '/docs/builders', icon: Layers01Icon },
    { name: 'Components', path: '/docs/components', icon: CodeIcon },
    { name: 'Utilities', path: '/docs/utilities', icon: PaintBoardIcon },
  ];

  const componentCategories = [
    {
      title: 'Actions',
      items: [
        { name: 'Follow', path: '/components/follow-action', icon: UserAdd01Icon },
        { name: 'Reaction', path: '/components/reaction-action', icon: FavouriteIcon },
        { name: 'Reply', path: '/components/reply-action', icon: MailReply01Icon },
        { name: 'Repost', path: '/components/repost-action', icon: RepeatIcon },
        { name: 'Mute', path: '/components/mute-action', icon: VolumeMute01Icon },
        { name: 'Zap', path: '/components/zap-action', icon: ZapIcon },
      ]
    },
    {
      title: 'Events',
      items: [
        { name: 'EventCard', path: '/components/event-card', icon: Calendar01Icon },
        { name: 'EventCard Thread', path: '/components/event-card-thread', icon: Chat01Icon },
        { name: 'EventContent', path: '/components/event-content', icon: File01Icon },
        { name: 'HighlightCard', path: '/components/highlight-card', icon: File01Icon },
      ]
    },
    {
      title: 'User',
      items: [
        { name: 'Avatar', path: '/components/avatar', icon: UserCircleIcon },
        { name: 'Name', path: '/components/name', icon: Tag01Icon },
        { name: 'UserCard', path: '/components/user-card', icon: IdentificationIcon },
        { name: 'UserInput', path: '/components/user-input', icon: Search01Icon },
        { name: 'Nip05', path: '/components/nip05', icon: UserIdVerificationIcon },
        { name: 'UserHeader', path: '/components/user-header', icon: UserCircleIcon },
        { name: 'UserProfile', path: '/components/user-profile', icon: UserIcon },
      ]
    },
    {
      title: 'Content',
      items: [
        { name: 'ArticleCard', path: '/components/article-card', icon: NewsIcon },
      ]
    },
    {
      title: 'Relay',
      items: [
        { name: 'RelayCard', path: '/components/relay-card', icon: ServerStack01Icon },
      ]
    },
  ];

  let showLoginModal = $state(false);
  let loginMode = $state<'nip07' | 'nsec'>('nip07');
  let privateKey = $state('');
  let loginError = $state('');

  // Profile fetcher for current user
  const currentUserProfile = $derived.by(() => {
    // Only create profile fetcher if we have both currentUser and currentPubkey
    // Don't try to access user.pubkey as it may throw if not set
    if (!ndk.$currentUser || !ndk.$currentPubkey) return null;
    return createProfileFetcher(() => ({ user: ndk.$currentUser! }), ndk);
  });

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

{#if !isInitialized}
  <div class="loading-screen">
    <div class="loading-content">
      <svg class="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      <p class="loading-text">Initializing...</p>
    </div>
  </div>
{:else}
<div class="app">
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-section">
        <svg class="logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <div>
          <h1>NDK Components</h1>
          <p>Svelte 5 Registry</p>
        </div>
      </div>
      <button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
        {#if isDark}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        {/if}
      </button>
    </div>

    <nav class="nav">
      <div class="nav-section">
        <h2 class="nav-title">Getting Started</h2>
        <a href="/" class:active={$page.url.pathname === '/'}>
          <HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={2} />
          Home
        </a>
      </div>

      <div class="nav-section">
        <h2 class="nav-title">Documentation</h2>
        {#each docs as doc}
          <a
            href={doc.path}
            class:active={$page.url.pathname === doc.path}
          >
            <HugeiconsIcon icon={doc.icon} size={16} strokeWidth={2} />
            {doc.name}
          </a>
        {/each}
      </div>

      {#each componentCategories as category}
        <div class="nav-section">
          <h2 class="nav-title">{category.title}</h2>
          {#each category.items as component}
            <a
              href={component.path}
              class:active={$page.url.pathname === component.path}
            >
              <HugeiconsIcon icon={component.icon} size={16} strokeWidth={2} />
              {component.name}
            </a>
          {/each}
        </div>
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
{/if}

<style>
  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: hsl(var(--color-background));
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .loading-spinner {
    width: 3rem;
    height: 3rem;
    color: hsl(var(--color-primary));
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .loading-text {
    font-size: 1rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  .app {
    display: flex;
    min-height: 100vh;
    background: var(--color-background);
  }

  .sidebar {
    width: 280px;
    background: var(--color-background);
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-header {
    padding: 1.5rem 1.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .logo {
    width: 1.5rem;
    height: 1.5rem;
    color: hsl(var(--color-primary));
    flex-shrink: 0;
  }

  .sidebar-header h1 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: hsl(var(--color-foreground));
  }

  .sidebar-header p {
    margin: 0;
    font-size: 0.75rem;
    color: hsl(var(--color-muted-foreground));
  }

  .theme-toggle {
    width: 2rem;
    height: 2rem;
    padding: 0.375rem;
    border: none;
    background: transparent;
    color: hsl(var(--color-muted-foreground));
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-toggle:hover {
    background: hsl(var(--color-accent));
    color: hsl(var(--color-accent-foreground));
  }

  .theme-toggle svg {
    width: 1rem;
    height: 1rem;
  }

  .nav {
    display: flex;
    flex-direction: column;
    padding: 0 1rem;
    gap: 1.5rem;
    flex: 1;
  }

  .nav-section {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .nav-title {
    margin: 0 0 0.5rem 0;
    padding: 0 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: hsl(var(--color-muted-foreground));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .nav a {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    align-self: flex-start;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    color: hsl(var(--color-muted-foreground));
    text-decoration: none;
    transition: all 0.15s ease-in-out;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .nav a:hover {
    background: hsl(var(--color-accent) / 0.5);
    color: hsl(var(--color-foreground));
  }

  .nav a.active {
    background: var(--muted) !important;
    color: var(--color-foreground);
    font-weight: 600;
  }

  .sidebar-footer {
    margin-top: auto;
    padding: 1rem;
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
    background: hsl(var(--color-primary));
    color: hsl(var(--color-primary-foreground));
    font-weight: 600;
    font-size: 0.75rem;
  }

  .user-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--color-foreground));
  }

  .login-btn, .logout-btn {
    width: 100%;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
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
    background: hsl(var(--color-primary));
    color: hsl(var(--color-primary-foreground));
  }

  .login-btn:hover {
    opacity: 0.9;
  }

  .logout-btn {
    background: hsl(var(--color-secondary));
    color: hsl(var(--color-secondary-foreground));
  }

  .logout-btn:hover {
    background: hsl(var(--color-secondary) / 0.8);
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

  .main {
    flex: 1;
    margin-left: 280px;
    padding: 3rem 2rem;
    max-width: 1400px;
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
