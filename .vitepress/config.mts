import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "NDK",
    description: "NDK Docs",
    // base: "/ndk/",
    ignoreDeadLinks: true,
    markdown: {
        theme: {
            light: 'github-light',
            dark: 'github-dark'
        }
    },
    rewrites: {
        'docs/:slug.md': ':slug.md',
        'cache-dexie/:slug.md': 'cache/dexie/:slug.md',
        'cache-memory/:slug.md': 'cache/memory/:slug.md',
        'cache-nostr/:slug.md': 'cache/nostr/:slug.md',
        'cache-redis/:slug.md': 'cache/redis/:slug.md',
        'cache-sqlite/:slug.md': 'cache/sqlite/:slug.md',
        'cache-sqlite-wasm/:slug.md': 'cache/sqlite-wasm/:slug.md',
        'cache-sqlite-wasm/docs/:slug.md': 'cache/sqlite-wasm/:slug.md',
        'core/docs/:slug*': 'core/:slug*',
        'core/docs/:subdir/:slug*': 'core/:subdir/:slug*',
        'sync/docs/:slug*': 'sync/:slug*',
        'blossom/:slug.md': 'blossom/:slug.md',
        'blossom/docs/:slug*': 'blossom/:slug*',
        'mobile/:slug.md': 'mobile/:slug.md',
        'mobile/docs/:slug*': 'mobile/:slug*',
        'sessions/:slug.md': 'sessions/:slug.md',
        'sessions/docs/:slug*': 'sessions/:slug*',
        'wallet/:slug.md': 'wallet/:slug.md',
        'wallet/docs/:slug*': 'wallet/:slug*',
        'react/:slug.md': 'react/:slug.md',
        'react/docs/:slug*': 'react/:slug*',
        'svelte/:slug.md': 'svelte/:slug.md',
        'svelte/docs/:slug*': 'svelte/:slug*',
        'wot/:slug.md': 'wot/:slug.md'
    },
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: "Home", link: "/" },
            { text: "API Reference", link: "/api/", target: "_blank" },
            { text: "Cookbook", link: "/cookbook/" },
            { text: "Snippets", link: "/snippets/" },
            { text: "Wiki", link: "https://wikifreedia.xyz/?c=NDK", target: "_blank" },
        ],

        sidebar: [
            {
                text: "Getting Started",
                items: [
                    { text: "Introduction", link: "/core/getting-started/introduction" },
                    { text: "Usage", link: "/core/getting-started/usage" },
                    { text: "Signers", link: "/core/getting-started/signers" },
                ],
            },
            {
                text: "Tutorial",
                collapsed: true,
                items: [
                    { text: "Local-first", link: "/core/tutorial/local-first" },
                    { text: "Publishing", link: "/core/tutorial/publishing" },
                    {
                        text: "Subscription Management",
                        link: "/core/tutorial/subscription-management",
                    },
                    { text: "Mute Filtering", link: "/core/tutorial/mute-filtering" },
                    { text: "Signer Persistence", link: "/core/tutorial/signer-persistence" },
                    { text: "Speed", link: "/core/tutorial/speed" },
                    { text: "Zaps", link: "/core/tutorial/zaps" },
                ],
            },
            {
                text: "Wallet",
                collapsed: true,
                items: [
                    { text: "Introduction", link: "/wallet/README" },
                    {
                        text: "NDKCashuWallet (NIP-60)",
                        link: "/wallet/nip60-configuration",
                        items: [
                            { text: "Nutsack", link: "/wallet/nutsack" },
                            { text: "Nutzaps", link: "/wallet/nutzaps" },
                            { text: "Nutzap Monitor", link: "/wallet/nutzap-monitor" },
                            { text: "Monitor State Store", link: "/wallet/nutzap-monitor-state-store" },
                        ]
                    },
                ],
            },
            {
                text: "Wrappers",
                collapsed: true,
                items: [
                    {
                        text: "Svelte",
                        link: "/svelte/README",
                        items: [
                            { text: "Blossom", link: "/svelte/blossom-upload" },
                        ]
                    },
                    {
                        text: "React",
                        link: "/react/README",
                        items: [
                            { text: "Getting Started", link: "/react/getting-started" },
                            { text: "Muting", link: "/react/muting" },
                            { text: "Session Management", link: "/react/session-management" },
                        ]
                    }
                ],
            },
            {
                text: "Sessions",
                collapsed: true,
                items: [
                    { text: "Introduction", link: "/sessions/README" },
                    { text: "Quick Start", link: "/sessions/quick-start" },
                    { text: "API Reference", link: "/sessions/api" },
                    { text: "Migration Guide", link: "/sessions/migration" }
                ],
            },
            {
                text: "Mobile",
                collapsed: true,
                items: [
                    { text: "Introduction", link: "/mobile/README" },
                    { text: "Session", link: "/mobile/session" },
                    { text: "Wallet", link: "/mobile/wallet" },
                    { text: "Subscriptions", link: "/mobile/subscriptions" },
                    { text: "Nutzaps", link: "/mobile/nutzaps" },
                    { text: "Mint", link: "/mobile/mint" },
                ],
            },
            {
                text: "Blossom (Media)",
                collapsed: true,
                items: [
                    { text: "Introduction", link: "/blossom/README" },
                    { text: "Getting Started", link: "/blossom/getting-started" },
                    { text: "Error Handling", link: "/blossom/error-handling" },
                    { text: "Mirroring", link: "/blossom/mirroring" },
                    { text: "Optimization", link: "/blossom/optimization" },
                ]
            },
            {
                text: "Advanced Topics",
                collapsed: true,
                items: [
                    {
                        text: "AI Guardrails",
                        link: "/core/advanced/ai-guardrails"
                    },
                    {
                        text: "Subscription Lifecycle",
                        link: "/core/advanced/subscription-internals"
                    },
                    {
                        text: "Event Class Registration",
                        link: "/core/advanced/event-class-registration"
                    },
                    {
                        text: "Relay Metadata Caching",
                        link: "/core/advanced/relay-metadata-caching"
                    },
                    {
                        text: "Sync & Negentropy",
                        link: "/sync"
                    },
                    {
                        text: "Web of Trust (WOT)",
                        link: "/wot/README"
                    },
                    {
                        text: "Cache Adapters",
                        collapsed: true,
                        items: [
                            { text: "Memory / LRU", link: "/cache/memory/README" },
                            { text: "Dexie / IndexedDB", link: "cache/dexie/README" },
                            { text: "Local Nostr Relay", link: "/cache/nostr/README" },
                            { text: "Redis", link: "/cache/redis/README" },
                            { text: "SQLite", link: "/cache/sqlite/README" },
                            {
                                text: "SQLite WASM",
                                link: "/cache/sqlite-wasm/README",
                                items: [
                                    { text: "Bundling", link: "/cache/sqlite-wasm/bundling" },
                                    { text: "Web Worker Setup", link: "/cache/sqlite-wasm/web-worker-setup" }
                                ]
                            },
                        ],
                    },
                ],
            },
        ],

        socialLinks: [{ icon: "github", link: "https://github.com/nostr-dev-kit/ndk" }],
    },
});
