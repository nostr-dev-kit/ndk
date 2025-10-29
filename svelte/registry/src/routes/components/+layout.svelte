<script lang="ts">
  import Toc from '$site-components/toc.svelte';

  let { children } = $props();
</script>

<div class="component-layout">
  <div class="component-content">
    {@render children()}
  </div>

  <aside class="component-toc">
    <Toc />
  </aside>
</div>

<style>
  .component-layout {
    display: flex;
    gap: 4rem;
    position: relative;
  }

  .component-content {
    flex: 1;
    min-width: 0;
    max-width: 1000px;
  }

  .component-toc {
    width: 240px;
    flex-shrink: 0;
  }

  /* Hide TOC on smaller screens */
  @media (max-width: 1400px) {
    .component-toc {
      display: none;
    }

    .component-content {
      max-width: 100%;
    }
  }
</style>
