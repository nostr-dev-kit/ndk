<script lang="ts">
  interface Props {
    title: string;
    description: string;
    icon: string;
    iconGradient?: string;
    badges?: { label: string; variant?: 'default' | 'nip' }[];
  }

  let {
    title,
    description,
    icon,
    iconGradient = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    badges = []
  }: Props = $props();
</script>

<div class="header">
  <div class="header-icon" style="background: {iconGradient};">
    {icon}
  </div>
  <div class="header-info">
    <h1>{title}</h1>
    <p class="description">{description}</p>
    {#if badges.length > 0}
      <div class="header-meta">
        {#each badges as badge}
          <span class="meta-badge" class:nip={badge.variant === 'nip'}>
            {badge.label}
          </span>
        {/each}
      </div>
    {/if}
  </div>
  <div class="header-actions">
    {@render children?.()}
  </div>
</div>

<style>
  .header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 2rem;
    align-items: start;
    margin-bottom: 3rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid var(--color-border);
  }

  .header-icon {
    width: 96px;
    height: 96px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
  }

  .header-info h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    letter-spacing: -0.02em;
  }

  .header-info .description {
    font-size: 1.125rem;
    color: var(--color-muted-foreground);
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .header-meta {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .meta-badge {
    padding: 0.375rem 0.875rem;
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  .meta-badge.nip {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
    color: var(--color-primary);
  }

  .header-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  @media (max-width: 968px) {
    .header {
      grid-template-columns: 1fr;
    }

    .header-actions {
      flex-direction: row;
    }

    .header-info h1 {
      font-size: 2rem;
    }
  }
</style>
