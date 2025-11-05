import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.join(dirname, 'registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

const toRemove = [
  "actions", "article-card-hero", "article-card-neon", "article-card-portrait",
  "article-preview", "blocks", "embedded-event", "event-card-classic",
  "event-card-menu", "event-content", "follow-button", "follow-button-card",
  "follow-button-pill", "follow-pack-compact", "follow-pack-hero",
  "follow-pack-portrait", "generic-preview", "hashtag-preview", "highlight-card",
  "highlight-card-compact", "image-card-hero", "login-compact",
  "media-upload-carousel", "mention-preview", "mute-button", "ndk-context",
  "note-preview", "reaction-button", "reaction-slack", "reactions",
  "relay-card-compact", "relay-card-list", "relay-card-portrait",
  "relay-connection-status", "relay-list", "relay-pool-tabs", "replies",
  "repost-button", "repost-button-pill", "simple-event-card",
  "thread-view-twitter", "upload-button", "user-card", "user-card-classic",
  "user-card-compact", "user-card-landscape", "user-card-portrait",
  "user-profile-avatar-name"
];

const originalCount = registry.items.length;
registry.items = registry.items.filter(item => !toRemove.includes(item.name));
const newCount = registry.items.length;

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');

console.log('Removed ' + (originalCount - newCount) + ' items from registry.json');
console.log('Remaining items: ' + newCount);
