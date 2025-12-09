# Clean up documentation

Full PR + progress available at https://github.com/nostr-dev-kit/ndk/pull/344
Preview URL https://ndkdocs.asknostr.site/

Some notes:

- Items with ✅ in sidebar are mostly done
- Items with ❌ in sidebar are mostly done, unless they have things highlighted below
- Items with ⛔ in sidebar have docs, but need to be linked+cleaned up

## Todo List

- [x] Move vitepress to root and use rewrites to clean up paths
- [x] Upgrade vitepress
- [x] [Introduction/Essential pages](https://ndkdocs.asknostr.site/core/docs/getting-started/introduction.html)
- [x] [Make sure changelogs can be found](https://ndkdocs.asknostr.site/docs/changelogs.html)
- [x] [Fix snippets](https://ndkdocs.asknostr.site/docs/snippets.html).
- [x] Fundamentals
    - [x] [Events](https://ndkdocs.asknostr.site/core/docs/fundamentals/events.html)
    - [ ] [Signers WIP](https://ndkdocs.asknostr.site/core/docs/fundamentals/signers.html)
        - [ ] Add QR code / Nostrconnect:// docs remote signer docs
    - [x] [Publishing](https://ndkdocs.asknostr.site/core/docs/fundamentals/publishing.html)
    - [x] [Connecting](https://ndkdocs.asknostr.site/core/docs/fundamentals/connecting.html)
        - [ ] Explain/Cleanup Outbox Docs
    - [ ] Wallets
    - [ ] Zaps
    - [ ] ...
- [x] Link to snippets on key pages
- [ ] Try to find (or remove) API reference link
- [ ] Remove warnings (homepage and main intro) about Docs WIP
- [ ] Remove ✅ ❌ ⛔ icons
- [x] Check revert commit https://github.com/nostr-dev-kit/ndk/commit/4a7b086bd1f67f22a6c29adcf4d6c51b4dd7077c

### Changes made that need double check

- core/tsconfig -> added paths. This makes the snippets in core/docs/snippets have biome/linting
- upgrade bun 1.3.0 and node to +22.