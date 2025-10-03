<script lang="ts">
	const sections = [
		{
			title: 'Learn',
			href: '/learn',
			icon: '📚',
			description: 'Progressive tutorials from beginner to advanced',
			features: [
				'Start with basic NDK setup',
				'Build complexity step-by-step',
				'Live code examples',
				'Interactive challenges'
			]
		},
		{
			title: 'Workshops',
			href: '/workshops',
			icon: '🛠️',
			description: 'Build complete features from scratch',
			features: [
				'Full-featured implementations',
				'Best practices included',
				'Real-world patterns',
				'Production-ready code'
			]
		},
		{
			title: 'Cookbooks',
			href: '/cookbooks',
			icon: '📖',
			description: 'Copy-paste recipes for common tasks',
			features: [
				'Hundreds of recipes',
				'Organized by category',
				'Quick solutions',
				'Copy-paste ready'
			]
		}
	];
</script>

<div class="home">
	<div class="hero">
		<h1>Learn NDK Svelte 5</h1>
		<p class="tagline">
			Master Nostr development with Svelte 5 through interactive tutorials, workshops, and recipes
		</p>
	</div>

	<div class="sections">
		{#each sections as section}
			<a href={section.href} class="section-card">
				<div class="section-icon">{section.icon}</div>
				<h2>{section.title}</h2>
				<p class="section-description">{section.description}</p>
				<ul class="section-features">
					{#each section.features as feature}
						<li>{feature}</li>
					{/each}
				</ul>
				<div class="section-cta">
					Explore {section.title} →
				</div>
			</a>
		{/each}
	</div>

	<div class="quick-start">
		<h2>Quick Start</h2>
		<div class="code-block">
			<pre><code>npm install @nostr-dev-kit/ndk @nostr-dev-kit/ndk-svelte5</code></pre>
		</div>
		<p>Then dive into <a href="/learn">Learn</a> to get started!</p>
	</div>
</div>

<style>
	.home {
		max-width: 1200px;
		margin: 0 auto;
	}

	.hero {
		text-align: center;
		padding: 4rem 2rem;
	}

	.hero h1 {
		font-size: 3.5rem;
		margin: 0 0 1rem 0;
		background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.tagline {
		font-size: 1.25rem;
		color: #a0a0a0;
		max-width: 600px;
		margin: 0 auto;
	}

	.sections {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 2rem;
		margin: 3rem 0;
	}

	.section-card {
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 12px;
		padding: 2rem;
		transition: all 0.3s;
		display: flex;
		flex-direction: column;
	}

	.section-card:hover {
		border-color: #8b5cf6;
		transform: translateY(-4px);
		text-decoration: none;
		box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
	}

	.section-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.section-card h2 {
		margin: 0 0 0.5rem 0;
		color: #fff;
	}

	.section-description {
		color: #a0a0a0;
		margin: 0 0 1.5rem 0;
	}

	.section-features {
		list-style: none;
		padding: 0;
		margin: 0 0 1.5rem 0;
		flex: 1;
	}

	.section-features li {
		padding: 0.5rem 0;
		color: #d0d0d0;
		display: flex;
		align-items: center;
	}

	.section-features li::before {
		content: '✓';
		color: #8b5cf6;
		font-weight: bold;
		margin-right: 0.75rem;
	}

	.section-cta {
		color: #8b5cf6;
		font-weight: 500;
	}

	.quick-start {
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 12px;
		padding: 2rem;
		margin: 3rem 0;
		text-align: center;
	}

	.quick-start h2 {
		margin: 0 0 1.5rem 0;
	}

	.code-block {
		background: #0a0a0a;
		border: 1px solid #333;
		border-radius: 8px;
		padding: 1.5rem;
		margin: 1.5rem 0;
	}

	.code-block pre {
		margin: 0;
		overflow-x: auto;
	}

	.code-block code {
		color: #e0e0e0;
		background: transparent;
		padding: 0;
	}
</style>
