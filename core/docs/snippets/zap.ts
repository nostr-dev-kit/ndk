// Import the package
import NDK, {NDKZapper} from "@nostr-dev-kit/ndk";

// Create a new NDK instance with explicit relays
const ndk = new NDK();

const user = await ndk.fetchUser("pablo@f7z.io");

if (user) {

    const lnPay = ({pr: 'lightning_url'}) => {
        console.log("please pay to complete the zap");
    };
    const zapper = new NDKZapper(user, 1000, {lnPay});
    zapper.zap();
}
