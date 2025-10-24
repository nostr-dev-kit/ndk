# Multi-Account Management

The library supports multiple accounts (called sessions) through [different signers](/core/docs/fundamentals/signers).

## Adding a Session

Each time you use `sessions.login` NDK will create a new session if that signer isn't already an active session.

<<< @/sessions/docs/snippets/adding_sessions.ts

## Switch Between Accounts

Sessions can be listed with `getSessions()` which will return a `Map<Hexpubkey, NDKSession>`.
Switching sessions is as simple as passing in the pubkey:

<<< @/sessions/docs/snippets/session_switch.ts