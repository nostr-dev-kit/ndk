import { NDKEvent, type NDKUser, NDKKind, NDKNutzap, zapInvoiceFromEvent } from "@nostr-dev-kit/ndk";

/**
 * Validate a NIP-57 zap receipt (kind 9735)
 *
 * Validates:
 * - Has bolt11 tag
 * - Has description tag with valid zap request JSON
 * - Zap request has valid signature
 * - Recipient pubkey matches (if target is provided)
 * - Event ID matches (if target is an event)
 */
export function validateNip57Zap(zapEvent: NDKEvent, target?: NDKEvent | NDKUser): boolean {
    if (zapEvent.kind !== NDKKind.Zap) return false;

    // Use existing parser which validates structure
    const invoice = zapInvoiceFromEvent(zapEvent);
    if (!invoice) return false;

    // Validate target if provided
    if (target) {
        if (target instanceof NDKEvent) {
            // For events, check if the zap is for this event
            if (invoice.zappedEvent !== target.id && invoice.zappedEvent !== target.tagId()) {
                return false;
            }
        } else {
            // For users, check if the zap is for this user
            if (invoice.zapped !== target.pubkey) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Validate a NIP-61 nutzap (kind 9321)
 *
 * Validates:
 * - Exactly 1 p-tag (recipient)
 * - Exactly 1 u-tag (mint)
 * - At most 1 e-tag (zapped event)
 * - At least 1 proof
 * - Recipient pubkey matches (if target is provided)
 * - Event ID matches (if target is an event)
 */
export function validateNip61Zap(zapEvent: NDKEvent, target?: NDKEvent | NDKUser): boolean {
    if (zapEvent.kind !== NDKKind.Nutzap) return false;

    // Try to parse as NDKNutzap
    const nutzap = NDKNutzap.from(zapEvent);
    if (!nutzap) return false;

    // Use built-in validation
    if (!nutzap.isValid) return false;

    // Validate target if provided
    if (target) {
        if (target instanceof NDKEvent) {
            // For events, check if the nutzap is for this event
            const eTag = nutzap.tagValue("e");
            const aTag = nutzap.tagValue("a");
            if (eTag !== target.id && aTag !== target.tagId()) {
                return false;
            }
        } else {
            // For users, check if the nutzap is for this user
            if (nutzap.recipientPubkey !== target.pubkey) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Validate any zap event (auto-detects NIP-57 or NIP-61)
 */
export function validateZap(zapEvent: NDKEvent, target?: NDKEvent | NDKUser): boolean {
    if (zapEvent.kind === NDKKind.Zap) {
        return validateNip57Zap(zapEvent, target);
    } else if (zapEvent.kind === NDKKind.Nutzap) {
        return validateNip61Zap(zapEvent, target);
    }
    return false;
}
