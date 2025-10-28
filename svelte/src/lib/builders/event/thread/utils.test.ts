import { describe, it, expect } from 'vitest';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { buildLinearChain } from './utils.js';
import type { ThreadNode } from './types.js';

describe('buildLinearChain', () => {
    it('should set showLineToNext correctly for all nodes except the last', () => {
        // Create mock events
        const parent1 = new NDKEvent(undefined, {
            id: 'parent1',
            pubkey: 'user1',
            created_at: 1000,
            kind: 1,
            tags: [],
            content: 'Parent 1',
            sig: ''
        });

        const parent2 = new NDKEvent(undefined, {
            id: 'parent2',
            pubkey: 'user1',
            created_at: 2000,
            kind: 1,
            tags: [['e', 'parent1', '', 'reply']],
            content: 'Parent 2',
            sig: ''
        });

        const mainEvent = new NDKEvent(undefined, {
            id: 'main',
            pubkey: 'user1',
            created_at: 3000,
            kind: 1,
            tags: [['e', 'parent2', '', 'reply']],
            content: 'Main event',
            sig: ''
        });

        const continuation = new NDKEvent(undefined, {
            id: 'cont1',
            pubkey: 'user1',
            created_at: 4000,
            kind: 1,
            tags: [['e', 'main', '', 'reply']],
            content: 'Continuation',
            sig: ''
        });

        // Create parent and continuation nodes
        const parents: ThreadNode[] = [
            { id: parent1.id, event: parent1 },
            { id: parent2.id, event: parent2 }
        ];

        const continuationNodes: ThreadNode[] = [
            { id: continuation.id, event: continuation }
        ];

        // Build the linear chain
        const chain = buildLinearChain(parents, mainEvent, continuationNodes);

        // Verify structure
        expect(chain).toHaveLength(4);

        // Check threading metadata
        // First parent should show line (has next node)
        expect(chain[0].threading?.showLineToNext).toBe(true);

        // Second parent should show line (has main event next)
        expect(chain[1].threading?.showLineToNext).toBe(true);

        // Main event should show line (has continuation next)
        expect(chain[2].threading?.showLineToNext).toBe(true);

        // Continuation should NOT show line (is last)
        expect(chain[3].threading?.showLineToNext).toBe(false);
    });

    it('should detect self-threads correctly', () => {
        const event1 = new NDKEvent(undefined, {
            id: 'event1',
            pubkey: 'user1',
            created_at: 1000,
            kind: 1,
            tags: [],
            content: 'Event 1',
            sig: ''
        });

        const event2 = new NDKEvent(undefined, {
            id: 'event2',
            pubkey: 'user1', // Same author
            created_at: 2000,
            kind: 1,
            tags: [['e', 'event1', '', 'reply']],
            content: 'Event 2',
            sig: ''
        });

        const event3 = new NDKEvent(undefined, {
            id: 'event3',
            pubkey: 'user2', // Different author
            created_at: 3000,
            kind: 1,
            tags: [['e', 'event2', '', 'reply']],
            content: 'Event 3',
            sig: ''
        });

        const parents: ThreadNode[] = [
            { id: event1.id, event: event1 }
        ];

        const chain = buildLinearChain(parents, event2, [
            { id: event3.id, event: event3 }
        ]);

        // Event 1 -> Event 2: same author, should be self-thread
        expect(chain[0].threading?.isSelfThread).toBe(true);

        // Event 2 -> Event 3: different author, should not be self-thread
        expect(chain[1].threading?.isSelfThread).toBe(false);
    });

    it('should calculate depth correctly', () => {
        const event1 = new NDKEvent(undefined, {
            id: 'event1',
            pubkey: 'user1',
            created_at: 1000,
            kind: 1,
            tags: [],
            content: 'Event 1',
            sig: ''
        });

        const event2 = new NDKEvent(undefined, {
            id: 'event2',
            pubkey: 'user1',
            created_at: 2000,
            kind: 1,
            tags: [['e', 'event1', '', 'reply']],
            content: 'Event 2',
            sig: ''
        });

        const parents: ThreadNode[] = [
            { id: event1.id, event: event1 }
        ];

        const chain = buildLinearChain(parents, event2, []);

        // Depth should be the index in the chain
        expect(chain[0].threading?.depth).toBe(0);
        expect(chain[1].threading?.depth).toBe(1);
    });
});
