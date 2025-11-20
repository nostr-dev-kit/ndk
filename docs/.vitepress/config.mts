import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "NDK",
    description: "NDK Docs",
    base: "/ndk/",
    ignoreDeadLinks: true,
    markdown: {
        theme: {
            light: 'github-light',
            dark: 'github-dark'
        }
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
                    { text: "Introduction", link: "/getting-started/introduction" },
                    { text: "Usage", link: "/getting-started/usage" },
                    { text: "Signers", link: "/getting-started/signers" },
                ],
            },
            {
                text: "Tutorial",
                items: [
                    { text: "Local-first", link: "/tutorial/local-first" },
                    { text: "Publishing", link: "/tutorial/publishing" },
                    {
                        text: "Subscription Management",
                        link: "/tutorial/subscription-management",
                    },
                    { text: "Mute Filtering", link: "/tutorial/mute-filtering" },
                    { text: "Signer Persistence", link: "/tutorial/signer-persistence" },
                    { text: "Speed", link: "/tutorial/speed" },
                    { text: "Zaps", link: "/tutorial/zaps" },
                ],
            },
            {
                text: "Cache Adapters",
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
                items: [
                    { text: "Introduction", link: "/wallet/index" },
                    { text: "Nutsack (NIP-60)", link: "/wallet/nutsack" },
                    { text: "Nutzaps", link: "/wallet/nutzaps" },
                ],
            },
            {
                text: "Sync & Negentropy",
                items: [
                    { text: "Introduction", link: "/sync/index" },
                ],
            },
            {
                text: "Web of Trust",
                items: [
                    { text: "Introduction", link: "/wot/index" },
                    { text: "Negentropy Integration", link: "/wot/negentropy" },
                ],
            },
            {
                text: "Wrappers",
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
                items: [
                    { text: "Introduction", link: "/sessions/index" },
                    { text: "Quick Start", link: "/sessions/quick-start" },
                    { text: "API Reference", link: "/sessions/api" },
                    { text: "Migration Guide", link: "/sessions/migration" }
                ],
            },
            {
                text: "Mobile",
                items: [
                    { text: "Introduction", link: "/mobile/index" },
                    { text: "Session", link: "/mobile/session" },
                    { text: "Wallet", link: "/mobile/wallet" },
                ],
            },
            {
                text: "Blossom (Media)",
                items: [
                    { text: "Introduction", link: "/blossom/getting-started" },
                ]
            },
            {
                text: "Testing",
                items: [
                    { text: "Introduction", link: "/testing/index" },
                ],
            },
            {
                text: "Internals",
                items: [{ text: "Subscription Lifecycle", link: "/internals/subscriptions" }],
            },
        ],

        socialLinks: [{ icon: "github", link: "https://github.com/nostr-dev-kit/ndk" }],
    },
});
