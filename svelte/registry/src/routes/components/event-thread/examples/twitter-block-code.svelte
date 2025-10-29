{#if thread.focusedEventId}
  <div class="thread-container">
    <div class="thread">
      <!-- Parent Chain + Focused Event -->
      {#each thread.events as node, i}
        {#if node.event}
          <EventCard.Root {ndk} event={node.event} threading={node.threading} class="tweet-event-card">
            <div
              class="tweet"
              class:tweet--focused={node.event.id === thread.focusedEventId}
              class:tweet--first={i === 0}
              class:tweet--last={i === thread.events.length - 1}
            >
              <div class="timeline">
                <EventCard.Avatar class="avatar" />
              </div>

              <div class="tweet-content">
                <EventCard.Header variant="compact" />
                <EventCard.Content />

                {#if node.event.id === thread.focusedEventId}
                  <EventCard.Actions>
                    <ReplyAction />
                    <RepostAction />
                    <ReactionAction />
                  </EventCard.Actions>
                {/if}
              </div>
            </div>
          </EventCard.Root>
        {/if}
      {/each}

      <!-- Direct Replies -->
      {#if thread.replies.length > 0}
        {#each thread.replies as reply}
          <EventCard.Root {ndk} event={reply} class="tweet-event-card">
            <div class="tweet">
              <div class="timeline">
                <EventCard.Avatar class="avatar" />
              </div>

              <div class="tweet-content">
                <EventCard.Header variant="compact" />
                <EventCard.Content />
              </div>
            </div>
          </EventCard.Root>
        {/each}
      {/if}
    </div>

    <!-- Other Replies Section -->
    {#if thread.otherReplies.length > 0}
      <div class="section-header">
        {thread.otherReplies.length} {thread.otherReplies.length === 1 ? 'reply' : 'replies'}
      </div>

      <div class="thread">
        {#each thread.otherReplies as reply}
          <EventCard.Root {ndk} event={reply} class="tweet-event-card">
            <div class="tweet">
              <div class="timeline">
                <EventCard.Avatar class="avatar" />
              </div>

              <div class="tweet-content">
                <EventCard.Header variant="compact" />
                <EventCard.Content />
              </div>
            </div>
          </EventCard.Root>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="loading">Loading thread...</div>
{/if}

<style>
  .thread-container {
    background: white;
    border: 1px solid #eff3f4;
    border-radius: 16px;
    overflow: hidden;

    /* DEBUG */
    outline: 3px solid red;
    outline-offset: -3px;
  }

  .thread {
    display: flex;
    flex-direction: column;
    padding: 0 16px;

    /* DEBUG */
    outline: 3px solid blue;
    outline-offset: -3px;
  }

  .tweet {
    position: relative;
    display: grid;
    grid-template-columns: 60px 1fr;
    padding: 12px 0;
    border-bottom: 1px solid #eff3f4;
    cursor: pointer;

    /* DEBUG */
    outline: 3px solid green;
    outline-offset: -3px;
  }

  /* DEBUG: Visualize EventCard.Root wrapper */
  :global(.tweet-event-card) {
    outline: 3px solid orange !important;
    outline-offset: -3px !important;

    /* Remove EventCard.Root default styles that interfere with thread layout */
    padding: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
  }

  /* DEBUG: Visualize EventCard.Header */
  :global(.tweet-event-card .event-card-header) {
    outline: 3px solid magenta !important;
    outline-offset: -3px !important;

    /* Remove header border that conflicts with tweet layout */
    border-bottom: none !important;
  }

  /* Vertical connector line */
  .tweet::before {
    content: '';
    position: absolute;
    left: calc(60px / 2 - 1px); /* Center 2px line in 60px column: 30px - 1px = 29px */
    top: 0;
    bottom: 0;
    width: 2px;
    background: #cfd9de;
  }

  .tweet--first::before {
    top: 40px; /* Start from avatar bottom */
  }

  .tweet--last::before {
    bottom: auto;
    height: 40px; /* End at avatar bottom */
  }

  .timeline {
    display: flex;
    justify-content: center;

    /* DEBUG */
    outline: 3px solid purple;
    outline-offset: -3px;
  }

  .tweet-content {
    min-width: 0;

    /* DEBUG */
    outline: 3px solid cyan;
    outline-offset: -3px;
  }

  .tweet--focused {
    background: #f0f8ff;
  }

  .section-header {
    padding: 12px 16px;
    background: #f7f9f9;
    border-top: 1px solid #eff3f4;
    font-size: 0.8125rem;
    font-weight: 700;
    color: #536471;

    /* DEBUG */
    outline: 3px solid yellow;
    outline-offset: -3px;
  }

  /* DEBUG: Add legend */
  .thread-container::after {
    content: 'DEBUG: RED=container, BLUE=thread, GREEN=tweet, ORANGE=EventCard.Root, MAGENTA=EventCard.Header, PURPLE=timeline, CYAN=tweet-content, YELLOW=section-header';
    display: block;
    position: fixed;
    top: 10px;
    left: 10px;
    background: black;
    color: white;
    padding: 8px;
    font-size: 11px;
    z-index: 9999;
    border-radius: 4px;
    max-width: 80vw;
    line-height: 1.4;
  }
</style>
