<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, relayUrl } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
  import { Relay } from '$lib/registry/ui/relay';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    relayUrl: string;
  }

  let { ndk, relayUrl }: Props = $props();
</script>

<Relay.Root {ndk} {relayUrl}>
  <div class="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
    <Relay.Icon />
    <div class="flex-1">
      <Relay.Name class="font-semibold text-foreground" />
      <Relay.Url class="text-sm text-muted-foreground" />
    </div>
  </div>
</Relay.Root>
