/**
 * Event signing guardrails - individual check functions
 */

import type { NDKEvent } from "../../events/index.js";

type ErrorFn = (id: string, message: string, hint?: string, canDisable?: boolean) => never | undefined;
type WarnFn = (id: string, message: string, hint?: string) => never | undefined;

/**
 * Check that event has a kind field
 */
function checkMissingKind(event: NDKEvent, error: ErrorFn): void {
    if (event.kind === undefined || event.kind === null) {
        error(
            "event-missing-kind",
            `Cannot sign event without 'kind'.\n\n` +
                `📦 Event data:\n` +
                `   • content: ${event.content ? `"${event.content.substring(0, 50)}${event.content.length > 50 ? "..." : ""}"` : "(empty)"}\n` +
                `   • tags: ${event.tags.length} tag${event.tags.length !== 1 ? "s" : ""}\n` +
                `   • kind: ${event.kind} ❌\n\n` +
                `Set event.kind before signing.`,
            "Example: event.kind = 1; // for text note",
            false, // Fatal error - cannot be disabled
        );
    }
}

/**
 * Check that content is a string, not an object
 */
function checkContentIsObject(event: NDKEvent, error: ErrorFn): void {
    if (typeof event.content === "object") {
        const contentPreview = JSON.stringify(event.content, null, 2).substring(0, 200);
        error(
            "event-content-is-object",
            `Event content is an object. Content must be a string.\n\n` +
                `📦 Your content (${typeof event.content}):\n${contentPreview}${JSON.stringify(event.content).length > 200 ? "..." : ""}\n\n` +
                `❌ event.content = { ... }  // WRONG\n` +
                `✅ event.content = JSON.stringify({ ... })  // CORRECT`,
            "Use JSON.stringify() for structured data: event.content = JSON.stringify(data)",
            false, // Fatal error - cannot be disabled
        );
    }
}

/**
 * Check that created_at is in seconds, not milliseconds
 */
function checkCreatedAtMilliseconds(event: NDKEvent, error: ErrorFn): void {
    if (event.created_at && event.created_at > 10000000000) {
        const correctValue = Math.floor(event.created_at / 1000);
        const dateString = new Date(event.created_at).toISOString();
        error(
            "event-created-at-milliseconds",
            `Event created_at is in milliseconds, not seconds.\n\n` +
                `📦 Your value:\n` +
                `   • created_at: ${event.created_at} ❌\n` +
                `   • Interpreted as: ${dateString}\n` +
                `   • Should be: ${correctValue} ✅\n\n` +
                `Nostr timestamps MUST be in seconds since Unix epoch.`,
            "Use Math.floor(Date.now() / 1000) instead of Date.now()",
            false, // Fatal error - cannot be disabled
        );
    }
}

/**
 * Check that p-tags contain valid hex pubkeys
 */
function checkInvalidPTags(event: NDKEvent, error: ErrorFn): void {
    const pTags = event.getMatchingTags("p");
    pTags.forEach((tag, idx) => {
        if (tag[1] && !/^[0-9a-f]{64}$/i.test(tag[1])) {
            const tagPreview = JSON.stringify(tag);
            error(
                "tag-invalid-p-tag",
                `p-tag[${idx}] has invalid pubkey.\n\n` +
                    `📦 Your tag:\n   ${tagPreview}\n\n` +
                    `❌ Invalid value: "${tag[1]}"\n` +
                    `   • Length: ${tag[1].length} (expected 64)\n` +
                    `   • Format: ${tag[1].startsWith("npub") ? "bech32 (npub)" : "unknown"}\n\n` +
                    `p-tags MUST contain 64-character hex pubkeys.`,
                tag[1].startsWith("npub")
                    ? "Use ndkUser.pubkey instead of npub:\n   ✅ event.tags.push(['p', ndkUser.pubkey])\n   ❌ event.tags.push(['p', 'npub1...'])"
                    : "p-tags must contain valid hex pubkeys (64 characters, 0-9a-f)",
                false, // Fatal error - cannot be disabled
            );
        }
    });
}

/**
 * Check that e-tags contain valid hex event IDs
 */
function checkInvalidETags(event: NDKEvent, error: ErrorFn): void {
    const eTags = event.getMatchingTags("e");
    eTags.forEach((tag, idx) => {
        if (tag[1] && !/^[0-9a-f]{64}$/i.test(tag[1])) {
            const tagPreview = JSON.stringify(tag);
            const isBech32 = tag[1].startsWith("note") || tag[1].startsWith("nevent");
            error(
                "tag-invalid-e-tag",
                `e-tag[${idx}] has invalid event ID.\n\n` +
                    `📦 Your tag:\n   ${tagPreview}\n\n` +
                    `❌ Invalid value: "${tag[1]}"\n` +
                    `   • Length: ${tag[1].length} (expected 64)\n` +
                    `   • Format: ${isBech32 ? "bech32 (note/nevent)" : "unknown"}\n\n` +
                    `e-tags MUST contain 64-character hex event IDs.`,
                isBech32
                    ? "Use event.id instead of bech32:\n   ✅ event.tags.push(['e', referencedEvent.id])\n   ❌ event.tags.push(['e', 'note1...'])"
                    : "e-tags must contain valid hex event IDs (64 characters, 0-9a-f)",
                false, // Fatal error - cannot be disabled
            );
        }
    });
}

/**
 * Check for manual reply markers (should use .reply() instead)
 */
function checkManualReplyMarkers(event: NDKEvent, warn: WarnFn, replyEvents: WeakSet<NDKEvent>): void {
    if (event.kind !== 1) return;

    // If this event was created via .reply(), skip the check
    if (replyEvents.has(event)) return;

    const eTagsWithMarkers = event.tags.filter((tag) => tag[0] === "e" && (tag[3] === "reply" || tag[3] === "root"));

    if (eTagsWithMarkers.length > 0) {
        const tagList = eTagsWithMarkers.map((tag, idx) => `   ${idx + 1}. ${JSON.stringify(tag)}`).join("\n");
        warn(
            "event-manual-reply-markers",
            `Event has ${eTagsWithMarkers.length} e-tag(s) with manual reply/root markers.\n\n` +
                `📦 Your tags with markers:\n${tagList}\n\n` +
                `⚠️  Manual reply markers detected! This will cause incorrect threading.`,
            `Reply events MUST be created using .reply():\n\n` +
                `   ✅ CORRECT:\n` +
                `   const replyEvent = originalEvent.reply();\n` +
                `   replyEvent.content = 'good point!';\n` +
                `   await replyEvent.publish();\n\n` +
                `   ❌ WRONG:\n` +
                `   event.tags.push(['e', eventId, '', 'reply']);\n\n` +
                `NDK handles all reply threading automatically - never add reply/root markers manually.`,
        );
    }
}

/**
 * Check that hashtag tags don't include the # prefix
 */
function checkHashtagsWithPrefix(event: NDKEvent, error: ErrorFn): void {
    const tTags = event.getMatchingTags("t");
    tTags.forEach((tag, idx) => {
        if (tag[1] && tag[1].startsWith("#")) {
            const tagPreview = JSON.stringify(tag);
            error(
                "tag-hashtag-with-prefix",
                `t-tag[${idx}] contains hashtag with # prefix.\n\n` +
                    `📦 Your tag:\n   ${tagPreview}\n\n` +
                    `❌ Invalid value: "${tag[1]}"\n\n` +
                    `Hashtag tags should NOT include the # symbol.`,
                `Remove the # prefix from hashtag tags:\n   ✅ event.tags.push(['t', 'nostr'])\n   ❌ event.tags.push(['t', '#nostr'])`,
                false, // Fatal error - cannot be disabled
            );
        }
    });
}

/**
 * Called when an event is about to be signed.
 * Runs all signing-related checks.
 */
export function signing(event: NDKEvent, error: ErrorFn, warn: WarnFn, replyEvents: WeakSet<NDKEvent>): void {
    checkMissingKind(event, error);
    checkContentIsObject(event, error);
    checkCreatedAtMilliseconds(event, error);
    checkInvalidPTags(event, error);
    checkInvalidETags(event, error);
    checkHashtagsWithPrefix(event, error);
    checkManualReplyMarkers(event, warn, replyEvents);
}
