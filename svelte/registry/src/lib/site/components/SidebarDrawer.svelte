<script lang="ts">
  import { page } from '$app/stores';
  import { HugeiconsIcon } from '@hugeicons/svelte';
  import type { NavCategory } from '$lib/site/navigation';
  import { sidebar } from '$lib/site/stores/sidebar.svelte';
  import NipBadge from '$lib/site/components/nip-badge.svelte';

  let { sections = [] }: { sections?: NavCategory[] } = $props();

  let isHovering = $state(false);
  const isExpanded = $derived(!sidebar.collapsed || isHovering);
  const isActive = (path: string) => $page.url.pathname === path;

  // Build all the class strings in the script, not in the template
  const overlayClasses = $derived(
    `fixed inset-0 bg-black/50 z-[850] transition-opacity duration-300 md:hidden ${
      sidebar.open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`
  );

  const sidebarClasses = $derived(
    `fixed top-14 left-0 h-[calc(100vh-3.5rem)] overflow-y-auto bg-background z-[900] flex flex-col transition-[width,transform] duration-300 ease-in-out ${
      sidebar.collapsed ? 'w-16 hover:w-[280px]' : 'w-[280px]'
    } ${
      sidebar.open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    }`
  );

  const collapseButtonClasses = $derived(
    `flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground max-md:hidden ${
      sidebar.collapsed ? 'relative mx-auto my-4' : 'absolute bottom-4 right-4'
    }`
  );
</script>

<!-- Mobile Overlay -->
{#if !sidebar.collapsed}
  <div
    class={overlayClasses}
    onclick={() => sidebar.setOpen(false)}
    role="button"
    tabindex="-1"
    aria-hidden="true"
  ></div>
{/if}

<aside
  class={sidebarClasses}
  onmouseenter={() => isHovering = true}
  onmouseleave={() => isHovering = false}
>
  <nav class="flex-1 overflow-auto flex flex-col px-4 pt-4 gap-6">
    {#each sections as section (section.title)}
      <div class="flex flex-col gap-1 w-full">
        {#if isExpanded}
          <h2 class="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            {section.title}
            {#if section.nip}
              <NipBadge nip={section.nip} />
            {/if}
          </h2>
        {/if}

        {#each section.items as item (item.path)}
          {@const active = isActive(item.path)}
          <div class={`flex items-center gap-2 w-full ${sidebar.collapsed && !isHovering ? 'justify-center' : ''}`}>
            <a
              href={item.path}
              class={`
                flex items-center gap-2 rounded-md transition-all duration-150 text-[0.85rem] font-medium
                hover:bg-accent/50 hover:text-foreground
                ${sidebar.collapsed && !isHovering ? 'p-2 w-auto' : 'py-1 px-3 flex-1'}
                ${active ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground'}
              `}
            >
              <HugeiconsIcon icon={item.icon} size={16} strokeWidth={2} />
              {#if isExpanded}
                <span class="whitespace-nowrap">{item.name}</span>
              {/if}
            </a>
            {#if item.nip && isExpanded}
              <NipBadge nip={item.nip} />
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </nav>

  <button
    class={collapseButtonClasses}
    onclick={() => sidebar.toggleCollapsed()}
    aria-label={sidebar.collapsed ? "Expand sidebar" : "Collapse sidebar"}
    title={sidebar.collapsed ? "Expand sidebar" : "Collapse sidebar"}
  >
    <svg class="w-[1.125rem] h-[1.125rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points={sidebar.collapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"}></polyline>
    </svg>
  </button>
</aside>
