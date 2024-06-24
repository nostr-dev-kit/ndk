# Getting started

## Installation

```sh
npm add @nostr-dev-kit/ndk
```

## Debugging

NDK uses the `debug` package to assist in understanding what's happening behind the hood. If you are building a package
that runs on the server define the `DEBUG` envionment variable like

```
export DEBUG='ndk:*'
```

or in the browser enable it by writing in the DevTools console

```
localStorage.debug = 'ndk:*'
```
