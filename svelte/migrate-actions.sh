#!/bin/bash

# Script to migrate action builders to new API

FILES=(
    "src/lib/builders/actions/reply-action.svelte.ts"
    "src/lib/builders/actions/repost-action.svelte.ts"
    "src/lib/builders/actions/zap-action.svelte.ts"
    "src/lib/builders/actions/mute-action.svelte.ts"
)

for file in "${FILES[@]}"; do
    echo "Migrating $file..."

    # 1. Add import for resolveNDK after existing imports
    if ! grep -q "resolveNDK" "$file"; then
        sed -i '' '/import type { NDKSvelte }/a\
import { resolveNDK } from "../resolve-ndk.svelte.js";
' "$file"
    fi

    # 2. Remove ndk from Config interface
    sed -i '' '/export interface.*ActionConfig {/,/^}/ s/    ndk: NDKSvelte;//' "$file"

    # 3. Update JSDoc examples
    sed -i '' 's/{ ndk, event/{ event/g' "$file"
    sed -i '' 's/{ ndk, target/{ target/g' "$file"

    # 4. Add ndk parameter and resolveNDK call to function
    sed -i '' '/export function create.*Action(/,/^) {/ {
        s/config: () => \(.*\)Config$/config: () => \1Config,\
    ndk?: NDKSvelte/
    }' "$file"

    # Add resolveNDK call after opening brace
    sed -i '' '/export function create.*Action(/,/^    \/\/ / {
        /^) {$/a\
    const resolvedNDK = resolveNDK(ndk);
    }' "$file"

    # 5. Replace config().ndk with resolvedNDK
    sed -i '' 's/config()\.ndk/resolvedNDK/g' "$file"
    sed -i '' 's/const { ndk, /const { /g' "$file"

    echo "✓ Migrated $file"
done

echo "Migration complete!"
