<script lang="ts">
  import { ndk } from './lib/ndk';

  // Subscribe to kind:1 events
  const sub = ndk.subscribe([
    {
      kinds: [1], // Text notes
      limit: 20
    }
  ]);

  // Get the most recent event (first in the array since they're sorted by created_at DESC)
  const mostRecent = $derived(sub.events[0]);

  // Format timestamp
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  // Debug - watch the events and log NDK connection
  $effect(() => {
    console.log('Events in template:', sub.events.length);
    console.log('NDK pool relays:', ndk.pool?.relays?.size);
  });
</script>

<main>
  <header>
    <h1>Reactive Subscription Demo</h1>
    <div class="stats">
      <span class="count">Total events received: {sub.events.length}</span>
    </div>
  </header>

  <div class="content">
    {#if !mostRecent}
      <p class="empty">No events yet. Waiting...</p>
    {:else}
      <div class="most-recent">
        <h2>Most Recent Event</h2>
        <div class="event-card">
          <div class="event-meta">
            <span class="pubkey">{mostRecent.pubkey.slice(0, 16)}...</span>
            <span class="time">{formatTime(mostRecent.created_at!)}</span>
          </div>
          <p class="event-content">{mostRecent.content}</p>
        </div>
      </div>
    {/if}
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #f5f5f5;
  }

  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  header {
    text-align: center;
    margin-bottom: 40px;
  }

  h1 {
    margin: 0 0 16px 0;
    font-size: 32px;
    color: #333;
  }

  .stats {
    display: flex;
    gap: 16px;
    justify-content: center;
    align-items: center;
  }

  .count {
    color: #666;
    font-size: 18px;
    font-weight: 500;
  }

  .loading {
    color: #9c27b0;
    font-weight: 500;
  }

  .content {
    display: flex;
    justify-content: center;
  }

  .empty {
    text-align: center;
    color: #999;
    padding: 60px;
    font-size: 18px;
  }

  .most-recent {
    width: 100%;
  }

  .most-recent h2 {
    margin: 0 0 20px 0;
    font-size: 20px;
    color: #666;
    text-align: center;
  }

  .event-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .event-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e0e0e0;
  }

  .pubkey {
    color: #9c27b0;
    font-family: monospace;
    font-size: 14px;
  }

  .time {
    color: #999;
    font-size: 14px;
  }

  .event-content {
    color: #333;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 0;
    font-size: 16px;
  }
</style>
