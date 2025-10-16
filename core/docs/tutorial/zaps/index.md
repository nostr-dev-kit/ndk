# Zaps

NDK comes with an interface to make zapping as simple as possible.

```ts
const user = await ndk.fetchUser("pablo@f7z.io");
const lnPay = ({ pr: string }) => {
    console.log("please pay to complete the zap", pr);
};
const zapper = new NDKZapper(user, 1000, { lnPay });
zapper.zap();
```

## NDK-Wallet

Refer to the Wallet section of the tutorial to learn more about zapping. NDK-wallet provides many conveniences to
integrate with zaps.
