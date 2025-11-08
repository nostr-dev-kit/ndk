<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import UIPrimitivePageTemplate from '$lib/site/templates/UIPrimitivePageTemplate.svelte';
  import Preview from '$site-components/Demo.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { VoiceMessage } from '$lib/registry/ui/voice-message';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import WithWaveform from './examples/with-waveform/index.svelte';
  import WithWaveformRaw from './examples/with-waveform/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Mock voice message for anatomy visualization
  const mockVoiceMessage = {
    url: 'https://example.com/voice.mp3',
    duration: 155,
    waveform: [0.2, 0.5, 0.8, 0.6, 0.4, 0.7, 0.9, 0.3]
  };

  // Page metadata
  const metadata = {
    title: 'Voice Message',
    description: 'Headless, composable primitives for displaying voice message content. Supports audio playback controls, waveform visualization, and duration display with integration for NDKVoiceMessage events.',
    importPath: 'ui/embedded-event',
    nips: [],
    primitives: [
      {
        name: 'VoiceMessage.Root',
        title: 'VoiceMessage.Root',
        description: 'Context provider that manages voice message state and provides it to child components. Required wrapper for all VoiceMessage primitives.',
        apiDocs: [
          { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
          { name: 'voiceMessage', type: 'NDKVoiceMessage', default: 'required', description: 'Voice message event instance' },
          { name: 'interactive', type: 'boolean', default: 'true', description: 'Whether the component is interactive (allows playback and seeking)' },
          { name: 'onclick', type: '(e: MouseEvent) => void', default: 'optional', description: 'Click handler' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
          { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
        ]
      },
      {
        name: 'VoiceMessage.Player',
        title: 'VoiceMessage.Player',
        description: 'Audio playback control button with play/pause functionality. Automatically loads audio from the voice message URL and handles playback state.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'VoiceMessage.Waveform',
        title: 'VoiceMessage.Waveform',
        description: 'Visual waveform representation of the audio amplitude. Renders amplitude data as visual bars, shows playback progress, and supports click-to-seek when interactive.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'VoiceMessage.Duration',
        title: 'VoiceMessage.Duration',
        description: 'Displays the audio duration in mm:ss format (e.g., "2:35" for 2 minutes and 35 seconds).',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      }
    ],
    anatomyLayers: [
      {
        id: 'root',
        label: 'VoiceMessage.Root',
        description: 'Container that provides voice message context and manages audio playback state.',
        props: ['ndk', 'voiceMessage', 'interactive', 'onclick', 'class']
      },
      {
        id: 'player',
        label: 'VoiceMessage.Player',
        description: 'Play/pause button control for audio playback.',
        props: ['class']
      },
      {
        id: 'waveform',
        label: 'VoiceMessage.Waveform',
        description: 'Visual audio waveform with playback progress and seek functionality.',
        props: ['class']
      },
      {
        id: 'duration',
        label: 'VoiceMessage.Duration',
        description: 'Formatted duration display (mm:ss).',
        props: ['class']
      }
    ]
  };
</script>

<svelte:head>
  <title>Voice Message Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying voice message content with audio playback, waveform visualization, and duration display." />
</svelte:head>

<UIPrimitivePageTemplate {metadata} {ndk}>
  {#snippet topExample()}
    <Preview code={BasicRaw}>
      <Basic />
    </Preview>
  {/snippet}

  {#snippet overview()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Overview</h2>
      <p class="text-lg leading-relaxed text-muted-foreground mb-8">
        Voice Message primitives provide headless components for displaying audio voice messages from Nostr events.
        They handle audio playback, waveform visualization, and duration display with complete control over styling and layout.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
      <p class="leading-relaxed mb-4">
        Use Voice Message primitives when you need to:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Display audio voice messages with playback controls</li>
        <li class="leading-relaxed">Show visual waveforms representing audio amplitude</li>
        <li class="leading-relaxed">Build custom voice message players with your own styling</li>
        <li class="leading-relaxed">Create voice message feeds or lists</li>
        <li class="leading-relaxed">Integrate audio playback with other UI primitives</li>
      </ul>
    </section>
  {/snippet}

  {#snippet anatomyPreview()}
    <VoiceMessage.Root {ndk} voiceMessage={mockVoiceMessage}>
      <ComponentAnatomy.Layer id="root" label="VoiceMessage.Root">
        <div class="flex flex-col gap-4 p-6 border border-border rounded-lg bg-card max-w-md">
          <div class="flex items-center gap-4">
            <ComponentAnatomy.Layer id="player" label="VoiceMessage.Player">
              <VoiceMessage.Player class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center" />
            </ComponentAnatomy.Layer>
            <ComponentAnatomy.Layer id="duration" label="VoiceMessage.Duration">
              <VoiceMessage.Duration class="text-sm text-muted-foreground" />
            </ComponentAnatomy.Layer>
          </div>
          <ComponentAnatomy.Layer id="waveform" label="VoiceMessage.Waveform">
            <VoiceMessage.Waveform class="h-16 w-full" />
          </ComponentAnatomy.Layer>
        </div>
      </ComponentAnatomy.Layer>
    </VoiceMessage.Root>
  {/snippet}

  {#snippet examples()}
    <div>
      <h3 class="text-xl font-semibold mb-3">With Waveform Visualization</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Add waveform visualization to show audio amplitude over time. The waveform component
        displays visual bars representing the audio signal and supports click-to-seek functionality.
      </p>
      <Preview
        title="With Waveform"
        description="Add waveform visualization to show audio amplitude over time."
        code={WithWaveformRaw}
      >
        <WithWaveform />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Audio Playback</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        VoiceMessage.Player provides a simple play/pause button that automatically handles audio loading and playback.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<VoiceMessage.Root {ndk} {voiceMessage}>
  <VoiceMessage.Player />
</VoiceMessage.Root>`}
        />
      </div>
      <p class="leading-relaxed text-muted-foreground mb-4">
        The player automatically:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Loads the audio from the voice message URL</li>
        <li class="leading-relaxed">Shows play/pause state</li>
        <li class="leading-relaxed">Handles playback controls</li>
        <li class="leading-relaxed">Updates duration display</li>
      </ul>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Interactive Mode</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Control interactivity with the interactive prop to enable or disable playback and seeking.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<!-- Interactive (default) - allows playback and seeking -->
<VoiceMessage.Root {ndk} {voiceMessage} interactive={true}>
  <VoiceMessage.Player />
  <VoiceMessage.Waveform />
</VoiceMessage.Root>

<!-- Non-interactive - display only -->
<VoiceMessage.Root {ndk} {voiceMessage} interactive={false}>
  <VoiceMessage.Duration />
  <VoiceMessage.Waveform />
</VoiceMessage.Root>`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Complete Player Example</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Build a complete voice message player combining all primitives.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import { VoiceMessage } from '$lib/registry/ui/embedded-event';
import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';

let voiceMessage: NDKVoiceMessage = ...;

<VoiceMessage.Root {ndk} {voiceMessage}>
  <div class="player-card">
    <div class="controls">
      <VoiceMessage.Player />
      <VoiceMessage.Duration />
    </div>
    <VoiceMessage.Waveform class="waveform" />
  </div>
</VoiceMessage.Root>`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Loading Voice Messages</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Load voice messages from Nostr events using NDK.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { NDKVoiceMessage } from '@nostr-dev-kit/ndk';

// From a specific event
const event = await ndk.fetchEvent(filter);
const voiceMessage = NDKVoiceMessage.from(event);

// From a subscription
const sub = ndk.subscribe(filter);
sub.on('event', (event) => {
  const voiceMessage = NDKVoiceMessage.from(event);
  // Use voiceMessage...
});`}
        />
      </div>
    </div>
  {/snippet}

  {#snippet contextSection()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">NDKVoiceMessage</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Voice messages are represented by the NDKVoiceMessage class from NDK, which provides
        properties for audio URL, duration, and optional waveform data.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
import type { NDKEvent } from '@nostr-dev-kit/ndk';

// Create from event
const voiceMessage = NDKVoiceMessage.from(event);

// Access properties
voiceMessage.url        // Audio file URL
voiceMessage.duration   // Duration in seconds
voiceMessage.waveform   // Waveform data (optional)`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Context Access</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Access voice message context in custom components:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { getContext } from 'svelte';
import { type VoiceMessageContext, VOICE_MESSAGE_CONTEXT_KEY } from '$lib/registry/ui/voice-message';

const context = getContext<VoiceMessageContext>(VOICE_MESSAGE_CONTEXT_KEY);

// Available properties:
context.ndk            // NDKSvelte instance
context.voiceMessage   // NDKVoiceMessage instance
context.interactive    // boolean
context.onclick        // Click handler`}
        />
      </div>
    </section>
  {/snippet}

  {#snippet relatedComponents()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/components/cards/voice-message" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Voice Message Cards</strong>
          <span class="text-sm text-muted-foreground">Pre-styled voice message displays</span>
        </a>
        <a href="/ui/event-rendering" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Event Content Primitives</strong>
          <span class="text-sm text-muted-foreground">For displaying event content with media</span>
        </a>
      </div>
    </section>
  {/snippet}
</UIPrimitivePageTemplate>
