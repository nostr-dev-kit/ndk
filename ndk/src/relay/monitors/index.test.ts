import { NDK } from '../../ndk/index';
import { NDKRelayMonitors } from './NDKRelayMonitors';
import { NDKEventGeoCoded } from '../../events/geocoded';

// Mock NDKEventGeoCoded and related methods
jest.mock('../../events/kinds/nip66/NDKEventGeoCoded', () => {
  return {
    NDKEventGeoCoded: jest.fn().mockImplementation(() => {
      return {
        fetchNearby: jest.fn(),
        sortGeospatial: jest.fn()
      };
    }),
  };
});

describe("NDKRelayMonitors", () => {
    let ndk: NDK;
    let options;
    let relayMonitors;

    beforeEach(() => {
        ndk = new NDK();
        options = {};
        relayMonitors = new NDKRelayMonitors(ndk, options);
    });

    it("should be instantiated with the provided NDK instance", () => {
        expect(relayMonitors.ndk).toBe(ndk);
    });

    it("should initialize monitors when populate is called", async () => {
        // Mock any NDK or NDKEventGeoCoded methods used in populate
        const mockFetchEvents = jest.fn().mockResolvedValue(new Set());
        ndk.fetchEvents = mockFetchEvents;

        await relayMonitors.populate();
        
        // Check that fetchEvents was called, indicating an attempt to populate monitors
        expect(mockFetchEvents).toHaveBeenCalled();
    });

    describe("Filtering and Sorting", () => {
        it("should filter active monitors correctly", async () => {
            const activeMonitor = { active: true };
            const inactiveMonitor = { active: false };
            const monitors = new Set([activeMonitor, inactiveMonitor]);

            monitors.forEach(monitor => {
                monitor.isMonitorActive = jest.fn().mockResolvedValue(monitor.active);
            });

            const filteredMonitors = await NDKRelayMonitors.filterActiveMonitors(monitors);

            expect(filteredMonitors).toContain(activeMonitor);
            expect(filteredMonitors).not.toContain(inactiveMonitor);
            });

            it("should sort monitors by proximity correctly", async () => {

            const coords = { lat: 0, lon: 0 };
            const monitors = new Set([{ lat: 1, lon: 1 }, { lat: -1, lon: -1 }]);

            const sortedMonitors = await NDKRelayMonitors.sortMonitorsByProximity(coords, monitors);

        });
    });

    describe('populateByCriterias', () => {
        it('should populate monitors based on given criterias', async () => {
            // Setup mocks for NDK methods used within populateByCriterias
            const mockFetchMonitors = jest.fn();
            ndk.fetchEvents = mockFetchMonitors.mockResolvedValue(new Set([/* Mock RelayMonitors data */]));

            const criterias = {/* Define criterias */};
            await relayMonitors.populateByCriterias(criterias, true);

            // Verify fetchEvents was called with expected filter
            expect(mockFetchMonitors).toHaveBeenCalledWith(expect.objectContaining({
                /* Expected filter derived from criterias */
            }));

            // Further assertions on the state of relayMonitors after populateByCriterias
            expect(relayMonitors.monitors.size).toBeGreaterThan(0);
            // Add more assertions as needed
        });
    });

    describe('aggregate', () => {
        it('should aggregate data based on the specified fetchAggregate method', async () => {
            const mockFetchOnlineRelays = jest.fn();
            NDKEventGeoCoded.prototype.fetchOnlineRelays = mockFetchOnlineRelays.mockResolvedValue(/* Mock data */);

            const fetchAggregate = 'onlineList'; // Example aggregate method
            const results = await relayMonitors.aggregate(fetchAggregate, options);

            expect(mockFetchOnlineRelays).toHaveBeenCalled();

            expect(results).toBeDefined();
        });
    });
});
