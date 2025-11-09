<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import UIPrimitivePageTemplate from '$lib/site/templates/UIPrimitivePageTemplate.svelte';
  import Preview from '$site-components/preview.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { Amount as ZapAmount, Content as ZapContent } from '$lib/registry/ui/zap';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import Styled from './examples/styled/index.svelte';
  import StyledRaw from './examples/styled/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Mock zap for anatomy visualization
  const mockZap = {
    amount: 1000,
    comment: 'Great post!',
    sender: { pubkey: 'mock' },
    recipient: { pubkey: 'recipient-mock' }
  };

  // Page metadata
  const metadata = {
    title: 'Zap',
    description: 'Headless primitives for displaying Lightning zap information. Simple components for showing zap amounts in satoshis and optional zap comments/messages with full styling control.',
    importPath: 'ui/zap',
    nips: ['57'],
    primitives: [
      {
        name: 'ZapAmount',
        title: 'ZapAmount',
        description: 'Displays the zap amount in satoshis. This is a simple display primitive that shows the raw satoshi value from a ProcessedZap object. Add your own formatting and styling as needed.',
        apiDocs: [{
          name: 'ZapAmount',
          description: 'Displays the zap amount in satoshis. This is a simple display primitive that shows the raw satoshi value from a ProcessedZap object. Add your own formatting and styling as needed.',
          importPath: '$lib/registry/ui/zap',
          props: [
            { name: 'zap', type: 'ProcessedZap', default: 'required', description: 'Processed zap object containing amount and metadata' },
            { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
          ]
        }]
      },
      {
        name: 'ZapContent',
        title: 'ZapContent',
        description: 'Displays the zap comment/message if present. Automatically handles conditional rendering—renders nothing if the comment is empty. This allows you to always include the component without manual conditional checks.',
        apiDocs: [{
          name: 'ZapContent',
          description: 'Displays the zap comment/message if present. Automatically handles conditional rendering—renders nothing if the comment is empty. This allows you to always include the component without manual conditional checks.',
          importPath: '$lib/registry/ui/zap',
          props: [
            { name: 'zap', type: 'ProcessedZap', default: 'required', description: 'Processed zap object containing comment and metadata' },
            { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
          ]
        }]
      }
    ],
    anatomyLayers: [
      {
        id: 'amount',
        label: 'ZapAmount',
        description: 'Displays the zap amount in satoshis. Shows raw numerical value for flexible formatting.',
        props: ['zap', 'class']
      },
      {
        id: 'content',
        label: 'ZapContent',
        description: 'Displays optional zap comment. Only renders when comment exists.',
        props: ['zap', 'class']
      }
    ]
  };
</script>

<svelte:head>
  <title>Zap Primitives - NDK Svelte</title>
  <meta name="description" content="Headless primitives for displaying Lightning zap information including amount and comment content." />
</svelte:head>

<UIPrimitivePageTemplate {metadata} {ndk}>
  {#snippet topExample()}
    <Preview
      title="Basic Display"
      code={BasicRaw}
    >
      <Basic />
    </Preview>
  {/snippet}

  {#snippet overview()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Overview</h2>
      <p class="text-lg leading-relaxed text-muted-foreground mb-8">
        Zap primitives provide simple, headless components for displaying Lightning zap information from NIP-57 zap receipt events.
        They handle zap amounts and optional comments, giving you complete control over styling and layout.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
      <p class="leading-relaxed mb-4">
        Use Zap primitives when you need to:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Display Lightning zap amounts on posts or content</li>
        <li class="leading-relaxed">Show zap comments/messages alongside amounts</li>
        <li class="leading-relaxed">Build custom zap lists or feeds with your own styling</li>
        <li class="leading-relaxed">Create zap leaderboards or statistics displays</li>
        <li class="leading-relaxed">Integrate zap information with user profiles or other primitives</li>
      </ul>
      <p class="leading-relaxed mt-4 text-muted-foreground">
        Note: These are display-only primitives. For sending zaps, use <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">createZapAction</code> builder,
        Zap button components, or NDK's <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">NDKZapper</code> directly.
      </p>
    </section>
  {/snippet}

  {#snippet anatomyPreview()}
    <div class="flex items-center gap-6 p-6 border border-border rounded-lg bg-card">
      <ComponentAnatomy.Layer id="amount" label="ZapAmount">
        <div class="flex items-center gap-2">
          <span class="text-2xl">⚡</span>
          <ZapAmount zap={mockZap} class="text-2xl font-bold text-yellow-600" />
          <span class="text-sm text-muted-foreground">sats</span>
        </div>
      </ComponentAnatomy.Layer>
      <ComponentAnatomy.Layer id="content" label="ZapContent">
        <ZapContent zap={mockZap} class="text-sm text-muted-foreground italic" />
      </ComponentAnatomy.Layer>
    </div>
  {/snippet}

  {#snippet examples()}
    <div>
      <h3 class="text-xl font-semibold mb-3">Styled Zap Cards</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Build custom zap cards with your own styling. Combine amount and content primitives with
        layout elements to create rich zap displays.
      </p>
      <Preview
        title="Styled Cards"
        code={StyledRaw}
      >
        <Styled />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Zap Lists</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Common pattern for displaying lists of zaps with conditional comment rendering.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import { ZapAmount, ZapContent } from '$lib/registry/ui/zap';

let zaps: ProcessedZap[] = zapFeed.zaps;

{#each zaps as zap}
  <div class="zap-item">
    <div class="zap-amount">
      ⚡ <ZapAmount {zap} /> sats
    </div>
    {#if zap.comment}
      <ZapContent {zap} class="zap-comment" />
    {/if}
  </div>
{/each}`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Loading Zaps from NDK</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Get processed zaps using NDK Svelte's zap builders, which handle all parsing and validation.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { createZapFeed } from '@nostr-dev-kit/svelte';

// Create zap feed for an event
const zapFeed = createZapFeed(() => ({
  eventId: event.id
}), ndk);

// Access processed zaps
$effect(() => {
  const zaps = zapFeed.zaps; // ProcessedZap[]

  zaps.forEach(zap => {
    console.log(\`\${zap.amount} sats: \${zap.comment}\`);
  });
});`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Integration with User Primitives</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Combine with User primitives to show zap senders alongside zap information.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import { ZapAmount, ZapContent } from '$lib/registry/ui/zap';
import { User } from '$lib/registry/ui/user';

{#each zaps as zap}
  <div class="zap-with-sender">
    <User.Root {ndk} pubkey={zap.sender.pubkey}>
      <User.Avatar class="w-8 h-8" />
      <User.Name />
    </User.Root>

    <div class="zap-details">
      <ZapAmount {zap} /> sats
      <ZapContent {zap} />
    </div>
  </div>
{/each}`}
        />
      </div>
    </div>
  {/snippet}

  {#snippet contextSection()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">ProcessedZap Type</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Zaps are represented by the ProcessedZap type from NDK Svelte. This type is created by NDK's zap builders,
        which handle parsing kind 9735 zap receipt events, extracting amounts from bolt11 invoices, and validating
        sender information.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import type { ProcessedZap } from '@nostr-dev-kit/svelte';

interface ProcessedZap {
  amount: number;          // Amount in satoshis
  comment?: string;        // Optional zap comment/message
  sender: {
    pubkey: string;
    profile?: NDKUserProfile;
  };
  // ... other metadata
}`}
        />
      </div>
      <h3 class="text-xl font-semibold mt-8 mb-4">NIP-57 Zaps</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        These primitives display zap data from NIP-57 (Lightning Zaps) events:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Kind 9735 zap receipt events</li>
        <li class="leading-relaxed">Amount extracted from bolt11 invoice</li>
        <li class="leading-relaxed">Optional comment from zap request</li>
        <li class="leading-relaxed">Sender information from zap request</li>
      </ul>
    </section>
  {/snippet}

  {#snippet relatedComponents()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/components/zap" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Zap Components</strong>
          <span class="text-sm text-muted-foreground">Pre-built zap action buttons</span>
        </a>
        <a href="/ui/user" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">User Primitives</strong>
          <span class="text-sm text-muted-foreground">For displaying zap senders</span>
        </a>
      </div>
    </section>
  {/snippet}
</UIPrimitivePageTemplate>
