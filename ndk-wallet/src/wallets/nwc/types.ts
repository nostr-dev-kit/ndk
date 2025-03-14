// Method types
export type NDKNWCMethod =
    | "pay_invoice"
    | "multi_pay_invoice"
    | "pay_keysend"
    | "multi_pay_keysend"
    | "make_invoice"
    | "lookup_invoice"
    | "list_transactions"
    | "get_balance"
    | "get_info";

// Base types for requests and responses
export interface NDKNWCRequestBase {
    method: NDKNWCMethod;
    params: Record<string, any>;
}

export interface NDKNWCResponseBase<T = any> {
    result_type: NDKNWCMethod;
    error?: {
        code: NDKNWCErrorCode;
        message: string;
    };
    result: T | null;
}

// Error codes
export type NDKNWCErrorCode =
    | "RATE_LIMITED"
    | "NOT_IMPLEMENTED"
    | "INSUFFICIENT_BALANCE"
    | "QUOTA_EXCEEDED"
    | "RESTRICTED"
    | "UNAUTHORIZED"
    | "INTERNAL"
    | "OTHER"
    | "PAYMENT_FAILED"
    | "NOT_FOUND";

// Common types
export interface NDKNWCTransaction {
    type: "incoming" | "outgoing";
    invoice?: string;
    description?: string;
    description_hash?: string;
    preimage?: string;
    payment_hash: string;
    amount: number;
    fees_paid?: number;
    created_at: number;
    expires_at?: number;
    settled_at?: number;
    metadata?: Record<string, any>;
}

// Method-specific request params
export interface NDKNWCPayInvoiceParams {
    invoice: string;
    amount?: number;
}

export interface NDKNWCMakeInvoiceParams {
    amount: number;
    description?: string;
    description_hash?: string;
    expiry?: number;
}

export interface NDKNWCLookupInvoiceParams {
    payment_hash?: string;
    invoice?: string;
}

export interface NDKNWCListTransactionsParams {
    from?: number;
    until?: number;
    limit?: number;
    offset?: number;
    unpaid?: boolean;
    type?: "incoming" | "outgoing";
}

// Method-specific response results
export interface NDKNWCPayInvoiceResult {
    preimage: string;
    fees_paid?: number;
}

export interface NDKNWCMakeInvoiceResult {
    invoice: string;
    preimage: string;
    payment_hash: string;
    amount: number;
    description: string;
    description_hash: string;
    expiry: number;
    metadata?: Record<string, any>;
}

export interface NDKNWCGetBalanceResult {
    balance: number;
}

export interface NDKNWCGetInfoResult {
    alias: string;
    color: string;
    pubkey: string;
    network: "mainnet" | "testnet" | "signet" | "regtest";
    block_height: number;
    block_hash: string;
    methods: NDKNWCMethod[];
    notifications?: string[];
}

// Request/Response type mappings
export type NDKNWCRequestMap = {
    pay_invoice: NDKNWCPayInvoiceParams;
    make_invoice: NDKNWCMakeInvoiceParams;
    lookup_invoice: NDKNWCLookupInvoiceParams;
    list_transactions: NDKNWCListTransactionsParams;
    get_balance: Record<string, never>;
    get_info: Record<string, never>;
};

export type NDKNWCResponseMap = {
    pay_invoice: NDKNWCPayInvoiceResult;
    make_invoice: NDKNWCMakeInvoiceResult;
    lookup_invoice: NDKNWCTransaction;
    list_transactions: { transactions: NDKNWCTransaction[] };
    get_balance: NDKNWCGetBalanceResult;
    get_info: NDKNWCGetInfoResult;
};
