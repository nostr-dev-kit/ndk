<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/components/ndk/edit-props';
	import Demo from '$site-components/Demo.svelte';

  // Import examples
  import FullVariantExample from './examples/full-variant.svelte';
  import FullVariantExampleRaw from './examples/full-variant.svelte?raw';
  import CenteredVariantExample from './examples/centered-variant.svelte';
  import CenteredVariantExampleRaw from './examples/centered-variant.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let npubInput = $state('npub1l2vyl2xd4j0g97thetkkxkqhqh4ejy42kxc70yevjv90jlak3p6sjegwrc');
  let examplePubkey = $state('fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');

  $effect(() => {
    ndk.fetchUser(npubInput).then(user => {
      if (user) {
        examplePubkey = user.pubkey;
      }
    }).catch(() => {
      examplePubkey = 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52';
    });
  });
</script>

<div class="component-page">
  <header>
    <h1>UserHeader</h1>
    <p>User profile header components for displaying user information at the top of profile pages.</p>

    <EditProps.Root>
      <EditProps.Prop name="User npub" type="text" bind:value={npubInput} />
    </EditProps.Root>
  </header>

  <section class="demo space-y-8">
    <h2 class="text-2xl font-semibold mb-4">Examples</h2>

    <Demo
      title="Full Variant (Inline Layout)"
      description="Profile header with banner and inline layout. Avatar and info are side-by-side with follow button on the right. Best for dedicated profile pages."
      component="user-header-full"
      code={FullVariantExampleRaw}
    >
      <FullVariantExample {ndk} pubkey={examplePubkey} />
    </Demo>

    <Demo
      title="Centered Variant"
      description="Profile header with banner and centered layout. Everything is centered with follow button below avatar. Great for profile modals or focused profile views."
      component="user-header-centered"
      code={CenteredVariantExampleRaw}
    >
      <CenteredVariantExample {ndk} pubkey={examplePubkey} />
    </Demo>
  </section>
</div>
