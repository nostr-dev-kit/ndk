# Example: Building a Notes Package with Cache Modules

This guide walks through creating a complete NDK package that uses cache modules for persistent storage. We'll build a simple notes management package as an example.

## Complete Implementation

### 1. Package Structure

```
packages/notes/
├── src/
│   ├── index.ts           # Main exports
│   ├── notes-manager.ts   # Main class
│   ├── cache-module.ts    # Cache module definition
│   ├── storage.ts         # Storage adapter
│   └── types.ts           # TypeScript types
├── test/
│   └── notes.test.ts      # Tests
├── package.json
└── README.md
```

### 2. Types Definition (`types.ts`)

```typescript
import type { NDKUser } from '@nostr-dev-kit/ndk';

export interface Note {
    id: string;
    title: string;
    content: string;
    authorPubkey: string;
    createdAt: number;
    updatedAt: number;
    tags: string[];
    isPublic: boolean;
    encrypted?: boolean;
    sharedWith?: string[]; // pubkeys of users this note is shared with
}

export interface NoteFolder {
    id: string;
    name: string;
    ownerPubkey: string;
    noteIds: string[];
    createdAt: number;
    color?: string;
    icon?: string;
}

export interface NotesOptions {
    autoSave?: boolean;
    encryptByDefault?: boolean;
    syncInterval?: number;
}
```

### 3. Cache Module Definition (`cache-module.ts`)

```typescript
import type { CacheModuleDefinition } from '@nostr-dev-kit/ndk';

export const notesCacheModule: CacheModuleDefinition = {
    namespace: 'notes',
    version: 2, // Current version

    collections: {
        notes: {
            primaryKey: 'id',
            indexes: [
                'authorPubkey',
                'createdAt',
                'updatedAt',
                'isPublic',
            ],
            compoundIndexes: [
                ['authorPubkey', 'createdAt'], // For user's notes sorted by date
                ['authorPubkey', 'isPublic'],   // For filtering public/private
            ],
            schema: {
                id: 'string',
                title: 'string',
                content: 'string',
                authorPubkey: 'string',
                createdAt: 'number',
                updatedAt: 'number',
                tags: 'string[]',
                isPublic: 'boolean',
                encrypted: 'boolean?',
                sharedWith: 'string[]?',
            }
        },

        folders: {
            primaryKey: 'id',
            indexes: [
                'ownerPubkey',
                'createdAt',
                'name',
            ],
            schema: {
                id: 'string',
                name: 'string',
                ownerPubkey: 'string',
                noteIds: 'string[]',
                createdAt: 'number',
                color: 'string?',
                icon: 'string?',
            }
        },

        // Track last sync time per user
        syncStatus: {
            primaryKey: 'pubkey',
            schema: {
                pubkey: 'string',
                lastSync: 'number',
                lastNoteId: 'string?',
            }
        }
    },

    migrations: {
        // Version 1: Initial schema
        1: async (context) => {
            await context.createCollection('notes', notesCacheModule.collections.notes);
            await context.createCollection('folders', notesCacheModule.collections.folders);
        },

        // Version 2: Add sync status tracking
        2: async (context) => {
            // Only create if upgrading from v1
            if (context.fromVersion < 2) {
                await context.createCollection('syncStatus', notesCacheModule.collections.syncStatus);

                // Migrate existing notes to have isPublic field
                const notesCollection = await context.getCollection('notes');
                const allNotes = await notesCollection.all();

                for (const note of allNotes) {
                    if (note.isPublic === undefined) {
                        note.isPublic = false; // Default to private
                        await notesCollection.save(note);
                    }
                }
            }
        },

        // Future version example: Adding full-text search
        // 3: async (context) => {
        //     await context.createCollection('searchIndex', {
        //         primaryKey: 'id',
        //         indexes: ['noteId', 'term'],
        //     });
        //     // Build search index from existing notes
        // }
    }
};
```

### 4. Storage Adapter (`storage.ts`)

```typescript
import type { NDKCacheAdapter, CacheModuleCollection } from '@nostr-dev-kit/ndk';
import type { Note, NoteFolder } from './types';
import { notesCacheModule } from './cache-module';

interface SyncStatus {
    pubkey: string;
    lastSync: number;
    lastNoteId?: string;
}

export class NotesStorage {
    private notesCollection?: CacheModuleCollection<Note>;
    private foldersCollection?: CacheModuleCollection<NoteFolder>;
    private syncCollection?: CacheModuleCollection<SyncStatus>;
    private initialized = false;
    private hasModuleSupport = false;

    // Fallback storage for adapters without module support
    private memoryNotes = new Map<string, Note>();
    private memoryFolders = new Map<string, NoteFolder>();

    constructor(
        private cache?: NDKCacheAdapter,
        private userPubkey?: string
    ) {}

    private async ensureInitialized(): Promise<void> {
        if (this.initialized) return;

        if (this.cache?.registerModule) {
            try {
                await this.cache.registerModule(notesCacheModule);

                if (this.cache.getModuleCollection) {
                    this.notesCollection = await this.cache.getModuleCollection<Note>(
                        'notes',
                        'notes'
                    );
                    this.foldersCollection = await this.cache.getModuleCollection<NoteFolder>(
                        'notes',
                        'folders'
                    );
                    this.syncCollection = await this.cache.getModuleCollection<SyncStatus>(
                        'notes',
                        'syncStatus'
                    );
                    this.hasModuleSupport = true;
                }
            } catch (error) {
                console.warn('Cache module registration failed, using fallback storage', error);
            }
        }

        this.initialized = true;
    }

    // Note operations
    async saveNote(note: Note): Promise<void> {
        await this.ensureInitialized();

        if (this.notesCollection) {
            await this.notesCollection.save(note);
        } else {
            // Fallback to memory
            this.memoryNotes.set(note.id, note);

            // Try generic cache if available
            if (this.cache?.setCacheData) {
                await this.cache.setCacheData('notes', note.id, note);
            }
        }
    }

    async getNote(id: string): Promise<Note | null> {
        await this.ensureInitialized();

        if (this.notesCollection) {
            return await this.notesCollection.get(id);
        } else {
            // Fallback to memory
            const memNote = this.memoryNotes.get(id);
            if (memNote) return memNote;

            // Try generic cache
            if (this.cache?.getCacheData) {
                return await this.cache.getCacheData<Note>('notes', id) || null;
            }

            return null;
        }
    }

    async getUserNotes(pubkey: string, limit?: number): Promise<Note[]> {
        await this.ensureInitialized();

        if (this.notesCollection) {
            let notes = await this.notesCollection.findBy('authorPubkey', pubkey);

            // Sort by creation date (newest first)
            notes.sort((a, b) => b.createdAt - a.createdAt);

            if (limit) {
                notes = notes.slice(0, limit);
            }

            return notes;
        } else {
            // Fallback to memory
            const userNotes = Array.from(this.memoryNotes.values())
                .filter(note => note.authorPubkey === pubkey)
                .sort((a, b) => b.createdAt - a.createdAt);

            return limit ? userNotes.slice(0, limit) : userNotes;
        }
    }

    async getPublicNotes(pubkey: string): Promise<Note[]> {
        await this.ensureInitialized();

        if (this.notesCollection) {
            return await this.notesCollection.where({
                authorPubkey: pubkey,
                isPublic: true
            });
        } else {
            // Fallback
            return Array.from(this.memoryNotes.values())
                .filter(note => note.authorPubkey === pubkey && note.isPublic);
        }
    }

    async searchNotes(query: string, pubkey: string): Promise<Note[]> {
        await this.ensureInitialized();

        const userNotes = await this.getUserNotes(pubkey);

        // Simple text search (in production, use a proper search index)
        const lowerQuery = query.toLowerCase();
        return userNotes.filter(note =>
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery) ||
            note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    async deleteNote(id: string): Promise<void> {
        await this.ensureInitialized();

        if (this.notesCollection) {
            await this.notesCollection.delete(id);
        } else {
            this.memoryNotes.delete(id);
        }
    }

    // Folder operations
    async saveFolder(folder: NoteFolder): Promise<void> {
        await this.ensureInitialized();

        if (this.foldersCollection) {
            await this.foldersCollection.save(folder);
        } else {
            this.memoryFolders.set(folder.id, folder);
        }
    }

    async getUserFolders(pubkey: string): Promise<NoteFolder[]> {
        await this.ensureInitialized();

        if (this.foldersCollection) {
            return await this.foldersCollection.findBy('ownerPubkey', pubkey);
        } else {
            return Array.from(this.memoryFolders.values())
                .filter(folder => folder.ownerPubkey === pubkey);
        }
    }

    // Sync operations
    async getLastSync(pubkey: string): Promise<number> {
        await this.ensureInitialized();

        if (this.syncCollection) {
            const status = await this.syncCollection.get(pubkey);
            return status?.lastSync || 0;
        }

        return 0;
    }

    async updateSyncStatus(pubkey: string, timestamp: number, lastNoteId?: string): Promise<void> {
        await this.ensureInitialized();

        if (this.syncCollection) {
            await this.syncCollection.save({
                pubkey,
                lastSync: timestamp,
                lastNoteId
            });
        }
    }

    // Bulk operations
    async importNotes(notes: Note[]): Promise<void> {
        await this.ensureInitialized();

        if (this.notesCollection) {
            await this.notesCollection.saveMany(notes);
        } else {
            for (const note of notes) {
                this.memoryNotes.set(note.id, note);
            }
        }
    }

    async exportUserData(pubkey: string): Promise<{
        notes: Note[];
        folders: NoteFolder[];
    }> {
        await this.ensureInitialized();

        const notes = await this.getUserNotes(pubkey);
        const folders = await this.getUserFolders(pubkey);

        return { notes, folders };
    }

    // Statistics
    async getStats(pubkey: string): Promise<{
        totalNotes: number;
        publicNotes: number;
        privateNotes: number;
        totalFolders: number;
        totalTags: number;
        storageType: 'persistent' | 'memory';
    }> {
        await this.ensureInitialized();

        const notes = await this.getUserNotes(pubkey);
        const folders = await this.getUserFolders(pubkey);

        const allTags = new Set<string>();
        let publicCount = 0;
        let privateCount = 0;

        for (const note of notes) {
            if (note.isPublic) publicCount++;
            else privateCount++;
            note.tags.forEach(tag => allTags.add(tag));
        }

        return {
            totalNotes: notes.length,
            publicNotes: publicCount,
            privateNotes: privateCount,
            totalFolders: folders.length,
            totalTags: allTags.size,
            storageType: this.hasModuleSupport ? 'persistent' : 'memory'
        };
    }

    // Cleanup
    async clear(): Promise<void> {
        await this.ensureInitialized();

        if (this.userPubkey) {
            // Clear only user's data
            const userNotes = await this.getUserNotes(this.userPubkey);
            const userFolders = await this.getUserFolders(this.userPubkey);

            if (this.notesCollection && this.foldersCollection) {
                await this.notesCollection.deleteMany(userNotes.map(n => n.id));
                await this.foldersCollection.deleteMany(userFolders.map(f => f.id));
            } else {
                userNotes.forEach(n => this.memoryNotes.delete(n.id));
                userFolders.forEach(f => this.memoryFolders.delete(f.id));
            }
        } else {
            // Clear everything
            if (this.notesCollection) await this.notesCollection.clear();
            if (this.foldersCollection) await this.foldersCollection.clear();
            if (this.syncCollection) await this.syncCollection.clear();

            this.memoryNotes.clear();
            this.memoryFolders.clear();
        }
    }
}
```

### 5. Main Manager Class (`notes-manager.ts`)

```typescript
import { EventEmitter } from 'eventemitter3';
import NDK, { NDKEvent, NDKKind, type NDKUser } from '@nostr-dev-kit/ndk';
import { NotesStorage } from './storage';
import type { Note, NoteFolder, NotesOptions } from './types';

export class NotesManager extends EventEmitter {
    private storage: NotesStorage;
    private autoSaveTimer?: NodeJS.Timeout;
    private syncTimer?: NodeJS.Timeout;

    constructor(
        private ndk: NDK,
        private user: NDKUser,
        private options: NotesOptions = {}
    ) {
        super();

        this.storage = new NotesStorage(
            ndk.cacheAdapter,
            user.pubkey
        );

        if (options.autoSave) {
            this.startAutoSave();
        }

        if (options.syncInterval) {
            this.startSync(options.syncInterval);
        }
    }

    // Create and manage notes
    async createNote(title: string, content: string, tags: string[] = []): Promise<Note> {
        const note: Note = {
            id: this.generateId(),
            title,
            content,
            authorPubkey: this.user.pubkey,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            tags,
            isPublic: false,
            encrypted: this.options.encryptByDefault,
        };

        if (note.encrypted && this.ndk.signer) {
            // Encrypt content
            note.content = await this.encryptContent(content);
        }

        await this.storage.saveNote(note);
        this.emit('note:created', note);

        // Publish to nostr if public
        if (note.isPublic) {
            await this.publishNote(note);
        }

        return note;
    }

    async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
        const note = await this.storage.getNote(id);
        if (!note) return null;

        const updatedNote: Note = {
            ...note,
            ...updates,
            id: note.id, // Ensure ID doesn't change
            authorPubkey: note.authorPubkey, // Ensure author doesn't change
            createdAt: note.createdAt, // Preserve creation time
            updatedAt: Date.now(),
        };

        await this.storage.saveNote(updatedNote);
        this.emit('note:updated', updatedNote);

        // Re-publish if public
        if (updatedNote.isPublic) {
            await this.publishNote(updatedNote);
        }

        return updatedNote;
    }

    async deleteNote(id: string): Promise<boolean> {
        const note = await this.storage.getNote(id);
        if (!note) return false;

        await this.storage.deleteNote(id);
        this.emit('note:deleted', { id });

        // Delete from nostr if it was public
        if (note.isPublic) {
            await this.unpublishNote(id);
        }

        return true;
    }

    async getNotes(limit?: number): Promise<Note[]> {
        return await this.storage.getUserNotes(this.user.pubkey, limit);
    }

    async searchNotes(query: string): Promise<Note[]> {
        return await this.storage.searchNotes(query, this.user.pubkey);
    }

    // Folder management
    async createFolder(name: string): Promise<NoteFolder> {
        const folder: NoteFolder = {
            id: this.generateId(),
            name,
            ownerPubkey: this.user.pubkey,
            noteIds: [],
            createdAt: Date.now(),
        };

        await this.storage.saveFolder(folder);
        this.emit('folder:created', folder);

        return folder;
    }

    async addNoteToFolder(noteId: string, folderId: string): Promise<boolean> {
        const folders = await this.storage.getUserFolders(this.user.pubkey);
        const folder = folders.find(f => f.id === folderId);

        if (!folder) return false;

        if (!folder.noteIds.includes(noteId)) {
            folder.noteIds.push(noteId);
            await this.storage.saveFolder(folder);
            this.emit('folder:updated', folder);
        }

        return true;
    }

    // Sharing
    async shareNote(noteId: string, recipientPubkey: string): Promise<boolean> {
        const note = await this.storage.getNote(noteId);
        if (!note) return false;

        // Add to shared list
        if (!note.sharedWith) note.sharedWith = [];
        if (!note.sharedWith.includes(recipientPubkey)) {
            note.sharedWith.push(recipientPubkey);
            await this.storage.saveNote(note);
        }

        // Send encrypted DM with note content
        if (this.ndk.signer) {
            const event = new NDKEvent(this.ndk);
            event.kind = NDKKind.EncryptedDirectMessage;
            event.content = JSON.stringify({
                type: 'shared_note',
                note: {
                    id: note.id,
                    title: note.title,
                    content: note.content,
                    tags: note.tags,
                }
            });
            event.tags = [['p', recipientPubkey]];

            await event.encrypt(
                await this.ndk.signer.user(),
                this.ndk.getUser({ pubkey: recipientPubkey })
            );
            await event.publish();
        }

        this.emit('note:shared', { noteId, recipientPubkey });
        return true;
    }

    // Sync with Nostr
    async syncWithNostr(): Promise<void> {
        const lastSync = await this.storage.getLastSync(this.user.pubkey);

        // Fetch notes from relays
        const events = await this.ndk.fetchEvents({
            kinds: [30023], // Long-form content
            authors: [this.user.pubkey],
            since: Math.floor(lastSync / 1000),
        });

        const importedNotes: Note[] = [];
        for (const event of events) {
            const note = this.eventToNote(event);
            if (note) {
                importedNotes.push(note);
            }
        }

        if (importedNotes.length > 0) {
            await this.storage.importNotes(importedNotes);
            this.emit('sync:completed', { imported: importedNotes.length });
        }

        await this.storage.updateSyncStatus(
            this.user.pubkey,
            Date.now(),
            importedNotes[0]?.id
        );
    }

    // Publishing to Nostr
    private async publishNote(note: Note): Promise<void> {
        const event = new NDKEvent(this.ndk);
        event.kind = 30023; // Long-form content
        event.content = note.content;
        event.tags = [
            ['d', note.id],
            ['title', note.title],
            ['published_at', Math.floor(note.createdAt / 1000).toString()],
            ...note.tags.map(tag => ['t', tag]),
        ];

        await event.publish();
        this.emit('note:published', { noteId: note.id, event });
    }

    private async unpublishNote(noteId: string): Promise<void> {
        const event = new NDKEvent(this.ndk);
        event.kind = NDKKind.EventDeletion;
        event.tags = [['e', noteId]];

        await event.publish();
        this.emit('note:unpublished', { noteId });
    }

    // Helpers
    private generateId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    private async encryptContent(content: string): Promise<string> {
        if (!this.ndk.signer) return content;

        // Implement encryption using NIP-04 or NIP-44
        const encrypted = await this.ndk.signer.encrypt(this.user, content);
        return encrypted;
    }

    private eventToNote(event: NDKEvent): Note | null {
        const title = event.tags.find(t => t[0] === 'title')?.[1];
        if (!title) return null;

        const dTag = event.tags.find(t => t[0] === 'd')?.[1];
        if (!dTag) return null;

        return {
            id: dTag,
            title,
            content: event.content,
            authorPubkey: event.pubkey,
            createdAt: event.created_at ? event.created_at * 1000 : Date.now(),
            updatedAt: Date.now(),
            tags: event.tags.filter(t => t[0] === 't').map(t => t[1]),
            isPublic: true,
            encrypted: false,
        };
    }

    private startAutoSave(): void {
        this.autoSaveTimer = setInterval(async () => {
            // Auto-save draft notes
            this.emit('autosave:triggered');
        }, 30000); // Every 30 seconds
    }

    private startSync(interval: number): void {
        this.syncTimer = setInterval(async () => {
            await this.syncWithNostr();
        }, interval);

        // Initial sync
        this.syncWithNostr().catch(console.error);
    }

    // Statistics
    async getStats() {
        return await this.storage.getStats(this.user.pubkey);
    }

    // Cleanup
    destroy(): void {
        if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
        if (this.syncTimer) clearInterval(this.syncTimer);
        this.removeAllListeners();
    }
}
```

### 6. Main Exports (`index.ts`)

```typescript
export { NotesManager } from './notes-manager';
export { notesCacheModule } from './cache-module';
export { NotesStorage } from './storage';
export type { Note, NoteFolder, NotesOptions } from './types';
```

### 7. Tests (`test/notes.test.ts`)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import NDK from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from '@nostr-dev-kit/cache-dexie';
import { NotesManager } from '../src';
import 'fake-indexeddb/auto';

describe('Notes Package', () => {
    let ndk: NDK;
    let notesManager: NotesManager;

    beforeEach(async () => {
        // Setup NDK with cache
        const cacheAdapter = new NDKCacheAdapterDexie({
            dbName: 'test-notes'
        });

        ndk = new NDK({
            cacheAdapter,
            explicitRelayUrls: ['wss://relay.example.com']
        });

        const user = ndk.getUser({ pubkey: 'test-pubkey' });
        notesManager = new NotesManager(ndk, user);
    });

    it('should create and retrieve notes', async () => {
        const note = await notesManager.createNote(
            'Test Note',
            'This is a test note',
            ['test', 'example']
        );

        expect(note).toBeDefined();
        expect(note.title).toBe('Test Note');
        expect(note.tags).toContain('test');

        const notes = await notesManager.getNotes();
        expect(notes).toHaveLength(1);
        expect(notes[0].id).toBe(note.id);
    });

    it('should update notes', async () => {
        const note = await notesManager.createNote('Original', 'Content');

        const updated = await notesManager.updateNote(note.id, {
            title: 'Updated Title',
            content: 'Updated Content'
        });

        expect(updated).toBeDefined();
        expect(updated?.title).toBe('Updated Title');
        expect(updated?.updatedAt).toBeGreaterThan(note.updatedAt);
    });

    it('should search notes', async () => {
        await notesManager.createNote('JavaScript Tutorial', 'Learn JS basics');
        await notesManager.createNote('Python Guide', 'Learn Python');
        await notesManager.createNote('JavaScript Advanced', 'Advanced JS patterns');

        const results = await notesManager.searchNotes('JavaScript');

        expect(results).toHaveLength(2);
        expect(results.every(n => n.title.includes('JavaScript'))).toBe(true);
    });

    it('should manage folders', async () => {
        const folder = await notesManager.createFolder('Work Notes');
        const note = await notesManager.createNote('Meeting Notes', 'Discuss project');

        const added = await notesManager.addNoteToFolder(note.id, folder.id);

        expect(added).toBe(true);
        expect(folder.noteIds).toContain(note.id);
    });

    it('should provide statistics', async () => {
        await notesManager.createNote('Note 1', 'Content 1', ['tag1']);
        await notesManager.createNote('Note 2', 'Content 2', ['tag2']);

        const stats = await notesManager.getStats();

        expect(stats.totalNotes).toBe(2);
        expect(stats.totalTags).toBe(2);
        expect(stats.storageType).toBe('persistent');
    });
});
```

### 8. Package Configuration (`package.json`)

```json
{
  "name": "@myorg/notes",
  "version": "1.0.0",
  "description": "Notes management package for NDK with persistent storage",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@nostr-dev-kit/ndk": "^2.0.0",
    "eventemitter3": "^5.0.0"
  },
  "devDependencies": {
    "@nostr-dev-kit/cache-dexie": "^2.0.0",
    "@types/node": "^20.0.0",
    "fake-indexeddb": "^6.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "@nostr-dev-kit/ndk": "^2.0.0"
  }
}
```

### 9. Build Configuration (`tsup.config.ts`)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['@nostr-dev-kit/ndk'],
});
```

## Usage Example

```typescript
import NDK from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from '@nostr-dev-kit/cache-dexie';
import { NotesManager } from '@myorg/notes';

async function main() {
    // Initialize NDK with cache
    const cacheAdapter = new NDKCacheAdapterDexie({
        dbName: 'my-app'
    });

    const ndk = new NDK({
        cacheAdapter,
        explicitRelayUrls: ['wss://relay.damus.io'],
        signer: // ... your signer
    });

    await ndk.connect();

    // Create notes manager
    const user = await ndk.signer!.user();
    const notes = new NotesManager(ndk, user, {
        autoSave: true,
        encryptByDefault: false,
        syncInterval: 60000, // Sync every minute
    });

    // Listen to events
    notes.on('note:created', (note) => {
        console.log('New note created:', note.title);
    });

    notes.on('sync:completed', ({ imported }) => {
        console.log(`Synced ${imported} notes from relays`);
    });

    // Create a note
    const note = await notes.createNote(
        'My First Note',
        'This is the content of my note',
        ['personal', 'thoughts']
    );

    // Update it
    await notes.updateNote(note.id, {
        content: 'Updated content',
        isPublic: true, // Make it public
    });

    // Search notes
    const results = await notes.searchNotes('content');

    // Get statistics
    const stats = await notes.getStats();
    console.log(`You have ${stats.totalNotes} notes (${stats.publicNotes} public)`);

    // Share a note
    await notes.shareNote(note.id, 'recipient-pubkey');

    // Create and organize in folders
    const folder = await notes.createFolder('Ideas');
    await notes.addNoteToFolder(note.id, folder.id);

    // Export all data
    const backup = await notes.storage.exportUserData(user.pubkey);
    console.log('Backup created:', backup);
}

main().catch(console.error);
```

## Key Features Demonstrated

1. **Complete Cache Module**: Full implementation with collections, indexes, and migrations
2. **Fallback Support**: Works with and without cache module support
3. **Type Safety**: Full TypeScript types throughout
4. **Event-Driven**: EventEmitter for real-time updates
5. **Nostr Integration**: Publishes notes as Nostr events
6. **Search & Organization**: Folders and search functionality
7. **Sharing**: Share notes with other users via encrypted DMs
8. **Sync**: Bidirectional sync with Nostr relays
9. **Testing**: Complete test suite
10. **Production Ready**: Error handling, cleanup, and statistics

## Migration Path

When updating the schema:

1. Increment the version number
2. Add a new migration function
3. Handle data transformation carefully
4. Test with existing data

Example:
```typescript
// Upgrading from v2 to v3
migrations: {
    // ... v1 and v2 ...

    3: async (context) => {
        // Add new collection
        await context.createCollection('tags', {
            primaryKey: 'id',
            indexes: ['name', 'usageCount'],
        });

        // Migrate existing data
        const notesCollection = await context.getCollection('notes');
        const tagsCollection = await context.getCollection('tags');

        const allNotes = await notesCollection.all();
        const tagMap = new Map<string, number>();

        // Count tag usage
        for (const note of allNotes) {
            for (const tag of note.tags || []) {
                tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
            }
        }

        // Create tag records
        for (const [name, count] of tagMap.entries()) {
            await tagsCollection.save({
                id: name.toLowerCase(),
                name,
                usageCount: count,
                createdAt: Date.now(),
            });
        }
    }
}
```

This example provides a complete, production-ready implementation that developers can use as a template for their own packages.