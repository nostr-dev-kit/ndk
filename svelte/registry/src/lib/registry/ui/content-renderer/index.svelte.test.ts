import { NDKEvent } from "@nostr-dev-kit/ndk";
import { beforeEach, describe, expect, it } from "vitest";
import { ContentRenderer, type NDKWrapper } from "./index.svelte";

describe("ContentRenderer", () => {
    let renderer: ContentRenderer;

    beforeEach(() => {
        renderer = new ContentRenderer();
    });

    describe("initialization", () => {
        it("should initialize with default values", () => {
            expect(renderer.blockNsfw).toBe(true);
            expect(renderer.mentionComponent).toBeNull();
            expect(renderer.hashtagComponent).toBeNull();
            expect(renderer.linkComponent).toBeNull();
            expect(renderer.mediaComponent).toBeNull();
            expect(renderer.fallbackComponent).toBeNull();
        });

        it("should have empty handlers registry", () => {
            expect(renderer.getRegisteredKinds()).toEqual([]);
        });

        it("should have zero priorities", () => {
            const priorities = renderer.getInlinePriorities();
            expect(priorities.mention).toBe(0);
            expect(priorities.hashtag).toBe(0);
            expect(priorities.link).toBe(0);
            expect(priorities.media).toBe(0);
            expect(priorities.fallback).toBe(0);
        });
    });

    describe("addKind()", () => {
        describe("with kind array", () => {
            it("should register handler for single kind", () => {
                const mockComponent = {} as any;
                renderer.addKind([1], mockComponent);

                expect(renderer.hasKindHandler(1)).toBe(true);
                const handler = renderer.getKindHandler(1);
                expect(handler?.component).toBe(mockComponent);
                expect(handler?.wrapper).toBeNull();
                expect(handler?.priority).toBe(1);
            });

            it("should register handler for multiple kinds", () => {
                const mockComponent = {} as any;
                renderer.addKind([1, 2, 3], mockComponent);

                expect(renderer.hasKindHandler(1)).toBe(true);
                expect(renderer.hasKindHandler(2)).toBe(true);
                expect(renderer.hasKindHandler(3)).toBe(true);
            });

            it("should respect custom priority", () => {
                const mockComponent = {} as any;
                renderer.addKind([1], mockComponent, 10);

                const handler = renderer.getKindHandler(1);
                expect(handler?.priority).toBe(10);
            });

            it("should replace handler with higher priority", () => {
                const component1 = { id: "first" } as any;
                const component2 = { id: "second" } as any;

                renderer.addKind([1], component1, 5);
                renderer.addKind([1], component2, 10);

                const handler = renderer.getKindHandler(1);
                expect(handler?.component).toBe(component2);
                expect(handler?.priority).toBe(10);
            });

            it("should replace handler with equal priority", () => {
                const component1 = { id: "first" } as any;
                const component2 = { id: "second" } as any;

                renderer.addKind([1], component1, 5);
                renderer.addKind([1], component2, 5);

                const handler = renderer.getKindHandler(1);
                expect(handler?.component).toBe(component2);
            });

            it("should not replace handler with lower priority", () => {
                const component1 = { id: "first" } as any;
                const component2 = { id: "second" } as any;

                renderer.addKind([1], component1, 10);
                renderer.addKind([1], component2, 5);

                const handler = renderer.getKindHandler(1);
                expect(handler?.component).toBe(component1);
                expect(handler?.priority).toBe(10);
            });

            it("should handle empty kind array", () => {
                const mockComponent = {} as any;
                renderer.addKind([], mockComponent);

                expect(renderer.getRegisteredKinds()).toEqual([]);
            });
        });

        describe("with NDK wrapper", () => {
            it("should extract kinds from wrapper", () => {
                const wrapper: NDKWrapper = {
                    kinds: [30023, 30024],
                    from: (event: NDKEvent) => event,
                };
                const mockComponent = {} as any;

                renderer.addKind(wrapper, mockComponent);

                expect(renderer.hasKindHandler(30023)).toBe(true);
                expect(renderer.hasKindHandler(30024)).toBe(true);
            });

            it("should store wrapper reference", () => {
                const wrapper: NDKWrapper = {
                    kinds: [30023],
                    from: (event: NDKEvent) => event,
                };
                const mockComponent = {} as any;

                renderer.addKind(wrapper, mockComponent);

                const handler = renderer.getKindHandler(30023);
                expect(handler?.wrapper).toBe(wrapper);
            });

            it("should respect priority with wrapper", () => {
                const wrapper: NDKWrapper = {
                    kinds: [30023],
                    from: (event: NDKEvent) => event,
                };
                const mockComponent = {} as any;

                renderer.addKind(wrapper, mockComponent, 15);

                const handler = renderer.getKindHandler(30023);
                expect(handler?.priority).toBe(15);
            });

            it("should handle wrapper without kinds", () => {
                const wrapper: NDKWrapper = {
                    from: (event: NDKEvent) => event,
                };
                const mockComponent = {} as any;

                renderer.addKind(wrapper, mockComponent);

                expect(renderer.getRegisteredKinds()).toEqual([]);
            });

            it("should handle wrapper with empty kinds array", () => {
                const wrapper: NDKWrapper = {
                    kinds: [],
                    from: (event: NDKEvent) => event,
                };
                const mockComponent = {} as any;

                renderer.addKind(wrapper, mockComponent);

                expect(renderer.getRegisteredKinds()).toEqual([]);
            });

            it("should set wrapper to null if no from method", () => {
                const wrapper: NDKWrapper = {
                    kinds: [1],
                };
                const mockComponent = {} as any;

                renderer.addKind(wrapper, mockComponent);

                const handler = renderer.getKindHandler(1);
                expect(handler?.wrapper).toBeNull();
            });
        });
    });

    describe("setMentionComponent()", () => {
        it("should set mention component", () => {
            const mockComponent = {} as any;
            renderer.setMentionComponent(mockComponent);

            expect(renderer.mentionComponent).toBe(mockComponent);
        });

        it("should set mention priority", () => {
            const mockComponent = {} as any;
            renderer.setMentionComponent(mockComponent, 5);

            expect(renderer.getInlinePriorities().mention).toBe(5);
        });

        it("should replace with higher priority", () => {
            const component1 = { id: "first" } as any;
            const component2 = { id: "second" } as any;

            renderer.setMentionComponent(component1, 3);
            renderer.setMentionComponent(component2, 7);

            expect(renderer.mentionComponent).toBe(component2);
            expect(renderer.getInlinePriorities().mention).toBe(7);
        });

        it("should not replace with lower priority", () => {
            const component1 = { id: "first" } as any;
            const component2 = { id: "second" } as any;

            renderer.setMentionComponent(component1, 10);
            renderer.setMentionComponent(component2, 5);

            expect(renderer.mentionComponent).toBe(component1);
            expect(renderer.getInlinePriorities().mention).toBe(10);
        });

        it("should replace with equal priority", () => {
            const component1 = { id: "first" } as any;
            const component2 = { id: "second" } as any;

            renderer.setMentionComponent(component1, 5);
            renderer.setMentionComponent(component2, 5);

            expect(renderer.mentionComponent).toBe(component2);
        });

        it("should accept null component", () => {
            renderer.setMentionComponent({} as any);
            renderer.setMentionComponent(null, 10);

            expect(renderer.mentionComponent).toBeNull();
        });
    });

    describe("setHashtagComponent()", () => {
        it("should set hashtag component", () => {
            const mockComponent = {} as any;
            renderer.setHashtagComponent(mockComponent);

            expect(renderer.hashtagComponent).toBe(mockComponent);
        });

        it("should set hashtag priority", () => {
            const mockComponent = {} as any;
            renderer.setHashtagComponent(mockComponent, 5);

            expect(renderer.getInlinePriorities().hashtag).toBe(5);
        });

        it("should respect priority when replacing", () => {
            const component1 = { id: "first" } as any;
            const component2 = { id: "second" } as any;

            renderer.setHashtagComponent(component1, 10);
            renderer.setHashtagComponent(component2, 5);

            expect(renderer.hashtagComponent).toBe(component1);
        });
    });

    describe("setLinkComponent()", () => {
        it("should set link component", () => {
            const mockComponent = {} as any;
            renderer.setLinkComponent(mockComponent);

            expect(renderer.linkComponent).toBe(mockComponent);
        });

        it("should set link priority", () => {
            const mockComponent = {} as any;
            renderer.setLinkComponent(mockComponent, 8);

            expect(renderer.getInlinePriorities().link).toBe(8);
        });

        it("should respect priority when replacing", () => {
            const component1 = { id: "first" } as any;
            const component2 = { id: "second" } as any;

            renderer.setLinkComponent(component1, 10);
            renderer.setLinkComponent(component2, 5);

            expect(renderer.linkComponent).toBe(component1);
        });
    });

    describe("setMediaComponent()", () => {
        it("should set media component", () => {
            const mockComponent = {} as any;
            renderer.setMediaComponent(mockComponent);

            expect(renderer.mediaComponent).toBe(mockComponent);
        });

        it("should set media priority", () => {
            const mockComponent = {} as any;
            renderer.setMediaComponent(mockComponent, 12);

            expect(renderer.getInlinePriorities().media).toBe(12);
        });

        it("should respect priority when replacing", () => {
            const component1 = { id: "first" } as any;
            const component2 = { id: "second" } as any;

            renderer.setMediaComponent(component1, 10);
            renderer.setMediaComponent(component2, 5);

            expect(renderer.mediaComponent).toBe(component1);
        });
    });

    describe("setFallbackComponent()", () => {
        it("should set fallback component", () => {
            const mockComponent = {} as any;
            renderer.setFallbackComponent(mockComponent);

            expect(renderer.fallbackComponent).toBe(mockComponent);
        });

        it("should set fallback priority", () => {
            const mockComponent = {} as any;
            renderer.setFallbackComponent(mockComponent, 6);

            expect(renderer.getInlinePriorities().fallback).toBe(6);
        });

        it("should respect priority when replacing", () => {
            const component1 = { id: "first" } as any;
            const component2 = { id: "second" } as any;

            renderer.setFallbackComponent(component1, 10);
            renderer.setFallbackComponent(component2, 5);

            expect(renderer.fallbackComponent).toBe(component1);
        });
    });

    describe("getKindHandler()", () => {
        it("should return handler for registered kind", () => {
            const mockComponent = {} as any;
            renderer.addKind([1], mockComponent);

            const handler = renderer.getKindHandler(1);

            expect(handler).toBeDefined();
            expect(handler?.component).toBe(mockComponent);
        });

        it("should return undefined for unregistered kind", () => {
            const handler = renderer.getKindHandler(999);
            expect(handler).toBeUndefined();
        });

        it("should return undefined for undefined kind", () => {
            const handler = renderer.getKindHandler(undefined);
            expect(handler).toBeUndefined();
        });

        it("should return handler with wrapper if registered", () => {
            const wrapper: NDKWrapper = {
                kinds: [30023],
                from: (event: NDKEvent) => event,
            };
            const mockComponent = {} as any;
            renderer.addKind(wrapper, mockComponent);

            const handler = renderer.getKindHandler(30023);

            expect(handler?.wrapper).toBe(wrapper);
        });
    });

    describe("hasKindHandler()", () => {
        it("should return true for registered kind", () => {
            renderer.addKind([1], {} as any);
            expect(renderer.hasKindHandler(1)).toBe(true);
        });

        it("should return false for unregistered kind", () => {
            expect(renderer.hasKindHandler(999)).toBe(false);
        });

        it("should return false for undefined kind", () => {
            expect(renderer.hasKindHandler(undefined)).toBe(false);
        });
    });

    describe("getRegisteredKinds()", () => {
        it("should return empty array when no kinds registered", () => {
            expect(renderer.getRegisteredKinds()).toEqual([]);
        });

        it("should return sorted array of registered kinds", () => {
            renderer.addKind([30023], {} as any);
            renderer.addKind([1], {} as any);
            renderer.addKind([7], {} as any);

            const kinds = renderer.getRegisteredKinds();

            expect(kinds).toEqual([1, 7, 30023]);
        });

        it("should not include duplicates", () => {
            renderer.addKind([1], {} as any);
            renderer.addKind([1], {} as any, 10);

            const kinds = renderer.getRegisteredKinds();

            expect(kinds).toEqual([1]);
        });
    });

    describe("getInlinePriorities()", () => {
        it("should return all inline component priorities", () => {
            renderer.setMentionComponent({} as any, 5);
            renderer.setHashtagComponent({} as any, 3);
            renderer.setLinkComponent({} as any, 7);
            renderer.setMediaComponent({} as any, 2);
            renderer.setFallbackComponent({} as any, 4);

            const priorities = renderer.getInlinePriorities();

            expect(priorities).toEqual({
                mention: 5,
                hashtag: 3,
                link: 7,
                media: 2,
                fallback: 4,
            });
        });

        it("should return zeros for unset components", () => {
            const priorities = renderer.getInlinePriorities();

            expect(priorities).toEqual({
                mention: 0,
                hashtag: 0,
                link: 0,
                media: 0,
                fallback: 0,
            });
        });
    });

    describe("getKindPriorities()", () => {
        it("should return empty map when no kinds registered", () => {
            const priorities = renderer.getKindPriorities();
            expect(priorities.size).toBe(0);
        });

        it("should return priorities for all registered kinds", () => {
            renderer.addKind([1], {} as any, 10);
            renderer.addKind([7], {} as any, 5);
            renderer.addKind([30023], {} as any, 15);

            const priorities = renderer.getKindPriorities();

            expect(priorities.size).toBe(3);
            expect(priorities.get(1)).toBe(10);
            expect(priorities.get(7)).toBe(5);
            expect(priorities.get(30023)).toBe(15);
        });
    });

    describe("clear()", () => {
        it("should clear all kind handlers", () => {
            renderer.addKind([1, 7, 30023], {} as any);

            renderer.clear();

            expect(renderer.getRegisteredKinds()).toEqual([]);
        });

        it("should clear all inline components", () => {
            renderer.setMentionComponent({} as any);
            renderer.setHashtagComponent({} as any);
            renderer.setLinkComponent({} as any);
            renderer.setMediaComponent({} as any);
            renderer.setFallbackComponent({} as any);

            renderer.clear();

            expect(renderer.mentionComponent).toBeNull();
            expect(renderer.hashtagComponent).toBeNull();
            expect(renderer.linkComponent).toBeNull();
            expect(renderer.mediaComponent).toBeNull();
            expect(renderer.fallbackComponent).toBeNull();
        });

        it("should reset all priorities to zero", () => {
            renderer.setMentionComponent({} as any, 10);
            renderer.setHashtagComponent({} as any, 5);
            renderer.addKind([1], {} as any, 15);

            renderer.clear();

            const inlinePriorities = renderer.getInlinePriorities();
            expect(inlinePriorities.mention).toBe(0);
            expect(inlinePriorities.hashtag).toBe(0);

            const kindPriorities = renderer.getKindPriorities();
            expect(kindPriorities.size).toBe(0);
        });

        it("should allow re-registration after clear", () => {
            renderer.addKind([1], {} as any);
            renderer.clear();

            const newComponent = { id: "new" } as any;
            renderer.addKind([1], newComponent);

            const handler = renderer.getKindHandler(1);
            expect(handler?.component).toBe(newComponent);
        });
    });

    describe("priority system", () => {
        it("should handle multiple components at different priorities", () => {
            const low = { priority: "low" } as any;
            const medium = { priority: "medium" } as any;
            const high = { priority: "high" } as any;

            renderer.addKind([1], low, 1);
            renderer.addKind([1], medium, 5);
            renderer.addKind([1], high, 10);

            const handler = renderer.getKindHandler(1);
            expect(handler?.component).toBe(high);
            expect(handler?.priority).toBe(10);
        });

        it("should handle inline component priority system", () => {
            const first = { id: "first" } as any;
            const second = { id: "second" } as any;
            const third = { id: "third" } as any;

            renderer.setMentionComponent(first, 1);
            renderer.setMentionComponent(second, 10);
            renderer.setMentionComponent(third, 5); // Should not replace

            expect(renderer.mentionComponent).toBe(second);
            expect(renderer.getInlinePriorities().mention).toBe(10);
        });

        it("should track separate priorities for different kinds", () => {
            const component1 = {} as any;
            const component2 = {} as any;

            renderer.addKind([1], component1, 5);
            renderer.addKind([7], component2, 10);

            const priorities = renderer.getKindPriorities();
            expect(priorities.get(1)).toBe(5);
            expect(priorities.get(7)).toBe(10);
        });

        it("should track separate priorities for inline components", () => {
            renderer.setMentionComponent({} as any, 5);
            renderer.setHashtagComponent({} as any, 3);
            renderer.setLinkComponent({} as any, 10);

            const priorities = renderer.getInlinePriorities();
            expect(priorities.mention).toBe(5);
            expect(priorities.hashtag).toBe(3);
            expect(priorities.link).toBe(10);
        });
    });

    describe("edge cases", () => {
        it("should handle registering same kind with same component twice", () => {
            const component = {} as any;
            renderer.addKind([1], component);
            renderer.addKind([1], component);

            expect(renderer.hasKindHandler(1)).toBe(true);
            expect(renderer.getRegisteredKinds()).toEqual([1]);
        });

        it("should handle zero priority", () => {
            const component = {} as any;
            renderer.addKind([1], component, 0);

            const handler = renderer.getKindHandler(1);
            expect(handler?.priority).toBe(0);
        });

        it("should handle negative priority", () => {
            const component = {} as any;
            renderer.addKind([1], component, -5);

            const handler = renderer.getKindHandler(1);
            expect(handler?.priority).toBe(-5);
        });

        it("should handle very large kind numbers", () => {
            const component = {} as any;
            renderer.addKind([999999], component);

            expect(renderer.hasKindHandler(999999)).toBe(true);
        });

        it("should handle registering many kinds at once", () => {
            const kinds = Array.from({ length: 100 }, (_, i) => i);
            renderer.addKind(kinds, {} as any);

            expect(renderer.getRegisteredKinds().length).toBe(100);
        });

        it("should handle setting same inline component multiple times with same priority", () => {
            const component = {} as any;

            renderer.setMentionComponent(component, 5);
            renderer.setMentionComponent(component, 5);
            renderer.setMentionComponent(component, 5);

            expect(renderer.mentionComponent).toBe(component);
            expect(renderer.getInlinePriorities().mention).toBe(5);
        });
    });

    describe("blockNsfw property", () => {
        it("should default to true", () => {
            expect(renderer.blockNsfw).toBe(true);
        });

        it("should be mutable", () => {
            renderer.blockNsfw = false;
            expect(renderer.blockNsfw).toBe(false);

            renderer.blockNsfw = true;
            expect(renderer.blockNsfw).toBe(true);
        });

        it("should not be affected by clear()", () => {
            renderer.blockNsfw = false;
            renderer.clear();

            // blockNsfw is not reset by clear() - it's a config setting
            expect(renderer.blockNsfw).toBe(false);
        });
    });

    describe("complex scenarios", () => {
        it("should handle mixed wrapper and array registrations", () => {
            const wrapper: NDKWrapper = {
                kinds: [30023],
                from: (event: NDKEvent) => event,
            };
            const component1 = {} as any;
            const component2 = {} as any;

            renderer.addKind(wrapper, component1);
            renderer.addKind([1, 7], component2);

            expect(renderer.getRegisteredKinds()).toEqual([1, 7, 30023]);
            expect(renderer.getKindHandler(30023)?.wrapper).toBe(wrapper);
            expect(renderer.getKindHandler(1)?.wrapper).toBeNull();
        });

        it("should handle replacing wrapper with array registration", () => {
            const wrapper: NDKWrapper = {
                kinds: [1],
                from: (event: NDKEvent) => event,
            };
            const component1 = {} as any;
            const component2 = {} as any;

            renderer.addKind(wrapper, component1, 5);
            renderer.addKind([1], component2, 10);

            const handler = renderer.getKindHandler(1);
            expect(handler?.component).toBe(component2);
            expect(handler?.wrapper).toBeNull(); // Array registration has no wrapper
            expect(handler?.priority).toBe(10);
        });

        it("should handle replacing array with wrapper registration", () => {
            const wrapper: NDKWrapper = {
                kinds: [1],
                from: (event: NDKEvent) => event,
            };
            const component1 = {} as any;
            const component2 = {} as any;

            renderer.addKind([1], component1, 5);
            renderer.addKind(wrapper, component2, 10);

            const handler = renderer.getKindHandler(1);
            expect(handler?.component).toBe(component2);
            expect(handler?.wrapper).toBe(wrapper);
            expect(handler?.priority).toBe(10);
        });

        it("should handle all component types together", () => {
            const mention = {} as any;
            const hashtag = {} as any;
            const link = {} as any;
            const media = {} as any;
            const fallback = {} as any;
            const kindComponent = {} as any;

            renderer.setMentionComponent(mention, 5);
            renderer.setHashtagComponent(hashtag, 3);
            renderer.setLinkComponent(link, 7);
            renderer.setMediaComponent(media, 2);
            renderer.setFallbackComponent(fallback, 4);
            renderer.addKind([1, 7, 30023], kindComponent, 10);

            expect(renderer.mentionComponent).toBe(mention);
            expect(renderer.hashtagComponent).toBe(hashtag);
            expect(renderer.linkComponent).toBe(link);
            expect(renderer.mediaComponent).toBe(media);
            expect(renderer.fallbackComponent).toBe(fallback);
            expect(renderer.getRegisteredKinds()).toEqual([1, 7, 30023]);
        });
    });
});
