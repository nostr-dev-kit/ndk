---
"@nostr-dev-kit/ndk-blossom": patch
---

Improve blossom logging and error messages

- Add comprehensive debug logging throughout server list fetching and file upload flows
- Dramatically improve error messages when uploads fail - now shows detailed failure info for each server (status codes, error codes, causes)
- Better messaging when no servers are configured vs. when all servers fail
- Add logging of upload options for better debugging
