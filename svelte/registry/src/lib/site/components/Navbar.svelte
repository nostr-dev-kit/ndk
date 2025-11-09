<script lang="ts">
  import { page } from '$app/stores';
  import { ndk } from '$lib/site/ndk.svelte';
  import { themeManager } from '$lib/site/theme.svelte';
  import { User } from '$lib/registry/ui/user';
  import { UserProfile } from '$lib/registry/components/user-profile';
  import { sidebar } from '$lib/site/stores/sidebar.svelte';
  import { mainNav } from '$lib/site/navigation';
  import { cn } from '$lib/registry/utils/cn.js';

  interface Props {
    onLoginClick: () => void;
    onLogoutClick: () => void;
  }

  let { onLoginClick, onLogoutClick }: Props = $props();

  let showUserDropdown = $state(false);
  const showMobileMenu = $derived($page.url.pathname.startsWith('/docs') || $page.url.pathname.startsWith('/events') || $page.url.pathname.startsWith('/components') || $page.url.pathname.startsWith('/ui'));

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

<nav class="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-[1000]">
  <div class="flex items-center justify-between h-full max-w-full px-6">
    <!-- Left section: Logo + Navigation Links -->
    <div class="flex items-center gap-8">
      <a href="/" class="flex items-center no-underline text-primary" aria-label="Home">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      </a>

      <!-- Desktop Navigation -->
      <div class="flex items-center gap-1 max-md:hidden">
        {#each mainNav as navItem (navItem.path)}
          <a
            href={navItem.path}
            class={cn("px-3 py-2 rounded-md text-muted-foreground no-underline text-sm font-medium transition-all duration-150", (navItem.path === '/' ? $page.url.pathname === '/' : $page.url.pathname.startsWith(navItem.path)) ? "text-foreground bg-muted" : "hover:text-foreground hover:bg-accent")}
          >
            {navItem.name}
          </a>
        {/each}
      </div>
    </div>

    <!-- Right section: Theme Toggle + User -->
    <div class="flex items-center gap-2">
      <!-- Theme Toggle -->
      <button
        class="flex items-center justify-center w-8 h-8 p-0 border-0 bg-transparent text-muted-foreground rounded-md cursor-pointer transition-all duration-150 hover:bg-accent hover:text-foreground max-md:hidden"
        onclick={() => themeManager.toggle()}
        aria-label="Toggle theme"
      >
        {#if themeManager.isDark}
          <svg class="w-[1.125rem] h-[1.125rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        {:else}
          <svg class="w-[1.125rem] h-[1.125rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        {/if}
      </button>

      <!-- User Menu -->
      {#if ndk.$currentPubkey}
        <div class="relative">
          <button
            class="flex items-center justify-center p-0 border-2 border-transparent bg-transparent rounded-full cursor-pointer transition-[border-color] duration-150 hover:border-primary"
            onclick={(e) => { e.stopPropagation(); showUserDropdown = !showUserDropdown; }}
            aria-label="User menu"
          >
            <User.Root {ndk} pubkey={ndk.$currentPubkey}>
              <User.Avatar class="w-8 h-8" />
            </User.Root>
          </button>

          {#if showUserDropdown}
            <div class="absolute right-0 top-[calc(100%_+_0.5rem)] min-w-64 bg-popover border border-border rounded-lg shadow-[0_10px_15px_-3px_rgba(var(--foreground)_/_0.1)] overflow-hidden" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
              <div class="p-3 px-4">
                <UserProfile {ndk} pubkey={ndk.$currentPubkey} variant="horizontal" size="md" byline={User.Handle} />
              </div>
              <div class="border-t border-border"></div>
              <button
                class="w-full flex items-center gap-3 px-4 py-2.5 border-0 bg-transparent text-foreground text-sm font-medium text-left cursor-pointer transition-colors duration-150 hover:bg-accent"
                onclick={onLogoutClick}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" ></path>
                </svg>
                Logout
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <button
          class="px-4 py-2 border-0 bg-primary text-primary-foreground text-sm font-medium rounded-md cursor-pointer transition-opacity duration-150 hover:opacity-90"
          onclick={onLoginClick}
        >
          Login
        </button>
      {/if}

      <!-- Mobile Menu Toggle (only on docs/components pages) -->
      {#if showMobileMenu}
        <button
          class="hidden md:flex items-center justify-center w-8 h-8 p-0 border-0 bg-transparent text-muted-foreground rounded-md cursor-pointer hover:bg-accent hover:text-foreground"
          onclick={() => sidebar.toggleOpen()}
          aria-label="Toggle menu"
        >
          <svg class="w-[1.125rem] h-[1.125rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      {/if}
    </div>
  </div>
</nav>
