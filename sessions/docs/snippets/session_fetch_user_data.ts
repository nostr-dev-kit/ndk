import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

const sessions = new NDKSessionManager(ndk, {
    storage: new LocalStorage(),
    autoSave: true,
    fetches: {
        follows: true, // Fetch contact list
        mutes: true, // Fetch mute list
        relayList: true, // Fetch relay list
        wallet: true, // Fetch NIP-60 wallet
    },
});

const signer = new NDKPrivateKeySigner(nsecKey);
await sessions.login(signer);

// Access session data
console.log("Following:", sessions.activeSession?.followSet?.size, "users");
console.log("Muted:", sessions.activeSession?.muteSet?.size, "items");
