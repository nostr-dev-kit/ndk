# ndk-wallet

NDK Wallet provides common interfaces and functionalities to create a wallet that leverages nostr.

## Usage

### Install

```
npm add @nostr-dev-kit/ndk-wallet
```

### Initialize

```ts
// assuming variable ndk holds the NDK instance

if(zapMethod === 'nwc'){                
    const wallet = new NDKNWCWallet(ndk);
    console.log("Initializing with pairing code: "+ nwcString)
    await wallet.initWithPairingCode(nwcString!);
    ndk.wallet = wallet;
} else if (this.zapMethod === 'webln'){
    const wallet = new NDKWebLNWallet();
    ndk.wallet = wallet;
} 
```

### Zap

```ts
const zapper = new NDKZapper(ndkEventOrndkUser, amountInMilliSats);
if (comment) {
    zapper.comment = comment;
}
zapper.on(
    'split:complete',
    (split: NDKZapSplit, info: NDKPaymentConfirmation | Error | undefined) => {
        console.log('split:complete', split, info);
    }
);
zapper.on('complete', (res) => {
    console.log('complete', res);
    paymentInProgress = false
});

await zapper.zap();
```

# License

MIT
