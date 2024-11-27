// Method types
export type NWCMethod = 
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
export interface NWCRequestBase {
    method: NWCMethod;
    params: Record<string, any>;
}

export interface NWCResponseBase<T = any> {
    result_type: NWCMethod;
    error?: {
        code: NWCErrorCode;
        message: string;
    };
    result: T | null;
}

// Error codes
export type NWCErrorCode = 
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
export interface Transaction {
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
export interface PayInvoiceParams {
    invoice: string;
    amount?: number;
}

export interface MakeInvoiceParams {
    amount: number;
    description?: string;
    description_hash?: string;
    expiry?: number;
}

export interface LookupInvoiceParams {
    payment_hash?: string;
    invoice?: string;
}

export interface ListTransactionsParams {
    from?: number;
    until?: number;
    limit?: number;
    offset?: number;
    unpaid?: boolean;
    type?: "incoming" | "outgoing";
}

// Method-specific response results
export interface PayInvoiceResult {
    preimage: string;
    fees_paid?: number;
}

export interface GetBalanceResult {
    balance: number;
}

export interface GetInfoResult {
    alias: string;
    color: string;
    pubkey: string;
    network: "mainnet" | "testnet" | "signet" | "regtest";
    block_height: number;
    block_hash: string;
    methods: NWCMethod[];
    notifications?: string[];
}

// Request/Response type mappings
export type NWCRequestMap = {
    pay_invoice: PayInvoiceParams;
    make_invoice: MakeInvoiceParams;
    lookup_invoice: LookupInvoiceParams;
    list_transactions: ListTransactionsParams;
    get_balance: Record<string, never>;
    get_info: Record<string, never>;
}

export type NWCResponseMap = {
    pay_invoice: PayInvoiceResult;
    make_invoice: Transaction;
    lookup_invoice: Transaction;
    list_transactions: { transactions: Transaction[] };
    get_balance: GetBalanceResult;
    get_info: GetInfoResult;
}