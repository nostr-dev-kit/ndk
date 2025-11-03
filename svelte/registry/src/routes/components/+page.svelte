<script lang="ts">
  import { componentCategories } from '$lib/navigation';
  import { HugeiconsIcon } from '@hugeicons/svelte';
  import NipBadge from '$lib/site-components/nip-badge.svelte';
</script>

<svelte:head>
  <title>Components - NDK Svelte</title>
  <meta name="description" content="Explore pre-built Nostr components for common interactions and UI patterns." />
</svelte:head>

<div class="components-page">
  <header class="page-header">
    <h1 class="page-title">Components</h1>
    <p class="page-description">
      Pre-built, composable components for common Nostr interactions. Each component is built with NDK's reactive builders
      and can be used standalone or composed together.
    </p>
  </header>

  <div class="categories-grid">
    {#each componentCategories.filter(cat => cat.title !== 'UI Primitives') as category (category.title)}
      <section class="category-section">
        <div class="category-header">
          <h2 class="category-title">{category.title}</h2>
          {#if category.nip}
            <NipBadge nip={category.nip} />
          {/if}
        </div>

        <div class="components-bento">
          {#each category.items as component (component.path)}
            <a
              href={component.path}
              class="component-card"
              class:featured={component.name === 'Introduction'}
            >
              <div class="card-icon">
                <HugeiconsIcon icon={component.icon} size={24} strokeWidth={2} />
              </div>
              <div class="card-content">
                <div class="card-header">
                  <h3 class="card-title">{component.title || component.name}</h3>
                  {#if component.nip}
                    <NipBadge nip={component.nip} />
                  {/if}
                </div>
                {#if component.description}
                  <p class="card-description">{component.description}</p>
                {/if}
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/each}
  </div>
</div>

<style>
  .components-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  .page-header {
    margin-bottom: 3rem;
    max-width: 800px;
  }

  .page-title {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, transparent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-description {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--color-muted-foreground);
    margin: 0;
  }

  .categories-grid {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .category-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .category-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-foreground);
  }

  .components-bento {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    auto-rows: minmax(120px, auto);
  }

  .component-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    background: var(--color-background);
    text-decoration: none;
    transition: all 0.2s ease-in-out;
    position: relative;
    overflow: hidden;
  }

  .component-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--primary) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  .component-card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px color-mix(in srgb, var(--primary) 20%, transparent);
  }

  .component-card:hover::before {
    opacity: 0.03;
  }

  .component-card.featured {
    grid-column: span 2;
    background: linear-gradient(135deg,
      color-mix(in srgb, var(--primary) 5%, var(--color-background)) 0%,
      var(--color-background) 100%
    );
  }

  @media (max-width: 900px) {
    .component-card.featured {
      grid-column: span 1;
    }
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--primary) 10%, transparent);
    color: var(--primary);
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
    z-index: 1;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .card-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-foreground);
  }

  .card-description {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-muted-foreground);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .components-page {
      padding: 1.5rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2rem;
    }

    .page-description {
      font-size: 1rem;
    }

    .components-bento {
      grid-template-columns: 1fr;
    }

    .categories-grid {
      gap: 3rem;
    }
  }
</style>
