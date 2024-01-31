**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / calculateGroupableId

# Function: calculateGroupableId()

> **calculateGroupableId**(`filters`): [`NDKFilterGroupingId`](../type-aliases/NDKFilterGroupingId.md) \| `null`

Calculates the groupable ID for this filters.
The groupable ID is a deterministic association of the filters
used in a filters. When the combination of filters makes it
possible to group them, the groupable ID is used to group them.

The different filters in the array are differentiated so that
filters can only be grouped with other filters that have the same signature

## Parameters

• **filters**: [`NDKFilter`](../type-aliases/NDKFilter.md)[]

## Returns

[`NDKFilterGroupingId`](../type-aliases/NDKFilterGroupingId.md) \| `null`

The groupable ID, or null if the filters are not groupable.

## Source

[ndk/src/subscription/grouping.ts:16](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/grouping.ts#L16)
