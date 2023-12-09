import NDKList from ".";
import { NDK } from "../../../ndk";
import { NDKUser } from "../../../user";

describe("NDKList", () => {
    let ndk: NDK;
    let list: NDKList;
    let user1: NDKUser;

    beforeEach(() => {
        ndk = new NDK();
        user1 = new NDKUser({
            npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
        });
        list = new NDKList(ndk);
        list.author = user1;
    });

    describe("title", () => {
        it("allows you to set and get the title of the list", () => {
            expect(list.title).toEqual(undefined);
            list.title = "My list";
            expect(list.title).toEqual("My list");
        });

        it("defaults to `Contacts` for kind 3 events", () => {
            list.kind = 3;
            expect(list.title).toEqual("Contacts");
        });

        it("defaults to `Mute` for kind 10000 events", () => {
            list.kind = 10000;
            expect(list.title).toEqual("Mute");
        });

        it("defaults to `Pin` for kind 10001 events", () => {
            list.kind = 10001;
            expect(list.title).toEqual("Pinned Notes");
        });

        it("defaults to `Relay Metadata` for kind 10002 events", () => {
            list.kind = 10002;
            expect(list.title).toEqual("Relay Metadata");
        });
    });
});
