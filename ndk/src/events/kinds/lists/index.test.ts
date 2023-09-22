import { NDK } from "../../../ndk";
import { NDKUser } from "../../../user";
import NDKList from ".";

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

    describe("name", () => {
        it("allows you to set and get the name of the list", () => {
            expect(list.name).toEqual(undefined);
            list.name = "My list";
            expect(list.name).toEqual("My list");
        });

        it("defaults to `Mute` for kind 10000 events", () => {
            list.kind = 10000;
            expect(list.name).toEqual("Mute");
        });

        it("defaults to `Pin` for kind 10001 events", () => {
            list.kind = 10001;
            expect(list.name).toEqual("Pin");
        });

        it("defaults to `Relay Metadata` for kind 10002 events", () => {
            list.kind = 10002;
            expect(list.name).toEqual("Relay Metadata");
        });
    });
});
