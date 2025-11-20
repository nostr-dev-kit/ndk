import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { NDKSvelte } from "@nostr-dev-kit/svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it, beforeEach } from "vitest";
import { createTestNDK } from "../../../../test-utils";
import ReactionDisplay from "./reaction-display.svelte";

describe("ReactionDisplay", () => {
    let ndk: NDKSvelte;

    beforeEach(() => {
        ndk = createTestNDK();
    });

    describe("unicode emoji rendering", () => {
        it("should render unicode emoji in a span", () => {
            const { container } = render(ReactionDisplay, {
                props: {
                    emoji: "❤️"
                }
            });

            const span = container.querySelector('[data-reaction-display]');
            expect(span).toBeTruthy();
            expect(span?.tagName).toBe('SPAN');
            expect(span?.textContent).toBe("❤️");
        });

        it("should apply custom class to emoji span", () => {
            const { container } = render(ReactionDisplay, {
                props: {
                    emoji: "🔥",
                    class: "custom-emoji-class"
                }
            });

            const span = container.querySelector('[data-reaction-display]');
            expect(span?.classList.contains('custom-emoji-class')).toBe(true);
        });

        it("should render different emojis correctly", () => {
            const emojis = ["❤️", "🔥", "👍", "😂", "🎉"];

            for (const emoji of emojis) {
                const { container } = render(ReactionDisplay, {
                    props: { emoji }
                });

                const span = container.querySelector('[data-reaction-display]');
                expect(span?.textContent).toBe(emoji);
            }
        });
    });

    describe("custom emoji (NIP-30) rendering", () => {
        it("should render custom emoji as image when url provided", () => {
            const { container } = render(ReactionDisplay, {
                props: {
                    emoji: ":pepe:",
                    shortcode: "pepe",
                    url: "https://example.com/pepe.png"
                }
            });

            const img = container.querySelector('[data-reaction-display]');
            expect(img).toBeTruthy();
            expect(img?.tagName).toBe('IMG');
            expect(img?.getAttribute('src')).toBe("https://example.com/pepe.png");
            expect(img?.getAttribute('alt')).toBe("pepe");
        });

        it("should use emoji as alt text when no shortcode provided", () => {
            const { container } = render(ReactionDisplay, {
                props: {
                    emoji: ":custom:",
                    url: "https://example.com/custom.png"
                }
            });

            const img = container.querySelector('[data-reaction-display]');
            expect(img?.getAttribute('alt')).toBe(":custom:");
        });

        it("should apply custom class to emoji image", () => {
            const { container } = render(ReactionDisplay, {
                props: {
                    url: "https://example.com/emoji.png",
                    class: "custom-img-class"
                }
            });

            const img = container.querySelector('[data-reaction-display]');
            expect(img?.classList.contains('custom-img-class')).toBe(true);
        });
    });

    describe("extracting emoji from NDKEvent", () => {
        it("should extract unicode emoji from event content", () => {
            const reactionEvent = new NDKEvent(ndk);
            reactionEvent.kind = NDKKind.Reaction;
            reactionEvent.content = "❤️";
            reactionEvent.tags = [
                ["e", "test-event-id"],
                ["p", "test-pubkey"]
            ];

            const { container } = render(ReactionDisplay, {
                props: {
                    event: reactionEvent
                }
            });

            const span = container.querySelector('[data-reaction-display]');
            expect(span?.textContent).toBe("❤️");
        });

        it("should extract custom emoji data from NIP-30 emoji tag", () => {
            const reactionEvent = new NDKEvent(ndk);
            reactionEvent.kind = NDKKind.Reaction;
            reactionEvent.content = ":doge:";
            reactionEvent.tags = [
                ["e", "test-event-id"],
                ["p", "test-pubkey"],
                ["emoji", "doge", "https://example.com/doge.png"]
            ];

            const { container } = render(ReactionDisplay, {
                props: {
                    event: reactionEvent
                }
            });

            const img = container.querySelector('[data-reaction-display]');
            expect(img?.tagName).toBe('IMG');
            expect(img?.getAttribute('src')).toBe("https://example.com/doge.png");
            expect(img?.getAttribute('alt')).toBe("doge");
        });

        it("should render as unicode when emoji tag is incomplete", () => {
            const reactionEvent = new NDKEvent(ndk);
            reactionEvent.kind = NDKKind.Reaction;
            reactionEvent.content = ":incomplete:";
            reactionEvent.tags = [
                ["e", "test-event-id"],
                ["emoji", "incomplete"] // Missing URL (incomplete tag)
            ];

            const { container } = render(ReactionDisplay, {
                props: {
                    event: reactionEvent
                }
            });

            const span = container.querySelector('[data-reaction-display]');
            expect(span?.tagName).toBe('SPAN');
            expect(span?.textContent).toBe(":incomplete:");
        });

        it("should use event data over direct props when event provided", () => {
            const reactionEvent = new NDKEvent(ndk);
            reactionEvent.kind = NDKKind.Reaction;
            reactionEvent.content = "🔥";
            reactionEvent.tags = [];

            const { container } = render(ReactionDisplay, {
                props: {
                    emoji: "❤️", // This should be ignored
                    event: reactionEvent
                }
            });

            const span = container.querySelector('[data-reaction-display]');
            expect(span?.textContent).toBe("🔥"); // Event content wins
        });
    });

    describe("data attributes", () => {
        it("should have data-reaction-display attribute on span", () => {
            const { container } = render(ReactionDisplay, {
                props: {
                    emoji: "❤️"
                }
            });

            const element = container.querySelector('[data-reaction-display]');
            expect(element).toBeTruthy();
            expect(element?.hasAttribute('data-reaction-display')).toBe(true);
        });

        it("should have data-reaction-display attribute on img", () => {
            const { container } = render(ReactionDisplay, {
                props: {
                    url: "https://example.com/emoji.png"
                }
            });

            const element = container.querySelector('[data-reaction-display]');
            expect(element).toBeTruthy();
            expect(element?.hasAttribute('data-reaction-display')).toBe(true);
        });
    });

    describe("edge cases", () => {
        it("should handle empty emoji string", () => {
            const { container } = render(ReactionDisplay, {
                props: {
                    emoji: ""
                }
            });

            const span = container.querySelector('[data-reaction-display]');
            expect(span).toBeTruthy();
            expect(span?.textContent).toBe("");
        });

        it("should handle emoji with no props (all undefined)", () => {
            const { container } = render(ReactionDisplay, {
                props: {}
            });

            const span = container.querySelector('[data-reaction-display]');
            expect(span).toBeTruthy();
            expect(span?.textContent).toBe("");
        });

        it("should handle very long URLs", () => {
            const longUrl = "https://example.com/" + "a".repeat(1000) + ".png";

            const { container } = render(ReactionDisplay, {
                props: {
                    url: longUrl
                }
            });

            const img = container.querySelector('[data-reaction-display]');
            expect(img?.getAttribute('src')).toBe(longUrl);
        });
    });
});
