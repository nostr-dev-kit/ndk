/**
 * AI Guardrails - Runtime validation to catch common mistakes made by LLMs and developers.
 *
 * This module provides a flexible system for warning about or preventing common anti-patterns
 * when using NDK. It's designed to be:
 * - Off by default (zero performance impact in production)
 * - Granularly configurable (can disable specific checks)
 * - Educational (provides actionable error messages)
 *
 * Architecture:
 * - Inline checks for synchronous validation (must block operations)
 * - Hook methods for observational warnings (async, non-blocking)
 * - All guardrail logic organized by domain (ndk, event, relay, etc.)
 * - Core code stays clean - just calls typed hook methods
 *
 * @example Enable all guardrails
 * ```typescript
 * const ndk = new NDK({ aiGuardrails: true });
 * ```
 *
 * @example Enable with exceptions
 * ```typescript
 * const ndk = new NDK({
 *   aiGuardrails: { skip: new Set(['filter-large-limit']) }
 * });
 * ```
 *
 * @example Programmatic control
 * ```typescript
 * ndk.aiGuardrails.skip('filter-large-limit');
 * ndk.aiGuardrails.enable('filter-bech32-in-array');
 * ```
 *
 * @example Hook usage in core code
 * ```typescript
 * // Clean, type-safe hook calls
 * this.aiGuardrails.ndkInstantiated(this);
 * this.aiGuardrails.eventReceived(event, relay);
 * ```
 */

import type { NDKEvent } from "../events/index.js";
import type { NDK } from "../ndk/index.js";
import type { NDKRelay } from "../relay/index.js";
import * as eventGuardrails from "./event/signing.js";
import * as ndkFetchEventsGuardrails from "./ndk/fetch-events.js";
import { checkCachePresence } from "./ndk.js";
import type { AIGuardrailsMode } from "./types.js";

export * from "./types.js";

/**
 * Central guardrails manager.
 * Provides both inline validation methods and hook methods for observational checks.
 */
export class AIGuardrails {
    private enabled: boolean = false;
    private skipSet: Set<string> = new Set();
    private extensions: Map<string, any> = new Map();

    constructor(mode: AIGuardrailsMode = false) {
        this.setMode(mode);
    }

    /**
     * Register an extension namespace with custom guardrail hooks.
     * This allows external packages to add their own guardrails.
     *
     * @example
     * ```typescript
     * // In NDKSvelte package:
     * ndk.aiGuardrails.register('ndkSvelte', {
     *   constructing: (params) => {
     *     if (!params.session) {
     *       warn('ndksvelte-no-session', 'NDKSvelte instantiated without session parameter...');
     *     }
     *   }
     * });
     *
     * // In NDKSvelte constructor:
     * this.ndk.aiGuardrails?.ndkSvelte?.constructing(params);
     * ```
     */
    register(namespace: string, hooks: any): void {
        if (this.extensions.has(namespace)) {
            console.warn(`AIGuardrails: Extension '${namespace}' already registered, overwriting`);
        }

        // Wrap hooks to check if enabled
        const wrappedHooks: any = {};
        for (const [key, fn] of Object.entries(hooks)) {
            if (typeof fn === "function") {
                wrappedHooks[key] = (...args: any[]) => {
                    if (!this.enabled) return;
                    (fn as Function)(
                        ...args,
                        this.shouldCheck.bind(this),
                        this.error.bind(this),
                        this.warn.bind(this),
                    );
                };
            }
        }

        this.extensions.set(namespace, wrappedHooks);

        // Dynamically attach to this instance
        (this as any)[namespace] = wrappedHooks;
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
    error(
        id: string,
        message: string,
        hint?: string,
        canDisable: boolean = true,
    ): never | undefined {
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
    warn(id: string, message: string, hint?: string): never | undefined {
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

    // ============================================================================
    // Hook Methods - Type-safe, domain-organized insertion points
    // ============================================================================

    /**
     * Called when NDK instance is created.
     * Checks for cache presence and other initialization concerns.
     */
    ndkInstantiated(ndk: NDK): void {
        if (!this.enabled) return;
        checkCachePresence(ndk, this.shouldCheck.bind(this));
    }

    /**
     * NDK-related guardrails
     */
    ndk = {
        /**
         * Called when fetchEvents is about to be called
         */
        fetchingEvents: (filters: any) => {
            if (!this.enabled) return;
            ndkFetchEventsGuardrails.fetchingEvents(filters, this.warn.bind(this));
        },
    };

    /**
     * Event-related guardrails
     */
    event = {
        /**
         * Called when an event is about to be signed
         */
        signing: (event: NDKEvent) => {
            if (!this.enabled) return;
            eventGuardrails.signing(event, this.error.bind(this), this.warn.bind(this));
        },

        /**
         * Called before an event is published
         */
        publishing: (_event: NDKEvent) => {
            if (!this.enabled) return;
            // Future: Add publishing checks
        },

        /**
         * Called when an event is received from a relay
         */
        received: (_event: NDKEvent, _relay: NDKRelay) => {
            if (!this.enabled) return;
            // Future: Add event reception monitoring
        },
    };

    /**
     * Subscription-related guardrails
     */
    subscription = {
        /**
         * Called when a subscription is created
         */
        created: (_filters: any[], _opts?: any) => {
            if (!this.enabled) return;
            // Future: Add subscription monitoring
        },
    };

    /**
     * Relay-related guardrails
     */
    relay = {
        /**
         * Called when a relay connection is established
         */
        connected: (_relay: NDKRelay) => {
            if (!this.enabled) return;
            // Future: Add relay monitoring
        },
    };
}
