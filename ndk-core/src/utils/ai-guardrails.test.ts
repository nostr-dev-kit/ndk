import { describe, expect, it } from "bun:test";
import { AIGuardrails, GuardrailCheckId } from "./ai-guardrails.js";

describe("AIGuardrails", () => {
    describe("constructor", () => {
        it("should be disabled by default", () => {
            const guards = new AIGuardrails();
            expect(guards.isEnabled()).toBe(false);
        });

        it("should enable when passed true", () => {
            const guards = new AIGuardrails(true);
            expect(guards.isEnabled()).toBe(true);
        });

        it("should enable with config object", () => {
            const guards = new AIGuardrails({ skip: new Set(["test"]) });
            expect(guards.isEnabled()).toBe(true);
            expect(guards.getSkipped()).toEqual(["test"]);
        });
    });

    describe("shouldCheck", () => {
        it("should return false when disabled", () => {
            const guards = new AIGuardrails(false);
            expect(guards.shouldCheck("any-check")).toBe(false);
        });

        it("should return true when enabled and not skipped", () => {
            const guards = new AIGuardrails(true);
            expect(guards.shouldCheck("any-check")).toBe(true);
        });

        it("should return false when check is skipped", () => {
            const guards = new AIGuardrails({ skip: new Set(["skipped-check"]) });
            expect(guards.shouldCheck("skipped-check")).toBe(false);
            expect(guards.shouldCheck("other-check")).toBe(true);
        });
    });

    describe("skip and enable", () => {
        it("should skip a check", () => {
            const guards = new AIGuardrails(true);
            guards.skip("test-check");
            expect(guards.shouldCheck("test-check")).toBe(false);
        });

        it("should re-enable a skipped check", () => {
            const guards = new AIGuardrails({ skip: new Set(["test-check"]) });
            expect(guards.shouldCheck("test-check")).toBe(false);
            guards.enable("test-check");
            expect(guards.shouldCheck("test-check")).toBe(true);
        });
    });

    describe("error", () => {
        it("should not throw when disabled", () => {
            const guards = new AIGuardrails(false);
            expect(() => guards.error("test", "This should not throw")).not.toThrow();
        });

        it("should not throw when check is skipped", () => {
            const guards = new AIGuardrails({ skip: new Set(["test"]) });
            expect(() => guards.error("test", "This should not throw")).not.toThrow();
        });

        it("should throw when enabled and not skipped", () => {
            const guards = new AIGuardrails(true);
            expect(() => guards.error("test", "Test error")).toThrow(/Test error/);
        });

        it("should include hint in error message", () => {
            const guards = new AIGuardrails(true);
            expect(() => guards.error("test", "Test error", "This is a hint")).toThrow(
                /This is a hint/,
            );
        });

        it("should include skip instructions in error message", () => {
            const guards = new AIGuardrails(true);
            expect(() => guards.error("test", "Test error")).toThrow(/aiGuardrails.skip\('test'\)/);
        });
    });

    describe("warn", () => {
        it("should not warn when disabled", () => {
            const guards = new AIGuardrails(false);
            const warnSpy = spyOn(console, "warn");
            guards.warn("test", "This should not warn");
            expect(warnSpy).not.toHaveBeenCalled();
        });

        it("should not warn when check is skipped", () => {
            const guards = new AIGuardrails({ skip: new Set(["test"]) });
            const warnSpy = spyOn(console, "warn");
            guards.warn("test", "This should not warn");
            expect(warnSpy).not.toHaveBeenCalled();
        });

        it("should warn when enabled and not skipped", () => {
            const guards = new AIGuardrails(true);
            const warnSpy = spyOn(console, "warn");
            guards.warn("test", "Test warning");
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Test warning"));
        });
    });

    describe("GuardrailCheckId", () => {
        it("should have all expected check IDs", () => {
            expect(GuardrailCheckId.FILTER_BECH32_IN_ARRAY).toBe("filter-bech32-in-array");
            expect(GuardrailCheckId.FILTER_ONLY_LIMIT).toBe("filter-only-limit");
            expect(GuardrailCheckId.FETCH_EVENTS_USAGE).toBe("fetch-events-usage");
            expect(GuardrailCheckId.EVENT_MISSING_KIND).toBe("event-missing-kind");
        });
    });
});

// Helper function to spy on console methods
function spyOn(obj: any, method: string) {
    const calls: any[] = [];
    const original = obj[method];
    obj[method] = (...args: any[]) => {
        calls.push(args);
    };
    return {
        toHaveBeenCalled: () => expect(calls.length).toBeGreaterThan(0),
        not: {
            toHaveBeenCalled: () => expect(calls.length).toBe(0),
        },
        toHaveBeenCalledWith: (matcher: any) => {
            const found = calls.some((call) =>
                call.some((arg: any) => {
                    if (typeof matcher === "string") {
                        return typeof arg === "string" && arg.includes(matcher);
                    }
                    return JSON.stringify(arg).includes(JSON.stringify(matcher));
                }),
            );
            expect(found).toBe(true);
            obj[method] = original;
        },
    };
}
