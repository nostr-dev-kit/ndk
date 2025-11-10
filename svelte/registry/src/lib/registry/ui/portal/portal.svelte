<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let portalTarget = $state<HTMLDivElement | undefined>(undefined);

  $effect(() => {
    // Create portal container
    portalTarget = document.createElement('div');
    portalTarget.style.position = 'relative';
    portalTarget.style.zIndex = '9999';
    document.body.appendChild(portalTarget);

    return () => {
      if (portalTarget && document.body.contains(portalTarget)) {
        document.body.removeChild(portalTarget);
      }
    };
  });
</script>

{#if portalTarget}
  <div style="display: contents;">
    {@render children()}
  </div>
{/if}
