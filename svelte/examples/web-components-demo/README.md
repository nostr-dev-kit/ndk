# Nostr User Card - Remote Demo

This is a demo showcasing how to use the Nostr User Card web component **remotely** from a CDN, without any build process or npm installation.

## What's Special About This?

This project demonstrates the true power of web components:

- ✅ **No build process** - Just HTML
- ✅ **No npm install** - No dependencies
- ✅ **No bundler** - Pure browser-native technology
- ✅ **Framework agnostic** - Works anywhere
- ✅ **CDN hosted** - Fast loading from edge servers

## How It Works

The web component is loaded from the deployed Vercel URL:

```html
<script type="module" src="https://web-components-livid-sigma.vercel.app/assets/index-4UxrAUs9.js"></script>
```

Once loaded, you can use it anywhere in your HTML:

```html
<nostr-user-card
  npub="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
  relays="wss://relay.damus.io,wss://nos.lol"
  theme="dark">
</nostr-user-card>
```

## Local Development

To run locally:

```bash
python3 -m http.server 3000
```

Then open http://localhost:3000 in your browser.

## Deployment

This demo is deployed separately to Vercel to prove that the web component works remotely across different domains.

## Features Demonstrated

- 🌙 Dark theme support
- ☀️ Light theme support
- 🎨 Multiple user examples
- 📱 Responsive design
- ✅ NIP-05 verification badges
- 🚀 Loading states

## Use Cases

This approach is perfect for:

- **Content sites** - Blogs, documentation sites, static sites
- **No-build environments** - Pure HTML/CSS/JS projects
- **Rapid prototyping** - Quick demos without setup
- **Legacy projects** - Add modern components without rebuilding
- **CDN distribution** - Distribute components to third parties
