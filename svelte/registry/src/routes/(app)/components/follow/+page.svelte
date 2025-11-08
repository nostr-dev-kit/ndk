<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import PageTitle from '$lib/site/components/PageTitle.svelte';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import code examples
  import followButtonCode from './examples/basic/index.txt?raw';
  import followButtonPillCode from './examples/pill/index.txt?raw';
  import followButtonAnimatedCode from './examples/animated/index.txt?raw';

  // Import block components
  import FollowButton from '$lib/registry/components/follow/buttons/basic/follow-button.svelte';
  import FollowButtonPill from '$lib/registry/components/follow/buttons/pill/follow-button-pill.svelte';
  import FollowButtonAnimated from '$lib/registry/components/follow/buttons/animated/follow-button-animated.svelte';

  // Import component metadata from registry
  import followButtonMinimalCard from '$lib/registry/components/follow/buttons/basic/registry.json';
  import followButtonPillCard from '$lib/registry/components/follow/buttons/pill/registry.json';
  import followButtonAnimatedCard from '$lib/registry/components/follow/buttons/animated/registry.json';

  // Page metadata
  const metadata = {
    title: 'Follow Buttons',
    description: 'Interactive follow buttons with multiple variants and styles for users and topics'
  };

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleUser = $state<NDKUser | undefined>();

  // Showcase blocks
  const showcaseComponents: ShowcaseComponent[] = [
    {
      id: 'follow-button-minimal',
      cardData: followButtonMinimalCard,
      preview: minimalPreview
    },
    {
      id: 'follow-button-minimal-icon-only',
      cardData: followButtonMinimalCard,
      preview: minimalIconOnlyPreview
    },
    {
      id: 'follow-button-pill-solid',
      cardData: followButtonPillCard,
      preview: pillSolidPreview
    },
    {
      id: 'follow-button-pill-outline',
      cardData: followButtonPillCard,
      preview: pillOutlinePreview
    },
    {
      id: 'follow-button-pill-compact',
      cardData: followButtonPillCard,
      preview: pillCompactPreview
    },
    {
      id: 'follow-button-animated',
      cardData: followButtonAnimatedCard,
      preview: animatedPreview
    }
  ];

</script>

<!-- Preview snippets for showcase -->
{#snippet minimalPreview()}
  {#if sampleUser}
    <FollowButton {ndk} target={sampleUser} showTarget={true} />
  {/if}
{/snippet}

{#snippet minimalIconOnlyPreview()}
  {#if sampleUser}
    <FollowButton {ndk} target={sampleUser} />
  {/if}
{/snippet}

{#snippet pillSolidPreview()}
  {#if sampleUser}
    <FollowButtonPill {ndk} target={sampleUser} variant="solid" showTarget={true} />
  {/if}
{/snippet}

{#snippet pillOutlinePreview()}
  {#if sampleUser}
    <FollowButtonPill {ndk} target={sampleUser} variant="outline" showTarget={true} />
  {/if}
{/snippet}

{#snippet pillCompactPreview()}
  {#if sampleUser}
    <FollowButtonPill {ndk} target={sampleUser} compact />
  {/if}
{/snippet}

{#snippet animatedPreview()}
  {#if sampleUser}
    <FollowButtonAnimated {ndk} target={sampleUser} showTarget={true} />
  {/if}
{/snippet}

<!-- Components snippet -->
{#snippet components()}
  <ComponentCard data={{...followButtonMinimalCard, code: followButtonCode}}>
    {#snippet preview()}
      {#if sampleUser}
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground w-24">Default:</span>
            <FollowButton {ndk} target={sampleUser} />
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground w-24">With User:</span>
            <FollowButton {ndk} target={sampleUser} showTarget={true} />
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground w-24">With Hashtag:</span>
            <FollowButton {ndk} target="bitcoin" showTarget={true} />
          </div>
        </div>
      {/if}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...followButtonPillCard, code: followButtonPillCode}}>
    {#snippet preview()}
      {#if sampleUser}
        <div class="flex flex-col gap-6 items-center">
          <div class="flex flex-col gap-2 items-center">
            <span class="text-xs text-muted-foreground">Default</span>
            <div class="flex flex-wrap gap-4 justify-center">
              <FollowButtonPill {ndk} target={sampleUser} variant="solid" />
              <FollowButtonPill {ndk} target={sampleUser} variant="outline" />
            </div>
          </div>
          <div class="flex flex-col gap-2 items-center">
            <span class="text-xs text-muted-foreground">With User Target</span>
            <div class="flex flex-wrap gap-4 justify-center">
              <FollowButtonPill {ndk} target={sampleUser} variant="solid" showTarget={true} />
              <FollowButtonPill {ndk} target={sampleUser} variant="outline" showTarget={true} />
            </div>
          </div>
          <div class="flex flex-col gap-2 items-center">
            <span class="text-xs text-muted-foreground">With Hashtag Target</span>
            <div class="flex flex-wrap gap-4 justify-center">
              <FollowButtonPill {ndk} target="nostr" variant="solid" showTarget={true} />
              <FollowButtonPill {ndk} target="bitcoin" variant="outline" showTarget={true} />
            </div>
          </div>
          <div class="flex flex-col gap-2 items-center">
            <span class="text-xs text-muted-foreground">Compact (Hover to expand)</span>
            <div class="flex flex-wrap gap-4 justify-center">
              <FollowButtonPill {ndk} target={sampleUser} compact />
              <FollowButtonPill {ndk} target={sampleUser} compact variant="outline" />
            </div>
          </div>
          <div class="flex flex-col gap-2 items-center">
            <span class="text-xs text-muted-foreground">Compact + Target (Hover to see name)</span>
            <div class="flex flex-wrap gap-4 justify-center">
              <FollowButtonPill {ndk} target={sampleUser} compact showTarget={true} variant="solid" />
              <FollowButtonPill {ndk} target={sampleUser} compact showTarget={true} variant="outline" />
            </div>
          </div>
        </div>
      {/if}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...followButtonAnimatedCard, code: followButtonAnimatedCode}}>
    {#snippet preview()}
      {#if sampleUser}
        <div class="flex flex-col gap-6 items-center">
          <div class="flex flex-col gap-2 items-center">
            <span class="text-xs text-muted-foreground">Default</span>
            <div class="flex flex-wrap gap-4 justify-center">
              <FollowButtonAnimated {ndk} target={sampleUser} />
            </div>
          </div>
          <div class="flex flex-col gap-2 items-center">
            <span class="text-xs text-muted-foreground">With User Target</span>
            <div class="flex flex-wrap gap-4 justify-center">
              <FollowButtonAnimated {ndk} target={sampleUser} showTarget={true} />
            </div>
          </div>
          <div class="flex flex-col gap-2 items-center">
            <span class="text-xs text-muted-foreground">With Hashtag Target</span>
            <div class="flex flex-wrap gap-4 justify-center">
              <FollowButtonAnimated {ndk} target="nostr" showTarget={true} />
              <FollowButtonAnimated {ndk} target="bitcoin" showTarget={true} />
            </div>
          </div>
        </div>
      {/if}
    {/snippet}
  </ComponentCard>
{/snippet}


<!-- Custom Builder API section -->
{#snippet customSections()}
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder API</h2>
    <p class="text-muted-foreground mb-6">
      Use <code class="px-2 py-1 bg-muted rounded text-sm">createFollowAction()</code> to build custom follow button implementations with reactive state management.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">createFollowAction</h3>
      <pre class="text-sm overflow-x-auto"><code>import &#123; createFollowAction &#125; from '@nostr-dev-kit/svelte';

// Create follow action
const followAction = createFollowAction(() => (&#123; target: user &#125;), ndk);

// Access reactive state
followAction.isFollowing  // boolean - whether currently following

// Toggle follow/unfollow
await followAction.follow();</code></pre>

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
          <li><code>isFollowing</code>: boolean - Current follow state</li>
          <li><code>follow()</code>: async function - Toggle follow/unfollow</li>
        </ul>
      </div>
    </div>
  </section>
{/snippet}

<ComponentPageTemplate
  {metadata}
  showcaseTitle="Follow Button Variants"
  showcaseDescription="Explore different follow button designs for your Nostr application"
  {ndk}
  {showcaseComponents}
  {components}
  {customSections}
>
  <EditProps.Prop
    name="Sample User"
    type="user"
    default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
    bind:value={sampleUser}
  />
</ComponentPageTemplate>
