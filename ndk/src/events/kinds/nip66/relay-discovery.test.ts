import { NDK } from "../../../ndk/index.js";
import { RelayDiscovery } from './relay-discovery';
import type { NostrEvent } from "../../index.js";
import { NDKKind } from '../index';

const EVENT_30166_A: NostrEvent = {"id":"0b44170d80ae592345f87f49b466d2f3391f53f4bb954e0cf95a65eae9242281","kind":30166,"pubkey":"abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832","created_at":1709611188,"content":"","tags":[["d","wss://relay.weloveit.info/"],["n","clearnet"],["N","0"],["N","1"],["N","2"],["N","3"],["N","4"],["N","5"],["N","6"],["N","7"],["N","8"],["N","9"],["N","10"],["N","11"],["R","!auth"],["R","!payment"],["s","git+https://github.com/hoytech/strfry.git"],["G","geohash"],["g","u1422u57b","geohash"],["g","u1422u57","geohash"],["g","u1422u5","geohash"],["g","u1422u","geohash"],["g","u1422","geohash"],["g","u142","geohash"],["g","u14","geohash"],["g","u1","geohash"],["g","u","geohash"],["G","countryCode"],["g","FR","countryCode"],["g","FRA","countryCode"],["G","countryName"],["g","France","countryName"],["G","regionCode"],["g","FR-HDF","regionCode"]],"sig":"531e6339e1a5df2761f5e9eb0c12d6b0aa9273c522aba3ab164dcbe802d53e553acf454f5790932ebaa87004b02aee45d10354e9fda153f5f539f98211c38975"};

let NDKEVENT_30166_1: RelayDiscovery;

const setupNDKEvents = (ndk: NDK) => {
  NDKEVENT_30166_1 = new RelayDiscovery(ndk, EVENT_30166_A);
};

describe('RelayDiscovery', () => {
  let relayDiscovery: RelayDiscovery;

  const ndk = new NDK();
  setupNDKEvents(ndk);

  beforeEach(() => {
    relayDiscovery = new RelayDiscovery(ndk, EVENT_30166_A);
  });

  describe('getters', () => {
    it('should get kind', () => {
      expect(relayDiscovery.kind).toBe(NDKKind.RelayDiscovery);
    });

    it('should get network', () => {
      expect(relayDiscovery.network).toBe('clearnet');
    });

    it('should get nips', () => {
      expect(relayDiscovery.nips).toEqual(expect.arrayContaining([0,1,2,3,4,5,6,7,8,9,10,11]));
    });

    it('should get restrictions', () => {
      expect(relayDiscovery.restrictions).toEqual(expect.arrayContaining(['!auth', '!payment']));
    });

    it('should get software', () => {
      expect(relayDiscovery.software).toBe('git+https://github.com/hoytech/strfry.git');
    });
  });

  describe('setters', () => {
    it('should set network', () => {
      relayDiscovery.network = 'private';
      expect(relayDiscovery.network).toBe('private');
    });

    it('should set nips', () => {
      relayDiscovery.nips = [12, 13];
      expect(relayDiscovery.nips).toEqual(expect.arrayContaining([12, 13]));
    });

    it('should set restrictions', () => {
      relayDiscovery.restrictions = ['new-restriction'];
      expect(relayDiscovery.restrictions).toEqual(['new-restriction']);
    });

    it('should set software', () => {
      relayDiscovery.software = 'new-software';
      expect(relayDiscovery.software).toBe('new-software');
    });
  });

  describe('@static', () => {
    describe('from', () => {
      it('should return a RelayDiscovery instance', () => {
        const newRelayDiscovery = RelayDiscovery.from(NDKEVENT_30166_1);
        expect(newRelayDiscovery).toBeInstanceOf(RelayDiscovery);
        expect(newRelayDiscovery.network).toBe('clearnet');
      });
    });
  });

});