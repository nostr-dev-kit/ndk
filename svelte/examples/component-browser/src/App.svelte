<script lang="ts">
  import NDK, { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
  import { Avatar, EventContent, ZapButton, TransactionList } from '@nostr-dev-kit/svelte';

  // Initialize NDK
  const ndk = new NDK({
    explicitRelayUrls: [
      'wss://relay.damus.io',
      'wss://nos.lol',
      'wss://relay.nostr.band'
    ],
    enableOutboxModel: false
  });

  ndk.connect();

  // Component examples state
  type ComponentName = 'Avatar' | 'EventContent' | 'ZapButton' | 'TransactionList';
  let selectedComponent = $state<ComponentName>('Avatar');

  // Avatar props
  let avatarPubkey = $state('npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6'); // Jack Dorsey
  let avatarSize = $state(80);

  // EventContent props
  let eventContentText = $state(
    'Hello Nostr! 👋\n\nCheck out this amazing protocol: https://nostr.com\n\nMention: nostr:npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6'
  );

  // ZapButton props
  let zapAmount = $state(21);
  let zapComment = $state('Great post!');

  // TransactionList props
  let txListLimit = $state(10);
  let txListDirection = $state<'in' | 'out' | undefined>(undefined);

  // Create a dummy user for testing
  const testUser = ndk.getUser({
    pubkey: '180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6'
  });

  // Create a dummy event for testing
  const testEvent = new NDKEvent(ndk, {
    kind: 1,
    content: 'Test event',
    pubkey: '180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6',
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
  });

  const components = [
    { name: 'Avatar', description: 'Display user avatars with automatic profile fetching' },
    { name: 'EventContent', description: 'Render Nostr event content with rich formatting' },
    { name: 'ZapButton', description: 'Send lightning zaps to users or events' },
    { name: 'TransactionList', description: 'Display payment transactions' }
  ] as const;
</script>

<div class="app">
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1>NDK Svelte 5</h1>
      <p class="subtitle">Component Browser</p>
    </div>

    <nav class="component-list">
      {#each components as component}
        <button
          class="component-item"
          class:active={selectedComponent === component.name}
          onclick={() => selectedComponent = component.name}
        >
          <div class="component-name">{component.name}</div>
          <div class="component-description">{component.description}</div>
        </button>
      {/each}
    </nav>

    <div class="sidebar-footer">
      <a href="https://github.com/nostr-dev-kit/ndk" target="_blank" rel="noopener noreferrer">
        View on GitHub
      </a>
    </div>
  </aside>

  <main class="content">
    <div class="content-header">
      <h2>{selectedComponent}</h2>
    </div>

    <div class="content-body">
      {#if selectedComponent === 'Avatar'}
        <div class="demo-section">
          <h3>Demo</h3>
          <div class="demo-area">
            <Avatar {ndk} pubkey={avatarPubkey} size={avatarSize} />
          </div>
        </div>

        <div class="controls-section">
          <h3>Props</h3>
          <div class="control-group">
            <label for="avatar-pubkey">
              pubkey <span class="required">*</span>
            </label>
            <input
              id="avatar-pubkey"
              type="text"
              bind:value={avatarPubkey}
              placeholder="npub or hex pubkey"
            />
            <span class="help-text">User's public key (npub or hex format)</span>
          </div>

          <div class="control-group">
            <label for="avatar-size">size</label>
            <input
              id="avatar-size"
              type="range"
              min="20"
              max="200"
              bind:value={avatarSize}
            />
            <span class="value-display">{avatarSize}px</span>
            <span class="help-text">Avatar size in pixels (default: 40)</span>
          </div>
        </div>

      {:else if selectedComponent === 'EventContent'}
        <div class="demo-section">
          <h3>Demo</h3>
          <div class="demo-area content-demo">
            <EventContent
              {ndk}
              content={eventContentText}
            />
          </div>
        </div>

        <div class="controls-section">
          <h3>Props</h3>
          <div class="control-group">
            <label for="content-text">content</label>
            <textarea
              id="content-text"
              bind:value={eventContentText}
              rows="8"
              placeholder="Enter event content..."
            ></textarea>
            <span class="help-text">
              Supports mentions (nostr:npub...), links, images, videos, YouTube embeds, and custom emojis
            </span>
          </div>
        </div>

      {:else if selectedComponent === 'ZapButton'}
        <div class="demo-section">
          <h3>Demo</h3>
          <div class="demo-area">
            <ZapButton
              target={testEvent}
              amount={zapAmount}
              comment={zapComment}
            />
          </div>
          <p class="warning">
            ⚠️ Note: This is a demo button. Actual zapping requires a connected wallet.
          </p>
        </div>

        <div class="controls-section">
          <h3>Props</h3>
          <div class="control-group">
            <label for="zap-amount">amount</label>
            <input
              id="zap-amount"
              type="number"
              bind:value={zapAmount}
              min="1"
              step="1"
            />
            <span class="help-text">Zap amount in sats (default: 21)</span>
          </div>

          <div class="control-group">
            <label for="zap-comment">comment</label>
            <input
              id="zap-comment"
              type="text"
              bind:value={zapComment}
              placeholder="Optional comment"
            />
            <span class="help-text">Optional comment to include with zap</span>
          </div>
        </div>

      {:else if selectedComponent === 'TransactionList'}
        <div class="demo-section">
          <h3>Demo</h3>
          <div class="demo-area">
            <TransactionList
              limit={txListLimit}
              direction={txListDirection}
            />
          </div>
          <p class="warning">
            ⚠️ Note: This component requires an active wallet connection to display transactions.
          </p>
        </div>

        <div class="controls-section">
          <h3>Props</h3>
          <div class="control-group">
            <label for="tx-limit">limit</label>
            <input
              id="tx-limit"
              type="number"
              bind:value={txListLimit}
              min="1"
              max="100"
            />
            <span class="help-text">Maximum number of transactions to display</span>
          </div>

          <div class="control-group">
            <label for="tx-direction">direction</label>
            <select id="tx-direction" bind:value={txListDirection}>
              <option value={undefined}>All</option>
              <option value="in">Incoming</option>
              <option value="out">Outgoing</option>
            </select>
            <span class="help-text">Filter by transaction direction</span>
          </div>
        </div>
      {/if}
    </div>
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #0a0a0a;
    color: rgba(255, 255, 255, 0.9);
  }

  .app {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  /* Sidebar */
  .sidebar {
    width: 280px;
    background: rgba(255, 255, 255, 0.03);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .sidebar-header {
    padding: 2rem 1.5rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .sidebar-header h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .component-list {
    flex: 1;
    padding: 1rem 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .component-item {
    padding: 0.875rem 1rem;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
    color: inherit;
    font: inherit;
  }

  .component-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .component-item.active {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.4);
  }

  .component-name {
    font-weight: 600;
    font-size: 0.9375rem;
    margin-bottom: 0.25rem;
  }

  .component-description {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.4;
  }

  .sidebar-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .sidebar-footer a {
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.2s;
  }

  .sidebar-footer a:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  /* Content */
  .content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
  }

  .content-header {
    margin-bottom: 2rem;
  }

  .content-header h2 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
  }

  .content-body {
    max-width: 800px;
  }

  .demo-section {
    margin-bottom: 3rem;
  }

  .demo-section h3 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
  }

  .demo-area {
    padding: 2rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
  }

  .demo-area.content-demo {
    align-items: flex-start;
    justify-content: flex-start;
  }

  .controls-section h3 {
    margin: 0 0 1.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
  }

  .control-group {
    margin-bottom: 1.5rem;
  }

  .control-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .required {
    color: #f87171;
  }

  .control-group input[type="text"],
  .control-group input[type="number"],
  .control-group textarea,
  .control-group select {
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: inherit;
    font: inherit;
    font-size: 0.9375rem;
    transition: all 0.2s;
  }

  .control-group input[type="text"]:focus,
  .control-group input[type="number"]:focus,
  .control-group textarea:focus,
  .control-group select:focus {
    outline: none;
    border-color: rgba(139, 92, 246, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }

  .control-group input[type="range"] {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .control-group textarea {
    resize: vertical;
    min-height: 100px;
  }

  .value-display {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: rgba(139, 92, 246, 0.2);
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #a78bfa;
    margin-bottom: 0.5rem;
  }

  .help-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.4;
  }

  .warning {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 8px;
    font-size: 0.875rem;
    color: #fbbf24;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .app {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
      height: auto;
      max-height: 40vh;
    }

    .content {
      padding: 1rem;
    }
  }
</style>
