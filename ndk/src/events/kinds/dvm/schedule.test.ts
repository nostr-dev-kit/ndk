import type { NostrEvent } from "../..";
import { NDKEvent } from "../..";
import { NDK } from "../../../ndk";
import { NDKPrivateKeySigner } from "../../../signers/private-key";
import { NDKKind } from "..";
import { NDKDVMEventSchedule } from "./schedule";

let ndk: NDK;
const TEST_ACCOUNT_PK = "npub1es6q5vpvf42kv88thswctggfgzxty9amgcmhn6ytym8674n8fgpqtxsyua";
const SHIPYARD_PK = "85c20d3760ef4e1976071a569fb363f4ff086ca907669fb95167cdc5305934d1";
const SIGNER = NDKPrivateKeySigner.generate();

beforeAll(() => ndk = new NDK({ signer: SIGNER }));

describe("creates an NDK event", () => {
    it("able to decrypt", async () => {
        const eventToPublish = await createTextEvent();
        const dmvInput = ["i", JSON.stringify(eventToPublish.rawEvent()), "text"];
        const mockEvent = await createScheduleEvent(dmvInput);
        const event = await NDKDVMEventSchedule.from(mockEvent);

        expect(event.created_at).toEqual(mockEvent.created_at);
        expect(JSON.parse(event.content)).toEqual([dmvInput]);
        expect(event.kind).toBe(NDKKind.DVMEventSchedule);
    });
});

const createScheduleEvent = async (dvmInput: string[]): Promise<NDKEvent> => {
    const scheduleNostrEvent: NostrEvent = {
        kind: NDKKind.DVMEventSchedule,
        created_at: Date.now() / 1000,
        pubkey: TEST_ACCOUNT_PK,
        tags: [
            ["p", SHIPYARD_PK],
            ["encrypted"]
        ],
        content: JSON.stringify([dvmInput])
    };
    const dvm = ndk.getUser({ pubkey: SHIPYARD_PK });
    const scheduleEvent = new NDKEvent(ndk, scheduleNostrEvent);
    await scheduleEvent.encrypt(dvm);
    await scheduleEvent.sign();
    return scheduleEvent;
};

const createTextEvent = async (): Promise<NDKEvent> => {
    const ndkEvent = new NDKEvent(ndk, {
        created_at: Date.now() / 1000 + 120,
        content: "test",
        kind: NDKKind.Text,
        pubkey: TEST_ACCOUNT_PK
    } as NostrEvent);
    await ndkEvent.sign(SIGNER);
    return ndkEvent;
};