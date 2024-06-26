import { NDK } from "../../../ndk/index.js";
import type { NDKEvent, NostrEvent } from "../../index.js";
import { RelayMonitor } from './relay-monitor';
// import type { RelayMonitorSet, RelayMetaSet, RelayDiscoveryResult } from './relay-monitor';
import { RelayDiscovery } from './relay-discovery';

import { RelayMeta } from './relay-meta';
import { NDKKind } from '../index';
import type { NDKFilter } from "../../../subscription/index.js";

// const MONITOR_PUBKEY = "abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832";

const EVENT_10166 = {"id":"dcc56a6b1b38ab4372bb95a9095a16406f501ae6abb17763a31bc2c4a33f2964","kind":10166,"pubkey":"abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832","created_at":1710936428,"content":"","tags":[["frequency","3600"],["o","9bbabc5e36297b6f7d15dd21b90ef85b2f1cb80e15c37fcc0c7f6c05acfd0019"],["k","30066"],["k","30166"],["c","open"],["c","read"],["c","write"],["c","info"],["c","dns"],["c","geo"],["c","ssl"],["timeout","open","30000"],["timeout","read","30000"],["timeout","write","30000"],["G","geohash"],["g","u0yjjee20","geohash"],["g","u0yjjee2","geohash"],["g","u0yjjee","geohash"],["g","u0yjje","geohash"],["g","u0yjj","geohash"],["g","u0yj","geohash"],["g","u0y","geohash"],["g","u0","geohash"],["g","u","geohash"],["G","countryCode"],["g","DE","countryCode"],["g","DEU","countryCode"],["G","countryName"],["g","Germany","countryName"],["G","cityName"],["g","Frankfurt am Main","cityName"]],"sig":"fabe5d4019e8bc4f9c9940bccc13fe07cae5eeb3fb3d03dd11756e35871558cf301c053a71db7f5828a7f41b3479514b6ca7cea658159db3eae7a3544db89f36"};
const EVENT_30166_A: NostrEvent = {"id":"0b44170d80ae592345f87f49b466d2f3391f53f4bb954e0cf95a65eae9242281","kind":30166,"pubkey":"abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832","created_at":1709611188,"content":"","tags":[["d","wss://relay.weloveit.info/"],["n","clearnet"],["N","0"],["N","1"],["N","2"],["N","3"],["N","4"],["N","5"],["N","6"],["N","7"],["N","8"],["N","9"],["N","10"],["N","11"],["R","!auth"],["R","!payment"],["s","git+https://github.com/hoytech/strfry.git"],["G","geohash"],["g","u1422u57b","geohash"],["g","u1422u57","geohash"],["g","u1422u5","geohash"],["g","u1422u","geohash"],["g","u1422","geohash"],["g","u142","geohash"],["g","u14","geohash"],["g","u1","geohash"],["g","u","geohash"],["G","countryCode"],["g","FR","countryCode"],["g","FRA","countryCode"],["G","countryName"],["g","France","countryName"],["G","regionCode"],["g","FR-HDF","regionCode"]],"sig":"531e6339e1a5df2761f5e9eb0c12d6b0aa9273c522aba3ab164dcbe802d53e553acf454f5790932ebaa87004b02aee45d10354e9fda153f5f539f98211c38975"};
const EVENT_30166_B: NostrEvent = {"id":"ade1b3b33b9a0bf98ce851a343d99bab39fa0491cf341b2b622d7f70786ff071","kind":30166,"pubkey":"abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832","created_at":1709769876,"content":"","tags":[["d","wss://africa.nostr.joburg/"],["n","clearnet"],["N","0"],["N","1"],["N","2"],["N","3"],["N","4"],["N","5"],["N","6"],["N","7"],["N","8"],["N","9"],["N","10"],["N","11"],["N","12"],["N","13"],["R","!auth"],["R","!payment"],["s","git+https://github.com/Cameri/nostream.git"],["G","geohash"],["g","ke7fy2z3v","geohash"],["g","ke7fy2z3","geohash"],["g","ke7fy2z","geohash"],["g","ke7fy2","geohash"],["g","ke7fy","geohash"],["g","ke7f","geohash"],["g","ke7","geohash"],["g","ke","geohash"],["g","k","geohash"],["G","countryCode"],["g","ZA","countryCode"],["g","ZAF","countryCode"],["G","countryName"],["g","South Africa","countryName"],["G","regionCode"],["g","ZA-GP","regionCode"]],"sig":"0a90ae93b3f3964072cd2eb30c949505980aa2f9df3c1c61912b41e84c0af67079e7df2719f3fc7d3914d8e8c81519228da50f3f71498ec5c323779c8c82a694"};
const EVENT_30066_A: NostrEvent = {"id":"e60efd752d5e86e7b0241db0cf0c11033ab8942a931d3f1704e9db55792b8756","kind":30066,"pubkey":"abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832","created_at":1709611187,"content":"{\"contact\":\"https://relay.weloveit.info\",\"description\":\"strfry relay , streaming to relayable and others , contact me for access.\",\"name\":\"relay.weloveit.info\",\"pubkey\":\"386058f50fb3ab679f9bcae74d731dea693874688d3064a504ef5f0fd5cdecb9\",\"software\":\"git+https://github.com/hoytech/strfry.git\",\"supported_nips\":[1,2,4,9,11,12,16,20,22,28,33,40],\"version\":\"0.9.6-7-g7196547\"}","tags":[["d","wss://relay.weloveit.info/"],["other","network","clearnet"],["rtt","open","142"],["rtt","read","83"],["rtt","write","113"],["nip11","name","relay.weloveit.info"],["nip11","desc","strfry relay , streaming to relayable and others , contact me for access."],["nip11","payment_required","false"],["nip11","auth_required","false"],["nip11","pubkey","386058f50fb3ab679f9bcae74d731dea693874688d3064a504ef5f0fd5cdecb9"],["nip11","contact","https://relay.weloveit.info"],["nip11","software","git+https://github.com/hoytech/strfry.git"],["nip11","version","0.9.6-7-g7196547"],["nip11","supported_nips","1","2","4","9","11","12","16","20","22","28","33","40"],["dns","ipv4","146.59.155.110"],["dns","as","AS16276 OVH SAS"],["dns","asname","OVH"],["dns","isp","OVH SAS"],["geo","lat","50.6916"],["geo","lon","3.20151"],["geo","tz","Europe/Paris"],["geo","cityName","Roubaix"],["geo","regionCode","FR-HDF"],["geo","regionName","Hauts-de-France"],["geo","countryName","France"],["geo","countryCode","FR"],["geo","geohash","u1422u57b"],["ssl","subject_alt_name","DNS:relay.weloveit.info"],["ssl","valid_from","1705363200"],["ssl","valid_to","1713225599"],["ssl","fingerprint","A9:7D:CA:AA:25:51:9E:A3:6E:16:E8:BB:3D:CC:00:2D:4D:C8:8D:BA"],["ssl","fingerprint256","BD:B2:F7:28:E1:2C:F7:09:EA:D6:75:E6:9E:11:C6:06:EA:DD:C2:C2:10:65:A8:32:73:C0:0A:0A:05:6F:87:BD"],["ssl","fingerprint512","FE:2F:8D:0D:97:51:D2:B6:C1:76:1C:79:C9:2D:57:17:30:FB:58:82:F7:93:D3:F9:A8:D7:AD:2F:8B:F4:F2:70:89:50:18:20:22:FC:71:07:E5:29:71:E4:D1:9F:76:8D:C9:60:82:A0:68:CA:6D:23:EE:73:80:56:1C:88:A5:32"],["ssl","ext_key_usage","1.3.6.1.5.5.7.3.1","1.3.6.1.5.5.7.3.2"],["ssl","serial_number","2E8151DE5B55B92EF908B1EF2FA18A37"],["ssl","pem_encoded","-----BEGIN CERTIFICATE-----\nMIIEBzCCA4ygAwIBAgIQLoFR3ltVuS75CLHvL6GKNzAKBggqhkjOPQQDAzBLMQsw\nCQYDVQQGEwJBVDEQMA4GA1UEChMHWmVyb1NTTDEqMCgGA1UEAxMhWmVyb1NTTCBF\nQ0MgRG9tYWluIFNlY3VyZSBTaXRlIENBMB4XDTI0MDExNjAwMDAwMFoXDTI0MDQx\nNTIzNTk1OVowHjEcMBoGA1UEAxMTcmVsYXkud2Vsb3ZlaXQuaW5mbzBZMBMGByqG\nSM49AgEGCCqGSM49AwEHA0IABF04E1HPJ75PHu74Y2AA1bIZm99vcf6IpZwj88NS\nPOQwj2wmYN1inrOXbSngKOutVUj4/2/j8eMzCLRhWv7lgNmjggJ9MIICeTAfBgNV\nHSMEGDAWgBQPa+ZLzjlHrvZ+kB558DCRkshfozAdBgNVHQ4EFgQUXOC7H6t0mUqV\ntyx2NkiSyDO5lZQwDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0l\nBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMEkGA1UdIARCMEAwNAYLKwYBBAGyMQEC\nAk4wJTAjBggrBgEFBQcCARYXaHR0cHM6Ly9zZWN0aWdvLmNvbS9DUFMwCAYGZ4EM\nAQIBMIGIBggrBgEFBQcBAQR8MHowSwYIKwYBBQUHMAKGP2h0dHA6Ly96ZXJvc3Ns\nLmNydC5zZWN0aWdvLmNvbS9aZXJvU1NMRUNDRG9tYWluU2VjdXJlU2l0ZUNBLmNy\ndDArBggrBgEFBQcwAYYfaHR0cDovL3plcm9zc2wub2NzcC5zZWN0aWdvLmNvbTCC\nAQIGCisGAQQB1nkCBAIEgfMEgfAA7gB1AHb/iD8KtvuVUcJhzPWHujS0pM27Kdxo\nQgqf5mdMWjp0AAABjRSStXcAAAQDAEYwRAIgS01TIZYssKiTp+54o9LBjJDatHKS\npaL4A58h/PIxHTACIGwcFbcgRFI94PmwAc4JEoAwN2wSQGdip20Us2VRKTifAHUA\nO1N3dT4tuYBOizBbBv5AO2fYT8P0x70ADS1yb+H61BcAAAGNFJK2NwAABAMARjBE\nAiASIS2oD1AhciolkakcfasDxiZusBIi4DlUIZcCaanlMwIgHXcenP539DY42R8T\nYuUMG38v7gmY4tXGq4e92Ui68zQwHgYDVR0RBBcwFYITcmVsYXkud2Vsb3ZlaXQu\naW5mbzAKBggqhkjOPQQDAwNpADBmAjEAyFjwjAhWlQZsEWBk30jiBjKhd16+/jr/\nXpKuWIWH44Ed1Dl1w5zb5likWLl1115nAjEAq9NuO9VV0GEjQx3htxpEmRvrRGpp\nD7rqgGDhNGwRWU7TqFr/lgdTB+OCf885ioiz\n-----END CERTIFICATE-----"]],"sig":"eade37a0867cbff922134cad6484ada02a1659123c343b7b9d6902d1d5a94eee8f619fdff4b8728a3a2dddb09871a566637958087d6ece531268a73ac68cddb2"};
const EVENT_30066_B: NostrEvent = {"id":"6ade1873b48669a5a0ae908f4b972be6daa581b8c09fb58d78b4e075b83ec206","kind":30066,"pubkey":"abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832","created_at":1709716068,"content":"{\"contact\":\"pastagringo@fractalized.net\",\"description\":\"Plebs are the white blood cells of the Bitcoin network, helping combat FUD (Fear, Uncertainty, Doubt) by being a vocal participant; helping educate and on-board no-coiners. Most plebs are Bitcoin maximalists, meaning they are proponents of supporting the adoption and growth of Bitcoin; not broader crypto. Bitcoin is secured by laser-eyed plebs. Few understand this.\",\"name\":\"relay.plebes.fans\",\"pubkey\":\"b12b632c887f0c871d140d37bcb6e7c1e1a80264d0b7de8255aa1951d9e1ff79\",\"software\":\"git+https://github.com/hoytech/strfry.git\",\"supported_nips\":[1,2,4,9,11,12,16,20,22,28,33,40],\"version\":\"0.9.6\"}","tags":[["d","wss://relay.plebes.fans/"],["other","network","clearnet"],["rtt","open","174"],["rtt","read","68"],["rtt","write","81"],["nip11","name","relay.plebes.fans"],["nip11","desc","Plebs are the white blood cells of the Bitcoin network, helping combat FUD (Fear, Uncertainty, Doubt) by being a vocal participant; helping educate and on-board no-coiners. Most plebs are Bitcoin maximalists, meaning they are proponents of supporting the adoption and growth of Bitcoin; not broader crypto. Bitcoin is secured by laser-eyed plebs. Few understand this."],["nip11","payment_required","false"],["nip11","auth_required","false"],["nip11","pubkey","b12b632c887f0c871d140d37bcb6e7c1e1a80264d0b7de8255aa1951d9e1ff79"],["nip11","contact","pastagringo@fractalized.net"],["nip11","software","git+https://github.com/hoytech/strfry.git"],["nip11","version","0.9.6"],["nip11","supported_nips","1","2","4","9","11","12","16","20","22","28","33","40"],["dns","ipv4","89.33.85.208"],["dns","as","AS199654 Oxide Group Limited"],["dns","asname","OXIDE-GROUP-LIMITED"],["dns","isp","Oxide Group Limited"],["dns","is_mobile","true"],["geo","lat","50.8955"],["geo","lon","6.06862"],["geo","tz","Europe/Amsterdam"],["geo","cityName","Eygelshoven"],["geo","regionCode","NL-LI"],["geo","regionName","Limburg"],["geo","countryName","The Netherlands"],["geo","countryCode","NL"],["geo","geohash","u1h3d15pc"],["ssl","subject_alt_name","DNS:*.plebes.fans, DNS:plebes.fans"],["ssl","valid_from","1708852049"],["ssl","valid_to","1716628048"],["ssl","fingerprint","11:E7:95:B1:D9:BD:2F:54:27:D4:F7:06:A5:E8:7E:EF:96:6C:68:D2"],["ssl","fingerprint256","BC:B5:4B:3C:16:5F:84:04:07:D2:B9:C8:72:4F:9D:28:EA:91:BF:28:ED:CE:E9:27:F2:F7:D4:76:61:C1:F1:B5"],["ssl","fingerprint512","56:37:D5:BC:71:02:89:FF:9F:41:3D:76:45:05:C6:10:4E:42:94:9A:6E:A9:3A:84:13:A3:B5:31:06:25:30:C9:19:1B:20:AB:34:E4:9B:E4:BF:25:17:C1:5F:A1:20:17:AA:DF:53:D2:61:02:F4:85:3F:05:68:61:D2:22:4E:F0"],["ssl","ext_key_usage","1.3.6.1.5.5.7.3.1","1.3.6.1.5.5.7.3.2"],["ssl","serial_number","03F4EA556F5EA3D1B34A02F13DB63981D7E8"],["ssl","pem_encoded","-----BEGIN CERTIFICATE-----\nMIIERjCCAy6gAwIBAgISA/TqVW9eo9GzSgLxPbY5gdfoMA0GCSqGSIb3DQEBCwUA\nMDIxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQswCQYDVQQD\nEwJSMzAeFw0yNDAyMjUwOTA3MjlaFw0yNDA1MjUwOTA3MjhaMBgxFjAUBgNVBAMM\nDSoucGxlYmVzLmZhbnMwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAATKMGI0DlBW92gv\njdsJ6F9tvp93u5Fr/xr/e8jtTqG77e01d+Uj0eUodbECdUiJEjp5CWw/+18aac3/\nYb1Ml5lxCwAPuFIyLn43NxLdUYLTrz9FWfkwIntFbs4bFs8lO4KjggIcMIICGDAO\nBgNVHQ8BAf8EBAMCB4AwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMAwG\nA1UdEwEB/wQCMAAwHQYDVR0OBBYEFCeOv1UaN9QfxKiRmpFBHMrgrwy3MB8GA1Ud\nIwQYMBaAFBQusxe3WFbLrlAJQOYfr52LFMLGMFUGCCsGAQUFBwEBBEkwRzAhBggr\nBgEFBQcwAYYVaHR0cDovL3IzLm8ubGVuY3Iub3JnMCIGCCsGAQUFBzAChhZodHRw\nOi8vcjMuaS5sZW5jci5vcmcvMCUGA1UdEQQeMByCDSoucGxlYmVzLmZhbnOCC3Bs\nZWJlcy5mYW5zMBMGA1UdIAQMMAowCAYGZ4EMAQIBMIIBBAYKKwYBBAHWeQIEAgSB\n9QSB8gDwAHYAouK/1h7eLy8HoNZObTen3GVDsMa1LqLat4r4mm31F9gAAAGN37vm\n2AAABAMARzBFAiEA5MYKc2sU6MivaOHyM7h8lhdtq7sCjvFc892BSIgT50gCICB7\nWRQqV3KpDVrKqqxlv3u/QmeOsEb479xFcDP0NErGAHYA7s3QZNXbGs7FXLedtM0T\nojKHRny87N7DUUhZRnEftZsAAAGN37vmzgAABAMARzBFAiAH0TdER3FsIMrmKfZH\nBnzgCHy0Z1POZrpVZQSNy48ILwIhAL3xq0V4xCrCipONS6ugbkAvTAWAmyeTQIlr\nLfudeziFMA0GCSqGSIb3DQEBCwUAA4IBAQCkh0cvEV+PvrOj1i/j/rUJ6OMqEF8w\nxCn+l+4Ed1vKs8eDisZczNQoZLofzoXr7+cPCSA5ocdRErIVH8jMhqpsvVR09Kmn\n6SriIV+a8V+ZR7OaQE1/eymCmSWYvPG1+P6pYnmCB/wpitqIs4nFoSLLgdD+5Lne\nOaypNqgoGvV87hzxwoi9xLT3Kxj6JJ7m4UHwnwUfgTZ3W3uwbK70TiVlM7xIXBak\naZp1zbedD1Vvjz/QYDeVC3CS4cMXRQmDZQjH2wjxaNT5LaVHoVO2ftu4OnyJH73C\nheqtjv8Auxk5x50Q1KvYTkSPKgYopT8oV70OBmPtsGAwO3XVR6Okby+S\n-----END CERTIFICATE-----"]],"sig":"7a3cf106ca1be0f07b68b61f7e5bd47c93de9eeb71f643d36d6dd2a574dfde0f5e1a28bee1a355b5d9e4b44ba6244a364739af8039567d52689861f1e56be87f"};

let NDKEVENT_30066_1: RelayMeta, 
    NDKEVENT_30066_2: RelayMeta, 
    NDKEVENT_30166_1: RelayDiscovery, 
    NDKEVENT_30166_2: RelayDiscovery;

export const setupMetaEvents = (ndk: NDK): RelayMeta[] => {
  return [
    new RelayMeta(ndk, EVENT_30066_A),
    new RelayMeta(ndk, EVENT_30066_B)
  ];
};

export const setupDiscoveryEvents = (ndk: NDK): RelayDiscovery[] => {
  return [
    new RelayDiscovery(ndk, EVENT_30166_A),
    new RelayDiscovery(ndk, EVENT_30166_B)
  ];
};
  
export const testEventsMeta = [ EVENT_30066_A, EVENT_30066_B ];
export const testEventsDiscovery = [ EVENT_30166_A, EVENT_30166_B ];
export const testEvents = [ ...testEventsMeta, ...testEventsDiscovery ];

const explicitRelayUrls = ["wss://history.nostr.watch", "wss://purplepag.es"];

describe('RelayMonitor', () => {

  let relayMonitor: RelayMonitor;
  const ndk = new NDK({ explicitRelayUrls });
  [ NDKEVENT_30066_1 , NDKEVENT_30066_2 ]  = setupMetaEvents(ndk);
  [ NDKEVENT_30166_1, NDKEVENT_30166_2 ] = setupDiscoveryEvents(ndk);

  const fetchEventsMock = jest.spyOn(ndk, "fetchEvents");
  // const fetchEventMock = jest.spyOn(ndk, "fetchEvent");
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    relayMonitor = new RelayMonitor(ndk, EVENT_10166);
  });

  describe('getters', ()=>{
    it('should get pubkey', () => {
      expect(relayMonitor.pubkey).toBe("abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832");
    });

    it('should get frequency', () => {
      expect(relayMonitor.frequency).toBe(3600);
    });

    it('should get operator', () => {
      expect(relayMonitor.owner).toBe("9bbabc5e36297b6f7d15dd21b90ef85b2f1cb80e15c37fcc0c7f6c05acfd0019");
    });

    it('should get timeouts', () => {
      expect(relayMonitor.timeout).toEqual({
        open: 30000,
        read: 30000,
        write: 30000
      });
    });

    it('should get kinds', () => {
      expect(relayMonitor.kinds).toContain(NDKKind.RelayMeta);
      expect(relayMonitor.kinds).toContain(NDKKind.RelayDiscovery);
    });

    // it('should get geo', () => {
    //   expect(relayMonitor.getGeo()).toEqual( expect.arrayContaining([["g", "u0yjjee20", "geohash"]]));
    // });

  });

  describe('setters', ()=>{
    it('should set pubkey', () => {
      expect(relayMonitor.pubkey).toBe("abcde937081142db0d50d29bf92792d4ee9b3d79a83c483453171a6004711832");
    });
  
    it('should set and get frequency correctly', () => {
      expect(relayMonitor.frequency).toBe(3600);
    });
  
    it('should set operator correctly', () => {
      expect(relayMonitor.owner).toBe("9bbabc5e36297b6f7d15dd21b90ef85b2f1cb80e15c37fcc0c7f6c05acfd0019");
    });
  
    it('should set timeouts correctly', () => {
      expect(relayMonitor.timeout).toEqual({
        open: 30000,
        read: 30000,
        write: 30000
      });
    });
  
    it('should set kinds correctly', () => {
      // relayMonitor.kinds = [NDKKind.RelayMeta, NDKKind.RelayDiscovery];
      expect(relayMonitor.kinds).toContain(NDKKind.RelayMeta);
      expect(relayMonitor.kinds).toContain(NDKKind.RelayDiscovery);
    });
  
    // it('should set timeouts correctly', () => {
    //   expect(relayMonitor.getGeo()).toEqual( expect.arrayContaining([["g", "u0yjjee20", "geohash"]]));
    // });
  });

  describe('@private', () => {
    let relayMonitor: RelayMonitor;
  
    beforeEach(() => {
      relayMonitor = new RelayMonitor(ndk);
    });
  
    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('reduceRelayEventsToRelayStrings', () => {
      it('should return a relay list', async () => {
        const result = relayMonitor['reduceRelayEventsToRelayStrings'](new Set([NDKEVENT_30166_1, NDKEVENT_30166_2]) as Set<NDKEvent>);
        expect(result).toBeInstanceOf(Set);
        expect(result).toEqual(new Set(['wss://relay.weloveit.info/', 'wss://africa.nostr.joburg/']));
      });
    });

    describe('nip66Filter', () => {
      it('should generate correct filter based on input kinds', () => {
        const filter = relayMonitor['nip66Filter']( [NDKKind.RelayMeta], { limit: 1 }, { "#n": ["clearnet"] } );
        expect(filter).toHaveProperty('kinds', expect.arrayContaining([NDKKind.RelayMeta]));
        expect(filter).toHaveProperty('limit', 1);
        expect(filter).toHaveProperty('#n', expect.arrayContaining(["clearnet"]));
      });
    });
  });

  describe('@public', () => {

    beforeEach(() => {
      relayMonitor = new RelayMonitor(ndk, EVENT_10166);
      fetchEventsMock.mockImplementation((filter): Promise<Set<NDKEvent>> => {
        let result: NDKEvent[] = [NDKEVENT_30066_1, NDKEVENT_30066_2, NDKEVENT_30166_1, NDKEVENT_30166_2];
        filter = filter as NDKFilter;
        const kinds = filter?.kinds?.map(kind => kind as number);
        result = result.filter( event => kinds?.includes(event.kind as number) );
        const f = filter as NDKFilter;
        if (f instanceof Object) {
            if (f?.["#s"]) {
                result = result
                    .filter(event => 'software' in event && f?.["#s"]?.includes((event as any)?.software || ""));
            }
            if (f?.["#d"]) {
                result = result.filter(event => 'url' in event && f?.["#d"]?.includes((event as any)?.url || ""));
            }
        }
        return Promise.resolve(new Set(result));
      });
    });

    describe('isMonitorValid',()=>{
      it('should return true when all conditions are met', () => {
        expect(relayMonitor.isMonitorValid()).toBe(true);
      });
    
      it('should return false when not all conditions are met', () => {
        relayMonitor.frequency = undefined; 
        expect(relayMonitor.isMonitorValid()).toBe(false);
      });
    });
  });

  describe('@static', () => {
    describe('from', () => {
      it('should return a RelayMonitor instance', () => {
        const newRelayMonitor = RelayMonitor.from(NDKEVENT_30066_1);
        expect(newRelayMonitor).toBeInstanceOf(RelayMonitor);
        expect(newRelayMonitor?.checks).toBeDefined();
      });
    });
  });
});