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
    margin: 0 auto;
  }

  .component-toc {
    position: fixed;
    right: 0;
    top: 3.5rem;
    width: 280px;
    height: calc(100vh - 3.5rem);
    padding: 3rem 2rem;
    overflow-y: auto;
    background: var(--background);
    border-left: 1px solid var(--border);
  }

  /* Hide TOC on smaller screens */
  @media (max-width: 1600px) {
    .component-toc {
      display: none;
    }

    .component-content {
      max-width: 100%;
    }
  }
</style>
