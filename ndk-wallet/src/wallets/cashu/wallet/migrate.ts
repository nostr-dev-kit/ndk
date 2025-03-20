import NDK, { NDKCashuMintList, NDKEvent, NDKKind, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from ".";

/**
 * This function checks if the user had legacy cashu wallets, if they do, it migrates them to the new format.
 */
export async function migrateCashuWallet(ndk: NDK) {
    let mintList = await getMintList(ndk);

    const oldWallets = await getOldWallets(ndk);
    if (oldWallets.length === 0) return;

    const privKeys = new Map<string, NDKPrivateKeySigner>();
    const mints = new Set<string>();

    const newWallet = new NDKCashuWallet(ndk);

    for (const wallet of oldWallets) {
        const { privkey, mints: walletMints } = await extractInfoFromLegacyWallet(wallet);
        if (privkey) {
            // get the privkey of the wallet
            newWallet.addPrivkey(privkey);
        }

        // add the mints from the wallet
        for (const mint of walletMints) mints.add(mint);
    }

    cleanupMints(mints);
    if (mintList) {
        cleanupMintList(mintList);
        for (const mint of mintList.mints) mints.add(mint);

        // Sync the mint list
        mintList.mints = Array.from(mints);

        // If the mint list didn't have a p2pk, set it to the first pubkey
        if (!mintList.p2pk && privKeys.size > 0) mintList.p2pk = Array.from(privKeys.keys())[0];
        await mintList.toNostrEvent();
    } else {
        console.log("no mint list found, creating new one");

        mintList = new NDKCashuMintList(ndk);
        mintList.mints = Array.from(mints);
        await mintList.toNostrEvent();
    }

    newWallet.mints = Array.from(mints);

    // publish the new wallet
    await newWallet.publish();

    mintList.p2pk = await newWallet.getP2pk();

    // publish the mint list
    await mintList.publishReplaceable();

    // delete the old wallets
    for (const wallet of oldWallets) {
        wallet.tags = [["d", wallet.dTag ?? ""], ["deleted"]];
        await wallet.publishReplaceable();
    }
}

async function getMintList(ndk: NDK) {
    const activeUser = ndk.activeUser;
    if (!activeUser) throw new Error("No active user");

    const mintList = await ndk.fetchEvent({
        kinds: [NDKKind.CashuMintList],
        authors: [activeUser.pubkey],
    });
    if (!mintList) return;

    return NDKCashuMintList.from(mintList);
}

/**
 * Get non-deleted legacy cashu wallets
 */
async function getOldWallets(ndk: NDK) {
    const user = ndk.activeUser;
    if (!user) throw new Error("No active user");

    const walletEvents = await ndk.fetchEvents([
        { kinds: [NDKKind.LegacyCashuWallet], authors: [user.pubkey] },
    ]);

    return Array.from(walletEvents).filter((event) => !event.hasTag("deleted"));
}

/**
 * Extract info from legacy wallet
 */
async function extractInfoFromLegacyWallet(wallet: NDKEvent) {
    const mints: string[] = [];
    let privkey: string | undefined;

    try {
        // decrypt the wallet content, extract the privkey
        const origContent = wallet.content;
        await wallet.decrypt();
        const privTags = JSON.parse(wallet.content);
        for (const tag of privTags) {
            if (tag[0] === "privkey") privkey = tag[1];
            if (tag[0] === "mint") mints.push(tag[1]);
        }
        wallet.content = origContent;

        return { privkey, mints };
    } catch (error) {
        console.error("Error decrypting legacy wallet", error);
    }

    return { privkey, mints };
}

function cleanupMints(mints: Set<string>) {
    // remove testnut mints
    for (const mint of mints) if (mint.match(/testnut/)) mints.delete(mint);

    return mints;
}

function cleanupMintList(mintList: NDKCashuMintList) {
    mintList.mints = mintList.mints.filter((mint) => !mint.match(/testnut/));
}
