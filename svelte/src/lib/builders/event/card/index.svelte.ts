import type NDKEvent from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';
import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { NDKKind, zapInvoiceFromEvent } from '@nostr-dev-kit/ndk';
import { createProfileFetcher } from '$lib/builders/profile/index.svelte.js';

export interface EventCardState {
  // Author
  profile: NDKUserProfile | undefined;

  // Engagement counts
  replies: {
    count: number;
    hasReplied: boolean;
  };

  zaps: {
    count: number;
    totalAmount: number; // in sats
    hasZapped: boolean;
  };

  reposts: {
    count: number;
    hasReposted: boolean;
  };

  reactions: {
    count: number;
    hasReacted: boolean;
    byEmoji: Map<string, { count: number; hasReacted: boolean }>;
  };

  // Cleanup
  cleanup: () => void;
}

export function createEventCard({
  ndk,
  event,
}: {
  ndk: NDKSvelte;
  event: () => NDKEvent;
}): EventCardState {
  const currentEvent = $derived(event());
  const author = $derived(currentEvent.author);

  // Use the shared profile fetcher for consistent behavior
  const profileFetcher = createProfileFetcher({ ndk, user: () => author });

  // Lazy subscriptions - only created when accessed
  let repliesSub: ReturnType<typeof ndk.$subscribe> | undefined;
  let zapsSub: ReturnType<typeof ndk.$subscribe> | undefined;
  let repostsSub: ReturnType<typeof ndk.$subscribe> | undefined;
  let reactionsSub: ReturnType<typeof ndk.$subscribe> | undefined;

  return {
    get profile() {
      return profileFetcher.profile || undefined;
    },

    get replies() {
      if (!repliesSub) {
        repliesSub = ndk.$subscribe(() => ({
          filters: [{ kinds: [NDKKind.Text], ...currentEvent.filter() }],
          opts: { closeOnEose: false }
        }));
      }

      const replyEvents = Array.from(repliesSub.events || []);
      return {
        count: replyEvents.length,
        hasReplied: ndk.$currentPubkey ?
          replyEvents.some(e => e.pubkey === ndk.$currentPubkey) :
          false,
      };
    },

    get zaps() {
      if (!zapsSub) {
        zapsSub = ndk.$subscribe(() => ({
          filters: [{ kinds: [9735], ...currentEvent.filter() }],
          opts: { closeOnEose: false }
        }));
      }

      const zapEvents = Array.from(zapsSub.events || []);
      const zapInvoices = zapEvents.map(zapInvoiceFromEvent).filter(Boolean);
      const totalAmount = zapInvoices.reduce((sum, invoice) => sum + (invoice?.amount || 0), 0);

      return {
        count: zapEvents.length,
        totalAmount: Math.floor(totalAmount / 1000), // Convert millisats to sats
        hasZapped: ndk.$currentPubkey ?
          zapInvoices.some(invoice => invoice?.zappee === ndk.$currentPubkey) :
          false,
      };
    },

    get reposts() {
      if (!repostsSub) {
        repostsSub = ndk.$subscribe(() => ({
          filters: [{ kinds: [NDKKind.Repost, NDKKind.GenericRepost], ...currentEvent.filter() }],
          opts: { closeOnEose: false }
        }));
      }

      const repostEvents = Array.from(repostsSub.events || []);
      return {
        count: repostEvents.length,
        hasReposted: ndk.$currentPubkey ?
          repostEvents.some(e => e.pubkey === ndk.$currentPubkey) :
          false,
      };
    },

    get reactions() {
      if (!reactionsSub) {
        reactionsSub = ndk.$subscribe(() => ({
          filters: [{ kinds: [NDKKind.Reaction], ...currentEvent.filter() }],
          opts: { closeOnEose: false }
        }));
      }

      const reactionEvents = Array.from(reactionsSub.events || []);
      const byEmoji = new Map<string, { count: number; hasReacted: boolean }>();

      for (const reaction of reactionEvents) {
        const emoji = reaction.content || '+';
        const existing = byEmoji.get(emoji) || { count: 0, hasReacted: false };

        byEmoji.set(emoji, {
          count: existing.count + 1,
          hasReacted: existing.hasReacted || (ndk.$currentPubkey ? reaction.pubkey === ndk.$currentPubkey : false),
        });
      }

      return {
        count: reactionEvents.length,
        hasReacted: ndk.$currentPubkey ?
          reactionEvents.some(e => e.pubkey === ndk.$currentPubkey) :
          false,
        byEmoji,
      };
    },

    cleanup: () => {
      repliesSub?.stop?.();
      zapsSub?.stop?.();
      repostsSub?.stop?.();
      reactionsSub?.stop?.();
    },
  };
}
