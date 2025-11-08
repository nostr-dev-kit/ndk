<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';  import type { ShowcaseComponent } from '$lib/site/templates/types';
  import { EditProps } from '$lib/site/components/edit-props';
  import PageTitle from '$lib/site/components/PageTitle.svelte';
  import Alert from '$site-components/alert.svelte';

  // Import code examples
  import muteButtonCode from './examples/basic/index.txt?raw';
  import muteCustomCode from './examples/custom/index.txt?raw';

  import MuteButton from '$lib/registry/components/mute/buttons/basic/mute-button.svelte';

  // Get page data
  let { data } = $props();
  const { metadata } = data;

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleUser = $state<NDKUser | undefined>();

  // Showcase blocks
    const showcaseComponents: ShowcaseComponent[] = [
    {
      cardData: metadata.cards[0],
      preview: muteButtonPreview
    },
    {
      cardData: metadata.cards[1],
      preview: customPreview
    }
  ];
</script>

<!-- Preview snippets -->
{#snippet muteButtonPreview()}
  {#if sampleUser}
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-4">
        <span class="text-sm text-muted-foreground w-24">Default:</span>
        <MuteButton {ndk} target={sampleUser} />
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-muted-foreground w-24">With User:</span>
        <MuteButton {ndk} target={sampleUser} showTarget={true} />
      </div>
    </div>
  {/if}
{/snippet}

{#snippet customPreview()}
  {#if sampleUser}
    <UIComposition {ndk} user={sampleUser} />
  {/if}
{/snippet}

<!-- Title section -->
<!-- Component previews for Components section -->
{#snippet muteButtonComponentPreview()}
  {#if sampleUser}
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-4">
        <span class="text-sm text-muted-foreground w-24">Default:</span>
        <MuteButton {ndk} target={sampleUser} />
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-muted-foreground w-24">With User:</span>
        <MuteButton {ndk} target={sampleUser} showTarget={true} />
      </div>
    </div>
  {/if}
{/snippet}

{#snippet customComponentPreview()}
  {#if sampleUser}
    <UIComposition {ndk} user={sampleUser} />
  {/if}
{/snippet}

<!-- Custom sections for Builder API and ndk.$mutes API -->
{#snippet customSections()}
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder API</h2>
    <p class="text-muted-foreground mb-6">
      Use <code class="px-2 py-1 bg-muted rounded text-sm">createMuteAction()</code> to build custom mute button implementations with reactive state management.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">createMuteAction</h3>
      <pre class="text-sm overflow-x-auto"><code>import import &#123; createMuteAction &#125; from '@nostr-dev-kit/svelte'#123; createMuteAction import &#123; createMuteAction &#125; from '@nostr-dev-kit/svelte'#125; from '$lib/registry/builders/mute-action.svelte.js';

// Create mute action
const muteAction = createMuteAction(() => (&#123; target: user &#125;), ndk);

// Access reactive state
muteAction.isMuted  // boolean - whether currently muted

// Toggle mute/unmute
await muteAction.mute();</code></pre>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Parameters:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>
            <code>options</code>: Function returning &#123; target: NDKUser | string &#125;
          </li>
          <li><code>ndk</code>: NDKSvelte instance</li>
        </ul>
      </div>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Returns:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><code>isMuted</code>: boolean - Current mute state</li>
          <li><code>mute()</code>: async function - Toggle mute/unmute</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-2">ndk.$mutes API</h2>
    <p class="text-muted-foreground mb-6">
      The <code class="px-2 py-1 bg-muted rounded text-sm">ndk.$mutes</code> store provides a Set-like interface with async methods that publish to the network.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">ndk.$mutes API</h3>
      <pre class="text-sm overflow-x-auto bg-background rounded p-4 border border-border"><code>{`// Check if user is muted (use $derived for reactivity)
const isMuted = $derived(ndk.$mutes.has(pubkey));

// Mute a user
await ndk.$mutes.mute(pubkey);

// Unmute a user
await ndk.$mutes.unmute(pubkey);

// Toggle mute status
await ndk.$mutes.toggle(pubkey);

// Iterate over muted users
for (const pubkey of ndk.$mutes) {
  console.log(\`Muted: \${pubkey}\`);
}

// Get count (use $derived for reactivity)
const count = $derived(ndk.$mutes.size);`}</code></pre>
    </div>
  </section>
{/snippet}

<ComponentPageTemplate
  metadata={metadata}
  {ndk}
  {showcaseComponents}
  componentsSection={{
    cards: [
      { ...metadata.cards[0], code: muteButtonCode },
      { ...metadata.cards[1], code: muteCustomCode }
    ],
    previews: {
      'mute-button': muteButtonComponentPreview,
      'mute-custom': customComponentPreview
    }
  }}
  apiDocs={metadata.apiDocs}
  {customSections}
>
  {#if !ndk.$currentUser}
    <Alert variant="warning" title="Login required">
      <p>You need to be logged in to mute/unmute users. Click "Login" in the sidebar to continue.</p>
    </Alert>
  {/if}

  <EditProps.Prop
    name="Sample User"
    type="user"
    default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
    bind:value={sampleUser}
  />
</ComponentPageTemplate>
