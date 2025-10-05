import { describe, it, expect, beforeEach } from "vitest";
import { NDKSvelte } from "../ndk-svelte.svelte";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

describe("SessionsStore", () => {
	let ndk: NDKSvelte;
	let signer1: NDKPrivateKeySigner;
	let signer2: NDKPrivateKeySigner;

	beforeEach(async () => {
		ndk = new NDKSvelte({ explicitRelayUrls: ["wss://relay.test"] });

		// Create test signers
		signer1 = NDKPrivateKeySigner.generate();
		signer2 = NDKPrivateKeySigner.generate();
	});

	it("should initialize with no sessions", () => {
		expect(ndk.sessions.all).toEqual([]);
		expect(ndk.sessions.current).toBeUndefined();
	});

	it("should login and create a session", async () => {
		await ndk.sessions.login(signer1);

		expect(ndk.sessions.all.length).toBe(1);
		expect(ndk.sessions.current).toBeDefined();
		expect(ndk.sessions.current?.pubkey).toBe((await signer1.user()).pubkey);
	});

	it("should add multiple sessions", async () => {
		await ndk.sessions.login(signer1);
		await ndk.sessions.add(signer2);

		expect(ndk.sessions.all.length).toBe(2);
		expect(ndk.sessions.current?.pubkey).toBe((await signer1.user()).pubkey);
	});

	it("should switch between sessions", async () => {
		await ndk.sessions.login(signer1);
		await ndk.sessions.add(signer2);

		const pubkey2 = (await signer2.user()).pubkey;
		ndk.sessions.switch(pubkey2);

		expect(ndk.sessions.current?.pubkey).toBe(pubkey2);
	});

	it("should logout specific session", async () => {
		await ndk.sessions.login(signer1);
		await ndk.sessions.add(signer2);

		const pubkey1 = (await signer1.user()).pubkey;
		ndk.sessions.logout(pubkey1);

		expect(ndk.sessions.all.length).toBe(1);
		expect(ndk.sessions.current?.pubkey).toBe((await signer2.user()).pubkey);
	});

	it("should logout all sessions", async () => {
		await ndk.sessions.login(signer1);
		await ndk.sessions.add(signer2);

		ndk.sessions.logoutAll();

		expect(ndk.sessions.all).toEqual([]);
		expect(ndk.sessions.current).toBeUndefined();
	});

	it("should get session by pubkey", async () => {
		await ndk.sessions.login(signer1);
		await ndk.sessions.add(signer2);

		const pubkey1 = (await signer1.user()).pubkey;
		const session = ndk.sessions.get(pubkey1);

		expect(session).toBeDefined();
		expect(session?.pubkey).toBe(pubkey1);
	});

	it("should return undefined for non-existent session", async () => {
		await ndk.sessions.login(signer1);

		const session = ndk.sessions.get("nonexistent-pubkey");

		expect(session).toBeUndefined();
	});

	it("should provide reactive follows accessor", async () => {
		await ndk.sessions.login(signer1);

		expect(ndk.sessions.follows).toBeInstanceOf(Set);
		expect(ndk.sessions.follows.size).toBe(0);
	});

	it("should return empty set when no session", () => {
		expect(ndk.sessions.follows).toBeInstanceOf(Set);
		expect(ndk.sessions.follows.size).toBe(0);
	});
});
