<script lang="ts">
  import { EventCard } from '$lib/registry/components/event-card';
  import EventCardMenu from '$lib/registry/components/blocks/event-card-menu.svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { fly } from 'svelte/transition';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  type ContentType = 'kind1' | 'kind30023' | 'kind30040' | 'custom';
  let selectedType = $state<ContentType>('kind1');

  const contentExamples = {
    kind1: {
      label: 'Short Note (kind 1)',
      content: 'Just posted a new article about Nostr! Check it out 🚀'
    },
    kind30023: {
      label: 'Long-form Article (kind 30023)',
      content: `# Understanding Nostr Protocol

The Nostr protocol is a simple, open protocol that enables global, decentralized, and censorship-resistant social media...

## Key Features
- No central server
- Cryptographic keys as identity
- Relay-based architecture`
    },
    kind30040: {
      label: 'Video Event (kind 30040)',
      content: '[Video Preview]\n📹 My latest tutorial: Building with NDK\n⏱️ Duration: 15:23'
    },
    custom: {
      label: 'Custom Content',
      content: '✨ Any content you imagine can go here!\n\nThe EventCard chrome stays consistent while the content changes.'
    }
  };
</script>

<div class="space-y-4">
  <!-- Type Selector -->
  <div class="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg border border-border">
    {#each Object.entries(contentExamples) as [type, { label }]}
      <button
        class="px-3 py-1.5 text-sm rounded-md transition-colors {selectedType === type
          ? 'bg-primary text-primary-foreground'
          : 'bg-background border border-border hover:bg-muted'}"
        onclick={() => selectedType = type as ContentType}
      >
        {label}
      </button>
    {/each}
  </div>

  <!-- EventCard with Chrome -->
  <EventCard.Root {ndk} {event} class="border rounded-lg p-4 bg-card">
    <EventCard.Header>
      <EventCardMenu {ndk} {event} />
    </EventCard.Header>

    <!-- Animated Content Slot -->
    <div class="min-h-[120px] relative">
      {#key selectedType}
        <div
          class="absolute inset-0 flex items-center justify-center"
          in:fly={{ y: 20, duration: 300, delay: 150 }}
          out:fly={{ y: -20, duration: 150 }}
        >
          <div class="w-full p-6 bg-muted/20 rounded-md border-2 border-dashed border-primary/30">
            <div class="text-sm font-mono text-muted-foreground mb-3">
              Content Area: {contentExamples[selectedType].label}
            </div>
            <div class="text-sm whitespace-pre-line">
              {contentExamples[selectedType].content}
            </div>
          </div>
        </div>
      {/key}
    </div>

    <EventCard.Actions>
      <div class="flex gap-2 text-sm text-muted-foreground">
        <button class="hover:text-foreground transition-colors">💬 Reply</button>
        <button class="hover:text-foreground transition-colors">🔄 Repost</button>
        <button class="hover:text-foreground transition-colors">❤️ Like</button>
      </div>
    </EventCard.Actions>
  </EventCard.Root>

  <p class="text-xs text-muted-foreground text-center italic">
    Notice how the header, actions, and layout remain consistent regardless of content type
  </p>
</div>
