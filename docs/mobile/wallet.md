# Wallet

ndk-mobile makes operating with nostr wallets as seamless as possible.

## Initialize

When setting up your NDKSession provider, make sure to activate the wallet prop, to indicate you want to enable this feature.

```ts
<NDKSessionProvider wallet={true}>
```

If your user has implicitly or explicitly enabled a wallet in your app you can also pass the configuration into the provider to immediately make the wallet available throughout your app.

```ts
const walletConfig = {
    // type of wallet to enable
    type: 'nip-60',

    // some wallet Id this user can use
    walletId: 'naddr1qvzqqqy3lupzq8mxja28nlfd6269zzzsm8feqxrl5eapf7g5fretnpucjh0xlannqythwumn8ghj7un9d3shjtnswf5k6ctv9ehx2ap0qqgx5un0weuxsmp5w4ax2e3cwe382kngsvc'

<NDKSessionProvider wallet={true} walletConfig={walletConfig}>
```

## Using the wallet

Now from within your app you can easily zap via the `NDKZapper`, check balance, receive payments, and any other interaction you can use `ndk-wallet`.

```ts
const { activeWallet, balances } = useNDKSession();

async function generateDeposit() {
    const deposit = activeWallet.deposit(10, activeWallet.mints[0], 'sat');
    deposit.on('success', () => console.log('✅ deposit'))
    const bolt11 = await deposit.start();
    console.log('pay this LN invoice', bolt11);
}

return (
    <View>
        <Text>Wallet balances = {JSON.stringify(balances)}</Text>

        <Button title="Add 10 sats" onPress={generateDeposit}>
    </View>
)
```
