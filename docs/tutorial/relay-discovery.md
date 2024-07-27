# Relay Discovery 
Relay Discovery is made possible by Monitor Daemons/Agents publishing NIP-66 events. There are three kinds of events defined by NIP-66
- Relay Monitor Registration events `10166`: These events signal an intent to publish relay data by a monitor, and enable discovery of monitors.
- Relay Discovery Events `30166`: These are events that only contain single letter (indexable) tags for the purpose of filtering.
- Relay Meta Events `30066`: These are larger events that contain metadata about relays and may also contain any of the indexable tags from `30166` 

## Summary 
There are many approaches to using NIP-66. Below is a linear example of how to use all the event kinds in NIP-66. The below examples are not necessarily the best way to do things, but they demonstrate the basic idea and various ways to achieve goals. 

## Setup 
```js
import { NDKRelayMonitor, NDKRelayDiscovery } from '@nostr-dev-kit/ndk'
```

## Relay Monitors

### Find monitors from the nostr.watch relay
```js
import NDK, { NDKKind, NDKRelayMonitor, NDKRelayDiscovery } from '@nostr-dev-kit/ndk'
const ndk = new NDK({explicitRelayUrls: 'wss://history.nostr.watch'})
await ndk.connect()
const monitors = Array.from(await ndk.fetchEvents({kinds:NDKKind.RelayMonitor})).map(e => NDKRelayMonitor.from(e))
```

### Show some information about each monitor
```js
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
```js
const activeMonitors = [] 
monitors.forEach( async (monitor) => {
  if(await monitor.isActive()) activeMonitors.push(monitor)
})
```

### Reduce list of monitors to only those that publish both `30166` and `30066`
```js
const monitorsBothKinds = activeMonitors.filter( monitor => monitor.meetsCriterias({kinds: [30166,30066], checks:['geo', 'nip11', 'rtt']}))
```

### Select the nearest monitor 
```js
const monitorsSortedByDistance = NDKRelayMonitor.sortGeospatial("gbsuv", new Set(monitorsBothKinds))
const nearestMonitor = Array.from(monitorsSortedByDistance)?.[0] || monitors?.[0] || null
if(!nearestMonitor) throw new Error("No monitors found")  
```

## Relay Discovery
`NDKRelayDiscovery` provides a static helper function to generate a filter. This method exists to calculate since (and potentially until) values based on the monitor's publishing frequency. Events published within this frequency are considered "online".

### Online Relays 
```js
const onlineRelays = await ndk.fetchEvents(nearestMonitor.nip66Filter(NDKKinds.RelayDiscovery))
```
Please see (note)[#important] below for caveats. 

### Find some relays that support NIP-45
```js
const nip45Relays = await ndk.fetchEvents(nearestMonitor.nip66Filter(NDKKinds.RelayDiscovery, { "#N": ["45"] }))
```

### Find paid relays 
```js
const paidRelays = await ndk.fetchEvents(nearestMonitor.nip66Filter(NDKKinds.RelayDiscovery, { "#R": ["payment"] }))
```

### Find relays without auth requirement
```js
const noAuthRelays = await ndk.fetchEvents(nearestMonitor.nip66Filter(NDKKinds.RelayDiscovery, { "#R": ["!auth"] }))
```

### Find relays without payment requirement
```js
const notPaidRelays = await ndk.fetchEvents(nearestMonitor.nip66Filter(NDKKinds.RelayDiscovery, { "#R": ["!payment"] }))
```

### Offline and dead relays 
The ability to identify which relays are offline and dead is made possible by the `liveness` argument of the `nip66Filter`. 

```js
const offline = await ndk.fetchEvents(nearestMonitor.nip66Filter(NDKKinds.RelayDiscovery, undefined, undefined, "offline"))
```
_For filtering offline relays, the nip66Filter returns a filter that includes an `until` value that is the cutoff for what is considered "online" and a since value that is the cutoff for what is considered "dead"._

```js
const offline = await ndk.fetchEvents(nearestMonitor.nip66Filter(NDKKinds.RelayDiscovery, undefined, undefined, "dead"))
```
_For filtering dead relays, the nip66Filter returns a filter that includes an `until` value that is the cutoff for what is considered "offline"._

### Modifying liveness determination 
You may adjust the timeframes for what constitutes "online", "offline" and "dead." 

#### Online
By default, the timeframe for what is considered "online" is set by the monitor's published `frequency`. You can adjust this value further, by setting a tolerance multiplier. This tolerance multiplier can make determination of "online" more or less sensitive. 

```js
monitor.tolerance = 0.25 
```
_In the above example, if the monitor publishes every hour (60 minutes), then any `30166` or `30066` event that has been published within the last 75 minutes is considered **online.**

#### Dead 
The determination of what constitutes "dead" is largely subjective, and can be set the implementation through the setter (accessor) `deadAfter`. The idea behind "dead" relays is to suggest that there is a low confidence that the relay will return online. 

```js
monitor.deadAfter = 1000 * 60 * 60 * 24 * 14 // 14 days
```

#### Offline 
The determination of what consistutes "offline" is based on the monitor's publishing frequency multiplied by the monitor's tolerance for the `until` value and the value of `deadAfter`. Because of this, the value of `offlineAfter` cannot be directly set, and is instead calculated based on the values of `onlineTolerance` and `deadAfter`. 

#### Debugging liveness 
You can use the `livenessFilter` method on `NDKRelayMonitor` to get a filter that includes `since` and `until` for a given liveness. 

```js
this.livenessFilter('online') // returns: { since: `${Date.now()-(monitor.frequency*monitor.tolerance)}` }
this.livenessFilter('dead') // returns: { until: `${Date.now()-(monitor.deadAfter)}` }
this.livenessFilter('offline') // returns: { until: `${Date.now()-(monitor.frequency*monitor.tolerance)}`, since: `${Date.now()-(monitor.deadAfter)}`  }
this.livenessFilter('all') //returns {}
```

## Full Datasets
In a case where you wish to fetch an "complete" dataset, you will need to utilize something similar to `nostr-fetch`. Below is an example of how to do this using `nostr-fetch` with its `ndk-adapter`. 

```js
const fetcher = NostrFetcher.withCustomPool(ndkAdapter(ndk));
const {since} = monitor.nip66Filter(NDKKinds.RelayDiscovery) //nostr-fetch accepts since and until as a separate parameter instead of in the filter.
const onlineRelays = await fetcher.fetchAllEvents(
                this.ndk?.explicitRelayUrls,
                { authors: [monitor.pubkey], kinds: [NDKKinds.RelayDiscovery] },
                since,
            );
```

<a name="important"></a>
## Important Notes
- Individual monitors could report a different number of relays online. 
- Monitors could be malicious, so implementing a trust model or otherwise hardcoding specific monitors you personally trust is important (case dependent)
- Your use case informs how you should use NIP-66. For lite usage, you should probably use Relay Discovery Events. However, if you require more data about relays, or have a need for complete data sets across multiple monitors or intended to aggregate data from many monitors, you should probably use Relay Meta Events and a cache to store the data, and to subsequently query from. 