#!/bin/bash

# Update imports for action builders
find ./src/routes ./src/lib/component-registry -type f \( -name "*.svelte" -o -name "*.ts" -o -name "*.example" \) -print0 | while IFS= read -r -d '' file; do
    # Check if file contains any of the builders we're moving
    if grep -q "createFollowAction\|createReactionAction\|createReplyAction\|createRepostAction\|createMuteAction\|createThreadView\|createHighlight\|createZapSendAction\|createBookmarkedRelayList" "$file"; then
        # Replace imports that include these specific builders
        sed -i '' \
            -e "s|import { createFollowAction } from '@nostr-dev-kit/svelte';|import { createFollowAction } from '\$lib/registry/builders/actions/follow-action.svelte';|g" \
            -e "s|import { createReactionAction } from '@nostr-dev-kit/svelte';|import { createReactionAction } from '\$lib/registry/builders/actions/reaction-action.svelte';|g" \
            -e "s|import { createReplyAction } from '@nostr-dev-kit/svelte';|import { createReplyAction } from '\$lib/registry/builders/actions/reply-action.svelte';|g" \
            -e "s|import { createRepostAction } from '@nostr-dev-kit/svelte';|import { createRepostAction } from '\$lib/registry/builders/actions/repost-action.svelte';|g" \
            -e "s|import { createMuteAction } from '@nostr-dev-kit/svelte';|import { createMuteAction } from '\$lib/registry/builders/actions/mute-action.svelte';|g" \
            -e "s|import { createThreadView } from '@nostr-dev-kit/svelte';|import { createThreadView } from '\$lib/registry/builders/thread-view';|g" \
            -e "s|import { createHighlight } from '@nostr-dev-kit/svelte';|import { createHighlight } from '\$lib/registry/builders/highlight';|g" \
            -e "s|import { createZapSendAction } from '@nostr-dev-kit/svelte';|import { createZapSendAction } from '\$lib/registry/builders/zap-send';|g" \
            -e "s|import { createBookmarkedRelayList } from '@nostr-dev-kit/svelte';|import { createBookmarkedRelayList } from '\$lib/registry/builders/bookmarked-relay-list';|g" \
            "$file"
    fi
done

echo "Import replacement complete"
