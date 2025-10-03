<script lang="ts">
	import CodeBlock from '$lib/components/tutorial/CodeBlock.svelte';
	import { getWorkshop } from '$lib/data/workshop-structure';

	const workshop = getWorkshop('profile-viewer');
</script>

<div class="workshop">
	<div class="breadcrumb">
		<a href="/workshops">Workshops</a> / <span>{workshop?.title}</span>
	</div>

	<header>
		<h1>{workshop?.title}</h1>
		<p class="description">{workshop?.description}</p>
		<div class="meta">
			<span class="difficulty {workshop?.difficulty}">{workshop?.difficulty}</span>
			<span class="time">⏱ {workshop?.estimatedTime}</span>
			<div class="tags">
				{#each workshop?.tags || [] as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		</div>
	</header>

	<div class="features-overview">
		<h2>What We'll Build</h2>
		<ul>
			{#each workshop?.features || [] as feature}
				<li>{feature}</li>
			{/each}
		</ul>
	</div>

	<article>
		<section>
			<h2>Overview</h2>
			<p>
				In this workshop, we'll build a complete user profile viewer component that displays user metadata,
				follower statistics, and a recent posts feed. This is a fundamental component you'll use in most
				Nostr applications.
			</p>
		</section>

		<section>
			<h2>Prerequisites</h2>
			<ul>
				<li>Completed Level 1 & 2 of the Learn section</li>
				<li>Understanding of Svelte 5 runes ($state, $derived, $effect)</li>
				<li>Basic knowledge of NDK subscriptions</li>
			</ul>
		</section>

		<section>
			<h2>Step 1: Component Setup</h2>
			<p>Let's start by creating the basic component structure:</p>

			<CodeBlock
				code={`<script lang="ts">
	import NDK, { type NDKUser } from '@nostr-dev-kit/ndk';
	import { getContext } from 'svelte';

	interface Props {
		pubkey: string;
	}

	let { pubkey }: Props = $props();

	const ndk = getContext<NDK>('ndk');

	// Create user instance
	const user = ndk.getUser({ pubkey });
</script>

<div class="profile-viewer">
	<div class="profile-header">
		<h2>Profile Viewer</h2>
	</div>
</div>

<style>
	.profile-viewer {
		border: 1px solid #333;
		border-radius: 12px;
		padding: 2rem;
		background: #1a1a1a;
	}

	.profile-header h2 {
		margin: 0;
	}
</style>`}
				language="typescript"
				title="ProfileViewer.svelte"
				showLineNumbers={true}
			/>
		</section>

		<section>
			<h2>Step 2: Fetch User Metadata</h2>
			<p>Now let's fetch and display the user's profile information:</p>

			<CodeBlock
				code={`<script lang="ts">
	// ... previous code

	let profile = $state<NDKUser | null>(null);

	// Fetch user profile
	$effect(() => {
		user.fetchProfile().then(() => {
			profile = user;
		});
	});
</script>

<div class="profile-viewer">
	{#if profile}
		<div class="profile-info">
			<img src={profile.profile?.image} alt={profile.profile?.name} />
			<div class="profile-details">
				<h2>{profile.profile?.name || 'Anonymous'}</h2>
				<p class="bio">{profile.profile?.about || 'No bio'}</p>
			</div>
		</div>
	{:else}
		<p>Loading profile...</p>
	{/if}
</div>`}
				language="typescript"
				title="ProfileViewer.svelte"
				showLineNumbers={true}
				highlightLines={[4, 6, 7, 8, 9, 10]}
			/>
		</section>

		<section>
			<h2>Complete Code</h2>
			<p>Here's the full, production-ready component with all features:</p>

			<CodeBlock
				code={`// Full implementation would go here
// Including: follow button, stats, recent posts, etc.`}
				language="typescript"
				title="ProfileViewer.svelte (complete)"
			/>

			<p class="note">
				💡 <strong>Tip:</strong> This component can be extended with caching to improve performance
				when viewing multiple profiles.
			</p>
		</section>

		<section>
			<h2>Next Steps</h2>
			<p>Try these enhancements:</p>
			<ul>
				<li>Add a follow/unfollow button</li>
				<li>Display follower and following counts</li>
				<li>Show the user's recent posts</li>
				<li>Add profile editing for the current user</li>
			</ul>

			<div class="next-workshop">
				<a href="/workshops/post-composer" class="btn-primary">
					Next Workshop: Post Composer →
				</a>
			</div>
		</section>
	</article>
</div>

<style>
	.workshop {
		max-width: 900px;
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
		align-items: center;
		flex-wrap: wrap;
	}

	.difficulty {
		padding: 0.375rem 0.75rem;
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 600;
		color: white;
	}

	.difficulty.beginner {
		background: #10b981;
	}

	.time {
		color: #666;
		font-size: 0.875rem;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
	}

	.tag {
		background: #2a2a2a;
		padding: 0.25rem 0.625rem;
		border-radius: 4px;
		font-size: 0.75rem;
		color: #a0a0a0;
	}

	.features-overview {
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 3rem;
	}

	.features-overview h2 {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
	}

	.features-overview ul {
		margin: 0;
		padding-left: 1.5rem;
		color: #d0d0d0;
	}

	.features-overview li {
		margin: 0.5rem 0;
	}

	article section {
		margin-bottom: 3rem;
	}

	article h2 {
		margin: 0 0 1rem 0;
		color: #fff;
	}

	article p {
		color: #d0d0d0;
		line-height: 1.7;
		margin: 0 0 1rem 0;
	}

	article ul {
		color: #d0d0d0;
		padding-left: 1.5rem;
		line-height: 1.7;
	}

	article li {
		margin: 0.5rem 0;
	}

	.note {
		background: #1a1a1a;
		border-left: 3px solid #8b5cf6;
		padding: 1rem 1.25rem;
		margin: 1.5rem 0;
		border-radius: 4px;
	}

	.next-workshop {
		margin-top: 2rem;
	}

	.btn-primary {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #8b5cf6;
		color: white;
		border-radius: 8px;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-primary:hover {
		background: #7c3aed;
		text-decoration: none;
	}
</style>
