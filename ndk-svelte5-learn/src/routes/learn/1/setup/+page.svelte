<script lang="ts">
	import CodeBlock from '$lib/components/tutorial/CodeBlock.svelte';
	import LiveREPL from '$lib/components/tutorial/LiveREPL.svelte';
	import { LEARN_LEVELS } from '$lib/data/learn-structure';

	const level = LEARN_LEVELS[0]; // Level 1
	const lesson = level.lessons.find(l => l.id === 'setup');
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
				<li>How to install NDK and NDK Svelte 5</li>
				<li>How to set up a new SvelteKit project</li>
				<li>How to configure TypeScript for NDK</li>
			</ul>
		</section>

		<section>
			<h2>Installation</h2>
			<p>First, create a new SvelteKit project if you don't have one:</p>

			<CodeBlock
				code="npm create svelte@latest my-nostr-app
cd my-nostr-app
npm install"
				language="bash"
				title="terminal"
			/>

			<p>Next, install NDK and NDK Svelte 5:</p>

			<CodeBlock
				code="npm install @nostr-dev-kit/ndk @nostr-dev-kit/ndk-svelte5"
				language="bash"
				title="terminal"
			/>
		</section>

		<section>
			<h2>Interactive Example</h2>
			<p>
				Here's how a basic NDK connection works. You can edit the code and copy it to your project:
			</p>

			<LiveREPL
				code={`<script lang="ts">
	import NDK from '@nostr-dev-kit/ndk';
	import { onMount } from 'svelte';

	let status = $state('Not connected');
	let relayCount = $state(0);

	onMount(async () => {
		const ndk = new NDK({
			explicitRelayUrls: [
				'wss://relay.damus.io',
				'wss://relay.nostr.band',
				'wss://nos.lol'
			]
		});

		status = 'Connecting...';

		try {
			await ndk.connect();
			relayCount = ndk.pool.relays.size;
			status = 'Connected!';
		} catch (e) {
			status = 'Connection failed';
		}
	});
</script>

<div class="example">
	<h3>NDK Connection Status</h3>
	<div class="status">
		<span>{status}</span>
	</div>
	{#if relayCount > 0}
		<p>Connected to {relayCount} relays</p>
	{/if}
</div>`}
				title="Basic NDK Setup"
			/>
		</section>

		<section>
			<h2>Try It Yourself</h2>
			<p>Create your project and verify NDK is installed correctly by checking your package.json:</p>

			<CodeBlock
				code={`{
  "dependencies": {
    "@nostr-dev-kit/ndk": "^2.14.0",
    "@nostr-dev-kit/ndk-svelte5": "^0.1.0"
  }
}`}
				language="json"
				title="package.json"
			/>
		</section>

		<section>
			<h2>What's Next?</h2>
			<p>Now that NDK is installed and set up, you're ready to connect to Nostr relays.</p>
			<div class="next-lesson">
				<a href="/learn/1/connect" class="btn-primary">
					Next: Connecting to Nostr →
				</a>
			</div>
		</section>
	</article>

	<nav class="lesson-nav">
		<a href="/learn" class="btn-secondary">← Back to Learn</a>
		<a href="/learn/1/connect" class="btn-primary">Next Lesson →</a>
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
