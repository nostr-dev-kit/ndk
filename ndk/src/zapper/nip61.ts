import type { NDKNutzap } from "../events/kinds/nutzap";
import type { Proof } from "../events/kinds/nutzap/proof";

/**
 * Provides information that should be used to send a NIP-61 nutzap.
 * mints: URLs of the mints that can be used.
 * relays: URLs of the relays where nutzap must be published
 * p2pk: Optional pubkey to use for P2PK lock
 */
export type CashuPaymentInfo = {
    /**
     * Mints that must be used for the payment
     */
    mints: string[];

    /**
     * Relays where nutzap must be published
     */
    relays: string[];

    /**
     * Optional pubkey to use for P2PK lock
     */
    p2pk?: string;
};

export type NDKZapConfirmationCashu = NDKNutzap;

/**
 * This is what a wallet implementing Cashu payments should provide back
 * when a payment has been requested.
 */
export type NDKPaymentConfirmationCashu = {
    /**
     * Proof of the payment
     */
    proofs: Proof[];

    /**
     * Mint
     */
    mint: string;
};
