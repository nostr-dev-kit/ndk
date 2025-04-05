import type { Proof } from "@cashu/cashu-ts";
import type { NDKCashuToken, NDKEventId } from "@nostr-dev-kit/ndk";
import type { NDKCashuWallet } from "..";
import type { MintUrl } from "../../mint/utils";
import { getBalance, getMintsBalances } from "./balance";
import { type GetOpts, addProof, getProofEntries, reserveProofs, unreserveProofs, updateProof } from "./proofs";
import { addToken, removeTokenId } from "./token";
import { update } from "./update";

export type ProofC = string;
export type ProofState = "available" | "reserved" | "deleted";
export type TokenState = "available" | "deleted";

export type JournalEntry = {
    memo: string;
    timestamp: number;
    metadata: {
        type?: string;
        mint?: MintUrl;
        id: string;
        relayUrl?: string;
        cache?: boolean;
        amount?: number;
    };
};

/**
 * A description of the changes that need to be made to the wallet state
 * to reflect changes that have occurred.
 */
export type WalletProofChange = {
    // reserve proofs are moved into an NDKKind.CashuReserve event until we verify that the recipient has received them
    reserve?: Proof[];

    // destroy proofs are deleted from the wallet
    destroy?: Proof[];

    // store proofs are added to the wallet
    store?: Proof[];
    mint: MintUrl;
};

/**
 * A description of tokens that need to be changed to reflect the changes that have occurred.
 */
export type WalletTokenChange = {
    // token ids that are to be deleted
    deletedTokenIds: Set<string>;

    // these are the Cs of the proofs that are getting deleted
    deletedProofs: Set<string>;

    // proofs that are to be moved to a reserve
    reserveProofs: Proof[];

    // proofs that are to be added to the wallet in a new token
    saveProofs: Proof[];
};

export type ProofEntry = {
    proof: Proof;
    mint: MintUrl;
    tokenId?: NDKEventId;
    state: ProofState;

    /**
     * The timestamp of the last time the proof state was updated
     */
    timestamp: number;
};

export type TokenEntry = {
    /**
     * We want this optional because we might just be marking a deletion of a token
     * we never loaded (or haven't attempted to load yet)
     */
    token?: NDKCashuToken;
    state: TokenState;
    proofEntries?: ProofEntry[];
};

export type GetTokenEntry = {
    tokenId: NDKEventId | null;
    token?: NDKCashuToken;
    mint: MintUrl;
    proofEntries: ProofEntry[];
};

/**
 * This class represents the state of the wallet at any given time.
 * It uses information coming from relays, as well as optimistic assumptions
 * about the changing state of the wallet.
 */
export class WalletState {
    /**
     * the amounts that are intended to be reserved
     * this is the net amount we are trying to pay out,
     * excluding fees and coin sizes
     * e.g. we might want to pay 5 sats, have 2 sats in fees
     * and we're using 2 inputs that add up to 8, the reserve amount is 5
     * while the reserve proofs add up to 8
     */
    public reserveAmounts: number[] = [];

    /**
     * Source of truth of the proofs this wallet has/had.
     */
    public proofs = new Map<ProofC, ProofEntry>();

    /**
     * The tokens that are known to this wallet.
     */
    public tokens = new Map<NDKEventId, TokenEntry>();

    public journal: JournalEntry[] = [];

    constructor(
        public wallet: NDKCashuWallet,
        public reservedProofCs: Set<string> = new Set<string>(),
    ) {}

    /** This is a debugging function that dumps the state of the wallet */
    public dump() {
        const res = {
            proofs: Array.from(this.proofs.values()),
            balances: this.getMintsBalance(),
            totalBalance: this.getBalance(),
            tokens: Array.from(this.tokens.values()),
        };

        return res;
    }

    /***************************
     * Tokens
     ***************************/

    public addToken = addToken.bind(this);

    public removeTokenId = removeTokenId.bind(this);

    /***************************
     * Proof management
     ***************************/

    public addProof = addProof.bind(this);

    /**
     * Reserves a number of selected proofs and a specific amount.
     *
     * The amount and total of the proofs don't need to match. We
     * might want to use 5 sats and have 2 proofs of 4 sats each.
     * In that case, the reserve amount is 5, while the reserve proofs
     * add up to 8.
     */
    public reserveProofs = reserveProofs.bind(this);

    /**
     * Unreserves a number of selected proofs and a specific amount.
     */
    public unreserveProofs = unreserveProofs.bind(this);

    /**
     * Returns all proof entries, optionally filtered by mint and state
     */
    public getProofEntries = getProofEntries.bind(this);

    /**
     * Updates information about a proof
     */
    public updateProof = updateProof.bind(this);

    /**
     * Returns all proofs, optionally filtered by mint and state
     * @param opts.mint - optional mint to filter by
     * @param opts.onlyAvailable - only include available proofs @default true
     * @param opts.includeDeleted - include deleted proofs @default false
     */
    public getProofs(opts: GetOpts) {
        return this.getProofEntries(opts).map((entry) => entry.proof);
    }

    public getTokens(opts: GetOpts = { onlyAvailable: true }): Map<NDKEventId | null, GetTokenEntry> {
        const proofEntries = this.getProofEntries(opts);
        const tokens = new Map<NDKEventId | null, GetTokenEntry>();
        for (const proofEntry of proofEntries) {
            const tokenId = proofEntry.tokenId ?? null;
            const current: GetTokenEntry = tokens.get(tokenId) ?? {
                tokenId,
                mint: proofEntry.mint,
                proofEntries: [],
            };
            current.token ??= tokenId ? this.tokens.get(tokenId)?.token : undefined;
            current.proofEntries.push(proofEntry);
            tokens.set(tokenId, current);
        }

        return tokens;
    }

    /**
     * Gets a list of proofs for each mint
     * @returns
     */
    public getMintsProofs({
        validStates = new Set(["available"]),
    }: {
        validStates?: Set<ProofState>;
    } = {}): Map<MintUrl, Proof[]> {
        const mints = new Map<MintUrl, Proof[]>();
        for (const entry of this.proofs.values()) {
            if (!entry.mint || !entry.proof) continue;
            if (!validStates.has(entry.state)) continue;
            const current = mints.get(entry.mint) || [];
            current.push(entry.proof);
            mints.set(entry.mint, current);
        }
        return mints;
    }

    /***************************
     * Balance
     ***************************/

    /**
     * Returns the balance of the wallet, optionally filtered by mint and state
     *
     * @params opts.mint - optional mint to filter by
     * @params opts.onlyAvailable - only include available proofs @default true
     */
    public getBalance = getBalance.bind(this);

    /**
     * Returns the balances of the different mints
     *
     * @params opts.onlyAvailable - only include available proofs @default true
     */
    public getMintsBalance = getMintsBalances.bind(this);

    /***************************
     * State update
     ***************************/

    public update = update.bind(this);
}
