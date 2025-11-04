<script lang="ts">
	import Demo from '$site-components/Demo.svelte';
	import CodeBlock from '$site-components/CodeBlock.svelte';
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';

	// Import demo
	import ZappedFeed from './examples/zapped-feed.svelte';
	import ZappedFeedRaw from './examples/zapped-feed.svelte?raw';

	const ndk = getContext<NDKSvelte>('ndk');
</script>

<div class="docs-page">
	<header class="docs-header">
		<h1>Meta Subscriptions</h1>
		<p class="subtitle">
			Reactive meta-subscriptions that automatically track relationships between events
		</p>
	</header>

	<section>
		<h2>What is $metaSubscribe?</h2>
		<p>
			While <code>$subscribe</code> returns events that match your filters, <code>$metaSubscribe</code>
			returns the events they <strong>point to</strong> via e-tags and a-tags. This is perfect for
			showing content that has been interacted with — reposted articles, commented posts, zapped
			events, and more.
		</p>
	</section>

	<section>
		<h2>How It Works</h2>
		<p>
			Instead of manually subscribing to interactions and then fetching the content they reference,
			<code>$metaSubscribe</code> does it all in one reactive call:
		</p>

		<ul>
			<li>Subscribes to interaction events (reposts, comments, zaps)</li>
			<li>Extracts the e-tags and a-tags from those events</li>
			<li>Fetches the referenced content in batched queries</li>
			<li>Provides sorting options (by time, engagement count, or recency)</li>
			<li>Updates reactively as new interactions arrive</li>
		</ul>
	</section>

	<section>
		<h2>Live Demo: Reposted by Your Follows</h2>
		<p>
			This example shows content that has been reposted by people you follow. Notice how minimal
			the code is — just one reactive call that handles subscriptions, fetching, and updates. Use
			the sort buttons to see how the feed instantly reorganizes:
		</p>

		<Demo
			title="Reposted Content Feed"
			description="Real-time feed of content reposted by your follows. Try the sort options to see the feed reorganize instantly. The feed automatically updates as new reposts arrive."
			code={ZappedFeedRaw}
		>
			<div class="max-w-3xl w-full">
				<ZappedFeed {ndk} />
			</div>
		</Demo>

		<div class="callout-box">
			<p class="callout-title">Why This is Powerful</p>
			<p>
				The code you see is the <em>entire implementation</em>. No manual event fetching, no
				complex state management, no duplicate subscriptions. Just one reactive call that tracks
				reposts from your follows and automatically fetches the reposted content. The sort options
				update instantly without restarting the subscription.
			</p>
		</div>
	</section>

	<section>
		<h2>Basic Usage</h2>

		<CodeBlock
			lang="typescript"
			code={`const feed = ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [6, 16], authors: ndk.$follows }],
  sort: 'tag-time'
}));

// Access the events that were reposted
feed.events  // Array of events that were reposted

// See who reposted each event
const reposts = feed.eventsTagging(event);  // Array of kind 6/16 repost events`}
		/>
	</section>

	<section>
		<h2>Sort Options</h2>
		<p>Control how the pointed-to events are ordered:</p>

		<div class="sort-options">
			<div class="sort-card">
				<h4>time</h4>
				<p>Sort by event creation time (newest first)</p>
				<CodeBlock
					lang="typescript"
					code={`ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [6, 16], authors: follows }],
  sort: 'time'
}))`}
				/>
			</div>

			<div class="sort-card">
				<h4>count</h4>
				<p>Sort by number of interactions (most engaged first)</p>
				<CodeBlock
					lang="typescript"
					code={`ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [1111], authors: follows }],
  sort: 'count'  // Most commented articles first
}))`}
				/>
			</div>

			<div class="sort-card">
				<h4>tag-time</h4>
				<p>Sort by most recently interacted (newest interaction first)</p>
				<CodeBlock
					lang="typescript"
					code={`ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [9735], authors: follows }],
  sort: 'tag-time'  // Most recently zapped first
}))`}
				/>
			</div>

			<div class="sort-card">
				<h4>unique-authors</h4>
				<p>Sort by author diversity (most diverse engagement first)</p>
				<CodeBlock
					lang="typescript"
					code={`ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [7], authors: follows }],
  sort: 'unique-authors'  // Most unique reactors first
}))`}
				/>
			</div>
		</div>
	</section>

	<section>
		<h2>Common Use Cases</h2>

		<div class="use-cases">
			<div class="use-case">
				<h4>Reposted Content Feed</h4>
				<CodeBlock
					lang="typescript"
					code={`// Show content reposted by people you follow
const reposts = ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [6, 16], authors: ndk.$follows }],
  sort: 'tag-time'
}));

{#each reposts.events as event (event.name || event)}
  {@const reposters = reposts.eventsTagging(event)}
  <EventCard {event}>
    <span>Reposted by {reposters.length} people</span>
  </EventCard>
{/each}`}
				/>
			</div>

			<div class="use-case">
				<h4>Commented Articles</h4>
				<CodeBlock
					lang="typescript"
					code={`// Show articles commented on by your follows
const articles = ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [1111], "#K": ["30023"], authors: ndk.$follows }],
  sort: 'count'
}));

{#each articles.events as article (article.id)}
  {@const comments = articles.eventsTagging(article)}
  <ArticleCard {article}>
    <span>{comments.length} comments</span>
  </ArticleCard>
{/each}`}
				/>
			</div>

			<div class="use-case">
				<h4>Popular Reactions</h4>
				<CodeBlock
					lang="typescript"
					code={`// Show most reacted-to posts from your network
const popular = ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [7], authors: ndk.$follows }],
  sort: 'count'
}));

{#each popular.events as event (event.name || event)}
  {@const reactions = popular.eventsTagging(event)}
  <EventCard {event}>
    <span>{reactions.length} reactions</span>
  </EventCard>
{/each}`}
				/>
			</div>
		</div>
	</section>

	<section>
		<h2>API Reference</h2>

		<h3>Configuration</h3>
		<div class="api-table">
			<table>
				<thead>
					<tr>
						<th>Property</th>
						<th>Type</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><code>filters</code></td>
						<td><code>NDKFilter | NDKFilter[]</code></td>
						<td>Filters for the interaction events (reposts, zaps, comments)</td>
					</tr>
					<tr>
						<td><code>sort</code></td>
						<td><code>'time' | 'count' | 'tag-time' | 'unique-authors'</code></td>
						<td>How to sort the pointed-to events</td>
					</tr>
					<tr>
						<td><code>closeOnEose</code></td>
						<td><code>boolean</code></td>
						<td>Whether to close subscription after EOSE (default: false)</td>
					</tr>
				</tbody>
			</table>
		</div>

		<h3>Reactive Properties</h3>
		<div class="api-table">
			<table>
				<thead>
					<tr>
						<th>Property</th>
						<th>Type</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><code>events</code></td>
						<td><code>NDKEvent[]</code></td>
						<td>Array of pointed-to events (sorted according to config)</td>
					</tr>
					<tr>
						<td><code>count</code></td>
						<td><code>number</code></td>
						<td>Number of unique pointed-to events</td>
					</tr>
					<tr>
						<td><code>eosed</code></td>
						<td><code>boolean</code></td>
						<td>Whether the subscription has reached EOSE</td>
					</tr>
					<tr>
						<td><code>pointedBy</code></td>
						<td><code>Map&lt;string, NDKEvent[]&gt;</code></td>
						<td>Map of event tagId to interaction events</td>
					</tr>
				</tbody>
			</table>
		</div>

		<h3>Methods</h3>
		<div class="api-table">
			<table>
				<thead>
					<tr>
						<th>Method</th>
						<th>Returns</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><code>eventsTagging(event)</code></td>
						<td><code>NDKEvent[]</code></td>
						<td>Get all interaction events pointing to a specific event</td>
					</tr>
					<tr>
						<td><code>start()</code></td>
						<td><code>void</code></td>
						<td>Start the subscription (automatically called)</td>
					</tr>
					<tr>
						<td><code>stop()</code></td>
						<td><code>void</code></td>
						<td>Stop the subscription</td>
					</tr>
					<tr>
						<td><code>clear()</code></td>
						<td><code>void</code></td>
						<td>Clear all cached events</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="next-section">
		<h2>Next Steps</h2>
		<div class="next-grid">
			<a href="/docs/builders" class="next-card">
				<h3>Builders</h3>
				<p>Learn about reactive state factories</p>
			</a>
			<a href="/docs/components" class="next-card">
				<h3>Components</h3>
				<p>Explore ready-to-use UI Primitives</p>
			</a>
		</div>
	</section>
</div>

<style>
	/* Page-specific styles */
	h4 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--foreground);
	}

	.callout-box {
		background: linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.03));
		border: 1px solid hsl(var(--primary) / 0.2);
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin: 2rem 0;
	}

	.callout-title {
		font-weight: 600;
		font-size: 1rem;
		color: var(--foreground);
		margin: 0 0 0.75rem 0;
	}

	.callout-box p:last-child {
		margin: 0;
	}

	.sort-options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
		margin: 1.5rem 0;
	}

	.sort-card {
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		padding: 1rem;
		background: var(--card);
	}

	.sort-card h4 {
		color: var(--primary);
		font-family: 'SF Mono', Monaco, monospace;
	}

	.sort-card p {
		font-size: 0.875rem;
		margin-bottom: 0.75rem;
	}

	.use-cases {
		display: grid;
		gap: 1.5rem;
		margin: 1.5rem 0;
	}

	.use-case {
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		padding: 1.5rem;
		background: var(--card);
	}

	.use-case h4 {
		margin-bottom: 1rem;
	}

	.api-table {
		overflow-x: auto;
		margin: 1rem 0;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	th {
		text-align: left;
		padding: 0.75rem;
		background: var(--muted);
		font-weight: 600;
		color: var(--foreground);
		border-bottom: 1px solid var(--border);
	}

	td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--border);
		color: var(--muted-foreground);
	}

	td code {
		white-space: nowrap;
	}

	.next-section {
		border-top: 1px solid var(--border);
		padding-top: 3rem;
	}

	.next-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.next-card {
		padding: 1.5rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		text-decoration: none;
		transition: border-color 0.2s;
	}

	.next-card:hover {
		border-color: var(--primary);
	}

	.next-card h3 {
		margin: 0 0 0.5rem 0;
		color: var(--primary);
		font-size: 1.125rem;
	}

	.next-card p {
		margin: 0;
		font-size: 0.9375rem;
	}
</style>
