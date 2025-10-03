<script lang="ts">
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const sections = [
		{ path: '/learn', label: 'Learn', description: 'Progressive tutorials from basics to advanced' },
		{ path: '/workshops', label: 'Workshops', description: 'Build complete features step-by-step' },
		{ path: '/cookbooks', label: 'Cookbooks', description: 'Copy-paste recipes for common tasks' }
	];
</script>

<div class="app">
	<header>
		<nav>
			<a href="/" class="logo">
				<h1>NDK Svelte 5 Learn</h1>
			</a>
			<div class="nav-sections">
				{#each sections as section}
					<a
						href={section.path}
						class:active={$page.url.pathname.startsWith(section.path)}
					>
						{section.label}
					</a>
				{/each}
			</div>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer>
		<p>Part of the <a href="https://github.com/nostr-dev-kit/ndk" target="_blank">NDK</a> project</p>
	</footer>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: #0a0a0a;
		color: #e0e0e0;
	}

	:global(a) {
		color: #8b5cf6;
		text-decoration: none;
	}

	:global(a:hover) {
		text-decoration: underline;
	}

	:global(code) {
		background: #1a1a1a;
		padding: 0.2em 0.4em;
		border-radius: 3px;
		font-family: 'Fira Code', monospace;
		font-size: 0.9em;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	header {
		background: #1a1a1a;
		border-bottom: 1px solid #333;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	nav {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		gap: 3rem;
	}

	.logo h1 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #fff;
	}

	.logo:hover {
		text-decoration: none;
	}

	.nav-sections {
		display: flex;
		gap: 2rem;
		flex: 1;
	}

	.nav-sections a {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		transition: all 0.2s;
		color: #a0a0a0;
	}

	.nav-sections a:hover {
		background: #2a2a2a;
		color: #fff;
		text-decoration: none;
	}

	.nav-sections a.active {
		background: #8b5cf6;
		color: #fff;
	}

	main {
		flex: 1;
		max-width: 1400px;
		width: 100%;
		margin: 0 auto;
		padding: 2rem;
	}

	footer {
		background: #1a1a1a;
		border-top: 1px solid #333;
		padding: 2rem;
		text-align: center;
		color: #666;
	}
</style>
