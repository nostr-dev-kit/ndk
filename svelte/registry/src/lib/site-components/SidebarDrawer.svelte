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
  class="fixed inset-0 bg-black/50 z-[850] transition-opacity duration-300"
  class:opacity-0={!sidebar.open}
  class:pointer-events-none={!sidebar.open}
  class:opacity-100={sidebar.open}
  class:pointer-events-auto={sidebar.open}
  class:md:hidden={true}
  onclick={() => sidebar.setOpen(false)}
  role="button"
  tabindex="-1"
  aria-hidden="true"
></div>

<aside
  class="fixed top-14 left-0 h-[calc(100vh-3.5rem)] overflow-y-auto bg-background border-r border-border z-[900] flex flex-col transition-[width,transform] duration-300 ease-in-out w-[280px]"
  class:w-16={sidebar.collapsed}
  class:hover:w-[280px]={sidebar.collapsed}
  class:-translate-x-full={true}
  class:md:translate-x-0={true}
  class:!translate-x-0={sidebar.open}
  onmouseenter={() => isHovering = true}
  onmouseleave={() => isHovering = false}
>
  <nav class="flex-1 overflow-auto flex flex-col px-4 pt-4 gap-6 items-start">
    {#each sections as section (section.title)}
      <div class="flex flex-col gap-1 w-full">
        {#if showContent}
          <h2 class="whitespace-nowrap transition-opacity duration-200 m-0 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2"
              class:hidden={sidebar.collapsed}
              class:block={sidebar.collapsed && isHovering}>
            {section.title}
            {#if section.nip}
              <NipBadge nip={section.nip} />
            {/if}
          </h2>
        {/if}
        {#each section.items as item (item.path)}
          <div class="flex items-center gap-2 w-full"
               class:justify-center={sidebar.collapsed}>
            <a
              href={item.path}
              class="flex items-center gap-2 py-1 px-3 rounded-md no-underline transition-all duration-150 text-[0.85rem] font-medium flex-1 hover:bg-accent/50 hover:text-foreground"
              class:flex-none={sidebar.collapsed}
              class:w-auto={sidebar.collapsed}
              class:justify-center={sidebar.collapsed}
              class:p-2={sidebar.collapsed}
              class:bg-muted={$page.url.pathname === item.path}
              class:text-foreground={$page.url.pathname === item.path}
              class:text-muted-foreground={$page.url.pathname !== item.path}
              class:font-semibold={$page.url.pathname === item.path}
            >
              <HugeiconsIcon icon={item.icon} size={16} strokeWidth={2} />
              <span class="whitespace-nowrap flex-[0_1_auto] min-w-0"
                    class:hidden={sidebar.collapsed}
                    class:block={sidebar.collapsed && isHovering}>{item.name}</span>
            </a>
            {#if item.nip}
              <div class="whitespace-nowrap"
                   class:hidden={sidebar.collapsed}
                   class:block={sidebar.collapsed && isHovering}>
                <NipBadge nip={item.nip} />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </nav>

  <button
    class="flex items-center justify-center w-8 h-8 p-0 border-0 bg-transparent text-muted-foreground rounded-md cursor-pointer transition-all duration-150 absolute bottom-4 right-4"
    class:relative={sidebar.collapsed}
    class:bottom-auto={sidebar.collapsed}
    class:right-auto={sidebar.collapsed}
    class:mx-auto={sidebar.collapsed}
    class:my-4={sidebar.collapsed}
    class:hover:bg-accent={true}
    class:hover:text-foreground={true}
    class:md:flex={true}
    class:max-md:hidden={true}
    onclick={() => sidebar.toggleCollapsed()}
    aria-label={sidebar.collapsed ? "Expand sidebar" : "Collapse sidebar"}
    title={sidebar.collapsed ? "Expand sidebar" : "Collapse sidebar"}
  >
    {#if sidebar.collapsed}
      <svg class="w-[1.125rem] h-[1.125rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    {:else}
      <svg class="w-[1.125rem] h-[1.125rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    {/if}
  </button>
</aside>
