<script lang="ts">
  import { setContext } from 'svelte';
  import { createNegentropySync } from '../../builders/negentropy-sync/index.js';
  import { NEGENTROPY_SYNC_CONTEXT_KEY, type NegentropySyncContext } from './negentropy-sync.context.js';
  import type { Snippet } from 'svelte';
  import { cn } from "../../utils/cn.js";

  interface Props {
    /** Sync builder instance created with createNegentropySync() */
    syncBuilder: ReturnType<typeof createNegentropySync>;

    /** Additional CSS classes */
    class?: string;

    /** Child components */
    children: Snippet;
  }

  let {
    syncBuilder,
    class: className = '',
    children
  }: Props = $props();

  // Create reactive context using getters to preserve reactivity
  const context: NegentropySyncContext = {
    get syncing() { return syncBuilder.syncing; },
    get totalRelays() { return syncBuilder.totalRelays; },
    get completedRelays() { return syncBuilder.completedRelays; },
    get totalEvents() { return syncBuilder.totalEvents; },
    get progress() { return syncBuilder.progress; },
    get relays() { return syncBuilder.relays; },
    get errors() { return syncBuilder.errors; },
    get velocity() { return syncBuilder.velocity; },
    get estimatedTimeRemaining() { return syncBuilder.estimatedTimeRemaining; },
    get activeNegotiations() { return syncBuilder.activeNegotiations; }
  };

  setContext(NEGENTROPY_SYNC_CONTEXT_KEY, context);

  // Expose builder for imperative actions
  setContext('negentropy-sync-builder', syncBuilder);
</script>

<div class={cn("contents", className)}>
  {@render children()}
</div>
