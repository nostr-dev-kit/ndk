import { describe, expect, test } from "vitest";
import { NDKEvent } from "../events";
import { NDKArticle } from "../events/kinds/article";
import { NDK } from "../ndk";
import { NDKPrivateKeySigner } from "../signers/private-key";
import { generateZapRequest } from "./nip57";

describe("generateZapRequest", () => {
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

    test("zap request for article should include both a and e tags", async () => {
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
