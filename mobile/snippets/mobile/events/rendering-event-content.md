# Rendering Event Content

The `EventContent` component from `@nostr-dev-kit/mobile` provides rich text rendering for Nostr event content, supporting mentions, hashtags, URLs, emojis, and images.

## Features

- Renders `nostr:` mentions with optional custom components
- Formats hashtags with press handling
- Renders URLs and images with press handling
- Supports custom emoji rendering from event tags
- Special handling for reaction events (❤️, 👎)

## Basic Usage

```tsx
import { EventContent } from "@nostr-dev-kit/mobile";
import { NDKEvent } from "@nostr-dev-kit/ndk";

function EventDisplay({ event }: { event: NDKEvent }) {
    return <EventContent event={event} />;
}
```

## Advanced Usage

### Custom Handlers

```tsx
function EventDisplay({ event }: { event: NDKEvent }) {
    const handleUserPress = (pubkey: string) => {
        // Navigate to user profile, etc.
        console.log("User pressed:", pubkey);
    };

    const handleHashtagPress = (hashtag: string) => {
        // Search by hashtag, etc.
        console.log("Hashtag pressed:", hashtag);
    };

    const handleUrlPress = (url: string) => {
        // Open URL in browser, etc.
        console.log("URL pressed:", url);
    };

    return (
        <EventContent
            event={event}
            onUserPress={handleUserPress}
            onHashtagPress={handleHashtagPress}
            onUrlPress={handleUrlPress}
        />
    );
}
```

### Custom Mention Component

```tsx
function UserName({ pubkey }: { pubkey: string }) {
    // Fetch and display user's name/profile
    return <Text>@{pubkey.substring(0, 8)}</Text>;
}

function EventDisplay({ event }: { event: NDKEvent }) {
    return <EventContent event={event} MentionComponent={UserName} />;
}
```

### Styling

The component accepts standard Text props for styling:

```tsx
function EventDisplay({ event }: { event: NDKEvent }) {
    return (
        <EventContent
            event={event}
            style={{
                fontSize: 16,
                color: "#333",
                lineHeight: 24,
            }}
            numberOfLines={3}
        />
    );
}
```

## Props

| Prop             | Type                                      | Description                                                    |
| ---------------- | ----------------------------------------- | -------------------------------------------------------------- |
| event            | `NDKEvent`                                | The NDKEvent to render content from                            |
| content          | `string`                                  | Optional content override. If not provided, uses event.content |
| onUserPress      | `(pubkey: string) => void`                | Callback when a user mention is pressed                        |
| onHashtagPress   | `(hashtag: string) => void`               | Callback when a hashtag is pressed                             |
| onUrlPress       | `(url: string) => void`                   | Callback when a URL is pressed                                 |
| MentionComponent | `React.ComponentType<{ pubkey: string }>` | Optional custom component to render user mentions              |

Plus all standard React Native Text props (style, numberOfLines, etc.)
