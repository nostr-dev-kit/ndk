<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFetchUser } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/ndk/edit-props';
  import CodePreview from '$site-components/code-preview.svelte';
  import Alert from '$site-components/alert.svelte';
  import Toast from '$site-components/toast.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  // Import examples
  import DefaultExample from './examples/follow-action-default.svelte';
  import DefaultExampleRaw from './examples/follow-action-default.svelte?raw';
  import BuilderIntegrationExample from './examples/follow-action-builder-integration.svelte';
  import BuilderIntegrationExampleRaw from './examples/follow-action-builder-integration.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let npubInput = $state('npub1l2vyl2xd4j0g97thetkkxkqhqh4ejy42kxc70yevjv90jlak3p6sjegwrc');
  const exampleUser = createFetchUser(ndk, () => npubInput);
  const examplePubkey = $derived(exampleUser.$loaded ? exampleUser.pubkey : undefined);

  let toastMessage = $state<string>('');
  let toastVisible = $state(false);

  function handleFollowSuccess(e: Event) {
    const detail = (e as CustomEvent).detail;
    toastMessage = `Success: ${detail.isFollowing ? 'Followed' : 'Unfollowed'} user`;
    toastVisible = true;
  }

  function handleFollowError(e: Event) {
    const detail = (e as CustomEvent).detail;
    toastMessage = `Error: ${detail.error.message}`;
    toastVisible = true;
  }
</script>

<div class="component-page">
  <header>
    <h1>FollowAction</h1>
    <p>
      Follow/unfollow button for users and hashtags with multiple variants and customization
      options.
    </p>

    <EditProps.Root>
      <EditProps.Prop name="User npub" type="text" bind:value={npubInput} />
    </EditProps.Root>
  </header>

  {#if !ndk.$currentUser}
    <Alert variant="warning" title="Login required">
      <p>You need to be logged in to see and use the follow button. Click "Login" in the sidebar to continue.</p>
    </Alert>
  {/if}

  <Toast bind:visible={toastVisible} message={toastMessage} duration={3000} />

  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Examples</h2>

    <div class="space-y-8">
      <CodePreview
        title="Default Variant"
        description="Simple follow button for users and hashtags. The button automatically hides when viewing your own profile."
        code={DefaultExampleRaw}
      >
        <DefaultExample {ndk} user={exampleUser} pubkey={examplePubkey} onfollowsuccess={handleFollowSuccess} onfollowerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Using the Builder"
        description="For custom UI, use createFollowAction() directly for full control over markup while benefiting from reactive state management."
        code={BuilderIntegrationExampleRaw}
      >
        <BuilderIntegrationExample {ndk} user={exampleUser} />
      </CodePreview>
    </div>
  </section>

  <section class="showcase-section">
    <h2>API</h2>

    <div class="api-section">
      <h3>Props</h3>
      <ApiTable
        rows={[
          { name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
          { name: 'target', type: 'NDKUser | string', required: true, description: 'User object or hashtag string to follow' },
          { name: 'variant', type: "'default' | 'primary'", default: "'default'", description: 'Visual style variant' },
          { name: 'showIcon', type: 'boolean', default: 'true', description: 'Show/hide icon in button' },
          { name: 'class', type: 'string', default: "''", description: 'Custom CSS classes (overrides variant)' }
        ]}
      />
    </div>

    <div class="api-section">
      <h3>Events</h3>
      <ApiTable
        title="Events"
        rows={[
          { name: 'followsuccess', type: '{ target, isFollowing, isHashtag }', description: 'Fired when follow/unfollow succeeds' },
          { name: 'followerror', type: '{ error, target, isHashtag }', description: 'Fired when follow/unfollow fails' }
        ]}
      />
    </div>

    <div class="api-section">
      <h3>Builder Function</h3>
      <p>
        Use <code>createFollowAction()</code> to create custom follow button implementations:
      </p>
      <pre><code>{`import { createFollowAction } from '@nostr-dev-kit/svelte';

// NDK from context
const followButton = createFollowAction(() => ({ target: user }));

// Or with explicit NDK
const followButton = createFollowAction(() => ({ target: user }), ndk);

// Access reactive state
followButton.isFollowing // boolean

// Follow/unfollow (toggles automatically)
await followButton.follow();`}</code></pre>
    </div>
  </section>
</div>

<style>
  .showcase-section {
    margin-bottom: 4rem;
  }

  .showcase-section h2 {
    font-size: 1.875rem;
    font-weight: 600;
    color: var(--color-foreground);
    margin: 0 0 0.5rem 0;
  }

  .section-description {
    color: var(--color-muted-foreground);
    margin: 0 0 2rem 0;
  }

  pre {
    margin: 0;
    padding: 1rem;
    background: color-mix(in srgb, var(--color-muted) calc(0.5 * 100%), transparent);
    border-radius: 0.375rem;
    overflow-x: auto;
  }

  code {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.8125rem;
    color: var(--color-foreground);
  }

  .api-section {
    margin-bottom: 2rem;
  }

  .api-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-foreground);
    margin: 0 0 1rem 0;
  }

  .api-section p {
    color: var(--color-muted-foreground);
    margin: 0 0 1rem 0;
  }
</style>
