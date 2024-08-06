/* DD (Decimal Degrees, aka lat/lon) */
export type DD = { lat: number; lon: number }

/* Geohash */
export type Geohash = string;

/* Geohash OR DD */
export type Coords = DD | Geohash

/* Earth's radius in kilometers */
export const EARTH_RADIUS: number = 6371; 

/* Default Geohash precision */
export const GEOHASH_PRECISION: number = 12;

/* Base32 encoding characters */
export const BASE32: string = '0123456789bcdefghjkmnpqrstuvwxyz';  

/**
 * Encodes latitude and longitude into a geohash string.
 * 
 * @param coords The latitude to encode.
 * @param precision The desired precision of the geohash (length of the geohash string).
 * @returns The encoded geohash string.
 */
export const encodeGeohash = (coords: DD, precision: number = GEOHASH_PRECISION): string => {
  const {lat: latitude, lon: longitude} = coords;
  let isEven = true;
  const latR: number[] = [-90.0, 90.0];
  const lonR: number[] = [-180.0, 180.0];
  let bit = 0;
  let ch = 0;
  let geohash = '';

  while (geohash.length < precision) {
      let mid;
      if (isEven) {
          mid = (lonR[0] + lonR[1]) / 2;
          if (longitude > mid) {
              ch |= (1 << (4 - bit));
              lonR[0] = mid;
          } else {
              lonR[1] = mid;
          }
      } else {
          mid = (latR[0] + latR[1]) / 2;
          if (latitude > mid) {
              ch |= (1 << (4 - bit));
              latR[0] = mid;
          } else {
              latR[1] = mid;
          }
      }
      isEven = !isEven;

      if (bit < 4) {
          bit++;
      } else {
          geohash += BASE32.charAt(ch);
          bit = 0;
          ch = 0;
      }
  }

  return geohash;
};

/**
 * Decodes a geohash string into its latitude and longitude representation.
 * 
 * @param hashString The geohash string to decode.
 * @returns A DD typed object containing the decoded latitude (`lat`) and longitude (`lon`).
 */
export const decodeGeohash = (hashString: string): DD => {
  let isEven = true;
  const latR: number[] = [-90.0, 90.0];
  const lonR: number[] = [-180.0, 180.0];
  for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charAt(i).toLowerCase();
      const charIndex = BASE32.indexOf(char);
      for (let j = 0; j < 5; j++) {
          const mask = 1 << (4 - j);
          if (isEven) {
              decodeIntRefine(lonR, charIndex, mask);
          } else {
              decodeIntRefine(latR, charIndex, mask);
          }
          isEven = !isEven;
      }
  }
  const lat = (latR[0] + latR[1]) / 2;
  const lon = (lonR[0] + lonR[1]) / 2;
  return { lat, lon } as DD;
};

/**
 * Parses coordinates which can be either a Geohash string or a DD object.
 * 
 * @param coords - The coordinates to parse, either as a Geohash string or a DD object.
 * @returns The parsed coordinates as a DD object.
 */
export const parseCoords = (coords: Coords): DD => {
  return typeof coords === 'string'
      ? decodeGeohash(coords as Geohash)
      : coords as DD;
};

/**
 * Calculates the distance between two coordinate points.
 * 
 * @param coords1 - The first set of coordinates, either as a Geohash string or a DD object.
 * @param coords2 - The second set of coordinates, either as a Geohash string or a DD object.
 * @returns The distance between the two points in kilometers.
 */
export const distance = (coords1: Coords, coords2: Coords): number => {
  const {lat: lat1, lon: lon1} = parseCoords(coords1);
  const {lat: lat2, lon: lon2} = parseCoords(coords2);
  const radius: number = EARTH_RADIUS; //km
  const latDeg: number = toRadians(lat2 - lat1);
  const lonDeg: number = toRadians(lon2 - lon1);
  const angle: number  =
      Math.sin(latDeg / 2) * Math.sin(latDeg / 2) +
      Math.cos(toRadians(lat1)) * 
      Math.cos(toRadians(lat2)) * 
      Math.sin(lonDeg / 2) * 
      Math.sin(lonDeg / 2);
  return radius * 2 * Math.atan2(Math.sqrt(angle), Math.sqrt(1 - angle));
};

/**
 * Converts degrees to radians.
 * 
 * @param degrees - The degrees to convert.
 * @returns The radians.
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Refines the range of possible values for a coordinate based on a geohash character.
 * 
 * @param range - The range of possible values for the coordinate.
 * @param charIndex - The index of the current character in the geohash.
 * @param bitMask - The bitmask to apply for refinement.
 */
const decodeIntRefine = (range: number[], charIndex: number, bitMask: number): void => {
  const mid = (range[0] + range[1]) / 2;
  if ((charIndex & bitMask) > 0) {
      range[0] = mid;
  } else {
      range[1] = mid;
  }
};

/**
 * Checks if a string is a valid geohash.
 * 
 * @param str - The string to check.
 * @returns True if the string is a valid geohash, false otherwise.
 */
export const isGeohash = (str: string | undefined): boolean => {
  if (!str || str === '') return false;
  str = str.toLowerCase();
  for (let i = 0; i < str.length; i++) {
      if (BASE32.indexOf(str.charAt(i)) === -1) {
          return false;
      }
  }
  return true;
};
