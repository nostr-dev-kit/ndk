/**
 * AI Guardrails - Runtime validation to catch common mistakes made by LLMs and developers.
 *
 * This module provides a flexible system for warning about or preventing common anti-patterns
 * when using NDK. It's designed to be:
 * - Off by default (zero performance impact in production)
 * - Granularly configurable (can disable specific checks)
 * - Educational (provides actionable error messages)
 *
 * @example Enable all guardrails
 * ```typescript
 * ndk.aiGuardrails = true;
 * ```
 *
 * @example Enable with exceptions
 * ```typescript
 * ndk.aiGuardrails = { skip: new Set(['event-signing-created-at']) };
 * ```
 *
 * @example Programmatic control
 * ```typescript
 * ndk.aiGuardrails.skip('filter-large-limit');
 * ndk.aiGuardrails.enable('filter-bech32-in-array');
 * ```
 */

export type AIGuardrailLevel = "error" | "warn";

export interface AIGuardrailConfig {
    skip?: Set<string>;
}

export type AIGuardrailsMode = boolean | AIGuardrailConfig;

/**
 * Central registry of all guardrail checks.
 * Each check has a unique ID, level, and can be individually disabled.
 */
export class AIGuardrails {
    private enabled: boolean = false;
    private skipSet: Set<string> = new Set();

    constructor(mode: AIGuardrailsMode = false) {
        this.setMode(mode);
    }

    /**
     * Set the guardrails mode.
     */
    setMode(mode: AIGuardrailsMode): void {
        if (typeof mode === "boolean") {
            this.enabled = mode;
            this.skipSet.clear();
        } else if (mode && typeof mode === "object") {
            this.enabled = true;
            this.skipSet = mode.skip || new Set();
        }
    }

    /**
     * Check if guardrails are enabled at all.
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Check if a specific guardrail check should run.
     */
    shouldCheck(id: string): boolean {
        return this.enabled && !this.skipSet.has(id);
    }

    /**
     * Disable a specific guardrail check.
     */
    skip(id: string): void {
        this.skipSet.add(id);
    }

    /**
     * Re-enable a specific guardrail check.
     */
    enable(id: string): void {
        this.skipSet.delete(id);
    }

    /**
     * Get all currently skipped guardrails.
     */
    getSkipped(): string[] {
        return Array.from(this.skipSet);
    }

    /**
     * Throw an error if the check should run.
     * Also logs to console.error in case the throw gets swallowed.
     * @param canDisable - If false, this is a fatal error that cannot be disabled (default: true)
     */
    error(id: string, message: string, hint?: string, canDisable: boolean = true): never | void {
        if (!this.shouldCheck(id)) return;

        const fullMessage = this.formatMessage(id, "ERROR", message, hint, canDisable);
        console.error(fullMessage);
        throw new Error(fullMessage);
    }

    /**
     * Throw a warning if the check should run.
     * Also logs to console.error in case the throw gets swallowed.
     * Warnings can always be disabled.
     */
    warn(id: string, message: string, hint?: string): never | void {
        if (!this.shouldCheck(id)) return;

        const fullMessage = this.formatMessage(id, "WARNING", message, hint, true);
        console.error(fullMessage);
        throw new Error(fullMessage);
    }

    /**
     * Format a guardrail message with helpful metadata.
     */
    private formatMessage(
        id: string,
        level: "ERROR" | "WARNING",
        message: string,
        hint?: string,
        canDisable: boolean = true,
    ): string {
        let output = `\n🤖 AI_GUARDRAILS ${level}: ${message}`;

        if (hint) {
            output += `\n\n💡 ${hint}`;
        }

        if (canDisable) {
            output += `\n\n🔇 To disable this check:\n   ndk.aiGuardrails.skip('${id}')`;
            output += `\n   or set: ndk.aiGuardrails = { skip: new Set(['${id}']) }`;
        }

        return output;
    }
}

/**
 * Guardrail check IDs - centralized list of all available checks.
 * This makes it easy to reference them in code and documentation.
 */
export const GuardrailCheckId = {
    // Filter-related
    FILTER_BECH32_IN_ARRAY: "filter-bech32-in-array",
    FILTER_ONLY_LIMIT: "filter-only-limit",
    FILTER_LARGE_LIMIT: "filter-large-limit",
    FILTER_EMPTY: "filter-empty",
    FILTER_SINCE_AFTER_UNTIL: "filter-since-after-until",
    FILTER_INVALID_A_TAG: "filter-invalid-a-tag",

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
