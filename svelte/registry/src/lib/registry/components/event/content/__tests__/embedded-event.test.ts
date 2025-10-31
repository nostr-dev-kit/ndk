import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { NDKSvelte } from '@nostr-dev-kit/svelte';
import EmbeddedEvent from '../event/event.svelte';

// Mock the createEmbeddedEvent builder
vi.mock('@nostr-dev-kit/svelte', async () => {
  const actual = await vi.importActual('@nostr-dev-kit/svelte');
  return {
    ...actual,
    createEmbeddedEvent: vi.fn((propsGetter: () => { bech32: string }, ndk: NDKSvelte) => {
      const mockEvent = {
        kind: 1,
        content: 'Test note content',
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        id: 'testeventid',
        sig: 'testsig',
      } as NDKEvent;

      return {
        loading: false,
        error: null,
        event: mockEvent,
      };
    }),
  };
});

describe('EmbeddedEvent', () => {
  let mockNdk: NDKSvelte;

  beforeEach(() => {
    mockNdk = new NDKSvelte();
  });

  describe('KIND_HANDLERS map', () => {
    it('should render NoteEmbedded for kind 1', () => {
      const { container } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1test',
        },
      });

      // Should render the note-embedded component
      expect(container.querySelector('.note-embedded')).toBeTruthy();
    });

    it('should use the same handler for kind 1111 (GenericReply)', async () => {
      const { createEmbeddedEvent } = await import('@nostr-dev-kit/svelte');
      vi.mocked(createEmbeddedEvent).mockReturnValue({
        loading: false,
        error: null,
        event: {
          kind: 1111,
          content: 'Test reply',
        } as NDKEvent,
      });

      const { container } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1test',
        },
      });

      // Should use NoteEmbedded for kind 1111
      expect(container.querySelector('.note-embedded')).toBeTruthy();
    });

    it('should render ArticleEmbedded for kind 30023', async () => {
      const { createEmbeddedEvent } = await import('@nostr-dev-kit/svelte');
      vi.mocked(createEmbeddedEvent).mockReturnValue({
        loading: false,
        error: null,
        event: {
          kind: 30023,
          content: 'Test article content',
          tags: [['title', 'Test Article']],
        } as NDKEvent,
      });

      const { container } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'naddr1test',
        },
      });

      expect(container.querySelector('.article-embedded')).toBeTruthy();
    });

    it('should render HighlightEmbedded for kind 9802', async () => {
      const { createEmbeddedEvent } = await import('@nostr-dev-kit/svelte');
      vi.mocked(createEmbeddedEvent).mockReturnValue({
        loading: false,
        error: null,
        event: {
          kind: 9802,
          content: 'Highlighted text',
        } as NDKEvent,
      });

      const { container } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'nevent1test',
        },
      });

      expect(container.querySelector('.highlight-embedded')).toBeTruthy();
    });

    it('should fall back to GenericEmbedded for unknown kind', async () => {
      const { createEmbeddedEvent } = await import('@nostr-dev-kit/svelte');
      vi.mocked(createEmbeddedEvent).mockReturnValue({
        loading: false,
        error: null,
        event: {
          kind: 99999, // Unknown kind
          content: 'Unknown event type',
        } as NDKEvent,
      });

      const { container } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'nevent1test',
        },
      });

      // Should render generic fallback with kind badge
      expect(container.querySelector('.generic-embedded')).toBeTruthy();
      expect(screen.getByText(/Kind 99999/)).toBeTruthy();
    });
  });

  describe('Loading states', () => {
    it('should show loading state', async () => {
      const { createEmbeddedEvent } = await import('@nostr-dev-kit/svelte');
      vi.mocked(createEmbeddedEvent).mockReturnValue({
        loading: true,
        error: null,
        event: null,
      });

      render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1test',
        },
      });

      expect(screen.getByText('Loading event...')).toBeTruthy();
      expect(document.querySelector('.loading-spinner')).toBeTruthy();
    });

    it('should show error state', async () => {
      const { createEmbeddedEvent } = await import('@nostr-dev-kit/svelte');
      vi.mocked(createEmbeddedEvent).mockReturnValue({
        loading: false,
        error: 'Failed to fetch event',
        event: null,
      });

      render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1test',
        },
      });

      expect(screen.getByText('Failed to load event')).toBeTruthy();
    });
  });

  describe('Variant prop', () => {
    it('should pass variant prop to handler component', async () => {
      const { container } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1test',
          variant: 'compact',
        },
      });

      const noteEmbedded = container.querySelector('.note-embedded');
      expect(noteEmbedded).toBeTruthy();
      expect(noteEmbedded?.getAttribute('data-variant')).toBe('compact');
    });

    it('should default to "card" variant', async () => {
      const { container } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1test',
        },
      });

      const noteEmbedded = container.querySelector('.note-embedded');
      expect(noteEmbedded?.getAttribute('data-variant')).toBe('card');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to loading state', async () => {
      const { createEmbeddedEvent } = await import('@nostr-dev-kit/svelte');
      vi.mocked(createEmbeddedEvent).mockReturnValue({
        loading: true,
        error: null,
        event: null,
      });

      const { container } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1test',
          class: 'custom-class',
        },
      });

      expect(container.querySelector('.custom-class')).toBeTruthy();
    });

    it('should apply custom className to error state', async () => {
      const { createEmbeddedEvent } = await import('@nostr-dev-kit/svelte');
      vi.mocked(createEmbeddedEvent).mockReturnValue({
        loading: false,
        error: 'Error',
        event: null,
      });

      const { container } = render(EmbeddedEvent, {
        props: {
          ndk: mockNdk,
          bech32: 'note1test',
          class: 'error-custom',
        },
      });

      expect(container.querySelector('.error-custom')).toBeTruthy();
    });
  });
});
