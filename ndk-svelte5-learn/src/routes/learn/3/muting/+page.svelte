<script lang="ts">
	import CodeBlock from '$lib/components/tutorial/CodeBlock.svelte';
	import { LEARN_LEVELS } from '$lib/data/learn-structure';

	const level = LEARN_LEVELS[2]; // Level 3
	const lesson = level.lessons.find(l => l.id === 'muting');
</script>

<div class="lesson">
	<div class="breadcrumb">
		<a href="/learn">Learn</a> /
		<a href="/learn">Level {level.level}: {level.title}</a> /
		<span>{lesson?.title}</span>
	</div>

	<header>
		<h1>{lesson?.title}</h1>
		<p class="description">{lesson?.description}</p>
		<div class="meta">
			<span class="time">⏱ {lesson?.estimatedTime}</span>
			<span class="level">Level {level.level}</span>
		</div>
	</header>

	<article>
		<section>
			<h2>What You'll Learn</h2>
			<ul>
				<li>How automatic mute filtering works in NDK</li>
				<li>How to use the mutes store for advanced filtering</li>
				<li>How to mute users, keywords, and hashtags</li>
				<li>When to include muted content (moderation UI)</li>
			</ul>
		</section>

		<section>
			<h2>How Mute Filtering Works</h2>
			<p>NDK automatically filters out muted content from all subscriptions. When you initialize the mutes store, it sets up NDK's mute filter to check against your mute list.</p>

			<p>The mute list (kind 10000, NIP-51) is automatically fetched when you log in, and all subscriptions filter muted events by default.</p>
		</section>

		<section>
			<h2>Basic Usage</h2>
			<p>The mutes store provides a simple API for managing muted content:</p>

			<CodeBlock
				code={`<script lang="ts">
  import { mutes } from '@nostr-dev-kit/ndk-svelte5';
  import { createSubscription } from '@nostr-dev-kit/ndk-svelte5';

  // Muted events are automatically filtered
  const notes = createSubscription(ndk, { kinds: [1], limit: 50 });

  // Mute a user
  function muteUser(pubkey: string) {
    mutes.add({ pubkey });
  }

  // Mute a keyword
  function muteWord(word: string) {
    mutes.add({ word });
  }

  // Mute a hashtag
  function muteHashtag(hashtag: string) {
    mutes.add({ hashtag });
  }

  // Check if muted
  const isMuted = mutes.check({ pubkey: 'hex...' });
</script>

<!-- All notes will automatically exclude muted content -->
{#each notes.events as note}
  <div>{note.content}</div>
{/each}`}
				language="typescript"
				title="Basic Muting"
			/>
		</section>

		<section>
			<h2>Advanced Filtering</h2>
			<p>The mutes store provides filtering beyond simple pubkey blocking:</p>

			<CodeBlock
				code={`<script lang="ts">
  import { mutes } from '@nostr-dev-kit/ndk-svelte5';

  // Different types of mutes
  mutes.add({ pubkey: 'hex...' });     // Block user
  mutes.add({ word: 'spam' });         // Filter posts with word
  mutes.add({ hashtag: 'nsfw' });      // Filter hashtag
  mutes.add({ eventId: 'hex...' });    // Block specific event

  // Check what's muted
  console.log(mutes.pubkeys);   // Set<string>
  console.log(mutes.words);     // Set<string>
  console.log(mutes.hashtags);  // Set<string>
  console.log(mutes.eventIds);  // Set<string>

  // Remove mutes
  mutes.remove({ pubkey: 'hex...' });

  // Clear all
  mutes.clear();

  // Publish to relays (NIP-51)
  await mutes.publish();
</script>`}
				language="typescript"
				title="Advanced Muting"
			/>
		</section>

		<section>
			<h2>Including Muted Content</h2>
			<p>Sometimes you need to show muted content, like in a moderation interface or settings page. Use <code>includeMuted: true</code> to opt-in:</p>

			<CodeBlock
				code={`<script lang="ts">
  import { createSubscription } from '@nostr-dev-kit/ndk-svelte5';

  // Include muted content for moderation UI
  const allNotes = createSubscription(
    ndk,
    { kinds: [1] },
    { includeMuted: true }
  );
</script>

{#each allNotes.events as note}
  {#if note.muted()}
    <div class="muted">
      <span class="warning">⚠️ Muted</span>
      {note.content}
    </div>
  {:else}
    <div>{note.content}</div>
  {/if}
{/each}

<style>
  .muted {
    opacity: 0.5;
    background: #1a1a1a;
    padding: 1rem;
    border-left: 3px solid #666;
  }

  .warning {
    color: #ff6b6b;
    font-weight: 600;
  }
</style>`}
				language="typescript"
				title="Moderation Interface"
			/>
		</section>

		<section>
			<h2>Building a Mute Manager</h2>
			<p>Here's a complete example of a mute management UI:</p>

			<CodeBlock
				code={`<script lang="ts">
  import { mutes } from '@nostr-dev-kit/ndk-svelte5';

  let newMutePubkey = $state('');
  let newMuteWord = $state('');

  function addPubkeyMute() {
    if (newMutePubkey) {
      mutes.add({ pubkey: newMutePubkey });
      newMutePubkey = '';
    }
  }

  function addWordMute() {
    if (newMuteWord) {
      mutes.add({ word: newMuteWord });
      newMuteWord = '';
    }
  }

  async function saveToRelays() {
    await mutes.publish();
    alert('Mute list published!');
  }
</script>

<div class="mute-manager">
  <h2>Mute Management</h2>

  <!-- Mute User -->
  <section>
    <h3>Muted Users ({mutes.pubkeys.size})</h3>
    <div class="input-group">
      <input
        bind:value={newMutePubkey}
        placeholder="Enter pubkey to mute"
      />
      <button onclick={addPubkeyMute}>Mute User</button>
    </div>

    <ul>
      {#each [...mutes.pubkeys] as pubkey}
        <li>
          {pubkey.slice(0, 8)}...
          <button onclick={() => mutes.remove({ pubkey })}>
            Remove
          </button>
        </li>
      {/each}
    </ul>
  </section>

  <!-- Mute Words -->
  <section>
    <h3>Muted Words ({mutes.words.size})</h3>
    <div class="input-group">
      <input
        bind:value={newMuteWord}
        placeholder="Enter word to mute"
      />
      <button onclick={addWordMute}>Mute Word</button>
    </div>

    <ul>
      {#each [...mutes.words] as word}
        <li>
          {word}
          <button onclick={() => mutes.remove({ word })}>
            Remove
          </button>
        </li>
      {/each}
    </ul>
  </section>

  <!-- Save -->
  <button class="primary" onclick={saveToRelays}>
    Publish Mute List
  </button>
</div>`}
				language="typescript"
				title="Mute Manager Component"
			/>
		</section>

		<section>
			<h2>Key Takeaways</h2>
			<ul>
				<li><strong>Automatic by default:</strong> All subscriptions filter muted content automatically</li>
				<li><strong>Multiple filter types:</strong> Users, keywords, hashtags, and specific events</li>
				<li><strong>Opt-in for special cases:</strong> Use <code>includeMuted: true</code> for moderation</li>
				<li><strong>Synced with relays:</strong> Use <code>mutes.publish()</code> to save to kind 10000</li>
			</ul>
		</section>

		<section>
			<h2>What's Next?</h2>
			<p>Now you know how to filter unwanted content. Next, learn about advanced features like threads and reactions.</p>
			<div class="next-lesson">
				<a href="/learn/4/threads" class="btn-primary">
					Next: Thread Views →
				</a>
			</div>
		</section>
	</article>

	<nav class="lesson-nav">
		<a href="/learn/3/authentication" class="btn-secondary">← Previous Lesson</a>
		<a href="/learn/4/threads" class="btn-primary">Next Lesson →</a>
	</nav>
</div>

<style>
	.lesson {
		max-width: 800px;
		margin: 0 auto;
	}

	.breadcrumb {
		color: #666;
		font-size: 0.875rem;
		margin-bottom: 2rem;
	}

	.breadcrumb a {
		color: #8b5cf6;
	}

	.breadcrumb span {
		color: #a0a0a0;
	}

	header {
		margin-bottom: 3rem;
	}

	header h1 {
		margin: 0 0 1rem 0;
		font-size: 2.5rem;
	}

	.description {
		font-size: 1.25rem;
		color: #a0a0a0;
		margin: 0 0 1rem 0;
	}

	.meta {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
		color: #666;
	}

	.level {
		padding: 0.25rem 0.625rem;
		background: #8b5cf6;
		color: white;
		border-radius: 4px;
	}

	article {
		line-height: 1.7;
	}

	section {
		margin-bottom: 3rem;
	}

	section h2 {
		margin: 0 0 1rem 0;
		color: #fff;
	}

	section h3 {
		margin: 0 0 0.75rem 0;
		color: #d0d0d0;
	}

	section p {
		color: #d0d0d0;
		margin: 0 0 1rem 0;
	}

	section ul {
		color: #d0d0d0;
		margin: 0 0 1rem 0;
		padding-left: 1.5rem;
	}

	section li {
		margin: 0.5rem 0;
	}

	section code {
		background: #1a1a1a;
		padding: 0.125rem 0.375rem;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
		color: #8b5cf6;
	}

	.next-lesson {
		margin-top: 2rem;
	}

	.lesson-nav {
		display: flex;
		justify-content: space-between;
		padding: 2rem 0;
		border-top: 1px solid #333;
		margin-top: 3rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #8b5cf6;
		color: white;
	}

	.btn-primary:hover {
		background: #7c3aed;
		text-decoration: none;
	}

	.btn-secondary {
		background: #1a1a1a;
		border: 1px solid #333;
		color: #a0a0a0;
	}

	.btn-secondary:hover {
		border-color: #8b5cf6;
		color: #fff;
		text-decoration: none;
	}
</style>
