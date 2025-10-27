<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReactionAction } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import ReactionAction from '$lib/ndk/actions/reaction-action.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Create a sample event for demonstration
  const sampleEvent = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: 'This is a sample note to demonstrate reactions!',
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: []
  });
  // Set a predictable ID for the demo
  sampleEvent.id = 'demo-event-reactions-showcase';

  // Builder examples
  const likeReaction = createReactionAction(ndk, () => sampleEvent, () => "+");
  const fireReaction = createReactionAction(ndk, () => sampleEvent, () => "🔥");
  const rocketReaction = createReactionAction(ndk, () => sampleEvent, () => "🚀");
</script>

<div class="component-page">
  <header>
    <h1>ReactionAction</h1>
    <p>Simple reaction button with long-press emoji picker and NIP-30/NIP-51 support.</p>
  </header>

  <section class="demo">
    <h2>Basic Usage</h2>
    <p class="demo-description">
      Click to react with a heart. The button shows the current reaction count.
    </p>
    <div class="demo-container">
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <ReactionAction {ndk} event={sampleEvent} />
        </div>
      </div>
    </div>
    <div class="code-block">
      <pre><code>{`<ReactionAction {ndk} event={event} />`}</code></pre>
    </div>
  </section>

  <section class="demo">
    <h2>Without Count</h2>
    <p class="demo-description">
      Hide the reaction count by setting <code>showCount={false}</code>.
    </p>
    <div class="demo-container">
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <ReactionAction {ndk} event={sampleEvent} showCount={false} />
        </div>
      </div>
    </div>
    <div class="code-block">
      <pre><code>{`<ReactionAction {ndk} event={event} showCount={false} />`}</code></pre>
    </div>
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
    <div class="demo-container">
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <ReactionAction {ndk} event={sampleEvent} />
        </div>
      </div>
    </div>
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
    <p class="demo-description">
      Change the default emoji with the <code>emoji</code> prop.
    </p>
    <div class="demo-container">
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
    </div>
    <div class="code-block">
      <pre><code>{`<ReactionAction {ndk} event={event} emoji="🔥" />
<ReactionAction {ndk} event={event} emoji="🚀" />
<ReactionAction {ndk} event={event} emoji="👍" />`}</code></pre>
    </div>
  </section>

  <!-- Using Builder Directly -->
  <section class="demo">
    <h2>Using the Builder Directly</h2>
    <p class="demo-description">
      For maximum control over your UI, use <code>createReactionAction()</code> directly without the
      component. This gives you full control over the markup while still benefiting from reactive
      state management.
    </p>

    <div class="demo-container">
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions builder-examples">
          <!-- Like button -->
          <button class="custom-reaction-btn" onclick={likeReaction.toggle}>
            <span class="emoji">❤️</span>
            <span class="count">{likeReaction.count}</span>
          </button>

          <!-- Fire button -->
          <button
            class="custom-reaction-btn"
            class:reacted={fireReaction.hasReacted}
            onclick={fireReaction.toggle}
          >
            <span class="emoji">🔥</span>
            <span class="count">{fireReaction.count}</span>
          </button>

          <!-- Rocket button -->
          <button
            class="custom-reaction-btn icon-only"
            class:reacted={rocketReaction.hasReacted}
            onclick={rocketReaction.toggle}
            title={rocketReaction.hasReacted ? 'Remove reaction' : 'React with 🚀'}
          >
            🚀
          </button>
        </div>
      </div>
    </div>

    <div class="code-block">
      <pre><code>{`const reaction = createReactionAction(ndk, () => event, () => "+");

<button onclick={reaction.toggle}>
  ❤️ {reaction.count}
</button>

<button
  class:reacted={reaction.hasReacted}
  onclick={reaction.toggle}
>
  {reaction.hasReacted ? 'Unlike' : 'Like'} ({reaction.count})
</button>`}</code></pre>
    </div>

    <div class="info-box">
      <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <strong>Builder API:</strong>
        <ul>
          <li><code>reaction.hasReacted</code> - Boolean indicating if current user has reacted</li>
          <li><code>reaction.count</code> - Total number of reactions with this emoji</li>
          <li><code>reaction.allReactions</code> - Map of all reactions by emoji</li>
          <li><code>reaction.toggle()</code> - Toggle reaction with the default emoji</li>
          <li><code>reaction.react(emoji)</code> - React with a specific emoji</li>
        </ul>
      </div>
    </div>
  </section>

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
    color: #111827;
  }

  header p {
    font-size: 1.125rem;
    color: #6b7280;
    margin: 0;
  }

  .demo {
    margin-bottom: 3rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .demo:last-child {
    border-bottom: none;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #111827;
  }

  .demo-description {
    color: #6b7280;
    margin: 0 0 1.5rem 0;
    line-height: 1.6;
  }

  .demo-description code {
    background: #f3f4f6;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    color: #8b5cf6;
  }

  .demo-container {
    margin-bottom: 1.5rem;
  }

  .demo-event-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .event-content {
    margin-bottom: 1rem;
  }

  .event-content p {
    margin: 0;
    color: #374151;
    line-height: 1.6;
  }

  .event-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid #f3f4f6;
  }

  .code-block {
    background: #1f2937;
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
  }

  .code-block pre {
    margin: 0;
  }

  .code-block code {
    color: #e5e7eb;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .feature-list {
    margin: 1rem 0 1.5rem 0;
    padding-left: 1.5rem;
    color: #4b5563;
  }

  .feature-list li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .feature-list strong {
    color: #111827;
  }

  .info-box {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
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
    color: #3b82f6;
    margin-top: 0.125rem;
  }

  .info-box strong {
    color: #1e40af;
  }

  .info-box ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.25rem;
    color: #1e40af;
  }

  .info-box li {
    margin-bottom: 0.25rem;
  }

  .login-prompt {
    background: #fef3c7;
    border: 2px solid #fcd34d;
    border-radius: 0.75rem;
    padding: 2rem;
    text-align: center;
  }

  .login-prompt svg {
    color: #f59e0b;
    margin: 0 auto 1rem;
  }

  .login-prompt h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #92400e;
    margin: 0 0 0.5rem 0;
  }

  .login-prompt p {
    color: #78350f;
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
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .custom-reaction-btn:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  .custom-reaction-btn.reacted {
    background: #eff6ff;
    border-color: #3b82f6;
    color: #1e40af;
  }

  .custom-reaction-btn.reacted:hover {
    background: #dbeafe;
  }

  .custom-reaction-btn .emoji {
    font-size: 1.125rem;
    line-height: 1;
  }

  .custom-reaction-btn .count {
    font-weight: 500;
    color: #6b7280;
    min-width: 1rem;
    text-align: center;
  }

  .custom-reaction-btn.reacted .count {
    color: #1e40af;
  }

  .custom-reaction-btn.icon-only {
    padding: 0.5rem;
    font-size: 1.125rem;
    min-width: 2.5rem;
    justify-content: center;
  }
</style>
