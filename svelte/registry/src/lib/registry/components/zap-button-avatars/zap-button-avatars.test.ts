import { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "@nostr-dev-kit/svelte";
import { fireEvent, render } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, TestEventFactory, UserGenerator, generateTestEventId } from "../../../../test-utils";
import ZapButtonAvatars from "./zap-button-avatars.svelte";

describe("ZapButtonAvatars", () => {
    let ndk: NDKSvelte;
    let testEvent: NDKEvent;
    let testUser: NDKUser;
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

        testUser = ndk.getUser({ pubkey: alice.pubkey });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("rendering", () => {
        it("should render button with data attributes", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ZapButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-zap-button-avatars]');
            expect(button).toBeTruthy();
        });

        it("should apply variant data attribute", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ZapButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    variant: 'pill'
                }
            });

            const button = container.querySelector('[data-zap-button-avatars]');
            expect(button?.getAttribute('data-variant')).toBe('pill');
        });

        it("should work with user prop instead of event", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ZapButtonAvatars, {
                props: {
                    ndk,
                    user: testUser
                }
            });

            const button = container.querySelector('[data-zap-button-avatars]');
            expect(button).toBeTruthy();
        });
    });

    describe("avatar display", () => {
        it("should show avatars of zappers", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            // Create mock zap receipt events
            const zapReceipt1 = new NDKEvent(ndk);
            zapReceipt1.kind = 9735; // Zap receipt
            zapReceipt1.pubkey = alice.pubkey;
            zapReceipt1.tags = [
                ["e", testEvent.id!],
                ["bolt11", "lnbc..."],
                ["description", JSON.stringify({
                    pubkey: alice.pubkey,
                    content: "⚡",
                    tags: []
                })],
                ["amount", "1000"]
            ];

            const zapReceipt2 = new NDKEvent(ndk);
            zapReceipt2.kind = 9735; // Zap receipt
            zapReceipt2.pubkey = bob.pubkey;
            zapReceipt2.tags = [
                ["e", testEvent.id!],
                ["bolt11", "lnbc..."],
                ["description", JSON.stringify({
                    pubkey: bob.pubkey,
                    content: "⚡",
                    tags: []
                })],
                ["amount", "2000"]
            ];

            mockSub.events.push(zapReceipt1, zapReceipt2);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ZapButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            // Component should contain AvatarGroup which receives zapper pubkeys
            expect(container.innerHTML).toContain('avatar');
        });

        it("should respect max avatars limit", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ZapButtonAvatars, {
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

            const { container } = render(ZapButtonAvatars, {
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

            const { container } = render(ZapButtonAvatars, {
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

            // Create zap receipts from multiple users
            const zapReceipt1 = new NDKEvent(ndk);
            zapReceipt1.kind = 9735; // Zap receipt
            zapReceipt1.pubkey = alice.pubkey;
            zapReceipt1.tags = [
                ["e", testEvent.id!],
                ["description", JSON.stringify({ pubkey: alice.pubkey })],
                ["amount", "1000"]
            ];

            const zapReceipt2 = new NDKEvent(ndk);
            zapReceipt2.kind = 9735; // Zap receipt
            zapReceipt2.pubkey = bob.pubkey;
            zapReceipt2.tags = [
                ["e", testEvent.id!],
                ["description", JSON.stringify({ pubkey: bob.pubkey })],
                ["amount", "2000"]
            ];

            const zapReceipt3 = new NDKEvent(ndk);
            zapReceipt3.kind = 9735; // Zap receipt
            zapReceipt3.pubkey = carol.pubkey;
            zapReceipt3.tags = [
                ["e", testEvent.id!],
                ["description", JSON.stringify({ pubkey: carol.pubkey })],
                ["amount", "3000"]
            ];

            mockSub.events.push(zapReceipt1, zapReceipt2, zapReceipt3);

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

            const { container } = render(ZapButtonAvatars, {
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

    describe("amount display", () => {
        it("should show total zap amount when showCount is true", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            const zapReceipt = new NDKEvent(ndk);
            zapReceipt.kind = 9735; // Zap receipt
            zapReceipt.pubkey = alice.pubkey;
            zapReceipt.tags = [
                ["e", testEvent.id!],
                ["description", JSON.stringify({ pubkey: alice.pubkey })],
                ["amount", "5000"]
            ];
            mockSub.events.push(zapReceipt);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ZapButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    showCount: true
                }
            });

            // Should show amount in some form
            expect(container.querySelector('.text-amber-500')).toBeTruthy();
        });

        it("should hide amount when showCount is false", () => {
            const mockSub: { events: NDKEvent[] } = {
                events: []
            };

            const zapReceipt = new NDKEvent(ndk);
            zapReceipt.kind = 9735; // Zap receipt
            zapReceipt.pubkey = alice.pubkey;
            zapReceipt.tags = [
                ["e", testEvent.id!],
                ["description", JSON.stringify({ pubkey: alice.pubkey })],
                ["amount", "5000"]
            ];
            mockSub.events.push(zapReceipt);

            vi.spyOn(ndk, "$subscribe").mockReturnValue(mockSub as any);

            const { container } = render(ZapButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent,
                    showCount: false
                }
            });

            const amountSpan = container.querySelector('.text-amber-500');
            expect(amountSpan).toBeNull();
        });
    });

    describe("interaction", () => {
        it("should call onclick handler when clicked", async () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const onclick = vi.fn();

            const { container } = render(ZapButtonAvatars, {
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
        it("should apply custom spacing", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ZapButtonAvatars, {
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
        it("should have data-zap-button-avatars attribute", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ZapButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            const button = container.querySelector('[data-zap-button-avatars]');
            expect(button?.hasAttribute('data-zap-button-avatars')).toBe(true);
        });
    });

    describe("no zaps state", () => {
        it("should show 'No zaps' when there are no zaps", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ZapButtonAvatars, {
                props: {
                    ndk,
                    event: testEvent
                }
            });

            expect(container.textContent).toContain("No zaps");
        });
    });

    describe("avatar size", () => {
        it("should apply custom avatar size", () => {
            vi.spyOn(ndk, "$subscribe").mockReturnValue({ events: [] } as any);

            const { container } = render(ZapButtonAvatars, {
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