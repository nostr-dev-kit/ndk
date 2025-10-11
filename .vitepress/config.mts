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
        'core/docs/:slug*': 'core/:slug*',
        'core/docs/:subdir/:slug*': 'core/:subdir/:slug*',
        'sync/docs/:slug*': 'sync/:slug*',
        'blossom/:slug.md': 'blossom/:slug.md',
        'blossom/docs/:slug*': 'blossom/:slug*',
        'mobile/:slug.md': 'mobile/:slug.md',
        'mobile/docs/:slug*': 'mobile/:slug*',
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
                text: "Cache Adapters",
                collapsed: true,
                items: [
                    { text: "In-memory LRU", link: "/cache/memory" },
                    { text: "In-memory + dexie", link: "/cache/dexie" },
                    { text: "Local Nostr Relay", link: "/cache/nostr" },
                    {
                        text: "SQLite (WASM)",
                        link: "/cache/sqlite-wasm/INDEX",
                        items: [
                            { text: "Bundling", link: "/cache/sqlite-wasm/bundling" },
                            { text: "Web Worker Setup", link: "/cache/sqlite-wasm/web-worker-setup" }
                        ]
                    },
                ],
            },
            {
                text: "Wallet",
                collapsed: true,
                items: [
                    { text: "Introduction", link: "/wallet/index" },
                    { text: "Nutsack (NIP-60)", link: "/wallet/nutsack" },
                    { text: "Nutzaps", link: "/wallet/nutzaps" },
                ],
            },
            {
                text: "Web of Trust",
                collapsed: true,
                items: [
                    { text: "Introduction", link: "/wot/index" },
                    { text: "Negentropy Integration", link: "/wot/negentropy" },
                ],
            },
            {
                text: "Wrappers",
                collapsed: true,
                items: [
                    { text: "NDK Svelte", link: "/wrappers/svelte" },
                    {
                        text: "NDK React Hooks",
                        link: "/hooks/index",
                        items: [
                            { text: "Session Management", link: "/hooks/session-management" },
                            { text: "Muting", link: "/hooks/muting" }
                        ]
                    }
                ],
            },
            {
                text: "Sessions",
                collapsed: true,
                items: [
                    { text: "Introduction", link: "/sessions/index" },
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
                ],
            },
        ],

        socialLinks: [{ icon: "github", link: "https://github.com/nostr-dev-kit/ndk" }],
    },
});
