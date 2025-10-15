import { describe, expect, test } from "vitest";
import { NDKEvent } from "../events";
import { NDKArticle } from "../events/kinds/article";
import { NDK } from "../ndk";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { generateZapRequest } from "./nip57";

describe("generateZapRequest", () => {
    test("creates valid NIP-57 zap request with required fields", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const ndk = new NDK({ signer });
        const user = ndk.getUser({ pubkey: "recipient-pubkey" });

        const lnUrlData = {
            callback: "https://example.com/lnurlp/callback",
            tag: "payRequest",
            minSendable: 1000,
            maxSendable: 100000000,
            metadata: '[["text/plain","Pay to user"]]',
        };

        const zapRequest = await generateZapRequest(
            user,
            ndk,
            lnUrlData,
            "recipient-pubkey",
            5000,
            ["wss://relay1.com", "wss://relay2.com"],
            "Great post!",
        );

        expect(zapRequest).not.toBeNull();
        expect(zapRequest!.kind).toBe(9734);
        expect(zapRequest!.content).toBe("Great post!");

        // Check required tags
        const relaysTag = zapRequest!.tags.find((t) => t[0] === "relays");
        expect(relaysTag).toBeDefined();
        expect(relaysTag!.slice(1)).toEqual(["wss://relay1.com", "wss://relay2.com"]);

        const amountTag = zapRequest!.tags.find((t) => t[0] === "amount");
        expect(amountTag).toBeDefined();
        expect(amountTag![1]).toBe("5000");

        const lnurlTag = zapRequest!.tags.find((t) => t[0] === "lnurl");
        expect(lnurlTag).toBeDefined();
        expect(lnurlTag![1]).toBe("https://example.com/lnurlp/callback");

        const pTag = zapRequest!.tags.find((t) => t[0] === "p");
        expect(pTag).toBeDefined();
        expect(pTag![1]).toBe("recipient-pubkey");

        // Verify event is signed
        expect(zapRequest!.sig).toBeDefined();
        expect(zapRequest!.pubkey).toBe(signer.pubkey);
    });

    test("limits relays to maximum of 4", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const ndk = new NDK({ signer });
        const user = ndk.getUser({ pubkey: "recipient-pubkey" });

        const lnUrlData = {
            callback: "https://example.com/callback",
            tag: "payRequest",
            minSendable: 1000,
            maxSendable: 100000000,
            metadata: "[]",
        };

        const zapRequest = await generateZapRequest(user, ndk, lnUrlData, "recipient-pubkey", 1000, [
            "wss://relay1.com",
            "wss://relay2.com",
            "wss://relay3.com",
            "wss://relay4.com",
            "wss://relay5.com",
            "wss://relay6.com",
        ]);

        const relaysTag = zapRequest!.tags.find((t) => t[0] === "relays");
        expect(relaysTag!.length - 1).toBe(4); // -1 for the tag name
    });

    test("zap request for event includes e-tag and k-tag", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const ndk = new NDK({ signer });

        const targetEvent = new NDKEvent(ndk);
        targetEvent.kind = 1;
        targetEvent.content = "Test note";
        targetEvent.pubkey = "author-pubkey";
        targetEvent.id = "event-id-123";
        targetEvent.created_at = Math.floor(Date.now() / 1000);

        const lnUrlData = {
            callback: "https://example.com/callback",
            tag: "payRequest",
            minSendable: 1000,
            maxSendable: 100000000,
            metadata: "[]",
        };

        const zapRequest = await generateZapRequest(targetEvent, ndk, lnUrlData, "author-pubkey", 2000, [
            "wss://relay.com",
        ]);

        const eTags = zapRequest!.tags.filter((t) => t[0] === "e");
        expect(eTags).toHaveLength(1);
        expect(eTags[0][1]).toBe("event-id-123");

        const kTags = zapRequest!.tags.filter((t) => t[0] === "k");
        expect(kTags).toHaveLength(1);
        expect(kTags[0][1]).toBe("1");
    });

    test("handles empty comment", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const ndk = new NDK({ signer });
        const user = ndk.getUser({ pubkey: "recipient-pubkey" });

        const lnUrlData = {
            callback: "https://example.com/callback",
            tag: "payRequest",
            minSendable: 1000,
            maxSendable: 100000000,
            metadata: "[]",
        };

        const zapRequest = await generateZapRequest(user, ndk, lnUrlData, "recipient-pubkey", 1000, [
            "wss://relay.com",
        ]);

        expect(zapRequest!.content).toBe("");
    });

    test("only includes one p-tag", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const ndk = new NDK({ signer });
        const user = ndk.getUser({ pubkey: "recipient-pubkey" });

        const lnUrlData = {
            callback: "https://example.com/callback",
            tag: "payRequest",
            minSendable: 1000,
            maxSendable: 100000000,
            metadata: "[]",
        };

        // Try to add duplicate p-tags
        const additionalTags: [string, string][] = [
            ["p", "other-pubkey-1"],
            ["p", "other-pubkey-2"],
        ];

        const zapRequest = await generateZapRequest(
            user,
            ndk,
            lnUrlData,
            "recipient-pubkey",
            1000,
            ["wss://relay.com"],
            undefined,
            additionalTags,
        );

        const pTags = zapRequest!.tags.filter((t) => t[0] === "p");
        expect(pTags).toHaveLength(1);
        expect(pTags[0][1]).toBe("recipient-pubkey");
    });

    test("throws when multiple a-tags are present", async () => {
        const signer = NDKPrivateKeySigner.generate();
        const ndk = new NDK({ signer });

        const article = new NDKArticle(ndk);
        article.content = "Test article";
        article.title = "Test";
        article.published_at = Math.floor(Date.now() / 1000);
        article.created_at = article.published_at;
        article.pubkey = "author-pubkey";
        article.id = "article-id";

        const lnUrlData = {
            callback: "https://example.com/callback",
            tag: "payRequest",
            minSendable: 1000,
            maxSendable: 100000000,
            metadata: "[]",
        };

        // Add conflicting a-tag
        const conflictingTags: [string, string][] = [["a", "30023:different-author:different-identifier"]];

        await expect(
            generateZapRequest(
                article,
                ndk,
                lnUrlData,
                "author-pubkey",
                1000,
                ["wss://relay.com"],
                undefined,
                conflictingTags,
            ),
        ).rejects.toThrow("Only one a-tag is allowed");
    });

    test("throws when target event and additional e-tag conflict", async () => {
        const ndk = new NDK({
            signer: NDKPrivateKeySigner.generate(),
        });

        const targetEvent = new NDKEvent(ndk);
        targetEvent.kind = 1;
        targetEvent.content = "";
        targetEvent.pubkey = "test-pubkey";
        targetEvent.id = "target-event-id";
        targetEvent.created_at = Math.floor(Date.now() / 1000);

        const additionalTags: [string, string][] = [["e", "different-event-id"]];

        const lnUrlData = {
            callback: "https://example.com/zap",
            tag: "payRequest",
            minSendable: 1000,
            maxSendable: 100000000,
            metadata: '[["text/plain","Pay to Example"]]',
        };

        await expect(
            generateZapRequest(
                targetEvent,
                ndk,
                lnUrlData,
                "test-pubkey",
                1000,
                ["wss://relay.example.com"],
                undefined,
                additionalTags,
            ),
        ).rejects.toThrow("Only one e-tag is allowed");
    });

    test("zap request for article should include both a and e tags and k tag", async () => {
        const ndk = new NDK({
            signer: NDKPrivateKeySigner.generate(),
        });

        const article = new NDKArticle(ndk);
        article.content = "Test article content";
        article.title = "Test Article";
        article.published_at = Math.floor(Date.now() / 1000);
        article.created_at = article.published_at;
        article.pubkey = "author-pubkey";
        article.id = "article-id";

        // Create a tag that references the same article
        const additionalTags: [string, string][] = [["e", article.id]];

        const lnUrlData = {
            callback: "https://example.com/zap",
            tag: "payRequest",
            minSendable: 1000,
            maxSendable: 100000000,
            metadata: '[["text/plain","Pay to Example"]]',
        };

        const zapRequest = await generateZapRequest(
            article,
            ndk,
            lnUrlData,
            "zapper-pubkey",
            1000,
            ["wss://relay.example.com"],
            undefined,
            additionalTags,
        );

        // Verify both 'a' and 'e' tags are present
        const eTags = zapRequest?.tags.filter((t) => t[0] === "e");
        const aTags = zapRequest?.tags.filter((t) => t[0] === "a");

        expect(eTags).toHaveLength(1);
        expect(aTags).toHaveLength(1);
        expect(eTags[0][1]).toBe(article.id);
        expect(aTags[0][1]).toBe(article.tagId());

        // Verify k tag is present
        const kTags = zapRequest?.tags.filter((t) => t[0] === "k");
        expect(kTags).toHaveLength(1);
        expect(kTags[0][1]).toBe("30023");
    });

    test("zap request should reject when e-tag conflicts with article id", async () => {
        const ndk = new NDK({
            signer: NDKPrivateKeySigner.generate(),
        });

        const article = new NDKArticle(ndk);
        article.content = "Test article content";
        article.title = "Test Article";
        article.published_at = Math.floor(Date.now() / 1000);
        article.created_at = article.published_at;
        article.pubkey = "author-pubkey";
        article.id = "article-id";

        const lnUrlData = {
            callback: "https://example.com/zap",
            tag: "payRequest",
            minSendable: 1000,
            maxSendable: 100000000,
            metadata: '[["text/plain","Pay to Example"]]',
        };

        const conflictingTags: [string, string][] = [["e", "different-event-id"]];
        await expect(
            generateZapRequest(
                article,
                ndk,
                lnUrlData,
                "zapper-pubkey",
                1000,
                ["wss://relay.example.com"],
                undefined,
                conflictingTags,
            ),
        ).rejects.toThrow("Only one e-tag is allowed");
    });
});
