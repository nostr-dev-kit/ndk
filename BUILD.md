# Build NDK

NDK is structured as a monorepo using `bun` as the package manager.

```
git clone https://github.com/nostr-dev-kit/ndk
cd ndk
bun install
bun run build
```

If you only care about building ndk core and not the family of packages you can just

```
git clone https://github.com/nostr-dev-kit/ndk
cd ndk
bun install
cd ndk
bun run build
```
