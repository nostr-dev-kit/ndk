<!--
  @component Example - Using EventContent with custom handlers

  This example demonstrates how to customize EventContent handlers:
  1. Setting global handlers via EventContent.handlers (recommended)
  2. Passing handlers prop to specific instances for overrides
-->
<script>
  import { NDKSvelte } from '@nostr-dev-kit/ndk-svelte';
  import EventContent from '@nostr-dev-kit/ndk-svelte';

  const ndk = new NDKSvelte();

  // Sample content with mentions, hashtags, and event references
  const sampleContent = `
    Check out this article by @npub1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab!

    I'm working on #nostr and #svelte integration.

    Here's an interesting note: note1234567890abcdef1234567890abcdef1234567890abcdef1234567890

    Visit https://example.com for more info.
  `;

  // Method 1: Set global handlers using static property (recommended)
  EventContent.handlers.onMentionClick = (bech32) => {
    console.log('Global handler - Mention clicked:', bech32);
    // Navigate to profile page
  };

  EventContent.handlers.onHashtagClick = (tag) => {
    console.log('Global handler - Hashtag clicked:', tag);
    // Navigate to hashtag feed
  };

  EventContent.handlers.onEventClick = (bech32, event) => {
    console.log('Global handler - Event clicked:', bech32, event);
    // Navigate to event page
  };

  EventContent.handlers.onLinkClick = (url) => {
    console.log('Global handler - Link clicked:', url);
    // Handle link click
  };

  // Method 2: Instance-specific handlers via handlers prop
  const customHandlers = {
    onMentionClick: (bech32) => {
      console.log('Instance handler - Mention clicked:', bech32);
      alert(`Navigating to profile: ${bech32}`);
    },
    onHashtagClick: (tag) => {
      console.log('Instance handler - Hashtag clicked:', tag);
      alert(`Searching for #${tag}`);
    }
  };
</script>

<div class="example-container">
  <h2>EventContent Handler Examples</h2>

  <section>
    <h3>1. Using Global Handlers (set via EventContent.handlers)</h3>
    <p>This instance uses the global handlers set at the top of this file.</p>
    <div class="content-box">
      <EventContent {ndk} content={sampleContent} />
    </div>
  </section>

  <section>
    <h3>2. Using Instance-Specific Handlers (via handlers prop)</h3>
    <p>This instance overrides global handlers with custom ones.</p>
    <div class="content-box">
      <EventContent {ndk} content={sampleContent} handlers={customHandlers} />
    </div>
  </section>

  <section>
    <h3>3. Partial Override</h3>
    <p>This instance only overrides the link click handler, keeping other global handlers.</p>
    <div class="content-box">
      <EventContent
        {ndk}
        content={sampleContent}
        handlers={{
          onLinkClick: (url) => {
            console.log('Custom link handler:', url);
            if (confirm(`Open ${url}?`)) {
              window.open(url, '_blank');
            }
          }
        }}
      />
    </div>
  </section>
</div>

<style>
  .example-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
  }

  section {
    margin: 2rem 0;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  h2 {
    color: #111827;
    margin-bottom: 1rem;
  }

  h3 {
    color: #4b5563;
    margin-bottom: 0.5rem;
  }

  p {
    color: #6b7280;
    margin-bottom: 1rem;
  }

  .content-box {
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.25rem;
  }
</style>