<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import CodePreview from '$site-components/code-preview.svelte';

  // Import examples
  import BasicExample from '$lib/ndk/avatar-group/examples/basic.svelte';
  import BasicExampleRaw from '$lib/ndk/avatar-group/examples/basic.svelte?raw';
  import WithOverflowExample from '$lib/ndk/avatar-group/examples/with-overflow.svelte';
  import WithOverflowExampleRaw from '$lib/ndk/avatar-group/examples/with-overflow.svelte?raw';
  import SpacingVariantsExample from '$lib/ndk/avatar-group/examples/spacing-variants.svelte';
  import SpacingVariantsExampleRaw from '$lib/ndk/avatar-group/examples/spacing-variants.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Example pubkeys (nostr developers)
  const examplePubkeys = [
    'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52', // pablo
    '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2', // jack
    'c4eabae1be3cf657bc1855ee05e69de9f059cb7a059227168b80b89761cbc4e0', // fiatjaf
    '472f440f29ef996e92a186b8d320ff180c855903882e59d50de1b8bd5669301e', // Marty Bent
    '91c9a5e1a9744114c6fe2d61ae4de82629eaaa0fb52f48288093c7e7e036f832', // Lyn Alden
    'c48e29f04b482cc01ca1f9ef8c86ef8318c059e0e9353235162f080f26e14c11', // Walker
    '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d', // Gigi
  ];

  const manyPubkeys = [
    'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2',
    'c4eabae1be3cf657bc1855ee05e69de9f059cb7a059227168b80b89761cbc4e0',
    '472f440f29ef996e92a186b8d320ff180c855903882e59d50de1b8bd5669301e',
    '91c9a5e1a9744114c6fe2d61ae4de82629eaaa0fb52f48288093c7e7e036f832',
    'c48e29f04b482cc01ca1f9ef8c86ef8318c059e0e9353235162f080f26e14c11',
    '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d',
  ];
</script>

<div class="component-page">
  <header>
    <h1>AvatarGroup</h1>
    <p>Display multiple user avatars in a stacked group with smart ordering based on follows.</p>
  </header>

  <section class="demo">
    <CodePreview
      title="Basic"
      description="Simple avatar group showing multiple users."
      component="avatar-group"
      code={BasicExampleRaw}
    >
      <BasicExample {ndk} pubkeys={examplePubkeys.slice(0, 5)} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="With Overflow"
      description="Shows overflow count when there are more users than max."
      component="avatar-group"
      code={WithOverflowExampleRaw}
    >
      <WithOverflowExample {ndk} pubkeys={manyPubkeys} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Spacing Variants"
      description="Different spacing options for avatar overlap."
      component="avatar-group"
      code={SpacingVariantsExampleRaw}
    >
      <SpacingVariantsExample {ndk} pubkeys={examplePubkeys.slice(0, 4)} />
    </CodePreview>
  </section>

  <section class="usage">
    <h2>Usage</h2>

    <h3>Basic Usage</h3>
    <pre><code>{`<script>
  import { AvatarGroup } from '$lib/ndk/avatar-group';
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
  <UserProfile.Avatar {ndk} {user} />
{/each}

<!-- Access specific groups -->
<p>Followed: {avatarGroup.followedUsers.length}</p>
<p>Not followed: {avatarGroup.unfollowedUsers.length}</p>`}</code></pre>

    <h3>Features</h3>
    <ul>
      <li><strong>Smart Ordering</strong> - Prioritizes users you follow</li>
      <li><strong>Skip Current User</strong> - Optionally exclude yourself from the group</li>
      <li><strong>Overflow Count</strong> - Shows "+N" when there are more users than max</li>
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
