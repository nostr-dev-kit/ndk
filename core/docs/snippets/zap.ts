// Import the package
import NDK, { NDKZapper } from "@nostr-dev-kit/ndk";
import { NDKWebLNWallet } from "@nostr-dev-kit/wallet";

// Create a new NDK instance with explicit relays
const ndk = new NDK();

const wallet = new NDKWebLNWallet(ndk);

ndk.wallet = wallet;

const user = await ndk.fetchUser("pablo@f7z.io");
if (user) {
    const zapper = new NDKZapper(user, 1000, "msat", { ndk });

    await zapper.zap();
}
