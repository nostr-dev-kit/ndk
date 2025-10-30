/**
 * Embedded Event Handlers Registry
 *
 * This file imports all installed embedded event handlers, which
 * self-register with the defaultKindRegistry via side effects.
 *
 * To add a new kind handler:
 * 1. Install: `npx shadcn-svelte@latest add video-embedded`
 * 2. Post-install will automatically append the import below
 *
 * Or manually add:
 *   import '$lib/ndk/event/content/kinds/video-embedded';
 */

// Default handlers (included with event-content installation)
import '$lib/ndk/event/content/kinds/article-embedded';
import '$lib/ndk/event/content/kinds/note-embedded';
import '$lib/ndk/event/content/kinds/highlight-embedded';

// Add your custom kind handlers here
// import '$lib/ndk/event/content/kinds/video-embedded';
// import '$lib/ndk/event/content/kinds/audio-embedded';
// import '$lib/ndk/event/content/kinds/image-embedded';
