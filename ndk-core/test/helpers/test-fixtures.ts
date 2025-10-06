import type { NDKEvent } from "../../src";
import { NDK } from "../../src/ndk";
import { NDKPrivateKeySigner } from "../../src/signers/private-key";
import { NDKUser } from "../../src/user";
import { EventGenerator } from "../mocks/event-generator";

type Names = "alice" | "bob" | "carol" | "dave" | "eve";

/**
 * Class for generating deterministic test users
 */
export class UserGenerator {
    public static privateKeys: Record<string, string> = {
        alice: "1f4ca0aba830226f3780bcba8dd646a5149a2be50267cb87dcdd973669977d81",
        bob: "c025cd26f6e11481566dd2459a6efa2d31976e285d04b797660eed82f0fd091f",
        carol: "5955f65c522f8ce30ed2f5863e0a0638dba945f3d2c3f372b7906e33b4cb1b83",
        dave: "2f820ff78ce23247dc58ac44492cf5c5f7554bc2753284aa62c7caea1db77cf6",
        eve: "c18cda5e6451783736a36cf2875f5e954617e44db03cb84bda43040c995dc585",
    };

    /**
     * Get a user with a deterministic private key
     * @param name The name of the user (alice, bob, carol, dave, eve)
     * @param ndk The NDK instance to use for the user
     * @returns The NDK user
     */
    static async getUser(name: Names, ndk?: NDK): Promise<NDKUser> {
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
     * Get the private key for a specific test user
     * @param name The name of the user (alice, bob, carol, dave, eve)
     * @returns The private key hex string
     */
    static getPrivateKey(name: Names): string {
        const privateKey = UserGenerator.privateKeys[name.toLowerCase()];
        if (!privateKey) {
            throw new Error(`Unknown test user: ${name}`);
        }
        return privateKey;
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
    static getSigner(name: Names): NDKPrivateKeySigner {
        const privateKey = UserGenerator.getPrivateKey(name); // Use the public static method

        if (!privateKey) {
            throw new Error(`Unknown test user: ${name}`);
        }

        return new NDKPrivateKeySigner(privateKey);
    }

    static async sign(event: NDKEvent, user: Names): Promise<NDKEvent> {
        const signer = SignerGenerator.getSigner(user);
        await event.sign(signer);
        return event;
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
    async createSignedTextNote(content: string, user: NDKUser | Names | undefined, kind = 1): Promise<any> {
        let pubkey: string;
        let signer: NDKPrivateKeySigner;

        if (typeof user === "string") {
            signer = SignerGenerator.getSigner(user);
            await signer.blockUntilReady();
            pubkey = signer.pubkey;
        } else {
            signer = NDKPrivateKeySigner.generate();
            pubkey = signer.pubkey;
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
    async createDirectMessage(content: string, fromUser: NDKUser | Names, toUser: NDKUser | Names): Promise<any> {
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
    async createReply(originalEvent: any, content: string, fromUser: NDKUser | Names, kind?: number): Promise<any> {
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
        initialAuthor: NDKUser | Names,
        replies: Array<{ content: string; author: NDKUser | Names }>,
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
    async getUser(name: Names): Promise<NDKUser> {
        return UserGenerator.getUser(name, this.ndk);
    }

    /**
     * Get a signer for a predefined test user
     * @param name The name of the user
     * @returns The NDK signer
     */
    getSigner(name: Names): NDKPrivateKeySigner {
        const signer = SignerGenerator.getSigner(name);
        return signer;
    }

    /**
     * Set up the NDK instance with a specific signer
     * @param name The name of the predefined user to use as signer
     */
    setupSigner(name: Names): void {
        this.ndk.signer = this.getSigner(name);
    }
}
