<script lang="ts">
  interface Props {
    title: string;
    description: string;
  }

  let { title, description }: Props = $props();

  let activeTab = $state<'preview' | 'code' | 'props'>('preview');
</script>

<div class="variant-card">
  <div class="variant-header">
    <h3>{title}</h3>
    <p>{description}</p>
  </div>

  <div class="variant-preview">
    {@render children?.preview?.()}
  </div>

  <div class="variant-tabs">
    <button
      class="variant-tab"
      class:active={activeTab === 'preview'}
      onclick={() => (activeTab = 'preview')}
    >
      Preview
    </button>
    {#if children?.code}
      <button
        class="variant-tab"
        class:active={activeTab === 'code'}
        onclick={() => (activeTab = 'code')}
      >
        Code
      </button>
    {/if}
    {#if children?.props}
      <button
        class="variant-tab"
        class:active={activeTab === 'props'}
        onclick={() => (activeTab = 'props')}
      >
        Props
      </button>
    {/if}
  </div>

  {#if activeTab === 'code' && children?.code}
    <div class="variant-code">
      {@render children.code()}
    </div>
  {:else if activeTab === 'props' && children?.props}
    <div class="variant-code">
      {@render children.props()}
    </div>
  {/if}
</div>

<style>
  .variant-card {
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .variant-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--color-border);
  }

  .variant-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .variant-header p {
    color: var(--color-muted-foreground);
    font-size: 0.95rem;
  }

  .variant-preview {
    padding: 3rem 2rem;
    background: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .variant-tabs {
    display: flex;
    gap: 0;
    background: var(--color-muted);
    border-bottom: 1px solid var(--color-border);
  }

  .variant-tab {
    padding: 0.875rem 1.5rem;
    background: transparent;
    border: none;
    color: var(--color-muted-foreground);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .variant-tab:hover {
    color: var(--color-foreground);
    background: var(--color-accent);
  }

  .variant-tab.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
  }

  .variant-code {
    padding: 1.5rem 2rem;
    background: var(--color-background);
    overflow-x: auto;
  }

  .variant-code :global(pre) {
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--color-foreground);
    margin: 0;
  }

  .variant-code :global(code) {
    font-family: inherit;
  }
</style>
