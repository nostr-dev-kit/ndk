<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReactionAction } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import ReactionAction from '$lib/ndk/actions/reaction-action.svelte';
  import CodePreview from '$lib/components/code-preview.svelte';
  import AvatarGroup from '$lib/ndk/user-profile/avatar-group.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Fetch a real event for demonstration
  let sampleEvent = $state<NDKEvent | undefined>();

  $effect(() => {
    ndk.fetchEvent('nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j')
      .then(event => {
        if (event) sampleEvent = event;
      })
      .catch(err => console.error('Failed to fetch sample event:', err));
  });

  // Builder example for all reactions
  const reaction = $derived(sampleEvent ? createReactionAction(() => ({ ndk, event: sampleEvent })) : null);
</script>

<div class="component-page">
  <header>
    <h1>ReactionAction</h1>
    <p>Simple reaction button with long-press emoji picker and NIP-30/NIP-51 support.</p>
  </header>

  {#if sampleEvent && reaction}
  <section class="demo">
    <h2>Basic Usage</h2>
    <CodePreview
      title="Click to react"
      description="Click to react with a heart. The button shows the current reaction count."
      code={`<ReactionAction {ndk} event={event} />`}
    >
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <ReactionAction {ndk} event={sampleEvent} />
        </div>
      </div>
    </CodePreview>
  </section>

  <section class="demo">
    <h2>Without Count</h2>
    <CodePreview
      title="Hide count"
      description="Hide the reaction count by setting showCount={false}."
      code={`<ReactionAction {ndk} event={event} showCount={false} />`}
    >
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <ReactionAction {ndk} event={sampleEvent} showCount={false} />
        </div>
      </div>
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
      code={`<ReactionAction {ndk} event={event} />`}
    >
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <ReactionAction {ndk} event={sampleEvent} />
        </div>
      </div>
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
      code={`<ReactionAction {ndk} event={event} emoji="🔥" />
<ReactionAction {ndk} event={event} emoji="🚀" />
<ReactionAction {ndk} event={event} emoji="👍" />`}
    >
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <ReactionAction {ndk} event={sampleEvent} emoji="🔥" />
          <ReactionAction {ndk} event={sampleEvent} emoji="🚀" />
          <ReactionAction {ndk} event={sampleEvent} emoji="👍" />
        </div>
      </div>
    </CodePreview>
  </section>

  <!-- Using Builder Directly -->
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
      code={`const reaction = createReactionAction(() => ({ ndk, event }));

<!-- React with any emoji -->
<button onclick={() => reaction.react("+")}>
  ❤️ {reaction.get("+")?.count ?? 0}
</button>

<button onclick={() => reaction.react("🔥")}>
  🔥 {reaction.get("🔥")?.count ?? 0}
</button>

<button onclick={() => reaction.react("🚀")}>
  🚀 {reaction.get("🚀")?.count ?? 0}
</button>`}
    >
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions builder-examples">
          <!-- Like button -->
          <button class="custom-reaction-btn" onclick={() => reaction.react("+")}>
            <span class="emoji">❤️</span>
            <span class="count">{reaction.get("+")?.count ?? 0}</span>
          </button>

          <!-- Fire button -->
          <button
            class="custom-reaction-btn"
            class:reacted={reaction.get("🔥")?.hasReacted}
            onclick={() => reaction.react("🔥")}
          >
            <span class="emoji">🔥</span>
            <span class="count">{reaction.get("🔥")?.count ?? 0}</span>
          </button>

          <!-- Rocket button -->
          <button
            class="custom-reaction-btn icon-only"
            class:reacted={reaction.get("🚀")?.hasReacted}
            onclick={() => reaction.react("🚀")}
            title={reaction.get("🚀")?.hasReacted ? 'Remove reaction' : 'React with 🚀'}
          >
            🚀
          </button>
        </div>
      </div>
    </CodePreview>

    <CodePreview
      title="Slack-Style Reaction Pills"
      description="Display reactions as interactive pills with emoji, count, and hover tooltips showing who reacted. Client filters for followers."
      code={`const reaction = createReactionAction(() => ({ ndk, event }));

<!-- All reactions sorted by count, client filters followers -->
{#each reaction.all as { emoji, count, hasReacted, pubkeys }}
  <button
    class="reaction-pill"
    class:reacted={hasReacted}
    onclick={() => reaction.react(emoji)}
  >
    <span class="emoji">{emoji}</span>
    <span class="count">{count}</span>

    <div class="hover-tooltip">
      <AvatarGroup {ndk} pubkeys={pubkeys.slice(0, 3)} max={3} size={24} />
      <span>{pubkeys.length} pubkeys.length > 1 ? 's' : ''}</span>
    </div>
  </button>
{/each}`}
    >
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="slack-reactions">
          {#each reaction.all as { emoji, count, hasReacted, pubkeys } (emoji)}
            <button
              class="reaction-pill"
              class:reacted={hasReacted}
              onclick={() => reaction.react(emoji)}
            >
              <span class="emoji">{emoji}</span>
              <span class="count">{count}</span>

              <div class="hover-tooltip">
                <AvatarGroup {ndk} pubkeys={pubkeys.slice(0, 3)} max={3} size={24} spacing="tight" />
                <span class="tooltip-text">
                  {pubkeys.length} follower{pubkeys.length > 1 ? 's' : ''} reacted
                </span>
              </div>
            </button>
          {/each}
          {#if reaction.all.length === 0}
            <p class="no-reactions">No reactions yet</p>
          {/if}
        </div>
      </div>
    </CodePreview>

    <div class="info-box">
      <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <strong>Builder API:</strong>
        <ul>
          <li><code>createReactionAction(() => ({ ndk, event }))</code> - Create reactive reaction manager</li>
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

  header {
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: hsl(var(--color-foreground));
  }

  header p {
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

  h2 {
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

  .demo-event-card {
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .event-content {
    margin-bottom: 1rem;
  }

  .event-content p {
    margin: 0;
    color: hsl(var(--color-foreground));
    line-height: 1.6;
  }

  .event-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid hsl(var(--color-border));
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

  /* Custom reaction button styles for builder examples */
  .builder-examples {
    gap: 1rem;
  }

  .custom-reaction-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .custom-reaction-btn:hover {
    background: hsl(var(--color-muted));
    border-color: hsl(var(--color-border));
  }

  .custom-reaction-btn.reacted {
    background: hsl(var(--color-primary) / 0.1);
    border-color: hsl(var(--color-primary));
    color: hsl(var(--color-primary));
  }

  .custom-reaction-btn.reacted:hover {
    background: hsl(var(--color-primary) / 0.2);
  }

  .custom-reaction-btn .emoji {
    font-size: 1.125rem;
    line-height: 1;
  }

  .custom-reaction-btn .count {
    font-weight: 500;
    color: hsl(var(--color-muted-foreground));
    min-width: 1rem;
    text-align: center;
  }

  .custom-reaction-btn.reacted .count {
    color: hsl(var(--color-primary));
  }

  .custom-reaction-btn.icon-only {
    padding: 0.5rem;
    font-size: 1.125rem;
    min-width: 2.5rem;
    justify-content: center;
  }

  /* Slack-style reaction pills */
  .slack-reactions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid hsl(var(--color-border));
  }

  .reaction-pill {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    background: hsl(var(--color-card));
    border: 1.5px solid hsl(var(--color-border));
    border-radius: 1rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .reaction-pill:hover {
    background: hsl(var(--color-muted) / 0.5);
    border-color: hsl(var(--color-muted-foreground) / 0.3);
    transform: translateY(-1px);
  }

  .reaction-pill.reacted {
    background: hsl(var(--color-primary) / 0.12);
    border-color: hsl(var(--color-primary) / 0.5);
  }

  .reaction-pill.reacted:hover {
    background: hsl(var(--color-primary) / 0.18);
    border-color: hsl(var(--color-primary) / 0.7);
  }

  .reaction-pill .emoji {
    font-size: 1rem;
    line-height: 1;
  }

  .reaction-pill .count {
    font-weight: 600;
    font-size: 0.8125rem;
    color: hsl(var(--color-muted-foreground));
  }

  .reaction-pill.reacted .count {
    color: hsl(var(--color-primary));
  }

  /* Hover tooltip */
  .hover-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 0.5rem;
    padding: 0.75rem 1rem;
    background: hsl(var(--color-popover));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    white-space: nowrap;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .reaction-pill:hover .hover-tooltip {
    opacity: 1;
  }

  .hover-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: hsl(var(--color-border));
  }

  .tooltip-text {
    font-size: 0.75rem;
    color: hsl(var(--color-muted-foreground));
    font-weight: 500;
  }

  .no-reactions {
    color: hsl(var(--color-muted-foreground));
    text-align: center;
    padding: 1rem;
    font-style: italic;
  }
</style>
