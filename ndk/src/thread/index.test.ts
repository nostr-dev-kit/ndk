import {
    eventIsPartOfThread,
    eventIsReply,
    eventThreads,
    eventsBySameAuthor,
    getReplyTag,
    getRootTag,
} from ".";
import type { NDKEventId } from "../events";
import { NDKEvent } from "../events";

const op = new NDKEvent(undefined, {
    id: "op",
    pubkey: "pubkey1",
    created_at: 1711962787,
    kind: 11,
    tags: [
        ["title", "This is a note"],
        ["h", "pubkey1"],
    ],
    content: "Here is my note",
});
const thread1 = new NDKEvent(undefined, {
    id: "thread1",
    pubkey: "pubkey1",
    created_at: 1711962911,
    kind: 12,
    tags: [
        ["e", "op", "ws://localhost:5577", "reply"],
        ["p", "pubkey1"],
    ],
    content: "thread 1",
});
const reply1 = new NDKEvent(undefined, {
    id: "reply1",
    pubkey: "pubkey2",
    created_at: 1711962911,
    kind: 12,
    tags: [
        ["e", "op", "ws://localhost:5577", "reply"],
        ["p", "pubkey1"],
    ],
    content: "reply 1",
});
const quote1 = new NDKEvent(undefined, {
    id: "quote1",
    pubkey: "pubkey2",
    created_at: 1711962911,
    kind: 12,
    tags: [
        ["q", "op"],
        ["p", "pubkey3"],
    ],
    content: "quote 1",
});

// This mocks what a filter for {"#e": ["op"], "#q": ["op"]} would return
const allEventsToEvaluate = [thread1, reply1, quote1];

describe("Threads to make Gigi ⚡🧡 happy", () => {
    describe("eventIsPartOfThread", () => {
        it("properly identifies events that are part of a thread", () => {
            const eventsByAuthor = eventsBySameAuthor(op, allEventsToEvaluate);
            expect(eventIsPartOfThread(op, thread1, eventsByAuthor)).toBe(true);
        });
    });

    describe("eventIsReply", () => {
        const threadIds = new Set<NDKEventId>();

        beforeEach(() => {
            const thread = eventThreads(op, allEventsToEvaluate);
            thread.forEach((event) => threadIds.add(event.id));
        });

        it("properly identifies events that are replies", () => {
            expect(eventIsReply(op, reply1, threadIds)).toBe(true);
        });

        it("properly identifies events that are not replies", () => {
            expect(eventIsReply(op, thread1, threadIds)).toBe(false);
        });

        it("properly identifies quotes as not replies", () => {
            expect(eventIsReply(op, quote1, threadIds)).toBe(false);
        });

        it("properly discerns a reply to a reply as not being a direct reply to the main event", () => {
            const rootEvent = new NDKEvent(undefined, {
                created_at: 1713168025,
                content: "Be a chad\n\nGM\n\nhttps://m.primal.net/HvSa.jpg",
                tags: [],
                kind: 1,
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                id: "b58922a716933ff927822f9c055c20f54e0aa871f114bb896da8c5a0666de741",
            });
            const reply1 = new NDKEvent(undefined, {
                created_at: 1713168240,
                content: "We need a female version of ‘Chad’.",
                tags: [
                    ["e", "b58922a716933ff927822f9c055c20f54e0aa871f114bb896da8c5a0666de741"],
                    ["p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
                ],
                kind: 1,
                pubkey: "cfe3b4316d905335b6ce056ba0ec230b587a334381e82bf9a02a184f2d068f8d",
                id: "504529ff26419b239f84d195dec3ceccce21802f6e85ca0cdf88d735c4f2212c",
            });
            const replyToReply = new NDKEvent(undefined, {
                created_at: 1713168536,
                content: "Work your magic Marie",
                tags: [
                    ["e", "b58922a716933ff927822f9c055c20f54e0aa871f114bb896da8c5a0666de741"],
                    ["e", "504529ff26419b239f84d195dec3ceccce21802f6e85ca0cdf88d735c4f2212c"],
                    ["p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
                    ["p", "cfe3b4316d905335b6ce056ba0ec230b587a334381e82bf9a02a184f2d068f8d"],
                ],
                kind: 1,
                pubkey: "3492dd43d496a237f4441fd801f5078b63542c3e158ffea903cb020a1af4ffdd",
                id: "fd5557342652545ae70dbb73eaa602528089a12bb44485cec40c4a57e0c7205b",
            });

            expect(eventIsReply(rootEvent, reply1)).toBe(true);
            expect(eventIsReply(rootEvent, replyToReply)).toBe(false);
        });

        it("identifies replies that use a root marker without a reply as a replies", () => {
            const rootEvent = new NDKEvent(undefined, {
                created_at: 1713168025,
                content: "Be a chad\n\nGM\n\nhttps://m.primal.net/HvSa.jpg",
                tags: [],
                kind: 1,
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
                id: "b58922a716933ff927822f9c055c20f54e0aa871f114bb896da8c5a0666de741",
            });
            const withRootMarker = new NDKEvent(undefined, {
                id: "5acab1220290c5494e77ff573757d2d2f89660fce86445d2125bd3e3190249fc",
                pubkey: "b744173153afab07aec01b55809c7ea8f44dd00bab78b0cac5b706fc4282f67a",
                created_at: 1713171435,
                kind: 1,
                tags: [
                    [
                        "e",
                        "b58922a716933ff927822f9c055c20f54e0aa871f114bb896da8c5a0666de741",
                        "",
                        "root",
                    ],
                    ["p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
                ],
                content: "GM\nCHAD IS RAD",
                sig: "b5a5f9e9d05639b222b08c1149e690386fd7d50f55d13e68dea390c8e12b4e9dbd54fbf655eee5388d2ecb8d0c7d6e3729772c1caaa4b36dd8ed719aea639a5b",
            });

            expect(eventIsReply(rootEvent, withRootMarker)).toBe(true);
        });

        it("properly identifies a reply to a reply by the same author of the op as not part of a thread", () => {
            const opEvent = new NDKEvent(undefined, {
                id: "c2fe486097fb72a49081baba7b53c3cffa886e9e0117462b9c31f2e79f09c1e7",
                pubkey: "c1fc7771f5fa418fd3ac49221a18f19b42ccb7a663da8f04cbbf6c08c80d20b1",
                created_at: 1713514965,
                kind: 1,
                tags: [],
                content:
                    'So I hear I am an ecash hater?\nTo be clear, I love ecash, it has great applications, such as paid API calls like in Wasabi. The worlds soft currencies will be ecash, built on Bitcoin stack.\nThere is however an issue when 90% bitcoiners think ecash is noncustodial, pegged, see it as a "scaling" solution.\n* There are no proof of reserve proposals that make sense, mints can always brr.\n* Ecash is not a scaling solution, it\'s a custodial solution.\n* You are giving someone your bitcoin, and they are giving you a thing they claim is bitcoin.\n* Mint operators should be aware of the legal risks.',
                sig: "0404562af5706ef330451be4dc0b8003959b7554bac47f7075c3fd616c21228d93c73f1d919de8ad2e8f09505ec572868ad82c3945ce7a3dcd6c5fdecc6e165b",
            });
            const replyEvent = new NDKEvent(undefined, {
                id: "f88d4af5cf5e2817e498903e5ed907566ebb9682f78f365cc60cf3c4009d1b48",
                pubkey: "f55678aa1f5d554536d456b13beab04f636d63fdedd586fe38a4cb9ce48c90bc",
                created_at: 1713516665,
                kind: 1,
                tags: [
                    [
                        "e",
                        "c2fe486097fb72a49081baba7b53c3cffa886e9e0117462b9c31f2e79f09c1e7",
                        "wss://nostr.mom/",
                        "root",
                    ],
                    [
                        "e",
                        "c2fe486097fb72a49081baba7b53c3cffa886e9e0117462b9c31f2e79f09c1e7",
                        "wss://nostr.mom/",
                        "reply",
                    ],
                    [
                        "p",
                        "c1fc7771f5fa418fd3ac49221a18f19b42ccb7a663da8f04cbbf6c08c80d20b1",
                        "",
                        "mention",
                    ],
                ],
                content:
                    "All points valid. But I would love to see Cashu as a base in lnbits, as it is already a custodial multi-wallet.",
                sig: "67946ee386c5d178292adf7a6408a14e3bdbfd2a6073c92527761bce41f827248b6689c0a971982a3927d8d768e67f37cee4d47aa16c186653d0964b0e912259",
            });
            const replyToReplyEvent = new NDKEvent(undefined, {
                id: "876b69c0452b0243ab9509dfb928c1cf86cbae1ab4aca15eb49f9b4bc714f558",
                pubkey: "c1fc7771f5fa418fd3ac49221a18f19b42ccb7a663da8f04cbbf6c08c80d20b1",
                created_at: 1713526057,
                kind: 1,
                tags: [
                    [
                        "e",
                        "c2fe486097fb72a49081baba7b53c3cffa886e9e0117462b9c31f2e79f09c1e7",
                        "",
                        "root",
                    ],
                    [
                        "e",
                        "c2fe486097fb72a49081baba7b53c3cffa886e9e0117462b9c31f2e79f09c1e7",
                        "",
                        "root",
                    ],
                    [
                        "e",
                        "f88d4af5cf5e2817e498903e5ed907566ebb9682f78f365cc60cf3c4009d1b48",
                        "",
                        "reply",
                    ],
                    ["p", "c1fc7771f5fa418fd3ac49221a18f19b42ccb7a663da8f04cbbf6c08c80d20b1"],
                    ["p", "f55678aa1f5d554536d456b13beab04f636d63fdedd586fe38a4cb9ce48c90bc"],
                ],
                content: "That was the original plan 😔",
                sig: "673baff19d995328a32fb88e37ce298bf95529f31e158841d57e89936c75cf9627486cba5754b95cc69dce64c6261471397d088f820a055737d875adcfcc790c",
            });

            expect(eventIsReply(opEvent, replyToReplyEvent)).toBe(false);
        });
    });

    describe("event with no markers", () => {
        const eventWithNoMarkers = new NDKEvent(undefined, {
            created_at: 1713860015,
            content:
                "There have been plenty of people who have expressed explicit distaste for it nostr:npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6 nostr:npub12262qa4uhw7u8gdwlgmntqtv7aye8vdcmvszkqwgs0zchel6mz7s6cgrkj nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft nostr:npub1qqqqqqyz0la2jjl752yv8h7wgs3v098mh9nztd4nr6gynaef6uqqt0n47m and probably more i’m forgetting. I think someone even tried to remove it as a nip if I remember correctly.",
            tags: [
                ["e", "280098061928d822887022b5dfadd4e18cc1710b4f4a01d531d41bcf4ab2d4ff"],
                ["e", "1c15684fe4258b06c0e49e25f38b4897e1bc47210ad3ab78c65e022e3ad36e0f"],
                ["p", "d0debf9fb12def81f43d7c69429bb784812ac1e4d2d53a202db6aac7ea4b466c"],
                ["p", "d0debf9fb12def81f43d7c69429bb784812ac1e4d2d53a202db6aac7ea4b466c"],
                ["p", "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d"],
                ["p", "52b4a076bcbbbdc3a1aefa3735816cf74993b1b8db202b01c883c58be7fad8bd"],
                ["p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"],
                ["p", "00000000827ffaa94bfea288c3dfce4422c794fbb96625b6b31e9049f729d700"],
            ],
            kind: 1,
            pubkey: "32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245",
            id: "24a4a28e4660593eacba285db8321d4660a1e83583b0ee8aec82e4de0e4ed21a",
        });

        describe("getRootTag", () => {
            it("properly handles events without markers", () => {
                expect(getRootTag(eventWithNoMarkers)![1]).toBe(
                    "280098061928d822887022b5dfadd4e18cc1710b4f4a01d531d41bcf4ab2d4ff"
                );
            });
        });

        describe("getReplyTag", () => {
            it("properly handles events without markers", () => {
                expect(getReplyTag(eventWithNoMarkers)![1]).toBe(
                    "1c15684fe4258b06c0e49e25f38b4897e1bc47210ad3ab78c65e022e3ad36e0f"
                );
            });
        });
    });
});
