#!/bin/bash

# Fast import update script using sed

echo "Updating imports in registry files..."

# Function to update imports in all .svelte, .ts, .js files
update_imports() {
    local from="$1"
    local to="$2"

    find src -type f \( -name "*.svelte" -o -name "*.ts" -o -name "*.js" \) \
        ! -path "*/node_modules/*" \
        ! -path "*/.svelte-kit/*" \
        ! -path "*/dist/*" \
        -exec sed -i '' "s|registry/${from}|registry/${to}|g" {} +
}

# Update component paths (most common patterns)
update_imports "components/article/cards/basic" "components/article-card"
update_imports "components/article/cards/compact" "components/article-card-compact"
update_imports "components/article/cards/portrait" "components/article-card-portrait"
update_imports "components/article/cards/inline" "components/article-card-inline"
update_imports "components/article/cards/neon" "components/article-card-neon"
update_imports "components/article/cards/hero" "components/article-card-hero"
update_imports "components/article/content/basic" "components/article-content"

update_imports "components/event/cards/classic" "components/event-card-classic"
update_imports "components/event/cards/compound" "components/event-card"
update_imports "components/event/cards/generic" "components/event-card-generic"

update_imports "components/follow/buttons/basic" "components/follow-button"
update_imports "components/follow/buttons/pill" "components/follow-button-pill"

update_imports "components/follow-pack/basic" "components/follow-pack"
update_imports "components/follow-pack/compact" "components/follow-pack-compact"
update_imports "components/follow-pack/portrait" "components/follow-pack-portrait"
update_imports "components/follow-pack/modern" "components/follow-pack-modern"
update_imports "components/follow-pack/hero" "components/follow-pack-hero"

update_imports "components/hashtag/cards/compact" "components/hashtag-card-compact"
update_imports "components/hashtag/cards/portrait" "components/hashtag-card-portrait"
update_imports "components/hashtag/displays/modern" "components/hashtag-modern"

update_imports "components/highlight/cards/basic" "components/highlight-card"
update_imports "components/highlight/cards/compact" "components/highlight-card-compact"
update_imports "components/highlight/cards/inline" "components/highlight-card-inline"

update_imports "components/image/cards/basic" "components/image-card"
update_imports "components/image/cards/hero" "components/image-card-hero"
update_imports "components/image/content/basic" "components/image-content"

update_imports "components/media/upload/button" "components/media-upload-button"
update_imports "components/media/upload/carousel" "components/media-upload-carousel"

update_imports "components/mention/displays/modern" "components/mention-modern"

update_imports "components/mute/buttons/basic" "components/mute-button"

update_imports "components/negentropy-sync/progress/detailed" "components/negentropy-sync-detailed"
update_imports "components/negentropy-sync/progress/minimal" "components/negentropy-sync-minimal"
update_imports "components/negentropy-sync/progress/animated" "components/negentropy-sync-animated"

update_imports "components/note/cards/basic" "components/note-card"
update_imports "components/note/cards/compact" "components/note-card-compact"
update_imports "components/note/cards/inline" "components/note-card-inline"

update_imports "components/note-composer/composers/compound" "components/note-composer"

update_imports "components/notification/items/compact" "components/notification-compact"
update_imports "components/notification/items/expanded" "components/notification-expanded"

update_imports "components/reaction/buttons/basic" "components/reaction-button"
update_imports "components/reaction/buttons/slack" "components/reaction-button-slack"
update_imports "components/reaction/buttons/avatars" "components/reaction-button-avatars"

update_imports "components/relay/cards/basic" "components/relay-card"
update_imports "components/relay/cards/compact" "components/relay-card-compact"
update_imports "components/relay/cards/portrait" "components/relay-card-portrait"
update_imports "components/relay/inputs/basic" "components/relay-input"

update_imports "components/reply/buttons/basic" "components/reply-button"
update_imports "components/reply/buttons/avatars" "components/reply-button-avatars"

update_imports "components/repost/buttons/basic" "components/repost-button"
update_imports "components/repost/buttons/avatars" "components/repost-button-avatars"

update_imports "components/session/switchers/compound" "components/session-switcher"

update_imports "components/user/cards/compact" "components/user-card-compact"
update_imports "components/user/cards/classic" "components/user-card-classic"
update_imports "components/user/cards/portrait" "components/user-card-portrait"
update_imports "components/user/cards/glass" "components/user-card-glass"
update_imports "components/user/cards/neon" "components/user-card-neon"
update_imports "components/user/cards/landscape" "components/user-card-landscape"
update_imports "components/user/displays/list-item" "components/user-list-item"
update_imports "components/user/displays/profile" "components/user-profile"
update_imports "components/user/displays/profile-hero" "components/user-profile-hero"
update_imports "components/user/displays/avatar-name" "components/user-avatar-name"
update_imports "components/user/inputs/search" "components/user-search"

update_imports "components/zap/buttons/basic" "components/zap-button"
update_imports "components/zap/buttons/avatars" "components/zap-button-avatars"
update_imports "components/zap/displays/list" "components/zap-list"
update_imports "components/zap/send/basic" "components/zap-send"
update_imports "components/zap/send/classic" "components/zap-send-classic"

# Update icon paths
update_imports "icons/bookmark.svelte" "icons/bookmark/bookmark.svelte"
update_imports "icons/calendar.svelte" "icons/calendar/calendar.svelte"
update_imports "icons/cancel.svelte" "icons/cancel/cancel.svelte"
update_imports "icons/file.svelte" "icons/file/file.svelte"
update_imports "icons/hashtag.svelte" "icons/hashtag/hashtag.svelte"
update_imports "icons/heart.svelte" "icons/heart/heart.svelte"
update_imports "icons/image-add.svelte" "icons/image-add/image-add.svelte"
update_imports "icons/link.svelte" "icons/link/link.svelte"
update_imports "icons/loading.svelte" "icons/loading/loading.svelte"
update_imports "icons/pause.svelte" "icons/pause/pause.svelte"
update_imports "icons/play.svelte" "icons/play/play.svelte"
update_imports "icons/reply.svelte" "icons/reply/reply.svelte"
update_imports "icons/repost.svelte" "icons/repost/repost.svelte"
update_imports "icons/user-add.svelte" "icons/user-add/user-add.svelte"
update_imports "icons/user-following.svelte" "icons/user-following/user-following.svelte"
update_imports "icons/zap.svelte" "icons/zap/zap.svelte"

echo "✅ Import updates complete!"
