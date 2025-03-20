/**
 * A React Native component that renders Nostr event content with rich formatting support.
 * Handles rendering of mentions, hashtags, URLs, emojis, and images within event content.
 * 
 * Features:
 * - Renders nostr: mentions with optional custom mention component
 * - Formats hashtags with optional press handling
 * - Renders URLs and images with press handling
 * - Supports custom emoji rendering from event tags
 * - Special handling for reaction events (❤️, 👎)
 * 
 * @package @nostr-dev-kit/ndk-mobile
 */

import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextProps, StyleSheet } from 'react-native';
import { NDKEvent, NDKKind, NDKUser } from '@nostr-dev-kit/ndk';
import { Image } from 'expo-image';
import { useNDK } from '@/hooks/ndk.js';
import { useUserProfile } from '@/hooks/user-profile.js';

const styles = StyleSheet.create({
    mention: {
        fontWeight: 'bold',
        color: '#0066CC',
    },
    hashtag: {
        fontWeight: 'bold',
        color: '#0066CC',
    },
    url: {
        fontWeight: 'bold',
        color: '#0066CC',
        textDecorationLine: 'underline',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 12,
    }
});

/**
 * Props for the EventContent component
 */
export interface EventContentProps extends TextProps {
    /** The NDKEvent to render content from */
    event?: NDKEvent;
    /** Optional content override. If not provided, uses event.content */
    content?: string;
    /** Callback when a user mention is pressed */
    onUserPress?: (pubkey: string) => void;
    /** Callback when a hashtag is pressed */
    onHashtagPress?: (hashtag: string) => void;
    /** Callback when a URL is pressed */
    onUrlPress?: (url: string) => void;
    /** Optional custom component to render user mentions */
    MentionComponent?: React.ComponentType<{ pubkey: string }>;
}

/**
 * Renders an emoji from an event's emoji tags
 */
function RenderEmoji({ shortcode, event, fontSize }: { shortcode: string; event?: NDKEvent; fontSize?: number }) {
    if (!event) return <Text style={{ fontSize }}>:{shortcode}:</Text>;

    const emojiTag = event.tags.find((tag) => tag[0] === 'emoji' && tag[1] === shortcode);
    if (!emojiTag || !emojiTag[2]) return <Text style={{ fontSize }}>:{shortcode}:</Text>;

    const emojiSize = fontSize || 14;

    return <Image source={{ uri: emojiTag[2] }} style={{ width: emojiSize, height: emojiSize, resizeMode: 'contain' }} />;
}

/**
 * Renders a hashtag with optional press handling
 */
function RenderHashtag({
    hashtag,
    onHashtagPress,
    fontSize,
    style,
}: {
    hashtag: string;
    onHashtagPress?: (hashtag: string) => void;
    fontSize?: number;
    style?: any;
}) {
    const combinedStyle = [styles.hashtag, { fontSize }, style];

    if (onHashtagPress) {
        return (
            <Text onPress={() => onHashtagPress(`#${hashtag}`)} style={combinedStyle}>
                #{hashtag}
            </Text>
        );
    }

    return (
        <Text style={combinedStyle}>
            #{hashtag}
        </Text>
    );
}

/**
 * Renders a Nostr mention (npub or nprofile) with optional custom component
 */
interface RenderMentionProps {
    user: NDKUser;
    onUserPress?: (pubkey: string) => void;
    MentionComponent?: React.ComponentType<{ pubkey: string }>;
    fontSize?: number;
    style?: any;
}
function RenderMention({ user, onUserPress, MentionComponent, fontSize, style, }: RenderMentionProps) {
    const { userProfile } = useUserProfile(user.pubkey);
    const combinedStyle = [styles.mention, { fontSize }, style];

    return (
        <Text 
            style={combinedStyle}
            onPress={() => onUserPress?.(user.pubkey)}
        >
            @{MentionComponent ? <MentionComponent pubkey={user.pubkey} /> : userProfile?.name ?? user.pubkey.substring(0, 8)}
        </Text>
    );
}

function RenderEvent({
    entity,
    onUserPress,
}: {
    entity: string;
    onUserPress?: (pubkey: string) => void;
}) {
    const { ndk } = useNDK();
    const [event, setEvent] = useState<NDKEvent | null>(null);

    useEffect(() => {
        if (!entity) return;
        ndk.fetchEvent(entity).then((event) => setEvent(event));
    }, [entity])

    if (!event) return <Text>{entity}</Text>;

    return (
        <EventContent
            event={event}
            onUserPress={onUserPress}
        />
    )
}

/**
 * Renders a part of the content with appropriate formatting based on content type
 * Handles:
 * - Emoji shortcodes (:shortcode:)
 * - Image URLs
 * - Regular URLs
 * - Nostr mentions (nostr:npub1...)
 * - Hashtags (#hashtag)
 * - Plain text
 */
function RenderPart({
    part,
    onUserPress,
    onHashtagPress,
    onUrlPress,
    MentionComponent,
    event,
    style,
    ...props
}: {
    part: string;
    onUserPress?: (pubkey: string) => void;
    onHashtagPress?: (hashtag: string) => void;
    onUrlPress?: (url: string) => void;
    MentionComponent?: React.ComponentType<{ pubkey: string }>;
    event?: NDKEvent;
    style?: any;
} & TextProps) {
    const { ndk } = useNDK();
    const fontSize = style?.fontSize;

    // Check for emoji shortcode
    const emojiMatch = part.match(/^:([a-zA-Z0-9_+-]+):$/);
    if (emojiMatch) {
        return <RenderEmoji shortcode={emojiMatch[1]} event={event} fontSize={fontSize} />;
    }

    if (part.startsWith('https://') && part.match(/\.(jpg|jpeg|png|gif)/)) {
        return (
            <Pressable onPress={() => onUrlPress?.(part)}>
                <Image
                    source={{ uri: part }}
                    style={[styles.image, style]}
                />
            </Pressable>
        );
    } else if (part.startsWith('https://') || part.startsWith('http://')) {
        return (
            <Text style={[styles.url, style]} onPress={() => onUrlPress?.(part)}>
                {part}
            </Text>
        );
    }

    const mentionMatch = part.match(/nostr:([a-zA-Z0-9]+)/)?.[1];
    if (mentionMatch) {
        const entity = ndk.getEntity(mentionMatch);
        if (entity instanceof NDKUser) {
            if (MentionComponent) {
                return (
                    <MentionComponent pubkey={entity.pubkey} />
                )
            } else {
                return (
                    <RenderMention
                        user={entity}
                        onUserPress={onUserPress}
                        fontSize={fontSize}
                        style={style}
                    />
                );
            }
        } else if (entity) {
            return (
                <RenderEvent
                    entity={mentionMatch}
                    onUserPress={onUserPress}
                />
            )
        }
    }

    const hashtagMatch = part.match(/^#([\p{L}\p{N}_\-]+)/u);
    if (hashtagMatch) {
        return (
            <RenderHashtag 
                hashtag={hashtagMatch[1]} 
                onHashtagPress={onHashtagPress} 
                fontSize={fontSize}
                style={style}
            />
        );
    }

    return (
        <Text style={{ ...style, fontSize }} {...props}>
            {part}
        </Text>
    );
}

/**
 * Main component for rendering Nostr event content with rich formatting
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <EventContent event={ndkEvent} />
 * 
 * // With custom handlers
 * <EventContent
 *     event={ndkEvent}
 *     onUserPress={(pubkey) => console.log('User pressed:', pubkey)}
 *     onHashtagPress={(hashtag) => console.log('Hashtag pressed:', hashtag)}
 *     onUrlPress={(url) => console.log('URL pressed:', url)}
 * />
 * 
 * // With custom mention component
 * <EventContent
 *     event={ndkEvent}
 *     MentionComponent={({ pubkey }) => <UserName pubkey={pubkey} />}
 * />
 * ```
 */
const EventContent: React.FC<EventContentProps> = ({
    event,
    numberOfLines,
    content,
    style,
    onUserPress,
    onHashtagPress,
    onUrlPress,
    MentionComponent,
    ...props
}) => {
    if (!event && !content) return null;

    // Handle reaction events
    if (event?.kind === NDKKind.Reaction) {
        return <Text style={style}>{event.content || '❤️'}</Text>;
    }

    const contentToRender = content || event?.content || '';
    const parts = contentToRender.split(/(\s+|(?=https?:\/\/)|(?<=\s)#[\p{L}\p{N}_\-]+|(?<=\s)nostr:[a-zA-Z0-9]+|:[a-zA-Z0-9_+-]+:)/u);

    return (
        <Text numberOfLines={numberOfLines} style={style} {...props}>
            {parts.map((part, index) => (
                <RenderPart
                    key={index}
                    part={part}
                    onUserPress={onUserPress}
                    onHashtagPress={onHashtagPress}
                    onUrlPress={onUrlPress}
                    MentionComponent={MentionComponent}
                    event={event}
                    style={style}
                />
            ))}
        </Text>
    );
};

export default EventContent; 