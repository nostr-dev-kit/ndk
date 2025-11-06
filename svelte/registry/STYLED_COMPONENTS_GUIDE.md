# Styled Components Data Attributes Guide

This guide provides patterns for adding data attributes to styled components in `src/lib/registry/components/`.

## Important Note

**Styled components are composed using UI primitives, which already have data attributes.** The primitives provide component-part identification (e.g., `data-article-title`, `data-user-avatar`), while styled components only need a top-level variant identifier.

## Pattern Overview

### For Composed Components (Using Primitives)

Add a single `data-{component}-{variant}=""` attribute to the root element:

```svelte
<Primitive.Root>
  <div data-article-card-hero="">
    <Primitive.Title />
    <Primitive.Image />
  </div>
</Primitive.Root>
```

The primitive parts (Title, Image, etc.) already have their data attributes from the primitive layer.

### For Action/Button Components

Add component identifier + state attributes:

```svelte
<button
  data-follow-button=""
  data-following={isFollowing ? '' : undefined}
  data-target-type={targetType}
>
```

## Examples by Component Type

### Article Cards

All article card variants wrap `Article.Root` and its parts.

**Pattern:** `data-article-card-{variant}=""`

```svelte
<!-- article-card-medium.svelte -->
<Article.Root {ndk} {article}>
  <div data-article-card-medium="">
    <Article.Title />
    <Article.Summary />
    <Article.Image />
  </div>
</Article.Root>
```

**Variants to update:**
- `article-card-medium.svelte` → `data-article-card-medium=""`
- `article-card-hero.svelte` → `data-article-card-hero=""`
- `article-card-portrait.svelte` → `data-article-card-portrait=""`
- `article-card-neon.svelte` → `data-article-card-neon=""`
- `article-embedded.svelte` → `data-article-embedded=""`
- `article-embedded-inline.svelte` → `data-article-embedded-inline=""`
- `article-content.svelte` → `data-article-content=""`
- `article-content-basic.svelte` → `data-article-content-basic=""`

### User Cards

All user card variants wrap `User.Root` and its parts.

**Pattern:** `data-user-card-{variant}=""`

```svelte
<!-- user-card-compact.svelte -->
<User.Root {ndk} {pubkey}>
  <div data-user-card-compact="">
    <User.Avatar />
    <User.Name />
    <FollowButton />
  </div>
</User.Root>
```

**Variants to update:**
- `user-card-compact.svelte` → `data-user-card-compact=""`
- `user-card-classic.svelte` → `data-user-card-classic=""`
- `user-card-glass.svelte` → `data-user-card-glass=""`
- `user-card-neon.svelte` → `data-user-card-neon=""`
- `user-card-portrait.svelte` → `data-user-card-portrait=""`
- `user-card-landscape.svelte` → `data-user-card-landscape=""`
- `user-list-item.svelte` → `data-user-list-item=""`
- `user-profile.svelte` → `data-user-profile=""`
- `user-profile-hero.svelte` → `data-user-profile-hero=""`
- `user-avatar-name.svelte` → `data-user-avatar-name=""`
- `user-search-combobox.svelte` → `data-user-search-combobox=""`

### Follow Pack Components

**Pattern:** `data-follow-pack-{variant}=""`

```svelte
<!-- follow-pack-portrait.svelte -->
<FollowPack.Root {followPack}>
  <div data-follow-pack-portrait="">
    <FollowPack.Image />
    <FollowPack.Title />
    <FollowPack.MemberCount />
  </div>
</FollowPack.Root>
```

**Variants to update:**
- `follow-pack-hero.svelte` → `data-follow-pack-hero=""`
- `follow-pack-portrait.svelte` → `data-follow-pack-portrait=""`
- `follow-pack-modern-portrait.svelte` → `data-follow-pack-modern-portrait=""`
- `follow-pack-compact.svelte` → `data-follow-pack-compact=""`
- `follow-pack/follow-pack-list-item.svelte` → `data-follow-pack-list-item=""`

### Action Buttons (With State)

Action buttons need component identifier + state attributes.

**Pattern:** `data-{button-name}=""` + state attributes

```svelte
<!-- follow-button.svelte -->
<button
  data-follow-button=""
  data-following={isFollowing ? '' : undefined}
  data-target-type={isHashtag ? 'hashtag' : 'user'}
>
```

**Buttons to update:**
- `follow-button.svelte` → `data-follow-button=""` + `data-following`, `data-target-type`
- `follow-button-pill.svelte` → `data-follow-button-pill=""` + `data-following`
- `follow-button-animated.svelte` → `data-follow-button-animated=""` + `data-following`
- `follow-button-avatars.svelte` → `data-follow-button-avatars=""` + `data-following`
- `mute-button.svelte` → `data-mute-button=""` + `data-muted`
- `reply-button.svelte` → `data-reply-button=""`
- `repost-button.svelte` → `data-repost-button=""` + `data-reposted`
- `repost-button-avatars.svelte` → `data-repost-button-avatars=""` + `data-reposted`
- `zap-button.svelte` → `data-zap-button=""`
- `zap-button-avatars.svelte` → `data-zap-button-avatars=""`
- `upload-button.svelte` → `data-upload-button=""` + `data-uploading`

### Reaction Components

**Pattern:** `data-reaction-{variant}=""`

```svelte
<!-- reaction.svelte -->
<div data-reaction-button="">
  <Reaction.Display />
</div>
```

**Variants to update:**
- `reaction/reaction.svelte` → `data-reaction-display=""`
- `reaction/reaction-button.svelte` → `data-reaction-button=""` + `data-reacted`
- `reaction/reaction-emoji-button.svelte` → `data-reaction-emoji-button=""`
- `reaction/reaction-slack.svelte` → `data-reaction-slack=""`
- `reaction-button-avatars.svelte` → `data-reaction-button-avatars=""`

### Highlight Cards

**Pattern:** `data-highlight-card-{variant}=""`

```svelte
<!-- highlight-card-elegant.svelte -->
<Highlight.Root {highlight}>
  <div data-highlight-card-elegant="">
    <Highlight.Content />
    <Highlight.Source />
  </div>
</Highlight.Root>
```

**Variants to update:**
- `highlight-card/highlight-card-elegant.svelte` → `data-highlight-card-elegant=""`
- `highlight-card/highlight-card-grid.svelte` → `data-highlight-card-grid=""`
- `highlight-card/highlight-card-feed.svelte` → `data-highlight-card-feed=""`
- `highlight-card-compact.svelte` → `data-highlight-card-compact=""`
- `highlight-embedded.svelte` → `data-highlight-embedded=""`
- `highlight-embedded-compact.svelte` → `data-highlight-embedded-compact=""`
- `highlight-embedded-card.svelte` → `data-highlight-embedded-card=""`
- `highlight-embedded-inline.svelte` → `data-highlight-embedded-inline=""`

### Notification Components

**Pattern:** `data-notification-item-{variant}=""`

```svelte
<!-- notification-item-compact.svelte -->
<Notification.Root {notification}>
  <div data-notification-item-compact="">
    <Notification.Actors />
    <Notification.Action />
    <Notification.Content />
  </div>
</Notification.Root>
```

**Variants to update:**
- `notification-item-compact.svelte` → `data-notification-item-compact=""`
- `notification-item-expanded.svelte` → `data-notification-item-expanded=""`
- `notification-feed.svelte` → `data-notification-feed=""`

### Relay Components

**Pattern:** `data-relay-card-{variant}=""`

```svelte
<!-- relay-card.svelte -->
<Relay.Root {relayUrl}>
  <div data-relay-card="">
    <Relay.Icon />
    <Relay.Name />
    <Relay.ConnectionStatus />
  </div>
</Relay.Root>
```

**Variants to update:**
- `relay-card/relay-card.svelte` → `data-relay-card=""`
- `relay-card/relay-card-list.svelte` → `data-relay-card-list=""`
- `relay-card-compact.svelte` → `data-relay-card-compact=""`
- `relay-card-portrait.svelte` → `data-relay-card-portrait=""`
- `relay-input.svelte` → `data-relay-input-field=""` (different from primitive's relay-input)

### Voice Message Components

**Pattern:** `data-voice-message-card-{variant}=""`

```svelte
<!-- voice-message-card-compact.svelte -->
<VoiceMessage.Root {voiceMessage}>
  <div data-voice-message-card-compact="">
    <VoiceMessage.Player />
    <VoiceMessage.Duration />
  </div>
</VoiceMessage.Root>
```

**Variants to update:**
- `voice-message-card-compact.svelte` → `data-voice-message-card-compact=""`
- `voice-message-card-expanded.svelte` → `data-voice-message-card-expanded=""`
- `voice-message-player.svelte` → `data-voice-message-player-full=""` (full player UI)

### Image Components

**Pattern:** `data-image-card-{variant}=""`

```svelte
<!-- image-card.svelte -->
<div data-image-card="">
  <img />
</div>
```

**Variants to update:**
- `image-card/image-card.svelte` → `data-image-card=""`
- `image-card/image-card-instagram.svelte` → `data-image-card-instagram=""`
- `image-card-hero.svelte` → `data-image-card-hero=""`
- `image-content.svelte` → `data-image-content=""`

### Event Cards

**Pattern:** `data-event-card-{variant}=""`

Note: Event cards may have multiple parts if they're complex.

```svelte
<!-- event-card-root.svelte -->
<div data-event-card-root="">
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions />
</div>
```

**Variants to update:**
- `event-card/event-card-root.svelte` → `data-event-card-root=""`
- `event-card/event-card-header.svelte` → `data-event-card-header=""`
- `event-card/event-card-content.svelte` → `data-event-card-content=""`
- `event-card/event-card-actions.svelte` → `data-event-card-actions=""`
- `event-card-classic.svelte` → `data-event-card-classic=""`

### Note Components

**Pattern:** `data-note-{variant}=""`

```svelte
<!-- note-embedded.svelte -->
<div data-note-embedded="">
  <Note content />
</div>
```

**Variants to update:**
- `note-embedded.svelte` → `data-note-embedded=""`
- `note-embedded-compact.svelte` → `data-note-embedded-compact=""`
- `note-embedded-inline.svelte` → `data-note-embedded-inline=""`
- `note-embedded-card.svelte` → `data-note-embedded-card=""`

### Note Composer (Complex Multi-Part)

The note composer is complex with many parts. Each part gets its own attribute.

**Pattern:** `data-note-composer-{part}=""`

```svelte
<!-- note-composer-root.svelte -->
<div data-note-composer-root="">
  <NoteComposer.Textarea />
  <NoteComposer.Media />
  <NoteComposer.Submit />
</div>
```

**All parts to update:**
- `note-composer/note-composer-root.svelte` → `data-note-composer-root=""`
- `note-composer/note-composer-card.svelte` → `data-note-composer-card=""`
- `note-composer/note-composer-modal.svelte` → `data-note-composer-modal=""`
- `note-composer/note-composer-inline.svelte` → `data-note-composer-inline=""`
- `note-composer/note-composer-minimal.svelte` → `data-note-composer-minimal=""`
- `note-composer/note-composer-textarea.svelte` → `data-note-composer-textarea=""`
- `note-composer/note-composer-media.svelte` → `data-note-composer-media=""`
- `note-composer/note-composer-submit.svelte` → `data-note-composer-submit=""`
- `note-composer/note-composer-mention-input.svelte` → `data-note-composer-mention-input=""`

### Hashtag Components

**Pattern:** `data-hashtag-{variant}=""`

```svelte
<!-- hashtag-card-compact.svelte -->
<div data-hashtag-card-compact="">
  <Hashtag content />
</div>
```

**Variants to update:**
- `hashtag.svelte` → `data-hashtag=""`
- `hashtag-modern.svelte` → `data-hashtag-modern=""`
- `hashtag-card-compact.svelte` → `data-hashtag-card-compact=""`
- `hashtag-card-portrait.svelte` → `data-hashtag-card-portrait=""`

### Zap Send Components

**Pattern:** `data-zap-send-{part}=""`

```svelte
<!-- zap-send-root.svelte -->
<div data-zap-send-root="">
  <ZapSend.Splits />
</div>
```

**Variants to update:**
- `zap-send/zap-send-root.svelte` → `data-zap-send-root=""`
- `zap-send/zap-send-splits.svelte` → `data-zap-send-splits=""`
- `zaps/zaps-root.svelte` → `data-zaps-display=""`

### Negentropy Sync Components

**Pattern:** `data-negentropy-sync-progress-{variant}=""`

```svelte
<!-- negentropy-sync-progress-minimal.svelte -->
<NegentrogySync.Root {syncBuilder}>
  <div data-negentropy-sync-progress-minimal="">
    <NegentrogySync.ProgressBar />
  </div>
</NegentrogySync.Root>
```

**Variants to update:**
- `negentropy-sync/negentropy-sync-progress-minimal.svelte` → `data-negentropy-sync-progress-minimal=""`
- `negentropy-sync/negentropy-sync-progress-detailed.svelte` → `data-negentropy-sync-progress-detailed=""`
- `negentropy-sync/negentropy-sync-progress-animated.svelte` → `data-negentropy-sync-progress-animated=""`

### Media Upload Components

**Pattern:** `data-media-upload-{variant}=""`

```svelte
<!-- media-upload-carousel.svelte -->
<MediaUpload.Root {mediaUpload}>
  <div data-media-upload-carousel="">
    <MediaUpload.Carousel />
  </div>
</MediaUpload.Root>
```

**Variants to update:**
- `media-upload-carousel.svelte` → `data-media-upload-carousel-full=""`

### Mention Components

**Pattern:** `data-mention-{variant}=""`

```svelte
<!-- mention.svelte -->
<span data-mention="">
  @username
</span>
```

**Variants to update:**
- `mention.svelte` → `data-mention=""`
- `mention-modern.svelte` → `data-mention-modern=""`

### Misc Components

**Pattern:** Component-specific

```svelte
<!-- avatar-group.svelte -->
<div data-avatar-group="">
  {#each users as user}
    <Avatar />
  {/each}
</div>
```

**Variants to update:**
- `avatar-group.svelte` → `data-avatar-group=""`
- `content-tab.svelte` → `data-content-tab=""`
- `emoji-picker/emoji-picker-content.svelte` → `data-emoji-picker-content=""`
- `emoji-picker/emoji-picker-list.svelte` → `data-emoji-picker-list=""`
- `emoji-picker/emoji-picker-item.svelte` → `data-emoji-picker-item=""`

## Quick Reference

### Composed Components
Add one attribute to the root element:
```svelte
<Primitive.Root>
  <div data-{component}-{variant}="">
```

### Action Buttons
Add identifier + state:
```svelte
<button
  data-{button-name}=""
  data-{state}={value}
>
```

### Multi-Part Styled Components
Each major part gets its own attribute:
```svelte
<div data-{component}-root="">
  <div data-{component}-{part}="">
```

## Implementation Tips

1. **Search and replace** is efficient for similar components:
   - Find: `<div class={cn(`
   - Add before: `data-{component-variant}=""`

2. **For svelte:element**: Add data attribute alongside type/class:
   ```svelte
   <svelte:element
     this={onclick ? 'button' : 'div'}
     data-article-card-hero=""
     {onclick}
     class={classes}
   >
   ```

3. **For buttons with state**: Use existing state variables:
   ```svelte
   data-following={followAction.isFollowing ? '' : undefined}
   ```

4. **The primitives already have data attributes**, so styled components only need the top-level variant identifier. Don't duplicate primitive attributes!

## Summary

- **73 UI primitives** ✅ COMPLETE
- **~100 styled components** - Add top-level `data-{component}-{variant}=""` only
- Primitives provide part-level attributes
- Styled components provide variant identification
- Together they create a complete, inspectable DOM structure
