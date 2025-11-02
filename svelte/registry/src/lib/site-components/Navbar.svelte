<script lang="ts">
  import { page } from '$app/stores';
  import { ndk } from '$lib/ndk.svelte';
  import { themeManager } from '$lib/theme.svelte';
  import { User } from '$lib/registry/ui';
  import UserAvatarName from '$lib/registry/components/user-avatar-name.svelte';
  import { sidebarOpen } from '$lib/stores/sidebar';
  import { mainNav } from '$lib/navigation';

  interface Props {
    onLoginClick: () => void;
    onLogoutClick: () => void;
  }

  let { onLoginClick, onLogoutClick }: Props = $props();

  let showUserDropdown = $state(false);
  const showMobileMenu = $derived($page.url.pathname.startsWith('/docs') || $page.url.pathname.startsWith('/components') || $page.url.pathname.startsWith('/ui'));

  // Close dropdown on outside click
  $effect(() => {
    if (!showUserDropdown) return;

    const handleClickOutside = () => {
      showUserDropdown = false;
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<nav class="navbar">
  <div class="navbar-content">
    <!-- Left section: Logo + Navigation Links -->
    <div class="navbar-left">
      <a href="/" class="logo-link">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </a>

      <!-- Desktop Navigation -->
      <div class="nav-links">
        {#each mainNav as navItem (navItem.path)}
          <a
            href={navItem.path}
            class="nav-link"
            class:active={navItem.path === '/' ? $page.url.pathname === '/' : $page.url.pathname.startsWith(navItem.path)}
          >
            {navItem.name}
          </a>
        {/each}
      </div>
    </div>

    <!-- Right section: Theme Toggle + User -->
    <div class="navbar-right">
      <!-- Theme Toggle -->
      <button
        class="icon-button"
        onclick={() => themeManager.toggle()}
        aria-label="Toggle theme"
      >
        {#if themeManager.isDark}
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        {/if}
      </button>

      <!-- User Menu -->
      {#if ndk.$currentPubkey}
        <div class="user-menu">
          <button
            class="user-trigger"
            onclick={(e) => { e.stopPropagation(); showUserDropdown = !showUserDropdown; }}
            aria-label="User menu"
          >
            <User.Avatar
              pubkey={ndk.$currentPubkey}
              size={32}
            />
          </button>

          {#if showUserDropdown}
            <div class="user-dropdown" onclick={(e) => e.stopPropagation()}>
              <div class="user-info">
                <UserAvatarName
                  ndk={ndk}
                  pubkey={ndk.$currentPubkey}
                  avatarSize={40}
                  meta="handle"
                />
              </div>
              <div class="dropdown-divider"></div>
              <button
                class="dropdown-item"
                onclick={onLogoutClick}
              >
                <svg class="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <button
          class="login-button"
          onclick={onLoginClick}
        >
          Login
        </button>
      {/if}

      <!-- Mobile Menu Toggle (only on docs/components pages) -->
      {#if showMobileMenu}
        <button
          class="mobile-menu-button"
          onclick={() => sidebarOpen.toggle()}
          aria-label="Toggle menu"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      {/if}
    </div>
  </div>
</nav>

<style>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3.5rem;
    background: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    z-index: 1000;
  }

  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    max-width: 100%;
    padding: 0 1.5rem;
  }

  .navbar-left {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--color-primary);
  }

  .logo-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  @media (max-width: 768px) {
    .nav-links {
      display: none;
    }
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    color: var(--color-muted-foreground);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s ease-in-out;
  }

  .nav-link:hover {
    color: var(--color-foreground);
    background: var(--color-accent);
  }

  .nav-link.active {
    color: var(--color-foreground);
    background: var(--color-muted);
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--color-muted-foreground);
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }

  .icon-button:hover {
    background: var(--color-accent);
    color: var(--color-foreground);
  }

  .icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  .user-menu {
    position: relative;
  }

  .user-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 2px solid transparent;
    background: transparent;
    border-radius: 9999px;
    cursor: pointer;
    transition: border-color 0.15s ease-in-out;
  }

  .user-trigger:hover {
    border-color: var(--color-primary);
  }

  .user-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 0.5rem);
    min-width: 16rem;
    background: var(--color-popover);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--color-foreground) 10%, transparent);
    overflow: hidden;
  }

  .user-info {
    padding: 0.75rem 1rem;
  }

  .dropdown-divider {
    border-top: 1px solid var(--color-border);
  }

  .dropdown-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    border: none;
    background: transparent;
    color: var(--color-foreground);
    font-size: 0.875rem;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
  }

  .dropdown-item:hover {
    background: var(--color-accent);
  }

  .dropdown-icon {
    width: 1rem;
    height: 1rem;
  }

  .login-button {
    padding: 0.5rem 1rem;
    border: none;
    background: var(--color-primary);
    color: var(--primary-foreground);
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: opacity 0.15s ease-in-out;
  }

  .login-button:hover {
    opacity: 0.9;
  }

  .mobile-menu-button {
    display: none;
  }

  @media (max-width: 768px) {
    .mobile-menu-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--color-muted-foreground);
      border-radius: 0.375rem;
      cursor: pointer;
    }

    .mobile-menu-button:hover {
      background: var(--color-accent);
      color: var(--color-foreground);
    }

    .icon-button {
      display: none;
    }
  }
</style>
