import { NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "@nostr-dev-kit/svelte";
import { render } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestNDK, UserGenerator } from "../../../../../../test-utils";
import FollowButton from "./follow-button.svelte";

describe("FollowButton", () => {
    let ndk: NDKSvelte;
    let alice: Awaited<ReturnType<typeof UserGenerator.getUser>>;
    let bob: Awaited<ReturnType<typeof UserGenerator.getUser>>;
    let mockFollows;
    let mockSessions;
    let mockCurrentUser;

    beforeEach(async () => {
        ndk = createTestNDK();
        ndk.signer = NDKPrivateKeySigner.generate();
        await ndk.signer.blockUntilReady();

        alice = await UserGenerator.getUser("alice", ndk as any);
        bob = await UserGenerator.getUser("bob", ndk as any);

        mockFollows = {
            has: vi.fn().mockReturnValue(false),
            add: vi.fn().mockResolvedValue(undefined),
            remove: vi.fn().mockResolvedValue(undefined),
        };
        vi.spyOn(ndk, "$follows", "get").mockReturnValue(mockFollows);

        mockCurrentUser = {
            pubkey: ndk.$currentPubkey,
        };
        vi.spyOn(ndk, "$currentUser", "get").mockReturnValue(mockCurrentUser as any);

        mockSessions = {
            addMonitor: vi.fn(),
        };
        vi.spyOn(ndk, "$sessions", "get").mockReturnValue(mockSessions as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("rendering", () => {
        it("should render button with data attributes", () => {
            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button).toBeTruthy();
            expect(button?.tagName).toBe('BUTTON');
        });

        it("should not render when target is own profile", () => {
            const ownUser = new NDKUser({ hexpubkey: ndk.$currentPubkey! });

            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: ownUser
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button).toBeNull();
        });

        it("should not render when no current user", () => {
            vi.spyOn(ndk, "$currentUser", "get").mockReturnValue(undefined as any);

            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button).toBeNull();
        });
    });

    describe("variants", () => {
        it("should apply ghost variant by default", () => {
            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button?.getAttribute('data-variant')).toBe('ghost');
        });

        it("should apply outline variant", () => {
            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob,
                    variant: 'outline'
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button?.getAttribute('data-variant')).toBe('outline');
        });

        it("should apply pill variant", () => {
            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob,
                    variant: 'pill'
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button?.getAttribute('data-variant')).toBe('pill');
        });

        it("should apply solid variant", () => {
            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob,
                    variant: 'solid'
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button?.getAttribute('data-variant')).toBe('solid');
        });
    });

    describe("target types", () => {
        it("should show user target type for NDKUser", () => {
            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button?.getAttribute('data-target-type')).toBe('user');
        });

        it("should show hashtag target type for string", () => {
            vi.spyOn(ndk, "$sessionEvent").mockReturnValue({
                hasInterest: vi.fn().mockReturnValue(false),
            } as any);

            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: "bitcoin"
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button?.getAttribute('data-target-type')).toBe('hashtag');
        });
    });

    describe("following state", () => {
        it("should show data-following when following user", () => {
            mockFollows.has.mockReturnValue(true);

            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button?.hasAttribute('data-following')).toBe(true);
        });

        it("should not show data-following when not following user", () => {
            mockFollows.has.mockReturnValue(false);

            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button?.hasAttribute('data-following')).toBe(false);
        });

        it("should show Follow text when not following", () => {
            mockFollows.has.mockReturnValue(false);

            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            expect(container.textContent).toContain('Follow');
        });

        it("should show Unfollow text when following", () => {
            mockFollows.has.mockReturnValue(true);

            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            expect(container.textContent).toContain('Unfollow');
        });
    });

    describe("interaction", () => {
        it("should call follow when clicked", async () => {
            const user = userEvent.setup();
            mockFollows.has.mockReturnValue(false);

            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            const button = container.querySelector('[data-follow-button]') as HTMLButtonElement;
            await user.click(button);

            flushSync();

            expect(mockFollows.add).toHaveBeenCalledWith(bob.pubkey);
        });

        it("should not do anything when clicked without current user", async () => {
            vi.spyOn(ndk, "$currentPubkey", "get").mockReturnValue(undefined as any);

            const user = userEvent.setup();

            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            const button = container.querySelector('[data-follow-button]') as HTMLButtonElement;
            if (button) {
                await user.click(button);
                flushSync();
            }

            expect(mockFollows.add).not.toHaveBeenCalled();
        });
    });

    describe("display options", () => {
        it("should show icon by default", () => {
            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            const svg = container.querySelector('svg');
            expect(svg).toBeTruthy();
        });

        it("should hide icon when showIcon is false", () => {
            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob,
                    showIcon: false
                }
            });

            const svg = container.querySelector('svg');
            expect(svg).toBeNull();
        });
    });

    describe("accessibility", () => {
        it("should have aria-label for following user", () => {
            mockFollows.has.mockReturnValue(true);

            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button?.getAttribute('aria-label')).toBe('Unfollow user');
        });

        it("should have aria-label for not following user", () => {
            mockFollows.has.mockReturnValue(false);

            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button?.getAttribute('aria-label')).toBe('Follow user');
        });

        it("should have aria-label for hashtag", () => {
            vi.spyOn(ndk, "$sessionEvent").mockReturnValue({
                hasInterest: vi.fn().mockReturnValue(false),
            } as any);

            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: "bitcoin"
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button?.getAttribute('aria-label')).toBe('Follow #bitcoin');
        });
    });

    describe("custom styling", () => {
        it("should apply custom class", () => {
            const { container } = render(FollowButton, {
                props: {
                    ndk,
                    target: bob,
                    class: "my-custom-class"
                }
            });

            const button = container.querySelector('[data-follow-button]');
            expect(button?.classList.contains('my-custom-class')).toBe(true);
        });
    });
});
