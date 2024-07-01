import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "NDK",
  description: "NDK Docs",
  base: "/ndk/",
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API Reference', link: '/api/', target: '_blank' },
      { text: 'Wiki', link: 'https://wikifreedia.xyz/?c=NDK', target: '_blank' },
    ],

    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: 'Introduction', link: '/getting-started/introduction' },
          { text: 'Usage', link: '/getting-started/usage' },
          { text: 'Signers', link: '/getting-started/signers' },
        ]
      },
      {
        text: 'Tutorial',
        items: [
          { text: 'Local-first', link: '/tutorial/local-first' },
          { text: 'Publishing', link: '/tutorial/publishing' },
          { text: "Subscription Management", link: '/tutorial/subscription-management' },
        ]
      },
      {
        text: "Cache",
        items: [
          { text: 'Dexie Adapter', link: '/cache/dexie' },
          { text: 'Nostr Relay Adapter', link: '/cache/nostr' },
        ]
      },
      {
        text: "Wrappers",
        items: [
          { text: 'NDK Svelte', link: '/wrappers/svelte' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nostr-dev-kit/ndk' }
    ]
  }
})
