import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "NDK",
  description: "NDK Docs",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: [
      {
        text: 'Tutorial',
        items: [
          { text: 'Local-first', link: '/tutorial/local-first' },
          { text: 'Outbox model', link: '/tutorial/outbox' },
        ]
      },
      {
        text: "Cache",
        items: [
          { text: 'Dexie Adapter', link: '/cache/dexie' },
        ]
      },
      {
        text: 'Signers',
        items: [
          { text: "Private key", link: '/signers/private-key' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nostr-dev-kit/ndk' }
    ]
  }
})
