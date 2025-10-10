# Nostr Event Graph

A beautiful visualization tool for Nostr event activity. Enter any NIP-05 identifier and see a stunning graph showing the types of events they've published over the last 7 days.

## Features

- 🎨 Gorgeous animated visualization with gradient text and smooth transitions
- 📊 Interactive stacked bar chart showing events grouped by kind
- 🎯 Hover tooltips showing detailed breakdown by event type
- 🌈 Color-coded event kinds with legend
- 📱 Fully responsive design
- ⚡ Built with Svelte 5 and NDK

## Running the Example

```bash
# Install dependencies (from the monorepo root)
bun install

# Run the dev server
cd examples/event-graph
bun run dev
```

Then open http://localhost:5173 in your browser.

## How to Use

1. Enter a NIP-05 identifier (e.g., `pablo@nostr.com`)
2. Click "Visualize"
3. Explore the interactive graph:
   - Hover over bars to see daily breakdowns
   - Hover over legend items to highlight specific event types
   - See total event counts and statistics

## Event Kinds

The app automatically recognizes and labels common Nostr event kinds:

- **Kind 0**: Profile metadata
- **Kind 1**: Text notes
- **Kind 3**: Contacts list
- **Kind 7**: Reactions
- **Kind 30023**: Long-form articles
- And many more...

Unknown kinds are displayed as "Kind {number}".
