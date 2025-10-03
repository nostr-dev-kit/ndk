<script lang="ts">
	import { getCategory } from '$lib/data/cookbook-structure';

	const category = getCategory('getting-started');
</script>

<div class="category">
	<div class="breadcrumb">
		<a href="/cookbooks">Cookbooks</a> / <span>{category?.title}</span>
	</div>

	<header>
		<div class="category-icon">{category?.icon}</div>
		<h1>{category?.title}</h1>
		<p class="description">{category?.description}</p>
	</header>

	<div class="recipes">
		{#if category?.recipes.length === 0}
			<div class="empty-state">
				<h2>Coming Soon</h2>
				<p>Recipes for this category are being prepared. Check back soon!</p>
				<a href="/cookbooks" class="btn-secondary">← Back to Cookbooks</a>
			</div>
		{:else}
			{#each category?.recipes || [] as recipe}
				<a href="/cookbooks/{category.id}/{recipe.id}" class="recipe-card">
					<h3>{recipe.title}</h3>
					<p>{recipe.description}</p>
					<div class="recipe-meta">
						<span class="difficulty {recipe.difficulty}">{recipe.difficulty}</span>
						<span class="time">{recipe.estimatedTime}</span>
						{#if recipe.tags.length > 0}
							<div class="tags">
								{#each recipe.tags.slice(0, 3) as tag}
									<span class="tag">{tag}</span>
								{/each}
							</div>
						{/if}
					</div>
				</a>
			{/each}
		{/if}
	</div>
</div>

<style>
	.category {
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
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.category-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	header h1 {
		margin: 0 0 1rem 0;
		font-size: 2.5rem;
	}

	.description {
		font-size: 1.25rem;
		color: #a0a0a0;
		margin: 0;
		max-width: 600px;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 12px;
	}

	.empty-state h2 {
		margin: 0 0 1rem 0;
		color: #fff;
	}

	.empty-state p {
		color: #a0a0a0;
		margin: 0 0 2rem 0;
	}

	.recipes {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.recipe-card {
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 8px;
		padding: 1.5rem;
		transition: all 0.2s;
	}

	.recipe-card:hover {
		border-color: #8b5cf6;
		text-decoration: none;
		transform: translateX(4px);
	}

	.recipe-card h3 {
		margin: 0 0 0.5rem 0;
		color: #fff;
	}

	.recipe-card p {
		margin: 0 0 1rem 0;
		color: #a0a0a0;
	}

	.recipe-meta {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
		font-size: 0.875rem;
	}

	.difficulty {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-weight: 500;
	}

	.difficulty.beginner {
		background: #10b98133;
		color: #10b981;
	}

	.difficulty.intermediate {
		background: #f59e0b33;
		color: #f59e0b;
	}

	.difficulty.advanced {
		background: #ef444433;
		color: #ef4444;
	}

	.time {
		color: #666;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
	}

	.tag {
		background: #2a2a2a;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		color: #a0a0a0;
		font-size: 0.75rem;
	}

	.btn-secondary {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #1a1a1a;
		border: 1px solid #333;
		color: #a0a0a0;
		border-radius: 8px;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		border-color: #8b5cf6;
		color: #fff;
		text-decoration: none;
	}
</style>
