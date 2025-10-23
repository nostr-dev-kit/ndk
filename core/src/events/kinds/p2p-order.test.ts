import { NDK } from "../../ndk/index.js";
import { NDKKind } from "./index.js";
import { NDKP2POrder, type P2PRating } from "./p2p-order.js";

describe("NDKP2POrder", () => {
    let ndk: NDK;

    beforeEach(() => {
        ndk = new NDK();
    });

    describe("constructor", () => {
        it("creates a new P2P order event with default kind", () => {
            const order = new NDKP2POrder(ndk);
            expect(order.kind).toBe(NDKKind.P2POrder);
            expect(order.kind).toBe(38383);
        });

        it("creates a P2P order from raw event", () => {
            const rawEvent = {
                kind: 38383,
                created_at: 1702548701,
                content: "",
                tags: [
                    ["d", "test-order-id"],
                    ["k", "sell"],
                    ["f", "USD"],
                    ["s", "pending"],
                ],
                pubkey: "test-pubkey",
            };

            const order = new NDKP2POrder(ndk, rawEvent);
            expect(order.orderId).toBe("test-order-id");
            expect(order.orderType).toBe("sell");
            expect(order.fiatCurrency).toBe("USD");
            expect(order.status).toBe("pending");
        });
    });

    describe("from()", () => {
        it("creates NDKP2POrder from NDKEvent", () => {
            const order = new NDKP2POrder(ndk);
            order.orderId = "test-id";
            order.orderType = "buy";

            const newOrder = NDKP2POrder.from(order);
            expect(newOrder).toBeInstanceOf(NDKP2POrder);
            expect(newOrder.orderId).toBe("test-id");
            expect(newOrder.orderType).toBe("buy");
        });
    });

    describe("orderId", () => {
        it("gets and sets order ID (d tag)", () => {
            const order = new NDKP2POrder(ndk);
            order.orderId = "unique-order-123";
            expect(order.orderId).toBe("unique-order-123");
        });
    });

    describe("orderType", () => {
        it("gets and sets order type", () => {
            const order = new NDKP2POrder(ndk);
            order.orderType = "sell";
            expect(order.orderType).toBe("sell");

            order.orderType = "buy";
            expect(order.orderType).toBe("buy");
        });
    });

    describe("fiatCurrency", () => {
        it("gets and sets fiat currency", () => {
            const order = new NDKP2POrder(ndk);
            order.fiatCurrency = "VES";
            expect(order.fiatCurrency).toBe("VES");

            order.fiatCurrency = "EUR";
            expect(order.fiatCurrency).toBe("EUR");
        });
    });

    describe("status", () => {
        it("gets and sets order status", () => {
            const order = new NDKP2POrder(ndk);
            order.status = "pending";
            expect(order.status).toBe("pending");

            order.status = "in-progress";
            expect(order.status).toBe("in-progress");

            order.status = "success";
            expect(order.status).toBe("success");

            order.status = "canceled";
            expect(order.status).toBe("canceled");
        });
    });

    describe("amount", () => {
        it("gets and sets Bitcoin amount in satoshis", () => {
            const order = new NDKP2POrder(ndk);
            order.amount = 100000;
            expect(order.amount).toBe(100000);

            order.amount = 0;
            expect(order.amount).toBe(0);
        });
    });

    describe("fiatAmount", () => {
        it("gets and sets single fiat amount", () => {
            const order = new NDKP2POrder(ndk);
            order.fiatAmount = 100;
            expect(order.fiatAmount).toBe(100);
        });

        it("gets and sets fiat amount range", () => {
            const order = new NDKP2POrder(ndk);
            order.fiatAmount = [50, 200];
            expect(order.fiatAmount).toEqual([50, 200]);
        });
    });

    describe("paymentMethods", () => {
        it("gets and sets payment methods", () => {
            const order = new NDKP2POrder(ndk);
            order.paymentMethods = ["face to face", "bank transfer"];
            expect(order.paymentMethods).toEqual(["face to face", "bank transfer"]);
        });

        it("handles single payment method", () => {
            const order = new NDKP2POrder(ndk);
            order.paymentMethods = ["cash"];
            expect(order.paymentMethods).toEqual(["cash"]);
        });
    });

    describe("premium", () => {
        it("gets and sets premium percentage", () => {
            const order = new NDKP2POrder(ndk);
            order.premium = 1.5;
            expect(order.premium).toBe(1.5);
        });
    });

    describe("rating", () => {
        it("gets and sets rating object", () => {
            const order = new NDKP2POrder(ndk);
            const rating: P2PRating = {
                total_reviews: 10,
                total_rating: 45.5,
                last_rating: 5,
                max_rate: 5,
                min_rate: 1,
            };

            order.rating = rating;
            expect(order.rating).toEqual(rating);
        });

        it("handles JSON parsing for rating", () => {
            const rawEvent = {
                kind: 38383,
                created_at: 1702548701,
                content: "",
                tags: [
                    ["d", "test-order-id"],
                    [
                        "rating",
                        '{"total_reviews":1,"total_rating":3.0,"last_rating":3,"max_rate":5,"min_rate":1}',
                    ],
                ],
                pubkey: "test-pubkey",
            };

            const order = new NDKP2POrder(ndk, rawEvent);
            expect(order.rating).toEqual({
                total_reviews: 1,
                total_rating: 3.0,
                last_rating: 3,
                max_rate: 5,
                min_rate: 1,
            });
        });
    });

    describe("source", () => {
        it("gets and sets source URL", () => {
            const order = new NDKP2POrder(ndk);
            order.source = "https://t.me/p2plightning/123";
            expect(order.source).toBe("https://t.me/p2plightning/123");
        });
    });

    describe("network", () => {
        it("gets and sets network", () => {
            const order = new NDKP2POrder(ndk);
            order.network = "mainnet";
            expect(order.network).toBe("mainnet");

            order.network = "testnet";
            expect(order.network).toBe("testnet");
        });
    });

    describe("layer", () => {
        it("gets and sets layer", () => {
            const order = new NDKP2POrder(ndk);
            order.layer = "lightning";
            expect(order.layer).toBe("lightning");

            order.layer = "onchain";
            expect(order.layer).toBe("onchain");

            order.layer = "liquid";
            expect(order.layer).toBe("liquid");
        });
    });

    describe("name", () => {
        it("gets and sets maker name", () => {
            const order = new NDKP2POrder(ndk);
            order.name = "Nakamoto";
            expect(order.name).toBe("Nakamoto");
        });
    });

    describe("geohash", () => {
        it("gets and sets geohash", () => {
            const order = new NDKP2POrder(ndk);
            order.geohash = "ezs42";
            expect(order.geohash).toBe("ezs42");
        });
    });

    describe("bond", () => {
        it("gets and sets bond amount", () => {
            const order = new NDKP2POrder(ndk);
            order.bond = 5000;
            expect(order.bond).toBe(5000);

            order.bond = 0;
            expect(order.bond).toBe(0);
        });
    });

    describe("expiration", () => {
        it("gets and sets expiration timestamp", () => {
            const order = new NDKP2POrder(ndk);
            const timestamp = 1719391096;
            order.expiration = timestamp;
            expect(order.expiration).toBe(timestamp);
        });
    });

    describe("platform", () => {
        it("gets and sets platform", () => {
            const order = new NDKP2POrder(ndk);
            order.platform = "lnp2pbot";
            expect(order.platform).toBe("lnp2pbot");

            order.platform = "mostro";
            expect(order.platform).toBe("mostro");
        });
    });

    describe("documentType", () => {
        it("gets and sets document type", () => {
            const order = new NDKP2POrder(ndk);
            order.documentType = "order";
            expect(order.documentType).toBe("order");
        });
    });

    describe("generateTags()", () => {
        it("sets default document type if not provided", async () => {
            const order = new NDKP2POrder(ndk);
            await order.generateTags();
            expect(order.documentType).toBe("order");
        });

        it("sets default status if not provided", async () => {
            const order = new NDKP2POrder(ndk);
            await order.generateTags();
            expect(order.status).toBe("pending");
        });

        it("does not override existing document type", async () => {
            const order = new NDKP2POrder(ndk);
            order.documentType = "custom";
            await order.generateTags();
            expect(order.documentType).toBe("custom");
        });

        it("does not override existing status", async () => {
            const order = new NDKP2POrder(ndk);
            order.status = "in-progress";
            await order.generateTags();
            expect(order.status).toBe("in-progress");
        });
    });

    describe("complete NIP-69 example", () => {
        it("creates a complete P2P order matching the spec", () => {
            const order = new NDKP2POrder(ndk);

            order.orderId = "ede61c96-4c13-4519-bf3a-dcf7f1e9d842";
            order.orderType = "sell";
            order.fiatCurrency = "VES";
            order.status = "pending";
            order.amount = 0;
            order.fiatAmount = 100;
            order.paymentMethods = ["face to face", "bank transfer"];
            order.premium = 1;
            order.rating = {
                total_reviews: 1,
                total_rating: 3.0,
                last_rating: 3,
                max_rate: 5,
                min_rate: 1,
            };
            order.source = "https://t.me/p2plightning/xxxxxxx";
            order.network = "mainnet";
            order.layer = "lightning";
            order.name = "Nakamoto";
            order.bond = 0;
            order.expiration = 1719391096;
            order.platform = "lnp2pbot";
            order.documentType = "order";

            expect(order.kind).toBe(38383);
            expect(order.orderId).toBe("ede61c96-4c13-4519-bf3a-dcf7f1e9d842");
            expect(order.orderType).toBe("sell");
            expect(order.fiatCurrency).toBe("VES");
            expect(order.status).toBe("pending");
            expect(order.amount).toBe(0);
            expect(order.fiatAmount).toBe(100);
            expect(order.paymentMethods).toEqual(["face to face", "bank transfer"]);
            expect(order.premium).toBe(1);
            expect(order.rating).toEqual({
                total_reviews: 1,
                total_rating: 3.0,
                last_rating: 3,
                max_rate: 5,
                min_rate: 1,
            });
            expect(order.source).toBe("https://t.me/p2plightning/xxxxxxx");
            expect(order.network).toBe("mainnet");
            expect(order.layer).toBe("lightning");
            expect(order.name).toBe("Nakamoto");
            expect(order.bond).toBe(0);
            expect(order.expiration).toBe(1719391096);
            expect(order.platform).toBe("lnp2pbot");
            expect(order.documentType).toBe("order");
        });
    });
});
