import { NDKCashuMintList, NDKEvent } from "@nostr-dev-kit/ndk";
import NDKWalletLifecycle from ".";

export default function handleMintList(
    this: NDKWalletLifecycle,
    event: NDKEvent
) {
    if (this._mintList && this._mintList.created_at! >= event.created_at!) return;

    const mintList = NDKCashuMintList.from(event);
    const prevPubkey = this._mintList?.p2pkPubkey;
    this._mintList = mintList;

    if (this.eosed && this._mintList) this.emit("mintlist", this._mintList);
    if (this._mintList.p2pkPubkey) this.setDefaultWallet(this._mintList.p2pkPubkey);
}