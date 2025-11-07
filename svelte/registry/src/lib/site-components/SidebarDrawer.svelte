<script lang="ts">
  import { page } from '$app/stores';
  import { HugeiconsIcon } from '@hugeicons/svelte';
  import type { NavCategory } from '$lib/navigation';
  import { sidebar } from '$lib/stores/sidebar.svelte';
  import NipBadge from '$lib/site-components/nip-badge.svelte';

  let { sections = [] }: { sections?: NavCategory[] } = $props();

  let isHovering = $state(false);
  const showContent = $derived(!sidebar.collapsed || isHovering);
</script>

<!-- Mobile Overlay -->
<div
  class="sidebar-overlay"
  class:active={sidebar.open}
  onclick={() => sidebar.setOpen(false)}
  role="button"
  tabindex="-1"
  aria-hidden="true"
></div>

<aside
  class="sidebar"
  class:open={sidebar.open}
  class:collapsed={sidebar.collapsed}
  onmouseenter={() => isHovering = true}
  onmouseleave={() => isHovering = false}
>
  <nav class="flex-1 overflow-auto flex flex-col px-4 pt-4 gap-6 items-start">
    {#each sections as section (section.title)}
      <div class="flex flex-col gap-1">
        {#if showContent}
          <h2 class="nav-text m-0 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            {section.title}
            {#if section.nip}
              <NipBadge nip={section.nip} />
            {/if}
          </h2>
        {/if}
        {#each section.items as item (item.path)}
          <div class="nav-item-wrapper">
            <a
              href={item.path}
              class="nav-link"
              class:active={$page.url.pathname === item.path}
            >
              <HugeiconsIcon icon={item.icon} size={16} strokeWidth={2} />
              <span class="nav-link-text nav-text">{item.name}</span>
            </a>
            {#if item.nip}
              <div class="nav-text">
                <NipBadge nip={item.nip} />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </nav>

  <button
    class="collapse-button"
    onclick={() => sidebar.toggleCollapsed()}
    aria-label={sidebar.collapsed ? "Expand sidebar" : "Collapse sidebar"}
    title={sidebar.collapsed ? "Expand sidebar" : "Collapse sidebar"}
  >
    {#if sidebar.collapsed}
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    {:else}
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    {/if}
  </button>
</aside>

<style>
  .sidebar {
    width: 280px;
    background: var(--background);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 3.5rem;
    left: 0;
    height: calc(100vh - 3.5rem);
    overflow-y: auto;
    transition: width 300ms ease-in-out, transform 300ms ease-in-out;
    z-index: 900;
    border-right: 1px solid var(--border);
  }

  .sidebar.collapsed {
    width: 64px;
  }

  .sidebar.collapsed:hover {
    width: 280px;
  }

  .nav-text {
    white-space: nowrap;
    transition: opacity 200ms ease-in-out;
  }

  .sidebar.collapsed .nav-text {
    display: none;
  }

  .sidebar.collapsed:hover .nav-text {
    display: block;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 850;
    opacity: 0;
    pointer-events: none;
    transition: opacity 300ms ease-in-out;
  }

  .sidebar-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }

  @media (min-width: 769px) {
    .sidebar-overlay {
      display: none;
    }
  }

  .collapse-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--muted-foreground);
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    position: absolute;
    bottom: 1rem;
    right: 1rem;
  }

  .sidebar.collapsed .collapse-button {
    position: relative;
    bottom: auto;
    right: auto;
    margin: 1rem auto;
  }

  .collapse-button:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .collapse-button {
      display: none;
    }
  }

  .nav-item-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }

  .sidebar.collapsed .nav-item-wrapper {
    justify-content: center;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    color: var(--muted-foreground);
    text-decoration: none;
    transition: all 0.15s ease-in-out;
    font-size: 0.85rem;
    font-weight: 500;
    flex: 1;
  }

  .nav-link-text {
    flex: 0 1 auto;
    min-width: 0;
  }

  .sidebar.collapsed .nav-link {
    flex: 0 0 auto;
    width: auto;
    justify-content: center;
    padding: 0.5rem;
  }

  .nav-link:hover {
    background: color-mix(in srgb, var(--accent) 50%, transparent);
    color: var(--foreground);
  }

  .nav-link.active {
    background: var(--muted);
    color: var(--foreground);
    font-weight: 600;
  }
</style>
