<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/stores';
  import SidebarDrawer from '$site-components/SidebarDrawer.svelte';
  import Toc from '$site-components/toc.svelte';
  import { sidebar } from '$lib/stores/sidebar.svelte';

  let { children }: { children: Snippet } = $props();

  const showTocForRoute = $derived(
    $page.url.pathname.startsWith('/components/') ||
    $page.url.pathname.startsWith('/events/') ||
    $page.url.pathname.startsWith('/docs/') ||
    $page.url.pathname.startsWith('/ui/')
  );
</script>

<SidebarDrawer />

<div class="flex justify-center">
  <div
    class="w-full max-w-[1000px] border-l border-r border-border transition-[margin-left] duration-300 ease-in-out ml-[280px] md:ml-[280px]"
    class:!ml-16={sidebar.collapsed}
    class:max-md:!ml-0={!sidebar.open}
    class:max-md:!ml-[280px]={sidebar.open && !sidebar.collapsed}
    class:max-md:!ml-16={sidebar.open && sidebar.collapsed}
    class:!mr-[280px]={showTocForRoute}
    class:max-2xl:!mr-0={showTocForRoute}
  >
    {@render children()}
  </div>
</div>

{#if showTocForRoute}
  <aside class="fixed right-0 top-14 w-[280px] h-[calc(100vh-3.5rem)] py-12 px-8 overflow-y-auto bg-background border-l border-border max-2xl:hidden">
    <Toc />
  </aside>
{/if}
