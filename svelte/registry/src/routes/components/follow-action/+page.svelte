<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction, createFetchUser } from '@nostr-dev-kit/svelte';
  import CodePreview from '$lib/components/code-preview.svelte';

  // Import examples
  import DefaultExample from '$lib/ndk/actions/examples/follow-action-default.svelte';
  import DefaultExampleRaw from '$lib/ndk/actions/examples/follow-action-default.svelte?raw';
  import PrimaryExample from '$lib/ndk/actions/examples/follow-action-primary.svelte';
  import PrimaryExampleRaw from '$lib/ndk/actions/examples/follow-action-primary.svelte?raw';
  import WithoutIconExample from '$lib/ndk/actions/examples/follow-action-without-icon.svelte';
  import WithoutIconExampleRaw from '$lib/ndk/actions/examples/follow-action-without-icon.svelte?raw';
  import CustomStylingExample from '$lib/ndk/actions/examples/follow-action-custom-styling.svelte';
  import CustomStylingExampleRaw from '$lib/ndk/actions/examples/follow-action-custom-styling.svelte?raw';
  import HashtagDefaultExample from '$lib/ndk/actions/examples/follow-action-hashtag-default.svelte';
  import HashtagDefaultExampleRaw from '$lib/ndk/actions/examples/follow-action-hashtag-default.svelte?raw';
  import HashtagPrimaryExample from '$lib/ndk/actions/examples/follow-action-hashtag-primary.svelte';
  import HashtagPrimaryExampleRaw from '$lib/ndk/actions/examples/follow-action-hashtag-primary.svelte?raw';
  import HashtagWithoutIconExample from '$lib/ndk/actions/examples/follow-action-hashtag-without-icon.svelte';
  import HashtagWithoutIconExampleRaw from '$lib/ndk/actions/examples/follow-action-hashtag-without-icon.svelte?raw';
  import HashtagCustomLabelExample from '$lib/ndk/actions/examples/follow-action-hashtag-custom-label.svelte';
  import HashtagCustomLabelExampleRaw from '$lib/ndk/actions/examples/follow-action-hashtag-custom-label.svelte?raw';
  import BuilderCustomUserExample from '$lib/ndk/actions/examples/follow-action-builder-custom-user.svelte';
  import BuilderCustomUserExampleRaw from '$lib/ndk/actions/examples/follow-action-builder-custom-user.svelte?raw';
  import BuilderCustomHashtagExample from '$lib/ndk/actions/examples/follow-action-builder-custom-hashtag.svelte';
  import BuilderCustomHashtagExampleRaw from '$lib/ndk/actions/examples/follow-action-builder-custom-hashtag.svelte?raw';
  import BuilderIconToggleExample from '$lib/ndk/actions/examples/follow-action-builder-icon-toggle.svelte';
  import BuilderIconToggleExampleRaw from '$lib/ndk/actions/examples/follow-action-builder-icon-toggle.svelte?raw';
  import BuilderIntegrationExample from '$lib/ndk/actions/examples/follow-action-builder-integration.svelte';
  import BuilderIntegrationExampleRaw from '$lib/ndk/actions/examples/follow-action-builder-integration.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let npubInput = $state('npub1l2vyl2xd4j0g97thetkkxkqhqh4ejy42kxc70yevjv90jlak3p6sjegwrc');
  const exampleUser = createFetchUser(ndk, () => npubInput);
  const examplePubkey = $derived(exampleUser.$loaded ? exampleUser.pubkey : undefined);

  let hashtagInput = $state('bitcoin');

  let lastEvent = $state<string>('');

  function handleFollowSuccess(e: Event) {
    const detail = (e as CustomEvent).detail;
    lastEvent = `Success: ${detail.isFollowing ? 'Followed' : 'Unfollowed'} ${
      detail.isHashtag ? `#${detail.target}` : 'user'
    }`;
    setTimeout(() => (lastEvent = ''), 3000);
  }

  function handleFollowError(e: Event) {
    const detail = (e as CustomEvent).detail;
    lastEvent = `Error: ${detail.error.message}`;
    setTimeout(() => (lastEvent = ''), 5000);
  }

  const customUserFollow = createFollowAction(() => ({ target: exampleUser }), ndk);
  const customHashtagFollow = createFollowAction(() => ({ target: hashtagInput }), ndk);

  async function handleCustomToggle(type: 'user' | 'hashtag') {
    try {
      if (type === 'user') {
        await customUserFollow.follow();
        lastEvent = `Builder: ${customUserFollow.isFollowing ? 'Followed' : 'Unfollowed'} user`;
      } else {
        await customHashtagFollow.follow();
        lastEvent = `Builder: ${customHashtagFollow.isFollowing ? 'Followed' : 'Unfollowed'} #${hashtagInput}`;
      }
      setTimeout(() => (lastEvent = ''), 3000);
    } catch (error) {
      lastEvent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setTimeout(() => (lastEvent = ''), 5000);
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
    <div class="warning-box">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p>
        <strong>Login required:</strong> You need to be logged in to see and use the follow button.
        Click "Login" in the sidebar to continue.
      </p>
    </div>
  {/if}

  {#if lastEvent}
    <div class="event-toast">{lastEvent}</div>
  {/if}

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

    <div class="example-grid">
      <CodePreview
        title="Default Variant"
        description="Simple text link style, perfect for inline use."
        code={DefaultExampleRaw}
      >
        <DefaultExample {ndk} user={exampleUser} pubkey={examplePubkey} onfollowsuccess={handleFollowSuccess} onfollowonerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Primary Variant"
        description="Prominent button style for profile pages."
        code={PrimaryExampleRaw}
      >
        <PrimaryExample {ndk} user={exampleUser} pubkey={examplePubkey} onfollowsuccess={handleFollowSuccess} onfollowonerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Without Icon"
        description="Text-only button, useful for compact layouts."
        code={WithoutIconExampleRaw}
      >
        <WithoutIconExample {ndk} user={exampleUser} pubkey={examplePubkey} onfollowsuccess={handleFollowSuccess} onfollowonerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Custom Styling"
        description="Override default styles with custom classes."
        code={CustomStylingExampleRaw}
      >
        <CustomStylingExample {ndk} user={exampleUser} pubkey={examplePubkey} onfollowsuccess={handleFollowSuccess} onfollowonerror={handleFollowError} />
      </CodePreview>
    </div>
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

    <div class="example-grid">
      <CodePreview
        title="Default Hashtag"
        description="Simple hashtag follow button."
        code={HashtagDefaultExampleRaw}
      >
        <HashtagDefaultExample {ndk} hashtag={hashtagInput} onfollowsuccess={handleFollowSuccess} onfollowonerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Primary Hashtag"
        description="Prominent hashtag follow button."
        code={HashtagPrimaryExampleRaw}
      >
        <HashtagPrimaryExample {ndk} hashtag={hashtagInput} onfollowsuccess={handleFollowSuccess} onfollowonerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Without Icon"
        description="Text-only hashtag button."
        code={HashtagWithoutIconExampleRaw}
      >
        <HashtagWithoutIconExample {ndk} hashtag={hashtagInput} onfollowsuccess={handleFollowSuccess} onfollowonerror={handleFollowError} />
      </CodePreview>

      <CodePreview
        title="Custom Label"
        description="Use slot to customize button text."
        code={HashtagCustomLabelExampleRaw}
      >
        <HashtagCustomLabelExample {ndk} hashtag={hashtagInput} onfollowsuccess={handleFollowSuccess} onfollowonerror={handleFollowError} />
      </CodePreview>
    </div>
  </section>

  <section class="showcase-section">
    <h2>Using the Builder Directly</h2>
    <p class="section-description">
      For maximum control over your UI, use <code>createFollowAction()</code> directly without the
      component. This gives you full control over the markup while still benefiting from reactive
      state management.
    </p>

    <div class="example-grid">
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
    </div>
  </section>

  <section class="showcase-section">
    <h2>API</h2>

    <div class="api-section">
      <h3>Props</h3>
      <table class="api-table">
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
            <td>required</td>
            <td>NDK instance</td>
          </tr>
          <tr>
            <td><code>target</code></td>
            <td><code>NDKUser | string</code></td>
            <td>required</td>
            <td>User object or hashtag string to follow</td>
          </tr>
          <tr>
            <td><code>variant</code></td>
            <td><code>'default' | 'primary'</code></td>
            <td><code>'default'</code></td>
            <td>Visual style variant</td>
          </tr>
          <tr>
            <td><code>showIcon</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>Show/hide icon in button</td>
          </tr>
          <tr>
            <td><code>class</code></td>
            <td><code>string</code></td>
            <td><code>''</code></td>
            <td>Custom CSS classes (overrides variant)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="api-section">
      <h3>Events</h3>
      <table class="api-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Detail</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>followsuccess</code></td>
            <td><code>{'{ target, isFollowing, isHashtag }'}</code></td>
            <td>Fired when follow/unfollow succeeds</td>
          </tr>
          <tr>
            <td><code>followerror</code></td>
            <td><code>{'{ error, target, isHashtag }'}</code></td>
            <td>Fired when follow/unfollow fails</td>
          </tr>
        </tbody>
      </table>
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
  .component-page {
    max-width: 1200px;
  }

  .component-page > header {
    margin-bottom: 3rem;
  }

  .component-page > header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: hsl(var(--color-foreground));
    margin: 0 0 0.5rem 0;
  }

  .component-page > header p {
    font-size: 1.125rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
  }

  .warning-box {
    padding: 1rem;
    background: hsl(40 100% 50% / 0.1);
    border: 1px solid hsl(40 100% 50% / 0.3);
    border-radius: 0.5rem;
    display: flex;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .warning-box .icon {
    width: 1.25rem;
    height: 1.25rem;
    color: hsl(40 100% 40%);
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .warning-box p {
    margin: 0;
    color: hsl(var(--color-foreground));
    font-size: 0.875rem;
  }

  .event-toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 100;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .showcase-section {
    margin-bottom: 4rem;
  }

  .showcase-section h2 {
    font-size: 1.875rem;
    font-weight: 600;
    color: hsl(var(--color-foreground));
    margin: 0 0 0.5rem 0;
  }

  .section-description {
    color: hsl(var(--color-muted-foreground));
    margin: 0 0 2rem 0;
  }

  .controls {
    margin-bottom: 2rem;
  }

  .controls label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--color-foreground));
  }

  .npub-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid hsl(var(--color-border));
    background: hsl(var(--color-background));
    color: hsl(var(--color-foreground));
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-family: 'Monaco', 'Courier New', monospace;
  }

  .npub-input:focus {
    outline: none;
    border-color: hsl(var(--color-ring));
    box-shadow: 0 0 0 3px hsl(var(--color-ring) / 0.2);
  }

  .example-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  pre {
    margin: 0;
    padding: 1rem;
    background: hsl(var(--color-muted) / 0.5);
    border-radius: 0.375rem;
    overflow-x: auto;
  }

  code {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.8125rem;
    color: hsl(var(--color-foreground));
  }

  .api-section {
    margin-bottom: 2rem;
  }

  .api-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: hsl(var(--color-foreground));
    margin: 0 0 1rem 0;
  }

  .api-section p {
    color: hsl(var(--color-muted-foreground));
    margin: 0 0 1rem 0;
  }

  .api-table {
    width: 100%;
    border-collapse: collapse;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .api-table th {
    text-align: left;
    padding: 0.75rem 1rem;
    background: hsl(var(--color-muted) / 0.5);
    font-weight: 600;
    font-size: 0.875rem;
    color: hsl(var(--color-foreground));
    border-bottom: 1px solid hsl(var(--color-border));
  }

  .api-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid hsl(var(--color-border));
    font-size: 0.875rem;
    color: hsl(var(--color-muted-foreground));
  }

  .api-table tr:last-child td {
    border-bottom: none;
  }

  .api-table code {
    background: hsl(var(--color-muted) / 0.5);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.8125rem;
    color: hsl(var(--color-foreground));
  }
</style>
