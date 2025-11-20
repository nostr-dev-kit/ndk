## Architecture decisions & suggestions

- Users of NDK should instantiate a single NDK instance.
- That instance tracks state with all relays connected, explicit and otherwise.
- All relays are tracked in a single pool that handles connection errors/reconnection logic.
- RelaySets are assembled ad-hoc as needed depending on the queries set, although some RelaySets might be long-lasting,
  like the `explicitRelayUrls` specified by the user.
- RelaySets are always a subset of the pool of all available relays.