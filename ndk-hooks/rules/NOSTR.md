* use "@nostr-dev-kit/ndk-hooks" -- NEVER ndk-react.


## Basic setup
Use the NDKHeadless component. Put it somewhere at the top of the component DOM:

```tsx
import { NDKHeadless } from "@nostr-dev-kit/ndk-hooks";

export default function App() {
    const sessionStorage = useRef(new NDKSessionLocalStorage());
    
    return (
        <>
            <NDKHeadless
                ndk={{
                    explicitRelayUrls: [ 'wss://relay.primal.net', 'wss://purplepag.es' ],
                }}
                session={{
                    storage: sessionStorage.current,
                    opts: { follows: true, profile: true }
                }}
            />
            <YourApp />
        </>
    );
}

```

## Session
For login/logout/session mgmt the following hooks should be used:

* useNDKSessionLogin
Login a user
```ts
const login = useNDKSessionLogin();
const currentPubkey = useNDKCurrentPubkey();

const handleNewAccount = useCallback(() => {
    const signer = NDKPrivateKeySigner.generate() // generate a new signer/nsec
    login(signer);
})

const handleNip07Login = useCallback(() => {
    const signer = new NDKNip07Signer();
    signer.blockUntilReady().then(() => login(signer));
})

useEffect(() => console.log("You are logged in with " + currentPubkey), [ currentPubkey ]);
```

### Other hooks:
* const logout = useNDKSessionLogout(); logout("somepubkey") // logout a pubkey
* const switch = useNDKSessionSwitch(); switch("new-active-pubkey"); // switch the active session to a different pubkey without logging out (useful for multi-user apps)
* useNDKCurrentUser() // current active NDKUser 
* useNDKCurrentPubkey() // pubkey of the current active user

## Fetching data / Subscribing
* useSubscribe() is the most important hook that should almost always be used
```ts
const follows = useFollows(); // users the active user follows
const { events: articles } = useSubscribe<NDKArticle>( // events will be an array of NDKArticle types
    follows.size > 0 ? [{ kinds: [NDKKind.Article], limit: 100 } ] : false, // the hook won't execute when it receives `false` as the filters
    { wrap: true }, // Wrap returned events in kind wrappers, since we are asking for NDKKind.Article kinds we can ask to receive back wrapped NDKArticle
    [ follows.size ]) // deps, the filters nor the subscription options are not part of the dependencies (so we don't need to memoize it), we pass the dependencies explicitly

return (<Text>{articles.length}</Text>)
```

useSubscribe will close the subscription when the component unmounts automatically.

* useObserver() doesn't create subscriptions to relays, but it loads events from the cache reactively, while the component using it is mounted it will react to events being added to the cache.

## Encoding users
users are internally referred to by their pubkey:
const user = ndk.getUser({ pubkey })
user.pubkey // this is a hexadecimal pubkey, use it for internally referring to the user
user.npub // this an npub1 for externally referring to the user

`event.pubkey` is the pubkey of the user that published the event. You can get the NDKUser that published the event via `event.author`.

Npubs are encodings of pubkeys, when referring to users internally prefer using pubkeys, when referring to users externally (like displaying the user identifier or building a URL that represents a user, prefer npub.

## Encoding events
similarly, events have an id, which is always individual. When requiring a stable ID of an event (for example if referring to an event of type NDKArticle, which might be edited) we usually want to refer to it via it's stable id, `event.tagId()`.

When referring to an event internally we use event.tagId(), for external references use `event.encode()` (for example for constructing an URL /article/{article.encode()})

Prefer putting nostr subscriptions down on the component level, for example, when rendering a feed of elements, prefer fetching the profile information of the author on the event component rather than on the feed; NDK automatically merges individual subscription filters efficiently, so when fetching data its better to do it at the last bit that actually needs to use the data rather than prefetching everything in one go.

Local-first: never include a concept of 'loading' anywhere; that is almost always an invalid concept in nostr: data is either fetched or not. Just react to rendering the data when its available and have sane defaults.

You never need to use nostr-tools; NDK provides everything you need. If you are in a react-based app, use @nostr-dev-kit/ndk-hooks too.

Use NDK as a singleton. Instantiate it in the beginning of the entrypoint file and then use useNDKInit in a useEffect to initialize it in @nostr-dev-kit/ndk-hooks.

When fetching a profile, use `const profile = useProfileValue(pubkey)` (`profile` is the return, not `{profile}`).
When fetching data use useSubscribe([ filters ]) NOT useEvents; that function DOES NOT exist.

Leverage the use of code snippets mcp to list and understand the snippets available to you. These code snippets often provide the most uptodate and most performant way of doing specific things.

Never use the react context API in @nostr-dev-kit/ndk-hooks; there isn't one. Just use const { ndk } = useNDK();

When you want to publish an event just do const event = new NDKEvent(ndk); event.kind = ...; event.content = "hello world"; event.publish(); -- do not await the event.publish() since we use optimistic updates.

Optimistic updates are already handled by ndk; there doesn't need to be anything like that in the UI.

ndk-react doesn't exist. Never try to to use it. NEVER use a React Context API to wrap anything related to nostr.

* NDKPrivateKeySigner.generate() is not async
* Serialize the profile with serializeProfile() instead of JSON.stringify
* Usually there is no need to sign() and then publish() an event; events are signed by publish() if they hadn't been yet.
* There's usually no reason to await an event.publish() -- we use optimistic publishes with a cache with retries.
* There is no validateNip46Uri and there is no reason to validate the bunkerURI, just provide it to NDKNip46Signer and it will do the checking.
* Don't serialize/deserialize NIP-46 yourself, use nip46Signer.toPayload() and NDKNip46Signer.toPayload() to do it instead.
* Don't be concerned with storing private key in plain text in localStorage; that's up to the user to decide, not the app.
* Don't recommend using IndexDB to the app, the app is already using a cache and the state that will be kept in localStorage is minimal.
* Don't recommend handling connection issues with relays, NDK provides that.
* useEvents doesn't exist; the way to subscribe to events is to use useSubscribe; search for code snippets about it when in doubt
* Events already come sorted from useSubscribe; you don't need to re-sort by created_at.
* useSubscribe supports returning the type, if, for example, the caller wants articles, they can use `const { events: articles } = useSubscribe<NDKArticle>([ {kinds: [NDKKind.Article ]}])` which will give them typed events as `NDKArticle`.
* All kind numbers are valid and none of them are more correct than others, there is no "community-defined kinds" vs "core NIP specifications", all kind numbers are equally valid.
* The enum `NDKKind` does define many different kind numbers like NDKKind.Highlight = 9802.
* `useSubscribe` returns `{events, eose}` -- there is NO `loading`. There is no `loading` ANYWHERE.