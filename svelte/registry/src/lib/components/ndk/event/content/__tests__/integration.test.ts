import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import type { NDKEvent, NDKArticle } from '@nostr-dev-kit/ndk';
import { NDKSvelte } from '@nostr-dev-kit/svelte';
import EmbeddedEvent from '../event/event.svelte';

describe('EmbeddedEvent Integration Tests', () => {
  let mockNdk: NDKSvelte;
  let createEmbeddedEventMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockNdk = new NDKSvelte();

    // Mock the createEmbeddedEvent builder
    const { createEmbeddedEvent } = await import('@nostr-dev-kit/svelte');
    createEmbeddedEventMock = vi.mocked(createEmbeddedEvent);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Full flow: bech32 → fetch → render', () => {
    it('should fetch and render a note (kind 1)', async () => {
      const mockNote: NDKEvent = {
        kind: 1,
        content: 'Hello Nostr!',
        pubkey: 'npub1test',
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        id: 'noteid',
        sig: 'notesig',
      } as NDKEvent;

      createEmbeddedEventMock.mockReturnValue({
        loading: false,
        error: null,
        event: mockNote,
      });

      const { container } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1testbech32string',
        },
      });

      await waitFor(() => {
        expect(container.querySelector('.note-embedded')).toBeTruthy();
      });

      // Verify createEmbeddedEvent was called with correct params
      expect(createEmbeddedEventMock).toHaveBeenCalledWith(
        expect.any(Function),
        mockNdk
      );
    });

    it('should fetch and render an article (kind 30023)', async () => {
      const mockArticle: NDKArticle = {
        kind: 30023,
        content: 'Long-form article content...',
        pubkey: 'npub1author',
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['title', 'My First Article'],
          ['summary', 'An interesting read'],
          ['d', 'unique-identifier'],
        ],
        id: 'articleid',
        sig: 'articlesig',
      } as NDKArticle;

      createEmbeddedEventMock.mockReturnValue({
        loading: false,
        error: null,
        event: mockArticle,
      });

      const { container } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'naddr1testbech32string',
        },
      });

      await waitFor(() => {
        expect(container.querySelector('.article-embedded')).toBeTruthy();
      });
    });

    it('should fetch and render a highlight (kind 9802)', async () => {
      const mockHighlight: NDKEvent = {
        kind: 9802,
        content: 'This is an important quote',
        pubkey: 'npub1highlighter',
        created_at: Math.floor(Date.now() / 1000),
        tags: [['context', 'The Great Gatsby']],
        id: 'highlightid',
        sig: 'highlightsig',
      } as NDKEvent;

      createEmbeddedEventMock.mockReturnValue({
        loading: false,
        error: null,
        event: mockHighlight,
      });

      const { container } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'nevent1highlightbech32',
        },
      });

      await waitFor(() => {
        expect(container.querySelector('.highlight-embedded')).toBeTruthy();
      });
    });
  });

  describe('Dynamic kind switching', () => {
    it('should re-render when event kind changes', async () => {
      // Start with a note
      createEmbeddedEventMock.mockReturnValue({
        loading: false,
        error: null,
        event: {
          kind: 1,
          content: 'Note content',
        } as NDKEvent,
      });

      const { container, component } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1initial',
        },
      });

      await waitFor(() => {
        expect(container.querySelector('.note-embedded')).toBeTruthy();
      });

      // Now switch to an article
      createEmbeddedEventMock.mockReturnValue({
        loading: false,
        error: null,
        event: {
          kind: 30023,
          content: 'Article content',
          tags: [['title', 'Article']],
        } as NDKArticle,
      });

      // Update the bech32 prop to trigger re-render
      component.$set({
        bech32: 'naddr1updated',
      });

      await waitFor(() => {
        expect(container.querySelector('.article-embedded')).toBeTruthy();
        expect(container.querySelector('.note-embedded')).toBeFalsy();
      });
    });
  });

  describe('Loading state transitions', () => {
    it('should show loading, then render content', async () => {
      // Start with loading
      createEmbeddedEventMock.mockReturnValue({
        loading: true,
        error: null,
        event: null,
      });

      const { container, getByText, component } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1loading',
        },
      });

      // Should show loading spinner
      expect(getByText('Loading event...')).toBeTruthy();
      expect(container.querySelector('.loading-spinner')).toBeTruthy();

      // Simulate load complete
      createEmbeddedEventMock.mockReturnValue({
        loading: false,
        error: null,
        event: {
          kind: 1,
          content: 'Loaded content',
        } as NDKEvent,
      });

      // Force re-render
      component.$set({ bech32: 'note1loaded' });

      await waitFor(() => {
        expect(container.querySelector('.note-embedded')).toBeTruthy();
        expect(container.querySelector('.loading-spinner')).toBeFalsy();
      });
    });

    it('should handle loading → error transition', async () => {
      createEmbeddedEventMock.mockReturnValue({
        loading: true,
        error: null,
        event: null,
      });

      const { container, getByText, component } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1willfail',
        },
      });

      expect(getByText('Loading event...')).toBeTruthy();

      // Simulate error
      createEmbeddedEventMock.mockReturnValue({
        loading: false,
        error: 'Network error: Event not found',
        event: null,
      });

      component.$set({ bech32: 'note1failed' });

      await waitFor(() => {
        expect(getByText('Failed to load event')).toBeTruthy();
        expect(container.querySelector('.embedded-error')).toBeTruthy();
      });
    });
  });

  describe('Variant propagation', () => {
    it('should propagate variant to all handler types', async () => {
      const variants: Array<'inline' | 'card' | 'compact'> = ['inline', 'card', 'compact'];

      for (const variant of variants) {
        // Test with note
        createEmbeddedEventMock.mockReturnValue({
          loading: false,
          error: null,
          event: {
            kind: 1,
            content: 'Test',
          } as NDKEvent,
        });

        const { container: noteContainer } = render(EmbeddedEvent, {
          props: {
            ndk: mockNdk,
            bech32: 'note1test',
            variant,
          },
        });

        await waitFor(() => {
          const element = noteContainer.querySelector('.note-embedded');
          expect(element?.getAttribute('data-variant')).toBe(variant);
        });

        // Test with article
        createEmbeddedEventMock.mockReturnValue({
          loading: false,
          error: null,
          event: {
            kind: 30023,
            content: 'Test',
            tags: [],
          } as NDKArticle,
        });

        const { container: articleContainer } = render(EmbeddedEvent, {
          props: {
            ndk: mockNdk,
            bech32: 'naddr1test',
            variant,
          },
        });

        await waitFor(() => {
          const element = articleContainer.querySelector('.article-embedded');
          expect(element?.getAttribute('data-variant')).toBe(variant);
        });
      }
    });
  });

  describe('Error handling', () => {
    it('should handle malformed bech32', async () => {
      createEmbeddedEventMock.mockReturnValue({
        loading: false,
        error: 'Invalid bech32 string',
        event: null,
      });

      const { getByText } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'invalid-bech32',
        },
      });

      await waitFor(() => {
        expect(getByText('Failed to load event')).toBeTruthy();
      });
    });

    it('should handle event not found', async () => {
      createEmbeddedEventMock.mockReturnValue({
        loading: false,
        error: 'Event not found in any relay',
        event: null,
      });

      const { getByText } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1doesnotexist',
        },
      });

      await waitFor(() => {
        expect(getByText('Failed to load event')).toBeTruthy();
      });
    });
  });

  describe('Unknown kinds fallback', () => {
    it('should gracefully handle completely unknown kinds', async () => {
      const unknownKinds = [12345, 99999, 88888, 77777];

      for (const kind of unknownKinds) {
        createEmbeddedEventMock.mockReturnValue({
          loading: false,
          error: null,
          event: {
            kind,
            content: `Content for kind ${kind}`,
          } as NDKEvent,
        });

        const { container, getByText } = render(EmbeddedEvent, {
          props: {
            ndk: mockNdk,
            bech32: `note1kind${kind}`,
          },
        });

        await waitFor(() => {
          expect(container.querySelector('.generic-embedded')).toBeTruthy();
          expect(getByText(`Kind ${kind}`)).toBeTruthy();
        });
      }
    });
  });

  describe('Multiple instances', () => {
    it('should handle multiple embedded events independently', async () => {
      // Create three different events
      const events = [
        {
          kind: 1,
          content: 'Note 1',
          id: 'note1',
        } as NDKEvent,
        {
          kind: 30023,
          content: 'Article',
          tags: [['title', 'Article']],
          id: 'article1',
        } as NDKArticle,
        {
          kind: 9802,
          content: 'Highlight',
          id: 'highlight1',
        } as NDKEvent,
      ];

      const containers: Element[] = [];

      for (let i = 0; i < events.length; i++) {
        createEmbeddedEventMock.mockReturnValueOnce({
          loading: false,
          error: null,
          event: events[i],
        });

        const { container } = render(EmbeddedEvent, {
          props: {
            ndk: mockNdk,
            bech32: `event${i}`,
          },
        });

        containers.push(container);
      }

      await waitFor(() => {
        expect(containers[0].querySelector('.note-embedded')).toBeTruthy();
        expect(containers[1].querySelector('.article-embedded')).toBeTruthy();
        expect(containers[2].querySelector('.highlight-embedded')).toBeTruthy();
      });
    });
  });
});
