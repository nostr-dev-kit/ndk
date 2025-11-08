<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';  import { EditProps } from '$lib/site-components/edit-props';
  import PageTitle from '$lib/site-components/PageTitle.svelte';
  import type { ShowcaseComponent } from '$lib/templates/types';

  // Import code examples
  import followButtonCode from './follow-button.example?raw';
  import followButtonPillCode from './follow-button-pill.example?raw';
  import followButtonAnimatedCode from './follow-button-animated.example?raw';

  // Import block components
  import FollowButton from '$lib/registry/components/follow/buttons/basic/follow-button.svelte';
  import FollowButtonPill from '$lib/registry/components/follow/buttons/pill/follow-button-pill.svelte';
  import FollowButtonAnimated from '$lib/registry/components/follow/buttons/animated/follow-button-animated.svelte';

  // Get page data
  let { data } = $props();
  const { metadata } = data;

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleUser = $state<NDKUser | undefined>();

  // Showcase blocks
    const showcaseComponents: ShowcaseComponent[] = [
    {
      cardData: followButtonMinimalCard,
      preview: minimalPreview
    },
    {
      cardData: followButtonMinimalCard,
      preview: minimalIconOnlyPreview
    },
    {
      cardData: followButtonPillCard,
      preview: pillSolidPreview
    },
    {
      cardData: followButtonPillCard,
      preview: pillOutlinePreview
    },
    {
      cardData: followButtonPillCard,
      preview: pillCompactPreview
    },
    {
      cardData: followButtonAnimatedCard,
      preview: animatedPreview
    }
  ];

  // Components section
  const componentsSection = $derived({
    cards: [
      { ...followButtonMinimalCard, code: followButtonCode },
      { ...followButtonPillCard, code: followButtonPillCode },
      { ...followButtonAnimatedCard, code: followButtonAnimatedCode }
    ],
    previews: {
      [followButtonMinimalCard.name]: minimalCardPreview,
      [followButtonPillCard.name]: pillCardPreview,
      [followButtonAnimatedCard.name]: animatedCardPreview
    }
  });
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

<!-- Component card preview snippets -->
{#snippet minimalCardPreview()}
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

{#snippet pillCardPreview()}
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

{#snippet animatedCardPreview()}
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
  metadata={metadata}
  {ndk}
  {showcaseComponents}
  {componentsSection}
  {customSections}
  apiDocs={metadata.apiDocs}
>
  <EditProps.Prop
    name="Sample User"
    type="user"
    default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
    bind:value={sampleUser}
  />
</ComponentPageTemplate>
