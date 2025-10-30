import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import type { NDKEvent, NDKArticle } from '@nostr-dev-kit/ndk';
import { NDKSvelte } from '@nostr-dev-kit/svelte';
import { ArticleEmbedded } from '../kinds/article-embedded';
import { NoteEmbedded } from '../kinds/note-embedded';
import { HighlightEmbedded } from '../kinds/highlight-embedded';
import GenericEmbedded from '../event/generic-embedded.svelte';

describe('Kind Handlers', () => {
  let mockNdk: NDKSvelte;

  beforeEach(() => {
    mockNdk = new NDKSvelte();
  });

  describe('ArticleEmbedded', () => {
    it('should render with card variant', () => {
      const mockArticle = {
        kind: 30023,
        content: 'Article content',
        tags: [
          ['title', 'Test Article'],
          ['summary', 'This is a test article'],
        ],
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
      } as NDKArticle;

      const { container } = render(ArticleEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockArticle,
          variant: 'card',
        },
      });

      expect(container.querySelector('.article-embedded')).toBeTruthy();
      expect(container.querySelector('[data-variant="card"]')).toBeTruthy();
    });

    it('should render with compact variant', () => {
      const mockArticle = {
        kind: 30023,
        content: 'Article content',
        tags: [['title', 'Test Article']],
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
      } as NDKArticle;

      const { container } = render(ArticleEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockArticle,
          variant: 'compact',
        },
      });

      expect(container.querySelector('[data-variant="compact"]')).toBeTruthy();
    });

    it('should render with inline variant', () => {
      const mockArticle = {
        kind: 30023,
        content: 'Article content',
        tags: [['title', 'Test Article']],
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
      } as NDKArticle;

      const { container } = render(ArticleEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockArticle,
          variant: 'inline',
        },
      });

      expect(container.querySelector('[data-variant="inline"]')).toBeTruthy();
    });
  });

  describe('NoteEmbedded', () => {
    it('should render with card variant', () => {
      const mockNote = {
        kind: 1,
        content: 'This is a test note',
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
      } as NDKEvent;

      const { container } = render(NoteEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockNote,
          variant: 'card',
        },
      });

      expect(container.querySelector('.note-embedded')).toBeTruthy();
      expect(container.querySelector('[data-variant="card"]')).toBeTruthy();
    });

    it('should render with compact variant', () => {
      const mockNote = {
        kind: 1,
        content: 'Short note',
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
      } as NDKEvent;

      const { container } = render(NoteEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockNote,
          variant: 'compact',
        },
      });

      expect(container.querySelector('[data-variant="compact"]')).toBeTruthy();
    });

    it('should render with inline variant', () => {
      const mockNote = {
        kind: 1111,
        content: 'Generic reply',
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
      } as NDKEvent;

      const { container } = render(NoteEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockNote,
          variant: 'inline',
        },
      });

      expect(container.querySelector('[data-variant="inline"]')).toBeTruthy();
    });
  });

  describe('HighlightEmbedded', () => {
    it('should render with card variant', () => {
      const mockHighlight = {
        kind: 9802,
        content: 'Highlighted text from article',
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
        tags: [['context', 'Book title']],
      } as NDKEvent;

      const { container } = render(HighlightEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockHighlight,
          variant: 'card',
        },
      });

      expect(container.querySelector('.highlight-embedded')).toBeTruthy();
      expect(container.querySelector('[data-variant="card"]')).toBeTruthy();
    });

    it('should render with compact variant', () => {
      const mockHighlight = {
        kind: 9802,
        content: 'Short highlight',
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
      } as NDKEvent;

      const { container } = render(HighlightEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockHighlight,
          variant: 'compact',
        },
      });

      expect(container.querySelector('[data-variant="compact"]')).toBeTruthy();
    });

    it('should render with inline variant', () => {
      const mockHighlight = {
        kind: 9802,
        content: 'Inline highlight',
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
      } as NDKEvent;

      const { container } = render(HighlightEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockHighlight,
          variant: 'inline',
        },
      });

      expect(container.querySelector('[data-variant="inline"]')).toBeTruthy();
    });
  });

  describe('GenericEmbedded', () => {
    it('should render with kind badge', () => {
      const mockEvent = {
        kind: 12345,
        content: 'Unknown kind event',
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
      } as NDKEvent;

      const { container, getByText } = render(GenericEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockEvent,
          variant: 'card',
        },
      });

      expect(container.querySelector('.generic-embedded')).toBeTruthy();
      expect(getByText('Kind 12345')).toBeTruthy();
      expect(container.querySelector('.kind-badge')).toBeTruthy();
    });

    it('should render with different variants', () => {
      const mockEvent = {
        kind: 99999,
        content: 'Test content',
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
      } as NDKEvent;

      const { container: container1 } = render(GenericEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockEvent,
          variant: 'compact',
        },
      });

      expect(container1.querySelector('[data-variant="compact"]')).toBeTruthy();

      const { container: container2 } = render(GenericEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockEvent,
          variant: 'inline',
        },
      });

      expect(container2.querySelector('[data-variant="inline"]')).toBeTruthy();
    });
  });

  describe('Variant prop handling', () => {
    it('should default to card variant when not specified', () => {
      const mockNote = {
        kind: 1,
        content: 'Test note',
        pubkey: 'testpubkey',
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
      } as NDKEvent;

      const { container } = render(NoteEmbedded, {
        props: {
          ndk: mockNdk,
          event: mockNote,
        },
      });

      expect(container.querySelector('[data-variant="card"]')).toBeTruthy();
    });
  });
});
