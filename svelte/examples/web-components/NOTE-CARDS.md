# Nostr Note Card Web Components

14 different style variations for displaying Nostr kind:1 notes as web components.

## Components

### 1. **nostr-note-card** (Default)
Gradient card with glassmorphism and action buttons
- Tag: `<nostr-note-card>`
- Style: Modern gradient with blur effects
- Best for: Featured notes, hero sections

### 2. **nostr-note-card-minimal**
Clean, minimal design with simple borders
- Tag: `<nostr-note-card-minimal>`
- Style: Simple white card with subtle shadows
- Best for: Embedding in content, lists

### 3. **nostr-note-card-compact**
Dense, information-packed layout
- Tag: `<nostr-note-card-compact>`
- Style: Compact Twitter-like feed item
- Best for: Activity feeds, timelines

### 4. **nostr-note-card-twitter**
Twitter/X-style tweet card
- Tag: `<nostr-note-card-twitter>`
- Style: Detailed Twitter clone with controls
- Best for: Social media UIs

### 5. **nostr-note-card-bubble**
Message bubble style (chat app)
- Tag: `<nostr-note-card-bubble>`
- Style: Blue message bubble with timestamp
- Best for: Chat interfaces, messaging apps

### 6. **nostr-note-card-paper**
Paper/document style with serif fonts
- Tag: `<nostr-note-card-paper>`
- Style: Vintage paper with lined background
- Best for: Long-form content, articles

### 7. **nostr-note-card-neon**
Neon/cyberpunk terminal style
- Tag: `<nostr-note-card-neon>`
- Style: Cyan/magenta neon with glowing effects
- Best for: Tech/crypto themes, dark UIs

### 8. **nostr-note-card-glass**
Glassmorphism design
- Tag: `<nostr-note-card-glass>`
- Style: Frosted glass with blur and transparency
- Best for: Modern apps, overlays

### 9. **nostr-note-card-terminal**
Terminal/CLI style
- Tag: `<nostr-note-card-terminal>`
- Style: Code editor/terminal window
- Best for: Developer tools, technical content

### 10. **nostr-note-card-polaroid**
Polaroid photo style
- Tag: `<nostr-note-card-polaroid>`
- Style: Physical photo with handwritten caption
- Best for: Personal blogs, nostalgia themes

### 11. **nostr-note-card-newspaper**
Newspaper article style
- Tag: `<nostr-note-card-newspaper>`
- Style: Traditional newspaper layout
- Best for: News, journalism, formal content

### 12. **nostr-note-card-chat**
Chat message style (messenger)
- Tag: `<nostr-note-card-chat>`
- Style: Facebook Messenger-like with reactions
- Best for: Social apps, discussions

### 13. **nostr-note-card-quote**
Quote card with attribution
- Tag: `<nostr-note-card-quote>`
- Style: Large quote marks with elegant typography
- Best for: Highlighting important notes, testimonials

### 14. **nostr-note-card-timeline**
Timeline entry style
- Tag: `<nostr-note-card-timeline>`
- Style: Vertical timeline with avatar marker
- Best for: Activity logs, chronological displays

## Usage

All components accept the same props:

```html
<nostr-note-card
  noteId="note1... or nevent1..."
  relays="wss://relay.damus.io,wss://nos.lol"
  theme="dark"
></nostr-note-card>
```

### Props

- **noteId** (required): Note ID in `note1...` or `nevent1...` format
- **relays** (optional): Comma-separated relay URLs (default: "wss://relay.damus.io,wss://nos.lol")
- **theme** (optional): "light" or "dark" (default varies by component)

## Example

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="/dist/web-components.js"></script>
</head>
<body>
  <!-- Default card -->
  <nostr-note-card
    noteId="note1abc123..."
    relays="wss://relay.damus.io,wss://nos.lol"
    theme="dark"
  ></nostr-note-card>

  <!-- Minimal card -->
  <nostr-note-card-minimal
    noteId="note1abc123..."
    theme="light"
  ></nostr-note-card-minimal>

  <!-- Twitter style -->
  <nostr-note-card-twitter
    noteId="note1abc123..."
  ></nostr-note-card-twitter>

  <!-- Timeline -->
  <nostr-note-card-timeline
    noteId="note1abc123..."
  ></nostr-note-card-timeline>
</body>
</html>
```

## Features

All components include:
- ✅ Loading states
- ✅ Error handling
- ✅ Profile loading (avatar, name, NIP-05)
- ✅ Time formatting
- ✅ Light/dark theme support
- ✅ Responsive design
- ✅ Hover effects
- ✅ NDK integration

## Building

```bash
npm install
npm run build
```

The compiled web components will be in `dist/web-components.js`.
