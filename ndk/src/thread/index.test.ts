import { eventIsPartOfThread, eventIsReply, eventThreads, eventsBySameAuthor } from ".";
import { NDKEvent } from "../events";

const op = new NDKEvent(undefined, { "id": "op", "pubkey": "pubkey1", "created_at": 1711962787, "kind": 11, "tags": [ [ "title", "This is a note" ], [ "h", "pubkey1" ] ], "content": "Here is my note" })
const thread1 = new NDKEvent(undefined, { "id": "thread1", "pubkey": "pubkey1", "created_at": 1711962911, "kind": 12, "tags": [ [ "e", "op", "ws://localhost:5577", "reply" ], [ "p", "pubkey1" ] ], "content": "thread 1" });
const reply1 = new NDKEvent(undefined, { "id": "reply1", "pubkey": "pubkey2", "created_at": 1711962911, "kind": 12, "tags": [ [ "e", "op", "ws://localhost:5577", "reply" ], [ "p", "pubkey1" ] ], "content": "reply 1" });
const quote1 = new NDKEvent(undefined, { "id": "quote1", "pubkey": "pubkey2", "created_at": 1711962911, "kind": 12, "tags": [ [ "q", "op" ], [ "p", "pubkey3" ] ], "content": "quote 1" });

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
        const threadIds = new Map<string, NDKEvent>();

        beforeEach(() => {
            const thread = eventThreads(op, allEventsToEvaluate);
            thread.forEach(event => threadIds.set(event.id, event));
        })

        it("properly identifies events that are replies", () => {
            expect(eventIsReply(op, reply1, threadIds)).toBe(true);
        });

        it("properly identifies events that are not replies", () => {
            expect(eventIsReply(op, thread1, threadIds)).toBe(false);
        });

        it("properly identifies quotes as not replies", () => {
            expect(eventIsReply(op, quote1, threadIds)).toBe(false);
        });
    });
});