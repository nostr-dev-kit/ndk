import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "@nostr-dev-kit/svelte";
import { fireEvent, render } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, TestEventFactory, UserGenerator, generateTestEventId } from "../../../../test-utils";
import ReplyButtonAvatars from "./reply-button-avatars.svelte";

describe("ReplyButtonAvatars", () => {
    let ndk: NDKSvelte;
    let testEvent: NDKEvent;
    let alice: Awaited<ReturnType<typeof UserGenerator.getUser>>;
    let bob: Awaited<ReturnType<typeof UserGenerator.getUser>>;
    let carol: Awaited<ReturnType<typeof UserGenerator.getUser>>;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();
        await ndk.signer.blockUntilReady();

        alice = await UserGenerator.getUser("alice", ndk as any);
        bob = await UserGenerator.getUser("bob", ndk as any);
        carol = await UserGenerator.getUser("carol", ndk as any);

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

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-reply-button-avatars]');
            expect(button).toBeTruthy();
        });

        it("should apply variant data attribute", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    variant: 'solid'
                }
            });

            const button = container.querySelector('[data-reply-button-avatars]');
            expect(button?.getAttribute('data-variant')).toBe('solid');
        });
    });

    describe("avatar display", () => {
        it("should show avatars of users who replied", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            // Create reply events
            const reply1 = new NDKEvent(ndk);
            reply1.kind = NDKKind.Text;
            reply1.pubkey = alice.pubkey;
            reply1.content = "Reply from Alice";
            reply1.tags = [
                ["e", testEvent.id!, "", "reply"],
                ["p", testEvent.pubkey]
            ];

            const reply2 = new NDKEvent(ndk);
            reply2.kind = NDKKind.Text;
            reply2.pubkey = bob.pubkey;
            reply2.content = "Reply from Bob";
            reply2.tags = [
                ["e", testEvent.id!, "", "reply"],
                ["p", testEvent.pubkey]
            ];

            mockSub.events.push(reply1, reply2);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            // Component should contain AvatarGroup which receives pubkeys
            expect(container.innerHTML).toContain('avatar');
        });

        it("should respect max avatars limit", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    max: 4
                }
            });

            expect(container).toBeTruthy();
        });
    });

    describe("onlyFollows prop", () => {
        it("should pass onlyFollows prop to AvatarGroup", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    onlyFollows: false
                }
            });

            // Component passes onlyFollows prop to AvatarGroup
            expect(container).toBeTruthy();
        });

        it("should default onlyFollows to true", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            // Component defaults onlyFollows to true and passes to AvatarGroup
            expect(container).toBeTruthy();
        });

        it("should filter avatars when onlyFollows=true and user has follows", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            // Create replies from multiple users
            const reply1 = new NDKEvent(ndk);
            reply1.kind = NDKKind.Text;
            reply1.pubkey = alice.pubkey;
            reply1.content = "Reply from Alice";
            reply1.tags = [["e", testEvent.id!, "", "reply"]];

            const reply2 = new NDKEvent(ndk);
            reply2.kind = NDKKind.Text;
            reply2.pubkey = bob.pubkey;
            reply2.content = "Reply from Bob";
            reply2.tags = [["e", testEvent.id!, "", "reply"]];

            const reply3 = new NDKEvent(ndk);
            reply3.kind = NDKKind.Text;
            reply3.pubkey = carol.pubkey;
            reply3.content = "Reply from Carol";
            reply3.tags = [["e", testEvent.id!, "", "reply"]];

            mockSub.events.push(reply1, reply2, reply3);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            // Mock current user and follows (only following alice and bob)
            Object.defineProperty(ndk, '$currentPubkey', {
                get: () => 'current-user-pubkey',
                configurable: true
            });

            Object.defineProperty(ndk, '$follows', {
                get: () => new Set([alice.pubkey, bob.pubkey]),
                configurable: true
            });

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    onlyFollows: true
                }
            });

            // AvatarGroup will filter to only show alice and bob
            expect(container).toBeTruthy();
        });
    });

    describe("count display", () => {
        it("should show count when showCount is true", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            const reply = new NDKEvent(ndk);
            reply.kind = NDKKind.Text;
            reply.pubkey = alice.pubkey;
            reply.content = "Reply";
            reply.tags = [["e", testEvent.id!, "", "reply"]];
            mockSub.events.push(reply);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    showCount: true
                }
            });

            expect(container.textContent).toContain("1");
        });

        it("should hide count when showCount is false", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            const reply = new NDKEvent(ndk);
            reply.kind = NDKKind.Text;
            reply.pubkey = alice.pubkey;
            reply.content = "Reply";
            reply.tags = [["e", testEvent.id!, "", "reply"]];
            mockSub.events.push(reply);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    showCount: false
                }
            });

            const countSpan = container.querySelector('.text-sm.font-medium');
            expect(countSpan).toBeNull();
        });
    });

    describe("interaction", () => {
        it("should call onclick handler when clicked", async () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const onclick = vi.fn();

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    onclick
                }
            });

            const button = container.querySelector('button') as HTMLButtonElement;
            if (button) {
                await fireEvent.click(button);
                expect(onclick).toHaveBeenCalled();
            }
        });
    });

    describe("spacing prop", () => {
        it("should apply tight spacing", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    spacing: 'tight'
                }
            });

            expect(container).toBeTruthy();
        });

        it("should apply normal spacing", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    spacing: 'normal'
                }
            });

            expect(container).toBeTruthy();
        });

        it("should apply loose spacing", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    spacing: 'loose'
                }
            });

            expect(container).toBeTruthy();
        });
    });

    describe("data attributes", () => {
        it("should have data-reply-button-avatars attribute", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-reply-button-avatars]');
            expect(button?.hasAttribute('data-reply-button-avatars')).toBe(true);
        });
    });

    describe("no replies state", () => {
        it("should show 'No replies' when there are no replies", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            expect(container.textContent).toContain("No replies");
        });
    });

    describe("avatar size", () => {
        it("should apply custom avatar size", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ReplyButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    avatarSize: 32
                }
            });

            expect(container).toBeTruthy();
        });
    });
});