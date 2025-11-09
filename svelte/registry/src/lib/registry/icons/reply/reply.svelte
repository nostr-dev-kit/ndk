<script lang="ts">
  import { cn } from '../../utils/cn.js';

  interface Props {
    size?: number;
    class?: string;
  }

  let { size = 20, class: className = '' }: Props = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width={size}
  height={size}
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={cn('', className)}
>
  <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
</svg>
