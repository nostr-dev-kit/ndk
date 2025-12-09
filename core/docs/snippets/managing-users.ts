import NDK from "@nostr-dev-kit/ndk";

const ndk = new NDK();

// From hex pubkey
const user1 = await ndk.fetchUser("3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d");

// From npub (NIP-19 encoded)
const user2 = await ndk.fetchUser("npub1n0sturny6w9zn2wwexju3m6asu7zh7jnv2jt2kx6tlmfhs7thq0qnflahe");

// From nprofile (includes relay hints)
const user3 = await ndk.fetchUser(
    "nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p",
);

// From NIP-05 identifier
const user4 = await ndk.fetchUser("pablo@test.com");
const user5 = await ndk.fetchUser("test.com"); // Uses _@test.com

// The method automatically detects the format
const user6 = await ndk.fetchUser("deadbeef..."); // Assumes hex pubkey
