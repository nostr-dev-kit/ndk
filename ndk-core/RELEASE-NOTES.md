# NDK 2.15

I'm happy to announce the release of NDK 2.15. This is a very significant release that's been in the works for quite a while. The main focus of this release has been in reducing the amount of footguns in NDK. Yes, mainly thinking about making the vibecoding scene a lot more enjoyable: LLMs are great at churning out code at insane speed. Not so much at debugging, optimizations, performant code. So this new release of NDK focuses a lot on making sure that the most obvious solution is the right solution.

ndk-hooks

I spun out a new package called ndk-hooks. Someone else had built (and abandoned) an ndk-react package, and LLMs constantly got confused using it and produced terrible code. ndk-hooks is an offshoot of ndk-mobile, and, if you're vibecoding Next.js apps like most people are doing, ndk-hooks provides you with all the building blocks to make sure your agents don't lose their minds.

ndk-core

A lot has changed under the hood to make space for performant access points, particularly synchronous access points.

Worthy mentions:

- The whole codebase has been migrated to use modern tooling: bun and vitest.
- Very useful test helpers, until now, writing tests on clients was a pain, NDK now ships with @nostr-dev-kit/ndk/test which provides a `MockRelay` that provides access to very useful testing utilities.
- Race condition bugs are now gone, no more dreaded "Not enough relays received this event" when publishing before connecting to relays.

ndk-sqlite-wasm-cache-adapter

A new cache adapter leveraging SQLite WASM is now available. This should be the preferred option to
