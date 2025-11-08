<script lang="ts">
	import { onMount } from 'svelte';
	import { ndk } from '$lib/ndk.svelte';
	import { NDKEvent, NDKArticle } from '@nostr-dev-kit/ndk';

	// Import actual blocks
	import EventCardClassic from '$lib/registry/components/event/cards/classic/event-card-classic.svelte';
	import UserCardCompact from '$lib/registry/components/user/cards/compact/user-card-compact.svelte';
	import RelayCardCompact from '$lib/registry/components/relay/cards/compact/relay-card-compact.svelte';
	import ArticleCardHero from '$lib/registry/components/article/cards/hero/article-card-hero.svelte';
	import HighlightCardElegant from '$lib/registry/components/highlight/cards/basic/highlight-card-elegant.svelte';
	import FollowButton from '$lib/registry/components/follow/buttons/basic/follow-button.svelte';

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	// Create real demo event
	const demoEvent = new NDKEvent(ndk);
	demoEvent.kind = 1;
	demoEvent.content = 'Building with NDK Svelte is incredibly smooth! The reactive primitives just work. ⚡';
	demoEvent.created_at = Math.floor(Date.now() / 1000);
	demoEvent.pubkey = 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52'; // pablo

	// Create demo article
	const demoArticle = new NDKArticle(ndk);
	demoArticle.title = 'Building Nostr Apps with Svelte 5';
	demoArticle.summary = 'A deep dive into reactive primitives and composable components for the decentralized social web.';
	demoArticle.content = 'Full article content...';
	demoArticle.image = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop';
	demoArticle.published_at = Math.floor(Date.now() / 1000);
	demoArticle.pubkey = 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52';

	// Create demo highlight
	const demoHighlight = new NDKEvent(ndk);
	demoHighlight.kind = 9802;
	demoHighlight.content = 'Svelte 5 runes provide fine-grained reactivity that works perfectly with Nostr\'s event-driven architecture.';
	demoHighlight.created_at = Math.floor(Date.now() / 1000);
	demoHighlight.pubkey = 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52';
	demoHighlight.tags = [
		['context', 'From the Svelte 5 documentation on reactivity'],
		['r', 'https://svelte.dev/docs/svelte/$state']
	];

	// Demo user pubkey (Pablo)
	const demoPubkey = 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52';
</script>

<svelte:head>
	<style>
		body {
			margin: 0;
			padding: 0;
			background: #0a0a0a;
			color: #ffffff;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		}
	</style>
</svelte:head>

<div class="landing-page">
	<!-- Navigation -->
	<nav class="nav">
		<div class="nav-content">
			<div class="nav-left">
				<div class="logo">
					<span class="logo-icon">•</span>
					<span class="logo-text">ndk</span>
					<span class="logo-badge">svelte</span>
				</div>
				<div class="nav-links">
					<a href="/" class="nav-link">Home</a>
					<a href="/docs" class="nav-link">Docs</a>
					<a href="https://github.com/nostr-dev-kit/ndk" class="nav-link">GitHub</a>
				</div>
			</div>
			<div class="nav-right">
				<button class="theme-toggle" aria-label="Toggle theme">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="10" cy="10" r="5" fill="currentColor"></circle>
					</svg>
				</button>
				<button class="cta-button">Get started</button>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<main class="hero">
		<div class="hero-content">
			<!-- Badge -->
			<div class="badge">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M8 1L10.5 6L16 7L12 11L13 16L8 13.5L3 16L4 11L0 7L5.5 6L8 1Z" fill="currentColor"></path>
				</svg>
				<span>NDK v4 Beta Available</span>
			</div>

			<!-- Title -->
			<h1 class="title">
				The shadcn of <span class="aurora-text">Nostr</span> is here
			</h1>

			<!-- Subtitle -->
			<p class="subtitle">
				The Nostr library for developers with <span class="underline-sketch">taste</span>.
			</p>

			<!-- CTA -->
			<button class="start-button">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"></rect>
				</svg>
				Start building
			</button>
		</div>

		<!-- Component Showcase -->
		<div class="showcase" class:mounted>
			<!-- Card 1: User Card -->
			<div class="showcase-card card-1">
				<UserCardCompact {ndk} pubkey={demoPubkey} />
			</div>

			<!-- Card 2: Event Card -->
			<div class="showcase-card card-2">
				<EventCardClassic {ndk} event={demoEvent} />
			</div>

			<!-- Card 3: Relay Card -->
			<div class="showcase-card card-3">
				<RelayCardCompact {ndk} relayUrl="wss://relay.damus.io" />
			</div>

			<!-- Card 4: Highlight Card -->
			<div class="showcase-card card-4">
				<HighlightCardElegant {ndk} event={demoHighlight} />
			</div>

			<!-- Card 5: Article Card -->
			<div class="showcase-card card-5">
				<ArticleCardHero {ndk} article={demoArticle} height="h-[280px]" badgeText="Featured" />
			</div>

			<!-- Card 6: Follow Button -->
			<div class="showcase-card card-6">
				<div class="action-showcase">
					<FollowButton {ndk} target={ndk.getUser({ pubkey: demoPubkey })} />
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	.landing-page {
		min-height: 100vh;
		background: #0a0a0a;
		position: relative;
		overflow: hidden;
	}

	/* Navigation */
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: rgba(10, 10, 10, 0.8);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.nav-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.nav-left {
		display: flex;
		align-items: center;
		gap: 3rem;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
	}

	.logo-icon {
		font-size: 1.5rem;
		color: #8b5cf6;
	}

	.logo-text {
		font-size: 1rem;
	}

	.logo-badge {
		font-size: 0.75rem;
		padding: 0.125rem 0.5rem;
		background: rgba(139, 92, 246, 0.1);
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 4px;
		color: #8b5cf6;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
	}

	.nav-link {
		color: #a1a1aa;
		text-decoration: none;
		font-size: 0.875rem;
		transition: color 0.2s;
	}

	.nav-link:hover {
		color: #ffffff;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.theme-toggle {
		background: transparent;
		border: none;
		color: #a1a1aa;
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.theme-toggle:hover {
		color: #ffffff;
	}

	.cta-button {
		background: #ffffff;
		color: #0a0a0a;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.cta-button:hover {
		background: #f4f4f5;
		transform: translateY(-1px);
	}

	/* Hero Section */
	.hero {
		padding-top: 8rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.hero-content {
		text-align: center;
		z-index: 10;
		position: relative;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.875rem;
		background: rgba(139, 92, 246, 0.05);
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 20px;
		font-size: 0.8125rem;
		color: #c4b5fd;
		margin-bottom: 2rem;
		animation: float-in 0.6s ease-out;
	}

	.badge svg {
		width: 14px;
		height: 14px;
		color: #8b5cf6;
	}

	.title {
		font-size: 4.5rem;
		font-weight: 700;
		margin: 0 0 1.5rem 0;
		line-height: 1.1;
		letter-spacing: -0.02em;
		animation: float-in 0.6s ease-out 0.1s backwards;
	}

	.subtitle {
		font-size: 1.5rem;
		color: #a1a1aa;
		margin: 0 0 2.5rem 0;
		line-height: 1.6;
		animation: float-in 0.6s ease-out 0.2s backwards;
	}

	.start-button {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		background: #ffffff;
		color: #0a0a0a;
		border: none;
		padding: 0.875rem 1.5rem;
		border-radius: 8px;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		animation: float-in 0.6s ease-out 0.3s backwards;
	}

	.start-button:hover {
		background: #f4f4f5;
		transform: translateY(-2px);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
	}

	.start-button svg {
		width: 18px;
		height: 18px;
	}

	/* Component Showcase */
	.showcase {
		position: relative;
		width: 100%;
		max-width: 1200px;
		height: 600px;
		margin-top: 4rem;
		perspective: 1000px;
	}

	.showcase-card {
		position: absolute;
		opacity: 0;
		transform: translateY(30px);
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.showcase.mounted .showcase-card {
		opacity: 1;
		transform: translateY(0);
	}

	.showcase-card:hover {
		transform: translateY(-8px) scale(1.02);
		z-index: 10;
	}

	/* Card Positioning */
	.card-1 {
		left: 5%;
		top: 10%;
		transition-delay: 0.1s;
		max-width: 300px;
	}

	.card-2 {
		left: 35%;
		top: 5%;
		transition-delay: 0.2s;
		max-width: 400px;
	}

	.card-3 {
		right: 8%;
		top: 15%;
		transition-delay: 0.3s;
	}

	.card-4 {
		right: 5%;
		bottom: 15%;
		transition-delay: 0.4s;
		max-width: 350px;
	}

	.card-5 {
		left: 38%;
		bottom: 5%;
		transition-delay: 0.5s;
		max-width: 380px;
	}

	.card-6 {
		left: 8%;
		bottom: 15%;
		transition-delay: 0.6s;
	}

	.action-showcase {
		padding: 2rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		backdrop-filter: blur(12px);
	}

	/* Sketch Underline Effect */
	.underline-sketch {
		position: relative;
		display: inline-block;
		color: #ffffff;
		font-weight: 500;
	}

	.underline-sketch::after {
		content: '';
		position: absolute;
		left: -2%;
		right: -2%;
		bottom: 0.15em;
		height: 0.15em;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 10' preserveAspectRatio='none'%3E%3Cpath d='M0,7 Q5,3 10,5 T20,7 T30,5 T40,7 T50,5 T60,7 T70,5 T80,7 T90,5 T100,7 T110,5 T120,7 T130,5 T140,7 T150,5 T160,7 T170,5 T180,7 T190,5 L200,7' stroke='%238b5cf6' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-size: 100% 100%;
		opacity: 0.8;
		animation: sketch-draw 0.6s ease-out 0.5s backwards;
	}

	/* Aurora Text Effect */
	.aurora-text {
		background: linear-gradient(
			90deg,
			#8b5cf6,
			#ec4899,
			#06b6d4,
			#8b5cf6
		);
		background-size: 200% 100%;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: aurora-shift 3s ease-in-out infinite;
		position: relative;
		display: inline-block;
	}

	.aurora-text::before {
		content: attr(data-text);
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			#8b5cf6,
			#ec4899,
			#06b6d4,
			#8b5cf6
		);
		background-size: 200% 100%;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		filter: blur(10px);
		opacity: 0.5;
		animation: aurora-shift 3s ease-in-out infinite;
		z-index: -1;
	}

	/* Animations */
	@keyframes float-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes aurora-shift {
		0%, 100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	@keyframes sketch-draw {
		from {
			clip-path: inset(0 100% 0 0);
		}
		to {
			clip-path: inset(0 0 0 0);
		}
	}
</style>
