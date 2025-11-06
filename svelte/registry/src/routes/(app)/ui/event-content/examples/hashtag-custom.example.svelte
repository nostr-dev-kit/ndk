<script lang="ts">
  interface Props {
    tag: string;
    onclick?: (tag: string) => void;
    class?: string;
  }

  let { tag, onclick, class: className = '' }: Props = $props();
</script>

<span class="custom-hashtag {className}" onclick={() => onclick?.(tag)}>
  #{tag}
</span>

<style>
  .custom-hashtag {
    color: #8b5cf6;
    font-weight: 600;
    cursor: pointer;
  }

  .custom-hashtag:hover {
    color: #7c3aed;
  }
</style>
