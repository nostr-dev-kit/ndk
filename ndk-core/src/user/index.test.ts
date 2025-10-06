import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventGenerator } from "../../test";
import type { NDKEvent } from "../events/index.js";
import { NDK } from "../ndk/index.js";
import { NDKSubscription } from "../subscription/index.js";
import { NDKUser, type NDKUserParams, type ProfilePointer } from "./index.js";
import * as Nip05 from "./nip05.js";

describe("NDKUser", () => {
    let ndk: NDK;

    beforeEach(() => {
        vi.clearAllMocks();
        ndk = new NDK();
        EventGenerator.setNDK(ndk);
    });

    describe("constructor", () => {
        it("sets npub from provided npub", () => {
            const opts: NDKUserParams = {
                npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
            };

            const user = new NDKUser(opts);

            expect(user.npub).toEqual("npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft");
        });

        it("sets npub from provided hexpubkey", () => {
            const opts: NDKUserParams = {
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
            };

            const user = new NDKUser(opts);
            expect(user.npub).toEqual("npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft");
        });

        it("sets relayUrls from provided relayUrls", () => {
            const opts: NDKUserParams = {
                relayUrls: ["url1", "url2"],
            };

            const user = new NDKUser(opts);

            expect(user.relayUrls).toEqual(["url1", "url2"]);
        });

        it("sets pubkey and relayUrls from provided nprofile", () => {
            const opts: NDKUserParams = {
                nprofile:
                    "nprofile1qqs04xzt6ldm9qhs0ctw0t58kf4z57umjzmjg6jywu0seadwtqqc75spr9mhxue69uhhq7tjv9kkjepwve5kzar2v9nzucm0d5qscamnwvaz7tmxxaazu6t0f6uyq5",
            };

            const user = new NDKUser(opts);

            expect(user.pubkey).toEqual("fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52");
            expect(user.relayUrls).toEqual(["wss://pyramid.fiatjaf.com", "wss://f7z.io"]);
        });
    });

    describe("pubkey", () => {
        it("returns the decoded pubkey", () => {
            const user = new NDKUser({
                npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
            });

            const pubkey = user.pubkey;

            expect(pubkey).toEqual("fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52");
        });
    });

    describe("fetchProfile", () => {
        let newEvent: NDKEvent;
        let oldEvent: NDKEvent;
        let user: NDKUser;
        let pubkey: string;

        beforeEach(() => {
            user = new NDKUser({
                npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
            });
            user.ndk = ndk;
            pubkey = user.pubkey;
        });

        it("Returns updated fields", async () => {
            // Use EventGenerator to create profile events
            newEvent = EventGenerator.createEvent(
                0,
                JSON.stringify({
                    displayName: "JeffG",
                    name: "Jeff",
                    image: "https://image.url",
                    banner: "https://banner.url",
                    bio: "Some bio info",
                    nip05: "_@jeffg.fyi",
                    lud06: "lud06value",
                    lud16: "lud16value",
                    about: "About jeff",
                }),
                pubkey,
            );
            newEvent.created_at = Math.floor(Date.now() / 1000) - 3600;

            oldEvent = EventGenerator.createEvent(
                0,
                JSON.stringify({
                    displayName: "JeffG_OLD",
                    name: "Jeff_OLD",
                    image: "https://image.url.old",
                    banner: "https://banner.url.old",
                    bio: "Some OLD bio info",
                    nip05: "OLD@jeffg.fyi",
                    lud06: "lud06value OLD",
                    lud16: "lud16value OLD",
                    about: "About jeff OLD",
                }),
                pubkey,
            );
            oldEvent.created_at = Math.floor(Date.now() / 1000) - 7200;

            ndk.fetchEvent = vi.fn().mockResolvedValue(newEvent);

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
        });

        // "displayName" is ignored, we only look at the "display_name" field in the user profile
        it("Display name is set properly", async () => {
            newEvent = EventGenerator.createEvent(
                0,
                JSON.stringify({
                    displayName: "JeffG",
                    display_name: "James",
                }),
                pubkey,
            );
            newEvent.created_at = Math.floor(Date.now() / 1000) - 3600;

            oldEvent = EventGenerator.createEvent(
                0,
                JSON.stringify({
                    displayName: "Bob",
                }),
                pubkey,
            );
            oldEvent.created_at = Math.floor(Date.now() / 1000) - 7200;

            ndk.fetchEvent = vi.fn().mockResolvedValue(newEvent);

            await user.fetchProfile();
            expect(user.profile?.displayName).toEqual("James");
        });

        // Both "image" and "picture" are set to the "image" field in the user profile
        it("Image is set properly", async () => {
            newEvent = EventGenerator.createEvent(
                0,
                JSON.stringify({
                    picture: "https://set-from-picture-field.url",
                }),
                pubkey,
            );
            newEvent.created_at = Math.floor(Date.now() / 1000) - 3600;

            oldEvent = EventGenerator.createEvent(
                0,
                JSON.stringify({
                    image: "https://set-from-image-field.url",
                }),
                pubkey,
            );
            oldEvent.created_at = Math.floor(Date.now() / 1000) - 7200;

            ndk.fetchEvent = vi.fn().mockResolvedValue(newEvent);

            await user.fetchProfile();
            expect(user.profile?.image).toEqual("https://set-from-picture-field.url");
        });

        it("Allows for arbitrary values to be set on user profiles", async () => {
            newEvent = EventGenerator.createEvent(
                0,
                JSON.stringify({
                    customField: "custom NEW",
                }),
                pubkey,
            );
            newEvent.created_at = Math.floor(Date.now() / 1000) - 3600;

            oldEvent = EventGenerator.createEvent(
                0,
                JSON.stringify({
                    customField: "custom OLD",
                }),
                pubkey,
            );
            oldEvent.created_at = Math.floor(Date.now() / 1000) - 7200;

            ndk.fetchEvent = vi.fn().mockResolvedValue(newEvent);

            await user.fetchProfile();
            expect(user.profile?.customField).toEqual("custom NEW");
        });
    });

    describe("validateNip05", () => {
        it("validates the NIP-05 for users", async () => {
            const user = ndk.getUser({
                pubkey: "1739d937dc8c0c7370aa27585938c119e25c41f6c441a5d34c6d38503e3136ef",
            });

            // Valid NIP-05
            const validNip05 = "_@jeffg.fyi";
            vi.spyOn(Nip05, "getNip05For").mockResolvedValue({
                pubkey: "1739d937dc8c0c7370aa27585938c119e25c41f6c441a5d34c6d38503e3136ef",
            } as ProfilePointer);
            expect(await user.validateNip05(validNip05)).toEqual(true);

            // Invalid NIP-05
            const invalidNip05 = "_@f7z.io";
            vi.spyOn(Nip05, "getNip05For").mockResolvedValue({
                pubkey: "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
            } as ProfilePointer);
            expect(await user.validateNip05(invalidNip05)).toEqual(false);

            // Random NIP-05
            const randomNip05 = "bobby@globalhypermeganet.com";
            vi.spyOn(Nip05, "getNip05For").mockResolvedValue(null);
            expect(await user.validateNip05(randomNip05)).toEqual(null);
        });
    });
});
