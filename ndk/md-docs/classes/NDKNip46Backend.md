**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKNip46Backend

# Class: NDKNip46Backend

This class implements a NIP-46 backend, meaning that it will hold a private key
of the npub that wants to be published as.

This backend is meant to be used by an NDKNip46Signer, which is the class that
should run client-side, where the user wants to sign events from.

## Constructors

### new NDKNip46Backend(ndk, signer, permitCallback)

> **new NDKNip46Backend**(`ndk`, `signer`, `permitCallback`): [`NDKNip46Backend`](NDKNip46Backend.md)

#### Parameters

• **ndk**: [`default`](default.md)

The NDK instance to use

• **signer**: [`NDKSigner`](../interfaces/NDKSigner.md)

The signer for the private key that wants to be published as

• **permitCallback**: [`Nip46PermitCallback`](../type-aliases/Nip46PermitCallback.md)

Callback executed when permission is requested

#### Returns

[`NDKNip46Backend`](NDKNip46Backend.md)

#### Source

[ndk/src/signers/nip46/backend/index.ts:72](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L72)

### new NDKNip46Backend(ndk, privateKey, permitCallback)

> **new NDKNip46Backend**(`ndk`, `privateKey`, `permitCallback`): [`NDKNip46Backend`](NDKNip46Backend.md)

#### Parameters

• **ndk**: [`default`](default.md)

The NDK instance to use

• **privateKey**: `string`

The private key of the npub that wants to be published as

• **permitCallback**: [`Nip46PermitCallback`](../type-aliases/Nip46PermitCallback.md)

Callback executed when permission is requested

#### Returns

[`NDKNip46Backend`](NDKNip46Backend.md)

#### Source

[ndk/src/signers/nip46/backend/index.ts:79](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L79)

## Properties

### debug

> **`readonly`** **debug**: `Debugger`

#### Source

[ndk/src/signers/nip46/backend/index.ts:63](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L63)

***

### handlers

> **handlers**: `Object`

#### Index signature

 \[`method`: `string`\]: [`IEventHandlingStrategy`](../interfaces/IEventHandlingStrategy.md)

#### Source

[ndk/src/signers/nip46/backend/index.ts:119](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L119)

***

### localUser?

> **localUser**?: [`NDKUser`](NDKUser.md)

#### Source

[ndk/src/signers/nip46/backend/index.ts:62](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L62)

***

### ndk

> **`readonly`** **ndk**: [`default`](default.md)

#### Source

[ndk/src/signers/nip46/backend/index.ts:60](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L60)

***

### rpc

> **rpc**: [`NDKNostrRpc`](NDKNostrRpc.md)

#### Source

[ndk/src/signers/nip46/backend/index.ts:64](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L64)

***

### signer

> **`readonly`** **signer**: [`NDKSigner`](../interfaces/NDKSigner.md)

#### Source

[ndk/src/signers/nip46/backend/index.ts:61](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L61)

## Methods

### applyToken()

> **applyToken**(`pubkey`, `token`): `Promise`\<`void`\>

Overload this method to apply tokens, which can
wrap permission sets to be applied to a pubkey.

#### Parameters

• **pubkey**: `string`

public key to apply token to

• **token**: `string`

token to apply

#### Returns

`Promise`\<`void`\>

#### Source

[ndk/src/signers/nip46/backend/index.ts:143](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L143)

***

### pubkeyAllowed()

> **pubkeyAllowed**(`params`): `Promise`\<`boolean`\>

This method should be overriden by the user to allow or reject incoming
connections.

#### Parameters

• **params**: [`Nip46PermitCallbackParams`](../type-aliases/Nip46PermitCallbackParams.md)

#### Returns

`Promise`\<`boolean`\>

#### Source

[ndk/src/signers/nip46/backend/index.ts:187](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L187)

***

### setStrategy()

> **setStrategy**(`method`, `strategy`): `void`

Enables the user to set a custom strategy for handling incoming events.

#### Parameters

• **method**: `string`

The method to set the strategy for

• **strategy**: [`IEventHandlingStrategy`](../interfaces/IEventHandlingStrategy.md)

The strategy to set

#### Returns

`void`

#### Source

[ndk/src/signers/nip46/backend/index.ts:133](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L133)

***

### start()

> **start**(): `Promise`\<`void`\>

This method starts the backend, which will start listening for incoming
requests.

#### Returns

`Promise`\<`void`\>

#### Source

[ndk/src/signers/nip46/backend/index.ts:105](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L105)
