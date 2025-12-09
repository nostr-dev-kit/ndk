<script lang="ts">
  import BlockPageLayout from '$site-components/BlockPageLayout.svelte';
  import Preview from '$site-components/preview.svelte';

  const exampleCode = `<TimelineFeed
  {ndk}
  filter={{ kinds: [1] }}
  limit={50}
  enableRealtime={true}
/>`;
</script>

<BlockPageLayout
  title="Timeline Feeds"
  subtitle="Infinite scroll feeds with real-time updates, filtering, and multiple layout options. Build Twitter-like, Instagram-like, or custom feed experiences in minutes."
  tags={['Kind 1', 'NIP-01', '5 variants']}
>
  {#snippet topPreview()}
    <Preview title="Timeline Feeds" code={exampleCode} previewAreaClass="max-h-none">
      <div class="text-center text-muted-foreground">
        <p>Preview goes here</p>
        <p class="text-sm mt-2">Replace with actual component preview</p>
      </div>
    </Preview>
  {/snippet}
</BlockPageLayout>

<div class="max-w-7xl mx-auto px-8 pb-8">

  <!-- Component API Section -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-3">Component API</h2>

    <table class="w-full bg-muted border border-border rounded-xl overflow-hidden border-collapse">
      <thead>
        <tr>
          <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Prop</th>
          <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Type</th>
          <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Default</th>
          <th class="bg-accent py-3.5 px-5 text-left text-sm font-semibold border-b border-border text-muted-foreground">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">ndk</code></td>
          <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">NDKSvelte</code></td>
          <td class="p-4 border-b border-border text-sm">—</td>
          <td class="p-4 border-b border-border text-sm">NDK instance (optional if provided via context)</td>
        </tr>
        <tr>
          <td class="p-4 border-b border-border text-sm">
            <code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">filter</code>
            <span class="bg-red-500/20 text-red-500 py-1 px-2 rounded text-xs font-medium ml-2">required</span>
          </td>
          <td class="p-4 border-b border-border text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">NDKFilter</code></td>
          <td class="p-4 border-b border-border text-sm">—</td>
          <td class="p-4 border-b border-border text-sm">Filter for events to display</td>
        </tr>
        <tr>
          <td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">limit</code></td>
          <td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">number</code></td>
          <td class="p-4 border-b-0 text-sm"><code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">50</code></td>
          <td class="p-4 border-b-0 text-sm">Initial number of events to load</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- Builder API Section -->
  <section class="mb-16">
    <h2 class="text-[1.75rem] font-bold mb-3">Builder API</h2>
    <p class="text-muted-foreground mb-8 text-[1.05rem]">
      Use the <code class="bg-primary/10 py-1 px-2 rounded font-mono text-[0.85em] text-primary">createTimelineFeed</code> builder for full control over feed behavior.
    </p>

    <div class="bg-background border border-border rounded-xl overflow-x-auto">
      <pre class="font-mono text-sm leading-relaxed text-foreground m-0 p-6"><code>import {'{'} createTimelineFeed {'}'} from '@nostr-dev-kit/svelte';

const feed = createTimelineFeed(() => ({'{'}
  filter: {'{'} kinds: [1], limit: 50 {'}'},
  enableRealtime: true
{'}'}), ndk);

// Access reactive state
feed.events       // $state array of NDKEvent[]
feed.isLoading    // $state boolean
feed.hasMore      // $state boolean

// Methods
await feed.loadMore()
await feed.refresh()</code></pre>
    </div>
  </section>
</div>
