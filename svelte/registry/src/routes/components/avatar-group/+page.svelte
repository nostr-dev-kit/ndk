<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  import { AvatarGroup } from '$lib/registry/components/avatar-group/index.js';

  const ndk = getContext<NDKSvelte>('ndk');

  let maxAvatars = $state<number>(5);

  const examplePubkeys = [
    'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2',
    'c4eabae1be3cf657bc1855ee05e69de9f059cb7a059227168b80b89761cbc4e0',
    '472f440f29ef996e92a186b8d320ff180c855903882e59d50de1b8bd5669301e',
    '91c9a5e1a9744114c6fe2d61ae4de82629eaaa0fb52f48288093c7e7e036f832',
    'c48e29f04b482cc01ca1f9ef8c86ef8318c059e0e9353235162f080f26e14c11',
    '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d',
  ];

  const cardData = {
    name: 'avatar-group',
    title: 'AvatarGroup',
    description: 'Display multiple user avatars with overflow count.',
    richDescription: 'Displays multiple user avatars in a stacked group with smart ordering (prioritizes followed users) and flexible overflow display options.',
    command: 'npx shadcn@latest add avatar-group',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">AvatarGroup</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Display multiple user avatars in a stacked group with smart ordering and flexible overflow display options.
    </p>

    <EditProps.Root>
      <EditProps.Prop name="Max avatars" type="number" bind:value={maxAvatars} />
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  </div>

  <!-- ComponentsShowcase Section -->
  {#snippet defaultPreview()}
    <AvatarGroup {ndk} pubkeys={examplePubkeys.slice(0, 5)} />
  {/snippet}

  {#snippet withOverflowPreview()}
    <AvatarGroup {ndk} pubkeys={examplePubkeys} max={maxAvatars} />
  {/snippet}

  {#snippet textOverflowPreview()}
    <AvatarGroup {ndk} pubkeys={examplePubkeys} max={3} overflowVariant="text" />
  {/snippet}

  {#snippet snippetPreview()}
    <AvatarGroup {ndk} pubkeys={examplePubkeys} max={4}>
      {#snippet overflowSnippet(count)}
        <div class="flex items-center gap-1 ml-2">
          <span class="font-bold text-primary">+{count}</span>
          <span class="text-sm text-muted-foreground">more</span>
        </div>
      {/snippet}
    </AvatarGroup>
  {/snippet}

  <ComponentPageSectionTitle
    title="Showcase"
    description="Avatar group variants with different overflow display options."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Default',
        description: 'Basic stacked avatars with smart ordering',
        command: 'npx shadcn@latest add avatar-group',
        preview: defaultPreview,
        cardData
      },
      {
        name: 'With Overflow',
        description: 'Circular badge for overflow count',
        command: 'npx shadcn@latest add avatar-group',
        preview: withOverflowPreview,
        cardData
      },
      {
        name: 'Text Overflow',
        description: 'Text-based overflow display',
        command: 'npx shadcn@latest add avatar-group',
        preview: textOverflowPreview,
        cardData
      },
      {
        name: 'Custom Snippet',
        description: 'Fully customizable overflow rendering',
        command: 'npx shadcn@latest add avatar-group',
        preview: snippetPreview,
        cardData
      }
    ]}
  />

  <section class="usage">
    <h2>Usage</h2>

    <h3>Basic Usage</h3>
    <pre><code>{`<script>
  import { AvatarGroup } from '$lib/registry/components/avatar-group';
</script>

<AvatarGroup {ndk} pubkeys={['pubkey1', 'pubkey2', 'pubkey3']} />`}</code></pre>

    <h3>Props</h3>
    <table>
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>ndk</code></td>
          <td><code>NDKSvelte</code></td>
          <td>-</td>
          <td>NDK instance (required)</td>
        </tr>
        <tr>
          <td><code>pubkeys</code></td>
          <td><code>string[]</code></td>
          <td>-</td>
          <td>Array of user pubkeys to display (required)</td>
        </tr>
        <tr>
          <td><code>skipCurrentUser</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>Whether to skip the current user from the list</td>
        </tr>
        <tr>
          <td><code>max</code></td>
          <td><code>number</code></td>
          <td><code>5</code></td>
          <td>Maximum number of avatars to show before overflow</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>number</code></td>
          <td><code>40</code></td>
          <td>Avatar size in pixels</td>
        </tr>
        <tr>
          <td><code>spacing</code></td>
          <td><code>'tight' | 'normal' | 'loose'</code></td>
          <td><code>'normal'</code></td>
          <td>Spacing between avatars</td>
        </tr>
        <tr>
          <td><code>overflowVariant</code></td>
          <td><code>'avatar' | 'text'</code></td>
          <td><code>'avatar'</code></td>
          <td>How to display the overflow count: as a circular avatar or as text to the side</td>
        </tr>
        <tr>
          <td><code>onAvatarClick</code></td>
          <td><code>(user: NDKUser) => void</code></td>
          <td>-</td>
          <td>Click handler for individual avatars</td>
        </tr>
        <tr>
          <td><code>onOverflowClick</code></td>
          <td><code>() => void</code></td>
          <td>-</td>
          <td>Click handler for overflow count</td>
        </tr>
        <tr>
          <td><code>overflowSnippet</code></td>
          <td><code>(count: number) => any</code></td>
          <td>-</td>
          <td>Custom snippet for rendering the overflow count (overrides overflowVariant)</td>
        </tr>
      </tbody>
    </table>

    <h3>Smart User Ordering</h3>
    <p>
      AvatarGroup uses the <code>createAvatarGroup</code> builder which automatically prioritizes
      users that you follow (from <code>ndk.$follows</code>). This means followed users appear
      first in the group, making it easier to identify familiar faces.
    </p>

    <h3>Using the Builder Directly</h3>
    <p>For custom implementations, you can use the <code>createAvatarGroup</code> builder:</p>
    <pre><code>{`<script>
  import { createAvatarGroup } from '@nostr-dev-kit/svelte';

  const avatarGroup = createAvatarGroup(() => ({
    pubkeys: ['pubkey1', 'pubkey2', 'pubkey3'],
    skipCurrentUser: true
  }), ndk);
</script>

<!-- avatarGroup.users contains ordered users (followed users first) -->
{#each avatarGroup.users.slice(0, 5) as user}
  <User.Avatar {ndk} {user} />
{/each}

<!-- Access specific groups -->
<p>Followed: {avatarGroup.followedUsers.length}</p>
<p>Not followed: {avatarGroup.unfollowedUsers.length}</p>`}</code></pre>

    <h3>Overflow Variants</h3>
    <p>The component supports different ways to display the overflow count:</p>

    <h4>Avatar Variant (Default)</h4>
    <pre><code>{`<AvatarGroup {ndk} {pubkeys} max={3} />`}</code></pre>
    <p>Displays the overflow count in a circular avatar-style badge that overlaps with the avatars.</p>

    <h4>Text Variant</h4>
    <pre><code>{`<AvatarGroup {ndk} {pubkeys} max={3} overflowVariant="text" />`}</code></pre>
    <p>Displays the overflow count as text to the side of the avatars, similar to "Trusted by 60K+ developers".</p>

    <h4>Custom with Snippet</h4>
    <pre><code>{`<AvatarGroup {ndk} {pubkeys} max={4}>
  {#snippet overflowSnippet(count)}
    <span>+{count} more</span>
  {/snippet}
</AvatarGroup>`}</code></pre>
    <p>Use a snippet to completely customize how the overflow count is rendered. The snippet receives the count as a parameter.</p>

    <h3>Features</h3>
    <ul>
      <li><strong>Smart Ordering</strong> - Prioritizes users you follow</li>
      <li><strong>Skip Current User</strong> - Optionally exclude yourself from the group</li>
      <li><strong>Overflow Count</strong> - Shows "+N" when there are more users than max</li>
      <li><strong>Multiple Variants</strong> - Choose between avatar, text, or custom snippet rendering</li>
      <li><strong>Customizable Spacing</strong> - Three spacing options for avatar overlap</li>
      <li><strong>Interactive</strong> - Optional click handlers for avatars and overflow</li>
      <li><strong>Accessible</strong> - Proper ARIA labels and keyboard navigation</li>
    </ul>

    <h3>Styling</h3>
    <p>Components use CSS custom properties for theming:</p>
    <ul>
      <li><code>--background</code> - Background color for avatar ring</li>
      <li><code>--muted</code> - Background for overflow count</li>
      <li><code>--muted-foreground</code> - Text color for overflow count</li>
      <li><code>--primary</code> - Focus ring color</li>
    </ul>
  </section>
</div>
