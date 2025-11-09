<script lang="ts">
  import { cn } from '../../utils/cn.js';

  interface Props {
    size?: number;
    filled?: boolean;
    class?: string;
  }

  let { size = 18, filled = false, class: className = '' }: Props = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width={size}
  height={size}
  fill={filled ? 'currentColor' : 'none'}
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={cn('', className)}
>
  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"></path>
</svg>
