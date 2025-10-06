import type { CashuWallet, GetInfoResponse, MintKeys } from "@cashu/cashu-ts";
import { walletForMint } from "./cashu/mint";

export type MintInfoNeededCb = (mint: string) => Promise<GetInfoResponse | undefined>;
export type MintInfoLoadedCb = (mint: string, info: GetInfoResponse) => void;
export type MintKeysNeededCb = (mint: string) => Promise<MintKeys[] | undefined>;
export type MintKeysLoadedCb = (mint: string, keysets: Map<string, MintKeys>) => void;

export interface MintInterface {
    cashuWallets: Map<string, CashuWallet>;

    /**
     * Called when the wallet needs to load mint info. Use this
     * to load mint info from a database or other source.
     */
    onMintInfoNeeded?: MintInfoNeededCb;

    /**
     * Called when the wallet has loaded mint info.
     */
    onMintInfoLoaded?: MintInfoLoadedCb;

    /**
     * Called when the wallet needs to load mint keys. Use this
     * to load mint keys from a database or other source.
     */
    onMintKeysNeeded?: MintKeysNeededCb;

    /**
     * Called when the wallet has loaded mint keys.
     */
    onMintKeysLoaded?: MintKeysLoadedCb;

    /**
     * Get a cashu wallet for a mint.
     */
    getCashuWallet(mint: string): Promise<CashuWallet>;
}

export async function getCashuWallet(this: MintInterface, mint: string): Promise<CashuWallet> {
    if (this.cashuWallets.has(mint)) return this.cashuWallets.get(mint) as CashuWallet;

    const w = await walletForMint(mint, {
        onMintInfoNeeded: this.onMintInfoNeeded,
        onMintInfoLoaded: this.onMintInfoLoaded,
        onMintKeysNeeded: this.onMintKeysNeeded,
        onMintKeysLoaded: this.onMintKeysLoaded,
    });

    if (!w) throw new Error(`unable to load wallet for mint ${mint}`);
    this.cashuWallets.set(mint, w);
    return w;
}
