export type NDKLUD18ServicePayerData = Partial<{
    name: { mandatory: boolean };
    pubkey: { mandatory: boolean };
    identifier: { mandatory: boolean };
    email: { mandatory: boolean };
    auth: {
        mandatory: boolean;
        k1: string;
    };
}> &
    Record<string, unknown>;

export type NDKLnUrlData = {
    tag: string;
    callback: string;
    minSendable: number;
    maxSendable: number;
    metadata: string;
    payerData?: NDKLUD18ServicePayerData;
    commentAllowed?: number;

    /**
     * Pubkey of the zapper that should publish zap receipts for this user
     */
    nostrPubkey?: Hexpubkey;
    allowsNostr?: boolean;
};
