<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import CodePreview from '$site-components/code-preview.svelte';

  // Import examples
  import CompactListExample from './examples/compact-list.svelte';
  import CompactListExampleRaw from './examples/compact-list.svelte?raw';
  import PortraitCardExample from './examples/portrait-card.svelte';
  import PortraitCardExampleRaw from './examples/portrait-card.svelte?raw';
  import LandscapeCardExample from './examples/landscape-card.svelte';
  import LandscapeCardExampleRaw from './examples/landscape-card.svelte?raw';
  import WithFollowStatesExample from './examples/with-follow-states.svelte';
  import WithFollowStatesExampleRaw from './examples/with-follow-states.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<div class="component-page">
  <header>
    <h1>User Card</h1>
    <p>Display user information in compact or detailed card layouts with follow actions.</p>
  </header>

  <section class="demo">
    <CodePreview
      title="Compact List Item"
      description="Minimal user card for lists, showing avatar, name, and follow button."
      component="user-profile"
      code={CompactListExampleRaw}
    >
      <CompactListExample {ndk} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Portrait Card"
      description="Vertical card layout showing avatar, name, bio, and stats."
      component="user-profile"
      code={PortraitCardExampleRaw}
    >
      <PortraitCardExample {ndk} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Landscape Card"
      description="Horizontal card layout for wider displays."
      component="user-profile"
      code={LandscapeCardExampleRaw}
    >
      <LandscapeCardExample {ndk} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="With Follow Button States"
      description="Follow button shows different states based on follow status."
      component="user-profile"
      code={WithFollowStatesExampleRaw}
    >
      <WithFollowStatesExample {ndk} />
    </CodePreview>
  </section>
</div>

