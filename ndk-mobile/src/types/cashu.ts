import type { GetInfoResponse } from "@cashu/cashu-ts";

export type MintInfoResponse = GetInfoResponse;

/**
 * Stored mint information with metadata
 * @interface StoredMintInfo
 */
export interface StoredMintInfo {
    /** The mint URL */
    url: string;
    /** The mint information payload */
    payload: MintInfoResponse;
    /** When this information was created (in seconds) */
    created_at?: number;
    /** When this information was last updated (in seconds) */
    updated_at?: number;
}

/**
 * Represents a set of cryptographic keys from a Cashu mint
 * @interface MintKeys
 */
export interface MintKeys {
    /** The unique ID of this keyset */
    id: string;
    /** Key generation timestamp */
    counter?: number;
    /** Key ID mapping for each amount value */
    [key: string]: any;
}

/**
 * Stored mint keys with metadata
 * @interface StoredMintKeys
 */
export interface StoredMintKeys {
    /** The mint URL */
    url: string;
    /** The keyset ID */
    keyset_id: string;
    /** The mint keys payload */
    payload: MintKeys;
    /** When these keys were created (in seconds) */
    created_at?: number;
    /** When these keys were last updated (in seconds) */
    updated_at?: number;
}
