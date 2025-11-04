<script lang="ts">
  import { NDKEvent, NDKZapper, type NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import type { Action } from 'svelte/action';
  import { setZapSendContext } from './zap-send.context.js';

  interface SendOptions {
    amount: number;
    comment?: string;
  }

  interface Props {
    ndk: NDKSvelte;
    recipient: NDKEvent | NDKUser;
    splits?: Array<{ pubkey: string; amount: number }>;
    children: Snippet<[{ send: Action<HTMLElement, SendOptions> }]>;
  }

  let { ndk, recipient, splits, children }: Props = $props();

  setZapSendContext({ ndk, recipient, splits });

  function sendAction(node: HTMLElement, options: SendOptions): ReturnType<Action<HTMLElement, SendOptions>> {
    async function handleClick() {
      if (!ndk.$currentPubkey) {
        console.error('User must be logged in to zap');
        return;
      }

      try {
        // Use NDKZapper to send the zap
        const zapper = new NDKZapper(recipient, options.amount * 1000, "msat", {
          comment: options.comment,
        });
        await zapper.zap();
      } catch (error) {
        console.error('Failed to zap:', error);
        throw error;
      }
    }

    node.addEventListener('click', handleClick);

    return {
      destroy() {
        node.removeEventListener('click', handleClick);
      }
    };
  }
</script>

{@render children({ send: sendAction })}
