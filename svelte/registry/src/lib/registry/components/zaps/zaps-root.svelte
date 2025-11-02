<!--
  @component Zaps.Root
  Root component for displaying zaps. Subscribes to zaps and provides context.
-->
<script lang="ts">
  import type { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte, ProcessedZap } from '@nostr-dev-kit/svelte';
  import { createZapSubscription } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import { setZapsContext, type ZapsStats } from './context.svelte.js';
  import { toProcessedZap } from './utils.js';

  interface Props {
    ndk: NDKSvelte;
    event?: NDKEvent;
    user?: NDKUser;
    validated?: boolean;
    children: Snippet<[ProcessedZap[], ZapsStats]>;
  }

  let { ndk, event, user, validated = false, children }: Props = $props();

  const target = $derived(event || user);

  const zapSubscription = createZapSubscription(ndk, () => {
    if (!target) return undefined;
    return { target, validated };
  });

  const processedZaps = $derived.by((): ProcessedZap[] => {
    if (!target) return [];
    return zapSubscription.events
      .map(e => toProcessedZap(e, target))
      .filter((z): z is ProcessedZap => z !== undefined);
  });

  const stats = $derived.by((): ZapsStats => {
    const uniqueSenders = new Set(processedZaps.map(z => z.sender.pubkey));
    return {
      count: processedZaps.length,
      total: zapSubscription.totalAmount,
      uniqueZappers: uniqueSenders.size,
    };
  });

  // Set context for nested components
  $effect(() => {
    setZapsContext({
      zaps: processedZaps,
      stats,
    });
  });
</script>

{@render children(processedZaps, stats)}
