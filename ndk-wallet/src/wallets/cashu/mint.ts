import { CashuWallet, CashuMint } from "@cashu/cashu-ts";
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
    unit: string,
    pk?: Uint8Array,
    timeout = 5000
): Promise<CashuWallet | null> {
    if (unit === 'sats' || unit.startsWith('msat')) {
        unit = 'sat';
    }

    const key = mintKey(mint, unit, pk);

    if (mintWallets.has(key)) return mintWallets.get(key) as CashuWallet;

    if (mintWalletPromises.has(key)) {
        return mintWalletPromises.get(key) as Promise<CashuWallet | null>;
    }

    const wallet = new CashuWallet(new CashuMint(mint), { unit, bip39seed: pk });
    console.log("[WALLET] loading mint", mint, { withPk: pk ? true : false });

    const loadPromise = new Promise<CashuWallet | null>(async (resolve) => {
        try {
            const timeoutPromise = new Promise((_, rejectTimeout) => {
                setTimeout(() => rejectTimeout(new Error("timeout loading mint")), timeout);
            });
            await Promise.race([wallet.loadMint(), timeoutPromise]);
            console.log("[WALLET] loaded mint", mint);
            mintWallets.set(key, wallet);
            mintWalletPromises.delete(key);
            resolve(wallet);
        } catch (e) {
            console.error("[WALLET] error loading mint", mint, e.message);
            mintWalletPromises.delete(key);
            resolve(null);
        }
    });

    mintWalletPromises.set(key, loadPromise);
    return loadPromise;
}