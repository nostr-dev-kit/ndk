<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction, createFetchUser } from '@nostr-dev-kit/svelte';
  import FollowAction from '$lib/ndk/actions/follow-action.svelte';
  import { UserProfile } from '$lib/ndk/user-profile';
  import CodePreview from '$lib/components/code-preview.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Example user (pablo) - supports npub, nprofile, hex pubkey, nip05, etc.
  let npubInput = $state('npub1l2vyl2xd4j0g97thetkkxkqhqh4ejy42kxc70yevjv90jlak3p6sjegwrc');
  const exampleUser = createFetchUser(ndk, () => npubInput);
  const examplePubkey = $derived(exampleUser.$loaded ? exampleUser.pubkey : undefined);

  // Example hashtags
  let hashtagInput = $state('bitcoin');

  // Event handling
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

  // Builder examples - using createFollowAction directly
  const customUserFollow = createFollowAction(() => ({ ndk, target: exampleUser }));
  const customHashtagFollow = createFollowAction(() => ({ ndk, target: hashtagInput }));

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

  <!-- User Following Examples -->
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
      <!-- Default Variant -->
      <CodePreview
        title="Default Variant"
        description="Simple text link style, perfect for inline use."
        code={`<FollowAction {ndk} target={user} />`}
      >
        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <div class="user-display">
            <UserProfile.Avatar size={48} />
            <div class="user-info">
              <UserProfile.Name />
              <FollowAction
                {ndk}
                target={exampleUser}
                onfollowsuccess={handleFollowSuccess}
                onfollowonerror={handleFollowError}
              />
            </div>
          </div>
        </UserProfile.Root>
      </CodePreview>

      <!-- Primary Variant -->
      <CodePreview
        title="Primary Variant"
        description="Prominent button style for profile pages."
        code={`<FollowAction {ndk} target={user} variant="primary" />`}
      >
        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <div class="user-display">
            <UserProfile.Avatar size={48} />
            <div class="user-info">
              <UserProfile.Name />
              <FollowAction
                {ndk}
                target={exampleUser}
                variant="primary"
                onfollowsuccess={handleFollowSuccess}
                onfollowonerror={handleFollowError}
              />
            </div>
          </div>
        </UserProfile.Root>
      </CodePreview>

      <!-- Without Icon -->
      <CodePreview
        title="Without Icon"
        description="Text-only button, useful for compact layouts."
        code={`<FollowAction {ndk} target={user} showIcon={false} />`}
      >
        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <div class="user-display">
            <UserProfile.Avatar size={48} />
            <div class="user-info">
              <UserProfile.Name />
              <FollowAction
                {ndk}
                target={exampleUser}
                showIcon={false}
                onfollowsuccess={handleFollowSuccess}
                onfollowonerror={handleFollowError}
              />
            </div>
          </div>
        </UserProfile.Root>
      </CodePreview>

      <!-- Custom Styling -->
      <CodePreview
        title="Custom Styling"
        description="Override default styles with custom classes."
        code={`<FollowAction {ndk} target={user} class="custom-classes" />`}
      >
        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <div class="user-display">
            <UserProfile.Avatar size={48} />
            <div class="user-info">
              <UserProfile.Name />
              <FollowAction
                {ndk}
                target={exampleUser}
                class="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold"
                onfollowsuccess={handleFollowSuccess}
                onfollowonerror={handleFollowError}
              />
            </div>
          </div>
        </UserProfile.Root>
      </CodePreview>
    </div>
  </section>

  <!-- Hashtag Following Examples -->
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
      <!-- Default Variant -->
      <CodePreview
        title="Default Hashtag"
        description="Simple hashtag follow button."
        code={`<FollowAction {ndk} target="bitcoin" />`}
      >
        <div class="hashtag-display">
          <span class="hashtag-icon">#</span>
          <span class="hashtag-text">{hashtagInput}</span>
          <FollowAction
            {ndk}
            target={hashtagInput}
            onfollowsuccess={handleFollowSuccess}
            onfollowonerror={handleFollowError}
          />
        </div>
      </CodePreview>

      <!-- Primary Variant -->
      <CodePreview
        title="Primary Hashtag"
        description="Prominent hashtag follow button."
        code={`<FollowAction {ndk} target="bitcoin" variant="primary" />`}
      >
        <div class="hashtag-display">
          <span class="hashtag-icon">#</span>
          <span class="hashtag-text">{hashtagInput}</span>
          <FollowAction
            {ndk}
            target={hashtagInput}
            variant="primary"
            onfollowsuccess={handleFollowSuccess}
            onfollowonerror={handleFollowError}
          />
        </div>
      </CodePreview>

      <!-- Without Icon -->
      <CodePreview
        title="Without Icon"
        description="Text-only hashtag button."
        code={`<FollowAction {ndk} target="bitcoin" showIcon={false} />`}
      >
        <div class="hashtag-display">
          <span class="hashtag-icon">#</span>
          <span class="hashtag-text">{hashtagInput}</span>
          <FollowAction
            {ndk}
            target={hashtagInput}
            showIcon={false}
            onfollowsuccess={handleFollowSuccess}
            onfollowonerror={handleFollowError}
          />
        </div>
      </CodePreview>

      <!-- Custom Label -->
      <CodePreview
        title="Custom Label"
        description="Use slot to customize button text."
        code={`<FollowAction {ndk} target="bitcoin">
  Subscribe
</FollowAction>`}
      >
        <div class="hashtag-display">
          <span class="hashtag-icon">#</span>
          <span class="hashtag-text">{hashtagInput}</span>
          <FollowAction
            {ndk}
            target={hashtagInput}
            variant="primary"
            onfollowsuccess={handleFollowSuccess}
            onfollowonerror={handleFollowError}
          >
            Subscribe
          </FollowAction>
        </div>
      </CodePreview>
    </div>
  </section>

  <!-- Using Builder Directly -->
  <section class="showcase-section">
    <h2>Using the Builder Directly</h2>
    <p class="section-description">
      For maximum control over your UI, use <code>createFollowAction()</code> directly without the
      component. This gives you full control over the markup while still benefiting from reactive
      state management.
    </p>

    <div class="example-grid">
      <!-- Custom User Button -->
      <CodePreview
        title="Custom User Button"
        description="Build your own button UI using the builder's reactive state."
        code={`const follow = createFollowAction(() => ({ ndk, target: user }));

<button onclick={follow.follow}>
  {follow.isFollowing ? '✓ Following' : '+ Follow'}
</button>`}
      >
        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <div class="user-display">
            <UserProfile.Avatar size={48} />
            <div class="user-info">
              <UserProfile.Name />
              <button
                class="custom-follow-btn"
                onclick={() => handleCustomToggle('user')}
              >
                {customUserFollow.isFollowing ? '✓ Following' : '+ Follow'}
              </button>
            </div>
          </div>
        </UserProfile.Root>
      </CodePreview>

      <!-- Custom Hashtag Button -->
      <CodePreview
        title="Custom Hashtag Button"
        description="Complete control over hashtag follow UI."
        code={`const follow = createFollowAction(() => ({ ndk, target: "bitcoin" }));

<button onclick={follow.follow}>
  {follow.isFollowing ? 'Subscribed' : 'Subscribe'}
</button>`}
      >
        <div class="hashtag-display">
          <span class="hashtag-icon">#</span>
          <span class="hashtag-text">{hashtagInput}</span>
          <button
            class="custom-hashtag-btn"
            onclick={() => handleCustomToggle('hashtag')}
          >
            {#if customHashtagFollow.isFollowing}
              <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              Subscribed
            {:else}
              Subscribe
            {/if}
          </button>
        </div>
      </CodePreview>

      <!-- Toggle with Icon -->
      <CodePreview
        title="Icon-Only Toggle"
        description="Minimal icon-based follow toggle."
        code={`const follow = createFollowAction(() => ({ ndk, target: user }));

<button onclick={follow.follow}>
  {#if follow.isFollowing}
    <CheckIcon />
  {:else}
    <PlusIcon />
  {/if}
</button>`}
      >
        <UserProfile.Root {ndk} pubkey={examplePubkey}>
          <div class="user-display">
            <UserProfile.Avatar size={48} />
            <div class="user-info">
              <UserProfile.Name />
              <button
                class="icon-toggle-btn"
                onclick={() => handleCustomToggle('user')}
                title={customUserFollow.isFollowing ? 'Unfollow' : 'Follow'}
              >
                {#if customUserFollow.isFollowing}
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                {:else}
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                {/if}
              </button>
            </div>
          </div>
        </UserProfile.Root>
      </CodePreview>

      <!-- Integration Example -->
      <CodePreview
        title="Full Integration"
        description="Complete example showing state access and error handling."
        code={`const follow = createFollowAction(() => ({ ndk, target: user }));

async function handleToggle() {
  try {
    await follow.follow();
    console.log('Success!', follow.isFollowing);
  } catch (error) {
    console.error('Failed:', error);
  }
}

<button onclick={handleToggle}>
  {follow.isFollowing ? 'Unfollow' : 'Follow'}
</button>`}
      >
        <div class="integration-example">
          <div class="status-badge">
            {customUserFollow.isFollowing ? 'Following' : 'Not Following'}
          </div>
          <button
            class="integration-btn"
            onclick={() => handleCustomToggle('user')}
          >
            {customUserFollow.isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      </CodePreview>
    </div>
  </section>

  <!-- API Documentation -->
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

const followButton = createFollowAction(() => ({ ndk, target: user }));

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

  header {
    margin-bottom: 3rem;
  }

  header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: hsl(var(--color-foreground));
    margin: 0 0 0.5rem 0;
  }

  header p {
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

  .user-display {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .hashtag-display {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: hsl(var(--color-background));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .hashtag-icon {
    font-size: 1.5rem;
    font-weight: 700;
    color: hsl(var(--color-primary));
  }

  .hashtag-text {
    font-size: 1.125rem;
    font-weight: 600;
    color: hsl(var(--color-foreground));
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

  /* Custom button styles for builder examples */
  .custom-follow-btn {
    padding: 0.5rem 1rem;
    background: hsl(var(--color-primary));
    color: hsl(var(--color-primary-foreground));
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .custom-follow-btn:hover {
    opacity: 0.9;
  }

  .custom-hashtag-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: hsl(var(--color-accent));
    color: hsl(var(--color-accent-foreground));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .custom-hashtag-btn:hover {
    background: hsl(var(--color-accent) / 0.8);
  }

  .custom-hashtag-btn .icon {
    width: 1rem;
    height: 1rem;
  }

  .icon-toggle-btn {
    width: 2rem;
    height: 2rem;
    padding: 0.375rem;
    background: hsl(var(--color-muted));
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-toggle-btn:hover {
    background: hsl(var(--color-accent));
  }

  .icon-toggle-btn .icon {
    width: 1rem;
    height: 1rem;
  }

  .integration-example {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: hsl(var(--color-background));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    background: hsl(var(--color-primary) / 0.1);
    color: hsl(var(--color-primary));
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .integration-btn {
    padding: 0.5rem 1.5rem;
    background: hsl(var(--color-primary));
    color: hsl(var(--color-primary-foreground));
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .integration-btn:hover {
    opacity: 0.9;
  }
</style>
