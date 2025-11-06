# Event Rendering Flow - Visual Map

## Complete Rendering Chain

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: EventCardClassic (Entry Point)                                    │
│ File: event-card-classic.svelte                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Props: { ndk, event }                                                       │
│                                                                             │
│ Line 43: <EventCard.Root {ndk} {event}>                                    │
│ Line 53:   <EventCard.Header />                                            │
│ Line 59:   <EventCard.Content {truncate} /> ────────┐                      │
│ Line 62:   <EventCard.Actions>...</EventCard.Actions>                      │
│                                                      │                      │
│ Value: Pre-composed card layout                     │                      │
└──────────────────────────────────────────────────────┼──────────────────────┘
                                                       │
                                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 2: EventCard.Content                                                 │
│ File: event-card/event-card-content.svelte                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ Line 33: Gets EventCardContext (ndk, event)                                │
│ Line 39: Gets ContentRendererContext (renderer)                            │
│                                                                             │
│ Line 86: <EventContent                                                     │
│            ndk={context.ndk}                                                │
│            event={context.event}                                           │
│            renderer={rendererContext?.renderer} /> ─────┐                  │
│                                                          │                  │
│ Value: Truncation UI + Context bridge                   │                  │
└──────────────────────────────────────────────────────────┼──────────────────┘
                                                           │
                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 3: EventContent (Parser & Router)                                    │
│ File: ui/event-content.svelte                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Line 30-31: renderer = prop ?? context ?? defaultContentRenderer           │
│ Line 33-39: parsed = createEventContent({ event, content, emojiTags })     │
│             └─> Returns { segments: ParsedSegment[] }                      │
│                                                                             │
│ Line 43: {#each parsed.segments as segment}                                │
│                                                                             │
│   Segment Type Routing:                                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │ Line 44: 'text'      → {segment.content}                            │  │
│   │ Line 46: 'npub'      → <MentionComponent /> ──────────┐             │  │
│   │ Line 46: 'nprofile'  → <MentionComponent /> ──────────┼────┐        │  │
│   │ Line 55: 'event-ref' → <EmbeddedEvent /> ─────────────┼────┼───┐    │  │
│   │ Line 59: 'hashtag'   → <HashtagComponent />           │    │   │    │  │
│   │ Line 68: 'link'      → <LinkComponent /> or <a>       │    │   │    │  │
│   │ Line 78: 'media'     → <MediaComponent /> or img/video│    │   │    │  │
│   │ Line 104: 'emoji'    → <img src={emoji} />            │    │   │    │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                           │    │   │        │
│ Value: Central routing - delegates to specialized renderers                │
└───────────────────────────────────────────────────────────┼────┼───┼────────┘
                                                            │    │   │
                    ┌───────────────────────────────────────┘    │   │
                    │   ┌────────────────────────────────────────┘   │
                    │   │   ┌────────────────────────────────────────┘
                    ▼   ▼   ▼
        ┌───────────────────────────────────────────────────────────┐
        │ LEVEL 4a: Mention Component                              │
        │ File: components/mention/mention.svelte                  │
        ├───────────────────────────────────────────────────────────┤
        │ Props: { ndk, bech32 }                                    │
        │                                                           │
        │ Line 18: ndk.fetchUser(bech32) → user                    │
        │ Line 24: <User.Root {ndk} {user}>                        │
        │ Line 25:   @<User.Name />                                │
        │                                                           │
        │ Value: Fetches & displays user profile                   │
        └───────────────────────────────────────────────────────────┘

                                                    ▼
        ┌───────────────────────────────────────────────────────────────────┐
        │ LEVEL 4b: EmbeddedEvent (Event Reference Handler)                │
        │ File: ui/embedded-event.svelte                                    │
        ├───────────────────────────────────────────────────────────────────┤
        │ Props: { ndk, bech32, variant, renderer }                         │
        │                                                                   │
        │ Line 26: setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer })  │
        │          └─> Propagates renderer to nested components            │
        │                                                                   │
        │ Line 28: embedded = createEmbeddedEvent({ bech32 }, ndk)         │
        │          └─> Fetches event via ndk.fetchEvent(bech32)            │
        │              Returns: { event, loading, error }                  │
        │                                                                   │
        │ Line 31: handlerInfo = renderer.getKindHandler(event.kind)       │
        │          └─> Looks up handler in ContentRenderer registry        │
        │                                                                   │
        │ Line 36-40: wrappedEvent = handlerInfo.wrapper.from(event)       │
        │             └─> Wraps with NDK class (e.g., NDKArticle)          │
        │                                                                   │
        │ Line 52-53: {#if Handler && wrappedEvent}                        │
        │               <Handler {ndk} event={wrappedEvent} {variant} />   │
        │             ──────────────────────┐                               │
        │                                   │                               │
        │ Line 54-68: Fallback UI if no handler                            │
        │                                   │                               │
        │ Value: Fetch event, route by kind │                               │
        └───────────────────────────────────┼───────────────────────────────┘
                                            │
                                            ▼
        ┌───────────────────────────────────────────────────────────────────┐
        │ LEVEL 5: Kind-Specific Handlers                                  │
        │                                                                   │
        │ ┌─────────────────────────────────────────────────────────────┐  │
        │ │ NoteEmbedded (Kind 1, 1111)                                 │  │
        │ │ File: components/note-embedded/note-embedded.svelte         │  │
        │ ├─────────────────────────────────────────────────────────────┤  │
        │ │ Props: { ndk, event, variant }                              │  │
        │ │                                                             │  │
        │ │ Line 17: <EventCard.Root {ndk} {event}>                    │  │
        │ │ Line 18:   <EventCard.Header />                            │  │
        │ │ Line 24:   <EventCard.Content truncate={...} />            │  │
        │ │            └──────────────────────────┐                     │  │
        │ │                                       │                     │  │
        │ │ Registration (index.ts):              │                     │  │
        │ │ Line 6: defaultContentRenderer        │                     │  │
        │ │           .addKind([1, 1111],         │                     │  │
        │ │                    NoteEmbedded)      │                     │  │
        │ │                                       │                     │  │
        │ │ Value: Renders notes recursively ────┼───► BACK TO LEVEL 2 │  │
        │ └─────────────────────────────────────────────────────────────┘  │
        │                                                                   │
        │ ┌─────────────────────────────────────────────────────────────┐  │
        │ │ Other Handlers (same pattern):                              │  │
        │ │ • ArticleEmbedded (Kind 30023)                              │  │
        │ │ • HighlightEmbedded (Kind 9802)                             │  │
        │ │ • EventEmbedded (fallback)                                  │  │
        │ └─────────────────────────────────────────────────────────────┘  │
        └───────────────────────────────────────────────────────────────────┘
```

## Supporting Systems

### Content Parsing Pipeline

```
┌──────────────────────────────────────────────────────────────────────────┐
│ builders/event-content/utils.ts                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Input: "Hello nostr:npub1abc... check nostr:nevent1xyz... #bitcoin"     │
│        ▼                                                                 │
│                                                                          │
│ Line 156-169: collectMatches(content)                                   │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Regex Patterns:                                              │     │
│   │ • NOSTR_URI: nostr:(npub1|note1|nevent1|naddr1|nprofile1)   │     │
│   │ • HASHTAG: #([a-zA-Z0-9_]+)                                  │     │
│   │ • MEDIA_FILE: https?://.*\.(jpg|png|mp4|...)                │     │
│   │ • YOUTUBE: youtube.com/watch...                              │     │
│   │ • URL: https?://...                                          │     │
│   │ • EMOJI_SHORTCODE: :emoji_name:                              │     │
│   └──────────────────────────────────────────────────────────────┘     │
│        ▼                                                                 │
│                                                                          │
│ Line 171-217: parseContentToSegments(content, emojiMap)                 │
│   • Iterates through matches in order                                   │
│   • Adds text segments between matches                                  │
│   • Classifies each match via classifyMatch()                           │
│        ▼                                                                 │
│                                                                          │
│ Line 63-88: decodeNostrUri(uri)                                         │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ "npub1..."    → { type: 'npub', data: 'npub1...' }          │     │
│   │ "nprofile1..." → { type: 'nprofile', data: 'nprofile1...' } │     │
│   │ "note1..."    → { type: 'event-ref', data: 'note1...' }     │     │
│   │ "nevent1..."  → { type: 'event-ref', data: 'nevent1...' }   │     │
│   │ "naddr1..."   → { type: 'event-ref', data: 'naddr1...' }    │     │
│   └──────────────────────────────────────────────────────────────┘     │
│        ▼                                                                 │
│                                                                          │
│ Line 227-272: groupConsecutiveImages(segments)                          │
│   • Combines adjacent images into image-grid                            │
│        ▼                                                                 │
│                                                                          │
│ Line 278-323: groupConsecutiveLinks(segments)                           │
│   • Combines adjacent links into link-group                             │
│        ▼                                                                 │
│                                                                          │
│ Output: ParsedSegment[]                                                  │
│ [                                                                        │
│   { type: 'text', content: 'Hello ' },                                  │
│   { type: 'npub', content: 'npub1abc...', data: 'npub1abc...' },       │
│   { type: 'text', content: ' check ' },                                 │
│   { type: 'event-ref', content: 'nevent1xyz...', data: 'nevent1xyz...' },│
│   { type: 'text', content: ' ' },                                       │
│   { type: 'hashtag', content: 'bitcoin', data: 'bitcoin' }              │
│ ]                                                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

### ContentRenderer Registry System

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ui/content-renderer.svelte.ts                                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Line 229: export const defaultContentRenderer = new ContentRenderer()   │
│                                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐  │
│ │ ContentRenderer class:                                             │  │
│ │                                                                    │  │
│ │ Inline Handlers (for content segments):                           │  │
│ │ ├─ Line 101: mentionComponent: MentionComponent | null            │  │
│ │ ├─ Line 107: hashtagComponent: HashtagComponent | null            │  │
│ │ ├─ Line 113: linkComponent: LinkComponent | null                  │  │
│ │ └─ Line 119: mediaComponent: MediaComponent | null                │  │
│ │                                                                    │  │
│ │ Kind Registry (for embedded events):                              │  │
│ │ Line 125: private handlers = Map<number, HandlerInfo>             │  │
│ │                                                                    │  │
│ │   HandlerInfo = {                                                 │  │
│ │     component: Component,  // Svelte component to render          │  │
│ │     wrapper: NDKWrapper    // NDK class with .from() method       │  │
│ │   }                                                                │  │
│ │                                                                    │  │
│ │ Methods:                                                           │  │
│ │ Line 154: addKind(target, component)                              │  │
│ │           ├─ Array input: registers manual kinds                  │  │
│ │           └─ NDKWrapper input: extracts kinds, stores wrapper     │  │
│ │                                                                    │  │
│ │ Line 176: getKindHandler(kind) → HandlerInfo | undefined          │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ Registration Example (from note-embedded/index.ts):                     │
│                                                                          │
│   import NoteEmbedded from './note-embedded.svelte';                    │
│   import { defaultContentRenderer } from '../../ui/...';                │
│                                                                          │
│   defaultContentRenderer.addKind([1, 1111], NoteEmbedded);              │
│   // Registers: handlers.set(1, { component: NoteEmbedded, wrapper: null })│
│   //            handlers.set(1111, { component: NoteEmbedded, wrapper: null })│
│                                                                          │
│ Registry State After Imports:                                           │
│ ┌────────────────────────────────────────────────────────────────────┐  │
│ │ handlers Map:                                                      │  │
│ │   1     → { component: NoteEmbedded, wrapper: null }               │  │
│ │   1111  → { component: NoteEmbedded, wrapper: null }               │  │
│ │   30023 → { component: ArticleEmbedded, wrapper: NDKArticle }      │  │
│ │   9802  → { component: HighlightEmbedded, wrapper: NDKHighlight }  │  │
│ └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

## Recursive Embedding Example

```
User posts event A (kind 1):
"Check out this article nostr:nevent1[B] and my friend nostr:npub1[C]"
│
└─> EventCardClassic renders event A
    │
    ├─> EventContent parses content, finds:
    │   ├─ Text: "Check out this article "
    │   ├─ event-ref: nevent1[B]  ──┐
    │   ├─ Text: " and my friend "   │
    │   └─ npub: npub1[C]  ────────┐ │
    │                              │ │
    │   ┌──────────────────────────┘ │
    │   │                            │
    │   ▼                            ▼
    │   EmbeddedEvent fetches B      Mention fetches user C
    │   └─> Kind 30023 (article)    └─> Renders @username
    │       └─> ArticleEmbedded
    │           Content: "Great post! nostr:nevent1[D] #nostr"
    │           │
    │           └─> EventContent parses (NESTED), finds:
    │               ├─ Text: "Great post! "
    │               ├─ event-ref: nevent1[D]  ──┐
    │               └─ hashtag: #nostr          │
    │                                           │
    │               ┌───────────────────────────┘
    │               │
    │               ▼
    │               EmbeddedEvent fetches D
    │               └─> Kind 1 (note)
    │                   └─> NoteEmbedded
    │                       Content: "Hello nostr:npub1[E]!"
    │                       │
    │                       └─> EventContent parses (DOUBLE NESTED), finds:
    │                           ├─ Text: "Hello "
    │                           ├─ npub: npub1[E]  ──┐
    │                           └─- Text: "!"        │
    │                                                │
    │                           ┌────────────────────┘
    │                           │
    │                           ▼
    │                           Mention fetches user E
    │                           └─> Renders @username

Depth:
 1. EventCardClassic (event A)
 2. ├─ EmbeddedEvent (event B - article)
 3. │  └─ EmbeddedEvent (event D - note)
 4. │     └─ Mention (user E)
    └─ Mention (user C)
```

## Context Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ Context Propagation Through Nesting                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ EventCardClassic                                                    │
│   └─ EventCard.Root (Line: event-card-root.svelte:XX)              │
│       setContext(EVENT_CARD_CONTEXT_KEY, { ndk, event })            │
│       │                                                             │
│       └─ EventCard.Content                                          │
│           getContext(EVENT_CARD_CONTEXT_KEY) ← gets { ndk, event }  │
│           getContext(CONTENT_RENDERER_CONTEXT_KEY) ← undefined      │
│           │                                                         │
│           └─ EventContent                                           │
│               renderer = context ?? defaultContentRenderer          │
│               │                                                     │
│               └─ EmbeddedEvent                                      │
│                   setContext(CONTENT_RENDERER_CONTEXT_KEY,          │
│                              { renderer }) ← propagates to children │
│                   │                                                 │
│                   └─ NoteEmbedded                                   │
│                       └─ EventCard.Root (NEW CONTEXT)               │
│                           setContext(EVENT_CARD_CONTEXT_KEY,        │
│                                      { ndk, event: embeddedEvent }) │
│                           │                                         │
│                           └─ EventCard.Content                      │
│                               getContext(EVENT_CARD_CONTEXT_KEY)    │
│                               ← gets embeddedEvent                  │
│                               getContext(CONTENT_RENDERER_CONTEXT_KEY)│
│                               ← gets renderer from parent!          │
│                               │                                     │
│                               └─ EventContent (NESTED)              │
│                                   renderer = context ← same renderer│
│                                   │                                 │
│                                   └─ EmbeddedEvent (NESTED)         │
│                                       (process repeats...)          │
│                                                                     │
│ Key: Renderer context flows DOWN through nesting                   │
│      EventCard context is LOCAL to each EventCard.Root             │
└─────────────────────────────────────────────────────────────────────┘
```
