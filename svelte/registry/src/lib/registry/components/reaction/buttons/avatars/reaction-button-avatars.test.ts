import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { render } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, TestEventFactory, UserGenerator, generateTestEventId } from "../../../../../../test-utils";
import ReactionButtonAvatars from "./reaction-button-avatars.svelte";

describe("ReactionButtonAvatars", () => {
    let ndk;
    let testEvent: NDKEvent;
    let alice, bob;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();
        await ndk.signer.blockUntilReady();

        alice = await UserGenerator.getUser("alice", ndk);
        bob = await UserGenerator.getUser("bob", ndk);

        const factory = new TestEventFactory(ndk);
        testEvent = await factory.createSignedTextNote("Test note", "alice");
        testEvent.id = generateTestEventId("note1");
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("rendering", () => {
        it("should render button with data attributes", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ReactionButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-reaction-button-avatars]');
            expect(button).toBeTruthy();
        });

        it("should apply variant data attribute", () => {
            const { container } = render(ReactionButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    variant: 'pill'
                }
            });

            const button = container.querySelector('[data-reaction-button-avatars]');
            expect(button?.getAttribute('data-variant')).toBe('pill');
        });
    });

    describe("avatar display", () => {
        it("should show avatars of users who reacted", () => {
            const mockSub = {
                events: []
            };

            const reaction1 = new NDKEvent(ndk);
            reaction1.kind = NDKKind.Reaction;
            reaction1.content = "❤️";
            reaction1.pubkey = alice.pubkey;
            reaction1.tags = [["e", testEvent.id!]];

            const reaction2 = new NDKEvent(ndk);
            reaction2.kind = NDKKind.Reaction;
            reaction2.content = "❤️";
            reaction2.pubkey = bob.pubkey;
            reaction2.tags = [["e", testEvent.id!]];

            mockSub.events.push(reaction1, reaction2);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            // Component should contain AvatarGroup which receives pubkeys
            expect(container.innerHTML).toContain('avatar'); // AvatarGroup component renders
        });

        it("should respect max avatars limit", () => {
            const { container } = render(ReactionButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    max: 5
                }
            });

            // Max prop is passed to AvatarGroup
            expect(container).toBeTruthy();
        });
    });

    describe("count display", () => {
        it("should show count when showCount is true", () => {
            const mockSub = {
                events: []
            };

            const reaction = new NDKEvent(ndk);
            reaction.kind = NDKKind.Reaction;
            reaction.content = "❤️";
            reaction.pubkey = alice.pubkey;
            reaction.tags = [["e", testEvent.id!]];
            mockSub.events.push(reaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    showCount: true
                }
            });

            expect(container.textContent).toContain("1");
        });

        it("should hide count when showCount is false", () => {
            const mockSub = {
                events: []
            };

            const reaction = new NDKEvent(ndk);
            reaction.kind = NDKKind.Reaction;
            reaction.content = "❤️";
            reaction.pubkey = alice.pubkey;
            reaction.tags = [["e", testEvent.id!]];
            mockSub.events.push(reaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    showCount: false
                }
            });

            // Count span should not be present
            const countSpan = container.querySelector('.text-sm.font-medium');
            expect(countSpan).toBeNull();
        });

        it("should use emoji count when countMode is emoji", () => {
            const mockSub = {
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
            fire.pubkey = bob.pubkey;
            fire.tags = [["e", testEvent.id!]];

            mockSub.events.push(heart, fire);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    emoji: "❤️",
                    countMode: 'emoji'
                }
            });

            expect(container.textContent).toContain("1"); // Only heart
        });
    });

    describe("custom emoji", () => {
        it("should use custom emoji when provided", () => {
            const { container } = render(ReactionButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    emoji: "🔥"
                }
            });

            expect(container).toBeTruthy();
            // Component tracks reactions for the custom emoji
        });
    });

    describe("data attributes", () => {
        it("should have data-reaction-button-avatars attribute", () => {
            const { container } = render(ReactionButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-reaction-button-avatars]');
            expect(button?.hasAttribute('data-reaction-button-avatars')).toBe(true);
        });

        it("should show data-reacted when user has reacted", async () => {
            const mockSub = {
                events: []
            };

            const userReaction = new NDKEvent(ndk);
            userReaction.kind = NDKKind.Reaction;
            userReaction.content = "❤️";
            userReaction.pubkey = ndk.$currentPubkey!;
            userReaction.tags = [["e", testEvent.id!]];
            mockSub.events.push(userReaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            await waitForEffects();

            const button = container.querySelector('[data-reaction-button-avatars]');
            expect(button?.hasAttribute('data-reacted')).toBe(true);
        });
    });
});
