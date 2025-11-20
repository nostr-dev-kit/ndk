<script lang="ts">
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import Alert from '$site-components/alert.svelte';

  // Import code examples
  import muteButtonCode from './examples/basic/index.txt?raw';

  // Import example components
  import MuteButton from '$lib/registry/components/mute-button/mute-button.svelte';

  // Import registry metadata
  import muteButtonCard from '$lib/registry/components/mute-button/metadata.json';
  import muteActionBuilder from '$lib/registry/builders/mute-action/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Mute',
    description: 'Mute buttons and components for Nostr users'
  };
  let sampleUser = $state<NDKUser | undefined>();

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...muteButtonCard, code: muteButtonCode}
    ],
    previews: {
      'mute-button': muteButtonComponentPreview
    }
  };
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

{#snippet muteButtonComponentPreview()}
  {#if sampleUser}
    {@render muteButtonPreview()}
  {/if}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      The Mute Button enables users to mute or unmute other Nostr users and hashtags. Clicking the button toggles the mute state - if the target is not muted, it adds them to your mute list; if already muted, it removes them.
    </p>

    <p>
      When muting a user or hashtag, the button publishes a NIP-51 mute list event that gets synced across relays. The button automatically hides when viewing your own profile and supports displaying the target name or hashtag alongside an icon.
    </p>

    <p>
      The button integrates with NDK's reactive <code class="px-2 py-1 bg-muted rounded text-sm">ndk.$mutes</code> store, providing real-time updates when mutes are added or removed from any source.
    </p>
  </div>
{/snippet}

<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  showcaseComponents={[
    {
      id: "muteButtonCard",
      cardData: muteButtonCard,
      preview: muteButtonPreview,
      orientation: 'horizontal'
    }
  ]}
  {componentsSection}
  buildersSection={{
    builders: [muteActionBuilder]
  }}
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
