<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import CodePreview from '$lib/components/code-preview.svelte';

  // Import examples
  import CompactListExample from '$lib/ndk/user-profile/examples/compact-list.svelte';
  import CompactListExampleRaw from '$lib/ndk/user-profile/examples/compact-list.svelte?raw';
  import PortraitCardExample from '$lib/ndk/user-profile/examples/portrait-card.svelte';
  import PortraitCardExampleRaw from '$lib/ndk/user-profile/examples/portrait-card.svelte?raw';
  import LandscapeCardExample from '$lib/ndk/user-profile/examples/landscape-card.svelte';
  import LandscapeCardExampleRaw from '$lib/ndk/user-profile/examples/landscape-card.svelte?raw';
  import WithFollowStatesExample from '$lib/ndk/user-profile/examples/with-follow-states.svelte';
  import WithFollowStatesExampleRaw from '$lib/ndk/user-profile/examples/with-follow-states.svelte?raw';

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

<style>
  .component-page {
    max-width: 900px;
  }

  .component-page > header {
    margin-bottom: 2rem;
  }

  .component-page > header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    color: hsl(var(--color-foreground));
  }

  .component-page > header p {
    font-size: 1.125rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
  }

  .component-page > section {
    margin-bottom: 3rem;
  }

  .demo {
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }
</style>
