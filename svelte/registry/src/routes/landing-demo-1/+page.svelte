<script lang="ts">
	import { onMount } from 'svelte';
	import { NDKEvent } from '@nostr-dev-kit/ndk';
	import { ndk } from '$lib/ndk.svelte.js';
	import UserCard from '$lib/registry/components/user-card/user-card-compact.svelte';
	import EventCardClassic from '$lib/registry/components/event-card/event-card-classic.svelte';
	import ArticleCardMedium from '$lib/registry/components/article-card/article-card-medium.svelte';
	import ThreadViewTwitter from '$lib/registry/blocks/thread-view-twitter.svelte';
	import { ReactionButton } from '$lib/registry/components';
	import ZapButton from '$lib/registry/components/zap-button/zap-button.svelte';
	import RepostButton from '$lib/registry/components/actions/repost-button.svelte';

	// Sample data for components - will be initialized in onMount
	let sampleEvent: NDKEvent | null = null;
	let sampleUser: any = null;

	// Component positions for constellation
	interface ComponentNode {
		id: string;
		component: string;
		x: number;
		y: number;
		scale: number;
		rotation: number;
		opacity: number;
	}

	let componentNodes: ComponentNode[] = [
		{ id: 'ndk', component: 'NDK', x: 50, y: 50, scale: 1.2, rotation: 0, opacity: 1 },
		{ id: 'user', component: 'UserCard', x: 20, y: 20, scale: 0.9, rotation: -5, opacity: 0.9 },
		{ id: 'event', component: 'EventCard', x: 30, y: 70, scale: 1, rotation: 3, opacity: 0.95 },
		{ id: 'article', component: 'ArticleCard', x: 70, y: 75, scale: 0.85, rotation: -3, opacity: 0.9 },
		{ id: 'thread', component: 'Thread', x: 75, y: 25, scale: 0.95, rotation: 2, opacity: 0.92 },
		{ id: 'zap', component: 'Zap', x: 15, y: 55, scale: 0.8, rotation: -8, opacity: 0.88 },
		{ id: 'reply', component: 'Reply', x: 80, y: 50, scale: 0.75, rotation: 5, opacity: 0.85 },
	];

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let animationFrame: number;
	let particles: Array<{
		x: number;
		y: number;
		vx: number;
		vy: number;
		opacity: number;
		size: number;
	}> = [];

	// Mouse position for interactive effects
	let mouseX = 0;
	let mouseY = 0;

	function handleMouseMove(event: MouseEvent) {
		const rect = event.currentTarget.getBoundingClientRect();
		mouseX = event.clientX - rect.left;
		mouseY = event.clientY - rect.top;
	}

	function initParticles() {
		particles = [];
		for (let i = 0; i < 50; i++) {
			particles.push({
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
				vx: (Math.random() - 0.5) * 0.5,
				vy: (Math.random() - 0.5) * 0.5,
				opacity: Math.random() * 0.5 + 0.2,
				size: Math.random() * 2 + 1,
			});
		}
	}

	function drawConnections() {
		if (!ctx || !canvas) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw connections between nodes
		const connections = [
			['ndk', 'user'],
			['ndk', 'event'],
			['ndk', 'article'],
			['ndk', 'thread'],
			['event', 'zap'],
			['event', 'reply'],
			['thread', 'reply'],
			['user', 'event'],
			['article', 'thread'],
		];

		connections.forEach(([from, to]) => {
			const fromNode = componentNodes.find(n => n.id === from);
			const toNode = componentNodes.find(n => n.id === to);
			if (fromNode && toNode) {
				const fromX = (fromNode.x / 100) * canvas.width;
				const fromY = (fromNode.y / 100) * canvas.height;
				const toX = (toNode.x / 100) * canvas.width;
				const toY = (toNode.y / 100) * canvas.height;

				// Calculate distance to mouse for interactive effect
				const midX = (fromX + toX) / 2;
				const midY = (fromY + toY) / 2;
				const distToMouse = Math.sqrt((midX - mouseX) ** 2 + (midY - mouseY) ** 2);
				const maxDist = 300;
				const intensity = Math.max(0, 1 - distToMouse / maxDist);

				ctx.beginPath();
				ctx.moveTo(fromX, fromY);

				// Create curved path
				const cpX = midX + Math.sin(Date.now() * 0.001) * 20;
				const cpY = midY + Math.cos(Date.now() * 0.001) * 20;
				ctx.quadraticCurveTo(cpX, cpY, toX, toY);

				// Dynamic styling based on mouse proximity
				const gradient = ctx.createLinearGradient(fromX, fromY, toX, toY);
				gradient.addColorStop(0, `rgba(139, 92, 246, ${0.1 + intensity * 0.4})`);
				gradient.addColorStop(0.5, `rgba(147, 51, 234, ${0.2 + intensity * 0.5})`);
				gradient.addColorStop(1, `rgba(139, 92, 246, ${0.1 + intensity * 0.4})`);

				ctx.strokeStyle = gradient;
				ctx.lineWidth = 1 + intensity * 2;
				ctx.stroke();

				// Draw energy pulses along connections when mouse is near
				if (intensity > 0.3) {
					const t = (Date.now() % 2000) / 2000;
					const pulseX = fromX + (toX - fromX) * t;
					const pulseY = fromY + (toY - fromY) * t;

					ctx.beginPath();
					ctx.arc(pulseX, pulseY, 2 + intensity * 3, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(147, 51, 234, ${intensity * 0.8 * (1 - Math.abs(t - 0.5) * 2)})`;
					ctx.fill();
				}
			}
		});

		// Draw particles
		particles.forEach(particle => {
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
			ctx.fill();

			// Update particle position
			particle.x += particle.vx;
			particle.y += particle.vy;

			// Wrap around screen
			if (particle.x < 0) particle.x = canvas.width;
			if (particle.x > canvas.width) particle.x = 0;
			if (particle.y < 0) particle.y = canvas.height;
			if (particle.y > canvas.height) particle.y = 0;

			// Gentle fade effect
			particle.opacity += (Math.random() - 0.5) * 0.01;
			particle.opacity = Math.max(0.1, Math.min(0.6, particle.opacity));
		});

		animationFrame = requestAnimationFrame(drawConnections);
	}

	function handleResize() {
		if (canvas) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
	}

	onMount(() => {
		// Initialize sample data
		if (ndk) {
			sampleEvent = new NDKEvent(ndk);
			sampleEvent.content = "Building the future of social media with Nostr 🚀";
			sampleEvent.created_at = Math.floor(Date.now() / 1000);
			sampleEvent.kind = 1;
			sampleEvent.pubkey = "7f5c2c6b6e4d3a2f9b8e1d0c5a4b3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a";

			sampleUser = ndk.getUser({ pubkey: sampleEvent.pubkey });
		}

		if (canvas) {
			ctx = canvas.getContext('2d');
			handleResize();
			initParticles();
			drawConnections();
		}

		window.addEventListener('resize', handleResize);

		// Floating animation for components
		componentNodes.forEach((node, index) => {
			const delay = index * 0.2;
			const element = document.querySelector(`[data-node-id="${node.id}"]`);
			if (element) {
				element.style.animationDelay = `${delay}s`;
			}
		});

		return () => {
			window.removeEventListener('resize', handleResize);
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});
</script>

<svelte:window on:mousemove={handleMouseMove} />

<div class="relative min-h-screen overflow-hidden bg-black">
	<!-- Canvas for connections and particles -->
	<canvas
		bind:this={canvas}
		class="absolute inset-0 z-0"
	></canvas>

	<!-- Gradient overlays -->
	<div class="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-black/50 to-black z-10"></div>
	<div class="absolute inset-0 bg-gradient-radial from-purple-900/10 via-transparent to-transparent z-10"></div>

	<!-- Hero Content -->
	<div class="relative z-20 flex min-h-screen flex-col items-center justify-center px-6 text-center">
		<!-- Beta Badge -->
		<div class="mb-8 flex items-center gap-2">
			<div class="inline-flex items-center rounded-full border border-purple-800 bg-purple-950/50 px-3 py-1 text-xs font-medium text-purple-300">
				<span class="mr-2 h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
				NDK v4 Beta Available
			</div>
		</div>

		<!-- Main Title -->
		<h1 class="mb-4 text-6xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
			<span class="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
				The Reactive Nostr
			</span>
			<br />
			<span class="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
				Components for Svelte 5
			</span>
		</h1>

		<!-- Subtitle -->
		<p class="mb-10 max-w-2xl text-lg text-gray-400 sm:text-xl">
			Build blazing-fast Nostr apps with composable primitives that handle real-time events, profiles, and social graphs
		</p>

		<!-- CTAs -->
		<div class="flex gap-4">
			<button class="px-6 py-3 text-base font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
				Start Building
			</button>
			<button class="px-6 py-3 text-base font-medium text-purple-300 bg-transparent border border-purple-800 rounded-lg hover:bg-purple-950/50 transition-colors">
				View Components
			</button>
		</div>
	</div>

	<!-- Floating Components Constellation -->
	<div class="absolute inset-0 z-15 pointer-events-none">
		{#each componentNodes as node (node.id)}
			<div
				data-node-id={node.id}
				class="absolute transition-all duration-1000 ease-out hover:scale-110 pointer-events-auto floating-component"
				style="
					left: {node.x}%;
					top: {node.y}%;
					transform: translate(-50%, -50%) scale({node.scale}) rotate({node.rotation}deg);
					opacity: {node.opacity};
				"
			>
				<!-- Different component based on node type -->
				{#if node.component === 'NDK'}
					<div class="glass-card rounded-xl bg-purple-950/30 backdrop-blur-xl border border-purple-800/30 p-6">
						<div class="text-3xl font-bold text-purple-400 mb-2">NDK</div>
						<div class="text-xs text-purple-300">Core</div>
					</div>
				{:else if node.component === 'UserCard'}
					{#if sampleUser}
						<div class="glass-card rounded-xl bg-gray-950/30 backdrop-blur-xl border border-gray-800/30 p-4 w-48">
							<UserCard user={sampleUser} />
						</div>
					{:else}
						<div class="glass-card rounded-xl bg-gray-950/30 backdrop-blur-xl border border-gray-800/30 p-4 w-48">
							<div class="text-sm text-gray-300 font-semibold mb-1">User Card</div>
							<div class="text-xs text-gray-500">Profile display component</div>
						</div>
					{/if}
				{:else if node.component === 'EventCard'}
					{#if sampleEvent}
						<div class="glass-card rounded-xl bg-gray-950/30 backdrop-blur-xl border border-gray-800/30 p-4 w-64">
							<EventCardClassic event={sampleEvent} />
						</div>
					{:else}
						<div class="glass-card rounded-xl bg-gray-950/30 backdrop-blur-xl border border-gray-800/30 p-4 w-64">
							<div class="text-sm text-gray-300 font-semibold mb-1">Event Card</div>
							<div class="text-xs text-gray-500">Display notes & social content</div>
						</div>
					{/if}
				{:else if node.component === 'ArticleCard'}
					<div class="glass-card rounded-xl bg-gray-950/30 backdrop-blur-xl border border-gray-800/30 p-4 w-56">
						<div class="text-sm text-gray-300 font-semibold mb-1">Article</div>
						<div class="text-xs text-gray-500">Long-form content with rich media support</div>
					</div>
				{:else if node.component === 'Thread'}
					<div class="glass-card rounded-xl bg-gray-950/30 backdrop-blur-xl border border-gray-800/30 p-4 w-48">
						<div class="text-sm text-gray-300 font-semibold mb-1">Thread View</div>
						<div class="text-xs text-gray-500">Nested conversations</div>
					</div>
				{:else if node.component === 'Zap'}
					<div class="glass-card rounded-xl bg-yellow-950/30 backdrop-blur-xl border border-yellow-800/30 p-3">
						{#if sampleEvent}
							<ZapButton {ndk} event={sampleEvent} />
						{:else}
							<div class="text-sm text-yellow-400">⚡ Zap</div>
						{/if}
					</div>
				{:else if node.component === 'Reply'}
					<div class="glass-card rounded-xl bg-blue-950/30 backdrop-blur-xl border border-blue-800/30 p-3">
						{#if sampleEvent}
							<RepostButton event={sampleEvent} />
						{:else}
							<div class="text-sm text-blue-400">🔁 Repost</div>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	:global(body) {
		background: black;
	}

	.bg-gradient-radial {
		background: radial-gradient(circle at 50% 50%, var(--tw-gradient-from), var(--tw-gradient-to));
	}

	.glass-card {
		box-shadow:
			0 0 40px rgba(139, 92, 246, 0.1),
			inset 0 0 20px rgba(139, 92, 246, 0.05);
		transition: all 0.3s ease;
	}

	.glass-card:hover {
		box-shadow:
			0 0 60px rgba(139, 92, 246, 0.2),
			inset 0 0 30px rgba(139, 92, 246, 0.1);
		transform: translateY(-2px);
	}

	@keyframes float {
		0%, 100% {
			transform: translate(-50%, -50%) translateY(0) scale(var(--scale, 1)) rotate(var(--rotation, 0deg));
		}
		50% {
			transform: translate(-50%, -50%) translateY(-10px) scale(var(--scale, 1)) rotate(var(--rotation, 0deg));
		}
	}

	.floating-component {
		animation: float 6s ease-in-out infinite;
		--scale: 1;
		--rotation: 0deg;
	}

	.floating-component:nth-child(odd) {
		animation-duration: 7s;
	}

	.floating-component:nth-child(even) {
		animation-duration: 5s;
	}

	/* Hide some internal component styles that don't fit the aesthetic */
	:global(.floating-component .text-muted-foreground) {
		color: rgba(156, 163, 175, 0.8) !important;
	}

	:global(.floating-component .border) {
		border-color: rgba(75, 85, 99, 0.3) !important;
	}
</style>