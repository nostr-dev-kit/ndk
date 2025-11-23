import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

const signer = NDKPrivateKeySigner.generate();

// Encrypt with a password
const password = "user-chosen-password";
const ncryptsec = signer.encryptToNcryptsec(password);

// Store securely (e.g., localStorage)
localStorage.setItem("encrypted_key", ncryptsec);

const restoredButEncrypted = localStorage.getItem("encrypted_key");

if (restoredButEncrypted) {
    // Later, restore the signer
    const restoredSigner = NDKPrivateKeySigner.fromNcryptsec(restoredButEncrypted, password);

    console.log("Original pubkey:", signer.pubkey);
    console.log("Restored pubkey:", restoredSigner.pubkey);
}
