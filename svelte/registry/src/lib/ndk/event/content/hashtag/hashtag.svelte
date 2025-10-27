<script lang="ts">
  interface HashtagProps {
    tag: string;
    class?: string;
    onclick?: (tag: string) => void;
  }

  let { tag, class: className = '', onclick }: HashtagProps = $props();

  function handleClick() {
    if (onclick) {
      onclick(tag);
    }
  }
</script>

<span
  class="hashtag {className}"
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
  #{tag}
</span>

<style>
  .hashtag {
    color: #2563eb;
    cursor: pointer;
  }

  .hashtag:hover {
    text-decoration: underline;
  }
</style>
