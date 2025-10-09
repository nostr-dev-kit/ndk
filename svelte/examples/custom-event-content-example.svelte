<!--
  Example: Customizing EventContent components

  This example demonstrates how developers can provide their own
  custom components for rendering different parts of event content.
-->

<script>
  import { NDKSvelte } from '@nostr-dev-kit/ndk-svelte';
  import { EventContent, setEventContentComponents } from '@nostr-dev-kit/ndk-svelte';

  // Import your custom components
  import MyCustomMention from './MyCustomMention.svelte';
  import MyCustomEmbeddedEvent from './MyCustomEmbeddedEvent.svelte';

  const ndk = new NDKSvelte({
    explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol']
  });

  // Example 1: Set global custom components (affects all EventContent instances)
  setEventContentComponents({
    mention: MyCustomMention,
    embeddedEvent: MyCustomEmbeddedEvent
  });

  // Example content with mentions and event references
  const content = `
    Hello nostr:npub1g53mukxnjkcmr94fhryzkqutdz2ukq4ks0gvy5af25rgmwsl4ngq43drvk!

    Check out this note: nostr:note1qqqqqqyz0la2jjl55uqgj8hx0ay9k2xsn3h33h8g0v6cxuwnp69sp36aqg
  `;
</script>

<!-- Example 2: Pass custom components directly to EventContent -->
<div class="example-1">
  <h2>Using global custom components</h2>
  <EventContent {ndk} {content} />
</div>

<!-- Example 3: Override components for a specific instance -->
<div class="example-2">
  <h2>Using instance-specific custom components</h2>
  <EventContent
    {ndk}
    {content}
    components={{
      mention: MyCustomMention,
      // You can mix custom and default components
      // embeddedEvent will use the default component
    }}
    onMentionClick={(pubkey) => {
      console.log('Mention clicked:', pubkey);
    }}
    onNoteClick={(eventId) => {
      console.log('Note clicked:', eventId);
    }}
  />
</div>

<!--
  Example custom mention component (MyCustomMention.svelte):

  <script>
    export let ndk;
    export let pubkey;
    export let pointer = undefined;
    export let onClick = undefined;
  </script>

  <button class="custom-mention" onclick={() => onClick?.(pubkey)}>
    <span class="mention-badge">USER</span>
    <span class="mention-pubkey">{pubkey.slice(0, 6)}...</span>
  </button>

  <style>
    .custom-mention {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }

    .mention-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: bold;
    }
  </style>
-->

<!--
  Example custom embedded event component (MyCustomEmbeddedEvent.svelte):

  <script>
    export let ndk;
    export let eventId = undefined;
    export let pointer = undefined;
    export let onClick = undefined;
  </script>

  <div class="custom-event-card" onclick={onClick}>
    <div class="event-icon">📄</div>
    <div class="event-info">
      <div class="event-label">Referenced Event</div>
      <div class="event-id">{eventId || 'Loading...'}</div>
    </div>
    <div class="event-arrow">→</div>
  </div>

  <style>
    .custom-event-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      margin: 8px 0;
    }

    .custom-event-card:hover {
      background: #e9ecef;
      border-color: #dee2e6;
      transform: translateX(4px);
    }

    .event-icon {
      font-size: 24px;
    }

    .event-info {
      flex: 1;
    }

    .event-label {
      font-size: 12px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .event-id {
      font-family: monospace;
      font-size: 12px;
      color: #495057;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .event-arrow {
      font-size: 20px;
      color: #6c757d;
    }
  </style>
-->