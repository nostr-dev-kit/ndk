<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import CodePreview from '$site-components/code-preview.svelte';
  import Alert from '$site-components/alert.svelte';
  import LoginPrompt from '$site-components/login-prompt.svelte';
  import FeatureList from '$site-components/feature-list.svelte';

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
    <FeatureList items={[
      { title: 'Your Emojis', description: 'Custom emojis from your NIP-51 kind:10030 list' },
      { title: 'Standard Emojis', description: 'Common reaction emojis' }
    ]} />
    <CodePreview
      title="Long-press interaction"
      description="Try long-pressing the reaction button to open the emoji picker"
      code={LongPressExampleRaw}
    >
      <LongPressExample {ndk} event={sampleEvent} />
    </CodePreview>
    <Alert variant="info" title="How it works">
      <ul>
        <li><strong>Quick click</strong> - React with the default emoji (❤️)</li>
        <li><strong>Long-press</strong> - Open emoji picker to choose any emoji</li>
        <li>Custom emojis use <strong>NIP-30</strong> format with emoji tags</li>
        <li>User preferences loaded from <strong>NIP-51 kind:10030</strong></li>
      </ul>
    </Alert>
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

    <Alert variant="info" title="Builder API">
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
    </Alert>
  </section>
  {:else}
    <section class="demo">
      <p>Loading event...</p>
    </section>
  {/if}

  {#if !ndk.$currentPubkey}
    <section class="demo">
      <LoginPrompt
        message="To test reactions and see your custom emojis from NIP-51, please login using the sidebar."
      />
    </section>
  {/if}
</div>

<style>
  .demo-description code {
    background: hsl(var(--color-muted));
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    color: hsl(var(--color-primary));
  }
</style>
