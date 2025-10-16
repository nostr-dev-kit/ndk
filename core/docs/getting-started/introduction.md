# Getting started

## Installation

```sh
npm add @nostr-dev-kit/ndk
```

## Debugging

NDK uses the `debug` package to assist in understanding what's happening behind the hood. If you are building a package
that runs on the server define the `DEBUG` envionment variable like

```sh
export DEBUG='ndk:*'
```

or in the browser enable it by writing in the DevTools console

```sh
localStorage.debug = 'ndk:*'
```

## Network Debugging

You can construct NDK passing a netDebug callback to receive network traffic events, particularly useful for debugging
applications not running in a browser.

```ts
const netDebug = (msg: string, relay: NDKRelay, direction?: "send" | "recv") = {
    const hostname = new URL(relay.url).hostname;
    netDebug(hostname, msg, direction);
}

ndk = new NDK({ netDebug });
```
