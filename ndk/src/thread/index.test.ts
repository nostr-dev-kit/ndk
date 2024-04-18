import { eventIsPartOfThread, eventIsReply, eventThreads, eventsBySameAuthor } from ".";
import { NDKEvent, type NDKEventId } from "../events";

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
            const rootEvent = new NDKEvent(undefined, { "created_at": 1713168025, "content": "Be a chad\n\nGM\n\nhttps://m.primal.net/HvSa.jpg", "tags": [], "kind": 1, "pubkey": "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52", "id": "b58922a716933ff927822f9c055c20f54e0aa871f114bb896da8c5a0666de741" });
            const reply1 = new NDKEvent(undefined, { "created_at": 1713168240, "content": "We need a female version of ‘Chad’.", "tags": [ [ "e", "b58922a716933ff927822f9c055c20f54e0aa871f114bb896da8c5a0666de741" ], [ "p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52" ] ], "kind": 1, "pubkey": "cfe3b4316d905335b6ce056ba0ec230b587a334381e82bf9a02a184f2d068f8d", "id": "504529ff26419b239f84d195dec3ceccce21802f6e85ca0cdf88d735c4f2212c" })
            const replyToReply = new NDKEvent(undefined, { "created_at": 1713168536, "content": "Work your magic Marie", "tags": [ [ "e", "b58922a716933ff927822f9c055c20f54e0aa871f114bb896da8c5a0666de741" ], [ "e", "504529ff26419b239f84d195dec3ceccce21802f6e85ca0cdf88d735c4f2212c" ], [ "p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52" ], [ "p", "cfe3b4316d905335b6ce056ba0ec230b587a334381e82bf9a02a184f2d068f8d" ] ], "kind": 1, "pubkey": "3492dd43d496a237f4441fd801f5078b63542c3e158ffea903cb020a1af4ffdd", "id": "fd5557342652545ae70dbb73eaa602528089a12bb44485cec40c4a57e0c7205b" });

            expect(eventIsReply(rootEvent, reply1)).toBe(true);
            expect(eventIsReply(rootEvent, replyToReply)).toBe(false);
        });

        it("identifies replies that use a root marker without a reply as a replies", () => {
            const rootEvent = new NDKEvent(undefined, { "created_at": 1713168025, "content": "Be a chad\n\nGM\n\nhttps://m.primal.net/HvSa.jpg", "tags": [], "kind": 1, "pubkey": "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52", "id": "b58922a716933ff927822f9c055c20f54e0aa871f114bb896da8c5a0666de741" });
            const withRootMarker = new NDKEvent(undefined, { "id": "5acab1220290c5494e77ff573757d2d2f89660fce86445d2125bd3e3190249fc", "pubkey": "b744173153afab07aec01b55809c7ea8f44dd00bab78b0cac5b706fc4282f67a", "created_at": 1713171435, "kind": 1, "tags": [ [ "e", "b58922a716933ff927822f9c055c20f54e0aa871f114bb896da8c5a0666de741", "", "root" ], [ "p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52" ] ], "content": "GM\nCHAD IS RAD", "sig": "b5a5f9e9d05639b222b08c1149e690386fd7d50f55d13e68dea390c8e12b4e9dbd54fbf655eee5388d2ecb8d0c7d6e3729772c1caaa4b36dd8ed719aea639a5b" });

            expect(eventIsReply(rootEvent, withRootMarker)).toBe(true);
        });
    });
});
