/**
 * Relay.Selector - Headless relay selection primitives
 *
 * A flexible, headless system for selecting relays with complete control over rendering.
 * Users compose their own UI using the context exposed via snippets.
 *
 * @example Basic usage with custom rendering:
 * ```svelte
 * <script>
 *   let selected = $state([]);
 * </script>
 *
 * <Relay.Selector.Root {ndk} bind:selected multiple={true}>
 *   {#snippet children(context)}
 *     {#each context.connectedRelays as relay}
 *       <button
 *         onclick={() => context.toggleRelay(relay)}
 *         data-selected={context.isSelected(relay)}
 *       >
 *         <Relay.Root relayUrl={relay}>
 *           <Relay.Icon />
 *           <Relay.Name />
 *         </Relay.Root>
 *       </button>
 *     {/each}
 *   {/snippet}
 * </Relay.Selector.Root>
 * ```
 *
 * @example With trigger component:
 * ```svelte
 * <Relay.Selector.Root {ndk} bind:selected>
 *   {#snippet children(context)}
 *     <Relay.Selector.Trigger>
 *       {#snippet children(ctx)}
 *         <span>Select Relays ({ctx.selectionCount})</span>
 *       {/snippet}
 *     </Relay.Selector.Trigger>
 *   {/snippet}
 * </Relay.Selector.Root>
 * ```
 */

import Root from './relay-selector-root.svelte';
import Trigger from './relay-selector-trigger.svelte';

// Export as namespace for dot notation
export const Selector = {
  Root,
  Trigger,
};

// Export types
export type { RelaySelectorContext } from './relay-selector-context.svelte.js';
export { RELAY_SELECTOR_CONTEXT_KEY } from './relay-selector-context.svelte.js';
