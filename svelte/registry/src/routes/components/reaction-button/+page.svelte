<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import ReactionButton from '$lib/ndk/reactions/reaction-button.svelte';

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
</script>

<div class="component-page">
  <header>
    <h1>ReactionButton</h1>
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
          <ReactionButton {ndk} event={sampleEvent} />
        </div>
      </div>
    </div>
    <div class="code-block">
      <pre><code>{`<ReactionButton {ndk} event={event} />`}</code></pre>
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
          <ReactionButton {ndk} event={sampleEvent} showCount={false} />
        </div>
      </div>
    </div>
    <div class="code-block">
      <pre><code>{`<ReactionButton {ndk} event={event} showCount={false} />`}</code></pre>
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
          <ReactionButton {ndk} event={sampleEvent} />
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
          <ReactionButton {ndk} event={sampleEvent} emoji="🔥" />
          <ReactionButton {ndk} event={sampleEvent} emoji="🚀" />
          <ReactionButton {ndk} event={sampleEvent} emoji="👍" />
        </div>
      </div>
    </div>
    <div class="code-block">
      <pre><code>{`<ReactionButton {ndk} event={event} emoji="🔥" />
<ReactionButton {ndk} event={event} emoji="🚀" />
<ReactionButton {ndk} event={event} emoji="👍" />`}</code></pre>
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
</style>
