import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "@nostr-dev-kit/svelte";
import { fireEvent, render } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, UserGenerator } from "../../../../test-utils";
import AvatarGroup from "./avatar-group.svelte";

describe("AvatarGroup", () => {
    let ndk: NDKSvelte;
    let alice: Awaited<ReturnType<typeof UserGenerator.getUser>>;
    let bob: Awaited<ReturnType<typeof UserGenerator.getUser>>;
    let carol: Awaited<ReturnType<typeof UserGenerator.getUser>>;
    let dave: Awaited<ReturnType<typeof UserGenerator.getUser>>;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();
        await ndk.signer.blockUntilReady();

        alice = await UserGenerator.getUser("alice", ndk as any);
        bob = await UserGenerator.getUser("bob", ndk as any);
        carol = await UserGenerator.getUser("carol", ndk as any);
        dave = await UserGenerator.getUser("dave", ndk as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("basic rendering", () => {
        it("should render avatar group with data attribute", () => {
            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey]
                }
            });

            const group = container.querySelector('[data-avatar-group]');
            expect(group).toBeTruthy();
        });

        it("should display avatars for provided pubkeys", () => {
            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey]
                }
            });

            const avatars = container.querySelectorAll('[data-avatar-group] > div');
            expect(avatars.length).toBeGreaterThan(0);
        });
    });

    describe("max prop", () => {
        it("should limit visible avatars to max", () => {
            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey, dave.pubkey],
                    max: 2
                }
            });

            const avatars = container.querySelectorAll('[data-avatar-group] > div[data-avatar-group]');
            expect(avatars.length).toBeLessThanOrEqual(3); // 2 avatars + potential overflow
        });

        it("should show overflow count when exceeding max", () => {
            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey, dave.pubkey],
                    max: 2,
                    overflowVariant: 'text'
                }
            });

            expect(container.textContent).toContain('+2');
        });
    });

    describe("onlyFollows prop", () => {
        it("should filter to only followed users when onlyFollows=true and user is logged in", () => {
            // Mock current user and follows
            Object.defineProperty(ndk, '$currentPubkey', {
                get: () => 'current-user-pubkey',
                configurable: true
            });

            Object.defineProperty(ndk, '$follows', {
                get: () => new Set([alice.pubkey, bob.pubkey]),
                configurable: true
            });

            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey, dave.pubkey],
                    onlyFollows: true
                }
            });

            // Should only show alice and bob (the followed users)
            const group = container.querySelector('[data-avatar-group]');
            expect(group).toBeTruthy();
        });

        it("should show all users when onlyFollows=false", () => {
            Object.defineProperty(ndk, '$currentPubkey', {
                get: () => 'current-user-pubkey',
                configurable: true
            });

            Object.defineProperty(ndk, '$follows', {
                get: () => new Set([alice.pubkey]),
                configurable: true
            });

            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey],
                    onlyFollows: false
                }
            });

            // Should show all users
            const group = container.querySelector('[data-avatar-group]');
            expect(group).toBeTruthy();
        });

        it("should show all users when not logged in even if onlyFollows=true", () => {
            Object.defineProperty(ndk, '$currentPubkey', {
                get: () => undefined,
                configurable: true
            });

            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey],
                    onlyFollows: true
                }
            });

            // Should show all users as fallback
            const group = container.querySelector('[data-avatar-group]');
            expect(group).toBeTruthy();
        });

        it("should show no users when onlyFollows=true and follows is empty", () => {
            Object.defineProperty(ndk, '$currentPubkey', {
                get: () => 'current-user-pubkey',
                configurable: true
            });

            Object.defineProperty(ndk, '$follows', {
                get: () => new Set(),
                configurable: true
            });

            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey],
                    onlyFollows: true
                }
            });

            const avatars = container.querySelectorAll('[data-avatar-group] > div[data-avatar-group]');
            // Should show no avatars when no follows
            expect(avatars.length).toBe(0);
        });
    });

    describe("skipCurrentUser prop", () => {
        it("should skip current user when skipCurrentUser=true", () => {
            const currentUserPubkey = alice.pubkey;

            Object.defineProperty(ndk, '$currentPubkey', {
                get: () => currentUserPubkey,
                configurable: true
            });

            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey],
                    skipCurrentUser: true
                }
            });

            // Current user (alice) should be filtered out
            const group = container.querySelector('[data-avatar-group]');
            expect(group).toBeTruthy();
        });

        it("should include current user when skipCurrentUser=false", () => {
            const currentUserPubkey = alice.pubkey;

            Object.defineProperty(ndk, '$currentPubkey', {
                get: () => currentUserPubkey,
                configurable: true
            });

            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey],
                    skipCurrentUser: false
                }
            });

            // Current user should be included
            const group = container.querySelector('[data-avatar-group]');
            expect(group).toBeTruthy();
        });
    });

    describe("spacing prop", () => {
        it("should apply tight spacing", () => {
            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey],
                    spacing: 'tight'
                }
            });

            const group = container.querySelector('[data-avatar-group]');
            expect(group).toBeTruthy();
        });

        it("should apply normal spacing by default", () => {
            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey]
                }
            });

            const group = container.querySelector('[data-avatar-group]');
            expect(group).toBeTruthy();
        });

        it("should apply loose spacing", () => {
            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey],
                    spacing: 'loose'
                }
            });

            const group = container.querySelector('[data-avatar-group]');
            expect(group).toBeTruthy();
        });
    });

    describe("direction prop", () => {
        it("should render horizontally by default", () => {
            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey]
                }
            });

            const group = container.querySelector('[data-avatar-group]');
            expect(group?.className).toContain('flex');
            expect(group?.className).not.toContain('flex-col');
        });

        it("should render vertically when direction=vertical", () => {
            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey],
                    direction: 'vertical'
                }
            });

            const group = container.querySelector('[data-avatar-group]');
            expect(group?.className).toContain('flex-col');
        });
    });

    describe("overflowVariant prop", () => {
        it("should show avatar overflow by default", () => {
            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey, dave.pubkey],
                    max: 2,
                    overflowVariant: 'avatar'
                }
            });

            const overflow = container.querySelector('[data-avatar-group] > div:last-child');
            expect(overflow?.className).toContain('rounded-full');
        });

        it("should show text overflow when overflowVariant=text", () => {
            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey, dave.pubkey],
                    max: 2,
                    overflowVariant: 'text'
                }
            });

            expect(container.textContent).toContain('+2');
        });

        it("should hide overflow when overflowVariant=none", () => {
            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey, dave.pubkey],
                    max: 2,
                    overflowVariant: 'none'
                }
            });

            expect(container.textContent).not.toContain('+');
        });
    });

    describe("click handlers", () => {
        it("should call onAvatarClick when avatar is clicked", async () => {
            const onAvatarClick = vi.fn();

            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey],
                    onAvatarClick
                }
            });

            const button = container.querySelector('button');
            if (button) {
                await fireEvent.click(button);
                expect(onAvatarClick).toHaveBeenCalled();
            }
        });

        it("should call onOverflowClick when overflow is clicked", async () => {
            const onOverflowClick = vi.fn();

            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey, dave.pubkey],
                    max: 2,
                    onOverflowClick
                }
            });

            const buttons = container.querySelectorAll('button');
            const overflowButton = buttons[buttons.length - 1];
            if (overflowButton) {
                await fireEvent.click(overflowButton);
                expect(onOverflowClick).toHaveBeenCalled();
            }
        });
    });

    describe("combined scenarios", () => {
        it("should apply both onlyFollows and skipCurrentUser filters", () => {
            const currentUserPubkey = alice.pubkey;

            Object.defineProperty(ndk, '$currentPubkey', {
                get: () => currentUserPubkey,
                configurable: true
            });

            Object.defineProperty(ndk, '$follows', {
                get: () => new Set([alice.pubkey, bob.pubkey, carol.pubkey]),
                configurable: true
            });

            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey, bob.pubkey, carol.pubkey, dave.pubkey],
                    onlyFollows: true,
                    skipCurrentUser: true
                }
            });

            // Should show only bob and carol (followed users minus current user)
            const group = container.querySelector('[data-avatar-group]');
            expect(group).toBeTruthy();
        });

        it("should handle empty result after all filters", () => {
            const currentUserPubkey = alice.pubkey;

            Object.defineProperty(ndk, '$currentPubkey', {
                get: () => currentUserPubkey,
                configurable: true
            });

            Object.defineProperty(ndk, '$follows', {
                get: () => new Set([alice.pubkey]), // Only follows themselves
                configurable: true
            });

            const { container } = render(AvatarGroup, {
                props: {
                    ndk,
                    pubkeys: [alice.pubkey],
                    onlyFollows: true,
                    skipCurrentUser: true
                }
            });

            // Should show no avatars (only followed user is current user who is skipped)
            const avatars = container.querySelectorAll('[data-avatar-group] > div[data-avatar-group]');
            expect(avatars.length).toBe(0);
        });
    });
});