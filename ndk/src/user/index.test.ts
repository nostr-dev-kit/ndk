import { nip19 } from "nostr-tools";
import { NDKEvent } from "../events/index.js";
import { NDK } from "../ndk/index.js";
import { NDKSubscription } from "../subscription/index.js";
import { NDKUser, type ProfilePointer, type NDKUserParams } from "./index.js";
import * as Nip05 from "./nip05.js";

jest.mock("nostr-tools", () => ({
    ...jest.requireActual("nostr-tools"),
    nip19: {
        npubEncode: jest.fn().mockImplementation(() => "npub1_encoded_npub"),
        decode: jest.fn().mockReturnValue({ type: "npub", data: "decoded_hexpubkey" }),
    },
}));

describe("NDKUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("constructor", () => {
        it("sets npub from provided npub", () => {
            const opts: NDKUserParams = {
                npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
            };

            const user = new NDKUser(opts);

            expect(user.npub).toEqual(
                "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
            );
        });

        it("sets npub from provided hexpubkey", () => {
            const opts: NDKUserParams = {
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
            };

            const user = new NDKUser(opts);
            expect(user.npub).toEqual("npub1_encoded_npub");
        });

        it("sets relayUrls from provided relayUrls", () => {
            const opts: NDKUserParams = {
                relayUrls: ["url1", "url2"],
            };

            const user = new NDKUser(opts);

            expect(user.relayUrls).toEqual(["url1", "url2"]);
        });
    });

    describe("pubkey", () => {
        it("returns the decoded pubkey", () => {
            const user = new NDKUser({
                npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
            });

            (nip19.decode as jest.Mock).mockReturnValue({
                data: "decoded_hexpubkey",
            });

            const pubkey = user.pubkey;

            expect(nip19.decode).toHaveBeenCalledWith(
                "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
            );
            expect(pubkey).toEqual("decoded_hexpubkey");
        });
    });

    describe("fetchProfile", () => {
        const ndk = new NDK();
        let newEvent: NDKEvent;
        let oldEvent: NDKEvent;
        const user = new NDKUser({
            npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
        });
        user.ndk = ndk;
        (nip19.decode as jest.Mock).mockReturnValue({
            data: "decoded_hexpubkey",
        });
        const pubkey = user.pubkey;

        it("Returns updated fields", async () => {
            newEvent = new NDKEvent(ndk, {
                kind: 0,
                pubkey: pubkey,
                tags: [],
                created_at: Date.now() / 1000 - 3600,
                content: JSON.stringify({
                    displayName: "JeffG",
                    name: "Jeff",
                    image: "https://image.url",
                    banner: "https://banner.url",
                    bio: "Some bio info",
                    nip05: "_@jeffg.fyi",
                    lud06: "lud06value",
                    lud16: "lud16value",
                    about: "About jeff",
                    zapService: "Zapservice details",
                }),
            });

            oldEvent = new NDKEvent(ndk, {
                kind: 0,
                pubkey: pubkey,
                tags: [],
                created_at: Date.now() / 1000 - 7200,
                content: JSON.stringify({
                    displayName: "JeffG_OLD",
                    name: "Jeff_OLD",
                    image: "https://image.url.old",
                    banner: "https://banner.url.old",
                    bio: "Some OLD bio info",
                    nip05: "OLD@jeffg.fyi",
                    lud06: "lud06value OLD",
                    lud16: "lud16value OLD",
                    about: "About jeff OLD",
                    zapService: "Zapservice details OLD",
                }),
            });

            ndk.subscribe = jest.fn((filter, opts?): NDKSubscription => {
                const sub = new NDKSubscription(ndk, filter, opts);

                setTimeout(() => {
                    sub.emit("event", newEvent, undefined, sub);
                    sub.emit("event", oldEvent, undefined, sub);
                    sub.emit("eose", sub);
                }, 100);

                return sub;
            });

            await user.fetchProfile();
            expect(user.profile?.displayName).toEqual("JeffG");
            expect(user.profile?.name).toEqual("Jeff");
            expect(user.profile?.image).toEqual("https://image.url");
            expect(user.profile?.banner).toEqual("https://banner.url");
            expect(user.profile?.bio).toEqual("Some bio info");
            expect(user.profile?.nip05).toEqual("_@jeffg.fyi");
            expect(user.profile?.lud06).toEqual("lud06value");
            expect(user.profile?.lud16).toEqual("lud16value");
            expect(user.profile?.about).toEqual("About jeff");
            expect(user.profile?.zapService).toEqual("Zapservice details");
        });

        // "displayName" is ignored, we only look at the "display_name" field in the user profile
        it("Display name is set properly", async () => {
            newEvent = new NDKEvent(ndk, {
                kind: 0,
                pubkey: pubkey,
                tags: [],
                created_at: Date.now() / 1000 - 3600,
                content: JSON.stringify({
                    displayName: "JeffG",
                    display_name: "James",
                }),
            });

            oldEvent = new NDKEvent(ndk, {
                kind: 0,
                pubkey: pubkey,
                tags: [],
                created_at: Date.now() / 1000 - 7200,
                content: JSON.stringify({
                    displayName: "Bob",
                }),
            });

            ndk.subscribe = jest.fn((filter, opts?): NDKSubscription => {
                const sub = new NDKSubscription(ndk, filter, opts);

                setTimeout(() => {
                    sub.emit("event", newEvent, undefined, sub);
                    sub.emit("event", oldEvent, undefined, sub);
                    sub.emit("eose", sub);
                }, 100);

                return sub;
            });

            await user.fetchProfile();
            expect(user.profile?.displayName).toEqual("James");
        });

        // Both "image" and "picture" are set to the "image" field in the user profile
        it("Image is set properly", async () => {
            newEvent = new NDKEvent(ndk, {
                kind: 0,
                pubkey: pubkey,
                tags: [],
                created_at: Date.now() / 1000 - 3600,
                content: JSON.stringify({
                    picture: "https://set-from-picture-field.url",
                }),
            });

            oldEvent = new NDKEvent(ndk, {
                kind: 0,
                pubkey: pubkey,
                tags: [],
                created_at: Date.now() / 1000 - 7200,
                content: JSON.stringify({
                    image: "https://set-from-image-field.url",
                }),
            });

            ndk.subscribe = jest.fn((filter, opts?): NDKSubscription => {
                const sub = new NDKSubscription(ndk, filter, opts);

                setTimeout(() => {
                    sub.emit("event", newEvent, undefined, sub);
                    sub.emit("event", oldEvent, undefined, sub);
                    sub.emit("eose", sub);
                }, 100);

                return sub;
            });

            await user.fetchProfile();
            expect(user.profile?.image).toEqual("https://set-from-picture-field.url");
        });

        it("Allows for arbitrary values to be set on user profiles", async () => {
            newEvent = new NDKEvent(ndk, {
                kind: 0,
                pubkey: pubkey,
                tags: [],
                created_at: Date.now() / 1000 - 3600,
                content: JSON.stringify({
                    customField: "custom NEW",
                }),
            });

            oldEvent = new NDKEvent(ndk, {
                kind: 0,
                pubkey: pubkey,
                tags: [],
                created_at: Date.now() / 1000 - 7200,
                content: JSON.stringify({
                    customField: "custom OLD",
                }),
            });

            ndk.subscribe = jest.fn((filter, opts?): NDKSubscription => {
                const sub = new NDKSubscription(ndk, filter, opts);

                setTimeout(() => {
                    sub.emit("event", newEvent, undefined, sub);
                    sub.emit("event", oldEvent, undefined, sub);
                    sub.emit("eose", sub);
                }, 100);

                return sub;
            });

            await user.fetchProfile();
            expect(user.profile?.customField).toEqual("custom NEW");
        });
    });

    describe("validateNip05", () => {
        it("validates the NIP-05 for users", async () => {
            const ndk = new NDK();
            const user = ndk.getUser({
                pubkey: "1739d937dc8c0c7370aa27585938c119e25c41f6c441a5d34c6d38503e3136ef",
            });

            // Valid NIP-05
            const validNip05 = "_@jeffg.fyi";
            jest.spyOn(Nip05, "getNip05For").mockResolvedValue({
                pubkey: "1739d937dc8c0c7370aa27585938c119e25c41f6c441a5d34c6d38503e3136ef",
            } as ProfilePointer);
            expect(await user.validateNip05(validNip05)).toEqual(true);

            // Invalid NIP-05
            const invalidNip05 = "_@f7z.io";
            jest.spyOn(Nip05, "getNip05For").mockResolvedValue({
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
            } as ProfilePointer);
            expect(await user.validateNip05(invalidNip05)).toEqual(false);

            // Random NIP-05
            const randomNip05 = "bobby@globalhypermeganet.com";
            jest.spyOn(Nip05, "getNip05For").mockResolvedValue(null);
            expect(await user.validateNip05(randomNip05)).toEqual(null);
        });
    });
});
