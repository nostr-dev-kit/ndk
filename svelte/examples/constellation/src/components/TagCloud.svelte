<script lang="ts">
  interface Props {
    tags: Array<{ tag: string; count: number }>;
    selectedTag: string | null;
    onTagClick: (tag: string | null) => void;
  }

  let { tags, selectedTag, onTagClick }: Props = $props();

  const maxCount = $derived(Math.max(...tags.map((t) => t.count), 1));
</script>

<div class="tag-cloud">
  <button
    class="cloud-tag"
    class:selected={selectedTag === null}
    onclick={() => onTagClick(null)}
    type="button"
  >
    <span class="tag-name">All</span>
    <span class="tag-count">{tags.reduce((sum, t) => sum + t.count, 0)}</span>
  </button>

  {#each tags as { tag, count }}
    {@const size = 0.75 + (count / maxCount) * 0.75}
    <button
      class="cloud-tag"
      class:selected={selectedTag === tag}
      style="font-size: {size}rem;"
      onclick={() => onTagClick(tag === selectedTag ? null : tag)}
      type="button"
    >
      <span class="tag-name">#{tag}</span>
      <span class="tag-count">{count}</span>
    </button>
  {/each}
</div>

<style>
  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 1.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1rem;
    backdrop-filter: blur(20px);
  }

  .cloud-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(168, 85, 247, 0.1);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 9999px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    font-weight: 500;
  }

  .cloud-tag:hover {
    background: rgba(168, 85, 247, 0.2);
    border-color: var(--accent-purple);
    color: var(--text-primary);
    transform: translateY(-2px);
  }

  .cloud-tag.selected {
    background: var(--accent-purple);
    border-color: var(--accent-purple);
    color: white;
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
  }

  .tag-name {
    line-height: 1;
  }

  .tag-count {
    font-size: 0.75rem;
    opacity: 0.8;
    font-weight: 600;
  }
</style>
