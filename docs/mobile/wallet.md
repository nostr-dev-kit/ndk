# Wallet

`ndk-mobile` makes operating with nostr wallets as seamless as possible.

## Initialize

The `useNDKWallet()` hook provides access to the active wallet and to activate a wallet.

```tsx
const { activeWallet, setActiveWallet, balances } = useNDKWallet();

return (<View>
    { activeWallet && <Text>You are using a wallet of type {activeWallet.type}</Text>}

    <Button title="Connect" onPress={() => {
        setActiveWallet('nostr+wallet:....')
    } />
</View>)
```

## Using the wallet

Now from within your app you can easily zap via the `NDKZapper`, check balance, receive payments, and any other interaction you can use `ndk-wallet`.

```ts
const { activeWallet, balances } = useNDKWallet();

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
