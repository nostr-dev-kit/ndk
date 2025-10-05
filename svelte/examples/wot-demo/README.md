# Web of Trust Demo - ndk-svelte5

A beautiful, interactive demonstration of ndk-wot (Web of Trust) capabilities using ndk-svelte5.

## Features

🌐 **Web of Trust Graph Building**
- Build social graphs from any Nostr user's perspective
- Configurable depth (1-4 network hops)
- Handles tens of thousands of users efficiently

🎯 **Smart Event Filtering**
- Filter events by WoT distance (max depth)
- Exclude users outside your WoT
- Real-time filtering as events arrive

📊 **Multiple Ranking Algorithms**
- **Distance**: Rank by network proximity (closest first)
- **Score**: Rank by WoT score (highest first)
- **Followers**: Rank by follower count within WoT

🎨 **Visual WoT Indicators**
- Color-coded badges showing user relationship:
  - Purple: You (distance 0)
  - Green: Direct follows (distance 1)
  - Orange: Extended network (distance 2+)
  - Gray: Unknown/Outside WoT

📈 **Live Statistics**
- Network size (total users in WoT)
- Events in WoT vs unknown
- Real-time event count

## Default Configuration

The app comes pre-configured with:
- **Default npub**: `npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft`
- **Default depth**: 2 hops
- **Auto-load**: Builds WoT automatically on mount

## Getting Started

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

Then open http://localhost:5173/

### Build

```bash
bun run build
```

## How It Works

### 1. Build Your Web of Trust

Enter any npub and select the network depth (how many hops from the root user to explore). The app will:
- Fetch the user's follow list (kind 3 events)
- Recursively fetch follows of follows up to the specified depth
- Build a graph with distance metrics and follower counts

### 2. Filter Events

Once the WoT is loaded, all incoming events are automatically:
- Filtered by maximum distance from root user
- Ranked using your selected algorithm
- Displayed with visual WoT badges

### 3. Adjust Settings

Real-time controls let you:
- Change max distance filter (slider)
- Switch ranking algorithms (dropdown)
- Toggle inclusion of unknown users (checkbox)

## Technical Details

### Technologies
- **ndk-svelte5**: Svelte 5 bindings for NDK with reactive stores
- **ndk-wot**: Web of Trust graph building and filtering
- **NDK**: Nostr Development Kit core

### Architecture
- Reactive Svelte 5 runes ($state, $derived)
- Real-time NDK subscriptions
- Efficient WoT graph with Map-based storage
- Distance-based scoring algorithm

### Performance
- Handles 30,000+ user networks
- Sub-second filtering and ranking
- Minimal re-renders using derived state

## Use Cases

- **Spam Filtering**: Only show content from trusted network
- **Content Discovery**: Find high-quality content from extended network
- **Community Analysis**: Visualize your social graph
- **Trust Metrics**: See who's most connected in your network

## Customization

Edit `src/App.svelte` to customize:
- Default npub and depth
- Color schemes and styling
- Ranking algorithms
- Filter criteria

## License

MIT
