<!-- Simplified structure showing how the block is built -->

<button
  onclick={handleReact}
  class="inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-colors {stats.hasReacted ? 'text-red-500' : ''}"
>
  {#if emoji === '❤️'}
    <svg
      class="flex-shrink-0 {stats.hasReacted ? 'animate-[heartbeat_0.3s_ease-in-out]' : ''}"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      color="currentColor"
      fill={stats.hasReacted ? 'currentColor' : 'none'}
    >
      <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ></path>
    </svg>
  {:else}
    <span class="text-lg leading-none flex-shrink-0">{emoji}</span>
  {/if}

  {#if stats.count > 0}
    <span class="text-sm font-medium">{stats.count}</span>
  {/if}
</button>
