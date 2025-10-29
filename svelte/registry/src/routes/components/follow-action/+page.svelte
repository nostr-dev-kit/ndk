<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction, createFetchUser } from '@nostr-dev-kit/svelte';
  import CodePreview from '$site-components/code-preview.svelte';
  import Alert from '$site-components/alert.svelte';
  import Toast from '$site-components/toast.svelte';
  import ExampleGrid from '$site-components/example-grid.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  // Import examples
  import DefaultExample from './examples/follow-action-default.svelte';
  import DefaultExampleRaw from './examples/follow-action-default.svelte?raw';
  import PrimaryExample from './examples/follow-action-primary.svelte';
  import PrimaryExampleRaw from './examples/follow-action-primary.svelte?raw';
  import WithoutIconExample from './examples/follow-action-without-icon.svelte';
  import WithoutIconExampleRaw from './examples/follow-action-without-icon.svelte?raw';
  import CustomStylingExample from './examples/follow-action-custom-styling.svelte';
  import CustomStylingExampleRaw from './examples/follow-action-custom-styling.svelte?raw';
  import HashtagDefaultExample from './examples/follow-action-hashtag-default.svelte';
  import HashtagDefaultExampleRaw from './examples/follow-action-hashtag-default.svelte?raw';
  import HashtagPrimaryExample from './examples/follow-action-hashtag-primary.svelte';
  import HashtagPrimaryExampleRaw from './examples/follow-action-hashtag-primary.svelte?raw';
  import HashtagWithoutIconExample from './examples/follow-action-hashtag-without-icon.svelte';
  import HashtagWithoutIconExampleRaw from './examples/follow-action-hashtag-without-icon.svelte?raw';
  import HashtagCustomLabelExample from './examples/follow-action-hashtag-custom-label.svelte';
  import HashtagCustomLabelExampleRaw from './examples/follow-action-hashtag-custom-label.svelte?raw';
  import BuilderCustomUserExample from './examples/follow-action-builder-custom-user.svelte';
  import BuilderCustomUserExampleRaw from './examples/follow-action-builder-custom-user.svelte?raw';
  import BuilderCustomHashtagExample from './examples/follow-action-builder-custom-hashtag.svelte';
  import BuilderCustomHashtagExampleRaw from './examples/follow-action-builder-custom-hashtag.svelte?raw';
  import BuilderIconToggleExample from './examples/follow-action-builder-icon-toggle.svelte';
  import BuilderIconToggleExampleRaw from './examples/follow-action-builder-icon-toggle.svelte?raw';
  import BuilderIntegrationExample from './examples/follow-action-builder-integration.svelte';
  import BuilderIntegrationExampleRaw from './examples/follow-action-builder-integration.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let npubInput = $state('npub1l2vyl2xd4j0g97thetkkxkqhqh4ejy42kxc70yevjv90jlak3p6sjegwrc');
  const exampleUser = createFetchUser(ndk, () => npubInput);
  const examplePubkey = $derived(exampleUser.$loaded ? exampleUser.pubkey : undefined);

  let hashtagInput = $state('bitcoin');

  let toastMessage = $state<string>('');
  let toastVisible = $state(false);

  function handleFollowSuccess(e: Event) {
    const detail = (e as CustomEvent).detail;
    toastMessage = `Success: ${detail.isFollowing ? 'Followed' : 'Unfollowed'} ${
      detail.isHashtag ? `#${detail.target}` : 'user'
    }`;
    toastVisible = true;
  }

  function handleFollowError(e: Event) {
    const detail = (e as CustomEvent).detail;
    toastMessage = `Error: ${detail.error.message}`;
    toastVisible = true;
  }

  const customUserFollow = createFollowAction(() => ({ target: exampleUser }), ndk);
  const customHashtagFollow = createFollowAction(() => ({ target: hashtagInput }), ndk);

  async function handleCustomToggle(type: 'user' | 'hashtag') {
    try {
      if (type === 'user') {
        await customUserFollow.follow();
        toastMessage = `Builder: ${customUserFollow.isFollowing ? 'Followed' : 'Unfollowed'} user`;
      } else {
        await customHashtagFollow.follow();
        toastMessage = `Builder: ${customHashtagFollow.isFollowing ? 'Followed' : 'Unfollowed'} #${hashtagInput}`;
      }
      toastVisible = true;
    } catch (error) {
      toastMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      toastVisible = true;
    }
  }
</script>

<div class="component-page">
  <header>
    <h1>FollowAction</h1>
    <p>
      Follow/unfollow button for users and hashtags with multiple variants and customization
      options.
    </p>
  </header>

  {#if !ndk.$currentUser}
    <Alert variant="warning" title="Login required">
      <p>You need to be logged in to see and use the follow button. Click "Login" in the sidebar to continue.</p>
    </Alert>
  {/if}

  <Toast bind:visible={toastVisible} message={toastMessage} duration={3000} />

  <section class="showcase-section">
    <h2>Following Users</h2>
    <p class="section-description">
      Follow buttons for users with different visual variants. The button automatically hides when
      viewing your own profile.
    </p>

    <div class="controls">
      <label>
        <span class="label-text">Test with different user (npub):</span>
        <input
          type="text"
          bind:value={npubInput}
          placeholder="npub1..."
          class="npub-input"
        />
      </label>
    </div>

    <ExampleGrid>
      <CodePreview
        title="Default Variant"
        description="Simple text link style, perfect for inline use."
        code={DefaultExampleRaw}
      >
        <DefaultExample {ndk} user={exampleUser} pubkey={examplePubkey} onfollowsuccess={handleFollowSuccess} onfollowerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Primary Variant"
        description="Prominent button style for profile pages."
        code={PrimaryExampleRaw}
      >
        <PrimaryExample {ndk} user={exampleUser} pubkey={examplePubkey} onfollowsuccess={handleFollowSuccess} onfollowerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Without Icon"
        description="Text-only button, useful for compact layouts."
        code={WithoutIconExampleRaw}
      >
        <WithoutIconExample {ndk} user={exampleUser} pubkey={examplePubkey} onfollowsuccess={handleFollowSuccess} onfollowerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Custom Styling"
        description="Override default styles with custom classes."
        code={CustomStylingExampleRaw}
      >
        <CustomStylingExample {ndk} user={exampleUser} pubkey={examplePubkey} onfollowsuccess={handleFollowSuccess} onfollowerror={handleFollowError} />
      </CodePreview>
    </ExampleGrid>
  </section>

  <section class="showcase-section">
    <h2>Following Hashtags</h2>
    <p class="section-description">
      Follow buttons for hashtags using the same API. Pass a string instead of a user object.
    </p>

    <div class="controls">
      <label>
        <span class="label-text">Test with different hashtag:</span>
        <input
          type="text"
          bind:value={hashtagInput}
          placeholder="bitcoin"
          class="npub-input"
        />
      </label>
    </div>

    <ExampleGrid>
      <CodePreview
        title="Default Hashtag"
        description="Simple hashtag follow button."
        code={HashtagDefaultExampleRaw}
      >
        <HashtagDefaultExample {ndk} hashtag={hashtagInput} onfollowsuccess={handleFollowSuccess} onfollowerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Primary Hashtag"
        description="Prominent hashtag follow button."
        code={HashtagPrimaryExampleRaw}
      >
        <HashtagPrimaryExample {ndk} hashtag={hashtagInput} onfollowsuccess={handleFollowSuccess} onfollowerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Without Icon"
        description="Text-only hashtag button."
        code={HashtagWithoutIconExampleRaw}
      >
        <HashtagWithoutIconExample {ndk} hashtag={hashtagInput} onfollowsuccess={handleFollowSuccess} onfollowerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Custom Label"
        description="Use slot to customize button text."
        code={HashtagCustomLabelExampleRaw}
      >
        <HashtagCustomLabelExample {ndk} hashtag={hashtagInput} onfollowsuccess={handleFollowSuccess} onfollowerror={handleFollowError} />
      </CodePreview>
    </ExampleGrid>
  </section>

  <section class="showcase-section">
    <h2>Using the Builder Directly</h2>
    <p class="section-description">
      For maximum control over your UI, use <code>createFollowAction()</code> directly without the
      component. This gives you full control over the markup while still benefiting from reactive
      state management.
    </p>

    <ExampleGrid>
      <CodePreview
        title="Custom User Button"
        description="Build your own button UI using the builder's reactive state."
        code={BuilderCustomUserExampleRaw}
      >
        <BuilderCustomUserExample {ndk} user={exampleUser} pubkey={examplePubkey} onToggle={() => handleCustomToggle('user')} />
      </CodePreview>

      <CodePreview
        title="Custom Hashtag Button"
        description="Complete control over hashtag follow UI."
        code={BuilderCustomHashtagExampleRaw}
      >
        <BuilderCustomHashtagExample {ndk} hashtag={hashtagInput} onToggle={() => handleCustomToggle('hashtag')} />
      </CodePreview>

      <CodePreview
        title="Icon-Only Toggle"
        description="Minimal icon-based follow toggle."
        code={BuilderIconToggleExampleRaw}
      >
        <BuilderIconToggleExample {ndk} user={exampleUser} pubkey={examplePubkey} onToggle={() => handleCustomToggle('user')} />
      </CodePreview>

      <CodePreview
        title="Full Integration"
        description="Complete example showing state access and error handling."
        code={BuilderIntegrationExampleRaw}
      >
        <BuilderIntegrationExample {ndk} user={exampleUser} onToggle={() => handleCustomToggle('user')} />
      </CodePreview>
    </ExampleGrid>
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
