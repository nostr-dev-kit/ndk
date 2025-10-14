/**
 * Types and constants for AI Guardrails system
 */

export type AIGuardrailLevel = "error" | "warn";

export interface AIGuardrailConfig {
    skip?: Set<string>;
}

export type AIGuardrailsMode = boolean | AIGuardrailConfig;

/**
 * Guardrail check IDs - centralized list of all available checks.
 * This makes it easy to reference them in code and documentation.
 */
export const GuardrailCheckId = {
    // NDK lifecycle
    NDK_NO_CACHE: "ndk-no-cache",

    // Filter-related
    FILTER_BECH32_IN_ARRAY: "filter-bech32-in-array",
    FILTER_INVALID_HEX: "filter-invalid-hex",
    FILTER_ONLY_LIMIT: "filter-only-limit",
    FILTER_LARGE_LIMIT: "filter-large-limit",
    FILTER_EMPTY: "filter-empty",
    FILTER_SINCE_AFTER_UNTIL: "filter-since-after-until",
    FILTER_INVALID_A_TAG: "filter-invalid-a-tag",
    FILTER_HASHTAG_WITH_PREFIX: "filter-hashtag-with-prefix",

    // fetchEvents anti-pattern
    FETCH_EVENTS_USAGE: "fetch-events-usage",

    // Event construction
    EVENT_MISSING_KIND: "event-missing-kind",
    EVENT_PARAM_REPLACEABLE_NO_DTAG: "event-param-replaceable-no-dtag",
    EVENT_CREATED_AT_MILLISECONDS: "event-created-at-milliseconds",
    EVENT_NO_NDK_INSTANCE: "event-no-ndk-instance",
    EVENT_CONTENT_IS_OBJECT: "event-content-is-object",
    EVENT_MODIFIED_AFTER_SIGNING: "event-modified-after-signing",
    EVENT_MANUAL_REPLY_MARKERS: "event-manual-reply-markers",

    // Tag construction
    TAG_E_FOR_PARAM_REPLACEABLE: "tag-e-for-param-replaceable",
    TAG_BECH32_VALUE: "tag-bech32-value",
    TAG_DUPLICATE: "tag-duplicate",
    TAG_INVALID_P_TAG: "tag-invalid-p-tag",
    TAG_INVALID_E_TAG: "tag-invalid-e-tag",
    TAG_HASHTAG_WITH_PREFIX: "tag-hashtag-with-prefix",

    // Subscription
    SUBSCRIBE_NOT_STARTED: "subscribe-not-started",
    SUBSCRIBE_CLOSE_ON_EOSE_NO_HANDLER: "subscribe-close-on-eose-no-handler",
    SUBSCRIBE_PASSED_EVENT_NOT_FILTER: "subscribe-passed-event-not-filter",
    SUBSCRIBE_AWAITED: "subscribe-awaited",

    // Relay
    RELAY_INVALID_URL: "relay-invalid-url",
    RELAY_HTTP_INSTEAD_OF_WS: "relay-http-instead-of-ws",
    RELAY_NO_ERROR_HANDLERS: "relay-no-error-handlers",

    // Validation
    VALIDATION_PUBKEY_IS_NPUB: "validation-pubkey-is-npub",
    VALIDATION_PUBKEY_WRONG_LENGTH: "validation-pubkey-wrong-length",
    VALIDATION_EVENT_ID_IS_BECH32: "validation-event-id-is-bech32",
    VALIDATION_EVENT_ID_WRONG_LENGTH: "validation-event-id-wrong-length",
} as const;

export type GuardrailCheckId = (typeof GuardrailCheckId)[keyof typeof GuardrailCheckId];
