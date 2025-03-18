# Outbox model

NDK defines a set of seeding relays, these are relays that will be exclusively used to request Outbox model events. These are kept in a separate pool.

NDK automatically fetches gossip information for users when they are included in an `authors` filter enough times or when they are explicitly scored with the right value.

When a filter users the `authors` field
