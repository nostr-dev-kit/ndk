#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

DOCS_DIR="docs"
CORE_DIR="ndk-core"
DEXIE_DIR="cache-dexie"
MEMORY_DIR="cache-memory"
NOSTRCACHE_DIR="cache-nostr"
SQLITE_WASM_DIR="cache-sqlite-wasm"
MOBILE_DIR="ndk-mobile"
BLOSSOM_DIR="blossom"
WALLET_DIR="wallet"
WOT_DIR="wot"
SVELTE_DIR="svelte"
HOOKS_DIR="ndk-hooks"
SESSIONS_DIR="sessions"

# Clean previous copied docs, careful not to remove .vitepress or package.json
echo "Cleaning previous docs..."
rm -rf \
    "$DOCS_DIR/getting-started" \
    "$DOCS_DIR/internals" \
    "$DOCS_DIR/migration" \
    "$DOCS_DIR/tutorial" \
    "$DOCS_DIR/api-examples.md" \
    "$DOCS_DIR/index.md" \
    "$DOCS_DIR/snippets" \
    "$DOCS_DIR/snippets" \
    "$DOCS_DIR/cache" \
    "$DOCS_DIR/mobile" \
    "$DOCS_DIR/wallet" \
    "$DOCS_DIR/wot" \
    "$DOCS_DIR/wrappers" \
    "$DOCS_DIR/hooks" \
    "$DOCS_DIR/sessions"
# Create target directories
echo "Creating target directories..."
mkdir -p \
    "$DOCS_DIR/snippets" \
    "$DOCS_DIR/cache" \
    "$DOCS_DIR/cache/sqlite-wasm" \
    "$DOCS_DIR/mobile" \
    "$DOCS_DIR/snippets/mobile" \
    "$DOCS_DIR/wallet" \
    "$DOCS_DIR/wallet" \
    "$DOCS_DIR/snippets/wallet" \
    "$DOCS_DIR/wot" \
    "$DOCS_DIR/wrappers" \
    "$DOCS_DIR/hooks" \
    "$DOCS_DIR/sessions"
# --- Copy functions ---
copy_dir_contents() {
    local src_dir=$1
    local dest_dir=$2
    if [ -d "$src_dir" ]; then
        # Check if source directory is empty or contains files/subdirs
        if [ -n "$(ls -A "$src_dir")" ]; then
             echo "Copying contents from $src_dir to $dest_dir/"
             cp -R "$src_dir"/* "$dest_dir/"
        else
             echo "Source directory $src_dir is empty, skipping copy."
        fi
    else
        echo "Source directory $src_dir does not exist, skipping copy."
    fi
}

copy_file() {
    local src_file=$1
    local dest_dir=$2
    if [ -f "$src_file" ]; then
        echo "Copying file $src_file to $dest_dir/"
        cp "$src_file" "$dest_dir/"
    else
        echo "Source file $src_file does not exist, skipping copy."
    fi
}

# --- Execute copies ---
echo "Copying docs and snippets from packages..."

# Core
copy_dir_contents "$CORE_DIR/docs" "$DOCS_DIR"
copy_dir_contents "$CORE_DIR/snippets" "$DOCS_DIR/snippets"

# Cache Dexie
copy_file "$DEXIE_DIR/docs/cache/dexie.md" "$DOCS_DIR/cache"

# Cache Memory
copy_file "$MEMORY_DIR/docs/cache/memory.md" "$DOCS_DIR/cache"

# Cache Nostr
copy_file "$NOSTRCACHE_DIR/docs/cache/nostr.md" "$DOCS_DIR/cache"

# Cache SQLite WASM
copy_dir_contents "$SQLITE_WASM_DIR/docs" "$DOCS_DIR/cache/sqlite-wasm"
# Mobile
copy_dir_contents "$MOBILE_DIR/docs" "$DOCS_DIR/mobile"
copy_dir_contents "$MOBILE_DIR/snippets" "$DOCS_DIR/snippets/mobile"

# Blossom
copy_dir_contents "$BLOSSOM_DIR/docs" "$DOCS_DIR"

# Wallet
copy_dir_contents "$WALLET_DIR/docs" "$DOCS_DIR/wallet"
copy_dir_contents "$WALLET_DIR/snippets" "$DOCS_DIR/snippets/wallet"

# WOT
copy_dir_contents "$WOT_DIR/docs" "$DOCS_DIR/wot"

# Svelte
copy_file "$SVELTE_DIR/docs/wrappers/svelte.md" "$DOCS_DIR/wrappers"

# Hooks
copy_dir_contents "$HOOKS_DIR/docs" "$DOCS_DIR/hooks"

# Sessions
copy_file "$SESSIONS_DIR/README.md" "$DOCS_DIR/sessions"

echo "Docs preparation complete."
