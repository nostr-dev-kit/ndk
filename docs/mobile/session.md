# Session Management

`ndk-mobile` provides a way to manage session events that are typically necessary to have available throughout an entire app.

The `useNDKSession` hook provides access to user's information.

Say for example you want to allow your user to interface with their bookmarks, you want to have access to their bookmarks anywhere in the app both for reading and writing.

```ts

const kinds = new Map([
    [NDKKind.ImageCurationSet, { wrapper: NDKList }],
]);

const { ndk } = useNDK();
const currentUser = useNDKCurrentUser();
const { init: initializeSession } = useNDKSession();
const follows = useFollws();
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
