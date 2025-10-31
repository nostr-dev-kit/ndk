<script lang="ts">
  import { page } from '$app/stores';
  import { HugeiconsIcon } from '@hugeicons/svelte';
  import { docs, componentCategories } from '$lib/navigation';
  import { sidebarOpen } from '$lib/stores/sidebar';
</script>

<aside class="sidebar" class:open={$sidebarOpen}>

  <nav class="flex-1 overflow-auto flex flex-col px-4 pt-4 gap-6">
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
</aside>

<style>
  .sidebar {
    width: 280px;
    background: var(--color-background);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 3.5rem;
    height: calc(100vh - 3.5rem);
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
