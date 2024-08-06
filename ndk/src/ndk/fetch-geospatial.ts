import type { NDK } from ".";
import { NDKEventGeoCoded } from "../events/geocoded";
import type { NDKFilter } from "../subscription";

export type FetchNearbyFilter = (events: Set<NDKEventGeoCoded>) => Promise<Set<NDKEventGeoCoded>>;

export type FetchNearbyOptions = {
  maxPrecision?: number;
  minPrecision?: number;
  minResults?: number;
  recurse?: boolean;
  callbackFilter?: FetchNearbyFilter;
}

const fetchNearbyFilterDefault: FetchNearbyFilter = async (evs: Set<NDKEventGeoCoded>)=>evs; 

const fetchNearbyOptionDefaults: FetchNearbyOptions = {
    maxPrecision: 7, 
    minPrecision: 3, 
    recurse: false,
    minResults: 5, 
    callbackFilter: fetchNearbyFilterDefault
};

export const fetchNearby = async (
  ndk: NDK,
  geohash: string,
  filter?: NDKFilter,
  options?: FetchNearbyOptions
): Promise<Set<NDKEventGeoCoded>>  => {

  const effectiveOptions: FetchNearbyOptions = {
      ...fetchNearbyOptionDefaults,
      ...options
  };

  let { maxPrecision, minPrecision } = effectiveOptions;
  const { minResults, recurse, callbackFilter } = effectiveOptions;
     
  let events: Set<NDKEventGeoCoded> = new Set();

  try {
      maxPrecision = Math.min(maxPrecision as number, geohash.length);
      minPrecision = Math.min(minPrecision as number, geohash.length);

      const fetchEventsRecursive = async (minPrecision: number, maxPrecision: number): Promise<void> => {
          if (minPrecision < 1 || events.size >= (minResults as number)) return;

          const geohashes = Array.from({ length: maxPrecision - minPrecision + 1 }, (_, i) => geohash.slice(0, maxPrecision - i));
          const _filter: NDKFilter = { ...filter, "#g": geohashes };
          const fetchedEvents = await ndk.fetchEvents(_filter);

          fetchedEvents.forEach(event => events.add(event as NDKEventGeoCoded));

          if (callbackFilter) events = await callbackFilter(events);

          if (recurse && events.size < (minResults as number)) {
              await fetchEventsRecursive(minPrecision - 1, minPrecision - 1);
          }
      };

      await fetchEventsRecursive(minPrecision, maxPrecision);

      if (events.size) {
          events = new Set([...NDKEventGeoCoded.sortGeospatial(geohash, events)]);
      }

      return events;
  } catch (error) {
      console.error(`fetchNearby: Error: ${error}`);
      return events;
  }
};