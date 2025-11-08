<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Preview from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import WithWaveform from './examples/with-waveform/index.svelte';
  import WithWaveformRaw from './examples/with-waveform/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
  <title>Voice Message Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying voice message content with audio playback, waveform visualization, and duration display." />
</svelte:head>

<div class="component-page">
  <header>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
    </div>
    <div class="header-title">
      <h1>Voice Message</h1>
    </div>
    <p class="header-description">
      Headless, composable primitives for displaying voice message content. Supports audio playback controls, waveform visualization, and duration display with integration for NDKVoiceMessage events.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Headless</strong>
        <span>Completely unstyled primitives</span>
      </div>
      <div class="info-card">
        <strong>Audio Playback</strong>
        <span>Built-in player controls</span>
      </div>
      <div class="info-card">
        <strong>Waveform Viz</strong>
        <span>Visual audio representation</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; VoiceMessage &#125; from '$lib/registry/ui/embedded-event.svelte';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <Preview
      title="Basic Player"
      description="VoiceMessage provides audio playback controls with duration display."
      code={BasicRaw}
    >
      <Basic />
    </Preview>

    <Preview
      title="With Waveform"
      description="Add waveform visualization to show audio amplitude over time."
      code={WithWaveformRaw}
    >
      <WithWaveform />
    </Preview>
  </section>

  <section class="info">
    <h2>Available Components</h2>
    <div class="components-grid">
      <div class="component-item">
        <code>VoiceMessage.Root</code>
        <p>Context provider for voice message primitives.</p>
      </div>
      <div class="component-item">
        <code>VoiceMessage.Player</code>
        <p>Audio playback control button.</p>
      </div>
      <div class="component-item">
        <code>VoiceMessage.Waveform</code>
        <p>Visual waveform representation.</p>
      </div>
      <div class="component-item">
        <code>VoiceMessage.Duration</code>
        <p>Audio duration display.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>VoiceMessage.Root</h2>
    <p class="mb-4">Context provider that manages voice message state and provides it to child components.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
        { name: 'voiceMessage', type: 'NDKVoiceMessage', default: 'required', description: 'Voice message event instance' },
        { name: 'interactive', type: 'boolean', default: 'true', description: 'Whether the component is interactive' },
        { name: 'onclick', type: '(e: MouseEvent) => void', default: 'optional', description: 'Click handler' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
      ]}
    />
  </section>

  <section class="info">
    <h2>VoiceMessage.Player</h2>
    <p class="mb-4">Audio playback control button with play/pause functionality.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>VoiceMessage.Waveform</h2>
    <p class="mb-4">Visual waveform representation of the audio amplitude.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>VoiceMessage.Duration</h2>
    <p class="mb-4">Displays the audio duration in minutes:seconds format.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>NDKVoiceMessage</h2>
    <p class="mb-4">Voice messages are represented by the NDKVoiceMessage class from NDK:</p>
    <pre><code>import &#123; NDKVoiceMessage &#125; from '@nostr-dev-kit/ndk';
import type &#123; NDKEvent &#125; from '@nostr-dev-kit/ndk';

// Create from event
const voiceMessage = NDKVoiceMessage.from(event);

// Access properties
voiceMessage.url        // Audio file URL
voiceMessage.duration   // Duration in seconds
voiceMessage.waveform   // Waveform data (optional)</code></pre>
  </section>

  <section class="info">
    <h2>Audio Playback</h2>
    <p class="mb-4">VoiceMessage.Player provides a simple play/pause button:</p>
    <pre><code>&lt;VoiceMessage.Root &#123;ndk&#125; &#123;voiceMessage&#125;&gt;
  &lt;VoiceMessage.Player /&gt;
&lt;/VoiceMessage.Root&gt;</code></pre>
    <p class="mb-4">The player automatically:</p>
    <ul class="ml-6 mb-4 space-y-2">
      <li>Loads the audio from the voice message URL</li>
      <li>Shows play/pause state</li>
      <li>Handles playback controls</li>
      <li>Updates duration display</li>
    </ul>
  </section>

  <section class="info">
    <h2>Waveform Visualization</h2>
    <p class="mb-4">Display a visual representation of the audio waveform:</p>
    <pre><code>&lt;VoiceMessage.Root &#123;ndk&#125; &#123;voiceMessage&#125;&gt;
  &lt;VoiceMessage.Waveform class="h-16 w-full" /&gt;
&lt;/VoiceMessage.Root&gt;</code></pre>
    <p class="mb-4">The waveform component:</p>
    <ul class="ml-6 mb-4 space-y-2">
      <li>Renders amplitude data as visual bars</li>
      <li>Shows playback progress</li>
      <li>Supports click-to-seek (if interactive)</li>
      <li>Gracefully handles missing waveform data</li>
    </ul>
  </section>

  <section class="info">
    <h2>Duration Display</h2>
    <p class="mb-4">Show the audio duration in a formatted way:</p>
    <pre><code>&lt;VoiceMessage.Root &#123;ndk&#125; &#123;voiceMessage&#125;&gt;
  &lt;VoiceMessage.Duration /&gt;
&lt;/VoiceMessage.Root&gt;</code></pre>
    <p class="mb-4">Displays duration in mm:ss format (e.g., "2:35" for 2 minutes and 35 seconds).</p>
  </section>

  <section class="info">
    <h2>Complete Example</h2>
    <p class="mb-4">Build a complete voice message player:</p>
    <pre><code>&lt;script lang="ts"&gt;
  import &#123; VoiceMessage &#125; from '$lib/registry/ui/embedded-event.svelte';
  import type &#123; NDKVoiceMessage &#125; from '@nostr-dev-kit/ndk';

  let voiceMessage: NDKVoiceMessage = ...;
&lt;/script&gt;

&lt;VoiceMessage.Root &#123;ndk&#125; &#123;voiceMessage&#125;&gt;
  &lt;div class="player-card"&gt;
    &lt;div class="controls"&gt;
      &lt;VoiceMessage.Player /&gt;
      &lt;VoiceMessage.Duration /&gt;
    &lt;/div&gt;
    &lt;VoiceMessage.Waveform class="waveform" /&gt;
  &lt;/div&gt;
&lt;/VoiceMessage.Root&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Context Access</h2>
    <p class="mb-4">Access voice message context in custom components:</p>
    <pre><code>import &#123; getContext &#125; from 'svelte';
import &#123; type VoiceMessageContext, VOICE_MESSAGE_CONTEXT_KEY &#125; from '$lib/registry/ui/voice-message';

const context = getContext&lt;VoiceMessageContext&gt;(VOICE_MESSAGE_CONTEXT_KEY);

// Available properties:
context.ndk            // NDKSvelte instance
context.voiceMessage   // NDKVoiceMessage instance
context.interactive    // boolean
context.onclick        // Click handler</code></pre>
  </section>

  <section class="info">
    <h2>Loading Voice Messages</h2>
    <p class="mb-4">Load voice messages from Nostr events:</p>
    <pre><code>import &#123; NDKVoiceMessage &#125; from '@nostr-dev-kit/ndk';

// From a specific event
const event = await ndk.fetchEvent(filter);
const voiceMessage = NDKVoiceMessage.from(event);

// From a subscription
const sub = ndk.subscribe(filter);
sub.on('event', (event) => &#123;
  const voiceMessage = NDKVoiceMessage.from(event);
  // Use voiceMessage...
&#125;);</code></pre>
  </section>

  <section class="info">
    <h2>Interactive Mode</h2>
    <p class="mb-4">Control interactivity with the interactive prop:</p>
    <pre><code>&lt;!-- Interactive (default) - allows playback and seeking --&gt;
&lt;VoiceMessage.Root &#123;ndk&#125; &#123;voiceMessage&#125; interactive=&#123;true&#125;&gt;
  &lt;VoiceMessage.Player /&gt;
  &lt;VoiceMessage.Waveform /&gt;
&lt;/VoiceMessage.Root&gt;

&lt;!-- Non-interactive - display only --&gt;
&lt;VoiceMessage.Root &#123;ndk&#125; &#123;voiceMessage&#125; interactive=&#123;false&#125;&gt;
  &lt;VoiceMessage.Duration /&gt;
  &lt;VoiceMessage.Waveform /&gt;
&lt;/VoiceMessage.Root&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Styling</h2>
    <p class="mb-4">Apply custom styles to any component:</p>
    <pre><code>&lt;VoiceMessage.Root &#123;ndk&#125; &#123;voiceMessage&#125; class="custom-root"&gt;
  &lt;VoiceMessage.Player class="custom-player" /&gt;
  &lt;VoiceMessage.Waveform class="custom-waveform" /&gt;
  &lt;VoiceMessage.Duration class="custom-duration" /&gt;
&lt;/VoiceMessage.Root&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/components/cards/voice-message" class="related-card">
        <strong>Voice Message Cards</strong>
        <span>Pre-styled voice message displays</span>
      </a>
      <a href="/ui/event-rendering" class="related-card">
        <strong>Event Content Primitives</strong>
        <span>For displaying event content with media</span>
      </a>
    </div>
  </section>
</div>

<style>
  .component-page {
    max-width: 900px;
  }

  header {
    margin-bottom: 3rem;
  }

  .header-badge {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    background: var(--muted);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted-foreground);
  }

  .header-title h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, transparent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-description {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--muted-foreground);
    margin: 1rem 0 1.5rem 0;
  }

  .header-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .info-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .info-card strong {
    font-weight: 600;
    color: var(--foreground);
  }

  .info-card span {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  .installation h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .installation pre {
    padding: 1rem;
    background: var(--muted);
    border-radius: 0.5rem;
  }

  section {
    margin-bottom: 3rem;
  }

  section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .component-item {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .component-item code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--primary);
    display: block;
    margin-bottom: 0.5rem;
  }

  .component-item p {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .related-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .related-card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }

  .related-card strong {
    font-weight: 600;
    color: var(--foreground);
  }

  .related-card span {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  pre {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--muted);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  pre code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  ul {
    list-style: disc;
  }

  ul li {
    color: var(--muted-foreground);
    line-height: 1.6;
  }

  code {
    font-family: 'Monaco', 'Menlo', monospace;
    background: var(--muted);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
</style>
