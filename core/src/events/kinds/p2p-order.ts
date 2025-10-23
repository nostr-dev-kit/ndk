import type { NDK } from "../../ndk/index.js";
import type { ContentTag } from "../content-tagger.js";
import type { NDKTag, NostrEvent } from "../index.js";
import { NDKEvent } from "../index.js";
import { NDKKind } from "./index.js";

/**
 * Order type for P2P trades
 */
export type P2POrderType = "sell" | "buy";

/**
 * Order status for P2P trades
 */
export type P2POrderStatus = "pending" | "canceled" | "in-progress" | "success";

/**
 * Payment layer for P2P trades
 */
export type P2POrderLayer = "onchain" | "lightning" | "liquid";

/**
 * Network for P2P trades
 */
export type P2POrderNetwork = "mainnet" | "testnet" | "signet";

/**
 * Rating information for P2P order maker
 */
export interface P2PRating {
    total_reviews: number;
    total_rating: number;
    last_rating: number;
    max_rate: number;
    min_rate: number;
}

/**
 * Represents a NIP-69 Peer-to-peer Order event.
 *
 * This NIP defines a simple standard for peer-to-peer order events, which enables
 * the creation of a big liquidity pool for all p2p platforms participating.
 *
 * Events are addressable events and use 38383 as event kind.
 *
 * @group Kind Wrapper
 * @see https://github.com/nostr-protocol/nips/blob/master/69.md
 */
export class NDKP2POrder extends NDKEvent {
    static kind = NDKKind.P2POrder;
    static kinds = [NDKKind.P2POrder];

    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.P2POrder;
    }

    /**
     * Creates a NDKP2POrder from an existing NDKEvent.
     *
     * @param event NDKEvent to create the NDKP2POrder from.
     * @returns NDKP2POrder
     */
    static from(event: NDKEvent): NDKP2POrder {
        return new NDKP2POrder(event.ndk, event);
    }

    /**
     * Getter for the order ID (d tag).
     * A unique identifier for the order.
     *
     * @returns {string | undefined} - The order ID if available, otherwise undefined.
     */
    get orderId(): string | undefined {
        return this.tagValue("d");
    }

    /**
     * Setter for the order ID (d tag).
     *
     * @param {string | undefined} id - The order ID to set.
     */
    set orderId(id: string | undefined) {
        this.removeTag("d");
        if (id) this.tags.push(["d", id]);
    }

    /**
     * Getter for the order type.
     *
     * @returns {P2POrderType | undefined} - "sell" or "buy".
     */
    get orderType(): P2POrderType | undefined {
        return this.tagValue("k") as P2POrderType | undefined;
    }

    /**
     * Setter for the order type.
     *
     * @param {P2POrderType | undefined} type - "sell" or "buy".
     */
    set orderType(type: P2POrderType | undefined) {
        this.removeTag("k");
        if (type) this.tags.push(["k", type]);
    }

    /**
     * Getter for the fiat currency (ISO 4217).
     *
     * @returns {string | undefined} - The asset being traded.
     */
    get fiatCurrency(): string | undefined {
        return this.tagValue("f");
    }

    /**
     * Setter for the fiat currency (ISO 4217).
     *
     * @param {string | undefined} currency - The asset being traded (e.g., "USD", "EUR", "VES").
     */
    set fiatCurrency(currency: string | undefined) {
        this.removeTag("f");
        if (currency) this.tags.push(["f", currency]);
    }

    /**
     * Getter for the order status.
     *
     * @returns {P2POrderStatus | undefined} - "pending", "canceled", "in-progress", or "success".
     */
    get status(): P2POrderStatus | undefined {
        return this.tagValue("s") as P2POrderStatus | undefined;
    }

    /**
     * Setter for the order status.
     *
     * @param {P2POrderStatus | undefined} status - The order status.
     */
    set status(status: P2POrderStatus | undefined) {
        this.removeTag("s");
        if (status) this.tags.push(["s", status]);
    }

    /**
     * Getter for the Bitcoin amount in satoshis.
     * If 0, means that the amount of satoshis will be obtained from a public API
     * after the taker accepts the order.
     *
     * @returns {number | undefined} - The amount of Bitcoin to be traded in satoshis.
     */
    get amount(): number | undefined {
        const amt = this.tagValue("amt");
        return amt !== undefined ? Number.parseInt(amt) : undefined;
    }

    /**
     * Setter for the Bitcoin amount in satoshis.
     *
     * @param {number | undefined} amount - The amount in satoshis.
     */
    set amount(amount: number | undefined) {
        this.removeTag("amt");
        if (amount !== undefined) this.tags.push(["amt", amount.toString()]);
    }

    /**
     * Getter for the fiat amount being traded.
     * For range orders, returns an array with [min, max].
     *
     * @returns {number | [number, number] | undefined} - The fiat amount or range.
     */
    get fiatAmount(): number | [number, number] | undefined {
        const faTag = this.getMatchingTags("fa");
        if (faTag.length === 0) return undefined;

        const values = faTag[0].slice(1).map(Number.parseFloat);
        if (values.length === 1) return values[0];
        if (values.length === 2) return [values[0], values[1]];
        return undefined;
    }

    /**
     * Setter for the fiat amount being traded.
     *
     * @param {number | [number, number] | undefined} amount - Single value or [min, max] range.
     */
    set fiatAmount(amount: number | [number, number] | undefined) {
        this.removeTag("fa");
        if (amount === undefined) return;

        if (Array.isArray(amount)) {
            this.tags.push(["fa", amount[0].toString(), amount[1].toString()]);
        } else {
            this.tags.push(["fa", amount.toString()]);
        }
    }

    /**
     * Getter for the payment methods.
     *
     * @returns {string[] | undefined} - Array of payment methods.
     */
    get paymentMethods(): string[] | undefined {
        const pmTag = this.getMatchingTags("pm");
        if (pmTag.length === 0) return undefined;
        return pmTag[0].slice(1);
    }

    /**
     * Setter for the payment methods.
     *
     * @param {string[] | undefined} methods - Array of payment method strings.
     */
    set paymentMethods(methods: string[] | undefined) {
        this.removeTag("pm");
        if (methods && methods.length > 0) {
            this.tags.push(["pm", ...methods]);
        }
    }

    /**
     * Getter for the premium percentage.
     *
     * @returns {number | undefined} - The percentage of the premium the maker is willing to pay.
     */
    get premium(): number | undefined {
        const prem = this.tagValue("premium");
        return prem !== undefined ? Number.parseFloat(prem) : undefined;
    }

    /**
     * Setter for the premium percentage.
     *
     * @param {number | undefined} premium - The premium percentage.
     */
    set premium(premium: number | undefined) {
        this.removeTag("premium");
        if (premium !== undefined) this.tags.push(["premium", premium.toString()]);
    }

    /**
     * Getter for the rating information.
     *
     * @returns {P2PRating | undefined} - The rating of the maker.
     */
    get rating(): P2PRating | undefined {
        const ratingStr = this.tagValue("rating");
        if (!ratingStr) return undefined;

        try {
            return JSON.parse(ratingStr) as P2PRating;
        } catch {
            return undefined;
        }
    }

    /**
     * Setter for the rating information.
     *
     * @param {P2PRating | undefined} rating - The rating object.
     */
    set rating(rating: P2PRating | undefined) {
        this.removeTag("rating");
        if (rating) {
            this.tags.push(["rating", JSON.stringify(rating)]);
        }
    }

    /**
     * Getter for the source URL.
     *
     * @returns {string | undefined} - The source of the order (URL that redirects to the order).
     */
    get source(): string | undefined {
        return this.tagValue("source");
    }

    /**
     * Setter for the source URL.
     *
     * @param {string | undefined} source - The source URL.
     */
    set source(source: string | undefined) {
        this.removeTag("source");
        if (source) this.tags.push(["source", source]);
    }

    /**
     * Getter for the network.
     *
     * @returns {P2POrderNetwork | undefined} - "mainnet", "testnet", "signet", etc.
     */
    get network(): P2POrderNetwork | undefined {
        return this.tagValue("network") as P2POrderNetwork | undefined;
    }

    /**
     * Setter for the network.
     *
     * @param {P2POrderNetwork | undefined} network - The network to use.
     */
    set network(network: P2POrderNetwork | undefined) {
        this.removeTag("network");
        if (network) this.tags.push(["network", network]);
    }

    /**
     * Getter for the layer.
     *
     * @returns {P2POrderLayer | undefined} - "onchain", "lightning", "liquid", etc.
     */
    get layer(): P2POrderLayer | undefined {
        return this.tagValue("layer") as P2POrderLayer | undefined;
    }

    /**
     * Setter for the layer.
     *
     * @param {P2POrderLayer | undefined} layer - The layer to use.
     */
    set layer(layer: P2POrderLayer | undefined) {
        this.removeTag("layer");
        if (layer) this.tags.push(["layer", layer]);
    }

    /**
     * Getter for the maker's name.
     *
     * @returns {string | undefined} - The name of the maker.
     */
    get name(): string | undefined {
        return this.tagValue("name");
    }

    /**
     * Setter for the maker's name.
     *
     * @param {string | undefined} name - The name to set.
     */
    set name(name: string | undefined) {
        this.removeTag("name");
        if (name) this.tags.push(["name", name]);
    }

    /**
     * Getter for the geohash.
     * Useful for face-to-face trades.
     *
     * @returns {string | undefined} - The geohash of the operation.
     */
    get geohash(): string | undefined {
        return this.tagValue("g");
    }

    /**
     * Setter for the geohash.
     *
     * @param {string | undefined} geohash - The geohash to set.
     */
    set geohash(geohash: string | undefined) {
        this.removeTag("g");
        if (geohash) this.tags.push(["g", geohash]);
    }

    /**
     * Getter for the bond amount.
     * The bond is a security deposit that both parties must pay.
     *
     * @returns {number | undefined} - The bond amount.
     */
    get bond(): number | undefined {
        const bondVal = this.tagValue("bond");
        return bondVal !== undefined ? Number.parseInt(bondVal) : undefined;
    }

    /**
     * Setter for the bond amount.
     *
     * @param {number | undefined} bond - The bond amount.
     */
    set bond(bond: number | undefined) {
        this.removeTag("bond");
        if (bond !== undefined) this.tags.push(["bond", bond.toString()]);
    }

    /**
     * Getter for the expiration timestamp.
     * See NIP-40 for expiration handling.
     *
     * @returns {number | undefined} - The Unix timestamp of when the order expires.
     */
    get expiration(): number | undefined {
        const exp = this.tagValue("expiration");
        return exp !== undefined ? Number.parseInt(exp) : undefined;
    }

    /**
     * Setter for the expiration timestamp.
     *
     * @param {number | undefined} timestamp - The Unix timestamp for expiration.
     */
    set expiration(timestamp: number | undefined) {
        this.removeTag("expiration");
        if (timestamp !== undefined) this.tags.push(["expiration", timestamp.toString()]);
    }

    /**
     * Getter for the platform.
     *
     * @returns {string | undefined} - The platform that created the order.
     */
    get platform(): string | undefined {
        return this.tagValue("y");
    }

    /**
     * Setter for the platform.
     *
     * @param {string | undefined} platform - The platform name.
     */
    set platform(platform: string | undefined) {
        this.removeTag("y");
        if (platform) this.tags.push(["y", platform]);
    }

    /**
     * Getter for the document type.
     * Should always be "order" for NIP-69 events.
     *
     * @returns {string | undefined} - The document type.
     */
    get documentType(): string | undefined {
        return this.tagValue("z");
    }

    /**
     * Setter for the document type.
     *
     * @param {string | undefined} docType - The document type (typically "order").
     */
    set documentType(docType: string | undefined) {
        this.removeTag("z");
        if (docType) this.tags.push(["z", docType]);
    }

    /**
     * Generates content tags for the P2P order.
     *
     * Ensures that required tags are set with default values if not provided.
     *
     * @returns {ContentTag} - The generated content tags.
     */
    async generateTags(): Promise<ContentTag> {
        super.generateTags();

        // Ensure document type is set
        if (!this.documentType) {
            this.documentType = "order";
        }

        // Ensure status is set
        if (!this.status) {
            this.status = "pending";
        }

        return super.generateTags();
    }
}
