<script lang="ts">
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import { EditProps } from '$lib/site/components/edit-props';

  // Import code examples
  import followButtonCode from './examples/basic/index.txt?raw';

  // Import components
  import FollowButton from '$lib/registry/components/follow-button/follow-button.svelte';

  // Import registry metadata
  import followButtonCard from '$lib/registry/components/follow-button/metadata.json';
  import followActionBuilder from '$lib/registry/builders/follow-action/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Follow',
    description: 'Follow buttons for Nostr users and topics'
  };
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

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      The Follow Button enables users to follow or unfollow Nostr users and hashtags. Clicking the button toggles the follow state - if you're not following, it follows; if you're already following, it unfollows.
    </p>

    <p>
      When following a user, the button publishes a NIP-02 contact list event containing the target user's pubkey. For hashtags and topics, it publishes a NIP-51 interest list event instead.
    </p>

    <p>
      The button accepts either <code class="px-2 py-1 bg-muted rounded text-sm">NDKUser</code> objects for following users or string values for following hashtags and topics.
    </p>
  </div>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
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
  buildersSection={{
    builders: [followActionBuilder]
  }}
>
  <EditProps.Prop
    name="Sample User"
    type="user"
    default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
    bind:value={sampleUser}
  />
</ComponentPageTemplate>
