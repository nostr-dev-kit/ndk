export type Proof = {
    /**
     * Keyset id, used to link proofs to a mint an its MintKeys.
     */
    id: string;
    /**
     * Amount denominated in Satoshis. Has to match the amount of the mints signing key.
     */
    amount: number;
    /**
     * The initial secret that was (randomly) chosen for the creation of this proof.
     */
    secret: string;
    /**
     * The unblinded signature for this secret, signed by the mints private key.
     */
    C: string;
};
