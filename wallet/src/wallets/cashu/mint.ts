import { CashuMint, CashuWallet, type GetInfoResponse, type MintKeys } from "@cashu/cashu-ts";
import type { MintUrl } from "./mint/utils";

const mintWallets = new Map<string, CashuWallet>();
const mintWalletPromises = new Map<string, Promise<CashuWallet | null>>();

function mintKey(mint: MintUrl, unit: string, pk?: Uint8Array) {
    if (unit === "sats") {
        unit = "sat";
    }

    if (pk) {
        const pkStr = new TextDecoder().decode(pk);
        return `${mint}-${unit}-${pkStr}`;
    }

    return `${mint}-${unit}`;
}

export async function walletForMint(
    mint: MintUrl,
    {
        pk,
        timeout = 5000,
        mintInfo,
        mintKeys,
        onMintInfoNeeded,
        onMintInfoLoaded,
        onMintKeysNeeded,
        onMintKeysLoaded,
    }: {
        pk?: Uint8Array;
        timeout?: number;
        mintInfo?: GetInfoResponse;
        mintKeys?: MintKeys[];
        onMintInfoNeeded?: (mint: string) => Promise<GetInfoResponse | undefined>;
        onMintInfoLoaded?: (mint: string, info: GetInfoResponse) => void;
        onMintKeysNeeded?: (mint: string) => Promise<MintKeys[] | undefined>;
        onMintKeysLoaded?: (mint: string, keysets: Map<string, MintKeys>) => void;
    } = {},
): Promise<CashuWallet | null> {
    const startTime = Date.now();
    const ts = () => `+${Date.now() - startTime}ms`;

    // Query cache for mint info
    if (onMintInfoNeeded) {
        console.log(`[MINT-CACHE ${ts()}] Querying cache for mint info: ${mint}`);
        const cacheStartTime = Date.now();
        mintInfo ??= await onMintInfoNeeded(mint);
        const cacheTime = Date.now() - cacheStartTime;
        if (mintInfo) {
            console.log(`[MINT-CACHE ${ts()}] ✓ Cache HIT for mint info: ${mint} (${cacheTime}ms)`, { name: mintInfo.name });
        } else {
            console.log(`[MINT-CACHE ${ts()}] ✗ Cache MISS for mint info: ${mint} (${cacheTime}ms)`);
        }
    }

    // Query cache for mint keys
    if (onMintKeysNeeded) {
        console.log(`[MINT-CACHE ${ts()}] Querying cache for mint keys: ${mint}`);
        const cacheStartTime = Date.now();
        mintKeys ??= await onMintKeysNeeded(mint);
        const cacheTime = Date.now() - cacheStartTime;
        if (mintKeys) {
            console.log(`[MINT-CACHE ${ts()}] ✓ Cache HIT for mint keys: ${mint} (${cacheTime}ms)`, { count: mintKeys.length });
        } else {
            console.log(`[MINT-CACHE ${ts()}] ✗ Cache MISS for mint keys: ${mint} (${cacheTime}ms)`);
        }
    }

    // Fetch and cache mint info if needed
    if (!mintInfo && onMintInfoLoaded) {
        console.log(`[MINT-CACHE ${ts()}] Fetching mint info from ${mint}/v1/info`);
        const fetchStartTime = Date.now();
        mintInfo = await CashuMint.getInfo(mint);
        const fetchTime = Date.now() - fetchStartTime;
        console.log(`[MINT-CACHE ${ts()}] Caching mint info: ${mint} (fetched in ${fetchTime}ms)`, { name: mintInfo.name });
        onMintInfoLoaded?.(mint, mintInfo);
    }

    const unit = "sat";
    const key = mintKey(mint, unit, pk);

    // Check if we already have a wallet for this mint
    if (mintWallets.has(key)) {
        console.log(`[MINT-CACHE ${ts()}] Returning cached wallet instance: ${mint}`);
        return mintWallets.get(key) as CashuWallet;
    }

    // Check if there's already a promise to load this wallet
    if (mintWalletPromises.has(key)) {
        console.log(`[MINT-CACHE ${ts()}] Wallet loading in progress, returning existing promise: ${mint}`);
        return mintWalletPromises.get(key) as Promise<CashuWallet | null>;
    }

    // Load mint info if needed (second check)
    if (!mintInfo) {
        if (onMintInfoNeeded) {
            console.log(`[MINT-CACHE ${ts()}] Querying cache for mint info (second check): ${mint}`);
            const cacheStartTime = Date.now();
            mintInfo = await onMintInfoNeeded(mint);
            const cacheTime = Date.now() - cacheStartTime;
            if (mintInfo) {
                console.log(`[MINT-CACHE ${ts()}] ✓ Cache HIT for mint info (second check): ${mint} (${cacheTime}ms)`, { name: mintInfo.name });
            } else {
                console.log(`[MINT-CACHE ${ts()}] ✗ Cache MISS for mint info (second check): ${mint} (${cacheTime}ms)`);
            }
        }

        if (!mintInfo && onMintInfoLoaded) {
            console.log(`[MINT-CACHE ${ts()}] Fetching mint info from ${mint}/v1/info (second check)`);
            const fetchStartTime = Date.now();
            mintInfo = await CashuMint.getInfo(mint);
            const fetchTime = Date.now() - fetchStartTime;
            console.log(`[MINT-CACHE ${ts()}] Caching mint info (second check): ${mint} (fetched in ${fetchTime}ms)`, { name: mintInfo.name });
            onMintInfoLoaded(mint, mintInfo);
        }
    }

    // Load mint keys if needed (second check)
    if (!mintKeys && onMintKeysNeeded) {
        console.log(`[MINT-CACHE ${ts()}] Querying cache for mint keys (second check): ${mint}`);
        const cacheStartTime = Date.now();
        mintKeys = await onMintKeysNeeded(mint);
        const cacheTime = Date.now() - cacheStartTime;
        if (mintKeys) {
            console.log(`[MINT-CACHE ${ts()}] ✓ Cache HIT for mint keys (second check): ${mint} (${cacheTime}ms)`, { count: mintKeys.length });
        } else {
            console.log(`[MINT-CACHE ${ts()}] ✗ Cache MISS for mint keys (second check): ${mint} (${cacheTime}ms)`);
        }
    }

    const wallet = new CashuWallet(new CashuMint(mint), {
        unit,
        bip39seed: pk,
        mintInfo,
        keys: mintKeys,
    });

    const loadPromise = new Promise<CashuWallet | null>(async (resolve) => {
        try {
            console.log(`[MINT-CACHE ${ts()}] Loading mint wallet: ${mint}`);
            const loadStartTime = Date.now();

            const timeoutPromise = new Promise((_, rejectTimeout) => {
                setTimeout(() => {
                    rejectTimeout(new Error("timeout loading mint"));
                }, timeout);
            });

            await Promise.race([wallet.loadMint(), timeoutPromise]);
            const loadTime = Date.now() - loadStartTime;
            console.log(`[MINT-CACHE ${ts()}] Mint wallet loaded: ${mint} (${loadTime}ms)`);

            mintWallets.set(key, wallet);
            mintWalletPromises.delete(key);

            if (wallet.keys) {
                console.log(`[MINT-CACHE ${ts()}] Caching mint keys after loadMint: ${mint}`, { count: wallet.keys.size });
                onMintKeysLoaded?.(mint, wallet.keys);
            }

            resolve(wallet);
        } catch (e: any) {
            console.error(`[WALLET ${ts()}] error loading mint`, mint, e.message);
            mintWalletPromises.delete(key);
            resolve(null);
        }
    });

    mintWalletPromises.set(key, loadPromise);
    return loadPromise;
}
