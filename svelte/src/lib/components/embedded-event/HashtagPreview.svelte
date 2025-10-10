<!--
  @component HashtagPreview - Default renderer for hashtags

  Shows:
  - Hashtag as a clickable pill/badge
  - Optional trending indicator or count

  @example
  ```svelte
  <HashtagPreview
    hashtag="nostr"
    onClick={(tag) => goto(`/hashtag/${tag}`)}
  />
  ```
-->
<script lang="ts">
  interface Props {
    /** The hashtag without the # prefix */
    hashtag: string;
    /** Callback when the hashtag is clicked */
    onClick?: (hashtag: string) => void;
    /** Additional CSS classes */
    class?: string;
    /** Display format for the hashtag */
    format?: 'inline' | 'pill';
  }

  let {
    hashtag,
    onClick,
    class: className = '',
    format = 'inline',
  }: Props = $props();

  // Handle click
  function handleClick(e: MouseEvent) {
    if (onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick(hashtag);
    }
  }
</script>

{#if format === 'pill'}
  <!-- Pill format: more prominent hashtag display -->
  <button
    class="hashtag-pill {className}"
    onclick={handleClick}
    type="button"
  >
    <span class="hashtag-prefix">#</span>
    <span class="hashtag-text">{hashtag}</span>
  </button>
{:else}
  <!-- Inline format: compact hashtag display -->
  <a
    href={`#/hashtag/${hashtag}`}
    class="hashtag-inline {className}"
    onclick={handleClick}
  >
    #{hashtag}
  </a>
{/if}

<style>
  /* Inline hashtag styles */
  .hashtag-inline {
    color: var(--hashtag-color, #3b82f6);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
  }

  .hashtag-inline:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  /* Pill hashtag styles */
  .hashtag-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    padding: 0.25rem 0.625rem;
    background: var(--hashtag-background, #eff6ff);
    border: 1px solid var(--hashtag-border, #bfdbfe);
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    margin: 0.125rem;
  }

  .hashtag-pill:hover {
    background: var(--hashtag-hover-background, #dbeafe);
    border-color: var(--hashtag-hover-border, #93c5fd);
    transform: translateY(-1px);
  }

  .hashtag-prefix {
    color: var(--hashtag-prefix-color, #93c5fd);
    font-weight: 400;
  }

  .hashtag-text {
    color: var(--hashtag-text-color, #2563eb);
  }
</style>