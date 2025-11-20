<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let portalTarget = $state<HTMLDivElement | undefined>(undefined);

  $effect(() => {
    // Create portal container
    const target = document.createElement('div');
    target.style.position = 'relative';
    target.style.zIndex = '9999';
    document.body.appendChild(target);
    portalTarget = target;

    return () => {
      if (document.body.contains(target)) {
        document.body.removeChild(target);
      }
    };
  });
</script>

{#if portalTarget}
  <div style="display: contents;">
    {@render children()}
  </div>
{/if}
