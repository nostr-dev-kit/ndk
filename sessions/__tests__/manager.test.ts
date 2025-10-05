import { describe, it, expect, beforeEach, vi } from 'vitest';
import NDK, { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import { NDKSessionManager } from '../src/manager';
import { MemoryStorage } from '../src/storage';

describe('NDKSessionManager', () => {
    let ndk: NDK;
    let manager: NDKSessionManager;

    beforeEach(() => {
        ndk = new NDK({ explicitRelayUrls: ['wss://relay.example.com'] });
        manager = new NDKSessionManager(ndk);
    });

    describe('login', () => {
        it('should login with a signer', async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            const pubkey = await manager.login(signer);

            expect(pubkey).toBe(user.pubkey);
            expect(manager.getSessions().size).toBe(1);
            expect(manager.activePubkey).toBe(user.pubkey);
        });

        it('should login with a user (read-only)', async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            const pubkey = await manager.login(user);

            expect(pubkey).toBe(user.pubkey);
            expect(manager.getSessions().size).toBe(1);
            expect(manager.activePubkey).toBe(user.pubkey);
        });

        it('should support multiple sessions', async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();

            await manager.login(signer1);
            await manager.login(signer2);

            expect(manager.getSessions().size).toBe(2);
        });

        it('should set active session when setActive is true', async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();
            const user2 = await signer2.user();

            await manager.login(signer1, { setActive: true });
            expect(manager.activePubkey).toBe(user1.pubkey);

            await manager.login(signer2, { setActive: true });
            expect(manager.activePubkey).toBe(user2.pubkey);
        });

        it('should not change active session when setActive is false', async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();
            const user2 = await signer2.user();

            await manager.login(signer1, { setActive: true });
            await manager.login(signer2, { setActive: false });

            expect(manager.activePubkey).toBe(user1.pubkey);
        });
    });

    describe('logout', () => {
        it('should logout active session', async () => {
            const signer = NDKPrivateKeySigner.generate();
            await manager.login(signer);

            expect(manager.getSessions().size).toBe(1);

            manager.logout();

            expect(manager.getSessions().size).toBe(0);
            expect(manager.activePubkey).toBeUndefined();
        });

        it('should logout specific session', async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();

            await manager.login(signer1);
            await manager.login(signer2);

            manager.logout(user1.pubkey);

            expect(manager.getSessions().size).toBe(1);
            expect(manager.getSession(user1.pubkey)).toBeUndefined();
        });

        it('should switch to another session when logging out active session', async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();
            const user2 = await signer2.user();

            await manager.login(signer1);
            await manager.login(signer2);

            expect(manager.activePubkey).toBe(user2.pubkey);

            manager.logout(user2.pubkey);

            expect(manager.activePubkey).toBe(user1.pubkey);
        });
    });

    describe('switchTo', () => {
        it('should switch between sessions', async () => {
            const signer1 = NDKPrivateKeySigner.generate();
            const signer2 = NDKPrivateKeySigner.generate();
            const user1 = await signer1.user();
            const user2 = await signer2.user();

            await manager.login(signer1);
            await manager.login(signer2);

            manager.switchTo(user1.pubkey);
            expect(manager.activePubkey).toBe(user1.pubkey);

            manager.switchTo(user2.pubkey);
            expect(manager.activePubkey).toBe(user2.pubkey);
        });

        it('should clear active session when switching to null', async () => {
            const signer = NDKPrivateKeySigner.generate();
            await manager.login(signer);

            manager.switchTo(null);

            expect(manager.activePubkey).toBeUndefined();
        });
    });

    describe('persistence', () => {
        it('should persist and restore sessions', async () => {
            const storage = new MemoryStorage();
            const manager1 = new NDKSessionManager(ndk, { storage });

            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager1.login(signer);
            await manager1.persist();

            // Create new manager with same storage
            const manager2 = new NDKSessionManager(ndk, { storage });
            await manager2.restore();

            expect(manager2.getSessions().size).toBe(1);
            expect(manager2.activePubkey).toBe(user.pubkey);
        });

        it('should auto-save when enabled', async () => {
            const storage = new MemoryStorage();
            const saveSpy = vi.spyOn(storage, 'save');

            const manager = new NDKSessionManager(ndk, {
                storage,
                autoSave: true,
                saveDebounceMs: 10,
            });

            const signer = NDKPrivateKeySigner.generate();
            await manager.login(signer);

            // Wait for debounced save
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(saveSpy).toHaveBeenCalled();
        });
    });

    describe('activeUser', () => {
        it('should return active user with profile', async () => {
            const signer = NDKPrivateKeySigner.generate();
            const user = await signer.user();

            await manager.login(signer);

            // Update session with profile
            manager.getCurrentState().updateSession(user.pubkey, {
                profile: { name: 'Test User', about: 'Test' },
            });

            const activeUser = manager.activeUser;
            expect(activeUser).toBeDefined();
            expect(activeUser?.pubkey).toBe(user.pubkey);
            expect(activeUser?.profile?.name).toBe('Test User');
        });
    });

    describe('subscribe', () => {
        it('should notify subscribers of state changes', async () => {
            const callback = vi.fn();
            manager.subscribe(callback);

            const signer = NDKPrivateKeySigner.generate();
            await manager.login(signer);

            expect(callback).toHaveBeenCalled();
        });
    });
});
