<script lang="ts">
  import { page } from '$app/stores';
  import { HugeiconsIcon } from '@hugeicons/svelte';
  import { ndk } from '$lib/ndk.svelte';
  import { themeManager } from '$lib/theme.svelte';
  import { docs, componentCategories, homeNavItem } from '$lib/navigation';
  import { UserProfile } from '$lib/components/ndk/user-profile';
  import { sidebarOpen } from '$lib/stores/sidebar';

  interface Props {
    onLoginClick: () => void;
    onLogoutClick: () => void;
  }

  let { onLoginClick, onLogoutClick }: Props = $props();
</script>

<aside class="sidebar" class:open={$sidebarOpen}>
  <div class="p-6 pb-4 flex items-center justify-between gap-4">
    <div class="flex items-center gap-3 flex-1">
      <svg class="w-6 h-6 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      <div>
        <h1 class="m-0 text-base font-semibold text-foreground">NDK Components</h1>
        <p class="m-0 text-xs text-muted-foreground">Svelte 5 Registry</p>
      </div>
    </div>
    <button
      class="w-8 h-8 p-1.5 border-none bg-transparent text-muted-foreground rounded-md cursor-pointer transition-all shrink-0 flex items-center justify-center hover:bg-accent hover:text-accent-foreground"
      onclick={() => themeManager.toggle()}
      aria-label="Toggle theme"
    >
      {#if themeManager.isDark}
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      {/if}
    </button>
  </div>

  <nav class="flex-1 overflow-auto flex flex-col px-4 gap-6">
    <div class="flex flex-col gap-1">
      <h2 class="m-0 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Getting Started</h2>
      <a
        href={homeNavItem.path}
        class="nav-link"
        class:active={$page.url.pathname === homeNavItem.path}
      >
        <HugeiconsIcon icon={homeNavItem.icon} size={16} strokeWidth={2} />
        {homeNavItem.name}
      </a>
    </div>

    <div class="flex flex-col gap-1">
      <h2 class="m-0 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documentation</h2>
      {#each docs as doc}
        <a
          href={doc.path}
          class="nav-link"
          class:active={$page.url.pathname === doc.path}
        >
          <HugeiconsIcon icon={doc.icon} size={16} strokeWidth={2} />
          {doc.name}
        </a>
      {/each}
    </div>

    {#each componentCategories as category}
      <div class="flex flex-col gap-1">
        <h2 class="m-0 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{category.title}</h2>
        {#each category.items as component}
          <a
            href={component.path}
            class="nav-link"
            class:active={$page.url.pathname === component.path}
          >
            <HugeiconsIcon icon={component.icon} size={16} strokeWidth={2} />
            {component.name}
          </a>
        {/each}
      </div>
    {/each}
  </nav>

  <div class="mt-auto p-4">
    {#if ndk.$currentPubkey}
      <div class="flex flex-col gap-3">
        <UserProfile.AvatarName
          pubkey={ndk.$currentPubkey}
          avatarSize={32}
          meta="handle"
        />
        <button
          class="w-full px-4 py-2 rounded-md text-sm font-medium border-none cursor-pointer transition-all flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
          onclick={onLogoutClick}
        >
          Logout
        </button>
      </div>
    {:else}
      <button
        class="w-full px-4 py-2 rounded-md text-sm font-medium border-none cursor-pointer transition-all flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90"
        onclick={onLoginClick}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    background: var(--color-background);
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
    transition: transform 300ms ease-in-out;
    z-index: 900;
  }

  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
    }

    .sidebar.open {
      transform: translateX(0);
    }
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    align-self: flex-start;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    color: var(--color-muted-foreground);
    text-decoration: none;
    transition: all 0.15s ease-in-out;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .nav-link:hover {
    background: color-mix(in srgb, var(--color-accent) 50%, transparent);
    color: var(--color-foreground);
  }

  .nav-link.active {
    background: var(--color-muted);
    color: var(--color-foreground);
    font-weight: 600;
  }
</style>
