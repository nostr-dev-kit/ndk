# Relay Discovery 
Relay Discovery is made possible by Monitor Daemons/Agents publishing NIP-66 events. There are three kinds of events defined by NIP-66
- Relay Monitor Registration events `10166`: These events signal an intent to publish relay data by a monitor, and enable discovery of monitors.
- Relay Discovery Events `30166`: These are events that only contain single letter (indexable) tags for the purpose of filtering.
- Relay Meta Events `30066`: These are larger events that contain metadata about relays and may also contain any of the indexable tags from `30166` 

## Summary 
There are many approaches to using NIP-66. Below is a linear example of how to use all the event kinds in NIP-66. The below examples are not necessarily the best way to do things, but they demonstrate the basic idea and various ways to achieve goals. 

## Setup 
```
import { RelayMonitor, RelayDiscovery, RelayMeta } from '@nostr/relay-discovery'
```

## Relay Monitors

### Find some monitors.
```
const ndk = new NDK({explicitRelayUrls: 'wss://history.nostr.watch'})
await ndk.connect()
const monitors = Array.from(await ndk.fetchEvents({kinds:10133})).map(e => RelayMonitor.from(e))
```

### Show some information about each monitor
```
monitors.forEach( monitor => {
  console.log(```
  pubkey: ${monitor.pubkey}
  has valid registration: ${monitor.isValid()? 'yes': 'no'}
  name: ${monitor.user.name? monitor.user?.name: 'unknown'}
  geohash: ${monitor?.geohash? monitor.geohash: 'unknown'}
  runs checks: ${monitor.checks}
  publishes kinds: ${monitor.kinds}
  active: ${await monitor.isActive()}
  ```)
})
```

### Filter down to only active monitors 
```
monitors.forEach( monitor => {
  console.log(```
  pubkey: ${monitor.pubkey}
  name: ${monitor.user.name? monitor.user?.name: 'unknown'}
  geohash: ${monitor?.geohash? monitor.geohash: 'unknown'}
  runs checks: ${monitor.checks}
  publishes kinds: ${monitor.kinds}
  active: ${await monitor.isActive()}
  ```)
})
```

### Reduce list of monitors to only those that publish both `30166` and `30066`
```
const monitorsBothKinds = monitors.filter( monitor => monitor.meetsCriterias({kinds: [30166,30066]}))
```

### Select the nearest monitor 
```
const monitorsSortedByDistance = RelayMonitor.sortGeospatial("gbsuv", new Set(monitorsBothKinds))
const nearestMonitor = Array.from(monitorsSortedByDistance)?.[0] || monitors?.[0] || null
if(!nearestMonitor) throw new Error("No monitors found")  
```

## Relay Discovery

### Online Relays 
```
const onlineRelays = ndk.fetchEvents(nearestMonitor.nip66Filter("30166"))
```
Please see (note)[#important] below for caveats. 

### Find some relays that support NIP-45
```
const nip45Relays = ndk.fetchEvents(nearestMonitor.nip66Filter("30166", { "#N": ["45"] }))
```

### Find paid relays 
```
const paidRelays = ndk.fetchEvents(nearestMonitor.nip66Filter("30166", { "#R": ["payment"] }))
```

### Find relays without auth 
```
const noAuthRelays = ndk.fetchEvents(nearestMonitor.nip66Filter("30166", { "#R": ["!auth"] }))
```

### Find relays wtihout payment requirement
```
const notPaidRelays = ndk.fetchEvents(nearestMonitor.nip66Filter("30166", { "#R": ["!payment"] }))
```

## Full Datasets
Using NDK alone is not ideal for obtaining a full dataset. The reasoning here is that different relays have different max results, and the total dataset size is not only not known, but also often greater than most relay's max result limits. To get full datasets, for example "All Online Relays," you should instead use something like `nostr-fetch` with it's NDK adapter to fetch full datasets. Below is an example of how to use `nostr-fetch` with NDK to get a full dataset.

```
const fetcher = NostrFetcher.withCustomPool(ndkAdapter(ndk));
const {since} = monitor.nip66Filter("30166")
const onlineRelays = await fetcher.fetchAllEvents(
                this.ndk?.explicitRelayUrls,
                {},
                since,
            );
```

<a name="important"></a>
## Important Notes
- Individual monitors could report a different number of relays online. There are too many reasons to list of this, as monitoring relays is more of an art than a science. 
- Your use case informs how you should use NIP-66. For lite usage, you should probably use Relay Discovery Events. However, if you require more data about relays, or have a need for complete data sets across multiple monitors or aggregate data, you should probably use Relay Meta Events and a cache to store the data, and subsequently query from. 