<script lang="ts">
  interface BreadcrumbItem {
    label: string;
    href?: string;
  }

  interface Props {
    items: BreadcrumbItem[];
  }

  let { items }: Props = $props();
</script>

<nav class="flex mb-4" aria-label="Breadcrumb">
  <ol class="inline-flex items-center space-x-1">
    {#each items as item, index}
      <li class="inline-flex items-center">
        {#if index > 0}
          <svg class="w-3 h-3 mx-1 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
          </svg>
        {/if}
        {#if item.href}
          <a href={item.href} class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {item.label}
          </a>
        {:else}
          <span class="text-sm font-medium text-foreground">
            {item.label}
          </span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
