<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ReactionEmojiButton } from '$lib/registry/components';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <!-- Default: ReactionButton trigger -->
  <div class="flex items-center gap-4">
    <span class="text-sm text-muted-foreground w-32">Default:</span>
    <ReactionEmojiButton {ndk} {event} />
  </div>

  <!-- Fire emoji -->
  <div class="flex items-center gap-4">
    <span class="text-sm text-muted-foreground w-32">Fire emoji:</span>
    <ReactionEmojiButton {ndk} {event} emoji="🔥" />
  </div>

  <!-- Custom trigger -->
  <div class="flex items-center gap-4">
    <span class="text-sm text-muted-foreground w-32">Custom trigger:</span>
    <ReactionEmojiButton {ndk} {event}>
      <div class="flex items-center justify-center w-12 h-12 border-2 border-dashed border-muted-foreground/30 rounded-md hover:border-muted-foreground/50 transition-colors cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-muted-foreground/50"
        >
          <circle cx="12" cy="12" r="10" ></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2" ></path>
          <line x1="9" y1="9" x2="9.01" y2="9" ></line>
          <line x1="15" y1="9" x2="15.01" y2="9" ></line>
        </svg>
      </div>
    </ReactionEmojiButton>
  </div>
</div>
