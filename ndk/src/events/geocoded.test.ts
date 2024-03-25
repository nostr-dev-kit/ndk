import { NDKEventGeoCoded } from './geocoded';
import { NDK } from '../ndk/index.js';

import type { NostrEvent } from './';
import type { DD, FetchNearbyRelayOptions } from './geocoded';

// Sample Nostr events to use in tests
const rawEvent = {
    id: 'sample-id',
    pubkey: 'abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832',
    created_at: 1622505600,
    kind: 1,
    content: 'Sample content',
    tags: [['g', 'u0yjjd6j5sff', 'gh']]
};

const geohashEvent = {
    id: 'geohash-id',
    pubkey: 'abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832',
    created_at: 1622505600,
    kind: 1,
    content: 'Geohash content',
    tags: [
        ["G", "gh"],
        ["g", "u1422u57b", "gh"],
        ["g", "u1422u57", "gh"],
        ["g", "u1422u5", "gh"],
        ["g", "u1422u", "gh"],
        ["g", "u1422", "gh"],
        ["g", "u142", "gh"],
        ["g", "u14", "gh"],
        ["g", "u1", "gh"],
        ["g", "u", "gh"],
        ["G", "countryCode"],
        ["g", "FR", "countryCode"],
        ["g", "FRA", "countryCode"],
        ["G", "countryName"],
        ["g", "France", "countryName"],
        ["G", "regionCode"],
        ["g", "FR-HDF", "regionCode"]
      ]      
};

const geohashEventNip23 = {
    id: 'geohash-id',
    pubkey: 'abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832',
    created_at: 1622505600,
    kind: 1,
    content: 'Legacy geohash content',
    tags: [
        ["g", "u1422u57b"],
      ]      
};

describe('NDKEventGeoCoded', () => {
    let ndk: NDK;
    let eventGeoCoded: NDKEventGeoCoded;
    let eventGeoCoded2: NDKEventGeoCoded;
    let eventGeoCodedNip23: NDKEventGeoCoded;

    beforeEach(() => {
        ndk = new NDK();
        eventGeoCoded = new NDKEventGeoCoded(ndk, rawEvent);
        eventGeoCoded2 = new NDKEventGeoCoded(ndk, geohashEvent);
        eventGeoCodedNip23 = new NDKEventGeoCoded(ndk, geohashEventNip23);
    });

    describe('Initialization', () => {
        it('should instantiate correctly with dd (lat/lon)', () => {
            expect(eventGeoCoded).toBeInstanceOf(NDKEventGeoCoded);
            const dd = eventGeoCoded.dd as DD;
            expect(dd?.lat).toBeDefined();
            expect(dd?.lon).toBeDefined();
            expect(dd?.lat).toEqual(50.11090007610619);
            expect(dd?.lon).toEqual(8.682099860161543);
            expect(dd).toEqual({ lat: 50.11090007610619, lon: 8.682099860161543 });
        });
        it('should instantiate correctly with a geohash', () => {
            const geohashGeoCoded = new NDKEventGeoCoded(ndk, geohashEvent);
            expect(geohashGeoCoded.geohashes).toEqual(expect.arrayContaining(['u1422u57b']));
        });
    });

    describe('getters', () => {
        it('should get geohashes correctly', () => {
            expect(eventGeoCoded2.geohashes).toEqual(expect.arrayContaining(['u1422u57b']));
        });

        it('should sort geohashes correctly', () => {
            expect(eventGeoCoded2.geohash).toEqual('u1422u57b');
        });

        it('should get coords correctly', () => {
            const dd = eventGeoCoded2?.dd as DD;
            expect(typeof dd.lat).toBe('number');
            expect(dd.lat).toBeGreaterThan(0);
            expect(typeof dd.lon).toBe('number');
            expect(dd.lon).toBeGreaterThan(0);
        });

        it('should get countryName correctly', () => {
            expect(eventGeoCoded2.countryName).toEqual('France');
        });
        it('should get countryCode correctly', () => {
            expect(eventGeoCoded2.countryCode).toEqual(expect.arrayContaining(['FRA', 'FR']));
        });

        it('should get regionCode correctly', () => {
            expect(eventGeoCoded2.regionCode).toEqual('FR-HDF');
        });
    });

    describe('setters', () => {

        it('should set valid geohash correctly', () => {
            eventGeoCoded.geohash = 'u1hc230';
            expect(eventGeoCoded.geohashes).toEqual(expect.arrayContaining(['u1hc230', 'u']));
        });

        it('should set valid geohashes correctly', () => {
            eventGeoCoded.geohashes = ['u1hc230'];
            expect(eventGeoCoded.geohashes).toEqual(['u1hc230']);
        });

        it('should set valid coords correctly', () => {
            expect(eventGeoCoded.dd).toEqual({ lat: 50.11090007610619, lon: 8.682099860161543 });
            eventGeoCoded.geohashes = ['u1422u57b'];
            expect(eventGeoCoded.geohashes).toEqual(expect.arrayContaining(['u1422u57b']));       
        });

        it('should not set invalid geohash', () => {
            eventGeoCoded.geohashes = ['aaaaaaaa'];
            expect(eventGeoCoded.geohashes).not.toEqual(['aaaaaaaa']);
        });

        it('should set countryCode correctly', () => {
            eventGeoCoded.countryCode = ['Germany'];
            expect(eventGeoCoded.countryCode).toEqual(['Germany']);      
        });
        
        it('should set countryName correctly', () => {
            eventGeoCoded.countryName = 'Germany';
            expect(eventGeoCoded.countryName).toEqual('Germany');
        });


        it('should set regionCode correctly', () => {
            eventGeoCoded.regionCode = 'AB-CD';
            expect(eventGeoCoded.regionCode).toEqual('AB-CD');      
        });

        it('should set regionName correctly', () => {
            eventGeoCoded.regionName = 'Region';
            expect(eventGeoCoded.regionName).toEqual('Region');      
        });

        it('should correctly update and retrieve geo-related information', () => {
            eventGeoCoded.countryCode = ['DE'];
            expect(eventGeoCoded.countryCode).toEqual(['DE']);
  
            eventGeoCoded.countryName = 'Germany';
            expect(eventGeoCoded.countryName).toEqual('Germany');
  
            eventGeoCoded.regionCode = 'DE-BY';
            expect(eventGeoCoded.regionCode).toEqual('DE-BY');
  
            eventGeoCoded.dd = { lat: 48.137154, lon: 11.576124 };
            expect(eventGeoCoded?.dd.lat).toEqual(48.137154);
            expect(eventGeoCoded?.dd.lon).toEqual(11.576124);

        });
    });

    describe('@static', () => {

        beforeEach(() => {
            ndk = new NDK();
            eventGeoCoded = new NDKEventGeoCoded(ndk, rawEvent);
            eventGeoCoded2 = new NDKEventGeoCoded(ndk, geohashEvent);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        describe('isGeohash', () => {
            it('should correctly identify a geohash', () => {
                expect(NDKEventGeoCoded.isGeohash('u0yjjd6j5sff')).toBeTruthy();
            });

            it('should correctly identify a non-geohash', () => {
                expect(NDKEventGeoCoded.isGeohash('aiol')).toBeFalsy();
                expect(NDKEventGeoCoded.isGeohash('a')).toBeFalsy();
                expect(NDKEventGeoCoded.isGeohash('i')).toBeFalsy();
                expect(NDKEventGeoCoded.isGeohash('o')).toBeFalsy();
                expect(NDKEventGeoCoded.isGeohash('l')).toBeFalsy();
            });
        });

        describe('encodeGeohash', () => {
            it('should encode latitude and longitude into a geohash string', () => {
                const geohash = NDKEventGeoCoded.encodeGeohash({ lat: 50.1109, lon: 8.6821} as DD);
                expect(geohash).toBeDefined();
                expect(geohash.length).toBeGreaterThan(0);
            });
        });

        describe('decodeGeohash', () => {
            it('should decode a geohash string into latitude and longitude', () => {
                const { lat, lon }: DD = NDKEventGeoCoded.decodeGeohash('u1hc230');
                expect(lat).toBeDefined();
                expect(lon).toBeDefined();
            });
        });

        describe('distance', () => {
            it('should calculate distance between two DD sets', () => {
                const distance = NDKEventGeoCoded.distance({lat: 50.1109, lon: 8.6821}, {lat: 52.5200, lon: 13.4050});
                expect(Math.round(distance)).toBe(424);
            });

            it('should calculate distance between two geohashes', () => {
                const distance = NDKEventGeoCoded.distance('u0yjjd6j5sff', 'u1hc230');
                expect(Math.round(distance)).toBe(163);
            });

            it('should calculate distance between a geohash and a DD', () => {
                const distance = NDKEventGeoCoded.distance('u1hc230', {lat: 52.5200, lon: 13.4050});
                expect(Math.round(distance)).toBe(498);
            });
        }); 

        describe('generateFilterableGeohash', () => {
            it('should generate a filterable geohash from a geohash', () => {
                const filterableGeohash = NDKEventGeoCoded.generateFilterableGeohash('u0yjjd6j5sff');
                expect(filterableGeohash).toBeDefined();
                expect(filterableGeohash.length).toBeGreaterThan(1);
            });
        });

        describe('sortGeohashes', () => {
            it('should sort geohashes by length in descending order', () => {
                const sorted = NDKEventGeoCoded.generateFilterableGeohash('u0yjjd6j5sff').sort(NDKEventGeoCoded.sortGeohashes);
                expect(sorted).toEqual(expect.arrayContaining(['u0yjjd6j5sff', 'u0yjjd6j5sf', 'u0yjjd6j5s']));
            });
        });

        describe('fetchNearby', () => {

            beforeEach( () => {
                jest.spyOn(ndk, 'fetchEvents').mockImplementation(async (filter) => {
                    return new Set([
                        eventGeoCoded2,
                        eventGeoCoded //gh reference 'u0yjjd6j5sff' at pos 2
                    ]);
                });
            });

            afterEach(() => {
                jest.clearAllMocks();
            });

            it('should fetch events nearby a given geohash', async () => {
                const nearbyEvents = await NDKEventGeoCoded.fetchNearby(ndk, 'u0yjjd6j5sff');
                expect(nearbyEvents).toBeInstanceOf(Set);
                expect(nearbyEvents.size).toBeGreaterThan(0);
                expect(Array.from(nearbyEvents)?.[0].geohash).toEqual('u0yjjd6j5sff');
            });

            describe('fetchNearby with options', () => {
                it('should fetch events nearby a given geohash and use options', async () => {
                    const options: FetchNearbyRelayOptions = { 
                        maxPrecision: 9,
                        minPrecision: 3, 
                        minResults: 1,
                        recurse: true
                    };
                    const nearbyEvents = await NDKEventGeoCoded.fetchNearby(ndk, 'u0yjjd6j5sff', undefined, options);
                    expect(nearbyEvents).toBeInstanceOf(Set);
                    expect(nearbyEvents.size).toBeGreaterThan(0);
                    expect(Array.from(nearbyEvents)?.[0].geohash).toEqual('u0yjjd6j5sff');
                });
    
                it('should return no events when callback is used to clear all events', async () => {
                    const options: FetchNearbyRelayOptions = { 
                        callbackFilter: async (evs: Set<NDKEventGeoCoded>) => new Set()
                    };
                    const nearbyEvents = await NDKEventGeoCoded.fetchNearby(ndk, 'u0yjjd6j5sff', undefined, options);
                    expect(nearbyEvents).toBeInstanceOf(Set);
                    expect(nearbyEvents.size).toBe(0);
                });
            });
        });

        describe('sortGeospatial', () => {
            it('should correctly sort events based on distance from a given point', () => {
                const coords = { lat: 50.1109, lon: 8.6821 }; // Reference point
                const eventsToSort = new Set([
                    new NDKEventGeoCoded(ndk, { ...geohashEvent, tags: [['g', 'u1hcy2z', 'gh']] }), // Further away
                    eventGeoCoded // Closer to reference point
                ]);
    
                const sortedEvents = NDKEventGeoCoded.sortGeospatial(coords, eventsToSort);
                const sortedArray = Array.from(sortedEvents);
                expect(sortedArray[0].id).toEqual(rawEvent.id);
                expect(sortedArray[1].id).toEqual(geohashEvent.id);
            });
        });

        describe('Manipulating Geospatial Tags', () => {
            it('should add and remove geospatial tags correctly', () => {
                const cleanEventGeoCoded = new NDKEventGeoCoded(ndk, {} as NostrEvent);
                cleanEventGeoCoded.dd = { lat: 50.1109, lon: 8.6821 } as DD;
                cleanEventGeoCoded['_removeGeoHashes']();
                expect(cleanEventGeoCoded.tags.some(tag => tag.includes('gh'))).toBeFalsy();
            });
        });

    });
    describe('backwards compatibility [NIP-52]', () => {
        describe('getters', () => {
            it('should get geohashes correctly', () => {
                expect(eventGeoCodedNip23.geohashes).toEqual(expect.arrayContaining(['u1422u57b']));
            });
    
            it('should sort geohashes correctly', () => {
                expect(eventGeoCodedNip23.geohash).toEqual('u1422u57b');
            });
        });
        
        describe('setters', () => {

            it('should set geohash correctly', () => {
                eventGeoCoded.geohash = 'u1hc230';
                const geohashes = eventGeoCoded.geohashes;
                expect(geohashes?.length).toBeGreaterThan(1);
                expect(eventGeoCoded.geohashes).toEqual(expect.arrayContaining(['u1hc230']));
            });

            it('should directly set geohashes correctly', () => {
                eventGeoCoded.geohashes = ['u1hc230', 'u1hc23'];
                expect(eventGeoCoded.geohashes).toEqual(['u1hc230', 'u1hc23']);
            });
    
            it('should set coords correctly', () => {
                expect(eventGeoCoded.dd).toEqual({ lat: 50.11090007610619, lon: 8.682099860161543 });
                eventGeoCoded.geohashes = ['u1422u57b'];
                expect(eventGeoCoded.geohashes).toEqual(expect.arrayContaining(['u1422u57b']));       
            });
        });
    });
});
