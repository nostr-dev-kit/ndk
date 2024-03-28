import { NDK } from "../../../ndk/index.js";
import { RelayMeta } from './relay-meta';
import type { NostrEvent } from "../../index.js";

const EVENT_30066_A: NostrEvent = {"id":"e60efd752d5e86e7b0241db0cf0c11033ab8942a931d3f1704e9db55792b8756","kind":30066,"pubkey":"abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832","created_at":1709611187,"content":"{\"contact\":\"https://relay.weloveit.info\",\"description\":\"strfry relay , streaming to relayable and others , contact me for access.\",\"name\":\"relay.weloveit.info\",\"pubkey\":\"386058f50fb3ab679f9bcae74d731dea693874688d3064a504ef5f0fd5cdecb9\",\"software\":\"git+https://github.com/hoytech/strfry.git\",\"supported_nips\":[1,2,4,9,11,12,16,20,22,28,33,40],\"version\":\"0.9.6-7-g7196547\"}","tags":[["d","wss://relay.weloveit.info/"],["other","network","clearnet"],["rtt","open","142"],["rtt","read","83"],["rtt","write","113"],["nip11","name","relay.weloveit.info"],["nip11","desc","strfry relay , streaming to relayable and others , contact me for access."],["nip11","payment_required","false"],["nip11","auth_required","false"],["nip11","pubkey","386058f50fb3ab679f9bcae74d731dea693874688d3064a504ef5f0fd5cdecb9"],["nip11","contact","https://relay.weloveit.info"],["nip11","software","git+https://github.com/hoytech/strfry.git"],["nip11","version","0.9.6-7-g7196547"],["nip11","supported_nips","1","2","4","9","11","12","16","20","22","28","33","40"],["dns","ipv4","146.59.155.110"],["dns","as","AS16276 OVH SAS"],["dns","asname","OVH"],["dns","isp","OVH SAS"],["geo","lat","50.6916"],["geo","lon","3.20151"],["geo","tz","Europe/Paris"],["geo","cityName","Roubaix"],["geo","regionCode","FR-HDF"],["geo","regionName","Hauts-de-France"],["geo","countryName","France"],["geo","countryCode","FR"],["geo","geohash","u1422u57b"],["ssl","subject_alt_name","DNS:relay.weloveit.info"],["ssl","valid_from","1705363200"],["ssl","valid_to","1713225599"],["ssl","fingerprint","A9:7D:CA:AA:25:51:9E:A3:6E:16:E8:BB:3D:CC:00:2D:4D:C8:8D:BA"],["ssl","fingerprint256","BD:B2:F7:28:E1:2C:F7:09:EA:D6:75:E6:9E:11:C6:06:EA:DD:C2:C2:10:65:A8:32:73:C0:0A:0A:05:6F:87:BD"],["ssl","fingerprint512","FE:2F:8D:0D:97:51:D2:B6:C1:76:1C:79:C9:2D:57:17:30:FB:58:82:F7:93:D3:F9:A8:D7:AD:2F:8B:F4:F2:70:89:50:18:20:22:FC:71:07:E5:29:71:E4:D1:9F:76:8D:C9:60:82:A0:68:CA:6D:23:EE:73:80:56:1C:88:A5:32"],["ssl","ext_key_usage","1.3.6.1.5.5.7.3.1","1.3.6.1.5.5.7.3.2"],["ssl","serial_number","2E8151DE5B55B92EF908B1EF2FA18A37"],["ssl","pem_encoded","-----BEGIN CERTIFICATE-----\nMIIEBzCCA4ygAwIBAgIQLoFR3ltVuS75CLHvL6GKNzAKBggqhkjOPQQDAzBLMQsw\nCQYDVQQGEwJBVDEQMA4GA1UEChMHWmVyb1NTTDEqMCgGA1UEAxMhWmVyb1NTTCBF\nQ0MgRG9tYWluIFNlY3VyZSBTaXRlIENBMB4XDTI0MDExNjAwMDAwMFoXDTI0MDQx\nNTIzNTk1OVowHjEcMBoGA1UEAxMTcmVsYXkud2Vsb3ZlaXQuaW5mbzBZMBMGByqG\nSM49AgEGCCqGSM49AwEHA0IABF04E1HPJ75PHu74Y2AA1bIZm99vcf6IpZwj88NS\nPOQwj2wmYN1inrOXbSngKOutVUj4/2/j8eMzCLRhWv7lgNmjggJ9MIICeTAfBgNV\nHSMEGDAWgBQPa+ZLzjlHrvZ+kB558DCRkshfozAdBgNVHQ4EFgQUXOC7H6t0mUqV\ntyx2NkiSyDO5lZQwDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0l\nBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMEkGA1UdIARCMEAwNAYLKwYBBAGyMQEC\nAk4wJTAjBggrBgEFBQcCARYXaHR0cHM6Ly9zZWN0aWdvLmNvbS9DUFMwCAYGZ4EM\nAQIBMIGIBggrBgEFBQcBAQR8MHowSwYIKwYBBQUHMAKGP2h0dHA6Ly96ZXJvc3Ns\nLmNydC5zZWN0aWdvLmNvbS9aZXJvU1NMRUNDRG9tYWluU2VjdXJlU2l0ZUNBLmNy\ndDArBggrBgEFBQcwAYYfaHR0cDovL3plcm9zc2wub2NzcC5zZWN0aWdvLmNvbTCC\nAQIGCisGAQQB1nkCBAIEgfMEgfAA7gB1AHb/iD8KtvuVUcJhzPWHujS0pM27Kdxo\nQgqf5mdMWjp0AAABjRSStXcAAAQDAEYwRAIgS01TIZYssKiTp+54o9LBjJDatHKS\npaL4A58h/PIxHTACIGwcFbcgRFI94PmwAc4JEoAwN2wSQGdip20Us2VRKTifAHUA\nO1N3dT4tuYBOizBbBv5AO2fYT8P0x70ADS1yb+H61BcAAAGNFJK2NwAABAMARjBE\nAiASIS2oD1AhciolkakcfasDxiZusBIi4DlUIZcCaanlMwIgHXcenP539DY42R8T\nYuUMG38v7gmY4tXGq4e92Ui68zQwHgYDVR0RBBcwFYITcmVsYXkud2Vsb3ZlaXQu\naW5mbzAKBggqhkjOPQQDAwNpADBmAjEAyFjwjAhWlQZsEWBk30jiBjKhd16+/jr/\nXpKuWIWH44Ed1Dl1w5zb5likWLl1115nAjEAq9NuO9VV0GEjQx3htxpEmRvrRGpp\nD7rqgGDhNGwRWU7TqFr/lgdTB+OCf885ioiz\n-----END CERTIFICATE-----"]],"sig":"eade37a0867cbff922134cad6484ada02a1659123c343b7b9d6902d1d5a94eee8f619fdff4b8728a3a2dddb09871a566637958087d6ece531268a73ac68cddb2"};

let NDKEVENT_30066_1: RelayMeta;

const setupNDKEvents = (ndk: NDK) => {
  NDKEVENT_30066_1 = new RelayMeta(ndk, EVENT_30066_A);
};

describe('RelayMeta', () => {
  let relayMeta: RelayMeta;
  const ndk = new NDK();
  setupNDKEvents(ndk);

  beforeEach(() => {
    relayMeta = new RelayMeta(ndk, EVENT_30066_A);
  });

  describe('getters', () => {
    it('kind', () => {
      expect(relayMeta.kind).toBe(30066);
    });

    it('url', () => {
      expect(relayMeta.url).toBe('wss://relay.weloveit.info/');
    });

    it('other', () => {
      expect(relayMeta.other).toEqual(expect.objectContaining({ network: "clearnet" }));
    });

    it('rtt', () => {
      expect(relayMeta.rtt).toEqual({ open: 142, read: 83, write: 113 });
    });

    it('nip11', () => {
      expect(relayMeta.nip11).toEqual(expect.objectContaining({ name: "relay.weloveit.info" }));
    });

    it('dns', () => {
      expect(relayMeta.dns).toEqual(expect.objectContaining({ ipv4: "146.59.155.110" }));
    });

    it('geo', () => {
      const geo = relayMeta.geo;
      expect(geo).toEqual(expect.objectContaining({
        lat: 50.6916,
        lon: 3.20151,
        tz: 'Europe/Paris',
        cityName: 'Roubaix',
        regionCode: 'FR-HDF',
        regionName: 'Hauts-de-France',
        countryName: 'France',
        countryCode: 'FR',
        geohash: 'u1422u57b'
      }));
    });

    it('ssl', () => {
      expect(relayMeta.ssl).toEqual(expect.objectContaining({ valid_from: 1705363200 }));
    });

    it('all', () => {
      const all = relayMeta.all;
      expect(all).toHaveProperty('rtt');
      expect(all).toHaveProperty('nip11');
      expect(all).toHaveProperty('dns');
      expect(all).toHaveProperty('ssl');
      expect(all).toHaveProperty('geo');
    });
  });

  describe('setters', () => {
    it('url', () => {
      relayMeta.url = 'wss://relay.plebes.fans/';
      expect(relayMeta.url).toBe('wss://relay.plebes.fans/');
    });

    it('other', () => {
      relayMeta.other = { network: "clearnet" };
      expect(relayMeta.other.network).toBe("clearnet");
    });

    it('rtt', () => {
      relayMeta.rtt = { open: 100, read: 50, write: 75 };
      expect(relayMeta.rtt).toEqual({ open: 100, read: 50, write: 75 });
    });

    it('dns', () => {
      relayMeta.dns = { ipv4: "127.0.0.1" };
      expect(relayMeta.dns.ipv4).toBe("127.0.0.1");
    });

    it('geo', () => {
      relayMeta.geo = { lat: 34.0522, lon: -118.2437 };
      const geo = relayMeta.geo;
      expect(geo.lat).toBe(34.0522);
      expect(geo.lon).toBe(-118.2437);
    });

    it('ssl', () => {
      relayMeta.ssl = { valid_to: "1713225599" };
      expect(relayMeta.ssl.valid_to).toBe(1713225599);
    });

    it('reflect updates from setters in all getter', () => {
      relayMeta.dns = { ipv4: "127.0.0.1" };
      relayMeta.geo = { lat: "34.0522", lon: "-118.2437" };
      relayMeta.ssl = { valid_to: "1713225599" };

      const all = relayMeta.all;
      expect(all?.dns?.ipv4).toBe("127.0.0.1");
      expect(all?.geo?.lat).toBe(34.0522);
      expect(all?.ssl?.valid_to).toBe(1713225599);
    });
  });

  describe('@static', () => {
    describe('from', () => {
      it('should return a RelayMeta instance', () => {
        const newRelayMeta = RelayMeta.from(NDKEVENT_30066_1);
        expect(newRelayMeta).toBeInstanceOf(RelayMeta);
        expect(newRelayMeta?.nip11?.name).toBe('relay.weloveit.info');
      });
    });
  });
});
