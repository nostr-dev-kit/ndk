import NDK from "@nostr-dev-kit/ndk";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { NDKUser } from "@nostr-dev-kit/ndk";
import type { NDKUserParams } from "@nostr-dev-kit/ndk";
import * as nostrTools from "nostr-tools";
import { EventGenerator } from "../mocks/event-generator";

/**
 * Class for generating deterministic test users
 */
export class UserGenerator {
    private static privateKeys: Record<string, string> = {
        alice: "1fbc12b81e0b21f10fb219e88dd76fc80c7aa5369779e44e762fec6f460d6a89",
        bob: "d30b946562050e6ced827113da15208730879c46547061b404434edff63236fa",
        carol: "5b4a934c43656a7d874251b013491b24cc87d52af8b9df469976de24a8582d03",
        dave: "3ee8168c362c3c6b3b88b0458c7075308d7f8a3ee2f19459a5919e8781e3646a",
        eve: "eefc920c5fe4e9c0510334def5f1d8df9d5a91a84b659ad2f8087ccbc732d571",
    };

    /**
     * Get a user with a deterministic private key
     * @param name The name of the user (alice, bob, carol, dave, eve)
     * @param ndk The NDK instance to use for the user
     * @returns The NDK user
     */
    static async getUser(name: string, ndk?: NDK): Promise<NDKUser> {
        const privateKey = UserGenerator.privateKeys[name.toLowerCase()];
        if (!privateKey) {
            throw new Error(`Unknown test user: ${name}`);
        }

        const signer = new NDKPrivateKeySigner(privateKey);
        await signer.blockUntilReady();
        const user = new NDKUser({ hexpubkey: signer.pubkey });
        if (ndk) {
            user.ndk = ndk;
        }
        return user;
    }

    /**
     * Get a user with a random private key
     * @param ndk The NDK instance to use for the user
     * @returns The NDK user
     */
    static async getRandomUser(ndk?: NDK): Promise<NDKUser> {
        const signer = NDKPrivateKeySigner.generate();
        await signer.blockUntilReady();
        const user = new NDKUser({ hexpubkey: signer.pubkey });
        if (ndk) {
            user.ndk = ndk;
        }
        return user;
    }
}

/**
 * Class for generating deterministic test signers
 */
export class SignerGenerator {
    /**
     * Get a signer for a specific test user
     * @param name The name of the user (alice, bob, carol, dave, eve)
     * @returns The NDK signer
     */
    static getSigner(name: string): NDKPrivateKeySigner {
        const privateKey = UserGenerator.privateKeys[name.toLowerCase()];

        if (!privateKey) {
            throw new Error(`Unknown test user: ${name}`);
        }

        return new NDKPrivateKeySigner(privateKey);
    }

    /**
     * Generate a random signer
     * @returns The NDK signer
     */
    static getRandomSigner(): NDKPrivateKeySigner {
        return NDKPrivateKeySigner.generate();
    }
}

/**
 * Enhanced event generation utilities that build on EventGenerator
 */
export class TestEventFactory {
    private ndk: NDK;

    constructor(ndk: NDK) {
        this.ndk = ndk;
        EventGenerator.setNDK(ndk);
    }

    /**
     * Create a signed text note from a specific user
     * @param content The content of the note
     * @param user The user that authored the note, or name of predefined test user
     * @param kind The kind of the event (defaults to 1)
     * @returns The signed event
     */
    async createSignedTextNote(content: string, user: NDKUser | string, kind = 1): Promise<any> {
        let pubkey: string;
        let signer: NDKPrivateKeySigner;

        if (typeof user === "string") {
            signer = SignerGenerator.getSigner(user);
            await signer.blockUntilReady();
            pubkey = signer.pubkey;
        } else {
            pubkey = user.pubkey;
            // Note: This won't produce an actual valid signature since we don't have the user's private key
            signer = NDKPrivateKeySigner.generate();
        }

        const event = EventGenerator.createEvent(kind, content, pubkey);

        if (typeof user === "string") {
            this.ndk.signer = signer;
            await event.sign();
        }

        return event;
    }

    /**
     * Create a direct message from one user to another
     * @param content The content of the message
     * @param fromUser The sender (author)
     * @param toUser The recipient
     * @returns The created event (not necessarily signed)
     */
    async createDirectMessage(
        content: string,
        fromUser: NDKUser | string,
        toUser: NDKUser | string
    ): Promise<any> {
        let fromPubkey: string;
        let toPubkey: string;

        if (typeof fromUser === "string") {
            const user = await UserGenerator.getUser(fromUser, this.ndk);
            fromPubkey = user.pubkey;
        } else {
            fromPubkey = fromUser.pubkey;
        }

        if (typeof toUser === "string") {
            const user = await UserGenerator.getUser(toUser, this.ndk);
            toPubkey = user.pubkey;
        } else {
            toPubkey = toUser.pubkey;
        }

        const event = EventGenerator.createEvent(4, content, fromPubkey);
        event.tags.push(["p", toPubkey]);

        if (typeof fromUser === "string") {
            const signer = SignerGenerator.getSigner(fromUser);
            this.ndk.signer = signer;
            await event.sign();
        }

        return event;
    }

    /**
     * Create a reply to an event
     * @param originalEvent The event being replied to
     * @param content The content of the reply
     * @param fromUser The author of the reply
     * @param kind The kind of the reply (defaults to same as original for kind 1, or 1111 for other kinds)
     * @returns The created reply event (not necessarily signed)
     */
    async createReply(
        originalEvent: any,
        content: string,
        fromUser: NDKUser | string,
        kind?: number
    ): Promise<any> {
        let fromPubkey: string;

        if (typeof fromUser === "string") {
            const user = await UserGenerator.getUser(fromUser, this.ndk);
            fromPubkey = user.pubkey;
        } else {
            fromPubkey = fromUser.pubkey;
        }

        // Get the appropriate kind
        const replyKind = kind || (originalEvent.kind === 1 ? 1 : 1111);

        // Create a new event
        const replyEvent = EventGenerator.createEvent(replyKind, content, fromPubkey);

        // Tag the original event
        if (originalEvent.kind === 1) {
            // For kind 1, use the standard NIP-10 approach
            replyEvent.tags.push(["e", originalEvent.id, "", "root", originalEvent.pubkey]);
            replyEvent.tags.push(["p", originalEvent.pubkey]);
        } else {
            // For other kinds, use uppercase tags for the root
            replyEvent.tags.push([
                "A",
                `${originalEvent.kind}:${originalEvent.pubkey}:${originalEvent.getTagValue("d") || ""}`,
                "",
            ]);
            replyEvent.tags.push([
                "a",
                `${originalEvent.kind}:${originalEvent.pubkey}:${originalEvent.getTagValue("d") || ""}`,
                "",
            ]);
            replyEvent.tags.push(["P", originalEvent.pubkey]);
            replyEvent.tags.push(["K", originalEvent.kind.toString()]);
        }

        if (typeof fromUser === "string") {
            const signer = SignerGenerator.getSigner(fromUser);
            this.ndk.signer = signer;
            await replyEvent.sign();
        }

        return replyEvent;
    }

    /**
     * Creates a chain of events (e.g., a thread)
     * @param initialContent Content of the first message
     * @param replies Array of {content, author} objects for each reply
     * @returns Array of events in the chain
     */
    async createEventChain(
        initialContent: string,
        initialAuthor: NDKUser | string,
        replies: Array<{ content: string; author: NDKUser | string }>
    ): Promise<any[]> {
        // Create the root event
        const rootEvent = await this.createSignedTextNote(initialContent, initialAuthor);

        // Create the chain of replies
        const chain = [rootEvent];
        let parentEvent = rootEvent;

        for (const reply of replies) {
            const replyEvent = await this.createReply(parentEvent, reply.content, reply.author);
            chain.push(replyEvent);
            parentEvent = replyEvent;
        }

        return chain;
    }
}

/**
 * Complete test fixture environment
 */
export class TestFixture {
    ndk: NDK;
    eventFactory: TestEventFactory;

    constructor() {
        this.ndk = new NDK();
        this.eventFactory = new TestEventFactory(this.ndk);
    }

    /**
     * Get a predefined test user
     * @param name The name of the user (alice, bob, carol, dave, eve)
     * @returns The NDK user
     */
    async getUser(name: string): Promise<NDKUser> {
        return UserGenerator.getUser(name, this.ndk);
    }

    /**
     * Get a signer for a predefined test user
     * @param name The name of the user
     * @returns The NDK signer
     */
    getSigner(name: string): NDKPrivateKeySigner {
        const signer = SignerGenerator.getSigner(name);
        return signer;
    }

    /**
     * Set up the NDK instance with a specific signer
     * @param name The name of the predefined user to use as signer
     */
    setupSigner(name: string): void {
        this.ndk.signer = this.getSigner(name);
    }
}
