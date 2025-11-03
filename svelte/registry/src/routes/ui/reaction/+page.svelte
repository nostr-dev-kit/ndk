<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic.svelte';
  import BasicRaw from './examples/basic.svelte?raw';
  import CustomEmoji from './examples/custom-emoji.svelte';
  import CustomEmojiRaw from './examples/custom-emoji.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
  <title>Reaction Primitives - NDK Svelte</title>
  <meta name="description" content="Headless primitives for displaying emoji reactions with support for standard emojis and custom NIP-30 emojis." />
</svelte:head>

<div class="component-page">
  <header>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
      <span class="badge badge-nip">NIP-25</span>
      <span class="badge badge-nip">NIP-30</span>
    </div>
    <div class="header-title">
      <h1>Reaction</h1>
    </div>
    <p class="header-description">
      Headless primitives for displaying emoji reactions. Supports both standard Unicode emojis and custom emojis from NIP-30, with automatic extraction from kind:7 reaction events and flexible sizing.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Headless</strong>
        <span>Unstyled, fully customizable</span>
      </div>
      <div class="info-card">
        <strong>NIP-30 Support</strong>
        <span>Custom emoji images</span>
      </div>
      <div class="info-card">
        <strong>Event Integration</strong>
        <span>Auto-extract from kind:7 events</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; Reaction &#125; from '$lib/registry/ui';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <Demo
      title="Basic Usage"
      description="Display standard Unicode emojis with customizable sizes."
      code={BasicRaw}
    >
      <Basic />
    </Demo>

    <Demo
      title="Custom Emojis (NIP-30)"
      description="Display custom emoji images using NIP-30 format with URLs and shortcodes."
      code={CustomEmojiRaw}
    >
      <CustomEmoji />
    </Demo>
  </section>

  <section class="info">
    <h2>Reaction.Display</h2>
    <p class="mb-4">Display component for rendering emoji reactions with support for both standard and custom emojis.</p>
    <ApiTable
      rows={[
        { name: 'emoji', type: 'string', default: 'optional', description: 'Emoji character or shortcode (e.g., "❤️" or ":custom:")' },
        { name: 'url', type: 'string', default: 'optional', description: 'Custom emoji image URL (NIP-30)' },
        { name: 'shortcode', type: 'string', default: 'optional', description: 'Emoji shortcode for accessibility' },
        { name: 'event', type: 'NDKEvent', default: 'optional', description: 'Kind:7 reaction event (auto-extracts emoji data)' },
        { name: 'size', type: 'number', default: '20', description: 'Display size in pixels' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Standard Emojis</h2>
    <p class="mb-4">Display standard Unicode emojis:</p>
    <pre><code>&lt;Reaction.Display emoji="❤️" size=&#123;24&#125; /&gt;
&lt;Reaction.Display emoji="🔥" size=&#123;24&#125; /&gt;
&lt;Reaction.Display emoji="👍" size=&#123;24&#125; /&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Custom Emojis (NIP-30)</h2>
    <p class="mb-4">Display custom emoji images from NIP-30:</p>
    <pre><code>&lt;Reaction.Display
  emoji=":party:"
  url="https://example.com/party.gif"
  shortcode="party"
  size=&#123;24&#125;
/&gt;</code></pre>
    <p class="mb-4">Custom emojis are displayed as images, while standard emojis are rendered as text.</p>
  </section>

  <section class="info">
    <h2>From Reaction Events (NIP-25)</h2>
    <p class="mb-4">Automatically extract and display emoji data from kind:7 reaction events:</p>
    <pre><code>import type &#123; NDKEvent &#125; from '@nostr-dev-kit/ndk';

// kind:7 reaction event
const reactionEvent: NDKEvent = ...;

&lt;Reaction.Display event=&#123;reactionEvent&#125; size=&#123;24&#125; /&gt;</code></pre>
    <p class="mb-4">The component automatically extracts:</p>
    <ul class="ml-6 mb-4 space-y-2">
      <li>Emoji content from <code>event.content</code></li>
      <li>Custom emoji data from <code>["emoji", "&lt;shortcode&gt;", "&lt;url&gt;"]</code> tags</li>
    </ul>
  </section>

  <section class="info">
    <h2>Sizing</h2>
    <p class="mb-4">Control the display size with the size prop (in pixels):</p>
    <pre><code>&lt;Reaction.Display emoji="💜" size=&#123;16&#125; /&gt;  &lt;!-- Small --&gt;
&lt;Reaction.Display emoji="💜" size=&#123;20&#125; /&gt;  &lt;!-- Default --&gt;
&lt;Reaction.Display emoji="💜" size=&#123;24&#125; /&gt;  &lt;!-- Medium --&gt;
&lt;Reaction.Display emoji="💜" size=&#123;32&#125; /&gt;  &lt;!-- Large --&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Event Tag Format</h2>
    <p class="mb-4">For kind:7 reaction events with custom emojis, use this tag format:</p>
    <pre><code>&#123;
  "kind": 7,
  "content": ":party:",
  "tags": [
    ["emoji", "party", "https://example.com/party.gif"],
    ["e", "&lt;reacted-event-id&gt;"],
    ["p", "&lt;author-pubkey&gt;"]
  ]
&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Styling</h2>
    <p class="mb-4">Apply custom styling with the class prop:</p>
    <pre><code>&lt;Reaction.Display
  emoji="❤️"
  size=&#123;24&#125;
  class="hover:scale-110 transition-transform cursor-pointer"
/&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Usage in Reaction Lists</h2>
    <p class="mb-4">Common pattern for displaying multiple reactions:</p>
    <pre><code>import type &#123; NDKEvent &#125; from '@nostr-dev-kit/ndk';

interface ReactionGroup &#123;
  emoji: string;
  url?: string;
  shortcode?: string;
  count: number;
  reacted: boolean;
&#125;

let reactions: ReactionGroup[] = $state([...]);

&#123;#each reactions as reaction&#125;
  &lt;button
    class:reacted=&#123;reaction.reacted&#125;
    onclick=&#123;() => handleReaction(reaction.emoji)&#125;
  &gt;
    &lt;Reaction.Display
      emoji=&#123;reaction.emoji&#125;
      url=&#123;reaction.url&#125;
      shortcode=&#123;reaction.shortcode&#125;
      size=&#123;20&#125;
    /&gt;
    &lt;span&gt;&#123;reaction.count&#125;&lt;/span&gt;
  &lt;/button&gt;
&#123;/each&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Accessibility</h2>
    <p class="mb-4">For custom emojis, the shortcode is used as the alt text for screen readers:</p>
    <pre><code>&lt;!-- Renders as: --&gt;
&lt;img
  src="https://example.com/party.gif"
  alt="party"
  style="width: 24px; height: 24px;"
/&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Integration with Other Primitives</h2>
    <p class="mb-4">Reaction.Display works seamlessly with other UI primitives:</p>
    <pre><code>import &#123; Reaction, EmojiPicker &#125; from '$lib/registry/ui';

// Select emoji from picker
function handleEmojiSelect(emojiData: EmojiData) &#123;
  // Display the selected emoji as a reaction
  selectedEmoji = emojiData;
&#125;

&lt;EmojiPicker.Content &#123;ndk&#125; onSelect=&#123;handleEmojiSelect&#125; /&gt;

&#123;#if selectedEmoji&#125;
  &lt;Reaction.Display
    emoji=&#123;selectedEmoji.emoji&#125;
    url=&#123;selectedEmoji.url&#125;
    shortcode=&#123;selectedEmoji.shortcode&#125;
  /&gt;
&#123;/if&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/components/emoji-picker" class="related-card">
        <strong>Emoji Picker Component</strong>
        <span>For selecting emojis to react with</span>
      </a>
      <a href="/components/reaction" class="related-card">
        <strong>Reaction Components</strong>
        <span>Pre-built reaction UI Primitives</span>
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
    background: var(--color-muted);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-muted-foreground);
  }

  .badge-nip {
    background: var(--primary);
    color: white;
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
    color: var(--color-muted-foreground);
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
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
  }

  .info-card strong {
    font-weight: 600;
    color: var(--color-foreground);
  }

  .info-card span {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  .installation h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .installation pre {
    padding: 1rem;
    background: var(--color-muted);
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
    border: 1px solid var(--color-border);
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
    color: var(--color-foreground);
  }

  .related-card span {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  pre {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--color-muted);
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
    color: var(--color-muted-foreground);
    line-height: 1.6;
  }

  code {
    font-family: 'Monaco', 'Menlo', monospace;
    background: var(--color-muted);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
</style>
