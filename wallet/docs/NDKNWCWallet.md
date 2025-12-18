# NWC Client (`NDKWalletNWC`)

The `NDKWalletNWC` implements the [NIP-47](https://github.com/nostr-protocol/nips/blob/master/47.md) specification and
allows you to zap using [Nostr
Web Connect (NWC)](https://nwc.dev/).

## Usage

The NWC wallet can be used to:

- Connect to NWC Wallets
- Send payment requests
- Query wallet information
- Handle payment responses

## Install

To initialise WebLN ensure you have the ndk-wallet installed

::: code-group

```sh [npm]
npm i @nostr-dev-kit/ndk-wallet
```

```sh [pnpm]
pnpm add @nostr-dev-kit/ndk-wallet
```

```sh [yarn]
yarn add @nostr-dev-kit/ndk-wallet
```

```sh [bun]
bun add @nostr-dev-kit/ndk-wallet
```
:::

## Initialising


```typescript
import NDK from "@nostr-dev-kit/ndk";
import { NDKWalletNWC } from "@nostr-dev-kit/ndk-wallet";

const ndk = new NDK();

// Create an WebLN wallet
const wallet = new NDKWalletNWC(ndk);

ndk.wallet = wallet;
```

## Pay an invoice

To pay an invoice you can use the wallet instance directly:

```typescript
// Generate payment request
const paymentRequest = { pr: "lnbc..."} as LnPaymentInfo;

// Pay an invoice
await wallet.pay(paymentRequest);
```

Or using the NDK instance:

```typescript
// Generate payment request
const paymentRequest = { pr: "lnbc..."} as LnPaymentInfo;

// Pay an invoice
await ndk.wallet.pay(paymentRequest);
```

## Retrieve

To retrieve the balance you can use the wallet instance directly or using the NDK instance;

```typescript
console.log(wallet.balance);

console.log(ndk.wallet.balance);
```

## Update balance

To refresh the balance from the linked wallet use the wallet instance directly or using the NDK instance;

```typescript
await wallet.updateBalance;

await ndk.wallet.balance;
```

Make sure to await the promise to fully refresh the balance.

## Nostr Zaps

Lightning Zaps using NWC are described in [NIP-47](https://nostr-nips.com/nip-47).

The full protocol (Step 1 to 9) is described in the respective docs. In the below example we will
refer to the steps described in the Nostr Implementation Protocol (NIP).

```typescript

import {
    generateZapRequest,
    getNip57ZapSpecFromLud,
    NDKUser,
    NDKZapper
} from "@nostr-dev-kit/ndk";

// Step 01: Calculate lnurl
const lud06 = '';
const lud16 = 'pablof7z@primal.net';

// retrieve lightning callback data for user
const lnMeta = await getNip57ZapSpecFromLud(
    {
        lud16,
        lud06,
    },
    ndk, // pass NDK instance
);

// Step 03: General Zap request
const target = new NDKUser({ npub: '' }); // User you want to zap
const amount = 1000; // amount in MSats

// generate zap request, this event is not published to relays
const zapRequest = await generateZapRequest(
    target,
    ndk,
    lnMeta, 
    ndk.activeUser.npub,
    amount,
    relays, // optional relays to send zapReceipt to 
    message, // message
);

// Step 04 to 07: Retrieve invoice

// create zapper instance and get lightning invoice
const zapper = new NDKZapper(target, amount, "msat", { ndk });

// retrieve the lightning invoice
const invoice = await zapper.getLnInvoice(zapRequest, amount, lnMeta);

// pay the invoice
await wallet.lnPay({
    pr: invoice,
});

// extract the timestamp from the invoice
const invoiceDecoded = decode(invoice);
const timestampSection = invoiceDecoded.sections.filter(
    (section) => section.name === "timestamp",
);

const invoiceTimestamp = timestampSection[0]
    ? Number(timestampSection[0].value)
    : Math.floor(Date.now() / 1000);


// Step 08: Publish zap receipt
const zapReceiptEvent = new NDKEvent(ndk);
zapReceiptEvent.content = "";
zapReceiptEvent.kind = NDKKind.Zap;
zapReceiptEvent.created_at = invoiceTimestamp;
zapReceiptEvent.tags.push(["p", hexpubkey]);
zapReceiptEvent.tags.push(["bolt11", invoice]);
zapReceiptEvent.tags.push(["client", "asknostr.site"]);
zapReceiptEvent.tags.push([
    "description",
    JSON.stringify(zapRequest?.rawEvent()),
]);

await zapReceiptEvent.publish();

```