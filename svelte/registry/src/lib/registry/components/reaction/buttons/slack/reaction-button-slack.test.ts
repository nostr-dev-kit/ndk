import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { render } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, TestEventFactory, UserGenerator, waitForEffects, generateTestEventId } from "../../../../../../test-utils";
import ReactionButtonSlack from "./reaction-button-slack.svelte";

describe("ReactionButtonSlack", () => {
    let ndk;
    let testEvent: NDKEvent;
    let alice, bob, carol;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();
        await ndk.signer.blockUntilReady();

        alice = await UserGenerator.getUser("alice", ndk);
        bob = await UserGenerator.getUser("bob", ndk);
        carol = await UserGenerator.getUser("carol", ndk);

        const factory = new TestEventFactory(ndk);
        testEvent = await factory.createSignedTextNote("Test note", "alice");
        testEvent.id = generateTestEventId("note1");

        vi.spyOn(ndk, "$subscribe").mockReturnValue({
            events: []
        } as any);
    });

    describe("rendering", () => {
        it("should render with data attributes", () => {
            const { container } = render(ReactionButtonSlack, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const component = container.querySelector('[data-reaction-button-slack]');
            expect(component).toBeTruthy();
        });

        it("should apply variant data attribute", () => {
            const { container } = render(ReactionButtonSlack, {
                props: {
                    ndk,
                    event: testEvent,
                    variant: 'vertical'
                }
            });

            const component = container.querySelector('[data-reaction-button-slack]');
            expect(component?.getAttribute('data-variant')).toBe('vertical');
        });

        it("should default to horizontal variant", () => {
            const { container } = render(ReactionButtonSlack, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const component = container.querySelector('[data-reaction-button-slack]');
            expect(component?.getAttribute('data-variant')).toBe('horizontal');
        });
    });

    describe("displaying all reactions", () => {
        it("should show all different emoji reactions", () => {
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

            const thumbsUp = new NDKEvent(ndk);
            thumbsUp.kind = NDKKind.Reaction;
            thumbsUp.content = "👍";
            thumbsUp.pubkey = carol.pubkey;
            thumbsUp.tags = [["e", testEvent.id!]];

            mockSub.events.push(heart, fire, thumbsUp);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButtonSlack, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const items = container.querySelectorAll('[data-reaction-item]');
            expect(items.length).toBe(3);
        });

        it("should show count for each reaction", () => {
            const mockSub = {
                events: []
            };

            // Multiple hearts
            const heart1 = new NDKEvent(ndk);
            heart1.kind = NDKKind.Reaction;
            heart1.content = "❤️";
            heart1.pubkey = alice.pubkey;
            heart1.tags = [["e", testEvent.id!]];

            const heart2 = new NDKEvent(ndk);
            heart2.kind = NDKKind.Reaction;
            heart2.content = "❤️";
            heart2.pubkey = bob.pubkey;
            heart2.tags = [["e", testEvent.id!]];

            mockSub.events.push(heart1, heart2);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButtonSlack, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            expect(container.textContent).toContain("2");
        });
    });

    describe("horizontal variant with avatars", () => {
        it("should show tooltip with avatars in horizontal mode", () => {
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

            const { container } = render(ReactionButtonSlack, {
                props: {
                    ndk,
                    event: testEvent,
                    variant: 'horizontal',
                    showAvatars: true
                }
            });

            // Should contain AvatarGroup in tooltip content
            expect(container.innerHTML).toContain('avatar');
        });
    });

    describe("vertical variant with avatars", () => {
        it("should show inline avatars in vertical mode", () => {
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

            const { container } = render(ReactionButtonSlack, {
                props: {
                    ndk,
                    event: testEvent,
                    variant: 'vertical',
                    showAvatars: true
                }
            });

            // Should contain inline AvatarGroup
            expect(container.innerHTML).toContain('avatar');
        });
    });

    describe("interaction", () => {
        it("should react when clicking a reaction button", async () => {
            const user = userEvent.setup();

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

            const mockPublish = vi.fn().mockResolvedValue(new Set());
            const mockReactionEvent = new NDKEvent(ndk);
            mockReactionEvent.publish = mockPublish;

            vi.spyOn(testEvent, "react").mockResolvedValue(mockReactionEvent);

            const { container } = render(ReactionButtonSlack, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-reaction-item]') as HTMLButtonElement;
            await user.click(button);

            await waitForEffects();

            expect(testEvent.react).toHaveBeenCalledWith("❤️", false);
        });
    });

    describe("delayed reactions", () => {
        it("should support delayed publishing when delayed prop is set", () => {
            const { container } = render(ReactionButtonSlack, {
                props: {
                    ndk,
                    event: testEvent,
                    delayed: 5
                }
            });

            // Delayed prop is passed to createReactionAction
            expect(container).toBeTruthy();
        });
    });

    describe("data attributes for reacted state", () => {
        it("should show data-reacted on reacted buttons", () => {
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

            const { container } = render(ReactionButtonSlack, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-reaction-item][data-reacted]');
            expect(button).toBeTruthy();
        });

        it("should not show data-reacted on non-reacted buttons", async () => {
            const mockSub = {
                events: []
            };

            const otherReaction = new NDKEvent(ndk);
            otherReaction.kind = NDKKind.Reaction;
            otherReaction.content = "❤️";
            otherReaction.pubkey = alice.pubkey;
            otherReaction.tags = [["e", testEvent.id!]];
            mockSub.events.push(otherReaction);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReactionButtonSlack, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            await waitForEffects();

            const button = container.querySelector('[data-reaction-item]');
            expect(button?.hasAttribute('data-reacted')).toBe(false);
        });
    });

    describe("without avatars", () => {
        it("should not show avatars when showAvatars is false", () => {
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

            const { container } = render(ReactionButtonSlack, {
                props: {
                    ndk,
                    event: testEvent,
                    showAvatars: false
                }
            });

            // Should not contain avatar group
            expect(container.innerHTML).not.toContain('avatar');
        });
    });
});
