<script lang="ts">
  import { page } from '$app/stores';
  import { HugeiconsIcon } from '@hugeicons/svelte';
  import { docs, componentCategories, eventCategories } from '$lib/navigation';
  import { sidebar } from '$lib/stores/sidebar.svelte';
  import { Tooltip } from 'bits-ui';
  import NipBadge from '$lib/site-components/nip-badge.svelte';

  const isDocsRoute = $derived($page.url.pathname.startsWith('/docs'));
  const isEventsRoute = $derived($page.url.pathname.startsWith('/events'));
  const isComponentsRoute = $derived($page.url.pathname.startsWith('/components'));
  const isUiRoute = $derived($page.url.pathname.startsWith('/ui'));

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
  <Tooltip.Provider>
    <nav class="flex-1 overflow-auto flex flex-col px-4 pt-4 gap-6">
    {#if isDocsRoute}
      <div class="flex flex-col gap-1">
        {#if showContent}
          <h2 class="nav-text m-0 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documentation</h2>
        {/if}
        {#each docs as doc (doc.path)}
          {#if sidebar.collapsed && !isHovering}
            <Tooltip.Root delayDuration={0}>
              <Tooltip.Trigger class="nav-link-trigger">
                <a
                  href={doc.path}
                  class="nav-link"
                  class:active={$page.url.pathname === doc.path}
                >
                  <HugeiconsIcon icon={doc.icon} size={16} strokeWidth={2} />
                </a>
              </Tooltip.Trigger>
              <Tooltip.Content side="right" sideOffset={8} class="tooltip-content">
                {#if doc.title || doc.description}
                  <div class="tooltip-header">{doc.title || doc.name}</div>
                  {#if doc.description}
                    <div class="tooltip-description">{doc.description}</div>
                  {/if}
                {:else}
                  <div class="tooltip-title">{doc.name}</div>
                {/if}
              </Tooltip.Content>
            </Tooltip.Root>
          {:else}
            <div class="nav-item-wrapper">
              <a
                href={doc.path}
                class="nav-link"
                class:active={$page.url.pathname === doc.path}
              >
                <HugeiconsIcon icon={doc.icon} size={16} strokeWidth={2} />
                <span class="nav-link-text nav-text">{doc.name}</span>
              </a>
              {#if doc.nip}
                <div class="nav-text">
                  <NipBadge nip={doc.nip} />
                </div>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
    {/if}

    {#if isUiRoute}
      {#each componentCategories.filter(cat => cat.title === 'UI Primitives') as category (category.title)}
        <div class="flex flex-col gap-1">
          {#if showContent}
            <h2 class="nav-text m-0 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              {category.title}
              {#if category.nip}
                <NipBadge nip={category.nip} />
              {/if}
            </h2>
          {/if}
          {#each category.items as component (component.path)}
            {#if sidebar.collapsed && !isHovering}
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger class="nav-link-trigger">
                  <a
                    href={component.path}
                    class="nav-link"
                    class:active={$page.url.pathname === component.path}
                  >
                    <HugeiconsIcon icon={component.icon} size={16} strokeWidth={2} />
                  </a>
                </Tooltip.Trigger>
                <Tooltip.Content side="right" sideOffset={8} class="tooltip-content">
                  {#if component.title || component.description}
                    <div class="tooltip-header">{component.title || component.name}</div>
                    {#if component.description}
                      <div class="tooltip-description">{component.description}</div>
                    {/if}
                  {:else}
                    <div class="tooltip-title">{component.name}</div>
                  {/if}
                </Tooltip.Content>
              </Tooltip.Root>
            {:else}
              <div class="nav-item-wrapper">
                <a
                  href={component.path}
                  class="nav-link"
                  class:active={$page.url.pathname === component.path}
                >
                  <HugeiconsIcon icon={component.icon} size={16} strokeWidth={2} />
                  <span class="nav-link-text nav-text">{component.name}</span>
                </a>
                {#if component.nip}
                  <div class="nav-text">
                    <NipBadge nip={component.nip} />
                  </div>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      {/each}
    {/if}

    {#if isEventsRoute}
      {#each eventCategories as category (category.title)}
        <div class="flex flex-col gap-1">
          {#if showContent}
            <h2 class="nav-text m-0 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              {category.title}
              {#if category.nip}
                <NipBadge nip={category.nip} />
              {/if}
            </h2>
          {/if}
          {#each category.items as component (component.path)}
            {#if sidebar.collapsed && !isHovering}
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger class="nav-link-trigger">
                  <a
                    href={component.path}
                    class="nav-link"
                    class:active={$page.url.pathname === component.path}
                  >
                    <HugeiconsIcon icon={component.icon} size={16} strokeWidth={2} />
                  </a>
                </Tooltip.Trigger>
                <Tooltip.Content side="right" sideOffset={8} class="tooltip-content">
                  {#if component.title || component.description}
                    <div class="tooltip-header">{component.title || component.name}</div>
                    {#if component.description}
                      <div class="tooltip-description">{component.description}</div>
                    {/if}
                  {:else}
                    <div class="tooltip-title">{component.name}</div>
                  {/if}
                </Tooltip.Content>
              </Tooltip.Root>
            {:else}
              <div class="nav-item-wrapper">
                <a
                  href={component.path}
                  class="nav-link"
                  class:active={$page.url.pathname === component.path}
                >
                  <HugeiconsIcon icon={component.icon} size={16} strokeWidth={2} />
                  <span class="nav-link-text nav-text">{component.name}</span>
                </a>
                {#if component.nip}
                  <div class="nav-text">
                    <NipBadge nip={component.nip} />
                  </div>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      {/each}
    {/if}

    {#if isComponentsRoute}
      {#each componentCategories.filter(cat => cat.title !== 'UI Primitives') as category (category.title)}
        <div class="flex flex-col gap-1">
          {#if showContent}
            <h2 class="nav-text m-0 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              {category.title}
              {#if category.nip}
                <NipBadge nip={category.nip} />
              {/if}
            </h2>
          {/if}
          {#each category.items as component (component.path)}
            {#if sidebar.collapsed && !isHovering}
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger class="nav-link-trigger">
                  <a
                    href={component.path}
                    class="nav-link"
                    class:active={$page.url.pathname === component.path}
                  >
                    <HugeiconsIcon icon={component.icon} size={16} strokeWidth={2} />
                  </a>
                </Tooltip.Trigger>
                <Tooltip.Content side="right" sideOffset={8} class="tooltip-content">
                  {#if component.title || component.description}
                    <div class="tooltip-header">{component.title || component.name}</div>
                    {#if component.description}
                      <div class="tooltip-description">{component.description}</div>
                    {/if}
                  {:else}
                    <div class="tooltip-title">{component.name}</div>
                  {/if}
                </Tooltip.Content>
              </Tooltip.Root>
            {:else}
              <div class="nav-item-wrapper">
                <a
                  href={component.path}
                  class="nav-link"
                  class:active={$page.url.pathname === component.path}
                >
                  <HugeiconsIcon icon={component.icon} size={16} strokeWidth={2} />
                  <span class="nav-link-text nav-text">{component.name}</span>
                </a>
                {#if component.nip}
                  <div class="nav-text">
                    <NipBadge nip={component.nip} />
                  </div>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      {/each}
    {/if}
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
  </Tooltip.Provider>
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
    opacity: 0;
    pointer-events: none;
  }

  .sidebar.collapsed:hover .nav-text {
    opacity: 1;
    pointer-events: auto;
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

  :global(.nav-link-trigger) {
    all: unset;
    display: block;
    width: 100%;
  }

  .nav-item-wrapper {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    color: var(--muted-foreground);
    text-decoration: none;
    transition: all 0.15s ease-in-out;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .nav-link-text {
    flex: 0 1 auto;
    min-width: 0;
  }

  .sidebar.collapsed .nav-link {
    width: 100%;
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

  :global(.tooltip-content) {
    background: var(--popover);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 0.75rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    z-index: 1000;
    min-width: 200px;
    max-width: 320px;
  }

  :global(.tooltip-header) {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 0.375rem;
  }

  :global(.tooltip-description) {
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--muted-foreground);
  }

  :global(.tooltip-title) {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--foreground);
  }
</style>
