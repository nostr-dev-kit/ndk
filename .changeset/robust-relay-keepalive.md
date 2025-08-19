---
"@nostr-dev-kit/ndk": patch
---

feat: add robust relay keepalive and reconnection handling

- Implement keepalive mechanism to detect silent relay disconnections
- Add WebSocket state monitoring to detect dead connections  
- Implement sleep/wake detection for better reconnection after system suspend
- Add idle-aware reconnection with aggressive backoff after wake events
- Improve exponential backoff strategy with proper capping at 30s
- Add comprehensive test coverage for all new functionality