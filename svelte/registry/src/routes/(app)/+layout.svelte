<script lang="ts">
  import type { Snippet } from 'svelte';
  import SidebarDrawer from '$site-components/SidebarDrawer.svelte';
  import { sidebar } from '$site/stores/sidebar.svelte';

  let { children }: { children: Snippet } = $props();
</script>

<SidebarDrawer />

<div class="flex justify-center">
  <div
    class="w-full max-w-4xl transition-[margin-left] duration-300 ease-in-out"
    class:!ml-16={sidebar.collapsed}
    class:max-md:!ml-0={!sidebar.open}
    class:max-md:!ml-[280px]={sidebar.open && !sidebar.collapsed}
    class:max-md:!ml-16={sidebar.open && sidebar.collapsed}
  >
    {@render children()}
  </div>
</div>
