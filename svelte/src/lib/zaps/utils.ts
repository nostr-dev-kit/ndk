import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { NDKKind, NDKNutzap } from "@nostr-dev-kit/ndk";
import { zapInvoiceFromEvent } from "@nostr-dev-kit/ndk";

export type ZapMethod = "nip57" | "nip61";

/**
 * Get the amount from any zap event (in sats)
 */
export function getZapAmount(zapEvent: NDKEvent): number {
  if (zapEvent.kind === NDKKind.Zap) {
    const invoice = zapInvoiceFromEvent(zapEvent);
    if (!invoice) return 0;
    // Invoice amount is in millisats, convert to sats
    return Math.floor(invoice.amount / 1000);
  } else if (zapEvent.kind === NDKKind.Nutzap) {
    const nutzap = NDKNutzap.from(zapEvent);
    if (!nutzap) return 0;
    return nutzap.amount;
  }
  return 0;
}

/**
 * Get the sender from any zap event
 */
export function getZapSender(zapEvent: NDKEvent): NDKUser | undefined {
  if (!zapEvent.ndk) return undefined;

  if (zapEvent.kind === NDKKind.Zap) {
    const invoice = zapInvoiceFromEvent(zapEvent);
    if (!invoice) return undefined;
    return zapEvent.ndk.getUser({ pubkey: invoice.zappee });
  } else if (zapEvent.kind === NDKKind.Nutzap) {
    const nutzap = NDKNutzap.from(zapEvent);
    if (!nutzap) return undefined;
    return nutzap.sender;
  }
  return undefined;
}

/**
 * Get the comment from any zap event
 */
export function getZapComment(zapEvent: NDKEvent): string | undefined {
  if (zapEvent.kind === NDKKind.Zap) {
    const invoice = zapInvoiceFromEvent(zapEvent);
    return invoice?.comment;
  } else if (zapEvent.kind === NDKKind.Nutzap) {
    const nutzap = NDKNutzap.from(zapEvent);
    return nutzap?.comment;
  }
  return undefined;
}

/**
 * Get the zap method type
 */
export function getZapMethod(zapEvent: NDKEvent): ZapMethod | undefined {
  if (zapEvent.kind === NDKKind.Zap) return "nip57";
  if (zapEvent.kind === NDKKind.Nutzap) return "nip61";
  return undefined;
}

/**
 * Check if a user has zapped a target
 */
export function hasZappedBy(zaps: NDKEvent[], pubkey: string): boolean {
  return zaps.some((zap) => {
    const sender = getZapSender(zap);
    return sender?.pubkey === pubkey;
  });
}
