<script lang="ts">
  import { page } from '$app/stores';
  import { HugeiconsIcon } from '@hugeicons/svelte';
  import { ndk } from '$lib/ndk';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { themeManager } from '$lib/theme.svelte';
  import { docs, componentCategories, homeNavItem } from '$lib/navigation';

  interface Props {
    onLoginClick: () => void;
    onLogoutClick: () => void;
  }

  let { onLoginClick, onLogoutClick }: Props = $props();

  const currentUserProfile = $derived.by(() => {
    if (!ndk.$currentUser || !ndk.$currentPubkey) return null;
    return createProfileFetcher(() => ({ user: ndk.$currentUser! }), ndk);
  });

  const avatarUrl = $derived(currentUserProfile?.profile?.picture);
  const displayName = $derived(
    currentUserProfile?.profile?.displayName ||
    currentUserProfile?.profile?.name ||
    (ndk.$currentPubkey ? ndk.$currentPubkey.substring(0, 8) : 'Anon')
  );
</script>

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
    <button class="theme-toggle" onclick={() => themeManager.toggle()} aria-label="Toggle theme">
      {#if themeManager.isDark}
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
      <a href={homeNavItem.path} class:active={$page.url.pathname === homeNavItem.path}>
        <HugeiconsIcon icon={homeNavItem.icon} size={16} strokeWidth={2} />
        {homeNavItem.name}
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
        <button class="logout-btn" onclick={onLogoutClick}>
          Logout
        </button>
      </div>
    {:else}
      <button class="login-btn" onclick={onLoginClick}>
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Login
      </button>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    width: 280px;
    background: hsl(var(--color-background));
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
    color: hsl(var(--color-foreground));
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
</style>
