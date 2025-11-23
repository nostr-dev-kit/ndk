import {defineConfig} from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "NDK",
    srcDir: "../",
    description: "NDK Docs",
    cleanUrls: true,
    // base: "/ndk/",
    ignoreDeadLinks: true,
    markdown: {
        theme: {
            light: 'github-light',
            dark: 'github-dark'
        }
    },
    rewrites: {
        'docs/index.md': 'index.md',
    },
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: "Home ✅", link: "/docs/index.md"},
            // { text: "API Reference", link: "/api/", target: "_blank" },
            // { text: "Cookbook", link: "/cookbook/" },
            {text: "Snippets ✅", link: "/docs/snippets.md"},
            {text: "Wiki ✅", link: "https://wikifreedia.xyz/?c=NDK", target: "_blank"},
        ],

        sidebar: [
            {
                items: [
                    {text: "Introduction ✅", link: "/core/docs/introduction"},
                    {text: "About Nostr ✅", link: "/core/docs/about-nostr"},
                    {text: "Contributing ❌", link: "/docs/contributing.md"},
                    {text: "Changelog ✅", link: "/docs/changelogs.md"},
                ],
            },
            {
                text: "Getting Started",
                items: [
                    {text: "Installing ✅", link: "/core/docs/getting-started/installing"},
                    {text: "Usage ✅", link: "/core/docs/getting-started/usage"},
                    {text: "Debugging ✅", link: "/core/docs/getting-started/debugging"},
                ],
            },
            {
                text: "Fundamentals",
                collapsed: false,
                items: [
                    {text: "Events ✅", link: "/core/docs/fundamentals/events"},
                    {text: "Connecting ✅", link: "/core/docs/fundamentals/connecting"},
                    {text: "Publishing ✅", link: "/core/docs/fundamentals/publishing"},
                    {text: "Subscribing ✅", link: "/core/docs/fundamentals/subscribing"},
                    {text: "Signers ✅", link: "/core/docs/fundamentals/signers"},
                    {text: "Zaps ❌", link: "/core/docs/tutorial/zaps"},
                    {text: "Local-first ❌", link: "/core/docs/tutorial/local-first"},
                    {
                        text: "Subscription Management ❌",
                        link: "/core/docs/tutorial/subscription-management",
                    },
                    {text: "Mute Filtering ❌", link: "/core/docs/tutorial/mute-filtering"},
                ],
            },
            {
                text: "Sessions",
                collapsed: true,
                items: [
                    {text: "Introduction ✅", link: "/sessions/docs/introduction"},
                    {text: "Quick Start ✅", link: "/sessions/docs/quick-start"},
                    {text: "Storage Options ✅", link: "/sessions/docs/storage-options"},
                    {text: "Multi-Account ✅", link: "/sessions/docs/multi-account"},
                    {text: "Migration Guide ✅", link: "/sessions/docs/migration"},
                    {text: "Advanced ❌", link: "/sessions/docs/advanced"},
                    {text: "Best Practices ❌", link: "/sessions/docs/best-practices"},
                    {text: "API Reference ✅", link: "/sessions/docs/api"},
                    {text: "README ⛔", link: "/sessions/README"}
                ],
            },
            {
                text: "Wallet",
                collapsed: true,
                items: [
                    {text: "Introduction ❌", link: "/wallet/README"},
                    {text: "WebLN Wallet ❌", link: '/wallet/docs/NDKWebLNWallet'},
                    {text: "NWC Wallet ❌", link: '/wallet/docs/NDKNWCWallet'},
                    {
                        text: "CashuWallet (NIP-60) ❌",
                        link: "/wallet/docs/NDKCashuWallet",
                        items: [
                            {text: "Nutsack ❌", link: "/wallet/docs/nutsack"},
                            {text: "Nutzaps ❌", link: "/wallet/docs/nutzaps"},
                            {text: "Nutzap Monitor ❌", link: "/wallet/docs/nutzap-monitor"},
                            {text: "Monitor State Store ❌", link: "/wallet/docs/nutzap-monitor-state-store"},
                        ]
                    },
                ],
            },
            {
                text: "Wrappers",
                collapsed: true,
                items: [
                    {
                        text: "Svelte ⛔",
                        link: "/svelte/README ⛔",
                        items: [
                            {text: "Blossom ⛔", link: "/svelte/blossom-upload"},
                            {text: "Changelog ⛔", link: "/svelte/CHANGELOG.md"},
                        ]
                    },
                    {
                        text: "React  ❌",
                        link: "/react/README",
                        items: [
                            {text: "Getting Started ❌", link: "/react/docs/getting-started"},
                            {text: "Muting ❌", link: "/react/muting"},
                            {text: "Session Management ❌", link: "/react/session-management"},
                        ]
                    }
                ],
            },
            {
                text: "Mobile",
                collapsed: true,
                items: [
                    {text: "Introduction ❌", link: "/mobile/README"},
                    {text: "Session ⛔", link: "/mobile/session"},
                    {text: "Wallet ⛔", link: "/mobile/wallet"},
                    {text: "Subscriptions ⛔", link: "/mobile/subscriptions"},
                    {text: "Nutzaps ⛔", link: "/mobile/nutzaps"},
                    {text: "Mint ⛔", link: "/mobile/mint"},
                ],
            },
            {
                text: "Blossom (Media)",
                collapsed: true,
                items: [
                    {text: "Introduction ❌", link: "/blossom/README"},
                    {text: "Getting Started  ⛔", link: "/blossom/getting-started"},
                    {text: "Error Handling  ⛔", link: "/blossom/error-handling"},
                    {text: "Mirroring  ⛔", link: "/blossom/mirroring"},
                    {text: "Optimization ⛔", link: "/blossom/optimization"},
                ]
            },
            {
                text: "Advanced Topics",
                collapsed: true,
                items: [
                    {
                        text: "Signer Persistence ❌",
                        link: "/core/docs/tutorial/signer-persistence"
                    },
                    {
                        text: "Speed / Performance ❌",
                        link: "/core/docs/tutorial/speed"
                    },
                    {
                        text: "AI Guardrails ✅",
                        link: "/core/docs/advanced/ai-guardrails"
                    },
                    {
                        text: "Exclusive Relays ✅",
                        link: "/core/docs/advanced/exclusive-relay"
                    },
                    {
                        text: "Subscription Lifecycle ❌",
                        link: "/core/docs/advanced/subscription-internals"
                    },
                    {
                        text: "Event Class Registration ❌",
                        link: "/core/docs/advanced/event-class-registration"
                    },
                    {
                        text: "Relay Metadata Caching ⛔",
                        link: "/core/docs/advanced/relay-metadata-caching"
                    },
                    {
                        text: "Sync & Negentropy ⛔",
                        link: "/sync"
                    },
                    {
                        text: "Web of Trust (WOT) ⛔",
                        link: "/wot/README"
                    },
                    {
                        text: "Cache Adapters ❌",
                        collapsed: true,
                        items: [
                            {text: "Memory / LRU ❌", link: "/cache/memory/README"},
                            {text: "Dexie / IndexedDB ❌", link: "cache/dexie/README"},
                            {text: "Local Nostr Relay ❌", link: "/cache/nostr/README"},
                            {text: "Redis ❌", link: "/cache/redis/README"},
                            {text: "SQLite ❌", link: "/cache/sqlite/README"},
                            {
                                text: "SQLite WASM ❌",
                                link: "/cache/sqlite-wasm/README",
                                items: [
                                    {text: "Bundling ❌", link: "/cache/sqlite-wasm/bundling"},
                                    {text: "Web Worker Setup ❌", link: "/cache/sqlite-wasm/web-worker-setup"}
                                ]
                            },
                        ],
                    },
                ],
            },
        ],
        outline: {
            level: [2, 3],
        },

        socialLinks: [{icon: "github", link: "https://github.com/nostr-dev-kit/ndk"}],
    },
});
