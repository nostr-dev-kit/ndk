<script lang="ts">
	import { LEARN_LEVELS } from '$lib/data/learn-structure';
</script>

<div class="learn">
	<div class="header">
		<h1>Learn NDK Svelte 5</h1>
		<p class="subtitle">
			Progress through interactive lessons from basics to advanced patterns. Each level builds on
			the previous one.
		</p>
	</div>

	<div class="levels">
		{#each LEARN_LEVELS as level}
			<div class="level-card">
				<div class="level-header">
					<div class="level-badge">Level {level.level}</div>
					<h2>{level.title}</h2>
					<p class="level-description">{level.description}</p>
				</div>

				<div class="lessons">
					{#each level.lessons as lesson}
						<a href="/learn/{level.level}/{lesson.id}" class="lesson">
							<div class="lesson-content">
								<h3>{lesson.title}</h3>
								<p>{lesson.description}</p>
							</div>
							<div class="lesson-meta">
								<span class="time">{lesson.estimatedTime}</span>
								<span class="arrow">→</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.learn {
		max-width: 900px;
		margin: 0 auto;
	}

	.header {
		margin-bottom: 3rem;
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

	.levels {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.level-card {
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 12px;
		padding: 2rem;
	}

	.level-header {
		margin-bottom: 1.5rem;
	}

	.level-badge {
		display: inline-block;
		background: #8b5cf6;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.level-header h2 {
		margin: 0 0 0.5rem 0;
		color: #fff;
	}

	.level-description {
		margin: 0;
		color: #a0a0a0;
	}

	.lessons {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.lesson {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		background: #0a0a0a;
		border: 1px solid #333;
		border-radius: 8px;
		transition: all 0.2s;
		gap: 1rem;
	}

	.lesson:hover {
		border-color: #8b5cf6;
		background: #1a1a1a;
		text-decoration: none;
		transform: translateX(4px);
	}

	.lesson-content {
		flex: 1;
	}

	.lesson-content h3 {
		margin: 0 0 0.25rem 0;
		font-size: 1.125rem;
		color: #fff;
	}

	.lesson-content p {
		margin: 0;
		color: #a0a0a0;
		font-size: 0.9375rem;
	}

	.lesson-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: #666;
	}

	.time {
		font-size: 0.875rem;
	}

	.arrow {
		font-size: 1.25rem;
		color: #8b5cf6;
	}
</style>
