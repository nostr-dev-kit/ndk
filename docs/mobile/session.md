# Session Management

`ndk-mobile` provides a way to manage session events that are typically necessary to have available throughout an entire app and should be monitored throughout the lifetime of the app, for example, the follow-list, muted pubkeys, NIP-60 wallets, bookmarks, etc -- Anything that is relevant throughout your entire app, you would want to make available through the ndk-mobile's session.

The `useNDKSession` hook provides access to user's information.

Say for example you want to allow your user to interface with their bookmarks, you want to have access to their bookmarks anywhere in the app both for reading and writing.

# Initialiazing

Once your user logs in, you want to initialize the session

```tsx
const { ndk } = useNDK();
const currentUser = useNDKCurrentUser();

// use to track if, for example, we want to show a loader screen
// while the session is starting
const [appReady, setAppReady] = useState(false);

// When the user logs in
useEffect(() => {
    if (!ndk || !currentUser) return;

    initializeSession(
        ndk,
        currentUser,
        settingsStore,
        {
            follows: true, // load the user's follow list
            muteList: true, // load the user's mute list
            kinds: extraKindsRequired, // explained further down
            filters: sessionFilters, // explained below
        },
        {
            onReady: () => setAppReady(true),
        }
    );
}, [ndk, currentUser?.pubkey]);
```

### `kinds` option

If your app is interested in some particular kinds, say for example the user's
image curation set, you would probably want to load that in the session and make it
broadly available throughout the app.

The `kinds` option allows you to express which kinds, and optionally NDK-kind wrappers to
instantiate when the events are received.

Ths parameter

```ts

const kinds = new Map([
    [NDKKind.ImageCurationSet, { wrapper: NDKList }],
]);

const { ndk } = useNDK();
const currentUser = useNDKCurrentUser();
const { init: initializeSession } = useNDKSession();
const follows = useFollows();
const muteList = useMuteList();

useEffect(() => {
    if (!currentUser) return;
    initializeSession(
        ndk,
        currentUser,
        {
            follows: true, // get the user's follow list
            muteList: true, // get the user's mute list
        }
    );
}, [currentUser?.pubkey])

return (<View>
    <Text>Follows: {follows ? 'not loaded yet' : follows?.length}</Text>
</View>)

```

Now say you want to allow the user to bookmark something with the click of a button:

```tsx
const { imageCurationSet } = useNDKSessionEventKind<NDKList>(NDKList, NDKKind.ImageCurationSet, {
    create: true,
});

const bookmark = async () => {
    await imageCurationSet.addItem(event);
};
```

Now, when your app calls the `bookmark` function, it will add the event to the user's image curation set, if none exists it will create one for you.
