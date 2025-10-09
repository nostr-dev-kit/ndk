---
"@nostr-dev-kit/svelte": minor
---

Refactor EventContent component with extensible architecture and new editor

- Complete refactor of EventContent component for better modularity and customization
- Add customizable component registry for mentions, events, hashtags, links, media, and emojis
- Add extensible handlers system for click events and interactions via EventContentHandlersProxy
- Split parsing logic into reusable utilities (event-content-utils.ts)
- Add new embedded event components (EmbeddedEvent, MentionPreview, HashtagPreview)
- Add NostrEditor component with TipTap integration for rich text editing
- Add editor node views for nprofile, nevent, naddr, images, and videos
- Export new components and utilities for full customization
