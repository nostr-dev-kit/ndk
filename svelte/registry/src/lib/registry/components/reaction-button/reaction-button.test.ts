import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "@nostr-dev-kit/svelte";
import { render, screen } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, TestEventFactory, UserGenerator, generateTestEventId } from "../../../../test-utils";
import ReactionButton from "./reaction-button.svelte";

describe("ReactionButton", () => {
    let ndk: NDKSvelte;
    let testEvent: NDKEvent;
    let alice: Awaited<ReturnType<typeof UserGenerator.getUser>>;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();
        await ndk.signer.blockUntilReady();

        alice = await UserGenerator.getUser("alice", ndk as any);

        const factory = new TestEventFactory(ndk as any);
        testEvent = await factory.createSignedTextNote("Test note", "alice");
        testEvent.id = generateTestEventId("note1");
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("rendering", () => {
        it("should render button with data attributes", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-reaction-button]');
            expect(button).toBeTruthy();
            expect(button?.tagName).toBe('BUTTON');
        });

        it("should render with default heart emoji", () => {
            render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = screen.getByRole('button');
            expect(button).toBeTruthy();

            // Should have SVG heart icon
            const svg = button.querySelector('svg');
            expect(svg).toBeTruthy();
        });

        it("should show count when showCount is true (default)", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            // Add a reaction to show count
            const reaction = new NDKEvent(ndk);
            reaction.kind = NDKKind.Reaction;
            reaction.content = "❤️";
            reaction.pubkey = alice.pubkey;
            reaction.tags = [["e", testEvent.id!]];
            mockSub.events.push(reaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const count = container.querySelector('span');
            expect(count?.textContent).toBe("1");
        });

        it("should hide count when showCount is false", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            const reaction = new NDKEvent(ndk);
            reaction.kind = NDKKind.Reaction;
            reaction.content = "❤️";
            reaction.pubkey = alice.pubkey;
            reaction.tags = [["e", testEvent.id!]];
            mockSub.events.push(reaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent,
                    showCount: false
                }
            });

            const count = container.querySelector('span');
            expect(count).toBeNull();
        });

        it("should not show count when count is 0", () => {
            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const count = container.querySelector('span');
            expect(count).toBeNull();
        });
    });

    describe("variants", () => {
        it("should apply ghost variant by default", () => {
            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-reaction-button]');
            expect(button?.getAttribute('data-variant')).toBe('ghost');
        });

        it("should apply outline variant", () => {
            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent,
                    variant: 'outline'
                }
            });

            const button = container.querySelector('[data-reaction-button]');
            expect(button?.getAttribute('data-variant')).toBe('outline');
        });

        it("should apply pill variant", () => {
            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent,
                    variant: 'pill'
                }
            });

            const button = container.querySelector('[data-reaction-button]');
            expect(button?.getAttribute('data-variant')).toBe('pill');
        });

        it("should apply solid variant", () => {
            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent,
                    variant: 'solid'
                }
            });

            const button = container.querySelector('[data-reaction-button]');
            expect(button?.getAttribute('data-variant')).toBe('solid');
        });
    });

    describe("reacted state", () => {
        it("should show data-reacted when user has reacted", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            // Current user reaction
            const reaction = new NDKEvent(ndk);
            reaction.kind = NDKKind.Reaction;
            reaction.content = "❤️";
            reaction.pubkey = ndk.$currentPubkey!;
            reaction.tags = [["e", testEvent.id!]];
            mockSub.events.push(reaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-reaction-button]');
            expect(button?.hasAttribute('data-reacted')).toBe(true);
        });

        it("should not show data-reacted when user has not reacted", async () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            // Other user reaction
            const reaction = new NDKEvent(ndk);
            reaction.kind = NDKKind.Reaction;
            reaction.content = "❤️";
            reaction.pubkey = alice.pubkey;
            reaction.tags = [["e", testEvent.id!]];
            mockSub.events.push(reaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            flushSync();

            const button = container.querySelector('[data-reaction-button]');
            expect(button?.hasAttribute('data-reacted')).toBe(false);
        });

        it("should fill heart icon when reacted", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            const reaction = new NDKEvent(ndk);
            reaction.kind = NDKKind.Reaction;
            reaction.content = "❤️";
            reaction.pubkey = ndk.$currentPubkey!;
            reaction.tags = [["e", testEvent.id!]];
            mockSub.events.push(reaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const svg = container.querySelector('svg');
            expect(svg?.getAttribute('fill')).toBe('currentColor');
        });

        it("should not fill heart icon when not reacted", () => {
            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const svg = container.querySelector('svg');
            expect(svg?.getAttribute('fill')).toBe('none');
        });
    });

    describe("count modes", () => {
        it("should show total count in total mode (default)", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            // Add various emoji reactions
            const heart = new NDKEvent(ndk);
            heart.kind = NDKKind.Reaction;
            heart.content = "❤️";
            heart.pubkey = alice.pubkey;
            heart.tags = [["e", testEvent.id!]];

            const fire = new NDKEvent(ndk);
            fire.kind = NDKKind.Reaction;
            fire.content = "🔥";
            fire.pubkey = "another-pubkey";
            fire.tags = [["e", testEvent.id!]];

            mockSub.events.push(heart, fire);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent,
                    emoji: "❤️",
                    countMode: 'total'
                }
            });

            const count = container.querySelector('span');
            expect(count?.textContent).toBe("2"); // Total of all reactions
        });

        it("should show emoji-specific count in emoji mode", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            const heart = new NDKEvent(ndk);
            heart.kind = NDKKind.Reaction;
            heart.content = "❤️";
            heart.pubkey = alice.pubkey;
            heart.tags = [["e", testEvent.id!]];

            const fire = new NDKEvent(ndk);
            fire.kind = NDKKind.Reaction;
            fire.content = "🔥";
            fire.pubkey = "another-pubkey";
            fire.tags = [["e", testEvent.id!]];

            mockSub.events.push(heart, fire);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent,
                    emoji: "❤️",
                    countMode: 'emoji'
                }
            });

            const count = container.querySelector('span');
            expect(count?.textContent).toBe("1"); // Only heart reactions
        });
    });

    describe("interaction", () => {
        it("should call react when clicked", async () => {
            const user = userEvent.setup();

            const mockPublish = vi.fn().mockResolvedValue(new Set());
            const mockReactionEvent = new NDKEvent(ndk);
            mockReactionEvent.publish = mockPublish;

            vi.spyOn(testEvent, "react").mockResolvedValue(mockReactionEvent);

            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-reaction-button]') as HTMLButtonElement;
            await user.click(button);

            flushSync();

            expect(testEvent.react).toHaveBeenCalledWith("❤️", false);
        });

        it("should call custom onclick handler when provided", async () => {
            const user = userEvent.setup();
            const onclickSpy = vi.fn();

            const mockPublish = vi.fn().mockResolvedValue(new Set());
            const mockReactionEvent = new NDKEvent(ndk);
            mockReactionEvent.publish = mockPublish;

            vi.spyOn(testEvent, "react").mockResolvedValue(mockReactionEvent);

            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent,
                    onclick: onclickSpy
                }
            });

            const button = container.querySelector('[data-reaction-button]') as HTMLButtonElement;
            await user.click(button);

            flushSync();

            expect(onclickSpy).toHaveBeenCalled();
        });

        it("should react with custom emoji when provided", async () => {
            const user = userEvent.setup();

            const mockPublish = vi.fn().mockResolvedValue(new Set());
            const mockReactionEvent = new NDKEvent(ndk);
            mockReactionEvent.publish = mockPublish;

            vi.spyOn(testEvent, "react").mockResolvedValue(mockReactionEvent);

            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent,
                    emoji: "🔥"
                }
            });

            const button = container.querySelector('[data-reaction-button]') as HTMLButtonElement;
            await user.click(button);

            flushSync();

            expect(testEvent.react).toHaveBeenCalledWith("🔥", false);
        });
    });

    describe("accessibility", () => {
        it("should have aria-label with count", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            const reaction = new NDKEvent(ndk);
            reaction.kind = NDKKind.Reaction;
            reaction.content = "❤️";
            reaction.pubkey = alice.pubkey;
            reaction.tags = [["e", testEvent.id!]];
            mockSub.events.push(reaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-reaction-button]');
            expect(button?.getAttribute('aria-label')).toBe('React (1)');
        });

        it("should have aria-label with zero when no reactions", () => {
            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-reaction-button]');
            expect(button?.getAttribute('aria-label')).toBe('React (0)');
        });
    });

    describe("custom styling", () => {
        it("should apply custom class", () => {
            const { container } = render(ReactionButton, {
                props: {
                    ndk,
                    event: testEvent,
                    class: "my-custom-class"
                }
            });

            const button = container.querySelector('[data-reaction-button]');
            expect(button?.classList.contains('my-custom-class')).toBe(true);
        });
    });
});
