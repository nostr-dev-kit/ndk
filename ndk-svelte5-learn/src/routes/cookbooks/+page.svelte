<script lang="ts">
	import { COOKBOOK_CATEGORIES, searchRecipes } from '$lib/data/cookbook-structure';

	let searchQuery = $state('');

	const searchResults = $derived(
		searchQuery.length > 0 ? searchRecipes(searchQuery) : []
	);

	const totalRecipes = $derived(
		COOKBOOK_CATEGORIES.reduce((sum, cat) => sum + cat.recipes.length, 0)
	);
</script>

<div class="cookbooks">
	<div class="header">
		<h1>Cookbooks</h1>
		<p class="subtitle">
			Quick, copy-paste recipes for common tasks. Search or browse by category.
		</p>
	</div>

	<div class="search-bar">
		<input
			type="text"
			placeholder="Search recipes..."
			bind:value={searchQuery}
		/>
	</div>

	{#if searchQuery.length > 0}
		<div class="search-results">
			<h2>Search Results ({searchResults.length})</h2>
			{#if searchResults.length === 0}
				<p class="no-results">No recipes found for "{searchQuery}"</p>
			{:else}
				<div class="recipe-list">
					{#each searchResults as recipe}
						<a href="/cookbooks/{recipe.category}/{recipe.id}" class="recipe-card">
							<h3>{recipe.title}</h3>
							<p>{recipe.description}</p>
							<div class="recipe-meta">
								<span class="difficulty {recipe.difficulty}">{recipe.difficulty}</span>
								<span class="time">{recipe.estimatedTime}</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<div class="categories">
			{#each COOKBOOK_CATEGORIES as category}
				<a href="/cookbooks/{category.id}" class="category-card">
					<div class="category-icon">{category.icon}</div>
					<div class="category-content">
						<h2>{category.title}</h2>
						<p>{category.description}</p>
						<div class="category-count">
							{category.recipes.length} recipe{category.recipes.length !== 1 ? 's' : ''}
						</div>
					</div>
					<div class="category-arrow">→</div>
				</a>
			{/each}
		</div>

		<div class="stats">
			<p>{COOKBOOK_CATEGORIES.length} categories • {totalRecipes} recipes (and growing!)</p>
		</div>
	{/if}
</div>

<style>
	.cookbooks {
		max-width: 1000px;
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

	.search-bar {
		margin-bottom: 2rem;
	}

	.search-bar input {
		width: 100%;
		padding: 1rem 1.5rem;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 8px;
		color: #fff;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.search-bar input:focus {
		outline: none;
		border-color: #8b5cf6;
	}

	.search-bar input::placeholder {
		color: #666;
	}

	.search-results h2 {
		margin: 0 0 1.5rem 0;
		color: #fff;
	}

	.no-results {
		text-align: center;
		color: #666;
		padding: 2rem;
	}

	.recipe-list {
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

	.categories {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.category-card {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.2s;
	}

	.category-card:hover {
		border-color: #8b5cf6;
		text-decoration: none;
		transform: translateX(4px);
	}

	.category-icon {
		font-size: 2.5rem;
		flex-shrink: 0;
	}

	.category-content {
		flex: 1;
	}

	.category-content h2 {
		margin: 0 0 0.25rem 0;
		font-size: 1.25rem;
		color: #fff;
	}

	.category-content p {
		margin: 0 0 0.5rem 0;
		color: #a0a0a0;
		font-size: 0.9375rem;
	}

	.category-count {
		color: #666;
		font-size: 0.875rem;
	}

	.category-arrow {
		font-size: 1.5rem;
		color: #8b5cf6;
		flex-shrink: 0;
	}

	.stats {
		text-align: center;
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid #333;
		color: #666;
	}

	.stats p {
		margin: 0;
	}
</style>
