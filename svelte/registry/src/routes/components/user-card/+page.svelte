<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFetchUser } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/ndk/edit-props';
  import CodePreview from '$site-components/code-preview.svelte';

  // Import examples
  import CompactListExample from '../user-profile/examples/compact-list.svelte';
  import CompactListExampleRaw from '../user-profile/examples/compact-list.svelte?raw';
  import PortraitCardExample from '../user-profile/examples/portrait-card.svelte';
  import PortraitCardExampleRaw from '../user-profile/examples/portrait-card.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let npubInput = $state('npub1l2vyl2xd4j0g97thetkkxkqhqh4ejy42kxc70yevjv90jlak3p6sjegwrc');
  const exampleUser = createFetchUser(ndk, () => npubInput);
</script>

<div class="component-page">
  <header>
    <h1>User Card</h1>
    <p>Display user information in compact or detailed card layouts with follow actions.</p>

    <EditProps.Root>
      <EditProps.Prop name="User npub" type="text" bind:value={npubInput} />
    </EditProps.Root>
  </header>

  <section class="demo space-y-8">
    <h2 class="text-2xl font-semibold mb-4">Examples</h2>

    <CodePreview
      title="Compact List Item"
      description="Minimal user card for lists, showing avatar, name, and follow button."
      component="user-profile"
      code={CompactListExampleRaw}
    >
      <CompactListExample {ndk} />
    </CodePreview>

    <CodePreview
      title="Portrait Card"
      description="Vertical card layout showing avatar, name, bio, and stats. Compose UserProfile primitives to build custom layouts."
      component="user-profile"
      code={PortraitCardExampleRaw}
    >
      <PortraitCardExample {ndk} />
    </CodePreview>
  </section>
</div>

