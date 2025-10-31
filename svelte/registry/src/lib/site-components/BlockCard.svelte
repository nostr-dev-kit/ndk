<script lang="ts">
  interface Props {
    title: string;
    description: string;
    icon: string;
    href: string;
    variantCount: number;
    badges?: { label: string; variant?: 'default' | 'nip' }[];
    gradient?: string;
    iconGradient?: string;
  }

  let {
    title,
    description,
    icon,
    href,
    variantCount,
    badges = [],
    gradient = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    iconGradient = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
  }: Props = $props();
</script>

<a {href} class="block-card">
  <div class="block-icon-container" style="background: {gradient};">
    <div class="block-icon" style="background: {iconGradient};">
      {icon}
    </div>
    <div class="block-preview-mini">{variantCount} variants</div>
  </div>
  <div class="block-content">
    <h3 class="block-title">{title}</h3>
    <p class="block-description">{description}</p>
    {#if badges.length > 0}
      <div class="block-meta">
        {#each badges as badge}
          <span class="block-badge" class:nip={badge.variant === 'nip'}>
            {badge.label}
          </span>
        {/each}
      </div>
    {/if}
  </div>
</a>

<style>
  .block-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .block-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .block-icon-container {
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    position: relative;
  }

  .block-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
  }

  .block-preview-mini {
    position: absolute;
    bottom: 1.5rem;
    right: 1.5rem;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.75rem;
    font-size: 0.75rem;
    color: #999;
  }

  .block-content {
    padding: 1.5rem;
  }

  .block-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #e8e8e8;
    margin-bottom: 0.5rem;
  }

  .block-description {
    color: #999;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .block-meta {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .block-badge {
    padding: 0.25rem 0.625rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    font-size: 0.75rem;
    color: #999;
  }

  .block-badge.nip {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.2);
    color: #8b8ff5;
  }
</style>
