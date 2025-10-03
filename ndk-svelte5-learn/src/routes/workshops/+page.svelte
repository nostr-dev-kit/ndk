<script lang="ts">
	import { WORKSHOPS, type Workshop } from '$lib/data/workshop-structure';

	let selectedDifficulty = $state<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

	const filteredWorkshops = $derived(
		selectedDifficulty === 'all'
			? WORKSHOPS
			: WORKSHOPS.filter(w => w.difficulty === selectedDifficulty)
	);

	const difficulties = ['all', 'beginner', 'intermediate', 'advanced'] as const;

	const difficultyColors = {
		beginner: '#10b981',
		intermediate: '#f59e0b',
		advanced: '#ef4444'
	};
</script>

<div class="workshops">
	<div class="header">
		<h1>Workshops</h1>
		<p class="subtitle">
			Build complete features step-by-step. Each workshop guides you through implementing a
			real-world feature with best practices.
		</p>
	</div>

	<div class="filters">
		{#each difficulties as difficulty}
			<button
				class="filter-btn"
				class:active={selectedDifficulty === difficulty}
				onclick={() => (selectedDifficulty = difficulty)}
			>
				{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
			</button>
		{/each}
	</div>

	<div class="workshop-grid">
		{#each filteredWorkshops as workshop}
			<a href="/workshops/{workshop.id}" class="workshop-card">
				<div class="workshop-header">
					<h2>{workshop.title}</h2>
					<span
						class="difficulty-badge"
						style="background: {difficultyColors[workshop.difficulty]}"
					>
						{workshop.difficulty}
					</span>
				</div>

				<p class="workshop-description">{workshop.description}</p>

				<div class="workshop-meta">
					<span class="time">⏱ {workshop.estimatedTime}</span>
					<div class="tags">
						{#each workshop.tags.slice(0, 3) as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				</div>

				<div class="features">
					<h3>You'll build:</h3>
					<ul>
						{#each workshop.features.slice(0, 3) as feature}
							<li>{feature}</li>
						{/each}
						{#if workshop.features.length > 3}
							<li class="more">+{workshop.features.length - 3} more features</li>
						{/if}
					</ul>
				</div>

				<div class="cta">
					Start Workshop →
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.workshops {
		max-width: 1200px;
		margin: 0 auto;
	}

	.header {
		margin-bottom: 2rem;
	}

	.header h1 {
		margin: 0 0 1rem 0;
		font-size: 2.5rem;
	}

	.subtitle {
		color: #a0a0a0;
		font-size: 1.125rem;
		margin: 0;
	}

	.filters {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.filter-btn {
		padding: 0.5rem 1.25rem;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 999px;
		color: #a0a0a0;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.9375rem;
	}

	.filter-btn:hover {
		border-color: #8b5cf6;
		color: #fff;
	}

	.filter-btn.active {
		background: #8b5cf6;
		border-color: #8b5cf6;
		color: #fff;
	}

	.workshop-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
		gap: 2rem;
	}

	.workshop-card {
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 12px;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		transition: all 0.3s;
	}

	.workshop-card:hover {
		border-color: #8b5cf6;
		transform: translateY(-4px);
		text-decoration: none;
		box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
	}

	.workshop-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 1rem;
	}

	.workshop-header h2 {
		margin: 0;
		color: #fff;
		font-size: 1.5rem;
		flex: 1;
	}

	.difficulty-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
		white-space: nowrap;
	}

	.workshop-description {
		color: #a0a0a0;
		margin: 0;
		line-height: 1.6;
	}

	.workshop-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 0.75rem;
		border-top: 1px solid #333;
	}

	.time {
		color: #666;
		font-size: 0.875rem;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.tag {
		background: #2a2a2a;
		padding: 0.25rem 0.625rem;
		border-radius: 4px;
		font-size: 0.75rem;
		color: #a0a0a0;
	}

	.features {
		flex: 1;
	}

	.features h3 {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		color: #a0a0a0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.features ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.features li {
		padding: 0.375rem 0;
		color: #d0d0d0;
		font-size: 0.9375rem;
		display: flex;
		align-items: start;
	}

	.features li::before {
		content: '✓';
		color: #8b5cf6;
		font-weight: bold;
		margin-right: 0.5rem;
		flex-shrink: 0;
	}

	.features li.more {
		color: #666;
		font-style: italic;
	}

	.cta {
		color: #8b5cf6;
		font-weight: 500;
		padding-top: 0.75rem;
		border-top: 1px solid #333;
	}
</style>
