import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorage, LocalStorage } from '../src/storage';
import type { SerializedSession } from '../src/types';

describe('MemoryStorage', () => {
    let storage: MemoryStorage;

    beforeEach(() => {
        storage = new MemoryStorage();
    });

    it('should save and load sessions', async () => {
        const sessions = new Map<string, SerializedSession>();
        sessions.set('pubkey1', {
            pubkey: 'pubkey1',
            lastActive: Date.now(),
        });

        await storage.save(sessions, 'pubkey1');

        const loaded = await storage.load();
        expect(loaded.sessions.size).toBe(1);
        expect(loaded.sessions.get('pubkey1')).toBeDefined();
        expect(loaded.activePubkey).toBe('pubkey1');
    });

    it('should clear sessions', async () => {
        const sessions = new Map<string, SerializedSession>();
        sessions.set('pubkey1', {
            pubkey: 'pubkey1',
            lastActive: Date.now(),
        });

        await storage.save(sessions, 'pubkey1');
        await storage.clear();

        const loaded = await storage.load();
        expect(loaded.sessions.size).toBe(0);
        expect(loaded.activePubkey).toBeUndefined();
    });

    it('should handle empty storage', async () => {
        const loaded = await storage.load();
        expect(loaded.sessions.size).toBe(0);
        expect(loaded.activePubkey).toBeUndefined();
    });
});

describe('LocalStorage', () => {
    it('should handle missing localStorage gracefully', async () => {
        const storage = new LocalStorage();

        // Should not throw when localStorage is unavailable
        const loaded = await storage.load();
        expect(loaded.sessions.size).toBe(0);
    });
});
