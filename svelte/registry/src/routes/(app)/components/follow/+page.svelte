<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import code examples
  import followButtonCode from './examples/basic/index.txt?raw';

  // Import components
  import FollowButton from '$lib/registry/components/follow/buttons/basic/follow-button.svelte';

  // Import registry metadata
  import followButtonCard from '$lib/registry/components/follow/buttons/basic/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Follow',
    description: 'Follow buttons for Nostr users and topics'
  };

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleUser = $state<NDKUser | undefined>();

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...followButtonCard, code: followButtonCode}
    ],
    previews: {
      'follow-button': followButtonComponentPreview
    }
  };
</script>

<!-- Preview snippets for showcase -->
{#snippet followButtonGhostPreview()}
  {#if sampleUser}
    <div class="flex flex-col gap-4 items-center">
      <FollowButton {ndk} target={sampleUser} variant="ghost" />
      <FollowButton {ndk} target={sampleUser} variant="ghost" showTarget={true} />
    </div>
  {/if}
{/snippet}

{#snippet followButtonOutlinePreview()}
  {#if sampleUser}
    <div class="flex flex-col gap-4 items-center">
      <FollowButton {ndk} target={sampleUser} variant="outline" />
      <FollowButton {ndk} target={sampleUser} variant="outline" showTarget={true} />
    </div>
  {/if}
{/snippet}

{#snippet followButtonPillPreview()}
  {#if sampleUser}
    <div class="flex flex-col gap-4 items-center">
      <FollowButton {ndk} target={sampleUser} variant="pill" />
      <FollowButton {ndk} target={sampleUser} variant="pill" showTarget={true} />
    </div>
  {/if}
{/snippet}

{#snippet followButtonSolidPreview()}
  {#if sampleUser}
    <div class="flex flex-col gap-4 items-center">
      <FollowButton {ndk} target={sampleUser} variant="solid" />
      <FollowButton {ndk} target={sampleUser} variant="solid" showTarget={true} />
    </div>
  {/if}
{/snippet}

{#snippet followButtonHashtagPreview()}
  <div class="flex flex-wrap gap-4 items-center justify-center">
    <FollowButton {ndk} target="nostr" variant="ghost" showTarget={true} />
    <FollowButton {ndk} target="bitcoin" variant="outline" showTarget={true} />
    <FollowButton {ndk} target="photography" variant="pill" showTarget={true} />
    <FollowButton {ndk} target="technology" variant="solid" showTarget={true} />
  </div>
{/snippet}

{#snippet followButtonComponentPreview()}
  {#if sampleUser}
    <div class="flex flex-col gap-4">
      <div class="flex gap-4 items-center flex-wrap">
        <FollowButton {ndk} target={sampleUser} variant="ghost" />
        <FollowButton {ndk} target={sampleUser} variant="outline" />
        <FollowButton {ndk} target={sampleUser} variant="pill" />
        <FollowButton {ndk} target={sampleUser} variant="solid" />
      </div>
      <div class="flex gap-4 items-center flex-wrap">
        <FollowButton {ndk} target={sampleUser} variant="ghost" showTarget={true} />
        <FollowButton {ndk} target={sampleUser} variant="outline" showTarget={true} />
        <FollowButton {ndk} target={sampleUser} variant="pill" showTarget={true} />
        <FollowButton {ndk} target={sampleUser} variant="solid" showTarget={true} />
      </div>
    </div>
  {/if}
{/snippet}

<!-- Primitives section -->
{#snippet primitives()}
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

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  showcaseComponents={[
    {
      id: "followButtonGhost",
      cardData: { ...followButtonCard, title: "Ghost", richDescription: "Minimal ghost style button" },
      preview: followButtonGhostPreview
    },
    {
      id: "followButtonOutline",
      cardData: { ...followButtonCard, title: "Outline", richDescription: "Outlined button style" },
      preview: followButtonOutlinePreview
    },
    {
      id: "followButtonPill",
      cardData: { ...followButtonCard, title: "Pill", richDescription: "Rounded pill style button" },
      preview: followButtonPillPreview
    },
    {
      id: "followButtonSolid",
      cardData: { ...followButtonCard, title: "Solid", richDescription: "Solid filled button" },
      preview: followButtonSolidPreview
    },
    {
      id: "followButtonHashtag",
      cardData: { ...followButtonCard, title: "Hashtag Follow", richDescription: "Follow hashtags and topics" },
      preview: followButtonHashtagPreview,
      cellClass: "md:col-span-2"
    }
  ]}
  {componentsSection}
  {primitives}
  apiDocs={followButtonCard.apiDocs}
>
  <EditProps.Prop
    name="Sample User"
    type="user"
    default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
    bind:value={sampleUser}
  />
</ComponentPageTemplate>
