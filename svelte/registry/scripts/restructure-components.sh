#!/bin/bash

# Script to restructure components into two-level category/subcategory structure

COMPONENTS_DIR="/Users/pablofernandez/tenex/NDK-nhlteu/svelte/registry/src/lib/registry/components"
cd "$COMPONENTS_DIR"

echo "Starting component restructuring..."

# Create new directory structure
echo "Creating new directory structure..."

# Article components
mkdir -p article/{cards,embedded,content}
mv article-card article/cards/basic 2>/dev/null || true
mv article-card-compact article/cards/compact 2>/dev/null || true
mv article-card-inline article/cards/inline 2>/dev/null || true
mv article-card-portrait article/cards/portrait 2>/dev/null || true
mv article-card-hero article/cards/hero 2>/dev/null || true
mv article-card-neon article/cards/neon 2>/dev/null || true
mv article-content article/content/basic 2>/dev/null || true

# Note components
mkdir -p note/{cards,embedded}
mv note-card note/cards/basic 2>/dev/null || true
mv note-card-compact note/cards/compact 2>/dev/null || true
mv note-card-inline note/cards/inline 2>/dev/null || true

# User components
mkdir -p user/{cards,displays,inputs}
mv user-card-classic user/cards/classic 2>/dev/null || true
mv user-card-compact user/cards/compact 2>/dev/null || true
mv user-card-glass user/cards/glass 2>/dev/null || true
mv user-card-landscape user/cards/landscape 2>/dev/null || true
mv user-card-neon user/cards/neon 2>/dev/null || true
mv user-card-portrait user/cards/portrait 2>/dev/null || true
mv user-avatar-name user/displays/avatar-name 2>/dev/null || true
mv user-list-item user/displays/list-item 2>/dev/null || true
mv user-profile user/displays/profile 2>/dev/null || true
mv user-profile-hero user/displays/profile-hero 2>/dev/null || true
mv user-search-combobox user/inputs/search 2>/dev/null || true

# Follow components
mkdir -p follow/{buttons,packs}
mv follow-button follow/buttons/basic 2>/dev/null || true
mv follow-button-animated follow/buttons/animated 2>/dev/null || true
mv follow-button-pill follow/buttons/pill 2>/dev/null || true
mv follow-pack follow/packs/basic 2>/dev/null || true
mv follow-pack-compact follow/packs/compact 2>/dev/null || true
mv follow-pack-hero follow/packs/hero 2>/dev/null || true
mv follow-pack-portrait follow/packs/portrait 2>/dev/null || true
mv follow-pack-modern-portrait follow/packs/modern 2>/dev/null || true

# Hashtag components
mkdir -p hashtag/{displays,cards}
mv hashtag hashtag/displays/basic 2>/dev/null || true
mv hashtag-modern hashtag/displays/modern 2>/dev/null || true
mv hashtag-card hashtag/cards/basic 2>/dev/null || true
mv hashtag-card-compact hashtag/cards/compact 2>/dev/null || true
mv hashtag-card-portrait hashtag/cards/portrait 2>/dev/null || true

# Highlight components
mkdir -p highlight/{cards,embedded}
mv highlight-card highlight/cards/basic 2>/dev/null || true
mv highlight-card-compact highlight/cards/compact 2>/dev/null || true
mv highlight-card-inline highlight/cards/inline 2>/dev/null || true

# Image components
mkdir -p image/{cards,content}
mv image-card image/cards/basic 2>/dev/null || true
mv image-card-hero image/cards/hero 2>/dev/null || true
mv image-content image/content/basic 2>/dev/null || true

# Voice message components
mkdir -p voice-message/{cards,players}
mv voice-message-card voice-message/cards/basic 2>/dev/null || true
mv voice-message-card-compact voice-message/cards/compact 2>/dev/null || true
mv voice-message-card-expanded voice-message/cards/expanded 2>/dev/null || true
mv voice-message-player voice-message/players/basic 2>/dev/null || true

# Event components
mkdir -p event/{cards}
mv event-card event/cards/compound 2>/dev/null || true
mv event-card-classic event/cards/classic 2>/dev/null || true
mv generic-card event/cards/generic 2>/dev/null || true

# Relay components
mkdir -p relay/{cards,status,inputs}
mv relay-card relay/cards/basic 2>/dev/null || true
mv relay-card-compact relay/cards/compact 2>/dev/null || true
mv relay-card-portrait relay/cards/portrait 2>/dev/null || true
mv relay-connection-status relay/status/connection 2>/dev/null || true
mv relay-input relay/inputs/basic 2>/dev/null || true

# Zap components
mkdir -p zap/{buttons,send,displays}
mv zap-button zap/buttons/basic 2>/dev/null || true
mv zap-button-avatars zap/buttons/avatars 2>/dev/null || true
mv zap-send zap/send/basic 2>/dev/null || true
mv zap-send-classic zap/send/classic 2>/dev/null || true
mv zaps zap/displays/list 2>/dev/null || true

# Repost components
mkdir -p repost/buttons
mv repost-button repost/buttons/basic 2>/dev/null || true
mv repost-button-avatars repost/buttons/avatars 2>/dev/null || true

# Reply components
mkdir -p reply/buttons
mv reply-button reply/buttons/basic 2>/dev/null || true

# Mute components
mkdir -p mute/buttons
mv mute-button mute/buttons/basic 2>/dev/null || true

# Notification components
mkdir -p notification/items
mv notification-item-compact notification/items/compact 2>/dev/null || true
mv notification-item-expanded notification/items/expanded 2>/dev/null || true
mv notification-feed notification/feeds/basic 2>/dev/null || true

# Mention components
mkdir -p mention/displays
mv mention mention/displays/basic 2>/dev/null || true
mv mention-modern mention/displays/modern 2>/dev/null || true

# Negentropy sync components
mkdir -p negentropy-sync/{displays,progress}
mv negentropy-sync negentropy-sync/displays/basic 2>/dev/null || true
mv negentropy-sync-progress-compact negentropy-sync/progress/compact 2>/dev/null || true

# Session components
mkdir -p session/switchers
mv session-switcher session/switchers/compound 2>/dev/null || true

# Note composer components
mkdir -p note-composer/composers
mv note-composer note-composer/composers/compound 2>/dev/null || true

# Media components
mkdir -p media/upload
mv media-upload-carousel media/upload/carousel 2>/dev/null || true
mv upload-button media/upload/button 2>/dev/null || true

# Standalone/misc components that don't need subcategories
mkdir -p misc
mv avatar-group misc/avatar-group 2>/dev/null || true
mv content-tab misc/content-tab 2>/dev/null || true
mv emoji-picker misc/emoji-picker 2>/dev/null || true

echo "Restructuring complete!"
echo "Directories moved successfully."