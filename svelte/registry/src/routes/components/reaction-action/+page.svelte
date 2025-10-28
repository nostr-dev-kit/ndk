<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import CodePreview from '$lib/components/code-preview.svelte';

  import BasicExample from '$lib/ndk/actions/examples/reaction-action-basic.svelte';
  import BasicExampleRaw from '$lib/ndk/actions/examples/reaction-action-basic.svelte?raw';

  import WithoutCountExample from '$lib/ndk/actions/examples/reaction-action-without-count.svelte';
  import WithoutCountExampleRaw from '$lib/ndk/actions/examples/reaction-action-without-count.svelte?raw';

  import LongPressExample from '$lib/ndk/actions/examples/reaction-action-long-press.svelte';
  import LongPressExampleRaw from '$lib/ndk/actions/examples/reaction-action-long-press.svelte?raw';

  import CustomEmojisExample from '$lib/ndk/actions/examples/reaction-action-custom-emojis.svelte';
  import CustomEmojisExampleRaw from '$lib/ndk/actions/examples/reaction-action-custom-emojis.svelte?raw';

  import BuilderExample from '$lib/ndk/actions/examples/reaction-action-builder.svelte';
  import BuilderExampleRaw from '$lib/ndk/actions/examples/reaction-action-builder.svelte?raw';

  import SlackStyleExample from '$lib/ndk/actions/examples/reaction-action-slack-style.svelte';
  import SlackStyleExampleRaw from '$lib/ndk/actions/examples/reaction-action-slack-style.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();

  $effect(() => {
    ndk.fetchEvent('nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j')
      .then(event => {
        if (event) sampleEvent = event;
      })
      .catch(err => console.error('Failed to fetch sample event:', err));
  });
</script>

<div class="component-page">
  <header>
    <h1>ReactionAction</h1>
    <p>Simple reaction button with long-press emoji picker and NIP-30/NIP-51 support.</p>
  </header>

  {#if sampleEvent}
  <section class="demo">
    <h2>Basic Usage</h2>
    <CodePreview
      title="Click to react"
      description="Click to react with a heart. The button shows the current reaction count."
      code={BasicExampleRaw}
    >
      <BasicExample {ndk} event={sampleEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <h2>Without Count</h2>
    <CodePreview
      title="Hide count"
      description="Hide the reaction count by setting showCount={false}."
      code={WithoutCountExampleRaw}
    >
      <WithoutCountExample {ndk} event={sampleEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <h2>Long-Press for Emoji Picker</h2>
    <p class="demo-description">
      <strong>Long-press</strong> (or press and hold) the reaction button to open the emoji picker.
      The picker includes:
    </p>
    <ul class="feature-list">
      <li><strong>Your Emojis</strong> - Custom emojis from your NIP-51 kind:10030 list</li>
      <li><strong>Standard Emojis</strong> - Common reaction emojis</li>
    </ul>
    <CodePreview
      title="Long-press interaction"
      description="Try long-pressing the reaction button to open the emoji picker"
      code={LongPressExampleRaw}
    >
      <LongPressExample {ndk} event={sampleEvent} />
    </CodePreview>
    <div class="info-box">
      <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <strong>How it works:</strong>
        <ul>
          <li><strong>Quick click</strong> - React with the default emoji (❤️)</li>
          <li><strong>Long-press</strong> - Open emoji picker to choose any emoji</li>
          <li>Custom emojis use <strong>NIP-30</strong> format with emoji tags</li>
          <li>User preferences loaded from <strong>NIP-51 kind:10030</strong></li>
        </ul>
      </div>
    </div>
  </section>

  <section class="demo">
    <h2>Custom Default Emoji</h2>
    <CodePreview
      title="Custom emojis"
      description="Change the default emoji with the emoji prop."
      code={CustomEmojisExampleRaw}
    >
      <CustomEmojisExample {ndk} event={sampleEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <h2>Using the Builder Directly</h2>
    <p class="demo-description">
      For maximum control over your UI, use <code>createReactionAction()</code> directly without the
      component. This gives you full control over the markup while still benefiting from reactive
      state management.
    </p>

    <CodePreview
      title="Builder pattern"
      description="Use createReactionAction() for full control over your UI markup"
      code={BuilderExampleRaw}
    >
      <BuilderExample {ndk} event={sampleEvent} />
    </CodePreview>

    <CodePreview
      title="Slack-Style Reaction Pills"
      description="Display reactions as interactive pills with emoji, count, and hover tooltips showing who reacted. Client filters for followers."
      code={SlackStyleExampleRaw}
    >
      <SlackStyleExample {ndk} event={sampleEvent} />
    </CodePreview>

    <div class="info-box">
      <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <strong>Builder API:</strong>
        <ul>
          <li><code>createReactionAction(() => ({ event }), ndk)</code> - Create reactive reaction manager</li>
          <li><code>reaction.all</code> - Array of EmojiReaction objects, sorted by count descending:
            <ul style="margin-top: 0.5rem;">
              <li><code>emoji</code> - The reaction emoji</li>
              <li><code>count</code> - Total reactions with this emoji</li>
              <li><code>hasReacted</code> - Whether current user reacted with this emoji</li>
              <li><code>pubkeys</code> - Array of ALL pubkeys who reacted (client filters followers)</li>
              <li><code>userReaction</code> - User's NDKEvent reaction (if reacted)</li>
            </ul>
          </li>
          <li><code>reaction.get(emoji)</code> - Get stats for a specific emoji</li>
          <li><code>reaction.react(emoji)</code> - React or unreact with an emoji (toggles)</li>
        </ul>
      </div>
    </div>
  </section>
  {:else}
    <section class="demo">
      <p>Loading event...</p>
    </section>
  {/if}

  {#if !ndk.$currentPubkey}
    <section class="demo">
      <div class="login-prompt">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
        </svg>
        <h3>Login Required</h3>
        <p>To test reactions and see your custom emojis from NIP-51, please login using the sidebar.</p>
      </div>
    </section>
  {/if}
</div>

<style>
  .component-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .component-page > header {
    margin-bottom: 3rem;
  }

  .component-page > header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: hsl(var(--color-foreground));
  }

  .component-page > header p {
    font-size: 1.125rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
  }

  .demo {
    margin-bottom: 3rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid hsl(var(--color-border));
  }

  .demo:last-child {
    border-bottom: none;
  }

  .component-page > section > h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: hsl(var(--color-foreground));
  }

  .demo-description {
    color: hsl(var(--color-muted-foreground));
    margin: 0 0 1.5rem 0;
    line-height: 1.6;
  }

  .demo-description code {
    background: hsl(var(--color-muted));
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    color: hsl(var(--color-primary));
  }

  .feature-list {
    margin: 1rem 0 1.5rem 0;
    padding-left: 1.5rem;
    color: hsl(var(--color-muted-foreground));
  }

  .feature-list li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .feature-list strong {
    color: hsl(var(--color-foreground));
  }

  .info-box {
    background: hsl(var(--color-primary) / 0.1);
    border: 1px solid hsl(var(--color-primary) / 0.3);
    border-radius: 0.5rem;
    padding: 1rem;
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .info-icon {
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
    color: hsl(var(--color-primary));
    margin-top: 0.125rem;
  }

  .info-box strong {
    color: hsl(var(--color-primary));
  }

  .info-box ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.25rem;
    color: hsl(var(--color-primary));
  }

  .info-box li {
    margin-bottom: 0.25rem;
  }

  .login-prompt {
    background: hsl(40 100% 50% / 0.1);
    border: 2px solid hsl(40 100% 50% / 0.3);
    border-radius: 0.75rem;
    padding: 2rem;
    text-align: center;
  }

  .login-prompt svg {
    color: hsl(40 100% 40%);
    margin: 0 auto 1rem;
  }

  .login-prompt h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: hsl(var(--color-foreground));
    margin: 0 0 0.5rem 0;
  }

  .login-prompt p {
    color: hsl(var(--color-muted-foreground));
    margin: 0;
  }
</style>
