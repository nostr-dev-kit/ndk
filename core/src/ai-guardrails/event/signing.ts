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
            "Cannot sign event without 'kind'. Set event.kind before signing.",
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
        error(
            "event-content-is-object",
            "Event content is an object. Content must be a string.",
            "Use JSON.stringify() for structured data: event.content = JSON.stringify(data)",
            false, // Fatal error - cannot be disabled
        );
    }
}

/**
 * Check that param replaceable events have a d-tag
 */
function checkParamReplaceableNoDtag(event: NDKEvent, warn: WarnFn): void {
    if (event.isParamReplaceable() && !event.dTag) {
        warn(
            "event-param-replaceable-no-dtag",
            `Parameterized replaceable event (kind ${event.kind}) without d-tag. Event will use empty string "".`,
            'Set event.dTag = "your-identifier" before signing.',
        );
    }
}

/**
 * Check that created_at is in seconds, not milliseconds
 */
function checkCreatedAtMilliseconds(event: NDKEvent, error: ErrorFn): void {
    if (event.created_at && event.created_at > 10000000000) {
        error(
            "event-created-at-milliseconds",
            `Event created_at (${event.created_at}) looks like milliseconds.`,
            "Use SECONDS, not milliseconds: Math.floor(Date.now() / 1000), not Date.now()",
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
            error(
                "tag-invalid-p-tag",
                `p-tag[${idx}] has invalid pubkey: "${tag[1]}". Must be 64-char hex.`,
                tag[1].startsWith("npub")
                    ? "Use ndkUser.pubkey instead of npub. Example: event.tags.push(['p', ndkUser.pubkey])"
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
            error(
                "tag-invalid-e-tag",
                `e-tag[${idx}] has invalid event ID: "${tag[1]}". Must be 64-char hex.`,
                tag[1].startsWith("note") || tag[1].startsWith("nevent")
                    ? "Use event.id instead of bech32. Example: event.tags.push(['e', referencedEvent.id])"
                    : "e-tags must contain valid hex event IDs (64 characters, 0-9a-f)",
                false, // Fatal error - cannot be disabled
            );
        }
    });
}

/**
 * Check for manual reply markers (should use .reply() instead)
 */
function checkManualReplyMarkers(event: NDKEvent, warn: WarnFn): void {
    if (event.kind === 1) {
        const eTagsWithMarkers = event.tags.filter(
            (tag) => tag[0] === "e" && (tag[3] === "reply" || tag[3] === "root"),
        );
        if (eTagsWithMarkers.length > 0) {
            warn(
                "event-manual-reply-markers",
                `Event has ${eTagsWithMarkers.length} e-tag(s) with manual reply/root markers.`,
                "Use event.reply(parentEvent) instead of manually adding e-tags with markers. NDK handles reply threading automatically.",
            );
        }
    }
}

/**
 * Called when an event is about to be signed.
 * Runs all signing-related checks.
 */
export function signing(
    event: NDKEvent,
    error: ErrorFn,
    warn: WarnFn,
): void {
    checkMissingKind(event, error);
    checkContentIsObject(event, error);
    checkParamReplaceableNoDtag(event, warn);
    checkCreatedAtMilliseconds(event, error);
    checkInvalidPTags(event, error);
    checkInvalidETags(event, error);
    checkManualReplyMarkers(event, warn);
}
