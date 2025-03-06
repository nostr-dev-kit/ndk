import { CashuWallet, CashuMint, GetInfoResponse, MintKeys } from "@cashu/cashu-ts";
import { MintUrl } from "./mint/utils";

const mintWallets = new Map<string, CashuWallet>();
const mintWalletPromises = new Map<string, Promise<CashuWallet | null>>();

function mintKey(mint: MintUrl, unit: string, pk?: Uint8Array) {
    if (unit === 'sats') {
        unit = 'sat';
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
        onMintKeysLoaded
    }: {
        pk?: Uint8Array,
        timeout?: number,
        mintInfo?: GetInfoResponse,
        mintKeys?: MintKeys[],
        onMintInfoNeeded?: (mint: string) => Promise<GetInfoResponse | undefined>,
        onMintInfoLoaded?: (mint: string, info: GetInfoResponse) => void,
        onMintKeysNeeded?: (mint: string) => Promise<MintKeys[] | undefined>,
        onMintKeysLoaded?: (mint: string, keysets: Map<string, MintKeys>) => void,
    } = {}
): Promise<CashuWallet | null> {
    mintInfo ??= await onMintInfoNeeded?.(mint);
    mintKeys ??= await onMintKeysNeeded?.(mint);

    if (!mintInfo && onMintInfoLoaded) {
        mintInfo = await CashuMint.getInfo(mint);
        onMintInfoLoaded?.(mint, mintInfo);
    }
    
    const unit = 'sat';

    const key = mintKey(mint, unit, pk);

    if (mintWallets.has(key)) return mintWallets.get(key) as CashuWallet;

    if (mintWalletPromises.has(key)) {
        return mintWalletPromises.get(key) as Promise<CashuWallet | null>;
    }

    const wallet = new CashuWallet(
        new CashuMint(mint),
        {
            unit,
            bip39seed: pk,
            mintInfo,
            keys: mintKeys
        });

    const loadPromise = new Promise<CashuWallet | null>(async (resolve) => {
        try {
            const timeoutPromise = new Promise((_, rejectTimeout) => {
                setTimeout(() => rejectTimeout(new Error("timeout loading mint")), timeout);
            });
            await Promise.race([wallet.loadMint(), timeoutPromise]);
            mintWallets.set(key, wallet);
            mintWalletPromises.delete(key);

            if (wallet.keys) onMintKeysLoaded?.(mint, wallet.keys);
            
            resolve(wallet);
        } catch (e: any) {
            console.error("[WALLET] error loading mint", mint, e.message);
            mintWalletPromises.delete(key);
            resolve(null);
        }
    });

    mintWalletPromises.set(key, loadPromise);
    return loadPromise;
}