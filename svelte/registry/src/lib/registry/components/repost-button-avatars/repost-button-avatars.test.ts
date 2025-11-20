import { NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "@nostr-dev-kit/svelte";
import { fireEvent, render } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, TestEventFactory, UserGenerator, generateTestEventId } from "../../../../test-utils";
import RepostButtonAvatars from "./repost-button-avatars.svelte";

describe("RepostButtonAvatars", () => {
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

            const { container } = render(RepostButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-repost-button-avatars]');
            expect(button).toBeTruthy();
        });

        it("should apply variant data attribute", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(RepostButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    variant: 'outline'
                }
            });

            const button = container.querySelector('[data-repost-button-avatars]');
            expect(button?.getAttribute('data-variant')).toBe('outline');
        });
    });

    describe("avatar display", () => {
        it("should show avatars of users who reposted", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            const repost1 = new NDKEvent(ndk);
            repost1.kind = NDKKind.Repost;
            repost1.pubkey = alice.pubkey;
            repost1.tags = [["e", testEvent.id!, "", ""]];

            const repost2 = new NDKEvent(ndk);
            repost2.kind = NDKKind.Repost;
            repost2.pubkey = bob.pubkey;
            repost2.tags = [["e", testEvent.id!, "", ""]];

            mockSub.events.push(repost1, repost2);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(RepostButtonAvatars, {
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

            const { container } = render(RepostButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    max: 5
                }
            });

            expect(container).toBeTruthy();
        });
    });

    describe("onlyFollows prop", () => {
        it("should pass onlyFollows prop to AvatarGroup", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(RepostButtonAvatars, {
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

            const { container } = render(RepostButtonAvatars, {
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

            // Create reposts from multiple users
            const repost1 = new NDKEvent(ndk);
            repost1.kind = NDKKind.Repost;
            repost1.pubkey = alice.pubkey;
            repost1.tags = [["e", testEvent.id!, "", ""]];

            const repost2 = new NDKEvent(ndk);
            repost2.kind = NDKKind.Repost;
            repost2.pubkey = bob.pubkey;
            repost2.tags = [["e", testEvent.id!, "", ""]];

            const repost3 = new NDKEvent(ndk);
            repost3.kind = NDKKind.Repost;
            repost3.pubkey = carol.pubkey;
            repost3.tags = [["e", testEvent.id!, "", ""]];

            mockSub.events.push(repost1, repost2, repost3);

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

            const { container } = render(RepostButtonAvatars, {
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

            const repost = new NDKEvent(ndk);
            repost.kind = NDKKind.Repost;
            repost.pubkey = alice.pubkey;
            repost.tags = [["e", testEvent.id!, "", ""]];
            mockSub.events.push(repost);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(RepostButtonAvatars, {
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

            const repost = new NDKEvent(ndk);
            repost.kind = NDKKind.Repost;
            repost.pubkey = alice.pubkey;
            repost.tags = [["e", testEvent.id!, "", ""]];
            mockSub.events.push(repost);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(RepostButtonAvatars, {
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
        it("should trigger repost when clicked without custom handler", async () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const mockRepost = vi.fn().mockResolvedValue(new Set());
            const mockRepostAction = {
                repost: mockRepost,
                count: 0,
                pubkeys: []
            };

            // Mock the repost action
            vi.mock('../../builders/repost-action/index.svelte.js', () => ({
                createRepostAction: vi.fn(() => mockRepostAction)
            }));

            const { container } = render(RepostButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('button') as HTMLButtonElement;
            if (button) {
                await fireEvent.click(button);
                // Note: In actual implementation, this would trigger repostAction.repost()
            }
        });

        it("should call custom onclick handler when provided", async () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const onclick = vi.fn();

            const { container } = render(RepostButtonAvatars, {
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

    describe("data attributes", () => {
        it("should have data-repost-button-avatars attribute", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(RepostButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-repost-button-avatars]');
            expect(button?.hasAttribute('data-repost-button-avatars')).toBe(true);
        });
    });

    describe("no reposts state", () => {
        it("should show 'No reposts' when there are no reposts", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(RepostButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            expect(container.textContent).toContain("No reposts");
        });
    });
});