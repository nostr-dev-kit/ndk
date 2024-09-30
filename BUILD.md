# Build NDK

NDK is structured as a monorepo using `pnpm` as the package manager.

```
git clone https://github.com/nostr-dev-kit/ndk
cd ndk
pnpm install
pnpm build
```

If you only care about building ndk core and not the family of packages you can just

```
git clone https://github.com/nostr-dev-kit/ndk
cd ndk
pnpm install
cd ndk
pnpm build
```
