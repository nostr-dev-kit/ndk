# Zaps

NDK comes with an interface to make zapping as simple as possible.

```ts
const user = await ndk.getUserFromNip05("pablo@f7z.io");
const zapper = ndk.zap(user);
```