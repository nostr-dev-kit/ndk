var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// node:path
var exports_path = {};
__export(exports_path, {
  sep: () => sep,
  resolve: () => resolve,
  relative: () => relative,
  posix: () => posix,
  parse: () => parse,
  normalize: () => normalize,
  join: () => join,
  isAbsolute: () => isAbsolute,
  format: () => format,
  extname: () => extname,
  dirname: () => dirname,
  delimiter: () => delimiter,
  default: () => path_default,
  basename: () => basename,
  _makeLong: () => _makeLong
});
function assertPath(path) {
  if (typeof path !== "string")
    throw new TypeError("Path must be a string. Received " + JSON.stringify(path));
}
function normalizeStringPosix(path, allowAboveRoot) {
  var res = "", lastSegmentLength = 0, lastSlash = -1, dots = 0, code;
  for (var i = 0;i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47)
      break;
    else
      code = 47;
    if (code === 47) {
      if (lastSlash === i - 1 || dots === 1)
        ;
      else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1)
                res = "", lastSegmentLength = 0;
              else
                res = res.slice(0, lastSlashIndex), lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
              lastSlash = i, dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = "", lastSegmentLength = 0, lastSlash = i, dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += "/..";
          else
            res = "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += "/" + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i, dots = 0;
    } else if (code === 46 && dots !== -1)
      ++dots;
    else
      dots = -1;
  }
  return res;
}
function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root, base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
  if (!dir)
    return base;
  if (dir === pathObject.root)
    return dir + base;
  return dir + sep + base;
}
function resolve() {
  var resolvedPath = "", resolvedAbsolute = false, cwd;
  for (var i = arguments.length - 1;i >= -1 && !resolvedAbsolute; i--) {
    var path;
    if (i >= 0)
      path = arguments[i];
    else {
      if (cwd === undefined)
        cwd = process.cwd();
      path = cwd;
    }
    if (assertPath(path), path.length === 0)
      continue;
    resolvedPath = path + "/" + resolvedPath, resolvedAbsolute = path.charCodeAt(0) === 47;
  }
  if (resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute), resolvedAbsolute)
    if (resolvedPath.length > 0)
      return "/" + resolvedPath;
    else
      return "/";
  else if (resolvedPath.length > 0)
    return resolvedPath;
  else
    return ".";
}
function normalize(path) {
  if (assertPath(path), path.length === 0)
    return ".";
  var isAbsolute = path.charCodeAt(0) === 47, trailingSeparator = path.charCodeAt(path.length - 1) === 47;
  if (path = normalizeStringPosix(path, !isAbsolute), path.length === 0 && !isAbsolute)
    path = ".";
  if (path.length > 0 && trailingSeparator)
    path += "/";
  if (isAbsolute)
    return "/" + path;
  return path;
}
function isAbsolute(path) {
  return assertPath(path), path.length > 0 && path.charCodeAt(0) === 47;
}
function join() {
  if (arguments.length === 0)
    return ".";
  var joined;
  for (var i = 0;i < arguments.length; ++i) {
    var arg = arguments[i];
    if (assertPath(arg), arg.length > 0)
      if (joined === undefined)
        joined = arg;
      else
        joined += "/" + arg;
  }
  if (joined === undefined)
    return ".";
  return normalize(joined);
}
function relative(from, to) {
  if (assertPath(from), assertPath(to), from === to)
    return "";
  if (from = resolve(from), to = resolve(to), from === to)
    return "";
  var fromStart = 1;
  for (;fromStart < from.length; ++fromStart)
    if (from.charCodeAt(fromStart) !== 47)
      break;
  var fromEnd = from.length, fromLen = fromEnd - fromStart, toStart = 1;
  for (;toStart < to.length; ++toStart)
    if (to.charCodeAt(toStart) !== 47)
      break;
  var toEnd = to.length, toLen = toEnd - toStart, length = fromLen < toLen ? fromLen : toLen, lastCommonSep = -1, i = 0;
  for (;i <= length; ++i) {
    if (i === length) {
      if (toLen > length) {
        if (to.charCodeAt(toStart + i) === 47)
          return to.slice(toStart + i + 1);
        else if (i === 0)
          return to.slice(toStart + i);
      } else if (fromLen > length) {
        if (from.charCodeAt(fromStart + i) === 47)
          lastCommonSep = i;
        else if (i === 0)
          lastCommonSep = 0;
      }
      break;
    }
    var fromCode = from.charCodeAt(fromStart + i), toCode = to.charCodeAt(toStart + i);
    if (fromCode !== toCode)
      break;
    else if (fromCode === 47)
      lastCommonSep = i;
  }
  var out = "";
  for (i = fromStart + lastCommonSep + 1;i <= fromEnd; ++i)
    if (i === fromEnd || from.charCodeAt(i) === 47)
      if (out.length === 0)
        out += "..";
      else
        out += "/..";
  if (out.length > 0)
    return out + to.slice(toStart + lastCommonSep);
  else {
    if (toStart += lastCommonSep, to.charCodeAt(toStart) === 47)
      ++toStart;
    return to.slice(toStart);
  }
}
function _makeLong(path) {
  return path;
}
function dirname(path) {
  if (assertPath(path), path.length === 0)
    return ".";
  var code = path.charCodeAt(0), hasRoot = code === 47, end = -1, matchedSlash = true;
  for (var i = path.length - 1;i >= 1; --i)
    if (code = path.charCodeAt(i), code === 47) {
      if (!matchedSlash) {
        end = i;
        break;
      }
    } else
      matchedSlash = false;
  if (end === -1)
    return hasRoot ? "/" : ".";
  if (hasRoot && end === 1)
    return "//";
  return path.slice(0, end);
}
function basename(path, ext) {
  if (ext !== undefined && typeof ext !== "string")
    throw new TypeError('"ext" argument must be a string');
  assertPath(path);
  var start = 0, end = -1, matchedSlash = true, i;
  if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
    if (ext.length === path.length && ext === path)
      return "";
    var extIdx = ext.length - 1, firstNonSlashEnd = -1;
    for (i = path.length - 1;i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else {
        if (firstNonSlashEnd === -1)
          matchedSlash = false, firstNonSlashEnd = i + 1;
        if (extIdx >= 0)
          if (code === ext.charCodeAt(extIdx)) {
            if (--extIdx === -1)
              end = i;
          } else
            extIdx = -1, end = firstNonSlashEnd;
      }
    }
    if (start === end)
      end = firstNonSlashEnd;
    else if (end === -1)
      end = path.length;
    return path.slice(start, end);
  } else {
    for (i = path.length - 1;i >= 0; --i)
      if (path.charCodeAt(i) === 47) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1)
        matchedSlash = false, end = i + 1;
    if (end === -1)
      return "";
    return path.slice(start, end);
  }
}
function extname(path) {
  assertPath(path);
  var startDot = -1, startPart = 0, end = -1, matchedSlash = true, preDotState = 0;
  for (var i = path.length - 1;i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1)
      matchedSlash = false, end = i + 1;
    if (code === 46) {
      if (startDot === -1)
        startDot = i;
      else if (preDotState !== 1)
        preDotState = 1;
    } else if (startDot !== -1)
      preDotState = -1;
  }
  if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
    return "";
  return path.slice(startDot, end);
}
function format(pathObject) {
  if (pathObject === null || typeof pathObject !== "object")
    throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
  return _format("/", pathObject);
}
function parse(path) {
  assertPath(path);
  var ret = { root: "", dir: "", base: "", ext: "", name: "" };
  if (path.length === 0)
    return ret;
  var code = path.charCodeAt(0), isAbsolute2 = code === 47, start;
  if (isAbsolute2)
    ret.root = "/", start = 1;
  else
    start = 0;
  var startDot = -1, startPart = 0, end = -1, matchedSlash = true, i = path.length - 1, preDotState = 0;
  for (;i >= start; --i) {
    if (code = path.charCodeAt(i), code === 47) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1)
      matchedSlash = false, end = i + 1;
    if (code === 46) {
      if (startDot === -1)
        startDot = i;
      else if (preDotState !== 1)
        preDotState = 1;
    } else if (startDot !== -1)
      preDotState = -1;
  }
  if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    if (end !== -1)
      if (startPart === 0 && isAbsolute2)
        ret.base = ret.name = path.slice(1, end);
      else
        ret.base = ret.name = path.slice(startPart, end);
  } else {
    if (startPart === 0 && isAbsolute2)
      ret.name = path.slice(1, startDot), ret.base = path.slice(1, end);
    else
      ret.name = path.slice(startPart, startDot), ret.base = path.slice(startPart, end);
    ret.ext = path.slice(startDot, end);
  }
  if (startPart > 0)
    ret.dir = path.slice(0, startPart - 1);
  else if (isAbsolute2)
    ret.dir = "/";
  return ret;
}
var sep = "/", delimiter = ":", posix, path_default;
var init_path = __esm(() => {
  posix = ((p) => (p.posix = p, p))({ resolve, normalize, isAbsolute, join, relative, _makeLong, dirname, basename, extname, format, parse, sep, delimiter, win32: null, posix: null });
  path_default = posix;
});

// node:buffer
var exports_buffer = {};
__export(exports_buffer, {
  transcode: () => transcode,
  resolveObjectURL: () => resolveObjectURL,
  kStringMaxLength: () => kStringMaxLength,
  kMaxLength: () => kMaxLength,
  isUtf8: () => isUtf8,
  isAscii: () => isAscii,
  default: () => buffer_default,
  constants: () => constants,
  btoa: () => btoa,
  atob: () => atob,
  INSPECT_MAX_BYTES: () => INSPECT_MAX_BYTES,
  File: () => File,
  Buffer: () => Buffer2,
  Blob: () => Blob
});
function getLens(b64) {
  var len2 = b64.length;
  if (len2 % 4 > 0)
    throw new Error("Invalid string. Length must be a multiple of 4");
  var validLen = b64.indexOf("=");
  if (validLen === -1)
    validLen = len2;
  var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
}
function _byteLength(validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
  var tmp, lens = getLens(b64), validLen = lens[0], placeHoldersLen = lens[1], arr = new Uint8Array(_byteLength(validLen, placeHoldersLen)), curByte = 0, len2 = placeHoldersLen > 0 ? validLen - 4 : validLen, i2;
  for (i2 = 0;i2 < len2; i2 += 4)
    tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)], arr[curByte++] = tmp >> 16 & 255, arr[curByte++] = tmp >> 8 & 255, arr[curByte++] = tmp & 255;
  if (placeHoldersLen === 2)
    tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4, arr[curByte++] = tmp & 255;
  if (placeHoldersLen === 1)
    tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2, arr[curByte++] = tmp >> 8 & 255, arr[curByte++] = tmp & 255;
  return arr;
}
function tripletToBase64(num) {
  return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end) {
  var tmp, output = [];
  for (var i2 = start;i2 < end; i2 += 3)
    tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255), output.push(tripletToBase64(tmp));
  return output.join("");
}
function fromByteArray(uint8) {
  var tmp, len2 = uint8.length, extraBytes = len2 % 3, parts = [], maxChunkLength = 16383;
  for (var i2 = 0, len22 = len2 - extraBytes;i2 < len22; i2 += maxChunkLength)
    parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
  if (extraBytes === 1)
    tmp = uint8[len2 - 1], parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
  else if (extraBytes === 2)
    tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1], parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
  return parts.join("");
}
function read(buffer, offset, isLE, mLen, nBytes) {
  var e, m, eLen = nBytes * 8 - mLen - 1, eMax = (1 << eLen) - 1, eBias = eMax >> 1, nBits = -7, i2 = isLE ? nBytes - 1 : 0, d = isLE ? -1 : 1, s = buffer[offset + i2];
  i2 += d, e = s & (1 << -nBits) - 1, s >>= -nBits, nBits += eLen;
  for (;nBits > 0; e = e * 256 + buffer[offset + i2], i2 += d, nBits -= 8)
    ;
  m = e & (1 << -nBits) - 1, e >>= -nBits, nBits += mLen;
  for (;nBits > 0; m = m * 256 + buffer[offset + i2], i2 += d, nBits -= 8)
    ;
  if (e === 0)
    e = 1 - eBias;
  else if (e === eMax)
    return m ? NaN : (s ? -1 : 1) * (1 / 0);
  else
    m = m + Math.pow(2, mLen), e = e - eBias;
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}
function write(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c, eLen = nBytes * 8 - mLen - 1, eMax = (1 << eLen) - 1, eBias = eMax >> 1, rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, i2 = isLE ? 0 : nBytes - 1, d = isLE ? 1 : -1, s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  if (value = Math.abs(value), isNaN(value) || value === 1 / 0)
    m = isNaN(value) ? 1 : 0, e = eMax;
  else {
    if (e = Math.floor(Math.log(value) / Math.LN2), value * (c = Math.pow(2, -e)) < 1)
      e--, c *= 2;
    if (e + eBias >= 1)
      value += rt / c;
    else
      value += rt * Math.pow(2, 1 - eBias);
    if (value * c >= 2)
      e++, c /= 2;
    if (e + eBias >= eMax)
      m = 0, e = eMax;
    else if (e + eBias >= 1)
      m = (value * c - 1) * Math.pow(2, mLen), e = e + eBias;
    else
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen), e = 0;
  }
  for (;mLen >= 8; buffer[offset + i2] = m & 255, i2 += d, m /= 256, mLen -= 8)
    ;
  e = e << mLen | m, eLen += mLen;
  for (;eLen > 0; buffer[offset + i2] = e & 255, i2 += d, e /= 256, eLen -= 8)
    ;
  buffer[offset + i2 - d] |= s * 128;
}
function createBuffer(length) {
  if (length > kMaxLength)
    throw new RangeError('The value "' + length + '" is invalid for option "size"');
  let buf = new Uint8Array(length);
  return Object.setPrototypeOf(buf, Buffer2.prototype), buf;
}
function E(sym, getMessage, Base) {
  return class NodeError extends Base {
    constructor() {
      super();
      Object.defineProperty(this, "message", { value: getMessage.apply(this, arguments), writable: true, configurable: true }), this.name = `${this.name} [${sym}]`, this.stack, delete this.name;
    }
    get code() {
      return sym;
    }
    set code(value) {
      Object.defineProperty(this, "code", { configurable: true, enumerable: true, value, writable: true });
    }
    toString() {
      return `${this.name} [${sym}]: ${this.message}`;
    }
  };
}
function Buffer2(arg, encodingOrOffset, length) {
  if (typeof arg === "number") {
    if (typeof encodingOrOffset === "string")
      throw new TypeError('The "string" argument must be of type string. Received type number');
    return allocUnsafe(arg);
  }
  return from(arg, encodingOrOffset, length);
}
function from(value, encodingOrOffset, length) {
  if (typeof value === "string")
    return fromString(value, encodingOrOffset);
  if (ArrayBuffer.isView(value))
    return fromArrayView(value);
  if (value == null)
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
  if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer))
    return fromArrayBuffer(value, encodingOrOffset, length);
  if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer)))
    return fromArrayBuffer(value, encodingOrOffset, length);
  if (typeof value === "number")
    throw new TypeError('The "value" argument must not be of type number. Received type number');
  let valueOf = value.valueOf && value.valueOf();
  if (valueOf != null && valueOf !== value)
    return Buffer2.from(valueOf, encodingOrOffset, length);
  let b = fromObject(value);
  if (b)
    return b;
  if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function")
    return Buffer2.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
  throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
}
function assertSize(size) {
  if (typeof size !== "number")
    throw new TypeError('"size" argument must be of type number');
  else if (size < 0)
    throw new RangeError('The value "' + size + '" is invalid for option "size"');
}
function alloc(size, fill, encoding) {
  if (assertSize(size), size <= 0)
    return createBuffer(size);
  if (fill !== undefined)
    return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
  return createBuffer(size);
}
function allocUnsafe(size) {
  return assertSize(size), createBuffer(size < 0 ? 0 : checked(size) | 0);
}
function fromString(string, encoding) {
  if (typeof encoding !== "string" || encoding === "")
    encoding = "utf8";
  if (!Buffer2.isEncoding(encoding))
    throw new TypeError("Unknown encoding: " + encoding);
  let length = byteLength(string, encoding) | 0, buf = createBuffer(length), actual = buf.write(string, encoding);
  if (actual !== length)
    buf = buf.slice(0, actual);
  return buf;
}
function fromArrayLike(array) {
  let length = array.length < 0 ? 0 : checked(array.length) | 0, buf = createBuffer(length);
  for (let i2 = 0;i2 < length; i2 += 1)
    buf[i2] = array[i2] & 255;
  return buf;
}
function fromArrayView(arrayView) {
  if (isInstance(arrayView, Uint8Array)) {
    let copy = new Uint8Array(arrayView);
    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
  }
  return fromArrayLike(arrayView);
}
function fromArrayBuffer(array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset)
    throw new RangeError('"offset" is outside of buffer bounds');
  if (array.byteLength < byteOffset + (length || 0))
    throw new RangeError('"length" is outside of buffer bounds');
  let buf;
  if (byteOffset === undefined && length === undefined)
    buf = new Uint8Array(array);
  else if (length === undefined)
    buf = new Uint8Array(array, byteOffset);
  else
    buf = new Uint8Array(array, byteOffset, length);
  return Object.setPrototypeOf(buf, Buffer2.prototype), buf;
}
function fromObject(obj) {
  if (Buffer2.isBuffer(obj)) {
    let len2 = checked(obj.length) | 0, buf = createBuffer(len2);
    if (buf.length === 0)
      return buf;
    return obj.copy(buf, 0, 0, len2), buf;
  }
  if (obj.length !== undefined) {
    if (typeof obj.length !== "number" || Number.isNaN(obj.length))
      return createBuffer(0);
    return fromArrayLike(obj);
  }
  if (obj.type === "Buffer" && Array.isArray(obj.data))
    return fromArrayLike(obj.data);
}
function checked(length) {
  if (length >= kMaxLength)
    throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength.toString(16) + " bytes");
  return length | 0;
}
function byteLength(string, encoding) {
  if (Buffer2.isBuffer(string))
    return string.length;
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer))
    return string.byteLength;
  if (typeof string !== "string")
    throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
  let len2 = string.length, mustMatch = arguments.length > 2 && arguments[2] === true;
  if (!mustMatch && len2 === 0)
    return 0;
  let loweredCase = false;
  for (;; )
    switch (encoding) {
      case "ascii":
      case "latin1":
      case "binary":
        return len2;
      case "utf8":
      case "utf-8":
        return utf8ToBytes(string).length;
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return len2 * 2;
      case "hex":
        return len2 >>> 1;
      case "base64":
        return base64ToBytes(string).length;
      default:
        if (loweredCase)
          return mustMatch ? -1 : utf8ToBytes(string).length;
        encoding = ("" + encoding).toLowerCase(), loweredCase = true;
    }
}
function slowToString(encoding, start, end) {
  let loweredCase = false;
  if (start === undefined || start < 0)
    start = 0;
  if (start > this.length)
    return "";
  if (end === undefined || end > this.length)
    end = this.length;
  if (end <= 0)
    return "";
  if (end >>>= 0, start >>>= 0, end <= start)
    return "";
  if (!encoding)
    encoding = "utf8";
  while (true)
    switch (encoding) {
      case "hex":
        return hexSlice(this, start, end);
      case "utf8":
      case "utf-8":
        return utf8Slice(this, start, end);
      case "ascii":
        return asciiSlice(this, start, end);
      case "latin1":
      case "binary":
        return latin1Slice(this, start, end);
      case "base64":
        return base64Slice(this, start, end);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return utf16leSlice(this, start, end);
      default:
        if (loweredCase)
          throw new TypeError("Unknown encoding: " + encoding);
        encoding = (encoding + "").toLowerCase(), loweredCase = true;
    }
}
function swap(b, n, m) {
  let i2 = b[n];
  b[n] = b[m], b[m] = i2;
}
function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  if (buffer.length === 0)
    return -1;
  if (typeof byteOffset === "string")
    encoding = byteOffset, byteOffset = 0;
  else if (byteOffset > 2147483647)
    byteOffset = 2147483647;
  else if (byteOffset < -2147483648)
    byteOffset = -2147483648;
  if (byteOffset = +byteOffset, Number.isNaN(byteOffset))
    byteOffset = dir ? 0 : buffer.length - 1;
  if (byteOffset < 0)
    byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length)
    if (dir)
      return -1;
    else
      byteOffset = buffer.length - 1;
  else if (byteOffset < 0)
    if (dir)
      byteOffset = 0;
    else
      return -1;
  if (typeof val === "string")
    val = Buffer2.from(val, encoding);
  if (Buffer2.isBuffer(val)) {
    if (val.length === 0)
      return -1;
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === "number") {
    if (val = val & 255, typeof Uint8Array.prototype.indexOf === "function")
      if (dir)
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      else
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }
  throw new TypeError("val must be string, number or Buffer");
}
function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  let indexSize = 1, arrLength = arr.length, valLength = val.length;
  if (encoding !== undefined) {
    if (encoding = String(encoding).toLowerCase(), encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
      if (arr.length < 2 || val.length < 2)
        return -1;
      indexSize = 2, arrLength /= 2, valLength /= 2, byteOffset /= 2;
    }
  }
  function read2(buf, i3) {
    if (indexSize === 1)
      return buf[i3];
    else
      return buf.readUInt16BE(i3 * indexSize);
  }
  let i2;
  if (dir) {
    let foundIndex = -1;
    for (i2 = byteOffset;i2 < arrLength; i2++)
      if (read2(arr, i2) === read2(val, foundIndex === -1 ? 0 : i2 - foundIndex)) {
        if (foundIndex === -1)
          foundIndex = i2;
        if (i2 - foundIndex + 1 === valLength)
          return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1)
          i2 -= i2 - foundIndex;
        foundIndex = -1;
      }
  } else {
    if (byteOffset + valLength > arrLength)
      byteOffset = arrLength - valLength;
    for (i2 = byteOffset;i2 >= 0; i2--) {
      let found = true;
      for (let j = 0;j < valLength; j++)
        if (read2(arr, i2 + j) !== read2(val, j)) {
          found = false;
          break;
        }
      if (found)
        return i2;
    }
  }
  return -1;
}
function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  let remaining = buf.length - offset;
  if (!length)
    length = remaining;
  else if (length = Number(length), length > remaining)
    length = remaining;
  let strLen = string.length;
  if (length > strLen / 2)
    length = strLen / 2;
  let i2;
  for (i2 = 0;i2 < length; ++i2) {
    let parsed = parseInt(string.substr(i2 * 2, 2), 16);
    if (Number.isNaN(parsed))
      return i2;
    buf[offset + i2] = parsed;
  }
  return i2;
}
function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}
function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}
function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}
function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}
function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length)
    return fromByteArray(buf);
  else
    return fromByteArray(buf.slice(start, end));
}
function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  let res = [], i2 = start;
  while (i2 < end) {
    let firstByte = buf[i2], codePoint = null, bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
    if (i2 + bytesPerSequence <= end) {
      let secondByte, thirdByte, fourthByte, tempCodePoint;
      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 128)
            codePoint = firstByte;
          break;
        case 2:
          if (secondByte = buf[i2 + 1], (secondByte & 192) === 128) {
            if (tempCodePoint = (firstByte & 31) << 6 | secondByte & 63, tempCodePoint > 127)
              codePoint = tempCodePoint;
          }
          break;
        case 3:
          if (secondByte = buf[i2 + 1], thirdByte = buf[i2 + 2], (secondByte & 192) === 128 && (thirdByte & 192) === 128) {
            if (tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63, tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343))
              codePoint = tempCodePoint;
          }
          break;
        case 4:
          if (secondByte = buf[i2 + 1], thirdByte = buf[i2 + 2], fourthByte = buf[i2 + 3], (secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
            if (tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63, tempCodePoint > 65535 && tempCodePoint < 1114112)
              codePoint = tempCodePoint;
          }
      }
    }
    if (codePoint === null)
      codePoint = 65533, bytesPerSequence = 1;
    else if (codePoint > 65535)
      codePoint -= 65536, res.push(codePoint >>> 10 & 1023 | 55296), codePoint = 56320 | codePoint & 1023;
    res.push(codePoint), i2 += bytesPerSequence;
  }
  return decodeCodePointsArray(res);
}
function decodeCodePointsArray(codePoints) {
  let len2 = codePoints.length;
  if (len2 <= MAX_ARGUMENTS_LENGTH)
    return String.fromCharCode.apply(String, codePoints);
  let res = "", i2 = 0;
  while (i2 < len2)
    res += String.fromCharCode.apply(String, codePoints.slice(i2, i2 += MAX_ARGUMENTS_LENGTH));
  return res;
}
function asciiSlice(buf, start, end) {
  let ret = "";
  end = Math.min(buf.length, end);
  for (let i2 = start;i2 < end; ++i2)
    ret += String.fromCharCode(buf[i2] & 127);
  return ret;
}
function latin1Slice(buf, start, end) {
  let ret = "";
  end = Math.min(buf.length, end);
  for (let i2 = start;i2 < end; ++i2)
    ret += String.fromCharCode(buf[i2]);
  return ret;
}
function hexSlice(buf, start, end) {
  let len2 = buf.length;
  if (!start || start < 0)
    start = 0;
  if (!end || end < 0 || end > len2)
    end = len2;
  let out = "";
  for (let i2 = start;i2 < end; ++i2)
    out += hexSliceLookupTable[buf[i2]];
  return out;
}
function utf16leSlice(buf, start, end) {
  let bytes = buf.slice(start, end), res = "";
  for (let i2 = 0;i2 < bytes.length - 1; i2 += 2)
    res += String.fromCharCode(bytes[i2] + bytes[i2 + 1] * 256);
  return res;
}
function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0)
    throw new RangeError("offset is not uint");
  if (offset + ext > length)
    throw new RangeError("Trying to access beyond buffer length");
}
function checkInt(buf, value, offset, ext, max, min) {
  if (!Buffer2.isBuffer(buf))
    throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min)
    throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length)
    throw new RangeError("Index out of range");
}
function wrtBigUInt64LE(buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7);
  let lo = Number(value & BigInt(4294967295));
  buf[offset++] = lo, lo = lo >> 8, buf[offset++] = lo, lo = lo >> 8, buf[offset++] = lo, lo = lo >> 8, buf[offset++] = lo;
  let hi = Number(value >> BigInt(32) & BigInt(4294967295));
  return buf[offset++] = hi, hi = hi >> 8, buf[offset++] = hi, hi = hi >> 8, buf[offset++] = hi, hi = hi >> 8, buf[offset++] = hi, offset;
}
function wrtBigUInt64BE(buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7);
  let lo = Number(value & BigInt(4294967295));
  buf[offset + 7] = lo, lo = lo >> 8, buf[offset + 6] = lo, lo = lo >> 8, buf[offset + 5] = lo, lo = lo >> 8, buf[offset + 4] = lo;
  let hi = Number(value >> BigInt(32) & BigInt(4294967295));
  return buf[offset + 3] = hi, hi = hi >> 8, buf[offset + 2] = hi, hi = hi >> 8, buf[offset + 1] = hi, hi = hi >> 8, buf[offset] = hi, offset + 8;
}
function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length)
    throw new RangeError("Index out of range");
  if (offset < 0)
    throw new RangeError("Index out of range");
}
function writeFloat(buf, value, offset, littleEndian, noAssert) {
  if (value = +value, offset = offset >>> 0, !noAssert)
    checkIEEE754(buf, value, offset, 4, 340282346638528860000000000000000000000, -340282346638528860000000000000000000000);
  return write(buf, value, offset, littleEndian, 23, 4), offset + 4;
}
function writeDouble(buf, value, offset, littleEndian, noAssert) {
  if (value = +value, offset = offset >>> 0, !noAssert)
    checkIEEE754(buf, value, offset, 8, 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000);
  return write(buf, value, offset, littleEndian, 52, 8), offset + 8;
}
function addNumericalSeparator(val) {
  let res = "", i2 = val.length, start = val[0] === "-" ? 1 : 0;
  for (;i2 >= start + 4; i2 -= 3)
    res = `_${val.slice(i2 - 3, i2)}${res}`;
  return `${val.slice(0, i2)}${res}`;
}
function checkBounds(buf, offset, byteLength2) {
  if (validateNumber(offset, "offset"), buf[offset] === undefined || buf[offset + byteLength2] === undefined)
    boundsError(offset, buf.length - (byteLength2 + 1));
}
function checkIntBI(value, min, max, buf, offset, byteLength2) {
  if (value > max || value < min) {
    let n = typeof min === "bigint" ? "n" : "", range;
    if (byteLength2 > 3)
      if (min === 0 || min === BigInt(0))
        range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
      else
        range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
    else
      range = `>= ${min}${n} and <= ${max}${n}`;
    throw new ERR_OUT_OF_RANGE("value", range, value);
  }
  checkBounds(buf, offset, byteLength2);
}
function validateNumber(value, name) {
  if (typeof value !== "number")
    throw new ERR_INVALID_ARG_TYPE(name, "number", value);
}
function boundsError(value, length, type) {
  if (Math.floor(value) !== value)
    throw validateNumber(value, type), new ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
  if (length < 0)
    throw new ERR_BUFFER_OUT_OF_BOUNDS;
  throw new ERR_OUT_OF_RANGE(type || "offset", `>= ${type ? 1 : 0} and <= ${length}`, value);
}
function base64clean(str) {
  if (str = str.split("=")[0], str = str.trim().replace(INVALID_BASE64_RE, ""), str.length < 2)
    return "";
  while (str.length % 4 !== 0)
    str = str + "=";
  return str;
}
function utf8ToBytes(string, units) {
  units = units || 1 / 0;
  let codePoint, length = string.length, leadSurrogate = null, bytes = [];
  for (let i2 = 0;i2 < length; ++i2) {
    if (codePoint = string.charCodeAt(i2), codePoint > 55295 && codePoint < 57344) {
      if (!leadSurrogate) {
        if (codePoint > 56319) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          continue;
        } else if (i2 + 1 === length) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          continue;
        }
        leadSurrogate = codePoint;
        continue;
      }
      if (codePoint < 56320) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
        leadSurrogate = codePoint;
        continue;
      }
      codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
    } else if (leadSurrogate) {
      if ((units -= 3) > -1)
        bytes.push(239, 191, 189);
    }
    if (leadSurrogate = null, codePoint < 128) {
      if ((units -= 1) < 0)
        break;
      bytes.push(codePoint);
    } else if (codePoint < 2048) {
      if ((units -= 2) < 0)
        break;
      bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
    } else if (codePoint < 65536) {
      if ((units -= 3) < 0)
        break;
      bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
    } else if (codePoint < 1114112) {
      if ((units -= 4) < 0)
        break;
      bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
    } else
      throw new Error("Invalid code point");
  }
  return bytes;
}
function asciiToBytes(str) {
  let byteArray = [];
  for (let i2 = 0;i2 < str.length; ++i2)
    byteArray.push(str.charCodeAt(i2) & 255);
  return byteArray;
}
function utf16leToBytes(str, units) {
  let c, hi, lo, byteArray = [];
  for (let i2 = 0;i2 < str.length; ++i2) {
    if ((units -= 2) < 0)
      break;
    c = str.charCodeAt(i2), hi = c >> 8, lo = c % 256, byteArray.push(lo), byteArray.push(hi);
  }
  return byteArray;
}
function base64ToBytes(str) {
  return toByteArray(base64clean(str));
}
function blitBuffer(src, dst, offset, length) {
  let i2;
  for (i2 = 0;i2 < length; ++i2) {
    if (i2 + offset >= dst.length || i2 >= src.length)
      break;
    dst[i2 + offset] = src[i2];
  }
  return i2;
}
function isInstance(obj, type) {
  return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
}
function defineBigIntMethod(fn) {
  return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
}
function BufferBigIntNotDefined() {
  throw new Error("BigInt not supported");
}
function notimpl(name) {
  return () => {
    throw new Error(name + " is not implemented for node:buffer browser polyfill");
  };
}
var lookup, revLookup, code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", i, len, customInspectSymbol, INSPECT_MAX_BYTES = 50, kMaxLength = 2147483647, kStringMaxLength = 536870888, btoa, atob, File, Blob, constants, ERR_BUFFER_OUT_OF_BOUNDS, ERR_INVALID_ARG_TYPE, ERR_OUT_OF_RANGE, MAX_ARGUMENTS_LENGTH = 4096, INVALID_BASE64_RE, hexSliceLookupTable, resolveObjectURL, isUtf8, isAscii = (str) => {
  for (let char of str)
    if (char.charCodeAt(0) > 127)
      return false;
  return true;
}, transcode, buffer_default;
var init_buffer = __esm(() => {
  lookup = [];
  revLookup = [];
  for (i = 0, len = code.length;i < len; ++i)
    lookup[i] = code[i], revLookup[code.charCodeAt(i)] = i;
  revLookup[45] = 62;
  revLookup[95] = 63;
  customInspectSymbol = typeof Symbol === "function" && typeof Symbol.for === "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  btoa = globalThis.btoa;
  atob = globalThis.atob;
  File = globalThis.File;
  Blob = globalThis.Blob;
  constants = { MAX_LENGTH: kMaxLength, MAX_STRING_LENGTH: kStringMaxLength };
  ERR_BUFFER_OUT_OF_BOUNDS = E("ERR_BUFFER_OUT_OF_BOUNDS", function(name) {
    if (name)
      return `${name} is outside of buffer bounds`;
    return "Attempt to access memory outside buffer bounds";
  }, RangeError);
  ERR_INVALID_ARG_TYPE = E("ERR_INVALID_ARG_TYPE", function(name, actual) {
    return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
  }, TypeError);
  ERR_OUT_OF_RANGE = E("ERR_OUT_OF_RANGE", function(str, range, input) {
    let msg = `The value of "${str}" is out of range.`, received = input;
    if (Number.isInteger(input) && Math.abs(input) > 4294967296)
      received = addNumericalSeparator(String(input));
    else if (typeof input === "bigint") {
      if (received = String(input), input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32)))
        received = addNumericalSeparator(received);
      received += "n";
    }
    return msg += ` It must be ${range}. Received ${received}`, msg;
  }, RangeError);
  Object.defineProperty(Buffer2.prototype, "parent", { enumerable: true, get: function() {
    if (!Buffer2.isBuffer(this))
      return;
    return this.buffer;
  } });
  Object.defineProperty(Buffer2.prototype, "offset", { enumerable: true, get: function() {
    if (!Buffer2.isBuffer(this))
      return;
    return this.byteOffset;
  } });
  Buffer2.poolSize = 8192;
  Buffer2.from = function(value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length);
  };
  Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
  Object.setPrototypeOf(Buffer2, Uint8Array);
  Buffer2.alloc = function(size, fill, encoding) {
    return alloc(size, fill, encoding);
  };
  Buffer2.allocUnsafe = function(size) {
    return allocUnsafe(size);
  };
  Buffer2.allocUnsafeSlow = function(size) {
    return allocUnsafe(size);
  };
  Buffer2.isBuffer = function isBuffer(b) {
    return b != null && b._isBuffer === true && b !== Buffer2.prototype;
  };
  Buffer2.compare = function compare(a, b) {
    if (isInstance(a, Uint8Array))
      a = Buffer2.from(a, a.offset, a.byteLength);
    if (isInstance(b, Uint8Array))
      b = Buffer2.from(b, b.offset, b.byteLength);
    if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b))
      throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    if (a === b)
      return 0;
    let x = a.length, y = b.length;
    for (let i2 = 0, len2 = Math.min(x, y);i2 < len2; ++i2)
      if (a[i2] !== b[i2]) {
        x = a[i2], y = b[i2];
        break;
      }
    if (x < y)
      return -1;
    if (y < x)
      return 1;
    return 0;
  };
  Buffer2.isEncoding = function isEncoding(encoding) {
    switch (String(encoding).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  };
  Buffer2.concat = function concat(list, length) {
    if (!Array.isArray(list))
      throw new TypeError('"list" argument must be an Array of Buffers');
    if (list.length === 0)
      return Buffer2.alloc(0);
    let i2;
    if (length === undefined) {
      length = 0;
      for (i2 = 0;i2 < list.length; ++i2)
        length += list[i2].length;
    }
    let buffer = Buffer2.allocUnsafe(length), pos = 0;
    for (i2 = 0;i2 < list.length; ++i2) {
      let buf = list[i2];
      if (isInstance(buf, Uint8Array))
        if (pos + buf.length > buffer.length) {
          if (!Buffer2.isBuffer(buf))
            buf = Buffer2.from(buf);
          buf.copy(buffer, pos);
        } else
          Uint8Array.prototype.set.call(buffer, buf, pos);
      else if (!Buffer2.isBuffer(buf))
        throw new TypeError('"list" argument must be an Array of Buffers');
      else
        buf.copy(buffer, pos);
      pos += buf.length;
    }
    return buffer;
  };
  Buffer2.byteLength = byteLength;
  Buffer2.prototype._isBuffer = true;
  Buffer2.prototype.swap16 = function swap16() {
    let len2 = this.length;
    if (len2 % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let i2 = 0;i2 < len2; i2 += 2)
      swap(this, i2, i2 + 1);
    return this;
  };
  Buffer2.prototype.swap32 = function swap32() {
    let len2 = this.length;
    if (len2 % 4 !== 0)
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let i2 = 0;i2 < len2; i2 += 4)
      swap(this, i2, i2 + 3), swap(this, i2 + 1, i2 + 2);
    return this;
  };
  Buffer2.prototype.swap64 = function swap64() {
    let len2 = this.length;
    if (len2 % 8 !== 0)
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (let i2 = 0;i2 < len2; i2 += 8)
      swap(this, i2, i2 + 7), swap(this, i2 + 1, i2 + 6), swap(this, i2 + 2, i2 + 5), swap(this, i2 + 3, i2 + 4);
    return this;
  };
  Buffer2.prototype.toString = function toString() {
    let length = this.length;
    if (length === 0)
      return "";
    if (arguments.length === 0)
      return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
  };
  Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
  Buffer2.prototype.equals = function equals(b) {
    if (!Buffer2.isBuffer(b))
      throw new TypeError("Argument must be a Buffer");
    if (this === b)
      return true;
    return Buffer2.compare(this, b) === 0;
  };
  Buffer2.prototype.inspect = function inspect() {
    let str = "", max = INSPECT_MAX_BYTES;
    if (str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim(), this.length > max)
      str += " ... ";
    return "<Buffer " + str + ">";
  };
  if (customInspectSymbol)
    Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
  Buffer2.prototype.compare = function compare2(target, start, end, thisStart, thisEnd) {
    if (isInstance(target, Uint8Array))
      target = Buffer2.from(target, target.offset, target.byteLength);
    if (!Buffer2.isBuffer(target))
      throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
    if (start === undefined)
      start = 0;
    if (end === undefined)
      end = target ? target.length : 0;
    if (thisStart === undefined)
      thisStart = 0;
    if (thisEnd === undefined)
      thisEnd = this.length;
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length)
      throw new RangeError("out of range index");
    if (thisStart >= thisEnd && start >= end)
      return 0;
    if (thisStart >= thisEnd)
      return -1;
    if (start >= end)
      return 1;
    if (start >>>= 0, end >>>= 0, thisStart >>>= 0, thisEnd >>>= 0, this === target)
      return 0;
    let x = thisEnd - thisStart, y = end - start, len2 = Math.min(x, y), thisCopy = this.slice(thisStart, thisEnd), targetCopy = target.slice(start, end);
    for (let i2 = 0;i2 < len2; ++i2)
      if (thisCopy[i2] !== targetCopy[i2]) {
        x = thisCopy[i2], y = targetCopy[i2];
        break;
      }
    if (x < y)
      return -1;
    if (y < x)
      return 1;
    return 0;
  };
  Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
  };
  Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
  };
  Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
  };
  Buffer2.prototype.write = function write2(string, offset, length, encoding) {
    if (offset === undefined)
      encoding = "utf8", length = this.length, offset = 0;
    else if (length === undefined && typeof offset === "string")
      encoding = offset, length = this.length, offset = 0;
    else if (isFinite(offset))
      if (offset = offset >>> 0, isFinite(length)) {
        if (length = length >>> 0, encoding === undefined)
          encoding = "utf8";
      } else
        encoding = length, length = undefined;
    else
      throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    let remaining = this.length - offset;
    if (length === undefined || length > remaining)
      length = remaining;
    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length)
      throw new RangeError("Attempt to write outside buffer bounds");
    if (!encoding)
      encoding = "utf8";
    let loweredCase = false;
    for (;; )
      switch (encoding) {
        case "hex":
          return hexWrite(this, string, offset, length);
        case "utf8":
        case "utf-8":
          return utf8Write(this, string, offset, length);
        case "ascii":
        case "latin1":
        case "binary":
          return asciiWrite(this, string, offset, length);
        case "base64":
          return base64Write(this, string, offset, length);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return ucs2Write(this, string, offset, length);
        default:
          if (loweredCase)
            throw new TypeError("Unknown encoding: " + encoding);
          encoding = ("" + encoding).toLowerCase(), loweredCase = true;
      }
  };
  Buffer2.prototype.toJSON = function toJSON() {
    return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
  };
  Buffer2.prototype.slice = function slice(start, end) {
    let len2 = this.length;
    if (start = ~~start, end = end === undefined ? len2 : ~~end, start < 0) {
      if (start += len2, start < 0)
        start = 0;
    } else if (start > len2)
      start = len2;
    if (end < 0) {
      if (end += len2, end < 0)
        end = 0;
    } else if (end > len2)
      end = len2;
    if (end < start)
      end = start;
    let newBuf = this.subarray(start, end);
    return Object.setPrototypeOf(newBuf, Buffer2.prototype), newBuf;
  };
  Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
    if (offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert)
      checkOffset(offset, byteLength2, this.length);
    let val = this[offset], mul = 1, i2 = 0;
    while (++i2 < byteLength2 && (mul *= 256))
      val += this[offset + i2] * mul;
    return val;
  };
  Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
    if (offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert)
      checkOffset(offset, byteLength2, this.length);
    let val = this[offset + --byteLength2], mul = 1;
    while (byteLength2 > 0 && (mul *= 256))
      val += this[offset + --byteLength2] * mul;
    return val;
  };
  Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 1, this.length);
    return this[offset];
  };
  Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] | this[offset + 1] << 8;
  };
  Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] << 8 | this[offset + 1];
  };
  Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
  };
  Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
  };
  Buffer2.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
    offset = offset >>> 0, validateNumber(offset, "offset");
    let first = this[offset], last = this[offset + 7];
    if (first === undefined || last === undefined)
      boundsError(offset, this.length - 8);
    let lo = first + this[++offset] * 256 + this[++offset] * 65536 + this[++offset] * 16777216, hi = this[++offset] + this[++offset] * 256 + this[++offset] * 65536 + last * 16777216;
    return BigInt(lo) + (BigInt(hi) << BigInt(32));
  });
  Buffer2.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
    offset = offset >>> 0, validateNumber(offset, "offset");
    let first = this[offset], last = this[offset + 7];
    if (first === undefined || last === undefined)
      boundsError(offset, this.length - 8);
    let hi = first * 16777216 + this[++offset] * 65536 + this[++offset] * 256 + this[++offset], lo = this[++offset] * 16777216 + this[++offset] * 65536 + this[++offset] * 256 + last;
    return (BigInt(hi) << BigInt(32)) + BigInt(lo);
  });
  Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
    if (offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert)
      checkOffset(offset, byteLength2, this.length);
    let val = this[offset], mul = 1, i2 = 0;
    while (++i2 < byteLength2 && (mul *= 256))
      val += this[offset + i2] * mul;
    if (mul *= 128, val >= mul)
      val -= Math.pow(2, 8 * byteLength2);
    return val;
  };
  Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
    if (offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert)
      checkOffset(offset, byteLength2, this.length);
    let i2 = byteLength2, mul = 1, val = this[offset + --i2];
    while (i2 > 0 && (mul *= 256))
      val += this[offset + --i2] * mul;
    if (mul *= 128, val >= mul)
      val -= Math.pow(2, 8 * byteLength2);
    return val;
  };
  Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 1, this.length);
    if (!(this[offset] & 128))
      return this[offset];
    return (255 - this[offset] + 1) * -1;
  };
  Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 2, this.length);
    let val = this[offset] | this[offset + 1] << 8;
    return val & 32768 ? val | 4294901760 : val;
  };
  Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 2, this.length);
    let val = this[offset + 1] | this[offset] << 8;
    return val & 32768 ? val | 4294901760 : val;
  };
  Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
  };
  Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
  };
  Buffer2.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
    offset = offset >>> 0, validateNumber(offset, "offset");
    let first = this[offset], last = this[offset + 7];
    if (first === undefined || last === undefined)
      boundsError(offset, this.length - 8);
    let val = this[offset + 4] + this[offset + 5] * 256 + this[offset + 6] * 65536 + (last << 24);
    return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 256 + this[++offset] * 65536 + this[++offset] * 16777216);
  });
  Buffer2.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
    offset = offset >>> 0, validateNumber(offset, "offset");
    let first = this[offset], last = this[offset + 7];
    if (first === undefined || last === undefined)
      boundsError(offset, this.length - 8);
    let val = (first << 24) + this[++offset] * 65536 + this[++offset] * 256 + this[++offset];
    return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 16777216 + this[++offset] * 65536 + this[++offset] * 256 + last);
  });
  Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 4, this.length);
    return read(this, offset, true, 23, 4);
  };
  Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 4, this.length);
    return read(this, offset, false, 23, 4);
  };
  Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 8, this.length);
    return read(this, offset, true, 52, 8);
  };
  Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    if (offset = offset >>> 0, !noAssert)
      checkOffset(offset, 8, this.length);
    return read(this, offset, false, 52, 8);
  };
  Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
    if (value = +value, offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert) {
      let maxBytes = Math.pow(2, 8 * byteLength2) - 1;
      checkInt(this, value, offset, byteLength2, maxBytes, 0);
    }
    let mul = 1, i2 = 0;
    this[offset] = value & 255;
    while (++i2 < byteLength2 && (mul *= 256))
      this[offset + i2] = value / mul & 255;
    return offset + byteLength2;
  };
  Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
    if (value = +value, offset = offset >>> 0, byteLength2 = byteLength2 >>> 0, !noAssert) {
      let maxBytes = Math.pow(2, 8 * byteLength2) - 1;
      checkInt(this, value, offset, byteLength2, maxBytes, 0);
    }
    let i2 = byteLength2 - 1, mul = 1;
    this[offset + i2] = value & 255;
    while (--i2 >= 0 && (mul *= 256))
      this[offset + i2] = value / mul & 255;
    return offset + byteLength2;
  };
  Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert)
      checkInt(this, value, offset, 1, 255, 0);
    return this[offset] = value & 255, offset + 1;
  };
  Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert)
      checkInt(this, value, offset, 2, 65535, 0);
    return this[offset] = value & 255, this[offset + 1] = value >>> 8, offset + 2;
  };
  Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert)
      checkInt(this, value, offset, 2, 65535, 0);
    return this[offset] = value >>> 8, this[offset + 1] = value & 255, offset + 2;
  };
  Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert)
      checkInt(this, value, offset, 4, 4294967295, 0);
    return this[offset + 3] = value >>> 24, this[offset + 2] = value >>> 16, this[offset + 1] = value >>> 8, this[offset] = value & 255, offset + 4;
  };
  Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert)
      checkInt(this, value, offset, 4, 4294967295, 0);
    return this[offset] = value >>> 24, this[offset + 1] = value >>> 16, this[offset + 2] = value >>> 8, this[offset + 3] = value & 255, offset + 4;
  };
  Buffer2.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
    return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  Buffer2.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
    return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert) {
      let limit = Math.pow(2, 8 * byteLength2 - 1);
      checkInt(this, value, offset, byteLength2, limit - 1, -limit);
    }
    let i2 = 0, mul = 1, sub = 0;
    this[offset] = value & 255;
    while (++i2 < byteLength2 && (mul *= 256)) {
      if (value < 0 && sub === 0 && this[offset + i2 - 1] !== 0)
        sub = 1;
      this[offset + i2] = (value / mul >> 0) - sub & 255;
    }
    return offset + byteLength2;
  };
  Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert) {
      let limit = Math.pow(2, 8 * byteLength2 - 1);
      checkInt(this, value, offset, byteLength2, limit - 1, -limit);
    }
    let i2 = byteLength2 - 1, mul = 1, sub = 0;
    this[offset + i2] = value & 255;
    while (--i2 >= 0 && (mul *= 256)) {
      if (value < 0 && sub === 0 && this[offset + i2 + 1] !== 0)
        sub = 1;
      this[offset + i2] = (value / mul >> 0) - sub & 255;
    }
    return offset + byteLength2;
  };
  Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert)
      checkInt(this, value, offset, 1, 127, -128);
    if (value < 0)
      value = 255 + value + 1;
    return this[offset] = value & 255, offset + 1;
  };
  Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert)
      checkInt(this, value, offset, 2, 32767, -32768);
    return this[offset] = value & 255, this[offset + 1] = value >>> 8, offset + 2;
  };
  Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert)
      checkInt(this, value, offset, 2, 32767, -32768);
    return this[offset] = value >>> 8, this[offset + 1] = value & 255, offset + 2;
  };
  Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert)
      checkInt(this, value, offset, 4, 2147483647, -2147483648);
    return this[offset] = value & 255, this[offset + 1] = value >>> 8, this[offset + 2] = value >>> 16, this[offset + 3] = value >>> 24, offset + 4;
  };
  Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    if (value = +value, offset = offset >>> 0, !noAssert)
      checkInt(this, value, offset, 4, 2147483647, -2147483648);
    if (value < 0)
      value = 4294967295 + value + 1;
    return this[offset] = value >>> 24, this[offset + 1] = value >>> 16, this[offset + 2] = value >>> 8, this[offset + 3] = value & 255, offset + 4;
  };
  Buffer2.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
    return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  Buffer2.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
    return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
  };
  Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
  };
  Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
  };
  Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
  };
  Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
    if (!Buffer2.isBuffer(target))
      throw new TypeError("argument should be a Buffer");
    if (!start)
      start = 0;
    if (!end && end !== 0)
      end = this.length;
    if (targetStart >= target.length)
      targetStart = target.length;
    if (!targetStart)
      targetStart = 0;
    if (end > 0 && end < start)
      end = start;
    if (end === start)
      return 0;
    if (target.length === 0 || this.length === 0)
      return 0;
    if (targetStart < 0)
      throw new RangeError("targetStart out of bounds");
    if (start < 0 || start >= this.length)
      throw new RangeError("Index out of range");
    if (end < 0)
      throw new RangeError("sourceEnd out of bounds");
    if (end > this.length)
      end = this.length;
    if (target.length - targetStart < end - start)
      end = target.length - targetStart + start;
    let len2 = end - start;
    if (this === target && typeof Uint8Array.prototype.copyWithin === "function")
      this.copyWithin(targetStart, start, end);
    else
      Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
    return len2;
  };
  Buffer2.prototype.fill = function fill(val, start, end, encoding) {
    if (typeof val === "string") {
      if (typeof start === "string")
        encoding = start, start = 0, end = this.length;
      else if (typeof end === "string")
        encoding = end, end = this.length;
      if (encoding !== undefined && typeof encoding !== "string")
        throw new TypeError("encoding must be a string");
      if (typeof encoding === "string" && !Buffer2.isEncoding(encoding))
        throw new TypeError("Unknown encoding: " + encoding);
      if (val.length === 1) {
        let code2 = val.charCodeAt(0);
        if (encoding === "utf8" && code2 < 128 || encoding === "latin1")
          val = code2;
      }
    } else if (typeof val === "number")
      val = val & 255;
    else if (typeof val === "boolean")
      val = Number(val);
    if (start < 0 || this.length < start || this.length < end)
      throw new RangeError("Out of range index");
    if (end <= start)
      return this;
    if (start = start >>> 0, end = end === undefined ? this.length : end >>> 0, !val)
      val = 0;
    let i2;
    if (typeof val === "number")
      for (i2 = start;i2 < end; ++i2)
        this[i2] = val;
    else {
      let bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding), len2 = bytes.length;
      if (len2 === 0)
        throw new TypeError('The value "' + val + '" is invalid for argument "value"');
      for (i2 = 0;i2 < end - start; ++i2)
        this[i2 + start] = bytes[i2 % len2];
    }
    return this;
  };
  INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
  hexSliceLookupTable = function() {
    let table = new Array(256);
    for (let i2 = 0;i2 < 16; ++i2) {
      let i16 = i2 * 16;
      for (let j = 0;j < 16; ++j)
        table[i16 + j] = "0123456789abcdef"[i2] + "0123456789abcdef"[j];
    }
    return table;
  }();
  resolveObjectURL = notimpl("resolveObjectURL");
  isUtf8 = notimpl("isUtf8");
  transcode = notimpl("transcode");
  buffer_default = Buffer2;
});

// node:util
var exports_util = {};
__export(exports_util, {
  types: () => types,
  promisify: () => promisify,
  log: () => log,
  isUndefined: () => isUndefined,
  isSymbol: () => isSymbol,
  isString: () => isString,
  isRegExp: () => isRegExp,
  isPrimitive: () => isPrimitive,
  isObject: () => isObject,
  isNumber: () => isNumber,
  isNullOrUndefined: () => isNullOrUndefined,
  isNull: () => isNull,
  isFunction: () => isFunction,
  isError: () => isError,
  isDate: () => isDate,
  isBuffer: () => isBuffer2,
  isBoolean: () => isBoolean,
  isArray: () => isArray,
  inspect: () => inspect2,
  inherits: () => inherits,
  format: () => format2,
  deprecate: () => deprecate,
  default: () => util_default,
  debuglog: () => debuglog,
  callbackifyOnRejected: () => callbackifyOnRejected,
  callbackify: () => callbackify,
  _extend: () => _extend,
  TextEncoder: () => TextEncoder,
  TextDecoder: () => TextDecoder2
});
function format2(f, ...args) {
  if (!isString(f)) {
    var objects = [f];
    for (var i2 = 0;i2 < args.length; i2++)
      objects.push(inspect2(args[i2]));
    return objects.join(" ");
  }
  var i2 = 0, len2 = args.length, str = String(f).replace(formatRegExp, function(x2) {
    if (x2 === "%%")
      return "%";
    if (i2 >= len2)
      return x2;
    switch (x2) {
      case "%s":
        return String(args[i2++]);
      case "%d":
        return Number(args[i2++]);
      case "%j":
        try {
          return JSON.stringify(args[i2++]);
        } catch (_) {
          return "[Circular]";
        }
      default:
        return x2;
    }
  });
  for (var x = args[i2];i2 < len2; x = args[++i2])
    if (isNull(x) || !isObject(x))
      str += " " + x;
    else
      str += " " + inspect2(x);
  return str;
}
function deprecate(fn, msg) {
  if (typeof process === "undefined" || process?.noDeprecation === true)
    return fn;
  var warned = false;
  function deprecated(...args) {
    if (!warned) {
      if (process.throwDeprecation)
        throw new Error(msg);
      else if (process.traceDeprecation)
        console.trace(msg);
      else
        console.error(msg);
      warned = true;
    }
    return fn.apply(this, ...args);
  }
  return deprecated;
}
function stylizeWithColor(str, styleType) {
  var style = inspect2.styles[styleType];
  if (style)
    return "\x1B[" + inspect2.colors[style][0] + "m" + str + "\x1B[" + inspect2.colors[style][1] + "m";
  else
    return str;
}
function stylizeNoColor(str, styleType) {
  return str;
}
function arrayToHash(array) {
  var hash = {};
  return array.forEach(function(val, idx) {
    hash[val] = true;
  }), hash;
}
function formatValue(ctx, value, recurseTimes) {
  if (ctx.customInspect && value && isFunction(value.inspect) && value.inspect !== inspect2 && !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret))
      ret = formatValue(ctx, ret, recurseTimes);
    return ret;
  }
  var primitive = formatPrimitive(ctx, value);
  if (primitive)
    return primitive;
  var keys = Object.keys(value), visibleKeys = arrayToHash(keys);
  if (ctx.showHidden)
    keys = Object.getOwnPropertyNames(value);
  if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0))
    return formatError(value);
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ": " + value.name : "";
      return ctx.stylize("[Function" + name + "]", "special");
    }
    if (isRegExp(value))
      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
    if (isDate(value))
      return ctx.stylize(Date.prototype.toString.call(value), "date");
    if (isError(value))
      return formatError(value);
  }
  var base = "", array = false, braces = ["{", "}"];
  if (isArray(value))
    array = true, braces = ["[", "]"];
  if (isFunction(value)) {
    var n = value.name ? ": " + value.name : "";
    base = " [Function" + n + "]";
  }
  if (isRegExp(value))
    base = " " + RegExp.prototype.toString.call(value);
  if (isDate(value))
    base = " " + Date.prototype.toUTCString.call(value);
  if (isError(value))
    base = " " + formatError(value);
  if (keys.length === 0 && (!array || value.length == 0))
    return braces[0] + base + braces[1];
  if (recurseTimes < 0)
    if (isRegExp(value))
      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
    else
      return ctx.stylize("[Object]", "special");
  ctx.seen.push(value);
  var output;
  if (array)
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  else
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  return ctx.seen.pop(), reduceToSingleString(output, base, braces);
}
function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize("undefined", "undefined");
  if (isString(value)) {
    var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
    return ctx.stylize(simple, "string");
  }
  if (isNumber(value))
    return ctx.stylize("" + value, "number");
  if (isBoolean(value))
    return ctx.stylize("" + value, "boolean");
  if (isNull(value))
    return ctx.stylize("null", "null");
}
function formatError(value) {
  return "[" + Error.prototype.toString.call(value) + "]";
}
function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i2 = 0, l = value.length;i2 < l; ++i2)
    if (hasOwnProperty(value, String(i2)))
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i2), true));
    else
      output.push("");
  return keys.forEach(function(key) {
    if (!key.match(/^\d+$/))
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
  }), output;
}
function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  if (desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] }, desc.get)
    if (desc.set)
      str = ctx.stylize("[Getter/Setter]", "special");
    else
      str = ctx.stylize("[Getter]", "special");
  else if (desc.set)
    str = ctx.stylize("[Setter]", "special");
  if (!hasOwnProperty(visibleKeys, key))
    name = "[" + key + "]";
  if (!str)
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes))
        str = formatValue(ctx, desc.value, null);
      else
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      if (str.indexOf(`
`) > -1)
        if (array)
          str = str.split(`
`).map(function(line) {
            return "  " + line;
          }).join(`
`).slice(2);
        else
          str = `
` + str.split(`
`).map(function(line) {
            return "   " + line;
          }).join(`
`);
    } else
      str = ctx.stylize("[Circular]", "special");
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/))
      return str;
    if (name = JSON.stringify("" + key), name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/))
      name = name.slice(1, -1), name = ctx.stylize(name, "name");
    else
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), name = ctx.stylize(name, "string");
  }
  return name + ": " + str;
}
function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0, length = output.reduce(function(prev, cur) {
    if (numLinesEst++, cur.indexOf(`
`) >= 0)
      numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
  }, 0);
  if (length > 60)
    return braces[0] + (base === "" ? "" : base + `
 `) + " " + output.join(`,
  `) + " " + braces[1];
  return braces[0] + base + " " + output.join(", ") + " " + braces[1];
}
function isArray(ar) {
  return Array.isArray(ar);
}
function isBoolean(arg) {
  return typeof arg === "boolean";
}
function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return arg == null;
}
function isNumber(arg) {
  return typeof arg === "number";
}
function isString(arg) {
  return typeof arg === "string";
}
function isSymbol(arg) {
  return typeof arg === "symbol";
}
function isUndefined(arg) {
  return arg === undefined;
}
function isRegExp(re) {
  return isObject(re) && objectToString(re) === "[object RegExp]";
}
function isObject(arg) {
  return typeof arg === "object" && arg !== null;
}
function isDate(d) {
  return isObject(d) && objectToString(d) === "[object Date]";
}
function isError(e) {
  return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
}
function isFunction(arg) {
  return typeof arg === "function";
}
function isPrimitive(arg) {
  return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || typeof arg === "undefined";
}
function isBuffer2(arg) {
  return arg instanceof Buffer;
}
function objectToString(o) {
  return Object.prototype.toString.call(o);
}
function pad(n) {
  return n < 10 ? "0" + n.toString(10) : n.toString(10);
}
function timestamp() {
  var d = new Date, time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(":");
  return [d.getDate(), months[d.getMonth()], time].join(" ");
}
function log(...args) {
  console.log("%s - %s", timestamp(), format2.apply(null, args));
}
function inherits(ctor, superCtor) {
  if (superCtor)
    ctor.super_ = superCtor, ctor.prototype = Object.create(superCtor.prototype, { constructor: { value: ctor, enumerable: false, writable: true, configurable: true } });
}
function _extend(origin, add) {
  if (!add || !isObject(add))
    return origin;
  var keys = Object.keys(add), i2 = keys.length;
  while (i2--)
    origin[keys[i2]] = add[keys[i2]];
  return origin;
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
function callbackifyOnRejected(reason, cb) {
  if (!reason) {
    var newReason = new Error("Promise was rejected with a falsy value");
    newReason.reason = reason, reason = newReason;
  }
  return cb(reason);
}
function callbackify(original) {
  if (typeof original !== "function")
    throw new TypeError('The "original" argument must be of type Function');
  function callbackified(...args) {
    var maybeCb = args.pop();
    if (typeof maybeCb !== "function")
      throw new TypeError("The last argument must be of type Function");
    var self2 = this, cb = function(...args2) {
      return maybeCb.apply(self2, ...args2);
    };
    original.apply(this, args).then(function(ret) {
      process.nextTick(cb.bind(null, null, ret));
    }, function(rej) {
      process.nextTick(callbackifyOnRejected.bind(null, rej, cb));
    });
  }
  return Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original)), Object.defineProperties(callbackified, Object.getOwnPropertyDescriptors(original)), callbackified;
}
var formatRegExp, debuglog, inspect2, types = () => {}, months, promisify, TextEncoder, TextDecoder2, util_default;
var init_util = __esm(() => {
  formatRegExp = /%[sdj%]/g;
  debuglog = ((debugs = {}, debugEnvRegex = {}, debugEnv) => ((debugEnv = typeof process !== "undefined" && false) && (debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*").replace(/,/g, "$|^").toUpperCase()), debugEnvRegex = new RegExp("^" + debugEnv + "$", "i"), (set) => {
    if (set = set.toUpperCase(), !debugs[set])
      if (debugEnvRegex.test(set))
        debugs[set] = function(...args) {
          console.error("%s: %s", set, pid, format2.apply(null, ...args));
        };
      else
        debugs[set] = function() {};
    return debugs[set];
  }))();
  inspect2 = ((i2) => (i2.colors = { bold: [1, 22], italic: [3, 23], underline: [4, 24], inverse: [7, 27], white: [37, 39], grey: [90, 39], black: [30, 39], blue: [34, 39], cyan: [36, 39], green: [32, 39], magenta: [35, 39], red: [31, 39], yellow: [33, 39] }, i2.styles = { special: "cyan", number: "yellow", boolean: "yellow", undefined: "grey", null: "bold", string: "green", date: "magenta", regexp: "red" }, i2.custom = Symbol.for("nodejs.util.inspect.custom"), i2))(function inspect22(obj, opts, ...rest) {
    var ctx = { seen: [], stylize: stylizeNoColor };
    if (rest.length >= 1)
      ctx.depth = rest[0];
    if (rest.length >= 2)
      ctx.colors = rest[1];
    if (isBoolean(opts))
      ctx.showHidden = opts;
    else if (opts)
      _extend(ctx, opts);
    if (isUndefined(ctx.showHidden))
      ctx.showHidden = false;
    if (isUndefined(ctx.depth))
      ctx.depth = 2;
    if (isUndefined(ctx.colors))
      ctx.colors = false;
    if (ctx.colors)
      ctx.stylize = stylizeWithColor;
    return formatValue(ctx, obj, ctx.depth);
  });
  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  promisify = ((x) => (x.custom = Symbol.for("nodejs.util.promisify.custom"), x))(function promisify2(original) {
    if (typeof original !== "function")
      throw new TypeError('The "original" argument must be of type Function');
    if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
      var fn = original[kCustomPromisifiedSymbol];
      if (typeof fn !== "function")
        throw new TypeError('The "nodejs.util.promisify.custom" argument must be of type Function');
      return Object.defineProperty(fn, kCustomPromisifiedSymbol, { value: fn, enumerable: false, writable: false, configurable: true }), fn;
    }
    function fn(...args) {
      var promiseResolve, promiseReject, promise = new Promise(function(resolve2, reject) {
        promiseResolve = resolve2, promiseReject = reject;
      });
      args.push(function(err, value) {
        if (err)
          promiseReject(err);
        else
          promiseResolve(value);
      });
      try {
        original.apply(this, args);
      } catch (err) {
        promiseReject(err);
      }
      return promise;
    }
    if (Object.setPrototypeOf(fn, Object.getPrototypeOf(original)), kCustomPromisifiedSymbol)
      Object.defineProperty(fn, kCustomPromisifiedSymbol, { value: fn, enumerable: false, writable: false, configurable: true });
    return Object.defineProperties(fn, Object.getOwnPropertyDescriptors(original));
  });
  ({ TextEncoder, TextDecoder: TextDecoder2 } = globalThis);
  util_default = { TextEncoder, TextDecoder: TextDecoder2, promisify, log, inherits, _extend, callbackifyOnRejected, callbackify };
});

// node:events
var exports_events = {};
__export(exports_events, {
  setMaxListeners: () => setMaxListeners2,
  once: () => once2,
  listenerCount: () => listenerCount2,
  init: () => EventEmitter,
  getMaxListeners: () => getMaxListeners2,
  getEventListeners: () => getEventListeners,
  default: () => events_default,
  captureRejectionSymbol: () => captureRejectionSymbol,
  addAbortListener: () => addAbortListener,
  EventEmitter: () => EventEmitter
});
function emitError(emitter, args) {
  var { _events: events } = emitter;
  if (args[0] ??= new Error("Unhandled error."), !events)
    throw args[0];
  var errorMonitor = events[kErrorMonitor];
  if (errorMonitor)
    for (var handler of ArrayPrototypeSlice.call(errorMonitor))
      handler.apply(emitter, args);
  var handlers = events.error;
  if (!handlers)
    throw args[0];
  for (var handler of ArrayPrototypeSlice.call(handlers))
    handler.apply(emitter, args);
  return true;
}
function addCatch(emitter, promise, type, args) {
  promise.then(undefined, function(err) {
    queueMicrotask(() => emitUnhandledRejectionOrErr(emitter, err, type, args));
  });
}
function emitUnhandledRejectionOrErr(emitter, err, type, args) {
  if (typeof emitter[kRejection] === "function")
    emitter[kRejection](err, type, ...args);
  else
    try {
      emitter[kCapture] = false, emitter.emit("error", err);
    } finally {
      emitter[kCapture] = true;
    }
}
function overflowWarning(emitter, type, handlers) {
  handlers.warned = true;
  let warn = new Error(`Possible EventEmitter memory leak detected. ${handlers.length} ${String(type)} listeners added to [${emitter.constructor.name}]. Use emitter.setMaxListeners() to increase limit`);
  warn.name = "MaxListenersExceededWarning", warn.emitter = emitter, warn.type = type, warn.count = handlers.length, console.warn(warn);
}
function onceWrapper(type, listener, ...args) {
  this.removeListener(type, listener), listener.apply(this, args);
}
function once2(emitter, type, options) {
  var signal = options?.signal;
  if (validateAbortSignal(signal, "options.signal"), signal?.aborted)
    throw new AbortError(undefined, { cause: signal?.reason });
  let { resolve: resolve2, reject, promise } = $newPromiseCapability(Promise), errorListener = (err) => {
    if (emitter.removeListener(type, resolver), signal != null)
      eventTargetAgnosticRemoveListener(signal, "abort", abortListener);
    reject(err);
  }, resolver = (...args) => {
    if (typeof emitter.removeListener === "function")
      emitter.removeListener("error", errorListener);
    if (signal != null)
      eventTargetAgnosticRemoveListener(signal, "abort", abortListener);
    resolve2(args);
  };
  if (eventTargetAgnosticAddListener(emitter, type, resolver, { once: true }), type !== "error" && typeof emitter.once === "function")
    emitter.once("error", errorListener);
  function abortListener() {
    eventTargetAgnosticRemoveListener(emitter, type, resolver), eventTargetAgnosticRemoveListener(emitter, "error", errorListener), reject(new AbortError(undefined, { cause: signal?.reason }));
  }
  if (signal != null)
    eventTargetAgnosticAddListener(signal, "abort", abortListener, { once: true });
  return promise;
}
function getEventListeners(emitter, type) {
  return emitter.listeners(type);
}
function setMaxListeners2(n, ...eventTargets) {
  validateNumber2(n, "setMaxListeners", 0);
  var length;
  if (eventTargets && (length = eventTargets.length))
    for (let i2 = 0;i2 < length; i2++)
      eventTargets[i2].setMaxListeners(n);
  else
    defaultMaxListeners = n;
}
function listenerCount2(emitter, type) {
  return emitter.listenerCount(type);
}
function eventTargetAgnosticRemoveListener(emitter, name, listener, flags) {
  if (typeof emitter.removeListener === "function")
    emitter.removeListener(name, listener);
  else
    emitter.removeEventListener(name, listener, flags);
}
function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === "function")
    if (flags.once)
      emitter.once(name, listener);
    else
      emitter.on(name, listener);
  else
    emitter.addEventListener(name, listener, flags);
}
function ERR_INVALID_ARG_TYPE2(name, type, value) {
  let err = new TypeError(`The "${name}" argument must be of type ${type}. Received ${value}`);
  return err.code = "ERR_INVALID_ARG_TYPE", err;
}
function ERR_OUT_OF_RANGE2(name, range, value) {
  let err = new RangeError(`The "${name}" argument is out of range. It must be ${range}. Received ${value}`);
  return err.code = "ERR_OUT_OF_RANGE", err;
}
function validateAbortSignal(signal, name) {
  if (signal !== undefined && (signal === null || typeof signal !== "object" || !("aborted" in signal)))
    throw ERR_INVALID_ARG_TYPE2(name, "AbortSignal", signal);
}
function validateNumber2(value, name, min, max) {
  if (typeof value !== "number")
    throw ERR_INVALID_ARG_TYPE2(name, "number", value);
  if (min != null && value < min || max != null && value > max || (min != null || max != null) && Number.isNaN(value))
    throw ERR_OUT_OF_RANGE2(name, `${min != null ? `>= ${min}` : ""}${min != null && max != null ? " && " : ""}${max != null ? `<= ${max}` : ""}`, value);
}
function checkListener(listener) {
  if (typeof listener !== "function")
    throw new TypeError("The listener must be a function");
}
function validateBoolean(value, name) {
  if (typeof value !== "boolean")
    throw ERR_INVALID_ARG_TYPE2(name, "boolean", value);
}
function getMaxListeners2(emitterOrTarget) {
  return emitterOrTarget?._maxListeners ?? defaultMaxListeners;
}
function addAbortListener(signal, listener) {
  if (signal === undefined)
    throw ERR_INVALID_ARG_TYPE2("signal", "AbortSignal", signal);
  if (validateAbortSignal(signal, "signal"), typeof listener !== "function")
    throw ERR_INVALID_ARG_TYPE2("listener", "function", listener);
  let removeEventListener;
  if (signal.aborted)
    queueMicrotask(() => listener());
  else
    signal.addEventListener("abort", listener, { __proto__: null, once: true }), removeEventListener = () => {
      signal.removeEventListener("abort", listener);
    };
  return { __proto__: null, [Symbol.dispose]() {
    removeEventListener?.();
  } };
}
var SymbolFor, kCapture, kErrorMonitor, kMaxEventTargetListeners, kMaxEventTargetListenersWarned, kRejection, captureRejectionSymbol, ArrayPrototypeSlice, defaultMaxListeners = 10, EventEmitter = function EventEmitter2(opts) {
  if (this._events === undefined || this._events === this.__proto__._events)
    this._events = { __proto__: null }, this._eventsCount = 0;
  if (this._maxListeners ??= undefined, this[kCapture] = opts?.captureRejections ? Boolean(opts?.captureRejections) : EventEmitterPrototype[kCapture])
    this.emit = emitWithRejectionCapture;
}, EventEmitterPrototype, emitWithoutRejectionCapture = function emit(type, ...args) {
  if (type === "error")
    return emitError(this, args);
  var { _events: events } = this;
  if (events === undefined)
    return false;
  var handlers = events[type];
  if (handlers === undefined)
    return false;
  let maybeClonedHandlers = handlers.length > 1 ? handlers.slice() : handlers;
  for (let i2 = 0, { length } = maybeClonedHandlers;i2 < length; i2++) {
    let handler = maybeClonedHandlers[i2];
    switch (args.length) {
      case 0:
        handler.call(this);
        break;
      case 1:
        handler.call(this, args[0]);
        break;
      case 2:
        handler.call(this, args[0], args[1]);
        break;
      case 3:
        handler.call(this, args[0], args[1], args[2]);
        break;
      default:
        handler.apply(this, args);
        break;
    }
  }
  return true;
}, emitWithRejectionCapture = function emit2(type, ...args) {
  if (type === "error")
    return emitError(this, args);
  var { _events: events } = this;
  if (events === undefined)
    return false;
  var handlers = events[type];
  if (handlers === undefined)
    return false;
  let maybeClonedHandlers = handlers.length > 1 ? handlers.slice() : handlers;
  for (let i2 = 0, { length } = maybeClonedHandlers;i2 < length; i2++) {
    let handler = maybeClonedHandlers[i2], result;
    switch (args.length) {
      case 0:
        result = handler.call(this);
        break;
      case 1:
        result = handler.call(this, args[0]);
        break;
      case 2:
        result = handler.call(this, args[0], args[1]);
        break;
      case 3:
        result = handler.call(this, args[0], args[1], args[2]);
        break;
      default:
        result = handler.apply(this, args);
        break;
    }
    if (result !== undefined && typeof result?.then === "function" && result.then === Promise.prototype.then)
      addCatch(this, result, type, args);
  }
  return true;
}, AbortError, events_default;
var init_events = __esm(() => {
  SymbolFor = Symbol.for;
  kCapture = Symbol("kCapture");
  kErrorMonitor = SymbolFor("events.errorMonitor");
  kMaxEventTargetListeners = Symbol("events.maxEventTargetListeners");
  kMaxEventTargetListenersWarned = Symbol("events.maxEventTargetListenersWarned");
  kRejection = SymbolFor("nodejs.rejection");
  captureRejectionSymbol = SymbolFor("nodejs.rejection");
  ArrayPrototypeSlice = Array.prototype.slice;
  EventEmitterPrototype = EventEmitter.prototype = {};
  EventEmitterPrototype._events = undefined;
  EventEmitterPrototype._eventsCount = 0;
  EventEmitterPrototype._maxListeners = undefined;
  EventEmitterPrototype.setMaxListeners = function setMaxListeners(n) {
    return validateNumber2(n, "setMaxListeners", 0), this._maxListeners = n, this;
  };
  EventEmitterPrototype.constructor = EventEmitter;
  EventEmitterPrototype.getMaxListeners = function getMaxListeners() {
    return this?._maxListeners ?? defaultMaxListeners;
  };
  EventEmitterPrototype.emit = emitWithoutRejectionCapture;
  EventEmitterPrototype.addListener = function addListener(type, fn) {
    checkListener(fn);
    var events = this._events;
    if (!events)
      events = this._events = { __proto__: null }, this._eventsCount = 0;
    else if (events.newListener)
      this.emit("newListener", type, fn.listener ?? fn);
    var handlers = events[type];
    if (!handlers)
      events[type] = [fn], this._eventsCount++;
    else {
      handlers.push(fn);
      var m = this._maxListeners ?? defaultMaxListeners;
      if (m > 0 && handlers.length > m && !handlers.warned)
        overflowWarning(this, type, handlers);
    }
    return this;
  };
  EventEmitterPrototype.on = EventEmitterPrototype.addListener;
  EventEmitterPrototype.prependListener = function prependListener(type, fn) {
    checkListener(fn);
    var events = this._events;
    if (!events)
      events = this._events = { __proto__: null }, this._eventsCount = 0;
    else if (events.newListener)
      this.emit("newListener", type, fn.listener ?? fn);
    var handlers = events[type];
    if (!handlers)
      events[type] = [fn], this._eventsCount++;
    else {
      handlers.unshift(fn);
      var m = this._maxListeners ?? defaultMaxListeners;
      if (m > 0 && handlers.length > m && !handlers.warned)
        overflowWarning(this, type, handlers);
    }
    return this;
  };
  EventEmitterPrototype.once = function once(type, fn) {
    checkListener(fn);
    let bound = onceWrapper.bind(this, type, fn);
    return bound.listener = fn, this.addListener(type, bound), this;
  };
  EventEmitterPrototype.prependOnceListener = function prependOnceListener(type, fn) {
    checkListener(fn);
    let bound = onceWrapper.bind(this, type, fn);
    return bound.listener = fn, this.prependListener(type, bound), this;
  };
  EventEmitterPrototype.removeListener = function removeListener(type, fn) {
    checkListener(fn);
    var { _events: events } = this;
    if (!events)
      return this;
    var handlers = events[type];
    if (!handlers)
      return this;
    var length = handlers.length;
    let position = -1;
    for (let i2 = length - 1;i2 >= 0; i2--)
      if (handlers[i2] === fn || handlers[i2].listener === fn) {
        position = i2;
        break;
      }
    if (position < 0)
      return this;
    if (position === 0)
      handlers.shift();
    else
      handlers.splice(position, 1);
    if (handlers.length === 0)
      delete events[type], this._eventsCount--;
    return this;
  };
  EventEmitterPrototype.off = EventEmitterPrototype.removeListener;
  EventEmitterPrototype.removeAllListeners = function removeAllListeners(type) {
    var { _events: events } = this;
    if (type && events) {
      if (events[type])
        delete events[type], this._eventsCount--;
    } else
      this._events = { __proto__: null };
    return this;
  };
  EventEmitterPrototype.listeners = function listeners(type) {
    var { _events: events } = this;
    if (!events)
      return [];
    var handlers = events[type];
    if (!handlers)
      return [];
    return handlers.map((x) => x.listener ?? x);
  };
  EventEmitterPrototype.rawListeners = function rawListeners(type) {
    var { _events } = this;
    if (!_events)
      return [];
    var handlers = _events[type];
    if (!handlers)
      return [];
    return handlers.slice();
  };
  EventEmitterPrototype.listenerCount = function listenerCount(type) {
    var { _events: events } = this;
    if (!events)
      return 0;
    return events[type]?.length ?? 0;
  };
  EventEmitterPrototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
  };
  EventEmitterPrototype[kCapture] = false;
  AbortError = class AbortError extends Error {
    constructor(message = "The operation was aborted", options = undefined) {
      if (options !== undefined && typeof options !== "object")
        throw ERR_INVALID_ARG_TYPE2("options", "Object", options);
      super(message, options);
      this.code = "ABORT_ERR", this.name = "AbortError";
    }
  };
  Object.defineProperties(EventEmitter, { captureRejections: { get() {
    return EventEmitterPrototype[kCapture];
  }, set(value) {
    validateBoolean(value, "EventEmitter.captureRejections"), EventEmitterPrototype[kCapture] = value;
  }, enumerable: true }, defaultMaxListeners: { enumerable: true, get: () => {
    return defaultMaxListeners;
  }, set: (arg) => {
    validateNumber2(arg, "defaultMaxListeners", 0), defaultMaxListeners = arg;
  } }, kMaxEventTargetListeners: { value: kMaxEventTargetListeners, enumerable: false, configurable: false, writable: false }, kMaxEventTargetListenersWarned: { value: kMaxEventTargetListenersWarned, enumerable: false, configurable: false, writable: false } });
  Object.assign(EventEmitter, { once: once2, getEventListeners, getMaxListeners: getMaxListeners2, setMaxListeners: setMaxListeners2, EventEmitter, usingDomains: false, captureRejectionSymbol, errorMonitor: kErrorMonitor, addAbortListener, init: EventEmitter, listenerCount: listenerCount2 });
  events_default = EventEmitter;
});

// node:stream
var require_stream = __commonJS((exports, module) => {
  var __commonJS2 = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
  var require_primordials = __commonJS2((exports2, module2) => {

    class AggregateError extends Error {
      constructor(errors) {
        if (!Array.isArray(errors))
          throw new TypeError(`Expected input to be an Array, got ${typeof errors}`);
        let message = "";
        for (let i2 = 0;i2 < errors.length; i2++)
          message += `    ${errors[i2].stack}
`;
        super(message);
        this.name = "AggregateError", this.errors = errors;
      }
    }
    module2.exports = { AggregateError, ArrayIsArray(self2) {
      return Array.isArray(self2);
    }, ArrayPrototypeIncludes(self2, el) {
      return self2.includes(el);
    }, ArrayPrototypeIndexOf(self2, el) {
      return self2.indexOf(el);
    }, ArrayPrototypeJoin(self2, sep2) {
      return self2.join(sep2);
    }, ArrayPrototypeMap(self2, fn) {
      return self2.map(fn);
    }, ArrayPrototypePop(self2, el) {
      return self2.pop(el);
    }, ArrayPrototypePush(self2, el) {
      return self2.push(el);
    }, ArrayPrototypeSlice(self2, start, end) {
      return self2.slice(start, end);
    }, Error, FunctionPrototypeCall(fn, thisArgs, ...args) {
      return fn.call(thisArgs, ...args);
    }, FunctionPrototypeSymbolHasInstance(self2, instance) {
      return Function.prototype[Symbol.hasInstance].call(self2, instance);
    }, MathFloor: Math.floor, Number, NumberIsInteger: Number.isInteger, NumberIsNaN: Number.isNaN, NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER, NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER, NumberParseInt: Number.parseInt, ObjectDefineProperties(self2, props) {
      return Object.defineProperties(self2, props);
    }, ObjectDefineProperty(self2, name, prop) {
      return Object.defineProperty(self2, name, prop);
    }, ObjectGetOwnPropertyDescriptor(self2, name) {
      return Object.getOwnPropertyDescriptor(self2, name);
    }, ObjectKeys(obj) {
      return Object.keys(obj);
    }, ObjectSetPrototypeOf(target, proto) {
      return Object.setPrototypeOf(target, proto);
    }, Promise, PromisePrototypeCatch(self2, fn) {
      return self2.catch(fn);
    }, PromisePrototypeThen(self2, thenFn, catchFn) {
      return self2.then(thenFn, catchFn);
    }, PromiseReject(err) {
      return Promise.reject(err);
    }, PromiseResolve(val) {
      return Promise.resolve(val);
    }, ReflectApply: Reflect.apply, RegExpPrototypeTest(self2, value) {
      return self2.test(value);
    }, SafeSet: Set, String, StringPrototypeSlice(self2, start, end) {
      return self2.slice(start, end);
    }, StringPrototypeToLowerCase(self2) {
      return self2.toLowerCase();
    }, StringPrototypeToUpperCase(self2) {
      return self2.toUpperCase();
    }, StringPrototypeTrim(self2) {
      return self2.trim();
    }, Symbol, SymbolFor: Symbol.for, SymbolAsyncIterator: Symbol.asyncIterator, SymbolHasInstance: Symbol.hasInstance, SymbolIterator: Symbol.iterator, SymbolDispose: Symbol.dispose || Symbol("Symbol.dispose"), SymbolAsyncDispose: Symbol.asyncDispose || Symbol("Symbol.asyncDispose"), TypedArrayPrototypeSet(self2, buf, len2) {
      return self2.set(buf, len2);
    }, Boolean, Uint8Array };
  });
  var require_inspect = __commonJS2((exports2, module2) => {
    module2.exports = { format(format3, ...args) {
      return format3.replace(/%([sdifj])/g, function(...[_unused, type]) {
        let replacement = args.shift();
        if (type === "f")
          return replacement.toFixed(6);
        else if (type === "j")
          return JSON.stringify(replacement);
        else if (type === "s" && typeof replacement === "object")
          return `${replacement.constructor !== Object ? replacement.constructor.name : ""} {}`.trim();
        else
          return replacement.toString();
      });
    }, inspect(value) {
      switch (typeof value) {
        case "string":
          if (value.includes("'")) {
            if (!value.includes('"'))
              return `"${value}"`;
            else if (!value.includes("`") && !value.includes("${"))
              return `\`${value}\``;
          }
          return `'${value}'`;
        case "number":
          if (isNaN(value))
            return "NaN";
          else if (Object.is(value, -0))
            return String(value);
          return value;
        case "bigint":
          return `${String(value)}n`;
        case "boolean":
        case "undefined":
          return String(value);
        case "object":
          return "{}";
      }
    } };
  });
  var require_errors = __commonJS2((exports2, module2) => {
    var { format: format3, inspect: inspect3 } = require_inspect(), { AggregateError: CustomAggregateError } = require_primordials(), AggregateError = globalThis.AggregateError || CustomAggregateError, kIsNodeError = Symbol("kIsNodeError"), kTypes = ["string", "function", "number", "object", "Function", "Object", "boolean", "bigint", "symbol"], classRegExp = /^([A-Z][a-z0-9]*)+$/, codes = {};
    function assert(value, message) {
      if (!value)
        throw new codes.ERR_INTERNAL_ASSERTION(message);
    }
    function addNumericalSeparator2(val) {
      let res = "", i2 = val.length, start = val[0] === "-" ? 1 : 0;
      for (;i2 >= start + 4; i2 -= 3)
        res = `_${val.slice(i2 - 3, i2)}${res}`;
      return `${val.slice(0, i2)}${res}`;
    }
    function getMessage(key, msg, args) {
      if (typeof msg === "function")
        return assert(msg.length <= args.length, `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${msg.length}).`), msg(...args);
      let expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
      if (assert(expectedLength === args.length, `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${expectedLength}).`), args.length === 0)
        return msg;
      return format3(msg, ...args);
    }
    function E2(code2, message, Base) {
      if (!Base)
        Base = Error;

      class NodeError extends Base {
        constructor(...args) {
          super(getMessage(code2, message, args));
        }
        toString() {
          return `${this.name} [${code2}]: ${this.message}`;
        }
      }
      Object.defineProperties(NodeError.prototype, { name: { value: Base.name, writable: true, enumerable: false, configurable: true }, toString: { value() {
        return `${this.name} [${code2}]: ${this.message}`;
      }, writable: true, enumerable: false, configurable: true } }), NodeError.prototype.code = code2, NodeError.prototype[kIsNodeError] = true, codes[code2] = NodeError;
    }
    function hideStackFrames(fn) {
      let hidden = "__node_internal_" + fn.name;
      return Object.defineProperty(fn, "name", { value: hidden }), fn;
    }
    function aggregateTwoErrors(innerError, outerError) {
      if (innerError && outerError && innerError !== outerError) {
        if (Array.isArray(outerError.errors))
          return outerError.errors.push(innerError), outerError;
        let err = new AggregateError([outerError, innerError], outerError.message);
        return err.code = outerError.code, err;
      }
      return innerError || outerError;
    }

    class AbortError2 extends Error {
      constructor(message = "The operation was aborted", options = undefined) {
        if (options !== undefined && typeof options !== "object")
          throw new codes.ERR_INVALID_ARG_TYPE("options", "Object", options);
        super(message, options);
        this.code = "ABORT_ERR", this.name = "AbortError";
      }
    }
    E2("ERR_ASSERTION", "%s", Error);
    E2("ERR_INVALID_ARG_TYPE", (name, expected, actual) => {
      if (assert(typeof name === "string", "'name' must be a string"), !Array.isArray(expected))
        expected = [expected];
      let msg = "The ";
      if (name.endsWith(" argument"))
        msg += `${name} `;
      else
        msg += `"${name}" ${name.includes(".") ? "property" : "argument"} `;
      msg += "must be ";
      let types2 = [], instances = [], other = [];
      for (let value of expected)
        if (assert(typeof value === "string", "All expected entries have to be of type string"), kTypes.includes(value))
          types2.push(value.toLowerCase());
        else if (classRegExp.test(value))
          instances.push(value);
        else
          assert(value !== "object", 'The value "object" should be written as "Object"'), other.push(value);
      if (instances.length > 0) {
        let pos = types2.indexOf("object");
        if (pos !== -1)
          types2.splice(types2, pos, 1), instances.push("Object");
      }
      if (types2.length > 0) {
        switch (types2.length) {
          case 1:
            msg += `of type ${types2[0]}`;
            break;
          case 2:
            msg += `one of type ${types2[0]} or ${types2[1]}`;
            break;
          default: {
            let last = types2.pop();
            msg += `one of type ${types2.join(", ")}, or ${last}`;
          }
        }
        if (instances.length > 0 || other.length > 0)
          msg += " or ";
      }
      if (instances.length > 0) {
        switch (instances.length) {
          case 1:
            msg += `an instance of ${instances[0]}`;
            break;
          case 2:
            msg += `an instance of ${instances[0]} or ${instances[1]}`;
            break;
          default: {
            let last = instances.pop();
            msg += `an instance of ${instances.join(", ")}, or ${last}`;
          }
        }
        if (other.length > 0)
          msg += " or ";
      }
      switch (other.length) {
        case 0:
          break;
        case 1:
          if (other[0].toLowerCase() !== other[0])
            msg += "an ";
          msg += `${other[0]}`;
          break;
        case 2:
          msg += `one of ${other[0]} or ${other[1]}`;
          break;
        default: {
          let last = other.pop();
          msg += `one of ${other.join(", ")}, or ${last}`;
        }
      }
      if (actual == null)
        msg += `. Received ${actual}`;
      else if (typeof actual === "function" && actual.name)
        msg += `. Received function ${actual.name}`;
      else if (typeof actual === "object") {
        var _actual$constructor;
        if ((_actual$constructor = actual.constructor) !== null && _actual$constructor !== undefined && _actual$constructor.name)
          msg += `. Received an instance of ${actual.constructor.name}`;
        else {
          let inspected = inspect3(actual, { depth: -1 });
          msg += `. Received ${inspected}`;
        }
      } else {
        let inspected = inspect3(actual, { colors: false });
        if (inspected.length > 25)
          inspected = `${inspected.slice(0, 25)}...`;
        msg += `. Received type ${typeof actual} (${inspected})`;
      }
      return msg;
    }, TypeError);
    E2("ERR_INVALID_ARG_VALUE", (name, value, reason = "is invalid") => {
      let inspected = inspect3(value);
      if (inspected.length > 128)
        inspected = inspected.slice(0, 128) + "...";
      return `The ${name.includes(".") ? "property" : "argument"} '${name}' ${reason}. Received ${inspected}`;
    }, TypeError);
    E2("ERR_INVALID_RETURN_VALUE", (input, name, value) => {
      var _value$constructor;
      let type = value !== null && value !== undefined && (_value$constructor = value.constructor) !== null && _value$constructor !== undefined && _value$constructor.name ? `instance of ${value.constructor.name}` : `type ${typeof value}`;
      return `Expected ${input} to be returned from the "${name}" function but got ${type}.`;
    }, TypeError);
    E2("ERR_MISSING_ARGS", (...args) => {
      assert(args.length > 0, "At least one arg needs to be specified");
      let msg, len2 = args.length;
      switch (args = (Array.isArray(args) ? args : [args]).map((a) => `"${a}"`).join(" or "), len2) {
        case 1:
          msg += `The ${args[0]} argument`;
          break;
        case 2:
          msg += `The ${args[0]} and ${args[1]} arguments`;
          break;
        default:
          {
            let last = args.pop();
            msg += `The ${args.join(", ")}, and ${last} arguments`;
          }
          break;
      }
      return `${msg} must be specified`;
    }, TypeError);
    E2("ERR_OUT_OF_RANGE", (str, range, input) => {
      assert(range, 'Missing "range" argument');
      let received;
      if (Number.isInteger(input) && Math.abs(input) > 4294967296)
        received = addNumericalSeparator2(String(input));
      else if (typeof input === "bigint") {
        received = String(input);
        let limit = BigInt(2) ** BigInt(32);
        if (input > limit || input < -limit)
          received = addNumericalSeparator2(received);
        received += "n";
      } else
        received = inspect3(input);
      return `The value of "${str}" is out of range. It must be ${range}. Received ${received}`;
    }, RangeError);
    E2("ERR_MULTIPLE_CALLBACK", "Callback called multiple times", Error);
    E2("ERR_METHOD_NOT_IMPLEMENTED", "The %s method is not implemented", Error);
    E2("ERR_STREAM_ALREADY_FINISHED", "Cannot call %s after a stream was finished", Error);
    E2("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable", Error);
    E2("ERR_STREAM_DESTROYED", "Cannot call %s after a stream was destroyed", Error);
    E2("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
    E2("ERR_STREAM_PREMATURE_CLOSE", "Premature close", Error);
    E2("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF", Error);
    E2("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event", Error);
    E2("ERR_STREAM_WRITE_AFTER_END", "write after end", Error);
    E2("ERR_UNKNOWN_ENCODING", "Unknown encoding: %s", TypeError);
    module2.exports = { AbortError: AbortError2, aggregateTwoErrors: hideStackFrames(aggregateTwoErrors), hideStackFrames, codes };
  });
  var require_event_target_shim = __commonJS2((exports2, module2) => {
    Object.defineProperty(exports2, "__esModule", { value: true });
    var privateData = new WeakMap, wrappers = new WeakMap;
    function pd(event) {
      let retv = privateData.get(event);
      return console.assert(retv != null, "'this' is expected an Event object, but got", event), retv;
    }
    function setCancelFlag(data) {
      if (data.passiveListener != null) {
        if (typeof console !== "undefined" && typeof console.error === "function")
          console.error("Unable to preventDefault inside passive event listener invocation.", data.passiveListener);
        return;
      }
      if (!data.event.cancelable)
        return;
      if (data.canceled = true, typeof data.event.preventDefault === "function")
        data.event.preventDefault();
    }
    function Event(eventTarget, event) {
      privateData.set(this, { eventTarget, event, eventPhase: 2, currentTarget: eventTarget, canceled: false, stopped: false, immediateStopped: false, passiveListener: null, timeStamp: event.timeStamp || Date.now() }), Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });
      let keys = Object.keys(event);
      for (let i2 = 0;i2 < keys.length; ++i2) {
        let key = keys[i2];
        if (!(key in this))
          Object.defineProperty(this, key, defineRedirectDescriptor(key));
      }
    }
    Event.prototype = { get type() {
      return pd(this).event.type;
    }, get target() {
      return pd(this).eventTarget;
    }, get currentTarget() {
      return pd(this).currentTarget;
    }, composedPath() {
      let currentTarget = pd(this).currentTarget;
      if (currentTarget == null)
        return [];
      return [currentTarget];
    }, get NONE() {
      return 0;
    }, get CAPTURING_PHASE() {
      return 1;
    }, get AT_TARGET() {
      return 2;
    }, get BUBBLING_PHASE() {
      return 3;
    }, get eventPhase() {
      return pd(this).eventPhase;
    }, stopPropagation() {
      let data = pd(this);
      if (data.stopped = true, typeof data.event.stopPropagation === "function")
        data.event.stopPropagation();
    }, stopImmediatePropagation() {
      let data = pd(this);
      if (data.stopped = true, data.immediateStopped = true, typeof data.event.stopImmediatePropagation === "function")
        data.event.stopImmediatePropagation();
    }, get bubbles() {
      return Boolean(pd(this).event.bubbles);
    }, get cancelable() {
      return Boolean(pd(this).event.cancelable);
    }, preventDefault() {
      setCancelFlag(pd(this));
    }, get defaultPrevented() {
      return pd(this).canceled;
    }, get composed() {
      return Boolean(pd(this).event.composed);
    }, get timeStamp() {
      return pd(this).timeStamp;
    }, get srcElement() {
      return pd(this).eventTarget;
    }, get cancelBubble() {
      return pd(this).stopped;
    }, set cancelBubble(value) {
      if (!value)
        return;
      let data = pd(this);
      if (data.stopped = true, typeof data.event.cancelBubble === "boolean")
        data.event.cancelBubble = true;
    }, get returnValue() {
      return !pd(this).canceled;
    }, set returnValue(value) {
      if (!value)
        setCancelFlag(pd(this));
    }, initEvent() {} };
    Object.defineProperty(Event.prototype, "constructor", { value: Event, configurable: true, writable: true });
    if (typeof window !== "undefined" && typeof window.Event !== "undefined")
      Object.setPrototypeOf(Event.prototype, window.Event.prototype), wrappers.set(window.Event.prototype, Event);
    function defineRedirectDescriptor(key) {
      return { get() {
        return pd(this).event[key];
      }, set(value) {
        pd(this).event[key] = value;
      }, configurable: true, enumerable: true };
    }
    function defineCallDescriptor(key) {
      return { value() {
        let event = pd(this).event;
        return event[key].apply(event, arguments);
      }, configurable: true, enumerable: true };
    }
    function defineWrapper(BaseEvent, proto) {
      let keys = Object.keys(proto);
      if (keys.length === 0)
        return BaseEvent;
      function CustomEvent(eventTarget, event) {
        BaseEvent.call(this, eventTarget, event);
      }
      CustomEvent.prototype = Object.create(BaseEvent.prototype, { constructor: { value: CustomEvent, configurable: true, writable: true } });
      for (let i2 = 0;i2 < keys.length; ++i2) {
        let key = keys[i2];
        if (!(key in BaseEvent.prototype)) {
          let isFunc = typeof Object.getOwnPropertyDescriptor(proto, key).value === "function";
          Object.defineProperty(CustomEvent.prototype, key, isFunc ? defineCallDescriptor(key) : defineRedirectDescriptor(key));
        }
      }
      return CustomEvent;
    }
    function getWrapper(proto) {
      if (proto == null || proto === Object.prototype)
        return Event;
      let wrapper = wrappers.get(proto);
      if (wrapper == null)
        wrapper = defineWrapper(getWrapper(Object.getPrototypeOf(proto)), proto), wrappers.set(proto, wrapper);
      return wrapper;
    }
    function wrapEvent(eventTarget, event) {
      return new (getWrapper(Object.getPrototypeOf(event)))(eventTarget, event);
    }
    function isStopped(event) {
      return pd(event).immediateStopped;
    }
    function setEventPhase(event, eventPhase) {
      pd(event).eventPhase = eventPhase;
    }
    function setCurrentTarget(event, currentTarget) {
      pd(event).currentTarget = currentTarget;
    }
    function setPassiveListener(event, passiveListener) {
      pd(event).passiveListener = passiveListener;
    }
    var listenersMap = new WeakMap, CAPTURE = 1, BUBBLE = 2, ATTRIBUTE = 3;
    function isObject2(x) {
      return x !== null && typeof x === "object";
    }
    function getListeners(eventTarget) {
      let listeners2 = listenersMap.get(eventTarget);
      if (listeners2 == null)
        throw new TypeError("'this' is expected an EventTarget object, but got another value.");
      return listeners2;
    }
    function defineEventAttributeDescriptor(eventName) {
      return { get() {
        let node = getListeners(this).get(eventName);
        while (node != null) {
          if (node.listenerType === ATTRIBUTE)
            return node.listener;
          node = node.next;
        }
        return null;
      }, set(listener) {
        if (typeof listener !== "function" && !isObject2(listener))
          listener = null;
        let listeners2 = getListeners(this), prev = null, node = listeners2.get(eventName);
        while (node != null) {
          if (node.listenerType === ATTRIBUTE)
            if (prev !== null)
              prev.next = node.next;
            else if (node.next !== null)
              listeners2.set(eventName, node.next);
            else
              listeners2.delete(eventName);
          else
            prev = node;
          node = node.next;
        }
        if (listener !== null) {
          let newNode = { listener, listenerType: ATTRIBUTE, passive: false, once: false, next: null };
          if (prev === null)
            listeners2.set(eventName, newNode);
          else
            prev.next = newNode;
        }
      }, configurable: true, enumerable: true };
    }
    function defineEventAttribute(eventTargetPrototype, eventName) {
      Object.defineProperty(eventTargetPrototype, `on${eventName}`, defineEventAttributeDescriptor(eventName));
    }
    function defineCustomEventTarget(eventNames2) {
      function CustomEventTarget() {
        EventTarget.call(this);
      }
      CustomEventTarget.prototype = Object.create(EventTarget.prototype, { constructor: { value: CustomEventTarget, configurable: true, writable: true } });
      for (let i2 = 0;i2 < eventNames2.length; ++i2)
        defineEventAttribute(CustomEventTarget.prototype, eventNames2[i2]);
      return CustomEventTarget;
    }
    function EventTarget() {
      if (this instanceof EventTarget) {
        listenersMap.set(this, new Map);
        return;
      }
      if (arguments.length === 1 && Array.isArray(arguments[0]))
        return defineCustomEventTarget(arguments[0]);
      if (arguments.length > 0) {
        let types2 = new Array(arguments.length);
        for (let i2 = 0;i2 < arguments.length; ++i2)
          types2[i2] = arguments[i2];
        return defineCustomEventTarget(types2);
      }
      throw new TypeError("Cannot call a class as a function");
    }
    EventTarget.prototype = { addEventListener(eventName, listener, options) {
      if (listener == null)
        return;
      if (typeof listener !== "function" && !isObject2(listener))
        throw new TypeError("'listener' should be a function or an object.");
      let listeners2 = getListeners(this), optionsIsObj = isObject2(options), listenerType = (optionsIsObj ? Boolean(options.capture) : Boolean(options)) ? CAPTURE : BUBBLE, newNode = { listener, listenerType, passive: optionsIsObj && Boolean(options.passive), once: optionsIsObj && Boolean(options.once), next: null }, node = listeners2.get(eventName);
      if (node === undefined) {
        listeners2.set(eventName, newNode);
        return;
      }
      let prev = null;
      while (node != null) {
        if (node.listener === listener && node.listenerType === listenerType)
          return;
        prev = node, node = node.next;
      }
      prev.next = newNode;
    }, removeEventListener(eventName, listener, options) {
      if (listener == null)
        return;
      let listeners2 = getListeners(this), listenerType = (isObject2(options) ? Boolean(options.capture) : Boolean(options)) ? CAPTURE : BUBBLE, prev = null, node = listeners2.get(eventName);
      while (node != null) {
        if (node.listener === listener && node.listenerType === listenerType) {
          if (prev !== null)
            prev.next = node.next;
          else if (node.next !== null)
            listeners2.set(eventName, node.next);
          else
            listeners2.delete(eventName);
          return;
        }
        prev = node, node = node.next;
      }
    }, dispatchEvent(event) {
      if (event == null || typeof event.type !== "string")
        throw new TypeError('"event.type" should be a string.');
      let listeners2 = getListeners(this), eventName = event.type, node = listeners2.get(eventName);
      if (node == null)
        return true;
      let wrappedEvent = wrapEvent(this, event), prev = null;
      while (node != null) {
        if (node.once)
          if (prev !== null)
            prev.next = node.next;
          else if (node.next !== null)
            listeners2.set(eventName, node.next);
          else
            listeners2.delete(eventName);
        else
          prev = node;
        if (setPassiveListener(wrappedEvent, node.passive ? node.listener : null), typeof node.listener === "function")
          try {
            node.listener.call(this, wrappedEvent);
          } catch (err) {
            if (typeof console !== "undefined" && typeof console.error === "function")
              console.error(err);
          }
        else if (node.listenerType !== ATTRIBUTE && typeof node.listener.handleEvent === "function")
          node.listener.handleEvent(wrappedEvent);
        if (isStopped(wrappedEvent))
          break;
        node = node.next;
      }
      return setPassiveListener(wrappedEvent, null), setEventPhase(wrappedEvent, 0), setCurrentTarget(wrappedEvent, null), !wrappedEvent.defaultPrevented;
    } };
    Object.defineProperty(EventTarget.prototype, "constructor", { value: EventTarget, configurable: true, writable: true });
    if (typeof window !== "undefined" && typeof window.EventTarget !== "undefined")
      Object.setPrototypeOf(EventTarget.prototype, window.EventTarget.prototype);
    exports2.defineEventAttribute = defineEventAttribute;
    exports2.EventTarget = EventTarget;
    exports2.default = EventTarget;
    module2.exports = EventTarget;
    module2.exports.EventTarget = module2.exports.default = EventTarget;
    module2.exports.defineEventAttribute = defineEventAttribute;
  });
  var require_abort_controller = __commonJS2((exports2, module2) => {
    Object.defineProperty(exports2, "__esModule", { value: true });
    var eventTargetShim = require_event_target_shim();

    class AbortSignal extends eventTargetShim.EventTarget {
      constructor() {
        super();
        throw new TypeError("AbortSignal cannot be constructed directly");
      }
      get aborted() {
        let aborted = abortedFlags.get(this);
        if (typeof aborted !== "boolean")
          throw new TypeError(`Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? "null" : typeof this}`);
        return aborted;
      }
    }
    eventTargetShim.defineEventAttribute(AbortSignal.prototype, "abort");
    function createAbortSignal() {
      let signal = Object.create(AbortSignal.prototype);
      return eventTargetShim.EventTarget.call(signal), abortedFlags.set(signal, false), signal;
    }
    function abortSignal(signal) {
      if (abortedFlags.get(signal) !== false)
        return;
      abortedFlags.set(signal, true), signal.dispatchEvent({ type: "abort" });
    }
    var abortedFlags = new WeakMap;
    Object.defineProperties(AbortSignal.prototype, { aborted: { enumerable: true } });
    if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol")
      Object.defineProperty(AbortSignal.prototype, Symbol.toStringTag, { configurable: true, value: "AbortSignal" });

    class AbortController {
      constructor() {
        signals.set(this, createAbortSignal());
      }
      get signal() {
        return getSignal(this);
      }
      abort() {
        abortSignal(getSignal(this));
      }
    }
    var signals = new WeakMap;
    function getSignal(controller) {
      let signal = signals.get(controller);
      if (signal == null)
        throw new TypeError(`Expected 'this' to be an 'AbortController' object, but got ${controller === null ? "null" : typeof controller}`);
      return signal;
    }
    Object.defineProperties(AbortController.prototype, { signal: { enumerable: true }, abort: { enumerable: true } });
    if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol")
      Object.defineProperty(AbortController.prototype, Symbol.toStringTag, { configurable: true, value: "AbortController" });
    exports2.AbortController = AbortController;
    exports2.AbortSignal = AbortSignal;
    exports2.default = AbortController;
    module2.exports = AbortController;
    module2.exports.AbortController = module2.exports.default = AbortController;
    module2.exports.AbortSignal = AbortSignal;
  });
  var require_util = __commonJS2((exports2, module2) => {
    var bufferModule = (init_buffer(), __toCommonJS(exports_buffer)), { format: format3, inspect: inspect3 } = require_inspect(), { codes: { ERR_INVALID_ARG_TYPE: ERR_INVALID_ARG_TYPE3 } } = require_errors(), { kResistStopPropagation, AggregateError, SymbolDispose } = require_primordials(), AbortSignal = globalThis.AbortSignal || require_abort_controller().AbortSignal, AbortController = globalThis.AbortController || require_abort_controller().AbortController, AsyncFunction = Object.getPrototypeOf(async function() {}).constructor, Blob2 = globalThis.Blob || bufferModule.Blob, isBlob = typeof Blob2 !== "undefined" ? function isBlob(b) {
      return b instanceof Blob2;
    } : function isBlob(b) {
      return false;
    }, validateAbortSignal2 = (signal, name) => {
      if (signal !== undefined && (signal === null || typeof signal !== "object" || !("aborted" in signal)))
        throw new ERR_INVALID_ARG_TYPE3(name, "AbortSignal", signal);
    }, validateFunction = (value, name) => {
      if (typeof value !== "function")
        throw new ERR_INVALID_ARG_TYPE3(name, "Function", value);
    };
    module2.exports = { AggregateError, kEmptyObject: Object.freeze({}), once(callback) {
      let called = false;
      return function(...args) {
        if (called)
          return;
        called = true, callback.apply(this, args);
      };
    }, createDeferredPromise: function() {
      let resolve2, reject;
      return { promise: new Promise((res, rej) => {
        resolve2 = res, reject = rej;
      }), resolve: resolve2, reject };
    }, promisify(fn) {
      return new Promise((resolve2, reject) => {
        fn((err, ...args) => {
          if (err)
            return reject(err);
          return resolve2(...args);
        });
      });
    }, debuglog() {
      return function() {};
    }, format: format3, inspect: inspect3, types: { isAsyncFunction(fn) {
      return fn instanceof AsyncFunction;
    }, isArrayBufferView(arr) {
      return ArrayBuffer.isView(arr);
    } }, isBlob, deprecate(fn, message) {
      return fn;
    }, addAbortListener: (init_events(), __toCommonJS(exports_events)).addAbortListener || function addAbortListener(signal, listener) {
      if (signal === undefined)
        throw new ERR_INVALID_ARG_TYPE3("signal", "AbortSignal", signal);
      validateAbortSignal2(signal, "signal"), validateFunction(listener, "listener");
      let removeEventListener;
      if (signal.aborted)
        queueMicrotask(() => listener());
      else
        signal.addEventListener("abort", listener, { __proto__: null, once: true, [kResistStopPropagation]: true }), removeEventListener = () => {
          signal.removeEventListener("abort", listener);
        };
      return { __proto__: null, [SymbolDispose]() {
        var _removeEventListener;
        (_removeEventListener = removeEventListener) === null || _removeEventListener === undefined || _removeEventListener();
      } };
    }, AbortSignalAny: AbortSignal.any || function AbortSignalAny(signals) {
      if (signals.length === 1)
        return signals[0];
      let ac = new AbortController, abort = () => ac.abort();
      return signals.forEach((signal) => {
        validateAbortSignal2(signal, "signals"), signal.addEventListener("abort", abort, { once: true });
      }), ac.signal.addEventListener("abort", () => {
        signals.forEach((signal) => signal.removeEventListener("abort", abort));
      }, { once: true }), ac.signal;
    } };
    module2.exports.promisify.custom = Symbol.for("nodejs.util.promisify.custom");
  });
  var require_validators = __commonJS2((exports2, module2) => {
    var { ArrayIsArray, ArrayPrototypeIncludes, ArrayPrototypeJoin, ArrayPrototypeMap, NumberIsInteger, NumberIsNaN, NumberMAX_SAFE_INTEGER, NumberMIN_SAFE_INTEGER, NumberParseInt, ObjectPrototypeHasOwnProperty, RegExpPrototypeExec, String: String2, StringPrototypeToUpperCase, StringPrototypeTrim } = require_primordials(), { hideStackFrames, codes: { ERR_SOCKET_BAD_PORT, ERR_INVALID_ARG_TYPE: ERR_INVALID_ARG_TYPE3, ERR_INVALID_ARG_VALUE, ERR_OUT_OF_RANGE: ERR_OUT_OF_RANGE3, ERR_UNKNOWN_SIGNAL } } = require_errors(), { normalizeEncoding } = require_util(), { isAsyncFunction, isArrayBufferView } = require_util().types, signals = {};
    function isInt32(value) {
      return value === (value | 0);
    }
    function isUint32(value) {
      return value === value >>> 0;
    }
    var octalReg = /^[0-7]+$/, modeDesc = "must be a 32-bit unsigned integer or an octal string";
    function parseFileMode(value, name, def) {
      if (typeof value === "undefined")
        value = def;
      if (typeof value === "string") {
        if (RegExpPrototypeExec(octalReg, value) === null)
          throw new ERR_INVALID_ARG_VALUE(name, value, modeDesc);
        value = NumberParseInt(value, 8);
      }
      return validateUint32(value, name), value;
    }
    var validateInteger = hideStackFrames((value, name, min = NumberMIN_SAFE_INTEGER, max = NumberMAX_SAFE_INTEGER) => {
      if (typeof value !== "number")
        throw new ERR_INVALID_ARG_TYPE3(name, "number", value);
      if (!NumberIsInteger(value))
        throw new ERR_OUT_OF_RANGE3(name, "an integer", value);
      if (value < min || value > max)
        throw new ERR_OUT_OF_RANGE3(name, `>= ${min} && <= ${max}`, value);
    }), validateInt32 = hideStackFrames((value, name, min = -2147483648, max = 2147483647) => {
      if (typeof value !== "number")
        throw new ERR_INVALID_ARG_TYPE3(name, "number", value);
      if (!NumberIsInteger(value))
        throw new ERR_OUT_OF_RANGE3(name, "an integer", value);
      if (value < min || value > max)
        throw new ERR_OUT_OF_RANGE3(name, `>= ${min} && <= ${max}`, value);
    }), validateUint32 = hideStackFrames((value, name, positive = false) => {
      if (typeof value !== "number")
        throw new ERR_INVALID_ARG_TYPE3(name, "number", value);
      if (!NumberIsInteger(value))
        throw new ERR_OUT_OF_RANGE3(name, "an integer", value);
      let min = positive ? 1 : 0, max = 4294967295;
      if (value < min || value > max)
        throw new ERR_OUT_OF_RANGE3(name, `>= ${min} && <= ${max}`, value);
    });
    function validateString(value, name) {
      if (typeof value !== "string")
        throw new ERR_INVALID_ARG_TYPE3(name, "string", value);
    }
    function validateNumber3(value, name, min = undefined, max) {
      if (typeof value !== "number")
        throw new ERR_INVALID_ARG_TYPE3(name, "number", value);
      if (min != null && value < min || max != null && value > max || (min != null || max != null) && NumberIsNaN(value))
        throw new ERR_OUT_OF_RANGE3(name, `${min != null ? `>= ${min}` : ""}${min != null && max != null ? " && " : ""}${max != null ? `<= ${max}` : ""}`, value);
    }
    var validateOneOf = hideStackFrames((value, name, oneOf) => {
      if (!ArrayPrototypeIncludes(oneOf, value)) {
        let reason = "must be one of: " + ArrayPrototypeJoin(ArrayPrototypeMap(oneOf, (v) => typeof v === "string" ? `'${v}'` : String2(v)), ", ");
        throw new ERR_INVALID_ARG_VALUE(name, value, reason);
      }
    });
    function validateBoolean2(value, name) {
      if (typeof value !== "boolean")
        throw new ERR_INVALID_ARG_TYPE3(name, "boolean", value);
    }
    function getOwnPropertyValueOrDefault(options, key, defaultValue) {
      return options == null || !ObjectPrototypeHasOwnProperty(options, key) ? defaultValue : options[key];
    }
    var validateObject = hideStackFrames((value, name, options = null) => {
      let allowArray = getOwnPropertyValueOrDefault(options, "allowArray", false), allowFunction = getOwnPropertyValueOrDefault(options, "allowFunction", false);
      if (!getOwnPropertyValueOrDefault(options, "nullable", false) && value === null || !allowArray && ArrayIsArray(value) || typeof value !== "object" && (!allowFunction || typeof value !== "function"))
        throw new ERR_INVALID_ARG_TYPE3(name, "Object", value);
    }), validateDictionary = hideStackFrames((value, name) => {
      if (value != null && typeof value !== "object" && typeof value !== "function")
        throw new ERR_INVALID_ARG_TYPE3(name, "a dictionary", value);
    }), validateArray = hideStackFrames((value, name, minLength = 0) => {
      if (!ArrayIsArray(value))
        throw new ERR_INVALID_ARG_TYPE3(name, "Array", value);
      if (value.length < minLength) {
        let reason = `must be longer than ${minLength}`;
        throw new ERR_INVALID_ARG_VALUE(name, value, reason);
      }
    });
    function validateStringArray(value, name) {
      validateArray(value, name);
      for (let i2 = 0;i2 < value.length; i2++)
        validateString(value[i2], `${name}[${i2}]`);
    }
    function validateBooleanArray(value, name) {
      validateArray(value, name);
      for (let i2 = 0;i2 < value.length; i2++)
        validateBoolean2(value[i2], `${name}[${i2}]`);
    }
    function validateAbortSignalArray(value, name) {
      validateArray(value, name);
      for (let i2 = 0;i2 < value.length; i2++) {
        let signal = value[i2], indexedName = `${name}[${i2}]`;
        if (signal == null)
          throw new ERR_INVALID_ARG_TYPE3(indexedName, "AbortSignal", signal);
        validateAbortSignal2(signal, indexedName);
      }
    }
    function validateSignalName(signal, name = "signal") {
      if (validateString(signal, name), signals[signal] === undefined) {
        if (signals[StringPrototypeToUpperCase(signal)] !== undefined)
          throw new ERR_UNKNOWN_SIGNAL(signal + " (signals must use all capital letters)");
        throw new ERR_UNKNOWN_SIGNAL(signal);
      }
    }
    var validateBuffer = hideStackFrames((buffer, name = "buffer") => {
      if (!isArrayBufferView(buffer))
        throw new ERR_INVALID_ARG_TYPE3(name, ["Buffer", "TypedArray", "DataView"], buffer);
    });
    function validateEncoding(data, encoding) {
      let normalizedEncoding = normalizeEncoding(encoding), length = data.length;
      if (normalizedEncoding === "hex" && length % 2 !== 0)
        throw new ERR_INVALID_ARG_VALUE("encoding", encoding, `is invalid for data of length ${length}`);
    }
    function validatePort(port, name = "Port", allowZero = true) {
      if (typeof port !== "number" && typeof port !== "string" || typeof port === "string" && StringPrototypeTrim(port).length === 0 || +port !== +port >>> 0 || port > 65535 || port === 0 && !allowZero)
        throw new ERR_SOCKET_BAD_PORT(name, port, allowZero);
      return port | 0;
    }
    var validateAbortSignal2 = hideStackFrames((signal, name) => {
      if (signal !== undefined && (signal === null || typeof signal !== "object" || !("aborted" in signal)))
        throw new ERR_INVALID_ARG_TYPE3(name, "AbortSignal", signal);
    }), validateFunction = hideStackFrames((value, name) => {
      if (typeof value !== "function")
        throw new ERR_INVALID_ARG_TYPE3(name, "Function", value);
    }), validatePlainFunction = hideStackFrames((value, name) => {
      if (typeof value !== "function" || isAsyncFunction(value))
        throw new ERR_INVALID_ARG_TYPE3(name, "Function", value);
    }), validateUndefined = hideStackFrames((value, name) => {
      if (value !== undefined)
        throw new ERR_INVALID_ARG_TYPE3(name, "undefined", value);
    });
    function validateUnion(value, name, union) {
      if (!ArrayPrototypeIncludes(union, value))
        throw new ERR_INVALID_ARG_TYPE3(name, `('${ArrayPrototypeJoin(union, "|")}')`, value);
    }
    var linkValueRegExp = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
    function validateLinkHeaderFormat(value, name) {
      if (typeof value === "undefined" || !RegExpPrototypeExec(linkValueRegExp, value))
        throw new ERR_INVALID_ARG_VALUE(name, value, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
    }
    function validateLinkHeaderValue(hints) {
      if (typeof hints === "string")
        return validateLinkHeaderFormat(hints, "hints"), hints;
      else if (ArrayIsArray(hints)) {
        let hintsLength = hints.length, result = "";
        if (hintsLength === 0)
          return result;
        for (let i2 = 0;i2 < hintsLength; i2++) {
          let link = hints[i2];
          if (validateLinkHeaderFormat(link, "hints"), result += link, i2 !== hintsLength - 1)
            result += ", ";
        }
        return result;
      }
      throw new ERR_INVALID_ARG_VALUE("hints", hints, 'must be an array or string of format "</styles.css>; rel=preload; as=style"');
    }
    module2.exports = { isInt32, isUint32, parseFileMode, validateArray, validateStringArray, validateBooleanArray, validateAbortSignalArray, validateBoolean: validateBoolean2, validateBuffer, validateDictionary, validateEncoding, validateFunction, validateInt32, validateInteger, validateNumber: validateNumber3, validateObject, validateOneOf, validatePlainFunction, validatePort, validateSignalName, validateString, validateUint32, validateUndefined, validateUnion, validateAbortSignal: validateAbortSignal2, validateLinkHeaderValue };
  });
  var require_process = __commonJS2((exports2, module2) => {
    module2.exports = globalThis.process;
  });
  var require_utils = __commonJS2((exports2, module2) => {
    var { SymbolAsyncIterator, SymbolIterator, SymbolFor: SymbolFor2 } = require_primordials(), kIsDestroyed = SymbolFor2("nodejs.stream.destroyed"), kIsErrored = SymbolFor2("nodejs.stream.errored"), kIsReadable = SymbolFor2("nodejs.stream.readable"), kIsWritable = SymbolFor2("nodejs.stream.writable"), kIsDisturbed = SymbolFor2("nodejs.stream.disturbed"), kIsClosedPromise = SymbolFor2("nodejs.webstream.isClosedPromise"), kControllerErrorFunction = SymbolFor2("nodejs.webstream.controllerErrorFunction");
    function isReadableNodeStream(obj, strict = false) {
      var _obj$_readableState;
      return !!(obj && typeof obj.pipe === "function" && typeof obj.on === "function" && (!strict || typeof obj.pause === "function" && typeof obj.resume === "function") && (!obj._writableState || ((_obj$_readableState = obj._readableState) === null || _obj$_readableState === undefined ? undefined : _obj$_readableState.readable) !== false) && (!obj._writableState || obj._readableState));
    }
    function isWritableNodeStream(obj) {
      var _obj$_writableState;
      return !!(obj && typeof obj.write === "function" && typeof obj.on === "function" && (!obj._readableState || ((_obj$_writableState = obj._writableState) === null || _obj$_writableState === undefined ? undefined : _obj$_writableState.writable) !== false));
    }
    function isDuplexNodeStream(obj) {
      return !!(obj && typeof obj.pipe === "function" && obj._readableState && typeof obj.on === "function" && typeof obj.write === "function");
    }
    function isNodeStream(obj) {
      return obj && (obj._readableState || obj._writableState || typeof obj.write === "function" && typeof obj.on === "function" || typeof obj.pipe === "function" && typeof obj.on === "function");
    }
    function isReadableStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.pipeThrough === "function" && typeof obj.getReader === "function" && typeof obj.cancel === "function");
    }
    function isWritableStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.getWriter === "function" && typeof obj.abort === "function");
    }
    function isTransformStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.readable === "object" && typeof obj.writable === "object");
    }
    function isWebStream(obj) {
      return isReadableStream(obj) || isWritableStream(obj) || isTransformStream(obj);
    }
    function isIterable(obj, isAsync) {
      if (obj == null)
        return false;
      if (isAsync === true)
        return typeof obj[SymbolAsyncIterator] === "function";
      if (isAsync === false)
        return typeof obj[SymbolIterator] === "function";
      return typeof obj[SymbolAsyncIterator] === "function" || typeof obj[SymbolIterator] === "function";
    }
    function isDestroyed(stream) {
      if (!isNodeStream(stream))
        return null;
      let { _writableState: wState, _readableState: rState } = stream, state = wState || rState;
      return !!(stream.destroyed || stream[kIsDestroyed] || state !== null && state !== undefined && state.destroyed);
    }
    function isWritableEnded(stream) {
      if (!isWritableNodeStream(stream))
        return null;
      if (stream.writableEnded === true)
        return true;
      let wState = stream._writableState;
      if (wState !== null && wState !== undefined && wState.errored)
        return false;
      if (typeof (wState === null || wState === undefined ? undefined : wState.ended) !== "boolean")
        return null;
      return wState.ended;
    }
    function isWritableFinished(stream, strict) {
      if (!isWritableNodeStream(stream))
        return null;
      if (stream.writableFinished === true)
        return true;
      let wState = stream._writableState;
      if (wState !== null && wState !== undefined && wState.errored)
        return false;
      if (typeof (wState === null || wState === undefined ? undefined : wState.finished) !== "boolean")
        return null;
      return !!(wState.finished || strict === false && wState.ended === true && wState.length === 0);
    }
    function isReadableEnded(stream) {
      if (!isReadableNodeStream(stream))
        return null;
      if (stream.readableEnded === true)
        return true;
      let rState = stream._readableState;
      if (!rState || rState.errored)
        return false;
      if (typeof (rState === null || rState === undefined ? undefined : rState.ended) !== "boolean")
        return null;
      return rState.ended;
    }
    function isReadableFinished(stream, strict) {
      if (!isReadableNodeStream(stream))
        return null;
      let rState = stream._readableState;
      if (rState !== null && rState !== undefined && rState.errored)
        return false;
      if (typeof (rState === null || rState === undefined ? undefined : rState.endEmitted) !== "boolean")
        return null;
      return !!(rState.endEmitted || strict === false && rState.ended === true && rState.length === 0);
    }
    function isReadable(stream) {
      if (stream && stream[kIsReadable] != null)
        return stream[kIsReadable];
      if (typeof (stream === null || stream === undefined ? undefined : stream.readable) !== "boolean")
        return null;
      if (isDestroyed(stream))
        return false;
      return isReadableNodeStream(stream) && stream.readable && !isReadableFinished(stream);
    }
    function isWritable(stream) {
      if (stream && stream[kIsWritable] != null)
        return stream[kIsWritable];
      if (typeof (stream === null || stream === undefined ? undefined : stream.writable) !== "boolean")
        return null;
      if (isDestroyed(stream))
        return false;
      return isWritableNodeStream(stream) && stream.writable && !isWritableEnded(stream);
    }
    function isFinished(stream, opts) {
      if (!isNodeStream(stream))
        return null;
      if (isDestroyed(stream))
        return true;
      if ((opts === null || opts === undefined ? undefined : opts.readable) !== false && isReadable(stream))
        return false;
      if ((opts === null || opts === undefined ? undefined : opts.writable) !== false && isWritable(stream))
        return false;
      return true;
    }
    function isWritableErrored(stream) {
      var _stream$_writableStat, _stream$_writableStat2;
      if (!isNodeStream(stream))
        return null;
      if (stream.writableErrored)
        return stream.writableErrored;
      return (_stream$_writableStat = (_stream$_writableStat2 = stream._writableState) === null || _stream$_writableStat2 === undefined ? undefined : _stream$_writableStat2.errored) !== null && _stream$_writableStat !== undefined ? _stream$_writableStat : null;
    }
    function isReadableErrored(stream) {
      var _stream$_readableStat, _stream$_readableStat2;
      if (!isNodeStream(stream))
        return null;
      if (stream.readableErrored)
        return stream.readableErrored;
      return (_stream$_readableStat = (_stream$_readableStat2 = stream._readableState) === null || _stream$_readableStat2 === undefined ? undefined : _stream$_readableStat2.errored) !== null && _stream$_readableStat !== undefined ? _stream$_readableStat : null;
    }
    function isClosed(stream) {
      if (!isNodeStream(stream))
        return null;
      if (typeof stream.closed === "boolean")
        return stream.closed;
      let { _writableState: wState, _readableState: rState } = stream;
      if (typeof (wState === null || wState === undefined ? undefined : wState.closed) === "boolean" || typeof (rState === null || rState === undefined ? undefined : rState.closed) === "boolean")
        return (wState === null || wState === undefined ? undefined : wState.closed) || (rState === null || rState === undefined ? undefined : rState.closed);
      if (typeof stream._closed === "boolean" && isOutgoingMessage(stream))
        return stream._closed;
      return null;
    }
    function isOutgoingMessage(stream) {
      return typeof stream._closed === "boolean" && typeof stream._defaultKeepAlive === "boolean" && typeof stream._removedConnection === "boolean" && typeof stream._removedContLen === "boolean";
    }
    function isServerResponse(stream) {
      return typeof stream._sent100 === "boolean" && isOutgoingMessage(stream);
    }
    function isServerRequest(stream) {
      var _stream$req;
      return typeof stream._consuming === "boolean" && typeof stream._dumped === "boolean" && ((_stream$req = stream.req) === null || _stream$req === undefined ? undefined : _stream$req.upgradeOrConnect) === undefined;
    }
    function willEmitClose(stream) {
      if (!isNodeStream(stream))
        return null;
      let { _writableState: wState, _readableState: rState } = stream, state = wState || rState;
      return !state && isServerResponse(stream) || !!(state && state.autoDestroy && state.emitClose && state.closed === false);
    }
    function isDisturbed(stream) {
      var _stream$kIsDisturbed;
      return !!(stream && ((_stream$kIsDisturbed = stream[kIsDisturbed]) !== null && _stream$kIsDisturbed !== undefined ? _stream$kIsDisturbed : stream.readableDidRead || stream.readableAborted));
    }
    function isErrored(stream) {
      var _ref, _ref2, _ref3, _ref4, _ref5, _stream$kIsErrored, _stream$_readableStat3, _stream$_writableStat3, _stream$_readableStat4, _stream$_writableStat4;
      return !!(stream && ((_ref = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_stream$kIsErrored = stream[kIsErrored]) !== null && _stream$kIsErrored !== undefined ? _stream$kIsErrored : stream.readableErrored) !== null && _ref5 !== undefined ? _ref5 : stream.writableErrored) !== null && _ref4 !== undefined ? _ref4 : (_stream$_readableStat3 = stream._readableState) === null || _stream$_readableStat3 === undefined ? undefined : _stream$_readableStat3.errorEmitted) !== null && _ref3 !== undefined ? _ref3 : (_stream$_writableStat3 = stream._writableState) === null || _stream$_writableStat3 === undefined ? undefined : _stream$_writableStat3.errorEmitted) !== null && _ref2 !== undefined ? _ref2 : (_stream$_readableStat4 = stream._readableState) === null || _stream$_readableStat4 === undefined ? undefined : _stream$_readableStat4.errored) !== null && _ref !== undefined ? _ref : (_stream$_writableStat4 = stream._writableState) === null || _stream$_writableStat4 === undefined ? undefined : _stream$_writableStat4.errored));
    }
    module2.exports = { isDestroyed, kIsDestroyed, isDisturbed, kIsDisturbed, isErrored, kIsErrored, isReadable, kIsReadable, kIsClosedPromise, kControllerErrorFunction, kIsWritable, isClosed, isDuplexNodeStream, isFinished, isIterable, isReadableNodeStream, isReadableStream, isReadableEnded, isReadableFinished, isReadableErrored, isNodeStream, isWebStream, isWritable, isWritableNodeStream, isWritableStream, isWritableEnded, isWritableFinished, isWritableErrored, isServerRequest, isServerResponse, willEmitClose, isTransformStream };
  });
  var require_end_of_stream = __commonJS2((exports2, module2) => {
    var process2 = require_process(), { AbortError: AbortError2, codes } = require_errors(), { ERR_INVALID_ARG_TYPE: ERR_INVALID_ARG_TYPE3, ERR_STREAM_PREMATURE_CLOSE } = codes, { kEmptyObject, once: once3 } = require_util(), { validateAbortSignal: validateAbortSignal2, validateFunction, validateObject, validateBoolean: validateBoolean2 } = require_validators(), { Promise: Promise2, PromisePrototypeThen, SymbolDispose } = require_primordials(), { isClosed, isReadable, isReadableNodeStream, isReadableStream, isReadableFinished, isReadableErrored, isWritable, isWritableNodeStream, isWritableStream, isWritableFinished, isWritableErrored, isNodeStream, willEmitClose: _willEmitClose, kIsClosedPromise } = require_utils(), addAbortListener2;
    function isRequest(stream) {
      return stream.setHeader && typeof stream.abort === "function";
    }
    var nop = () => {};
    function eos(stream, options, callback) {
      var _options$readable, _options$writable;
      if (arguments.length === 2)
        callback = options, options = kEmptyObject;
      else if (options == null)
        options = kEmptyObject;
      else
        validateObject(options, "options");
      if (validateFunction(callback, "callback"), validateAbortSignal2(options.signal, "options.signal"), callback = once3(callback), isReadableStream(stream) || isWritableStream(stream))
        return eosWeb(stream, options, callback);
      if (!isNodeStream(stream))
        throw new ERR_INVALID_ARG_TYPE3("stream", ["ReadableStream", "WritableStream", "Stream"], stream);
      let readable = (_options$readable = options.readable) !== null && _options$readable !== undefined ? _options$readable : isReadableNodeStream(stream), writable = (_options$writable = options.writable) !== null && _options$writable !== undefined ? _options$writable : isWritableNodeStream(stream), wState = stream._writableState, rState = stream._readableState, onlegacyfinish = () => {
        if (!stream.writable)
          onfinish();
      }, willEmitClose = _willEmitClose(stream) && isReadableNodeStream(stream) === readable && isWritableNodeStream(stream) === writable, writableFinished = isWritableFinished(stream, false), onfinish = () => {
        if (writableFinished = true, stream.destroyed)
          willEmitClose = false;
        if (willEmitClose && (!stream.readable || readable))
          return;
        if (!readable || readableFinished)
          callback.call(stream);
      }, readableFinished = isReadableFinished(stream, false), onend = () => {
        if (readableFinished = true, stream.destroyed)
          willEmitClose = false;
        if (willEmitClose && (!stream.writable || writable))
          return;
        if (!writable || writableFinished)
          callback.call(stream);
      }, onerror = (err) => {
        callback.call(stream, err);
      }, closed = isClosed(stream), onclose = () => {
        closed = true;
        let errored = isWritableErrored(stream) || isReadableErrored(stream);
        if (errored && typeof errored !== "boolean")
          return callback.call(stream, errored);
        if (readable && !readableFinished && isReadableNodeStream(stream, true)) {
          if (!isReadableFinished(stream, false))
            return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE);
        }
        if (writable && !writableFinished) {
          if (!isWritableFinished(stream, false))
            return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE);
        }
        callback.call(stream);
      }, onclosed = () => {
        closed = true;
        let errored = isWritableErrored(stream) || isReadableErrored(stream);
        if (errored && typeof errored !== "boolean")
          return callback.call(stream, errored);
        callback.call(stream);
      }, onrequest = () => {
        stream.req.on("finish", onfinish);
      };
      if (isRequest(stream)) {
        if (stream.on("complete", onfinish), !willEmitClose)
          stream.on("abort", onclose);
        if (stream.req)
          onrequest();
        else
          stream.on("request", onrequest);
      } else if (writable && !wState)
        stream.on("end", onlegacyfinish), stream.on("close", onlegacyfinish);
      if (!willEmitClose && typeof stream.aborted === "boolean")
        stream.on("aborted", onclose);
      if (stream.on("end", onend), stream.on("finish", onfinish), options.error !== false)
        stream.on("error", onerror);
      if (stream.on("close", onclose), closed)
        process2.nextTick(onclose);
      else if (wState !== null && wState !== undefined && wState.errorEmitted || rState !== null && rState !== undefined && rState.errorEmitted) {
        if (!willEmitClose)
          process2.nextTick(onclosed);
      } else if (!readable && (!willEmitClose || isReadable(stream)) && (writableFinished || isWritable(stream) === false))
        process2.nextTick(onclosed);
      else if (!writable && (!willEmitClose || isWritable(stream)) && (readableFinished || isReadable(stream) === false))
        process2.nextTick(onclosed);
      else if (rState && stream.req && stream.aborted)
        process2.nextTick(onclosed);
      let cleanup = () => {
        if (callback = nop, stream.removeListener("aborted", onclose), stream.removeListener("complete", onfinish), stream.removeListener("abort", onclose), stream.removeListener("request", onrequest), stream.req)
          stream.req.removeListener("finish", onfinish);
        stream.removeListener("end", onlegacyfinish), stream.removeListener("close", onlegacyfinish), stream.removeListener("finish", onfinish), stream.removeListener("end", onend), stream.removeListener("error", onerror), stream.removeListener("close", onclose);
      };
      if (options.signal && !closed) {
        let abort = () => {
          let endCallback = callback;
          cleanup(), endCallback.call(stream, new AbortError2(undefined, { cause: options.signal.reason }));
        };
        if (options.signal.aborted)
          process2.nextTick(abort);
        else {
          addAbortListener2 = addAbortListener2 || require_util().addAbortListener;
          let disposable = addAbortListener2(options.signal, abort), originalCallback = callback;
          callback = once3((...args) => {
            disposable[SymbolDispose](), originalCallback.apply(stream, args);
          });
        }
      }
      return cleanup;
    }
    function eosWeb(stream, options, callback) {
      let isAborted = false, abort = nop;
      if (options.signal)
        if (abort = () => {
          isAborted = true, callback.call(stream, new AbortError2(undefined, { cause: options.signal.reason }));
        }, options.signal.aborted)
          process2.nextTick(abort);
        else {
          addAbortListener2 = addAbortListener2 || require_util().addAbortListener;
          let disposable = addAbortListener2(options.signal, abort), originalCallback = callback;
          callback = once3((...args) => {
            disposable[SymbolDispose](), originalCallback.apply(stream, args);
          });
        }
      let resolverFn = (...args) => {
        if (!isAborted)
          process2.nextTick(() => callback.apply(stream, args));
      };
      return PromisePrototypeThen(stream[kIsClosedPromise].promise, resolverFn, resolverFn), nop;
    }
    function finished(stream, opts) {
      var _opts;
      let autoCleanup = false;
      if (opts === null)
        opts = kEmptyObject;
      if ((_opts = opts) !== null && _opts !== undefined && _opts.cleanup)
        validateBoolean2(opts.cleanup, "cleanup"), autoCleanup = opts.cleanup;
      return new Promise2((resolve2, reject) => {
        let cleanup = eos(stream, opts, (err) => {
          if (autoCleanup)
            cleanup();
          if (err)
            reject(err);
          else
            resolve2();
        });
      });
    }
    module2.exports = eos;
    module2.exports.finished = finished;
  });
  var require_destroy = __commonJS2((exports2, module2) => {
    var process2 = require_process(), { aggregateTwoErrors, codes: { ERR_MULTIPLE_CALLBACK }, AbortError: AbortError2 } = require_errors(), { Symbol: Symbol2 } = require_primordials(), { kIsDestroyed, isDestroyed, isFinished, isServerRequest } = require_utils(), kDestroy = Symbol2("kDestroy"), kConstruct = Symbol2("kConstruct");
    function checkError(err, w, r) {
      if (err) {
        if (err.stack, w && !w.errored)
          w.errored = err;
        if (r && !r.errored)
          r.errored = err;
      }
    }
    function destroy(err, cb) {
      let r = this._readableState, w = this._writableState, s = w || r;
      if (w !== null && w !== undefined && w.destroyed || r !== null && r !== undefined && r.destroyed) {
        if (typeof cb === "function")
          cb();
        return this;
      }
      if (checkError(err, w, r), w)
        w.destroyed = true;
      if (r)
        r.destroyed = true;
      if (!s.constructed)
        this.once(kDestroy, function(er) {
          _destroy(this, aggregateTwoErrors(er, err), cb);
        });
      else
        _destroy(this, err, cb);
      return this;
    }
    function _destroy(self2, err, cb) {
      let called = false;
      function onDestroy(err2) {
        if (called)
          return;
        called = true;
        let { _readableState: r, _writableState: w } = self2;
        if (checkError(err2, w, r), w)
          w.closed = true;
        if (r)
          r.closed = true;
        if (typeof cb === "function")
          cb(err2);
        if (err2)
          process2.nextTick(emitErrorCloseNT, self2, err2);
        else
          process2.nextTick(emitCloseNT, self2);
      }
      try {
        self2._destroy(err || null, onDestroy);
      } catch (err2) {
        onDestroy(err2);
      }
    }
    function emitErrorCloseNT(self2, err) {
      emitErrorNT(self2, err), emitCloseNT(self2);
    }
    function emitCloseNT(self2) {
      let { _readableState: r, _writableState: w } = self2;
      if (w)
        w.closeEmitted = true;
      if (r)
        r.closeEmitted = true;
      if (w !== null && w !== undefined && w.emitClose || r !== null && r !== undefined && r.emitClose)
        self2.emit("close");
    }
    function emitErrorNT(self2, err) {
      let { _readableState: r, _writableState: w } = self2;
      if (w !== null && w !== undefined && w.errorEmitted || r !== null && r !== undefined && r.errorEmitted)
        return;
      if (w)
        w.errorEmitted = true;
      if (r)
        r.errorEmitted = true;
      self2.emit("error", err);
    }
    function undestroy() {
      let r = this._readableState, w = this._writableState;
      if (r)
        r.constructed = true, r.closed = false, r.closeEmitted = false, r.destroyed = false, r.errored = null, r.errorEmitted = false, r.reading = false, r.ended = r.readable === false, r.endEmitted = r.readable === false;
      if (w)
        w.constructed = true, w.destroyed = false, w.closed = false, w.closeEmitted = false, w.errored = null, w.errorEmitted = false, w.finalCalled = false, w.prefinished = false, w.ended = w.writable === false, w.ending = w.writable === false, w.finished = w.writable === false;
    }
    function errorOrDestroy(stream, err, sync) {
      let { _readableState: r, _writableState: w } = stream;
      if (w !== null && w !== undefined && w.destroyed || r !== null && r !== undefined && r.destroyed)
        return this;
      if (r !== null && r !== undefined && r.autoDestroy || w !== null && w !== undefined && w.autoDestroy)
        stream.destroy(err);
      else if (err) {
        if (err.stack, w && !w.errored)
          w.errored = err;
        if (r && !r.errored)
          r.errored = err;
        if (sync)
          process2.nextTick(emitErrorNT, stream, err);
        else
          emitErrorNT(stream, err);
      }
    }
    function construct(stream, cb) {
      if (typeof stream._construct !== "function")
        return;
      let { _readableState: r, _writableState: w } = stream;
      if (r)
        r.constructed = false;
      if (w)
        w.constructed = false;
      if (stream.once(kConstruct, cb), stream.listenerCount(kConstruct) > 1)
        return;
      process2.nextTick(constructNT, stream);
    }
    function constructNT(stream) {
      let called = false;
      function onConstruct(err) {
        if (called) {
          errorOrDestroy(stream, err !== null && err !== undefined ? err : new ERR_MULTIPLE_CALLBACK);
          return;
        }
        called = true;
        let { _readableState: r, _writableState: w } = stream, s = w || r;
        if (r)
          r.constructed = true;
        if (w)
          w.constructed = true;
        if (s.destroyed)
          stream.emit(kDestroy, err);
        else if (err)
          errorOrDestroy(stream, err, true);
        else
          process2.nextTick(emitConstructNT, stream);
      }
      try {
        stream._construct((err) => {
          process2.nextTick(onConstruct, err);
        });
      } catch (err) {
        process2.nextTick(onConstruct, err);
      }
    }
    function emitConstructNT(stream) {
      stream.emit(kConstruct);
    }
    function isRequest(stream) {
      return (stream === null || stream === undefined ? undefined : stream.setHeader) && typeof stream.abort === "function";
    }
    function emitCloseLegacy(stream) {
      stream.emit("close");
    }
    function emitErrorCloseLegacy(stream, err) {
      stream.emit("error", err), process2.nextTick(emitCloseLegacy, stream);
    }
    function destroyer(stream, err) {
      if (!stream || isDestroyed(stream))
        return;
      if (!err && !isFinished(stream))
        err = new AbortError2;
      if (isServerRequest(stream))
        stream.socket = null, stream.destroy(err);
      else if (isRequest(stream))
        stream.abort();
      else if (isRequest(stream.req))
        stream.req.abort();
      else if (typeof stream.destroy === "function")
        stream.destroy(err);
      else if (typeof stream.close === "function")
        stream.close();
      else if (err)
        process2.nextTick(emitErrorCloseLegacy, stream, err);
      else
        process2.nextTick(emitCloseLegacy, stream);
      if (!stream.destroyed)
        stream[kIsDestroyed] = true;
    }
    module2.exports = { construct, destroyer, destroy, undestroy, errorOrDestroy };
  });
  var require_legacy = __commonJS2((exports2, module2) => {
    var { ArrayIsArray, ObjectSetPrototypeOf } = require_primordials(), { EventEmitter: EE } = (init_events(), __toCommonJS(exports_events));
    function Stream(opts) {
      EE.call(this, opts);
    }
    ObjectSetPrototypeOf(Stream.prototype, EE.prototype);
    ObjectSetPrototypeOf(Stream, EE);
    Stream.prototype.pipe = function(dest, options) {
      let source = this;
      function ondata(chunk) {
        if (dest.writable && dest.write(chunk) === false && source.pause)
          source.pause();
      }
      source.on("data", ondata);
      function ondrain() {
        if (source.readable && source.resume)
          source.resume();
      }
      if (dest.on("drain", ondrain), !dest._isStdio && (!options || options.end !== false))
        source.on("end", onend), source.on("close", onclose);
      let didOnEnd = false;
      function onend() {
        if (didOnEnd)
          return;
        didOnEnd = true, dest.end();
      }
      function onclose() {
        if (didOnEnd)
          return;
        if (didOnEnd = true, typeof dest.destroy === "function")
          dest.destroy();
      }
      function onerror(er) {
        if (cleanup(), EE.listenerCount(this, "error") === 0)
          this.emit("error", er);
      }
      prependListener2(source, "error", onerror), prependListener2(dest, "error", onerror);
      function cleanup() {
        source.removeListener("data", ondata), dest.removeListener("drain", ondrain), source.removeListener("end", onend), source.removeListener("close", onclose), source.removeListener("error", onerror), dest.removeListener("error", onerror), source.removeListener("end", cleanup), source.removeListener("close", cleanup), dest.removeListener("close", cleanup);
      }
      return source.on("end", cleanup), source.on("close", cleanup), dest.on("close", cleanup), dest.emit("pipe", source), dest;
    };
    function prependListener2(emitter, event, fn) {
      if (typeof emitter.prependListener === "function")
        return emitter.prependListener(event, fn);
      if (!emitter._events || !emitter._events[event])
        emitter.on(event, fn);
      else if (ArrayIsArray(emitter._events[event]))
        emitter._events[event].unshift(fn);
      else
        emitter._events[event] = [fn, emitter._events[event]];
    }
    module2.exports = { Stream, prependListener: prependListener2 };
  });
  var require_add_abort_signal = __commonJS2((exports2, module2) => {
    var { SymbolDispose } = require_primordials(), { AbortError: AbortError2, codes } = require_errors(), { isNodeStream, isWebStream, kControllerErrorFunction } = require_utils(), eos = require_end_of_stream(), { ERR_INVALID_ARG_TYPE: ERR_INVALID_ARG_TYPE3 } = codes, addAbortListener2, validateAbortSignal2 = (signal, name) => {
      if (typeof signal !== "object" || !("aborted" in signal))
        throw new ERR_INVALID_ARG_TYPE3(name, "AbortSignal", signal);
    };
    module2.exports.addAbortSignal = function addAbortSignal(signal, stream) {
      if (validateAbortSignal2(signal, "signal"), !isNodeStream(stream) && !isWebStream(stream))
        throw new ERR_INVALID_ARG_TYPE3("stream", ["ReadableStream", "WritableStream", "Stream"], stream);
      return module2.exports.addAbortSignalNoValidate(signal, stream);
    };
    module2.exports.addAbortSignalNoValidate = function(signal, stream) {
      if (typeof signal !== "object" || !("aborted" in signal))
        return stream;
      let onAbort = isNodeStream(stream) ? () => {
        stream.destroy(new AbortError2(undefined, { cause: signal.reason }));
      } : () => {
        stream[kControllerErrorFunction](new AbortError2(undefined, { cause: signal.reason }));
      };
      if (signal.aborted)
        onAbort();
      else {
        addAbortListener2 = addAbortListener2 || require_util().addAbortListener;
        let disposable = addAbortListener2(signal, onAbort);
        eos(stream, disposable[SymbolDispose]);
      }
      return stream;
    };
  });
  var require_buffer_list = __commonJS2((exports2, module2) => {
    var { StringPrototypeSlice, SymbolIterator, TypedArrayPrototypeSet, Uint8Array: Uint8Array2 } = require_primordials(), { Buffer: Buffer3 } = (init_buffer(), __toCommonJS(exports_buffer)), { inspect: inspect3 } = require_util();
    module2.exports = class BufferList {
      constructor() {
        this.head = null, this.tail = null, this.length = 0;
      }
      push(v) {
        let entry = { data: v, next: null };
        if (this.length > 0)
          this.tail.next = entry;
        else
          this.head = entry;
        this.tail = entry, ++this.length;
      }
      unshift(v) {
        let entry = { data: v, next: this.head };
        if (this.length === 0)
          this.tail = entry;
        this.head = entry, ++this.length;
      }
      shift() {
        if (this.length === 0)
          return;
        let ret = this.head.data;
        if (this.length === 1)
          this.head = this.tail = null;
        else
          this.head = this.head.next;
        return --this.length, ret;
      }
      clear() {
        this.head = this.tail = null, this.length = 0;
      }
      join(s) {
        if (this.length === 0)
          return "";
        let p = this.head, ret = "" + p.data;
        while ((p = p.next) !== null)
          ret += s + p.data;
        return ret;
      }
      concat(n) {
        if (this.length === 0)
          return Buffer3.alloc(0);
        let ret = Buffer3.allocUnsafe(n >>> 0), p = this.head, i2 = 0;
        while (p)
          TypedArrayPrototypeSet(ret, p.data, i2), i2 += p.data.length, p = p.next;
        return ret;
      }
      consume(n, hasStrings) {
        let data = this.head.data;
        if (n < data.length) {
          let slice2 = data.slice(0, n);
          return this.head.data = data.slice(n), slice2;
        }
        if (n === data.length)
          return this.shift();
        return hasStrings ? this._getString(n) : this._getBuffer(n);
      }
      first() {
        return this.head.data;
      }
      *[SymbolIterator]() {
        for (let p = this.head;p; p = p.next)
          yield p.data;
      }
      _getString(n) {
        let ret = "", p = this.head, c = 0;
        do {
          let str = p.data;
          if (n > str.length)
            ret += str, n -= str.length;
          else {
            if (n === str.length)
              if (ret += str, ++c, p.next)
                this.head = p.next;
              else
                this.head = this.tail = null;
            else
              ret += StringPrototypeSlice(str, 0, n), this.head = p, p.data = StringPrototypeSlice(str, n);
            break;
          }
          ++c;
        } while ((p = p.next) !== null);
        return this.length -= c, ret;
      }
      _getBuffer(n) {
        let ret = Buffer3.allocUnsafe(n), retLen = n, p = this.head, c = 0;
        do {
          let buf = p.data;
          if (n > buf.length)
            TypedArrayPrototypeSet(ret, buf, retLen - n), n -= buf.length;
          else {
            if (n === buf.length)
              if (TypedArrayPrototypeSet(ret, buf, retLen - n), ++c, p.next)
                this.head = p.next;
              else
                this.head = this.tail = null;
            else
              TypedArrayPrototypeSet(ret, new Uint8Array2(buf.buffer, buf.byteOffset, n), retLen - n), this.head = p, p.data = buf.slice(n);
            break;
          }
          ++c;
        } while ((p = p.next) !== null);
        return this.length -= c, ret;
      }
      [Symbol.for("nodejs.util.inspect.custom")](_, options) {
        return inspect3(this, { ...options, depth: 0, customInspect: false });
      }
    };
  });
  var require_state = __commonJS2((exports2, module2) => {
    var { MathFloor, NumberIsInteger } = require_primordials(), { validateInteger } = require_validators(), { ERR_INVALID_ARG_VALUE } = require_errors().codes, defaultHighWaterMarkBytes = 16384, defaultHighWaterMarkObjectMode = 16;
    function highWaterMarkFrom(options, isDuplex, duplexKey) {
      return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
    }
    function getDefaultHighWaterMark(objectMode) {
      return objectMode ? defaultHighWaterMarkObjectMode : defaultHighWaterMarkBytes;
    }
    function setDefaultHighWaterMark(objectMode, value) {
      if (validateInteger(value, "value", 0), objectMode)
        defaultHighWaterMarkObjectMode = value;
      else
        defaultHighWaterMarkBytes = value;
    }
    function getHighWaterMark(state, options, duplexKey, isDuplex) {
      let hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
      if (hwm != null) {
        if (!NumberIsInteger(hwm) || hwm < 0) {
          let name = isDuplex ? `options.${duplexKey}` : "options.highWaterMark";
          throw new ERR_INVALID_ARG_VALUE(name, hwm);
        }
        return MathFloor(hwm);
      }
      return getDefaultHighWaterMark(state.objectMode);
    }
    module2.exports = { getHighWaterMark, getDefaultHighWaterMark, setDefaultHighWaterMark };
  });
  var require_safe_buffer = __commonJS2((exports2, module2) => {
    /*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
    var buffer = (init_buffer(), __toCommonJS(exports_buffer)), Buffer3 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src)
        dst[key] = src[key];
    }
    if (Buffer3.from && Buffer3.alloc && Buffer3.allocUnsafe && Buffer3.allocUnsafeSlow)
      module2.exports = buffer;
    else
      copyProps(buffer, exports2), exports2.Buffer = SafeBuffer;
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer3(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer3.prototype);
    copyProps(Buffer3, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number")
        throw new TypeError("Argument must not be a number");
      return Buffer3(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill2, encoding) {
      if (typeof size !== "number")
        throw new TypeError("Argument must be a number");
      var buf = Buffer3(size);
      if (fill2 !== undefined)
        if (typeof encoding === "string")
          buf.fill(fill2, encoding);
        else
          buf.fill(fill2);
      else
        buf.fill(0);
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number")
        throw new TypeError("Argument must be a number");
      return Buffer3(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number")
        throw new TypeError("Argument must be a number");
      return buffer.SlowBuffer(size);
    };
  });
  var require_string_decoder = __commonJS2((exports2) => {
    var Buffer3 = require_safe_buffer().Buffer, isEncoding2 = Buffer3.isEncoding || function(encoding) {
      switch (encoding = "" + encoding, encoding && encoding.toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
        case "raw":
          return true;
        default:
          return false;
      }
    };
    function _normalizeEncoding(enc) {
      if (!enc)
        return "utf8";
      var retried;
      while (true)
        switch (enc) {
          case "utf8":
          case "utf-8":
            return "utf8";
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return "utf16le";
          case "latin1":
          case "binary":
            return "latin1";
          case "base64":
          case "ascii":
          case "hex":
            return enc;
          default:
            if (retried)
              return;
            enc = ("" + enc).toLowerCase(), retried = true;
        }
    }
    function normalizeEncoding(enc) {
      var nenc = _normalizeEncoding(enc);
      if (typeof nenc !== "string" && (Buffer3.isEncoding === isEncoding2 || !isEncoding2(enc)))
        throw new Error("Unknown encoding: " + enc);
      return nenc || enc;
    }
    exports2.StringDecoder = StringDecoder;
    function StringDecoder(encoding) {
      this.encoding = normalizeEncoding(encoding);
      var nb;
      switch (this.encoding) {
        case "utf16le":
          this.text = utf16Text, this.end = utf16End, nb = 4;
          break;
        case "utf8":
          this.fillLast = utf8FillLast, nb = 4;
          break;
        case "base64":
          this.text = base64Text, this.end = base64End, nb = 3;
          break;
        default:
          this.write = simpleWrite, this.end = simpleEnd;
          return;
      }
      this.lastNeed = 0, this.lastTotal = 0, this.lastChar = Buffer3.allocUnsafe(nb);
    }
    StringDecoder.prototype.write = function(buf) {
      if (buf.length === 0)
        return "";
      var r, i2;
      if (this.lastNeed) {
        if (r = this.fillLast(buf), r === undefined)
          return "";
        i2 = this.lastNeed, this.lastNeed = 0;
      } else
        i2 = 0;
      if (i2 < buf.length)
        return r ? r + this.text(buf, i2) : this.text(buf, i2);
      return r || "";
    };
    StringDecoder.prototype.end = utf8End;
    StringDecoder.prototype.text = utf8Text;
    StringDecoder.prototype.fillLast = function(buf) {
      if (this.lastNeed <= buf.length)
        return buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length), this.lastNeed -= buf.length;
    };
    function utf8CheckByte(byte) {
      if (byte <= 127)
        return 0;
      else if (byte >> 5 === 6)
        return 2;
      else if (byte >> 4 === 14)
        return 3;
      else if (byte >> 3 === 30)
        return 4;
      return byte >> 6 === 2 ? -1 : -2;
    }
    function utf8CheckIncomplete(self2, buf, i2) {
      var j = buf.length - 1;
      if (j < i2)
        return 0;
      var nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0)
          self2.lastNeed = nb - 1;
        return nb;
      }
      if (--j < i2 || nb === -2)
        return 0;
      if (nb = utf8CheckByte(buf[j]), nb >= 0) {
        if (nb > 0)
          self2.lastNeed = nb - 2;
        return nb;
      }
      if (--j < i2 || nb === -2)
        return 0;
      if (nb = utf8CheckByte(buf[j]), nb >= 0) {
        if (nb > 0)
          if (nb === 2)
            nb = 0;
          else
            self2.lastNeed = nb - 3;
        return nb;
      }
      return 0;
    }
    function utf8CheckExtraBytes(self2, buf, p) {
      if ((buf[0] & 192) !== 128)
        return self2.lastNeed = 0, "�";
      if (self2.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128)
          return self2.lastNeed = 1, "�";
        if (self2.lastNeed > 2 && buf.length > 2) {
          if ((buf[2] & 192) !== 128)
            return self2.lastNeed = 2, "�";
        }
      }
    }
    function utf8FillLast(buf) {
      var p = this.lastTotal - this.lastNeed, r = utf8CheckExtraBytes(this, buf, p);
      if (r !== undefined)
        return r;
      if (this.lastNeed <= buf.length)
        return buf.copy(this.lastChar, p, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
      buf.copy(this.lastChar, p, 0, buf.length), this.lastNeed -= buf.length;
    }
    function utf8Text(buf, i2) {
      var total = utf8CheckIncomplete(this, buf, i2);
      if (!this.lastNeed)
        return buf.toString("utf8", i2);
      this.lastTotal = total;
      var end = buf.length - (total - this.lastNeed);
      return buf.copy(this.lastChar, 0, end), buf.toString("utf8", i2, end);
    }
    function utf8End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed)
        return r + "�";
      return r;
    }
    function utf16Text(buf, i2) {
      if ((buf.length - i2) % 2 === 0) {
        var r = buf.toString("utf16le", i2);
        if (r) {
          var c = r.charCodeAt(r.length - 1);
          if (c >= 55296 && c <= 56319)
            return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = buf[buf.length - 2], this.lastChar[1] = buf[buf.length - 1], r.slice(0, -1);
        }
        return r;
      }
      return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = buf[buf.length - 1], buf.toString("utf16le", i2, buf.length - 1);
    }
    function utf16End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) {
        var end = this.lastTotal - this.lastNeed;
        return r + this.lastChar.toString("utf16le", 0, end);
      }
      return r;
    }
    function base64Text(buf, i2) {
      var n = (buf.length - i2) % 3;
      if (n === 0)
        return buf.toString("base64", i2);
      if (this.lastNeed = 3 - n, this.lastTotal = 3, n === 1)
        this.lastChar[0] = buf[buf.length - 1];
      else
        this.lastChar[0] = buf[buf.length - 2], this.lastChar[1] = buf[buf.length - 1];
      return buf.toString("base64", i2, buf.length - n);
    }
    function base64End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed)
        return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
      return r;
    }
    function simpleWrite(buf) {
      return buf.toString(this.encoding);
    }
    function simpleEnd(buf) {
      return buf && buf.length ? this.write(buf) : "";
    }
  });
  var require_from = __commonJS2((exports2, module2) => {
    var process2 = require_process(), { PromisePrototypeThen, SymbolAsyncIterator, SymbolIterator } = require_primordials(), { Buffer: Buffer3 } = (init_buffer(), __toCommonJS(exports_buffer)), { ERR_INVALID_ARG_TYPE: ERR_INVALID_ARG_TYPE3, ERR_STREAM_NULL_VALUES } = require_errors().codes;
    function from2(Readable, iterable, opts) {
      let iterator;
      if (typeof iterable === "string" || iterable instanceof Buffer3)
        return new Readable({ objectMode: true, ...opts, read() {
          this.push(iterable), this.push(null);
        } });
      let isAsync;
      if (iterable && iterable[SymbolAsyncIterator])
        isAsync = true, iterator = iterable[SymbolAsyncIterator]();
      else if (iterable && iterable[SymbolIterator])
        isAsync = false, iterator = iterable[SymbolIterator]();
      else
        throw new ERR_INVALID_ARG_TYPE3("iterable", ["Iterable"], iterable);
      let readable = new Readable({ objectMode: true, highWaterMark: 1, ...opts }), reading = false;
      readable._read = function() {
        if (!reading)
          reading = true, next();
      }, readable._destroy = function(error, cb) {
        PromisePrototypeThen(close(error), () => process2.nextTick(cb, error), (e) => process2.nextTick(cb, e || error));
      };
      async function close(error) {
        let hadError = error !== undefined && error !== null, hasThrow = typeof iterator.throw === "function";
        if (hadError && hasThrow) {
          let { value, done } = await iterator.throw(error);
          if (await value, done)
            return;
        }
        if (typeof iterator.return === "function") {
          let { value } = await iterator.return();
          await value;
        }
      }
      async function next() {
        for (;; ) {
          try {
            let { value, done } = isAsync ? await iterator.next() : iterator.next();
            if (done)
              readable.push(null);
            else {
              let res = value && typeof value.then === "function" ? await value : value;
              if (res === null)
                throw reading = false, new ERR_STREAM_NULL_VALUES;
              else if (readable.push(res))
                continue;
              else
                reading = false;
            }
          } catch (err) {
            readable.destroy(err);
          }
          break;
        }
      }
      return readable;
    }
    module2.exports = from2;
  });
  var require_readable = __commonJS2((exports2, module2) => {
    var process2 = require_process(), { ArrayPrototypeIndexOf, NumberIsInteger, NumberIsNaN, NumberParseInt, ObjectDefineProperties, ObjectKeys, ObjectSetPrototypeOf, Promise: Promise2, SafeSet, SymbolAsyncDispose, SymbolAsyncIterator, Symbol: Symbol2 } = require_primordials();
    module2.exports = Readable;
    Readable.ReadableState = ReadableState;
    var { EventEmitter: EE } = (init_events(), __toCommonJS(exports_events)), { Stream, prependListener: prependListener2 } = require_legacy(), { Buffer: Buffer3 } = (init_buffer(), __toCommonJS(exports_buffer)), { addAbortSignal } = require_add_abort_signal(), eos = require_end_of_stream(), debug = require_util().debuglog("stream", (fn) => {
      debug = fn;
    }), BufferList = require_buffer_list(), destroyImpl = require_destroy(), { getHighWaterMark, getDefaultHighWaterMark } = require_state(), { aggregateTwoErrors, codes: { ERR_INVALID_ARG_TYPE: ERR_INVALID_ARG_TYPE3, ERR_METHOD_NOT_IMPLEMENTED, ERR_OUT_OF_RANGE: ERR_OUT_OF_RANGE3, ERR_STREAM_PUSH_AFTER_EOF, ERR_STREAM_UNSHIFT_AFTER_END_EVENT }, AbortError: AbortError2 } = require_errors(), { validateObject } = require_validators(), kPaused = Symbol2("kPaused"), { StringDecoder } = require_string_decoder(), from2 = require_from();
    ObjectSetPrototypeOf(Readable.prototype, Stream.prototype);
    ObjectSetPrototypeOf(Readable, Stream);
    var nop = () => {}, { errorOrDestroy } = destroyImpl, kObjectMode = 1, kEnded = 2, kEndEmitted = 4, kReading = 8, kConstructed = 16, kSync = 32, kNeedReadable = 64, kEmittedReadable = 128, kReadableListening = 256, kResumeScheduled = 512, kErrorEmitted = 1024, kEmitClose = 2048, kAutoDestroy = 4096, kDestroyed = 8192, kClosed = 16384, kCloseEmitted = 32768, kMultiAwaitDrain = 65536, kReadingMore = 131072, kDataEmitted = 262144;
    function makeBitMapDescriptor(bit) {
      return { enumerable: false, get() {
        return (this.state & bit) !== 0;
      }, set(value) {
        if (value)
          this.state |= bit;
        else
          this.state &= ~bit;
      } };
    }
    ObjectDefineProperties(ReadableState.prototype, { objectMode: makeBitMapDescriptor(kObjectMode), ended: makeBitMapDescriptor(kEnded), endEmitted: makeBitMapDescriptor(kEndEmitted), reading: makeBitMapDescriptor(kReading), constructed: makeBitMapDescriptor(kConstructed), sync: makeBitMapDescriptor(kSync), needReadable: makeBitMapDescriptor(kNeedReadable), emittedReadable: makeBitMapDescriptor(kEmittedReadable), readableListening: makeBitMapDescriptor(kReadableListening), resumeScheduled: makeBitMapDescriptor(kResumeScheduled), errorEmitted: makeBitMapDescriptor(kErrorEmitted), emitClose: makeBitMapDescriptor(kEmitClose), autoDestroy: makeBitMapDescriptor(kAutoDestroy), destroyed: makeBitMapDescriptor(kDestroyed), closed: makeBitMapDescriptor(kClosed), closeEmitted: makeBitMapDescriptor(kCloseEmitted), multiAwaitDrain: makeBitMapDescriptor(kMultiAwaitDrain), readingMore: makeBitMapDescriptor(kReadingMore), dataEmitted: makeBitMapDescriptor(kDataEmitted) });
    function ReadableState(options, stream, isDuplex) {
      if (typeof isDuplex !== "boolean")
        isDuplex = stream instanceof require_duplex();
      if (this.state = kEmitClose | kAutoDestroy | kConstructed | kSync, options && options.objectMode)
        this.state |= kObjectMode;
      if (isDuplex && options && options.readableObjectMode)
        this.state |= kObjectMode;
      if (this.highWaterMark = options ? getHighWaterMark(this, options, "readableHighWaterMark", isDuplex) : getDefaultHighWaterMark(false), this.buffer = new BufferList, this.length = 0, this.pipes = [], this.flowing = null, this[kPaused] = null, options && options.emitClose === false)
        this.state &= ~kEmitClose;
      if (options && options.autoDestroy === false)
        this.state &= ~kAutoDestroy;
      if (this.errored = null, this.defaultEncoding = options && options.defaultEncoding || "utf8", this.awaitDrainWriters = null, this.decoder = null, this.encoding = null, options && options.encoding)
        this.decoder = new StringDecoder(options.encoding), this.encoding = options.encoding;
    }
    function Readable(options) {
      if (!(this instanceof Readable))
        return new Readable(options);
      let isDuplex = this instanceof require_duplex();
      if (this._readableState = new ReadableState(options, this, isDuplex), options) {
        if (typeof options.read === "function")
          this._read = options.read;
        if (typeof options.destroy === "function")
          this._destroy = options.destroy;
        if (typeof options.construct === "function")
          this._construct = options.construct;
        if (options.signal && !isDuplex)
          addAbortSignal(options.signal, this);
      }
      Stream.call(this, options), destroyImpl.construct(this, () => {
        if (this._readableState.needReadable)
          maybeReadMore(this, this._readableState);
      });
    }
    Readable.prototype.destroy = destroyImpl.destroy;
    Readable.prototype._undestroy = destroyImpl.undestroy;
    Readable.prototype._destroy = function(err, cb) {
      cb(err);
    };
    Readable.prototype[EE.captureRejectionSymbol] = function(err) {
      this.destroy(err);
    };
    Readable.prototype[SymbolAsyncDispose] = function() {
      let error;
      if (!this.destroyed)
        error = this.readableEnded ? null : new AbortError2, this.destroy(error);
      return new Promise2((resolve2, reject) => eos(this, (err) => err && err !== error ? reject(err) : resolve2(null)));
    };
    Readable.prototype.push = function(chunk, encoding) {
      return readableAddChunk(this, chunk, encoding, false);
    };
    Readable.prototype.unshift = function(chunk, encoding) {
      return readableAddChunk(this, chunk, encoding, true);
    };
    function readableAddChunk(stream, chunk, encoding, addToFront) {
      debug("readableAddChunk", chunk);
      let state = stream._readableState, err;
      if ((state.state & kObjectMode) === 0) {
        if (typeof chunk === "string") {
          if (encoding = encoding || state.defaultEncoding, state.encoding !== encoding)
            if (addToFront && state.encoding)
              chunk = Buffer3.from(chunk, encoding).toString(state.encoding);
            else
              chunk = Buffer3.from(chunk, encoding), encoding = "";
        } else if (chunk instanceof Buffer3)
          encoding = "";
        else if (Stream._isUint8Array(chunk))
          chunk = Stream._uint8ArrayToBuffer(chunk), encoding = "";
        else if (chunk != null)
          err = new ERR_INVALID_ARG_TYPE3("chunk", ["string", "Buffer", "Uint8Array"], chunk);
      }
      if (err)
        errorOrDestroy(stream, err);
      else if (chunk === null)
        state.state &= ~kReading, onEofChunk(stream, state);
      else if ((state.state & kObjectMode) !== 0 || chunk && chunk.length > 0)
        if (addToFront)
          if ((state.state & kEndEmitted) !== 0)
            errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT);
          else if (state.destroyed || state.errored)
            return false;
          else
            addChunk(stream, state, chunk, true);
        else if (state.ended)
          errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF);
        else if (state.destroyed || state.errored)
          return false;
        else if (state.state &= ~kReading, state.decoder && !encoding)
          if (chunk = state.decoder.write(chunk), state.objectMode || chunk.length !== 0)
            addChunk(stream, state, chunk, false);
          else
            maybeReadMore(stream, state);
        else
          addChunk(stream, state, chunk, false);
      else if (!addToFront)
        state.state &= ~kReading, maybeReadMore(stream, state);
      return !state.ended && (state.length < state.highWaterMark || state.length === 0);
    }
    function addChunk(stream, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync && stream.listenerCount("data") > 0) {
        if ((state.state & kMultiAwaitDrain) !== 0)
          state.awaitDrainWriters.clear();
        else
          state.awaitDrainWriters = null;
        state.dataEmitted = true, stream.emit("data", chunk);
      } else {
        if (state.length += state.objectMode ? 1 : chunk.length, addToFront)
          state.buffer.unshift(chunk);
        else
          state.buffer.push(chunk);
        if ((state.state & kNeedReadable) !== 0)
          emitReadable(stream);
      }
      maybeReadMore(stream, state);
    }
    Readable.prototype.isPaused = function() {
      let state = this._readableState;
      return state[kPaused] === true || state.flowing === false;
    };
    Readable.prototype.setEncoding = function(enc) {
      let decoder = new StringDecoder(enc);
      this._readableState.decoder = decoder, this._readableState.encoding = this._readableState.decoder.encoding;
      let buffer = this._readableState.buffer, content = "";
      for (let data of buffer)
        content += decoder.write(data);
      if (buffer.clear(), content !== "")
        buffer.push(content);
      return this._readableState.length = content.length, this;
    };
    var MAX_HWM = 1073741824;
    function computeNewHighWaterMark(n) {
      if (n > MAX_HWM)
        throw new ERR_OUT_OF_RANGE3("size", "<= 1GiB", n);
      else
        n--, n |= n >>> 1, n |= n >>> 2, n |= n >>> 4, n |= n >>> 8, n |= n >>> 16, n++;
      return n;
    }
    function howMuchToRead(n, state) {
      if (n <= 0 || state.length === 0 && state.ended)
        return 0;
      if ((state.state & kObjectMode) !== 0)
        return 1;
      if (NumberIsNaN(n)) {
        if (state.flowing && state.length)
          return state.buffer.first().length;
        return state.length;
      }
      if (n <= state.length)
        return n;
      return state.ended ? state.length : 0;
    }
    Readable.prototype.read = function(n) {
      if (debug("read", n), n === undefined)
        n = NaN;
      else if (!NumberIsInteger(n))
        n = NumberParseInt(n, 10);
      let state = this._readableState, nOrig = n;
      if (n > state.highWaterMark)
        state.highWaterMark = computeNewHighWaterMark(n);
      if (n !== 0)
        state.state &= ~kEmittedReadable;
      if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
        if (debug("read: emitReadable", state.length, state.ended), state.length === 0 && state.ended)
          endReadable(this);
        else
          emitReadable(this);
        return null;
      }
      if (n = howMuchToRead(n, state), n === 0 && state.ended) {
        if (state.length === 0)
          endReadable(this);
        return null;
      }
      let doRead = (state.state & kNeedReadable) !== 0;
      if (debug("need readable", doRead), state.length === 0 || state.length - n < state.highWaterMark)
        doRead = true, debug("length less than watermark", doRead);
      if (state.ended || state.reading || state.destroyed || state.errored || !state.constructed)
        doRead = false, debug("reading, ended or constructing", doRead);
      else if (doRead) {
        if (debug("do read"), state.state |= kReading | kSync, state.length === 0)
          state.state |= kNeedReadable;
        try {
          this._read(state.highWaterMark);
        } catch (err) {
          errorOrDestroy(this, err);
        }
        if (state.state &= ~kSync, !state.reading)
          n = howMuchToRead(nOrig, state);
      }
      let ret;
      if (n > 0)
        ret = fromList(n, state);
      else
        ret = null;
      if (ret === null)
        state.needReadable = state.length <= state.highWaterMark, n = 0;
      else if (state.length -= n, state.multiAwaitDrain)
        state.awaitDrainWriters.clear();
      else
        state.awaitDrainWriters = null;
      if (state.length === 0) {
        if (!state.ended)
          state.needReadable = true;
        if (nOrig !== n && state.ended)
          endReadable(this);
      }
      if (ret !== null && !state.errorEmitted && !state.closeEmitted)
        state.dataEmitted = true, this.emit("data", ret);
      return ret;
    };
    function onEofChunk(stream, state) {
      if (debug("onEofChunk"), state.ended)
        return;
      if (state.decoder) {
        let chunk = state.decoder.end();
        if (chunk && chunk.length)
          state.buffer.push(chunk), state.length += state.objectMode ? 1 : chunk.length;
      }
      if (state.ended = true, state.sync)
        emitReadable(stream);
      else
        state.needReadable = false, state.emittedReadable = true, emitReadable_(stream);
    }
    function emitReadable(stream) {
      let state = stream._readableState;
      if (debug("emitReadable", state.needReadable, state.emittedReadable), state.needReadable = false, !state.emittedReadable)
        debug("emitReadable", state.flowing), state.emittedReadable = true, process2.nextTick(emitReadable_, stream);
    }
    function emitReadable_(stream) {
      let state = stream._readableState;
      if (debug("emitReadable_", state.destroyed, state.length, state.ended), !state.destroyed && !state.errored && (state.length || state.ended))
        stream.emit("readable"), state.emittedReadable = false;
      state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark, flow(stream);
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore && state.constructed)
        state.readingMore = true, process2.nextTick(maybeReadMore_, stream, state);
    }
    function maybeReadMore_(stream, state) {
      while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
        let len2 = state.length;
        if (debug("maybeReadMore read 0"), stream.read(0), len2 === state.length)
          break;
      }
      state.readingMore = false;
    }
    Readable.prototype._read = function(n) {
      throw new ERR_METHOD_NOT_IMPLEMENTED("_read()");
    };
    Readable.prototype.pipe = function(dest, pipeOpts) {
      let src = this, state = this._readableState;
      if (state.pipes.length === 1) {
        if (!state.multiAwaitDrain)
          state.multiAwaitDrain = true, state.awaitDrainWriters = new SafeSet(state.awaitDrainWriters ? [state.awaitDrainWriters] : []);
      }
      state.pipes.push(dest), debug("pipe count=%d opts=%j", state.pipes.length, pipeOpts);
      let endFn = (!pipeOpts || pipeOpts.end !== false) && dest !== process2.stdout && dest !== process2.stderr ? onend : unpipe;
      if (state.endEmitted)
        process2.nextTick(endFn);
      else
        src.once("end", endFn);
      dest.on("unpipe", onunpipe);
      function onunpipe(readable, unpipeInfo) {
        if (debug("onunpipe"), readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false)
            unpipeInfo.hasUnpiped = true, cleanup();
        }
      }
      function onend() {
        debug("onend"), dest.end();
      }
      let ondrain, cleanedUp = false;
      function cleanup() {
        if (debug("cleanup"), dest.removeListener("close", onclose), dest.removeListener("finish", onfinish), ondrain)
          dest.removeListener("drain", ondrain);
        if (dest.removeListener("error", onerror), dest.removeListener("unpipe", onunpipe), src.removeListener("end", onend), src.removeListener("end", unpipe), src.removeListener("data", ondata), cleanedUp = true, ondrain && state.awaitDrainWriters && (!dest._writableState || dest._writableState.needDrain))
          ondrain();
      }
      function pause() {
        if (!cleanedUp) {
          if (state.pipes.length === 1 && state.pipes[0] === dest)
            debug("false write response, pause", 0), state.awaitDrainWriters = dest, state.multiAwaitDrain = false;
          else if (state.pipes.length > 1 && state.pipes.includes(dest))
            debug("false write response, pause", state.awaitDrainWriters.size), state.awaitDrainWriters.add(dest);
          src.pause();
        }
        if (!ondrain)
          ondrain = pipeOnDrain(src, dest), dest.on("drain", ondrain);
      }
      src.on("data", ondata);
      function ondata(chunk) {
        debug("ondata");
        let ret = dest.write(chunk);
        if (debug("dest.write", ret), ret === false)
          pause();
      }
      function onerror(er) {
        if (debug("onerror", er), unpipe(), dest.removeListener("error", onerror), dest.listenerCount("error") === 0) {
          let s = dest._writableState || dest._readableState;
          if (s && !s.errorEmitted)
            errorOrDestroy(dest, er);
          else
            dest.emit("error", er);
        }
      }
      prependListener2(dest, "error", onerror);
      function onclose() {
        dest.removeListener("finish", onfinish), unpipe();
      }
      dest.once("close", onclose);
      function onfinish() {
        debug("onfinish"), dest.removeListener("close", onclose), unpipe();
      }
      dest.once("finish", onfinish);
      function unpipe() {
        debug("unpipe"), src.unpipe(dest);
      }
      if (dest.emit("pipe", src), dest.writableNeedDrain === true)
        pause();
      else if (!state.flowing)
        debug("pipe resume"), src.resume();
      return dest;
    };
    function pipeOnDrain(src, dest) {
      return function pipeOnDrainFunctionResult() {
        let state = src._readableState;
        if (state.awaitDrainWriters === dest)
          debug("pipeOnDrain", 1), state.awaitDrainWriters = null;
        else if (state.multiAwaitDrain)
          debug("pipeOnDrain", state.awaitDrainWriters.size), state.awaitDrainWriters.delete(dest);
        if ((!state.awaitDrainWriters || state.awaitDrainWriters.size === 0) && src.listenerCount("data"))
          src.resume();
      };
    }
    Readable.prototype.unpipe = function(dest) {
      let state = this._readableState, unpipeInfo = { hasUnpiped: false };
      if (state.pipes.length === 0)
        return this;
      if (!dest) {
        let dests = state.pipes;
        state.pipes = [], this.pause();
        for (let i2 = 0;i2 < dests.length; i2++)
          dests[i2].emit("unpipe", this, { hasUnpiped: false });
        return this;
      }
      let index = ArrayPrototypeIndexOf(state.pipes, dest);
      if (index === -1)
        return this;
      if (state.pipes.splice(index, 1), state.pipes.length === 0)
        this.pause();
      return dest.emit("unpipe", this, unpipeInfo), this;
    };
    Readable.prototype.on = function(ev, fn) {
      let res = Stream.prototype.on.call(this, ev, fn), state = this._readableState;
      if (ev === "data") {
        if (state.readableListening = this.listenerCount("readable") > 0, state.flowing !== false)
          this.resume();
      } else if (ev === "readable") {
        if (!state.endEmitted && !state.readableListening) {
          if (state.readableListening = state.needReadable = true, state.flowing = false, state.emittedReadable = false, debug("on readable", state.length, state.reading), state.length)
            emitReadable(this);
          else if (!state.reading)
            process2.nextTick(nReadingNextTick, this);
        }
      }
      return res;
    };
    Readable.prototype.addListener = Readable.prototype.on;
    Readable.prototype.removeListener = function(ev, fn) {
      let res = Stream.prototype.removeListener.call(this, ev, fn);
      if (ev === "readable")
        process2.nextTick(updateReadableListening, this);
      return res;
    };
    Readable.prototype.off = Readable.prototype.removeListener;
    Readable.prototype.removeAllListeners = function(ev) {
      let res = Stream.prototype.removeAllListeners.apply(this, arguments);
      if (ev === "readable" || ev === undefined)
        process2.nextTick(updateReadableListening, this);
      return res;
    };
    function updateReadableListening(self2) {
      let state = self2._readableState;
      if (state.readableListening = self2.listenerCount("readable") > 0, state.resumeScheduled && state[kPaused] === false)
        state.flowing = true;
      else if (self2.listenerCount("data") > 0)
        self2.resume();
      else if (!state.readableListening)
        state.flowing = null;
    }
    function nReadingNextTick(self2) {
      debug("readable nexttick read 0"), self2.read(0);
    }
    Readable.prototype.resume = function() {
      let state = this._readableState;
      if (!state.flowing)
        debug("resume"), state.flowing = !state.readableListening, resume(this, state);
      return state[kPaused] = false, this;
    };
    function resume(stream, state) {
      if (!state.resumeScheduled)
        state.resumeScheduled = true, process2.nextTick(resume_, stream, state);
    }
    function resume_(stream, state) {
      if (debug("resume", state.reading), !state.reading)
        stream.read(0);
      if (state.resumeScheduled = false, stream.emit("resume"), flow(stream), state.flowing && !state.reading)
        stream.read(0);
    }
    Readable.prototype.pause = function() {
      if (debug("call pause flowing=%j", this._readableState.flowing), this._readableState.flowing !== false)
        debug("pause"), this._readableState.flowing = false, this.emit("pause");
      return this._readableState[kPaused] = true, this;
    };
    function flow(stream) {
      let state = stream._readableState;
      debug("flow", state.flowing);
      while (state.flowing && stream.read() !== null)
        ;
    }
    Readable.prototype.wrap = function(stream) {
      let paused = false;
      stream.on("data", (chunk) => {
        if (!this.push(chunk) && stream.pause)
          paused = true, stream.pause();
      }), stream.on("end", () => {
        this.push(null);
      }), stream.on("error", (err) => {
        errorOrDestroy(this, err);
      }), stream.on("close", () => {
        this.destroy();
      }), stream.on("destroy", () => {
        this.destroy();
      }), this._read = () => {
        if (paused && stream.resume)
          paused = false, stream.resume();
      };
      let streamKeys = ObjectKeys(stream);
      for (let j = 1;j < streamKeys.length; j++) {
        let i2 = streamKeys[j];
        if (this[i2] === undefined && typeof stream[i2] === "function")
          this[i2] = stream[i2].bind(stream);
      }
      return this;
    };
    Readable.prototype[SymbolAsyncIterator] = function() {
      return streamToAsyncIterator(this);
    };
    Readable.prototype.iterator = function(options) {
      if (options !== undefined)
        validateObject(options, "options");
      return streamToAsyncIterator(this, options);
    };
    function streamToAsyncIterator(stream, options) {
      if (typeof stream.read !== "function")
        stream = Readable.wrap(stream, { objectMode: true });
      let iter = createAsyncIterator(stream, options);
      return iter.stream = stream, iter;
    }
    async function* createAsyncIterator(stream, options) {
      let callback = nop;
      function next(resolve2) {
        if (this === stream)
          callback(), callback = nop;
        else
          callback = resolve2;
      }
      stream.on("readable", next);
      let error, cleanup = eos(stream, { writable: false }, (err) => {
        error = err ? aggregateTwoErrors(error, err) : null, callback(), callback = nop;
      });
      try {
        while (true) {
          let chunk = stream.destroyed ? null : stream.read();
          if (chunk !== null)
            yield chunk;
          else if (error)
            throw error;
          else if (error === null)
            return;
          else
            await new Promise2(next);
        }
      } catch (err) {
        throw error = aggregateTwoErrors(error, err), error;
      } finally {
        if ((error || (options === null || options === undefined ? undefined : options.destroyOnReturn) !== false) && (error === undefined || stream._readableState.autoDestroy))
          destroyImpl.destroyer(stream, null);
        else
          stream.off("readable", next), cleanup();
      }
    }
    ObjectDefineProperties(Readable.prototype, { readable: { __proto__: null, get() {
      let r = this._readableState;
      return !!r && r.readable !== false && !r.destroyed && !r.errorEmitted && !r.endEmitted;
    }, set(val) {
      if (this._readableState)
        this._readableState.readable = !!val;
    } }, readableDidRead: { __proto__: null, enumerable: false, get: function() {
      return this._readableState.dataEmitted;
    } }, readableAborted: { __proto__: null, enumerable: false, get: function() {
      return !!(this._readableState.readable !== false && (this._readableState.destroyed || this._readableState.errored) && !this._readableState.endEmitted);
    } }, readableHighWaterMark: { __proto__: null, enumerable: false, get: function() {
      return this._readableState.highWaterMark;
    } }, readableBuffer: { __proto__: null, enumerable: false, get: function() {
      return this._readableState && this._readableState.buffer;
    } }, readableFlowing: { __proto__: null, enumerable: false, get: function() {
      return this._readableState.flowing;
    }, set: function(state) {
      if (this._readableState)
        this._readableState.flowing = state;
    } }, readableLength: { __proto__: null, enumerable: false, get() {
      return this._readableState.length;
    } }, readableObjectMode: { __proto__: null, enumerable: false, get() {
      return this._readableState ? this._readableState.objectMode : false;
    } }, readableEncoding: { __proto__: null, enumerable: false, get() {
      return this._readableState ? this._readableState.encoding : null;
    } }, errored: { __proto__: null, enumerable: false, get() {
      return this._readableState ? this._readableState.errored : null;
    } }, closed: { __proto__: null, get() {
      return this._readableState ? this._readableState.closed : false;
    } }, destroyed: { __proto__: null, enumerable: false, get() {
      return this._readableState ? this._readableState.destroyed : false;
    }, set(value) {
      if (!this._readableState)
        return;
      this._readableState.destroyed = value;
    } }, readableEnded: { __proto__: null, enumerable: false, get() {
      return this._readableState ? this._readableState.endEmitted : false;
    } } });
    ObjectDefineProperties(ReadableState.prototype, { pipesCount: { __proto__: null, get() {
      return this.pipes.length;
    } }, paused: { __proto__: null, get() {
      return this[kPaused] !== false;
    }, set(value) {
      this[kPaused] = !!value;
    } } });
    Readable._fromList = fromList;
    function fromList(n, state) {
      if (state.length === 0)
        return null;
      let ret;
      if (state.objectMode)
        ret = state.buffer.shift();
      else if (!n || n >= state.length) {
        if (state.decoder)
          ret = state.buffer.join("");
        else if (state.buffer.length === 1)
          ret = state.buffer.first();
        else
          ret = state.buffer.concat(state.length);
        state.buffer.clear();
      } else
        ret = state.buffer.consume(n, state.decoder);
      return ret;
    }
    function endReadable(stream) {
      let state = stream._readableState;
      if (debug("endReadable", state.endEmitted), !state.endEmitted)
        state.ended = true, process2.nextTick(endReadableNT, state, stream);
    }
    function endReadableNT(state, stream) {
      if (debug("endReadableNT", state.endEmitted, state.length), !state.errored && !state.closeEmitted && !state.endEmitted && state.length === 0) {
        if (state.endEmitted = true, stream.emit("end"), stream.writable && stream.allowHalfOpen === false)
          process2.nextTick(endWritableNT, stream);
        else if (state.autoDestroy) {
          let wState = stream._writableState;
          if (!wState || wState.autoDestroy && (wState.finished || wState.writable === false))
            stream.destroy();
        }
      }
    }
    function endWritableNT(stream) {
      if (stream.writable && !stream.writableEnded && !stream.destroyed)
        stream.end();
    }
    Readable.from = function(iterable, opts) {
      return from2(Readable, iterable, opts);
    };
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === undefined)
        webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Readable.fromWeb = function(readableStream, options) {
      return lazyWebStreams().newStreamReadableFromReadableStream(readableStream, options);
    };
    Readable.toWeb = function(streamReadable, options) {
      return lazyWebStreams().newReadableStreamFromStreamReadable(streamReadable, options);
    };
    Readable.wrap = function(src, options) {
      var _ref, _src$readableObjectMo;
      return new Readable({ objectMode: (_ref = (_src$readableObjectMo = src.readableObjectMode) !== null && _src$readableObjectMo !== undefined ? _src$readableObjectMo : src.objectMode) !== null && _ref !== undefined ? _ref : true, ...options, destroy(err, callback) {
        destroyImpl.destroyer(src, err), callback(err);
      } }).wrap(src);
    };
  });
  var require_writable = __commonJS2((exports2, module2) => {
    var process2 = require_process(), { ArrayPrototypeSlice: ArrayPrototypeSlice2, Error: Error2, FunctionPrototypeSymbolHasInstance, ObjectDefineProperty, ObjectDefineProperties, ObjectSetPrototypeOf, StringPrototypeToLowerCase, Symbol: Symbol2, SymbolHasInstance } = require_primordials();
    module2.exports = Writable;
    Writable.WritableState = WritableState;
    var { EventEmitter: EE } = (init_events(), __toCommonJS(exports_events)), Stream = require_legacy().Stream, { Buffer: Buffer3 } = (init_buffer(), __toCommonJS(exports_buffer)), destroyImpl = require_destroy(), { addAbortSignal } = require_add_abort_signal(), { getHighWaterMark, getDefaultHighWaterMark } = require_state(), { ERR_INVALID_ARG_TYPE: ERR_INVALID_ARG_TYPE3, ERR_METHOD_NOT_IMPLEMENTED, ERR_MULTIPLE_CALLBACK, ERR_STREAM_CANNOT_PIPE, ERR_STREAM_DESTROYED, ERR_STREAM_ALREADY_FINISHED, ERR_STREAM_NULL_VALUES, ERR_STREAM_WRITE_AFTER_END, ERR_UNKNOWN_ENCODING } = require_errors().codes, { errorOrDestroy } = destroyImpl;
    ObjectSetPrototypeOf(Writable.prototype, Stream.prototype);
    ObjectSetPrototypeOf(Writable, Stream);
    function nop() {}
    var kOnFinished = Symbol2("kOnFinished");
    function WritableState(options, stream, isDuplex) {
      if (typeof isDuplex !== "boolean")
        isDuplex = stream instanceof require_duplex();
      if (this.objectMode = !!(options && options.objectMode), isDuplex)
        this.objectMode = this.objectMode || !!(options && options.writableObjectMode);
      this.highWaterMark = options ? getHighWaterMark(this, options, "writableHighWaterMark", isDuplex) : getDefaultHighWaterMark(false), this.finalCalled = false, this.needDrain = false, this.ending = false, this.ended = false, this.finished = false, this.destroyed = false;
      let noDecode = !!(options && options.decodeStrings === false);
      this.decodeStrings = !noDecode, this.defaultEncoding = options && options.defaultEncoding || "utf8", this.length = 0, this.writing = false, this.corked = 0, this.sync = true, this.bufferProcessing = false, this.onwrite = onwrite.bind(undefined, stream), this.writecb = null, this.writelen = 0, this.afterWriteTickInfo = null, resetBuffer(this), this.pendingcb = 0, this.constructed = true, this.prefinished = false, this.errorEmitted = false, this.emitClose = !options || options.emitClose !== false, this.autoDestroy = !options || options.autoDestroy !== false, this.errored = null, this.closed = false, this.closeEmitted = false, this[kOnFinished] = [];
    }
    function resetBuffer(state) {
      state.buffered = [], state.bufferedIndex = 0, state.allBuffers = true, state.allNoop = true;
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      return ArrayPrototypeSlice2(this.buffered, this.bufferedIndex);
    };
    ObjectDefineProperty(WritableState.prototype, "bufferedRequestCount", { __proto__: null, get() {
      return this.buffered.length - this.bufferedIndex;
    } });
    function Writable(options) {
      let isDuplex = this instanceof require_duplex();
      if (!isDuplex && !FunctionPrototypeSymbolHasInstance(Writable, this))
        return new Writable(options);
      if (this._writableState = new WritableState(options, this, isDuplex), options) {
        if (typeof options.write === "function")
          this._write = options.write;
        if (typeof options.writev === "function")
          this._writev = options.writev;
        if (typeof options.destroy === "function")
          this._destroy = options.destroy;
        if (typeof options.final === "function")
          this._final = options.final;
        if (typeof options.construct === "function")
          this._construct = options.construct;
        if (options.signal)
          addAbortSignal(options.signal, this);
      }
      Stream.call(this, options), destroyImpl.construct(this, () => {
        let state = this._writableState;
        if (!state.writing)
          clearBuffer(this, state);
        finishMaybe(this, state);
      });
    }
    ObjectDefineProperty(Writable, SymbolHasInstance, { __proto__: null, value: function(object) {
      if (FunctionPrototypeSymbolHasInstance(this, object))
        return true;
      if (this !== Writable)
        return false;
      return object && object._writableState instanceof WritableState;
    } });
    Writable.prototype.pipe = function() {
      errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE);
    };
    function _write(stream, chunk, encoding, cb) {
      let state = stream._writableState;
      if (typeof encoding === "function")
        cb = encoding, encoding = state.defaultEncoding;
      else {
        if (!encoding)
          encoding = state.defaultEncoding;
        else if (encoding !== "buffer" && !Buffer3.isEncoding(encoding))
          throw new ERR_UNKNOWN_ENCODING(encoding);
        if (typeof cb !== "function")
          cb = nop;
      }
      if (chunk === null)
        throw new ERR_STREAM_NULL_VALUES;
      else if (!state.objectMode)
        if (typeof chunk === "string") {
          if (state.decodeStrings !== false)
            chunk = Buffer3.from(chunk, encoding), encoding = "buffer";
        } else if (chunk instanceof Buffer3)
          encoding = "buffer";
        else if (Stream._isUint8Array(chunk))
          chunk = Stream._uint8ArrayToBuffer(chunk), encoding = "buffer";
        else
          throw new ERR_INVALID_ARG_TYPE3("chunk", ["string", "Buffer", "Uint8Array"], chunk);
      let err;
      if (state.ending)
        err = new ERR_STREAM_WRITE_AFTER_END;
      else if (state.destroyed)
        err = new ERR_STREAM_DESTROYED("write");
      if (err)
        return process2.nextTick(cb, err), errorOrDestroy(stream, err, true), err;
      return state.pendingcb++, writeOrBuffer(stream, state, chunk, encoding, cb);
    }
    Writable.prototype.write = function(chunk, encoding, cb) {
      return _write(this, chunk, encoding, cb) === true;
    };
    Writable.prototype.cork = function() {
      this._writableState.corked++;
    };
    Writable.prototype.uncork = function() {
      let state = this._writableState;
      if (state.corked) {
        if (state.corked--, !state.writing)
          clearBuffer(this, state);
      }
    };
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === "string")
        encoding = StringPrototypeToLowerCase(encoding);
      if (!Buffer3.isEncoding(encoding))
        throw new ERR_UNKNOWN_ENCODING(encoding);
      return this._writableState.defaultEncoding = encoding, this;
    };
    function writeOrBuffer(stream, state, chunk, encoding, callback) {
      let len2 = state.objectMode ? 1 : chunk.length;
      state.length += len2;
      let ret = state.length < state.highWaterMark;
      if (!ret)
        state.needDrain = true;
      if (state.writing || state.corked || state.errored || !state.constructed) {
        if (state.buffered.push({ chunk, encoding, callback }), state.allBuffers && encoding !== "buffer")
          state.allBuffers = false;
        if (state.allNoop && callback !== nop)
          state.allNoop = false;
      } else
        state.writelen = len2, state.writecb = callback, state.writing = true, state.sync = true, stream._write(chunk, encoding, state.onwrite), state.sync = false;
      return ret && !state.errored && !state.destroyed;
    }
    function doWrite(stream, state, writev, len2, chunk, encoding, cb) {
      if (state.writelen = len2, state.writecb = cb, state.writing = true, state.sync = true, state.destroyed)
        state.onwrite(new ERR_STREAM_DESTROYED("write"));
      else if (writev)
        stream._writev(chunk, state.onwrite);
      else
        stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream, state, er, cb) {
      --state.pendingcb, cb(er), errorBuffer(state), errorOrDestroy(stream, er);
    }
    function onwrite(stream, er) {
      let state = stream._writableState, sync = state.sync, cb = state.writecb;
      if (typeof cb !== "function") {
        errorOrDestroy(stream, new ERR_MULTIPLE_CALLBACK);
        return;
      }
      if (state.writing = false, state.writecb = null, state.length -= state.writelen, state.writelen = 0, er) {
        if (er.stack, !state.errored)
          state.errored = er;
        if (stream._readableState && !stream._readableState.errored)
          stream._readableState.errored = er;
        if (sync)
          process2.nextTick(onwriteError, stream, state, er, cb);
        else
          onwriteError(stream, state, er, cb);
      } else {
        if (state.buffered.length > state.bufferedIndex)
          clearBuffer(stream, state);
        if (sync)
          if (state.afterWriteTickInfo !== null && state.afterWriteTickInfo.cb === cb)
            state.afterWriteTickInfo.count++;
          else
            state.afterWriteTickInfo = { count: 1, cb, stream, state }, process2.nextTick(afterWriteTick, state.afterWriteTickInfo);
        else
          afterWrite(stream, state, 1, cb);
      }
    }
    function afterWriteTick({ stream, state, count, cb }) {
      return state.afterWriteTickInfo = null, afterWrite(stream, state, count, cb);
    }
    function afterWrite(stream, state, count, cb) {
      if (!state.ending && !stream.destroyed && state.length === 0 && state.needDrain)
        state.needDrain = false, stream.emit("drain");
      while (count-- > 0)
        state.pendingcb--, cb();
      if (state.destroyed)
        errorBuffer(state);
      finishMaybe(stream, state);
    }
    function errorBuffer(state) {
      if (state.writing)
        return;
      for (let n = state.bufferedIndex;n < state.buffered.length; ++n) {
        var _state$errored;
        let { chunk, callback } = state.buffered[n], len2 = state.objectMode ? 1 : chunk.length;
        state.length -= len2, callback((_state$errored = state.errored) !== null && _state$errored !== undefined ? _state$errored : new ERR_STREAM_DESTROYED("write"));
      }
      let onfinishCallbacks = state[kOnFinished].splice(0);
      for (let i2 = 0;i2 < onfinishCallbacks.length; i2++) {
        var _state$errored2;
        onfinishCallbacks[i2]((_state$errored2 = state.errored) !== null && _state$errored2 !== undefined ? _state$errored2 : new ERR_STREAM_DESTROYED("end"));
      }
      resetBuffer(state);
    }
    function clearBuffer(stream, state) {
      if (state.corked || state.bufferProcessing || state.destroyed || !state.constructed)
        return;
      let { buffered, bufferedIndex, objectMode } = state, bufferedLength = buffered.length - bufferedIndex;
      if (!bufferedLength)
        return;
      let i2 = bufferedIndex;
      if (state.bufferProcessing = true, bufferedLength > 1 && stream._writev) {
        state.pendingcb -= bufferedLength - 1;
        let callback = state.allNoop ? nop : (err) => {
          for (let n = i2;n < buffered.length; ++n)
            buffered[n].callback(err);
        }, chunks = state.allNoop && i2 === 0 ? buffered : ArrayPrototypeSlice2(buffered, i2);
        chunks.allBuffers = state.allBuffers, doWrite(stream, state, true, state.length, chunks, "", callback), resetBuffer(state);
      } else {
        do {
          let { chunk, encoding, callback } = buffered[i2];
          buffered[i2++] = null;
          let len2 = objectMode ? 1 : chunk.length;
          doWrite(stream, state, false, len2, chunk, encoding, callback);
        } while (i2 < buffered.length && !state.writing);
        if (i2 === buffered.length)
          resetBuffer(state);
        else if (i2 > 256)
          buffered.splice(0, i2), state.bufferedIndex = 0;
        else
          state.bufferedIndex = i2;
      }
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function(chunk, encoding, cb) {
      if (this._writev)
        this._writev([{ chunk, encoding }], cb);
      else
        throw new ERR_METHOD_NOT_IMPLEMENTED("_write()");
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function(chunk, encoding, cb) {
      let state = this._writableState;
      if (typeof chunk === "function")
        cb = chunk, chunk = null, encoding = null;
      else if (typeof encoding === "function")
        cb = encoding, encoding = null;
      let err;
      if (chunk !== null && chunk !== undefined) {
        let ret = _write(this, chunk, encoding);
        if (ret instanceof Error2)
          err = ret;
      }
      if (state.corked)
        state.corked = 1, this.uncork();
      if (err)
        ;
      else if (!state.errored && !state.ending)
        state.ending = true, finishMaybe(this, state, true), state.ended = true;
      else if (state.finished)
        err = new ERR_STREAM_ALREADY_FINISHED("end");
      else if (state.destroyed)
        err = new ERR_STREAM_DESTROYED("end");
      if (typeof cb === "function")
        if (err || state.finished)
          process2.nextTick(cb, err);
        else
          state[kOnFinished].push(cb);
      return this;
    };
    function needFinish(state) {
      return state.ending && !state.destroyed && state.constructed && state.length === 0 && !state.errored && state.buffered.length === 0 && !state.finished && !state.writing && !state.errorEmitted && !state.closeEmitted;
    }
    function callFinal(stream, state) {
      let called = false;
      function onFinish(err) {
        if (called) {
          errorOrDestroy(stream, err !== null && err !== undefined ? err : ERR_MULTIPLE_CALLBACK());
          return;
        }
        if (called = true, state.pendingcb--, err) {
          let onfinishCallbacks = state[kOnFinished].splice(0);
          for (let i2 = 0;i2 < onfinishCallbacks.length; i2++)
            onfinishCallbacks[i2](err);
          errorOrDestroy(stream, err, state.sync);
        } else if (needFinish(state))
          state.prefinished = true, stream.emit("prefinish"), state.pendingcb++, process2.nextTick(finish, stream, state);
      }
      state.sync = true, state.pendingcb++;
      try {
        stream._final(onFinish);
      } catch (err) {
        onFinish(err);
      }
      state.sync = false;
    }
    function prefinish(stream, state) {
      if (!state.prefinished && !state.finalCalled)
        if (typeof stream._final === "function" && !state.destroyed)
          state.finalCalled = true, callFinal(stream, state);
        else
          state.prefinished = true, stream.emit("prefinish");
    }
    function finishMaybe(stream, state, sync) {
      if (needFinish(state)) {
        if (prefinish(stream, state), state.pendingcb === 0) {
          if (sync)
            state.pendingcb++, process2.nextTick((stream2, state2) => {
              if (needFinish(state2))
                finish(stream2, state2);
              else
                state2.pendingcb--;
            }, stream, state);
          else if (needFinish(state))
            state.pendingcb++, finish(stream, state);
        }
      }
    }
    function finish(stream, state) {
      state.pendingcb--, state.finished = true;
      let onfinishCallbacks = state[kOnFinished].splice(0);
      for (let i2 = 0;i2 < onfinishCallbacks.length; i2++)
        onfinishCallbacks[i2]();
      if (stream.emit("finish"), state.autoDestroy) {
        let rState = stream._readableState;
        if (!rState || rState.autoDestroy && (rState.endEmitted || rState.readable === false))
          stream.destroy();
      }
    }
    ObjectDefineProperties(Writable.prototype, { closed: { __proto__: null, get() {
      return this._writableState ? this._writableState.closed : false;
    } }, destroyed: { __proto__: null, get() {
      return this._writableState ? this._writableState.destroyed : false;
    }, set(value) {
      if (this._writableState)
        this._writableState.destroyed = value;
    } }, writable: { __proto__: null, get() {
      let w = this._writableState;
      return !!w && w.writable !== false && !w.destroyed && !w.errored && !w.ending && !w.ended;
    }, set(val) {
      if (this._writableState)
        this._writableState.writable = !!val;
    } }, writableFinished: { __proto__: null, get() {
      return this._writableState ? this._writableState.finished : false;
    } }, writableObjectMode: { __proto__: null, get() {
      return this._writableState ? this._writableState.objectMode : false;
    } }, writableBuffer: { __proto__: null, get() {
      return this._writableState && this._writableState.getBuffer();
    } }, writableEnded: { __proto__: null, get() {
      return this._writableState ? this._writableState.ending : false;
    } }, writableNeedDrain: { __proto__: null, get() {
      let wState = this._writableState;
      if (!wState)
        return false;
      return !wState.destroyed && !wState.ending && wState.needDrain;
    } }, writableHighWaterMark: { __proto__: null, get() {
      return this._writableState && this._writableState.highWaterMark;
    } }, writableCorked: { __proto__: null, get() {
      return this._writableState ? this._writableState.corked : 0;
    } }, writableLength: { __proto__: null, get() {
      return this._writableState && this._writableState.length;
    } }, errored: { __proto__: null, enumerable: false, get() {
      return this._writableState ? this._writableState.errored : null;
    } }, writableAborted: { __proto__: null, enumerable: false, get: function() {
      return !!(this._writableState.writable !== false && (this._writableState.destroyed || this._writableState.errored) && !this._writableState.finished);
    } } });
    var destroy = destroyImpl.destroy;
    Writable.prototype.destroy = function(err, cb) {
      let state = this._writableState;
      if (!state.destroyed && (state.bufferedIndex < state.buffered.length || state[kOnFinished].length))
        process2.nextTick(errorBuffer, state);
      return destroy.call(this, err, cb), this;
    };
    Writable.prototype._undestroy = destroyImpl.undestroy;
    Writable.prototype._destroy = function(err, cb) {
      cb(err);
    };
    Writable.prototype[EE.captureRejectionSymbol] = function(err) {
      this.destroy(err);
    };
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === undefined)
        webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Writable.fromWeb = function(writableStream, options) {
      return lazyWebStreams().newStreamWritableFromWritableStream(writableStream, options);
    };
    Writable.toWeb = function(streamWritable) {
      return lazyWebStreams().newWritableStreamFromStreamWritable(streamWritable);
    };
  });
  var require_duplexify = __commonJS2((exports2, module2) => {
    var process2 = require_process(), bufferModule = (init_buffer(), __toCommonJS(exports_buffer)), { isReadable, isWritable, isIterable, isNodeStream, isReadableNodeStream, isWritableNodeStream, isDuplexNodeStream, isReadableStream, isWritableStream } = require_utils(), eos = require_end_of_stream(), { AbortError: AbortError2, codes: { ERR_INVALID_ARG_TYPE: ERR_INVALID_ARG_TYPE3, ERR_INVALID_RETURN_VALUE } } = require_errors(), { destroyer } = require_destroy(), Duplex = require_duplex(), Readable = require_readable(), Writable = require_writable(), { createDeferredPromise } = require_util(), from2 = require_from(), Blob2 = globalThis.Blob || bufferModule.Blob, isBlob = typeof Blob2 !== "undefined" ? function isBlob(b) {
      return b instanceof Blob2;
    } : function isBlob(b) {
      return false;
    }, AbortController = globalThis.AbortController || require_abort_controller().AbortController, { FunctionPrototypeCall } = require_primordials();

    class Duplexify extends Duplex {
      constructor(options) {
        super(options);
        if ((options === null || options === undefined ? undefined : options.readable) === false)
          this._readableState.readable = false, this._readableState.ended = true, this._readableState.endEmitted = true;
        if ((options === null || options === undefined ? undefined : options.writable) === false)
          this._writableState.writable = false, this._writableState.ending = true, this._writableState.ended = true, this._writableState.finished = true;
      }
    }
    module2.exports = function duplexify(body, name) {
      if (isDuplexNodeStream(body))
        return body;
      if (isReadableNodeStream(body))
        return _duplexify({ readable: body });
      if (isWritableNodeStream(body))
        return _duplexify({ writable: body });
      if (isNodeStream(body))
        return _duplexify({ writable: false, readable: false });
      if (isReadableStream(body))
        return _duplexify({ readable: Readable.fromWeb(body) });
      if (isWritableStream(body))
        return _duplexify({ writable: Writable.fromWeb(body) });
      if (typeof body === "function") {
        let { value, write: write3, final, destroy } = fromAsyncGen(body);
        if (isIterable(value))
          return from2(Duplexify, value, { objectMode: true, write: write3, final, destroy });
        let then2 = value === null || value === undefined ? undefined : value.then;
        if (typeof then2 === "function") {
          let d, promise = FunctionPrototypeCall(then2, value, (val) => {
            if (val != null)
              throw new ERR_INVALID_RETURN_VALUE("nully", "body", val);
          }, (err) => {
            destroyer(d, err);
          });
          return d = new Duplexify({ objectMode: true, readable: false, write: write3, final(cb) {
            final(async () => {
              try {
                await promise, process2.nextTick(cb, null);
              } catch (err) {
                process2.nextTick(cb, err);
              }
            });
          }, destroy });
        }
        throw new ERR_INVALID_RETURN_VALUE("Iterable, AsyncIterable or AsyncFunction", name, value);
      }
      if (isBlob(body))
        return duplexify(body.arrayBuffer());
      if (isIterable(body))
        return from2(Duplexify, body, { objectMode: true, writable: false });
      if (isReadableStream(body === null || body === undefined ? undefined : body.readable) && isWritableStream(body === null || body === undefined ? undefined : body.writable))
        return Duplexify.fromWeb(body);
      if (typeof (body === null || body === undefined ? undefined : body.writable) === "object" || typeof (body === null || body === undefined ? undefined : body.readable) === "object") {
        let readable = body !== null && body !== undefined && body.readable ? isReadableNodeStream(body === null || body === undefined ? undefined : body.readable) ? body === null || body === undefined ? undefined : body.readable : duplexify(body.readable) : undefined, writable = body !== null && body !== undefined && body.writable ? isWritableNodeStream(body === null || body === undefined ? undefined : body.writable) ? body === null || body === undefined ? undefined : body.writable : duplexify(body.writable) : undefined;
        return _duplexify({ readable, writable });
      }
      let then = body === null || body === undefined ? undefined : body.then;
      if (typeof then === "function") {
        let d;
        return FunctionPrototypeCall(then, body, (val) => {
          if (val != null)
            d.push(val);
          d.push(null);
        }, (err) => {
          destroyer(d, err);
        }), d = new Duplexify({ objectMode: true, writable: false, read() {} });
      }
      throw new ERR_INVALID_ARG_TYPE3(name, ["Blob", "ReadableStream", "WritableStream", "Stream", "Iterable", "AsyncIterable", "Function", "{ readable, writable } pair", "Promise"], body);
    };
    function fromAsyncGen(fn) {
      let { promise, resolve: resolve2 } = createDeferredPromise(), ac = new AbortController, signal = ac.signal;
      return { value: fn(async function* () {
        while (true) {
          let _promise = promise;
          promise = null;
          let { chunk, done, cb } = await _promise;
          if (process2.nextTick(cb), done)
            return;
          if (signal.aborted)
            throw new AbortError2(undefined, { cause: signal.reason });
          ({ promise, resolve: resolve2 } = createDeferredPromise()), yield chunk;
        }
      }(), { signal }), write(chunk, encoding, cb) {
        let _resolve = resolve2;
        resolve2 = null, _resolve({ chunk, done: false, cb });
      }, final(cb) {
        let _resolve = resolve2;
        resolve2 = null, _resolve({ done: true, cb });
      }, destroy(err, cb) {
        ac.abort(), cb(err);
      } };
    }
    function _duplexify(pair) {
      let r = pair.readable && typeof pair.readable.read !== "function" ? Readable.wrap(pair.readable) : pair.readable, w = pair.writable, readable = !!isReadable(r), writable = !!isWritable(w), ondrain, onfinish, onreadable, onclose, d;
      function onfinished(err) {
        let cb = onclose;
        if (onclose = null, cb)
          cb(err);
        else if (err)
          d.destroy(err);
      }
      if (d = new Duplexify({ readableObjectMode: !!(r !== null && r !== undefined && r.readableObjectMode), writableObjectMode: !!(w !== null && w !== undefined && w.writableObjectMode), readable, writable }), writable)
        eos(w, (err) => {
          if (writable = false, err)
            destroyer(r, err);
          onfinished(err);
        }), d._write = function(chunk, encoding, callback) {
          if (w.write(chunk, encoding))
            callback();
          else
            ondrain = callback;
        }, d._final = function(callback) {
          w.end(), onfinish = callback;
        }, w.on("drain", function() {
          if (ondrain) {
            let cb = ondrain;
            ondrain = null, cb();
          }
        }), w.on("finish", function() {
          if (onfinish) {
            let cb = onfinish;
            onfinish = null, cb();
          }
        });
      if (readable)
        eos(r, (err) => {
          if (readable = false, err)
            destroyer(r, err);
          onfinished(err);
        }), r.on("readable", function() {
          if (onreadable) {
            let cb = onreadable;
            onreadable = null, cb();
          }
        }), r.on("end", function() {
          d.push(null);
        }), d._read = function() {
          while (true) {
            let buf = r.read();
            if (buf === null) {
              onreadable = d._read;
              return;
            }
            if (!d.push(buf))
              return;
          }
        };
      return d._destroy = function(err, callback) {
        if (!err && onclose !== null)
          err = new AbortError2;
        if (onreadable = null, ondrain = null, onfinish = null, onclose === null)
          callback(err);
        else
          onclose = callback, destroyer(w, err), destroyer(r, err);
      }, d;
    }
  });
  var require_duplex = __commonJS2((exports2, module2) => {
    var { ObjectDefineProperties, ObjectGetOwnPropertyDescriptor, ObjectKeys, ObjectSetPrototypeOf } = require_primordials();
    module2.exports = Duplex;
    var Readable = require_readable(), Writable = require_writable();
    ObjectSetPrototypeOf(Duplex.prototype, Readable.prototype);
    ObjectSetPrototypeOf(Duplex, Readable);
    {
      let keys = ObjectKeys(Writable.prototype);
      for (let i2 = 0;i2 < keys.length; i2++) {
        let method = keys[i2];
        if (!Duplex.prototype[method])
          Duplex.prototype[method] = Writable.prototype[method];
      }
    }
    function Duplex(options) {
      if (!(this instanceof Duplex))
        return new Duplex(options);
      if (Readable.call(this, options), Writable.call(this, options), options) {
        if (this.allowHalfOpen = options.allowHalfOpen !== false, options.readable === false)
          this._readableState.readable = false, this._readableState.ended = true, this._readableState.endEmitted = true;
        if (options.writable === false)
          this._writableState.writable = false, this._writableState.ending = true, this._writableState.ended = true, this._writableState.finished = true;
      } else
        this.allowHalfOpen = true;
    }
    ObjectDefineProperties(Duplex.prototype, { writable: { __proto__: null, ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writable") }, writableHighWaterMark: { __proto__: null, ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableHighWaterMark") }, writableObjectMode: { __proto__: null, ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableObjectMode") }, writableBuffer: { __proto__: null, ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableBuffer") }, writableLength: { __proto__: null, ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableLength") }, writableFinished: { __proto__: null, ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableFinished") }, writableCorked: { __proto__: null, ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableCorked") }, writableEnded: { __proto__: null, ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableEnded") }, writableNeedDrain: { __proto__: null, ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableNeedDrain") }, destroyed: { __proto__: null, get() {
      if (this._readableState === undefined || this._writableState === undefined)
        return false;
      return this._readableState.destroyed && this._writableState.destroyed;
    }, set(value) {
      if (this._readableState && this._writableState)
        this._readableState.destroyed = value, this._writableState.destroyed = value;
    } } });
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === undefined)
        webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Duplex.fromWeb = function(pair, options) {
      return lazyWebStreams().newStreamDuplexFromReadableWritablePair(pair, options);
    };
    Duplex.toWeb = function(duplex) {
      return lazyWebStreams().newReadableWritablePairFromDuplex(duplex);
    };
    var duplexify;
    Duplex.from = function(body) {
      if (!duplexify)
        duplexify = require_duplexify();
      return duplexify(body, "body");
    };
  });
  var require_transform = __commonJS2((exports2, module2) => {
    var { ObjectSetPrototypeOf, Symbol: Symbol2 } = require_primordials();
    module2.exports = Transform;
    var { ERR_METHOD_NOT_IMPLEMENTED } = require_errors().codes, Duplex = require_duplex(), { getHighWaterMark } = require_state();
    ObjectSetPrototypeOf(Transform.prototype, Duplex.prototype);
    ObjectSetPrototypeOf(Transform, Duplex);
    var kCallback = Symbol2("kCallback");
    function Transform(options) {
      if (!(this instanceof Transform))
        return new Transform(options);
      let readableHighWaterMark = options ? getHighWaterMark(this, options, "readableHighWaterMark", true) : null;
      if (readableHighWaterMark === 0)
        options = { ...options, highWaterMark: null, readableHighWaterMark, writableHighWaterMark: options.writableHighWaterMark || 0 };
      if (Duplex.call(this, options), this._readableState.sync = false, this[kCallback] = null, options) {
        if (typeof options.transform === "function")
          this._transform = options.transform;
        if (typeof options.flush === "function")
          this._flush = options.flush;
      }
      this.on("prefinish", prefinish);
    }
    function final(cb) {
      if (typeof this._flush === "function" && !this.destroyed)
        this._flush((er, data) => {
          if (er) {
            if (cb)
              cb(er);
            else
              this.destroy(er);
            return;
          }
          if (data != null)
            this.push(data);
          if (this.push(null), cb)
            cb();
        });
      else if (this.push(null), cb)
        cb();
    }
    function prefinish() {
      if (this._final !== final)
        final.call(this);
    }
    Transform.prototype._final = final;
    Transform.prototype._transform = function(chunk, encoding, callback) {
      throw new ERR_METHOD_NOT_IMPLEMENTED("_transform()");
    };
    Transform.prototype._write = function(chunk, encoding, callback) {
      let rState = this._readableState, wState = this._writableState, length = rState.length;
      this._transform(chunk, encoding, (err, val) => {
        if (err) {
          callback(err);
          return;
        }
        if (val != null)
          this.push(val);
        if (wState.ended || length === rState.length || rState.length < rState.highWaterMark)
          callback();
        else
          this[kCallback] = callback;
      });
    };
    Transform.prototype._read = function() {
      if (this[kCallback]) {
        let callback = this[kCallback];
        this[kCallback] = null, callback();
      }
    };
  });
  var require_passthrough = __commonJS2((exports2, module2) => {
    var { ObjectSetPrototypeOf } = require_primordials();
    module2.exports = PassThrough;
    var Transform = require_transform();
    ObjectSetPrototypeOf(PassThrough.prototype, Transform.prototype);
    ObjectSetPrototypeOf(PassThrough, Transform);
    function PassThrough(options) {
      if (!(this instanceof PassThrough))
        return new PassThrough(options);
      Transform.call(this, options);
    }
    PassThrough.prototype._transform = function(chunk, encoding, cb) {
      cb(null, chunk);
    };
  });
  var require_pipeline = __commonJS2((exports2, module2) => {
    var process2 = require_process(), { ArrayIsArray, Promise: Promise2, SymbolAsyncIterator, SymbolDispose } = require_primordials(), eos = require_end_of_stream(), { once: once3 } = require_util(), destroyImpl = require_destroy(), Duplex = require_duplex(), { aggregateTwoErrors, codes: { ERR_INVALID_ARG_TYPE: ERR_INVALID_ARG_TYPE3, ERR_INVALID_RETURN_VALUE, ERR_MISSING_ARGS, ERR_STREAM_DESTROYED, ERR_STREAM_PREMATURE_CLOSE }, AbortError: AbortError2 } = require_errors(), { validateFunction, validateAbortSignal: validateAbortSignal2 } = require_validators(), { isIterable, isReadable, isReadableNodeStream, isNodeStream, isTransformStream, isWebStream, isReadableStream, isReadableFinished } = require_utils(), AbortController = globalThis.AbortController || require_abort_controller().AbortController, PassThrough, Readable, addAbortListener2;
    function destroyer(stream, reading, writing) {
      let finished = false;
      stream.on("close", () => {
        finished = true;
      });
      let cleanup = eos(stream, { readable: reading, writable: writing }, (err) => {
        finished = !err;
      });
      return { destroy: (err) => {
        if (finished)
          return;
        finished = true, destroyImpl.destroyer(stream, err || new ERR_STREAM_DESTROYED("pipe"));
      }, cleanup };
    }
    function popCallback(streams) {
      return validateFunction(streams[streams.length - 1], "streams[stream.length - 1]"), streams.pop();
    }
    function makeAsyncIterable(val) {
      if (isIterable(val))
        return val;
      else if (isReadableNodeStream(val))
        return fromReadable(val);
      throw new ERR_INVALID_ARG_TYPE3("val", ["Readable", "Iterable", "AsyncIterable"], val);
    }
    async function* fromReadable(val) {
      if (!Readable)
        Readable = require_readable();
      yield* Readable.prototype[SymbolAsyncIterator].call(val);
    }
    async function pumpToNode(iterable, writable, finish, { end }) {
      let error, onresolve = null, resume = (err) => {
        if (err)
          error = err;
        if (onresolve) {
          let callback = onresolve;
          onresolve = null, callback();
        }
      }, wait = () => new Promise2((resolve2, reject) => {
        if (error)
          reject(error);
        else
          onresolve = () => {
            if (error)
              reject(error);
            else
              resolve2();
          };
      });
      writable.on("drain", resume);
      let cleanup = eos(writable, { readable: false }, resume);
      try {
        if (writable.writableNeedDrain)
          await wait();
        for await (let chunk of iterable)
          if (!writable.write(chunk))
            await wait();
        if (end)
          writable.end(), await wait();
        finish();
      } catch (err) {
        finish(error !== err ? aggregateTwoErrors(error, err) : err);
      } finally {
        cleanup(), writable.off("drain", resume);
      }
    }
    async function pumpToWeb(readable, writable, finish, { end }) {
      if (isTransformStream(writable))
        writable = writable.writable;
      let writer = writable.getWriter();
      try {
        for await (let chunk of readable)
          await writer.ready, writer.write(chunk).catch(() => {});
        if (await writer.ready, end)
          await writer.close();
        finish();
      } catch (err) {
        try {
          await writer.abort(err), finish(err);
        } catch (err2) {
          finish(err2);
        }
      }
    }
    function pipeline(...streams) {
      return pipelineImpl(streams, once3(popCallback(streams)));
    }
    function pipelineImpl(streams, callback, opts) {
      if (streams.length === 1 && ArrayIsArray(streams[0]))
        streams = streams[0];
      if (streams.length < 2)
        throw new ERR_MISSING_ARGS("streams");
      let ac = new AbortController, signal = ac.signal, outerSignal = opts === null || opts === undefined ? undefined : opts.signal, lastStreamCleanup = [];
      validateAbortSignal2(outerSignal, "options.signal");
      function abort() {
        finishImpl(new AbortError2);
      }
      addAbortListener2 = addAbortListener2 || require_util().addAbortListener;
      let disposable;
      if (outerSignal)
        disposable = addAbortListener2(outerSignal, abort);
      let error, value, destroys = [], finishCount = 0;
      function finish(err) {
        finishImpl(err, --finishCount === 0);
      }
      function finishImpl(err, final) {
        var _disposable;
        if (err && (!error || error.code === "ERR_STREAM_PREMATURE_CLOSE"))
          error = err;
        if (!error && !final)
          return;
        while (destroys.length)
          destroys.shift()(error);
        if ((_disposable = disposable) === null || _disposable === undefined || _disposable[SymbolDispose](), ac.abort(), final) {
          if (!error)
            lastStreamCleanup.forEach((fn) => fn());
          process2.nextTick(callback, error, value);
        }
      }
      let ret;
      for (let i2 = 0;i2 < streams.length; i2++) {
        let stream = streams[i2], reading = i2 < streams.length - 1, writing = i2 > 0, end = reading || (opts === null || opts === undefined ? undefined : opts.end) !== false, isLastStream = i2 === streams.length - 1;
        if (isNodeStream(stream)) {
          let onError2 = function(err) {
            if (err && err.name !== "AbortError" && err.code !== "ERR_STREAM_PREMATURE_CLOSE")
              finish(err);
          };
          var onError = onError2;
          if (end) {
            let { destroy, cleanup } = destroyer(stream, reading, writing);
            if (destroys.push(destroy), isReadable(stream) && isLastStream)
              lastStreamCleanup.push(cleanup);
          }
          if (stream.on("error", onError2), isReadable(stream) && isLastStream)
            lastStreamCleanup.push(() => {
              stream.removeListener("error", onError2);
            });
        }
        if (i2 === 0)
          if (typeof stream === "function") {
            if (ret = stream({ signal }), !isIterable(ret))
              throw new ERR_INVALID_RETURN_VALUE("Iterable, AsyncIterable or Stream", "source", ret);
          } else if (isIterable(stream) || isReadableNodeStream(stream) || isTransformStream(stream))
            ret = stream;
          else
            ret = Duplex.from(stream);
        else if (typeof stream === "function") {
          if (isTransformStream(ret)) {
            var _ret;
            ret = makeAsyncIterable((_ret = ret) === null || _ret === undefined ? undefined : _ret.readable);
          } else
            ret = makeAsyncIterable(ret);
          if (ret = stream(ret, { signal }), reading) {
            if (!isIterable(ret, true))
              throw new ERR_INVALID_RETURN_VALUE("AsyncIterable", `transform[${i2 - 1}]`, ret);
          } else {
            var _ret2;
            if (!PassThrough)
              PassThrough = require_passthrough();
            let pt = new PassThrough({ objectMode: true }), then = (_ret2 = ret) === null || _ret2 === undefined ? undefined : _ret2.then;
            if (typeof then === "function")
              finishCount++, then.call(ret, (val) => {
                if (value = val, val != null)
                  pt.write(val);
                if (end)
                  pt.end();
                process2.nextTick(finish);
              }, (err) => {
                pt.destroy(err), process2.nextTick(finish, err);
              });
            else if (isIterable(ret, true))
              finishCount++, pumpToNode(ret, pt, finish, { end });
            else if (isReadableStream(ret) || isTransformStream(ret)) {
              let toRead = ret.readable || ret;
              finishCount++, pumpToNode(toRead, pt, finish, { end });
            } else
              throw new ERR_INVALID_RETURN_VALUE("AsyncIterable or Promise", "destination", ret);
            ret = pt;
            let { destroy, cleanup } = destroyer(ret, false, true);
            if (destroys.push(destroy), isLastStream)
              lastStreamCleanup.push(cleanup);
          }
        } else if (isNodeStream(stream)) {
          if (isReadableNodeStream(ret)) {
            finishCount += 2;
            let cleanup = pipe(ret, stream, finish, { end });
            if (isReadable(stream) && isLastStream)
              lastStreamCleanup.push(cleanup);
          } else if (isTransformStream(ret) || isReadableStream(ret)) {
            let toRead = ret.readable || ret;
            finishCount++, pumpToNode(toRead, stream, finish, { end });
          } else if (isIterable(ret))
            finishCount++, pumpToNode(ret, stream, finish, { end });
          else
            throw new ERR_INVALID_ARG_TYPE3("val", ["Readable", "Iterable", "AsyncIterable", "ReadableStream", "TransformStream"], ret);
          ret = stream;
        } else if (isWebStream(stream)) {
          if (isReadableNodeStream(ret))
            finishCount++, pumpToWeb(makeAsyncIterable(ret), stream, finish, { end });
          else if (isReadableStream(ret) || isIterable(ret))
            finishCount++, pumpToWeb(ret, stream, finish, { end });
          else if (isTransformStream(ret))
            finishCount++, pumpToWeb(ret.readable, stream, finish, { end });
          else
            throw new ERR_INVALID_ARG_TYPE3("val", ["Readable", "Iterable", "AsyncIterable", "ReadableStream", "TransformStream"], ret);
          ret = stream;
        } else
          ret = Duplex.from(stream);
      }
      if (signal !== null && signal !== undefined && signal.aborted || outerSignal !== null && outerSignal !== undefined && outerSignal.aborted)
        process2.nextTick(abort);
      return ret;
    }
    function pipe(src, dst, finish, { end }) {
      let ended = false;
      if (dst.on("close", () => {
        if (!ended)
          finish(new ERR_STREAM_PREMATURE_CLOSE);
      }), src.pipe(dst, { end: false }), end) {
        let endFn2 = function() {
          ended = true, dst.end();
        };
        var endFn = endFn2;
        if (isReadableFinished(src))
          process2.nextTick(endFn2);
        else
          src.once("end", endFn2);
      } else
        finish();
      return eos(src, { readable: true, writable: false }, (err) => {
        let rState = src._readableState;
        if (err && err.code === "ERR_STREAM_PREMATURE_CLOSE" && rState && rState.ended && !rState.errored && !rState.errorEmitted)
          src.once("end", finish).once("error", finish);
        else
          finish(err);
      }), eos(dst, { readable: false, writable: true }, finish);
    }
    module2.exports = { pipelineImpl, pipeline };
  });
  var require_compose = __commonJS2((exports2, module2) => {
    var { pipeline } = require_pipeline(), Duplex = require_duplex(), { destroyer } = require_destroy(), { isNodeStream, isReadable, isWritable, isWebStream, isTransformStream, isWritableStream, isReadableStream } = require_utils(), { AbortError: AbortError2, codes: { ERR_INVALID_ARG_VALUE, ERR_MISSING_ARGS } } = require_errors(), eos = require_end_of_stream();
    module2.exports = function compose(...streams) {
      if (streams.length === 0)
        throw new ERR_MISSING_ARGS("streams");
      if (streams.length === 1)
        return Duplex.from(streams[0]);
      let orgStreams = [...streams];
      if (typeof streams[0] === "function")
        streams[0] = Duplex.from(streams[0]);
      if (typeof streams[streams.length - 1] === "function") {
        let idx = streams.length - 1;
        streams[idx] = Duplex.from(streams[idx]);
      }
      for (let n = 0;n < streams.length; ++n) {
        if (!isNodeStream(streams[n]) && !isWebStream(streams[n]))
          continue;
        if (n < streams.length - 1 && !(isReadable(streams[n]) || isReadableStream(streams[n]) || isTransformStream(streams[n])))
          throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], "must be readable");
        if (n > 0 && !(isWritable(streams[n]) || isWritableStream(streams[n]) || isTransformStream(streams[n])))
          throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], "must be writable");
      }
      let ondrain, onfinish, onreadable, onclose, d;
      function onfinished(err) {
        let cb = onclose;
        if (onclose = null, cb)
          cb(err);
        else if (err)
          d.destroy(err);
        else if (!readable && !writable)
          d.destroy();
      }
      let head = streams[0], tail = pipeline(streams, onfinished), writable = !!(isWritable(head) || isWritableStream(head) || isTransformStream(head)), readable = !!(isReadable(tail) || isReadableStream(tail) || isTransformStream(tail));
      if (d = new Duplex({ writableObjectMode: !!(head !== null && head !== undefined && head.writableObjectMode), readableObjectMode: !!(tail !== null && tail !== undefined && tail.readableObjectMode), writable, readable }), writable) {
        if (isNodeStream(head))
          d._write = function(chunk, encoding, callback) {
            if (head.write(chunk, encoding))
              callback();
            else
              ondrain = callback;
          }, d._final = function(callback) {
            head.end(), onfinish = callback;
          }, head.on("drain", function() {
            if (ondrain) {
              let cb = ondrain;
              ondrain = null, cb();
            }
          });
        else if (isWebStream(head)) {
          let writer = (isTransformStream(head) ? head.writable : head).getWriter();
          d._write = async function(chunk, encoding, callback) {
            try {
              await writer.ready, writer.write(chunk).catch(() => {}), callback();
            } catch (err) {
              callback(err);
            }
          }, d._final = async function(callback) {
            try {
              await writer.ready, writer.close().catch(() => {}), onfinish = callback;
            } catch (err) {
              callback(err);
            }
          };
        }
        let toRead = isTransformStream(tail) ? tail.readable : tail;
        eos(toRead, () => {
          if (onfinish) {
            let cb = onfinish;
            onfinish = null, cb();
          }
        });
      }
      if (readable) {
        if (isNodeStream(tail))
          tail.on("readable", function() {
            if (onreadable) {
              let cb = onreadable;
              onreadable = null, cb();
            }
          }), tail.on("end", function() {
            d.push(null);
          }), d._read = function() {
            while (true) {
              let buf = tail.read();
              if (buf === null) {
                onreadable = d._read;
                return;
              }
              if (!d.push(buf))
                return;
            }
          };
        else if (isWebStream(tail)) {
          let reader = (isTransformStream(tail) ? tail.readable : tail).getReader();
          d._read = async function() {
            while (true)
              try {
                let { value, done } = await reader.read();
                if (!d.push(value))
                  return;
                if (done) {
                  d.push(null);
                  return;
                }
              } catch {
                return;
              }
          };
        }
      }
      return d._destroy = function(err, callback) {
        if (!err && onclose !== null)
          err = new AbortError2;
        if (onreadable = null, ondrain = null, onfinish = null, onclose === null)
          callback(err);
        else if (onclose = callback, isNodeStream(tail))
          destroyer(tail, err);
      }, d;
    };
  });
  var require_operators = __commonJS2((exports2, module2) => {
    var AbortController = globalThis.AbortController || require_abort_controller().AbortController, { codes: { ERR_INVALID_ARG_VALUE, ERR_INVALID_ARG_TYPE: ERR_INVALID_ARG_TYPE3, ERR_MISSING_ARGS, ERR_OUT_OF_RANGE: ERR_OUT_OF_RANGE3 }, AbortError: AbortError2 } = require_errors(), { validateAbortSignal: validateAbortSignal2, validateInteger, validateObject } = require_validators(), kWeakHandler = require_primordials().Symbol("kWeak"), kResistStopPropagation = require_primordials().Symbol("kResistStopPropagation"), { finished } = require_end_of_stream(), staticCompose = require_compose(), { addAbortSignalNoValidate } = require_add_abort_signal(), { isWritable, isNodeStream } = require_utils(), { deprecate: deprecate2 } = require_util(), { ArrayPrototypePush, Boolean: Boolean2, MathFloor, Number: Number2, NumberIsNaN, Promise: Promise2, PromiseReject, PromiseResolve, PromisePrototypeThen, Symbol: Symbol2 } = require_primordials(), kEmpty = Symbol2("kEmpty"), kEof = Symbol2("kEof");
    function compose(stream, options) {
      if (options != null)
        validateObject(options, "options");
      if ((options === null || options === undefined ? undefined : options.signal) != null)
        validateAbortSignal2(options.signal, "options.signal");
      if (isNodeStream(stream) && !isWritable(stream))
        throw new ERR_INVALID_ARG_VALUE("stream", stream, "must be writable");
      let composedStream = staticCompose(this, stream);
      if (options !== null && options !== undefined && options.signal)
        addAbortSignalNoValidate(options.signal, composedStream);
      return composedStream;
    }
    function map(fn, options) {
      if (typeof fn !== "function")
        throw new ERR_INVALID_ARG_TYPE3("fn", ["Function", "AsyncFunction"], fn);
      if (options != null)
        validateObject(options, "options");
      if ((options === null || options === undefined ? undefined : options.signal) != null)
        validateAbortSignal2(options.signal, "options.signal");
      let concurrency = 1;
      if ((options === null || options === undefined ? undefined : options.concurrency) != null)
        concurrency = MathFloor(options.concurrency);
      let highWaterMark = concurrency - 1;
      if ((options === null || options === undefined ? undefined : options.highWaterMark) != null)
        highWaterMark = MathFloor(options.highWaterMark);
      return validateInteger(concurrency, "options.concurrency", 1), validateInteger(highWaterMark, "options.highWaterMark", 0), highWaterMark += concurrency, async function* map() {
        let signal = require_util().AbortSignalAny([options === null || options === undefined ? undefined : options.signal].filter(Boolean2)), stream = this, queue = [], signalOpt = { signal }, next, resume, done = false, cnt = 0;
        function onCatch() {
          done = true, afterItemProcessed();
        }
        function afterItemProcessed() {
          cnt -= 1, maybeResume();
        }
        function maybeResume() {
          if (resume && !done && cnt < concurrency && queue.length < highWaterMark)
            resume(), resume = null;
        }
        async function pump() {
          try {
            for await (let val of stream) {
              if (done)
                return;
              if (signal.aborted)
                throw new AbortError2;
              try {
                if (val = fn(val, signalOpt), val === kEmpty)
                  continue;
                val = PromiseResolve(val);
              } catch (err) {
                val = PromiseReject(err);
              }
              if (cnt += 1, PromisePrototypeThen(val, afterItemProcessed, onCatch), queue.push(val), next)
                next(), next = null;
              if (!done && (queue.length >= highWaterMark || cnt >= concurrency))
                await new Promise2((resolve2) => {
                  resume = resolve2;
                });
            }
            queue.push(kEof);
          } catch (err) {
            let val = PromiseReject(err);
            PromisePrototypeThen(val, afterItemProcessed, onCatch), queue.push(val);
          } finally {
            if (done = true, next)
              next(), next = null;
          }
        }
        pump();
        try {
          while (true) {
            while (queue.length > 0) {
              let val = await queue[0];
              if (val === kEof)
                return;
              if (signal.aborted)
                throw new AbortError2;
              if (val !== kEmpty)
                yield val;
              queue.shift(), maybeResume();
            }
            await new Promise2((resolve2) => {
              next = resolve2;
            });
          }
        } finally {
          if (done = true, resume)
            resume(), resume = null;
        }
      }.call(this);
    }
    function asIndexedPairs(options = undefined) {
      if (options != null)
        validateObject(options, "options");
      if ((options === null || options === undefined ? undefined : options.signal) != null)
        validateAbortSignal2(options.signal, "options.signal");
      return async function* asIndexedPairs() {
        let index = 0;
        for await (let val of this) {
          var _options$signal;
          if (options !== null && options !== undefined && (_options$signal = options.signal) !== null && _options$signal !== undefined && _options$signal.aborted)
            throw new AbortError2({ cause: options.signal.reason });
          yield [index++, val];
        }
      }.call(this);
    }
    async function some(fn, options = undefined) {
      for await (let unused of filter.call(this, fn, options))
        return true;
      return false;
    }
    async function every(fn, options = undefined) {
      if (typeof fn !== "function")
        throw new ERR_INVALID_ARG_TYPE3("fn", ["Function", "AsyncFunction"], fn);
      return !await some.call(this, async (...args) => {
        return !await fn(...args);
      }, options);
    }
    async function find(fn, options) {
      for await (let result of filter.call(this, fn, options))
        return result;
      return;
    }
    async function forEach(fn, options) {
      if (typeof fn !== "function")
        throw new ERR_INVALID_ARG_TYPE3("fn", ["Function", "AsyncFunction"], fn);
      async function forEachFn(value, options2) {
        return await fn(value, options2), kEmpty;
      }
      for await (let unused of map.call(this, forEachFn, options))
        ;
    }
    function filter(fn, options) {
      if (typeof fn !== "function")
        throw new ERR_INVALID_ARG_TYPE3("fn", ["Function", "AsyncFunction"], fn);
      async function filterFn(value, options2) {
        if (await fn(value, options2))
          return value;
        return kEmpty;
      }
      return map.call(this, filterFn, options);
    }

    class ReduceAwareErrMissingArgs extends ERR_MISSING_ARGS {
      constructor() {
        super("reduce");
        this.message = "Reduce of an empty stream requires an initial value";
      }
    }
    async function reduce(reducer, initialValue, options) {
      var _options$signal2;
      if (typeof reducer !== "function")
        throw new ERR_INVALID_ARG_TYPE3("reducer", ["Function", "AsyncFunction"], reducer);
      if (options != null)
        validateObject(options, "options");
      if ((options === null || options === undefined ? undefined : options.signal) != null)
        validateAbortSignal2(options.signal, "options.signal");
      let hasInitialValue = arguments.length > 1;
      if (options !== null && options !== undefined && (_options$signal2 = options.signal) !== null && _options$signal2 !== undefined && _options$signal2.aborted) {
        let err = new AbortError2(undefined, { cause: options.signal.reason });
        throw this.once("error", () => {}), await finished(this.destroy(err)), err;
      }
      let ac = new AbortController, signal = ac.signal;
      if (options !== null && options !== undefined && options.signal) {
        let opts = { once: true, [kWeakHandler]: this, [kResistStopPropagation]: true };
        options.signal.addEventListener("abort", () => ac.abort(), opts);
      }
      let gotAnyItemFromStream = false;
      try {
        for await (let value of this) {
          var _options$signal3;
          if (gotAnyItemFromStream = true, options !== null && options !== undefined && (_options$signal3 = options.signal) !== null && _options$signal3 !== undefined && _options$signal3.aborted)
            throw new AbortError2;
          if (!hasInitialValue)
            initialValue = value, hasInitialValue = true;
          else
            initialValue = await reducer(initialValue, value, { signal });
        }
        if (!gotAnyItemFromStream && !hasInitialValue)
          throw new ReduceAwareErrMissingArgs;
      } finally {
        ac.abort();
      }
      return initialValue;
    }
    async function toArray(options) {
      if (options != null)
        validateObject(options, "options");
      if ((options === null || options === undefined ? undefined : options.signal) != null)
        validateAbortSignal2(options.signal, "options.signal");
      let result = [];
      for await (let val of this) {
        var _options$signal4;
        if (options !== null && options !== undefined && (_options$signal4 = options.signal) !== null && _options$signal4 !== undefined && _options$signal4.aborted)
          throw new AbortError2(undefined, { cause: options.signal.reason });
        ArrayPrototypePush(result, val);
      }
      return result;
    }
    function flatMap(fn, options) {
      let values = map.call(this, fn, options);
      return async function* flatMap() {
        for await (let val of values)
          yield* val;
      }.call(this);
    }
    function toIntegerOrInfinity(number) {
      if (number = Number2(number), NumberIsNaN(number))
        return 0;
      if (number < 0)
        throw new ERR_OUT_OF_RANGE3("number", ">= 0", number);
      return number;
    }
    function drop(number, options = undefined) {
      if (options != null)
        validateObject(options, "options");
      if ((options === null || options === undefined ? undefined : options.signal) != null)
        validateAbortSignal2(options.signal, "options.signal");
      return number = toIntegerOrInfinity(number), async function* drop() {
        var _options$signal5;
        if (options !== null && options !== undefined && (_options$signal5 = options.signal) !== null && _options$signal5 !== undefined && _options$signal5.aborted)
          throw new AbortError2;
        for await (let val of this) {
          var _options$signal6;
          if (options !== null && options !== undefined && (_options$signal6 = options.signal) !== null && _options$signal6 !== undefined && _options$signal6.aborted)
            throw new AbortError2;
          if (number-- <= 0)
            yield val;
        }
      }.call(this);
    }
    function take(number, options = undefined) {
      if (options != null)
        validateObject(options, "options");
      if ((options === null || options === undefined ? undefined : options.signal) != null)
        validateAbortSignal2(options.signal, "options.signal");
      return number = toIntegerOrInfinity(number), async function* take() {
        var _options$signal7;
        if (options !== null && options !== undefined && (_options$signal7 = options.signal) !== null && _options$signal7 !== undefined && _options$signal7.aborted)
          throw new AbortError2;
        for await (let val of this) {
          var _options$signal8;
          if (options !== null && options !== undefined && (_options$signal8 = options.signal) !== null && _options$signal8 !== undefined && _options$signal8.aborted)
            throw new AbortError2;
          if (number-- > 0)
            yield val;
          if (number <= 0)
            return;
        }
      }.call(this);
    }
    module2.exports.streamReturningOperators = { asIndexedPairs: deprecate2(asIndexedPairs, "readable.asIndexedPairs will be removed in a future version."), drop, filter, flatMap, map, take, compose };
    module2.exports.promiseReturningOperators = { every, forEach, reduce, toArray, some, find };
  });
  var require_promises = __commonJS2((exports2, module2) => {
    var { ArrayPrototypePop, Promise: Promise2 } = require_primordials(), { isIterable, isNodeStream, isWebStream } = require_utils(), { pipelineImpl: pl } = require_pipeline(), { finished } = require_end_of_stream();
    require_stream2();
    function pipeline(...streams) {
      return new Promise2((resolve2, reject) => {
        let signal, end, lastArg = streams[streams.length - 1];
        if (lastArg && typeof lastArg === "object" && !isNodeStream(lastArg) && !isIterable(lastArg) && !isWebStream(lastArg)) {
          let options = ArrayPrototypePop(streams);
          signal = options.signal, end = options.end;
        }
        pl(streams, (err, value) => {
          if (err)
            reject(err);
          else
            resolve2(value);
        }, { signal, end });
      });
    }
    module2.exports = { finished, pipeline };
  });
  var require_stream2 = __commonJS2((exports2, module2) => {
    var { Buffer: Buffer3 } = (init_buffer(), __toCommonJS(exports_buffer)), { ObjectDefineProperty, ObjectKeys, ReflectApply } = require_primordials(), { promisify: { custom: customPromisify } } = require_util(), { streamReturningOperators, promiseReturningOperators } = require_operators(), { codes: { ERR_ILLEGAL_CONSTRUCTOR } } = require_errors(), compose = require_compose(), { setDefaultHighWaterMark, getDefaultHighWaterMark } = require_state(), { pipeline } = require_pipeline(), { destroyer } = require_destroy(), eos = require_end_of_stream(), promises = require_promises(), utils = require_utils(), Stream = module2.exports = require_legacy().Stream;
    Stream.isDestroyed = utils.isDestroyed;
    Stream.isDisturbed = utils.isDisturbed;
    Stream.isErrored = utils.isErrored;
    Stream.isReadable = utils.isReadable;
    Stream.isWritable = utils.isWritable;
    Stream.Readable = require_readable();
    for (let key of ObjectKeys(streamReturningOperators)) {
      let fn = function(...args) {
        if (new.target)
          throw ERR_ILLEGAL_CONSTRUCTOR();
        return Stream.Readable.from(ReflectApply(op, this, args));
      }, op = streamReturningOperators[key];
      ObjectDefineProperty(fn, "name", { __proto__: null, value: op.name }), ObjectDefineProperty(fn, "length", { __proto__: null, value: op.length }), ObjectDefineProperty(Stream.Readable.prototype, key, { __proto__: null, value: fn, enumerable: false, configurable: true, writable: true });
    }
    for (let key of ObjectKeys(promiseReturningOperators)) {
      let fn = function(...args) {
        if (new.target)
          throw ERR_ILLEGAL_CONSTRUCTOR();
        return ReflectApply(op, this, args);
      }, op = promiseReturningOperators[key];
      ObjectDefineProperty(fn, "name", { __proto__: null, value: op.name }), ObjectDefineProperty(fn, "length", { __proto__: null, value: op.length }), ObjectDefineProperty(Stream.Readable.prototype, key, { __proto__: null, value: fn, enumerable: false, configurable: true, writable: true });
    }
    Stream.Writable = require_writable();
    Stream.Duplex = require_duplex();
    Stream.Transform = require_transform();
    Stream.PassThrough = require_passthrough();
    Stream.pipeline = pipeline;
    var { addAbortSignal } = require_add_abort_signal();
    Stream.addAbortSignal = addAbortSignal;
    Stream.finished = eos;
    Stream.destroy = destroyer;
    Stream.compose = compose;
    Stream.setDefaultHighWaterMark = setDefaultHighWaterMark;
    Stream.getDefaultHighWaterMark = getDefaultHighWaterMark;
    ObjectDefineProperty(Stream, "promises", { __proto__: null, configurable: true, enumerable: true, get() {
      return promises;
    } });
    ObjectDefineProperty(pipeline, customPromisify, { __proto__: null, enumerable: true, get() {
      return promises.pipeline;
    } });
    ObjectDefineProperty(eos, customPromisify, { __proto__: null, enumerable: true, get() {
      return promises.finished;
    } });
    Stream.Stream = Stream;
    Stream._isUint8Array = function isUint8Array(value) {
      return value instanceof Uint8Array;
    };
    Stream._uint8ArrayToBuffer = function _uint8ArrayToBuffer(chunk) {
      return Buffer3.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    };
  });
  var require_ours = __commonJS2((exports2, module2) => {
    var Stream = require_stream();
    {
      let CustomStream = require_stream2(), promises = require_promises(), originalDestroy = CustomStream.Readable.destroy;
      module2.exports = CustomStream.Readable, module2.exports._uint8ArrayToBuffer = CustomStream._uint8ArrayToBuffer, module2.exports._isUint8Array = CustomStream._isUint8Array, module2.exports.isDisturbed = CustomStream.isDisturbed, module2.exports.isErrored = CustomStream.isErrored, module2.exports.isReadable = CustomStream.isReadable, module2.exports.Readable = CustomStream.Readable, module2.exports.Writable = CustomStream.Writable, module2.exports.Duplex = CustomStream.Duplex, module2.exports.Transform = CustomStream.Transform, module2.exports.PassThrough = CustomStream.PassThrough, module2.exports.addAbortSignal = CustomStream.addAbortSignal, module2.exports.finished = CustomStream.finished, module2.exports.destroy = CustomStream.destroy, module2.exports.destroy = originalDestroy, module2.exports.pipeline = CustomStream.pipeline, module2.exports.compose = CustomStream.compose, Object.defineProperty(CustomStream, "promises", { configurable: true, enumerable: true, get() {
        return promises;
      } }), module2.exports.Stream = CustomStream.Stream;
    }
    module2.exports.default = module2.exports;
  });
  module.exports = require_ours();
});

// node:crypto
var exports_crypto = {};
__export(exports_crypto, {
  webcrypto: () => webcrypto,
  rng: () => rng2,
  randomUUID: () => randomUUID,
  randomFillSync: () => randomFillSync2,
  randomFill: () => randomFill2,
  randomBytes: () => randomBytes2,
  publicEncrypt: () => publicEncrypt2,
  publicDecrypt: () => publicDecrypt2,
  pseudoRandomBytes: () => pseudoRandomBytes2,
  prng: () => prng2,
  privateEncrypt: () => privateEncrypt2,
  privateDecrypt: () => privateDecrypt2,
  pbkdf2Sync: () => pbkdf2Sync2,
  pbkdf2: () => pbkdf22,
  listCiphers: () => listCiphers2,
  getRandomValues: () => getRandomValues,
  getHashes: () => getHashes2,
  getDiffieHellman: () => getDiffieHellman2,
  getCurves: () => getCurves,
  getCiphers: () => getCiphers2,
  default: () => crypto_default,
  createVerify: () => createVerify2,
  createSign: () => createSign2,
  createHmac: () => createHmac2,
  createHash: () => createHash2,
  createECDH: () => createECDH2,
  createDiffieHellmanGroup: () => createDiffieHellmanGroup2,
  createDiffieHellman: () => createDiffieHellman2,
  createDecipheriv: () => createDecipheriv2,
  createDecipher: () => createDecipher2,
  createCredentials: () => createCredentials2,
  createCipheriv: () => createCipheriv2,
  createCipher: () => createCipher2,
  constants: () => constants2,
  Verify: () => Verify2,
  Sign: () => Sign2,
  Hmac: () => Hmac2,
  Hash: () => Hash2,
  DiffieHellmanGroup: () => DiffieHellmanGroup2,
  DiffieHellman: () => DiffieHellman2,
  Decipheriv: () => Decipheriv2,
  Decipher: () => Decipher2,
  DEFAULT_ENCODING: () => DEFAULT_ENCODING,
  Cipheriv: () => Cipheriv2,
  Cipher: () => Cipher2
});
function getCurves() {
  return hardcoded_curves;
}
var __create2, __getProtoOf2, __defProp2, __getOwnPropNames2, __hasOwnProp2, __toESM2 = (mod, isNodeMode, target) => {
  target = mod != null ? __create2(__getProtoOf2(mod)) : {};
  let to = isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames2(mod))
    if (!__hasOwnProp2.call(to, key))
      __defProp2(to, key, { get: () => mod[key], enumerable: true });
  return to;
}, __commonJS2 = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports), require_randombytes, require_create_hash, require_create_hmac, require_algorithms, require_precondition, require_default_encoding, require_safe_buffer, require_to_buffer, require_sync, require_async, require_pbkdf2, require_browserify_cipher, require_diffie_hellman, require_browserify_sign, require_package, require_bn, require_minimalistic_assert, require_utils, require_utils2, require_brorand, require_base, require_inherits_browser, require_inherits, require_short, require_mont, require_edwards, require_curve, require_utils3, require_common, require_common2, require_1, require_256, require_224, require_512, require_384, require_sha, require_ripemd, require_hmac, require_hash, require_secp256k1, require_curves, require_hmac_drbg, require_key, require_signature, require_ec, require_key2, require_signature2, require_eddsa, require_elliptic, require_bn2, require_browser, require_create_ecdh, require_bn3, require_api, require_reporter, require_buffer, require_node, require_base2, require_der, require_constants, require_der2, require_pem, require_decoders, require_der3, require_pem2, require_encoders, require_asn1, require_certificate, require_asn12, require_aesid, require_hash_base, require_md5, require_evp_bytestokey, require_browserify_aes, require_fixProc, require_parse_asn1, require_mgf, require_xor, require_bn4, require_withPublic, require_bn5, require_browserify_rsa, require_publicEncrypt, require_privateDecrypt, require_browser2, require_public_encrypt, require_browser3, require_randomfill, require_crypto_browserify, cryptoBrowserify, prng2, pseudoRandomBytes2, rng2, randomBytes2, Hash2, createHash2, Hmac2, createHmac2, getHashes2, pbkdf22, pbkdf2Sync2, Cipher2, createCipher2, Cipheriv2, createCipheriv2, Decipher2, createDecipher2, Decipheriv2, createDecipheriv2, getCiphers2, listCiphers2, DiffieHellmanGroup2, createDiffieHellmanGroup2, getDiffieHellman2, createDiffieHellman2, DiffieHellman2, createSign2, Sign2, createVerify2, Verify2, createECDH2, publicEncrypt2, privateEncrypt2, publicDecrypt2, privateDecrypt2, randomFill2, randomFillSync2, createCredentials2, constants2, DEFAULT_ENCODING = "buffer", getRandomValues = (array) => {
  return crypto.getRandomValues(array);
}, randomUUID = () => {
  return crypto.randomUUID();
}, hardcoded_curves, webcrypto, crypto_default;
var init_crypto = __esm(() => {
  __create2 = Object.create;
  ({ getPrototypeOf: __getProtoOf2, defineProperty: __defProp2, getOwnPropertyNames: __getOwnPropNames2 } = Object);
  __hasOwnProp2 = Object.prototype.hasOwnProperty;
  require_randombytes = __commonJS2((exports, module) => {
    module.exports = (init_crypto(), __toCommonJS(exports_crypto)).randomBytes;
  });
  require_create_hash = __commonJS2((exports, module) => {
    module.exports = (init_crypto(), __toCommonJS(exports_crypto)).createHash;
  });
  require_create_hmac = __commonJS2((exports, module) => {
    module.exports = (init_crypto(), __toCommonJS(exports_crypto)).createHmac;
  });
  require_algorithms = __commonJS2((exports, module) => {
    module.exports = { sha224WithRSAEncryption: { sign: "rsa", hash: "sha224", id: "302d300d06096086480165030402040500041c" }, "RSA-SHA224": { sign: "ecdsa/rsa", hash: "sha224", id: "302d300d06096086480165030402040500041c" }, sha256WithRSAEncryption: { sign: "rsa", hash: "sha256", id: "3031300d060960864801650304020105000420" }, "RSA-SHA256": { sign: "ecdsa/rsa", hash: "sha256", id: "3031300d060960864801650304020105000420" }, sha384WithRSAEncryption: { sign: "rsa", hash: "sha384", id: "3041300d060960864801650304020205000430" }, "RSA-SHA384": { sign: "ecdsa/rsa", hash: "sha384", id: "3041300d060960864801650304020205000430" }, sha512WithRSAEncryption: { sign: "rsa", hash: "sha512", id: "3051300d060960864801650304020305000440" }, "RSA-SHA512": { sign: "ecdsa/rsa", hash: "sha512", id: "3051300d060960864801650304020305000440" }, "RSA-SHA1": { sign: "rsa", hash: "sha1", id: "3021300906052b0e03021a05000414" }, "ecdsa-with-SHA1": { sign: "ecdsa", hash: "sha1", id: "" }, sha256: { sign: "ecdsa", hash: "sha256", id: "" }, sha224: { sign: "ecdsa", hash: "sha224", id: "" }, sha384: { sign: "ecdsa", hash: "sha384", id: "" }, sha512: { sign: "ecdsa", hash: "sha512", id: "" }, "DSA-SHA": { sign: "dsa", hash: "sha1", id: "" }, "DSA-SHA1": { sign: "dsa", hash: "sha1", id: "" }, DSA: { sign: "dsa", hash: "sha1", id: "" }, "DSA-WITH-SHA224": { sign: "dsa", hash: "sha224", id: "" }, "DSA-SHA224": { sign: "dsa", hash: "sha224", id: "" }, "DSA-WITH-SHA256": { sign: "dsa", hash: "sha256", id: "" }, "DSA-SHA256": { sign: "dsa", hash: "sha256", id: "" }, "DSA-WITH-SHA384": { sign: "dsa", hash: "sha384", id: "" }, "DSA-SHA384": { sign: "dsa", hash: "sha384", id: "" }, "DSA-WITH-SHA512": { sign: "dsa", hash: "sha512", id: "" }, "DSA-SHA512": { sign: "dsa", hash: "sha512", id: "" }, "DSA-RIPEMD160": { sign: "dsa", hash: "rmd160", id: "" }, ripemd160WithRSA: { sign: "rsa", hash: "rmd160", id: "3021300906052b2403020105000414" }, "RSA-RIPEMD160": { sign: "rsa", hash: "rmd160", id: "3021300906052b2403020105000414" }, md5WithRSAEncryption: { sign: "rsa", hash: "md5", id: "3020300c06082a864886f70d020505000410" }, "RSA-MD5": { sign: "rsa", hash: "md5", id: "3020300c06082a864886f70d020505000410" } };
  });
  require_precondition = __commonJS2((exports, module) => {
    var MAX_ALLOC = Math.pow(2, 30) - 1;
    module.exports = function(iterations, keylen) {
      if (typeof iterations !== "number")
        throw new TypeError("Iterations not a number");
      if (iterations < 0)
        throw new TypeError("Bad iterations");
      if (typeof keylen !== "number")
        throw new TypeError("Key length not a number");
      if (keylen < 0 || keylen > MAX_ALLOC || keylen !== keylen)
        throw new TypeError("Bad key length");
    };
  });
  require_default_encoding = __commonJS2((exports, module) => {
    var defaultEncoding;
    if (globalThis.process && globalThis.process.browser)
      defaultEncoding = "utf-8";
    else if (globalThis.process && globalThis.process.version)
      pVersionMajor = parseInt(process.version.split(".")[0].slice(1), 10), defaultEncoding = pVersionMajor >= 6 ? "utf-8" : "binary";
    else
      defaultEncoding = "utf-8";
    var pVersionMajor;
    module.exports = defaultEncoding;
  });
  require_safe_buffer = __commonJS2((exports, module) => {
    /*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
    var buffer = (init_buffer(), __toCommonJS(exports_buffer)), Buffer22 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src)
        dst[key] = src[key];
    }
    if (Buffer22.from && Buffer22.alloc && Buffer22.allocUnsafe && Buffer22.allocUnsafeSlow)
      module.exports = buffer;
    else
      copyProps(buffer, exports), exports.Buffer = SafeBuffer;
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer22(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer22.prototype);
    copyProps(Buffer22, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number")
        throw new TypeError("Argument must not be a number");
      return Buffer22(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill2, encoding) {
      if (typeof size !== "number")
        throw new TypeError("Argument must be a number");
      var buf = Buffer22(size);
      if (fill2 !== undefined)
        if (typeof encoding === "string")
          buf.fill(fill2, encoding);
        else
          buf.fill(fill2);
      else
        buf.fill(0);
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number")
        throw new TypeError("Argument must be a number");
      return Buffer22(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number")
        throw new TypeError("Argument must be a number");
      return buffer.SlowBuffer(size);
    };
  });
  require_to_buffer = __commonJS2((exports, module) => {
    var Buffer22 = require_safe_buffer().Buffer;
    module.exports = function(thing, encoding, name) {
      if (Buffer22.isBuffer(thing))
        return thing;
      else if (typeof thing === "string")
        return Buffer22.from(thing, encoding);
      else if (ArrayBuffer.isView(thing))
        return Buffer22.from(thing.buffer);
      else
        throw new TypeError(name + " must be a string, a Buffer, a typed array or a DataView");
    };
  });
  require_sync = __commonJS2((exports, module) => {
    var sizes = { md5: 16, sha1: 20, sha224: 28, sha256: 32, sha384: 48, sha512: 64, rmd160: 20, ripemd160: 20 }, createHmac = require_create_hmac(), Buffer22 = require_safe_buffer().Buffer, checkParameters = require_precondition(), defaultEncoding = require_default_encoding(), toBuffer = require_to_buffer();
    function pbkdf2(password, salt, iterations, keylen, digest) {
      checkParameters(iterations, keylen), password = toBuffer(password, defaultEncoding, "Password"), salt = toBuffer(salt, defaultEncoding, "Salt"), digest = digest || "sha1";
      var DK = Buffer22.allocUnsafe(keylen), block1 = Buffer22.allocUnsafe(salt.length + 4);
      salt.copy(block1, 0, 0, salt.length);
      var destPos = 0, hLen = sizes[digest], l = Math.ceil(keylen / hLen);
      for (var i2 = 1;i2 <= l; i2++) {
        block1.writeUInt32BE(i2, salt.length);
        var T = createHmac(digest, password).update(block1).digest(), U = T;
        for (var j = 1;j < iterations; j++) {
          U = createHmac(digest, password).update(U).digest();
          for (var k = 0;k < hLen; k++)
            T[k] ^= U[k];
        }
        T.copy(DK, destPos), destPos += hLen;
      }
      return DK;
    }
    module.exports = pbkdf2;
  });
  require_async = __commonJS2((exports, module) => {
    var Buffer22 = require_safe_buffer().Buffer, checkParameters = require_precondition(), defaultEncoding = require_default_encoding(), sync = require_sync(), toBuffer = require_to_buffer(), ZERO_BUF, subtle = globalThis.crypto && globalThis.crypto.subtle, toBrowser = { sha: "SHA-1", "sha-1": "SHA-1", sha1: "SHA-1", sha256: "SHA-256", "sha-256": "SHA-256", sha384: "SHA-384", "sha-384": "SHA-384", "sha-512": "SHA-512", sha512: "SHA-512" }, checks = [];
    function checkNative(algo) {
      if (globalThis.process && !globalThis.process.browser)
        return Promise.resolve(false);
      if (!subtle || !subtle.importKey || !subtle.deriveBits)
        return Promise.resolve(false);
      if (checks[algo] !== undefined)
        return checks[algo];
      ZERO_BUF = ZERO_BUF || Buffer22.alloc(8);
      var prom = browserPbkdf2(ZERO_BUF, ZERO_BUF, 10, 128, algo).then(function() {
        return true;
      }).catch(function() {
        return false;
      });
      return checks[algo] = prom, prom;
    }
    var nextTick;
    function getNextTick() {
      if (nextTick)
        return nextTick;
      if (globalThis.process && globalThis.process.nextTick)
        nextTick = globalThis.process.nextTick;
      else if (globalThis.queueMicrotask)
        nextTick = globalThis.queueMicrotask;
      else if (globalThis.setImmediate)
        nextTick = globalThis.setImmediate;
      else
        nextTick = globalThis.setTimeout;
      return nextTick;
    }
    function browserPbkdf2(password, salt, iterations, length, algo) {
      return subtle.importKey("raw", password, { name: "PBKDF2" }, false, ["deriveBits"]).then(function(key) {
        return subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: { name: algo } }, key, length << 3);
      }).then(function(res) {
        return Buffer22.from(res);
      });
    }
    function resolvePromise(promise, callback) {
      promise.then(function(out) {
        getNextTick()(function() {
          callback(null, out);
        });
      }, function(e) {
        getNextTick()(function() {
          callback(e);
        });
      });
    }
    module.exports = function(password, salt, iterations, keylen, digest, callback) {
      if (typeof digest === "function")
        callback = digest, digest = undefined;
      digest = digest || "sha1";
      var algo = toBrowser[digest.toLowerCase()];
      if (!algo || typeof globalThis.Promise !== "function") {
        getNextTick()(function() {
          var out;
          try {
            out = sync(password, salt, iterations, keylen, digest);
          } catch (e) {
            return callback(e);
          }
          callback(null, out);
        });
        return;
      }
      if (checkParameters(iterations, keylen), password = toBuffer(password, defaultEncoding, "Password"), salt = toBuffer(salt, defaultEncoding, "Salt"), typeof callback !== "function")
        throw new Error("No callback provided to pbkdf2");
      resolvePromise(checkNative(algo).then(function(resp) {
        if (resp)
          return browserPbkdf2(password, salt, iterations, keylen, algo);
        return sync(password, salt, iterations, keylen, digest);
      }), callback);
    };
  });
  require_pbkdf2 = __commonJS2((exports) => {
    var native = (init_crypto(), __toCommonJS(exports_crypto)), checkParameters = require_precondition(), defaultEncoding = require_default_encoding(), toBuffer = require_to_buffer();
    function nativePBKDF2(password, salt, iterations, keylen, digest, callback) {
      if (checkParameters(iterations, keylen), password = toBuffer(password, defaultEncoding, "Password"), salt = toBuffer(salt, defaultEncoding, "Salt"), typeof digest === "function")
        callback = digest, digest = "sha1";
      if (typeof callback !== "function")
        throw new Error("No callback provided to pbkdf2");
      return native.pbkdf2(password, salt, iterations, keylen, digest, callback);
    }
    function nativePBKDF2Sync(password, salt, iterations, keylen, digest) {
      return checkParameters(iterations, keylen), password = toBuffer(password, defaultEncoding, "Password"), salt = toBuffer(salt, defaultEncoding, "Salt"), digest = digest || "sha1", native.pbkdf2Sync(password, salt, iterations, keylen, digest);
    }
    if (!native.pbkdf2Sync || native.pbkdf2Sync.toString().indexOf("keylen, digest") === -1)
      exports.pbkdf2Sync = require_sync(), exports.pbkdf2 = require_async();
    else
      exports.pbkdf2Sync = nativePBKDF2Sync, exports.pbkdf2 = nativePBKDF2;
  });
  require_browserify_cipher = __commonJS2((exports) => {
    var crypto2 = (init_crypto(), __toCommonJS(exports_crypto));
    exports.createCipher = exports.Cipher = crypto2.createCipher;
    exports.createCipheriv = exports.Cipheriv = crypto2.createCipheriv;
    exports.createDecipher = exports.Decipher = crypto2.createDecipher;
    exports.createDecipheriv = exports.Decipheriv = crypto2.createDecipheriv;
    exports.listCiphers = exports.getCiphers = crypto2.getCiphers;
  });
  require_diffie_hellman = __commonJS2((exports) => {
    var crypto2 = (init_crypto(), __toCommonJS(exports_crypto));
    exports.DiffieHellmanGroup = crypto2.DiffieHellmanGroup;
    exports.createDiffieHellmanGroup = crypto2.createDiffieHellmanGroup;
    exports.getDiffieHellman = crypto2.getDiffieHellman;
    exports.createDiffieHellman = crypto2.createDiffieHellman;
    exports.DiffieHellman = crypto2.DiffieHellman;
  });
  require_browserify_sign = __commonJS2((exports) => {
    var crypto2 = (init_crypto(), __toCommonJS(exports_crypto));
    exports.createSign = crypto2.createSign;
    exports.Sign = crypto2.Sign;
    exports.createVerify = crypto2.createVerify;
    exports.Verify = crypto2.Verify;
  });
  require_package = __commonJS2((exports, module) => {
    module.exports = { name: "elliptic", version: "6.6.1", description: "EC cryptography", main: "lib/elliptic.js", files: ["lib"], scripts: { lint: "eslint lib test", "lint:fix": "npm run lint -- --fix", unit: "istanbul test _mocha --reporter=spec test/index.js", test: "npm run lint && npm run unit", version: "grunt dist && git add dist/" }, repository: { type: "git", url: "git@github.com:indutny/elliptic" }, keywords: ["EC", "Elliptic", "curve", "Cryptography"], author: "Fedor Indutny <fedor@indutny.com>", license: "MIT", bugs: { url: "https://github.com/indutny/elliptic/issues" }, homepage: "https://github.com/indutny/elliptic", devDependencies: { brfs: "^2.0.2", coveralls: "^3.1.0", eslint: "^7.6.0", grunt: "^1.2.1", "grunt-browserify": "^5.3.0", "grunt-cli": "^1.3.2", "grunt-contrib-connect": "^3.0.0", "grunt-contrib-copy": "^1.0.0", "grunt-contrib-uglify": "^5.0.0", "grunt-mocha-istanbul": "^5.0.2", "grunt-saucelabs": "^9.0.1", istanbul: "^0.4.5", mocha: "^8.0.1" }, dependencies: { "bn.js": "^4.11.9", brorand: "^1.1.0", "hash.js": "^1.0.0", "hmac-drbg": "^1.0.1", inherits: "^2.0.4", "minimalistic-assert": "^1.0.1", "minimalistic-crypto-utils": "^1.0.1" } };
  });
  require_bn = __commonJS2((exports, module) => {
    (function(module2, exports2) {
      function assert(val, msg) {
        if (!val)
          throw new Error(msg || "Assertion failed");
      }
      function inherits2(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {};
        TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor, ctor.prototype.constructor = ctor;
      }
      function BN(number, base, endian) {
        if (BN.isBN(number))
          return number;
        if (this.negative = 0, this.words = null, this.length = 0, this.red = null, number !== null) {
          if (base === "le" || base === "be")
            endian = base, base = 10;
          this._init(number || 0, base || 10, endian || "be");
        }
      }
      if (typeof module2 === "object")
        module2.exports = BN;
      else
        exports2.BN = BN;
      BN.BN = BN, BN.wordSize = 26;
      var Buffer22;
      try {
        if (typeof window !== "undefined" && typeof window.Buffer !== "undefined")
          Buffer22 = window.Buffer;
        else
          Buffer22 = (init_buffer(), __toCommonJS(exports_buffer)).Buffer;
      } catch (e) {}
      BN.isBN = function isBN(num) {
        if (num instanceof BN)
          return true;
        return num !== null && typeof num === "object" && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
      }, BN.max = function max(left, right) {
        if (left.cmp(right) > 0)
          return left;
        return right;
      }, BN.min = function min(left, right) {
        if (left.cmp(right) < 0)
          return left;
        return right;
      }, BN.prototype._init = function init(number, base, endian) {
        if (typeof number === "number")
          return this._initNumber(number, base, endian);
        if (typeof number === "object")
          return this._initArray(number, base, endian);
        if (base === "hex")
          base = 16;
        assert(base === (base | 0) && base >= 2 && base <= 36), number = number.toString().replace(/\s+/g, "");
        var start = 0;
        if (number[0] === "-")
          start++, this.negative = 1;
        if (start < number.length) {
          if (base === 16)
            this._parseHex(number, start, endian);
          else if (this._parseBase(number, base, start), endian === "le")
            this._initArray(this.toArray(), base, endian);
        }
      }, BN.prototype._initNumber = function _initNumber(number, base, endian) {
        if (number < 0)
          this.negative = 1, number = -number;
        if (number < 67108864)
          this.words = [number & 67108863], this.length = 1;
        else if (number < 4503599627370496)
          this.words = [number & 67108863, number / 67108864 & 67108863], this.length = 2;
        else
          assert(number < 9007199254740992), this.words = [number & 67108863, number / 67108864 & 67108863, 1], this.length = 3;
        if (endian !== "le")
          return;
        this._initArray(this.toArray(), base, endian);
      }, BN.prototype._initArray = function _initArray(number, base, endian) {
        if (assert(typeof number.length === "number"), number.length <= 0)
          return this.words = [0], this.length = 1, this;
        this.length = Math.ceil(number.length / 3), this.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          this.words[i2] = 0;
        var j, w, off = 0;
        if (endian === "be") {
          for (i2 = number.length - 1, j = 0;i2 >= 0; i2 -= 3)
            if (w = number[i2] | number[i2 - 1] << 8 | number[i2 - 2] << 16, this.words[j] |= w << off & 67108863, this.words[j + 1] = w >>> 26 - off & 67108863, off += 24, off >= 26)
              off -= 26, j++;
        } else if (endian === "le") {
          for (i2 = 0, j = 0;i2 < number.length; i2 += 3)
            if (w = number[i2] | number[i2 + 1] << 8 | number[i2 + 2] << 16, this.words[j] |= w << off & 67108863, this.words[j + 1] = w >>> 26 - off & 67108863, off += 24, off >= 26)
              off -= 26, j++;
        }
        return this.strip();
      };
      function parseHex4Bits(string, index) {
        var c = string.charCodeAt(index);
        if (c >= 65 && c <= 70)
          return c - 55;
        else if (c >= 97 && c <= 102)
          return c - 87;
        else
          return c - 48 & 15;
      }
      function parseHexByte(string, lowerBound, index) {
        var r = parseHex4Bits(string, index);
        if (index - 1 >= lowerBound)
          r |= parseHex4Bits(string, index - 1) << 4;
        return r;
      }
      BN.prototype._parseHex = function _parseHex(number, start, endian) {
        this.length = Math.ceil((number.length - start) / 6), this.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          this.words[i2] = 0;
        var off = 0, j = 0, w;
        if (endian === "be")
          for (i2 = number.length - 1;i2 >= start; i2 -= 2)
            if (w = parseHexByte(number, start, i2) << off, this.words[j] |= w & 67108863, off >= 18)
              off -= 18, j += 1, this.words[j] |= w >>> 26;
            else
              off += 8;
        else {
          var parseLength = number.length - start;
          for (i2 = parseLength % 2 === 0 ? start + 1 : start;i2 < number.length; i2 += 2)
            if (w = parseHexByte(number, start, i2) << off, this.words[j] |= w & 67108863, off >= 18)
              off -= 18, j += 1, this.words[j] |= w >>> 26;
            else
              off += 8;
        }
        this.strip();
      };
      function parseBase(str, start, end, mul) {
        var r = 0, len2 = Math.min(str.length, end);
        for (var i2 = start;i2 < len2; i2++) {
          var c = str.charCodeAt(i2) - 48;
          if (r *= mul, c >= 49)
            r += c - 49 + 10;
          else if (c >= 17)
            r += c - 17 + 10;
          else
            r += c;
        }
        return r;
      }
      BN.prototype._parseBase = function _parseBase(number, base, start) {
        this.words = [0], this.length = 1;
        for (var limbLen = 0, limbPow = 1;limbPow <= 67108863; limbPow *= base)
          limbLen++;
        limbLen--, limbPow = limbPow / base | 0;
        var total = number.length - start, mod = total % limbLen, end = Math.min(total, total - mod) + start, word = 0;
        for (var i2 = start;i2 < end; i2 += limbLen)
          if (word = parseBase(number, i2, i2 + limbLen, base), this.imuln(limbPow), this.words[0] + word < 67108864)
            this.words[0] += word;
          else
            this._iaddn(word);
        if (mod !== 0) {
          var pow = 1;
          word = parseBase(number, i2, number.length, base);
          for (i2 = 0;i2 < mod; i2++)
            pow *= base;
          if (this.imuln(pow), this.words[0] + word < 67108864)
            this.words[0] += word;
          else
            this._iaddn(word);
        }
        this.strip();
      }, BN.prototype.copy = function copy(dest) {
        dest.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          dest.words[i2] = this.words[i2];
        dest.length = this.length, dest.negative = this.negative, dest.red = this.red;
      }, BN.prototype.clone = function clone() {
        var r = new BN(null);
        return this.copy(r), r;
      }, BN.prototype._expand = function _expand(size) {
        while (this.length < size)
          this.words[this.length++] = 0;
        return this;
      }, BN.prototype.strip = function strip() {
        while (this.length > 1 && this.words[this.length - 1] === 0)
          this.length--;
        return this._normSign();
      }, BN.prototype._normSign = function _normSign() {
        if (this.length === 1 && this.words[0] === 0)
          this.negative = 0;
        return this;
      }, BN.prototype.inspect = function inspect() {
        return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
      };
      var zeros = ["", "0", "00", "000", "0000", "00000", "000000", "0000000", "00000000", "000000000", "0000000000", "00000000000", "000000000000", "0000000000000", "00000000000000", "000000000000000", "0000000000000000", "00000000000000000", "000000000000000000", "0000000000000000000", "00000000000000000000", "000000000000000000000", "0000000000000000000000", "00000000000000000000000", "000000000000000000000000", "0000000000000000000000000"], groupSizes = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], groupBases = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];
      if (BN.prototype.toString = function toString(base, padding) {
        base = base || 10, padding = padding | 0 || 1;
        var out;
        if (base === 16 || base === "hex") {
          out = "";
          var off = 0, carry = 0;
          for (var i2 = 0;i2 < this.length; i2++) {
            var w = this.words[i2], word = ((w << off | carry) & 16777215).toString(16);
            if (carry = w >>> 24 - off & 16777215, off += 2, off >= 26)
              off -= 26, i2--;
            if (carry !== 0 || i2 !== this.length - 1)
              out = zeros[6 - word.length] + word + out;
            else
              out = word + out;
          }
          if (carry !== 0)
            out = carry.toString(16) + out;
          while (out.length % padding !== 0)
            out = "0" + out;
          if (this.negative !== 0)
            out = "-" + out;
          return out;
        }
        if (base === (base | 0) && base >= 2 && base <= 36) {
          var groupSize = groupSizes[base], groupBase = groupBases[base];
          out = "";
          var c = this.clone();
          c.negative = 0;
          while (!c.isZero()) {
            var r = c.modn(groupBase).toString(base);
            if (c = c.idivn(groupBase), !c.isZero())
              out = zeros[groupSize - r.length] + r + out;
            else
              out = r + out;
          }
          if (this.isZero())
            out = "0" + out;
          while (out.length % padding !== 0)
            out = "0" + out;
          if (this.negative !== 0)
            out = "-" + out;
          return out;
        }
        assert(false, "Base should be between 2 and 36");
      }, BN.prototype.toNumber = function toNumber() {
        var ret = this.words[0];
        if (this.length === 2)
          ret += this.words[1] * 67108864;
        else if (this.length === 3 && this.words[2] === 1)
          ret += 4503599627370496 + this.words[1] * 67108864;
        else if (this.length > 2)
          assert(false, "Number can only safely store up to 53 bits");
        return this.negative !== 0 ? -ret : ret;
      }, BN.prototype.toJSON = function toJSON() {
        return this.toString(16);
      }, BN.prototype.toBuffer = function toBuffer(endian, length) {
        return assert(typeof Buffer22 !== "undefined"), this.toArrayLike(Buffer22, endian, length);
      }, BN.prototype.toArray = function toArray(endian, length) {
        return this.toArrayLike(Array, endian, length);
      }, BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
        var byteLength2 = this.byteLength(), reqLength = length || Math.max(1, byteLength2);
        assert(byteLength2 <= reqLength, "byte array longer than desired length"), assert(reqLength > 0, "Requested array length <= 0"), this.strip();
        var littleEndian = endian === "le", res = new ArrayType(reqLength), b, i2, q = this.clone();
        if (!littleEndian) {
          for (i2 = 0;i2 < reqLength - byteLength2; i2++)
            res[i2] = 0;
          for (i2 = 0;!q.isZero(); i2++)
            b = q.andln(255), q.iushrn(8), res[reqLength - i2 - 1] = b;
        } else {
          for (i2 = 0;!q.isZero(); i2++)
            b = q.andln(255), q.iushrn(8), res[i2] = b;
          for (;i2 < reqLength; i2++)
            res[i2] = 0;
        }
        return res;
      }, Math.clz32)
        BN.prototype._countBits = function _countBits(w) {
          return 32 - Math.clz32(w);
        };
      else
        BN.prototype._countBits = function _countBits(w) {
          var t = w, r = 0;
          if (t >= 4096)
            r += 13, t >>>= 13;
          if (t >= 64)
            r += 7, t >>>= 7;
          if (t >= 8)
            r += 4, t >>>= 4;
          if (t >= 2)
            r += 2, t >>>= 2;
          return r + t;
        };
      BN.prototype._zeroBits = function _zeroBits(w) {
        if (w === 0)
          return 26;
        var t = w, r = 0;
        if ((t & 8191) === 0)
          r += 13, t >>>= 13;
        if ((t & 127) === 0)
          r += 7, t >>>= 7;
        if ((t & 15) === 0)
          r += 4, t >>>= 4;
        if ((t & 3) === 0)
          r += 2, t >>>= 2;
        if ((t & 1) === 0)
          r++;
        return r;
      }, BN.prototype.bitLength = function bitLength() {
        var w = this.words[this.length - 1], hi = this._countBits(w);
        return (this.length - 1) * 26 + hi;
      };
      function toBitArray(num) {
        var w = new Array(num.bitLength());
        for (var bit = 0;bit < w.length; bit++) {
          var off = bit / 26 | 0, wbit = bit % 26;
          w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
        }
        return w;
      }
      BN.prototype.zeroBits = function zeroBits() {
        if (this.isZero())
          return 0;
        var r = 0;
        for (var i2 = 0;i2 < this.length; i2++) {
          var b = this._zeroBits(this.words[i2]);
          if (r += b, b !== 26)
            break;
        }
        return r;
      }, BN.prototype.byteLength = function byteLength() {
        return Math.ceil(this.bitLength() / 8);
      }, BN.prototype.toTwos = function toTwos(width) {
        if (this.negative !== 0)
          return this.abs().inotn(width).iaddn(1);
        return this.clone();
      }, BN.prototype.fromTwos = function fromTwos(width) {
        if (this.testn(width - 1))
          return this.notn(width).iaddn(1).ineg();
        return this.clone();
      }, BN.prototype.isNeg = function isNeg() {
        return this.negative !== 0;
      }, BN.prototype.neg = function neg() {
        return this.clone().ineg();
      }, BN.prototype.ineg = function ineg() {
        if (!this.isZero())
          this.negative ^= 1;
        return this;
      }, BN.prototype.iuor = function iuor(num) {
        while (this.length < num.length)
          this.words[this.length++] = 0;
        for (var i2 = 0;i2 < num.length; i2++)
          this.words[i2] = this.words[i2] | num.words[i2];
        return this.strip();
      }, BN.prototype.ior = function ior(num) {
        return assert((this.negative | num.negative) === 0), this.iuor(num);
      }, BN.prototype.or = function or(num) {
        if (this.length > num.length)
          return this.clone().ior(num);
        return num.clone().ior(this);
      }, BN.prototype.uor = function uor(num) {
        if (this.length > num.length)
          return this.clone().iuor(num);
        return num.clone().iuor(this);
      }, BN.prototype.iuand = function iuand(num) {
        var b;
        if (this.length > num.length)
          b = num;
        else
          b = this;
        for (var i2 = 0;i2 < b.length; i2++)
          this.words[i2] = this.words[i2] & num.words[i2];
        return this.length = b.length, this.strip();
      }, BN.prototype.iand = function iand(num) {
        return assert((this.negative | num.negative) === 0), this.iuand(num);
      }, BN.prototype.and = function and(num) {
        if (this.length > num.length)
          return this.clone().iand(num);
        return num.clone().iand(this);
      }, BN.prototype.uand = function uand(num) {
        if (this.length > num.length)
          return this.clone().iuand(num);
        return num.clone().iuand(this);
      }, BN.prototype.iuxor = function iuxor(num) {
        var a, b;
        if (this.length > num.length)
          a = this, b = num;
        else
          a = num, b = this;
        for (var i2 = 0;i2 < b.length; i2++)
          this.words[i2] = a.words[i2] ^ b.words[i2];
        if (this !== a)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        return this.length = a.length, this.strip();
      }, BN.prototype.ixor = function ixor(num) {
        return assert((this.negative | num.negative) === 0), this.iuxor(num);
      }, BN.prototype.xor = function xor(num) {
        if (this.length > num.length)
          return this.clone().ixor(num);
        return num.clone().ixor(this);
      }, BN.prototype.uxor = function uxor(num) {
        if (this.length > num.length)
          return this.clone().iuxor(num);
        return num.clone().iuxor(this);
      }, BN.prototype.inotn = function inotn(width) {
        assert(typeof width === "number" && width >= 0);
        var bytesNeeded = Math.ceil(width / 26) | 0, bitsLeft = width % 26;
        if (this._expand(bytesNeeded), bitsLeft > 0)
          bytesNeeded--;
        for (var i2 = 0;i2 < bytesNeeded; i2++)
          this.words[i2] = ~this.words[i2] & 67108863;
        if (bitsLeft > 0)
          this.words[i2] = ~this.words[i2] & 67108863 >> 26 - bitsLeft;
        return this.strip();
      }, BN.prototype.notn = function notn(width) {
        return this.clone().inotn(width);
      }, BN.prototype.setn = function setn(bit, val) {
        assert(typeof bit === "number" && bit >= 0);
        var off = bit / 26 | 0, wbit = bit % 26;
        if (this._expand(off + 1), val)
          this.words[off] = this.words[off] | 1 << wbit;
        else
          this.words[off] = this.words[off] & ~(1 << wbit);
        return this.strip();
      }, BN.prototype.iadd = function iadd(num) {
        var r;
        if (this.negative !== 0 && num.negative === 0)
          return this.negative = 0, r = this.isub(num), this.negative ^= 1, this._normSign();
        else if (this.negative === 0 && num.negative !== 0)
          return num.negative = 0, r = this.isub(num), num.negative = 1, r._normSign();
        var a, b;
        if (this.length > num.length)
          a = this, b = num;
        else
          a = num, b = this;
        var carry = 0;
        for (var i2 = 0;i2 < b.length; i2++)
          r = (a.words[i2] | 0) + (b.words[i2] | 0) + carry, this.words[i2] = r & 67108863, carry = r >>> 26;
        for (;carry !== 0 && i2 < a.length; i2++)
          r = (a.words[i2] | 0) + carry, this.words[i2] = r & 67108863, carry = r >>> 26;
        if (this.length = a.length, carry !== 0)
          this.words[this.length] = carry, this.length++;
        else if (a !== this)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        return this;
      }, BN.prototype.add = function add(num) {
        var res;
        if (num.negative !== 0 && this.negative === 0)
          return num.negative = 0, res = this.sub(num), num.negative ^= 1, res;
        else if (num.negative === 0 && this.negative !== 0)
          return this.negative = 0, res = num.sub(this), this.negative = 1, res;
        if (this.length > num.length)
          return this.clone().iadd(num);
        return num.clone().iadd(this);
      }, BN.prototype.isub = function isub(num) {
        if (num.negative !== 0) {
          num.negative = 0;
          var r = this.iadd(num);
          return num.negative = 1, r._normSign();
        } else if (this.negative !== 0)
          return this.negative = 0, this.iadd(num), this.negative = 1, this._normSign();
        var cmp = this.cmp(num);
        if (cmp === 0)
          return this.negative = 0, this.length = 1, this.words[0] = 0, this;
        var a, b;
        if (cmp > 0)
          a = this, b = num;
        else
          a = num, b = this;
        var carry = 0;
        for (var i2 = 0;i2 < b.length; i2++)
          r = (a.words[i2] | 0) - (b.words[i2] | 0) + carry, carry = r >> 26, this.words[i2] = r & 67108863;
        for (;carry !== 0 && i2 < a.length; i2++)
          r = (a.words[i2] | 0) + carry, carry = r >> 26, this.words[i2] = r & 67108863;
        if (carry === 0 && i2 < a.length && a !== this)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        if (this.length = Math.max(this.length, i2), a !== this)
          this.negative = 1;
        return this.strip();
      }, BN.prototype.sub = function sub(num) {
        return this.clone().isub(num);
      };
      function smallMulTo(self2, num, out) {
        out.negative = num.negative ^ self2.negative;
        var len2 = self2.length + num.length | 0;
        out.length = len2, len2 = len2 - 1 | 0;
        var a = self2.words[0] | 0, b = num.words[0] | 0, r = a * b, lo = r & 67108863, carry = r / 67108864 | 0;
        out.words[0] = lo;
        for (var k = 1;k < len2; k++) {
          var ncarry = carry >>> 26, rword = carry & 67108863, maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self2.length + 1);j <= maxJ; j++) {
            var i2 = k - j | 0;
            a = self2.words[i2] | 0, b = num.words[j] | 0, r = a * b + rword, ncarry += r / 67108864 | 0, rword = r & 67108863;
          }
          out.words[k] = rword | 0, carry = ncarry | 0;
        }
        if (carry !== 0)
          out.words[k] = carry | 0;
        else
          out.length--;
        return out.strip();
      }
      var comb10MulTo = function comb10MulTo(self2, num, out) {
        var a = self2.words, b = num.words, o = out.words, c = 0, lo, mid, hi, a0 = a[0] | 0, al0 = a0 & 8191, ah0 = a0 >>> 13, a1 = a[1] | 0, al1 = a1 & 8191, ah1 = a1 >>> 13, a2 = a[2] | 0, al2 = a2 & 8191, ah2 = a2 >>> 13, a3 = a[3] | 0, al3 = a3 & 8191, ah3 = a3 >>> 13, a4 = a[4] | 0, al4 = a4 & 8191, ah4 = a4 >>> 13, a5 = a[5] | 0, al5 = a5 & 8191, ah5 = a5 >>> 13, a6 = a[6] | 0, al6 = a6 & 8191, ah6 = a6 >>> 13, a7 = a[7] | 0, al7 = a7 & 8191, ah7 = a7 >>> 13, a8 = a[8] | 0, al8 = a8 & 8191, ah8 = a8 >>> 13, a9 = a[9] | 0, al9 = a9 & 8191, ah9 = a9 >>> 13, b0 = b[0] | 0, bl0 = b0 & 8191, bh0 = b0 >>> 13, b1 = b[1] | 0, bl1 = b1 & 8191, bh1 = b1 >>> 13, b2 = b[2] | 0, bl2 = b2 & 8191, bh2 = b2 >>> 13, b3 = b[3] | 0, bl3 = b3 & 8191, bh3 = b3 >>> 13, b4 = b[4] | 0, bl4 = b4 & 8191, bh4 = b4 >>> 13, b5 = b[5] | 0, bl5 = b5 & 8191, bh5 = b5 >>> 13, b6 = b[6] | 0, bl6 = b6 & 8191, bh6 = b6 >>> 13, b7 = b[7] | 0, bl7 = b7 & 8191, bh7 = b7 >>> 13, b8 = b[8] | 0, bl8 = b8 & 8191, bh8 = b8 >>> 13, b9 = b[9] | 0, bl9 = b9 & 8191, bh9 = b9 >>> 13;
        out.negative = self2.negative ^ num.negative, out.length = 19, lo = Math.imul(al0, bl0), mid = Math.imul(al0, bh0), mid = mid + Math.imul(ah0, bl0) | 0, hi = Math.imul(ah0, bh0);
        var w0 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0, w0 &= 67108863, lo = Math.imul(al1, bl0), mid = Math.imul(al1, bh0), mid = mid + Math.imul(ah1, bl0) | 0, hi = Math.imul(ah1, bh0), lo = lo + Math.imul(al0, bl1) | 0, mid = mid + Math.imul(al0, bh1) | 0, mid = mid + Math.imul(ah0, bl1) | 0, hi = hi + Math.imul(ah0, bh1) | 0;
        var w1 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0, w1 &= 67108863, lo = Math.imul(al2, bl0), mid = Math.imul(al2, bh0), mid = mid + Math.imul(ah2, bl0) | 0, hi = Math.imul(ah2, bh0), lo = lo + Math.imul(al1, bl1) | 0, mid = mid + Math.imul(al1, bh1) | 0, mid = mid + Math.imul(ah1, bl1) | 0, hi = hi + Math.imul(ah1, bh1) | 0, lo = lo + Math.imul(al0, bl2) | 0, mid = mid + Math.imul(al0, bh2) | 0, mid = mid + Math.imul(ah0, bl2) | 0, hi = hi + Math.imul(ah0, bh2) | 0;
        var w2 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0, w2 &= 67108863, lo = Math.imul(al3, bl0), mid = Math.imul(al3, bh0), mid = mid + Math.imul(ah3, bl0) | 0, hi = Math.imul(ah3, bh0), lo = lo + Math.imul(al2, bl1) | 0, mid = mid + Math.imul(al2, bh1) | 0, mid = mid + Math.imul(ah2, bl1) | 0, hi = hi + Math.imul(ah2, bh1) | 0, lo = lo + Math.imul(al1, bl2) | 0, mid = mid + Math.imul(al1, bh2) | 0, mid = mid + Math.imul(ah1, bl2) | 0, hi = hi + Math.imul(ah1, bh2) | 0, lo = lo + Math.imul(al0, bl3) | 0, mid = mid + Math.imul(al0, bh3) | 0, mid = mid + Math.imul(ah0, bl3) | 0, hi = hi + Math.imul(ah0, bh3) | 0;
        var w3 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0, w3 &= 67108863, lo = Math.imul(al4, bl0), mid = Math.imul(al4, bh0), mid = mid + Math.imul(ah4, bl0) | 0, hi = Math.imul(ah4, bh0), lo = lo + Math.imul(al3, bl1) | 0, mid = mid + Math.imul(al3, bh1) | 0, mid = mid + Math.imul(ah3, bl1) | 0, hi = hi + Math.imul(ah3, bh1) | 0, lo = lo + Math.imul(al2, bl2) | 0, mid = mid + Math.imul(al2, bh2) | 0, mid = mid + Math.imul(ah2, bl2) | 0, hi = hi + Math.imul(ah2, bh2) | 0, lo = lo + Math.imul(al1, bl3) | 0, mid = mid + Math.imul(al1, bh3) | 0, mid = mid + Math.imul(ah1, bl3) | 0, hi = hi + Math.imul(ah1, bh3) | 0, lo = lo + Math.imul(al0, bl4) | 0, mid = mid + Math.imul(al0, bh4) | 0, mid = mid + Math.imul(ah0, bl4) | 0, hi = hi + Math.imul(ah0, bh4) | 0;
        var w4 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0, w4 &= 67108863, lo = Math.imul(al5, bl0), mid = Math.imul(al5, bh0), mid = mid + Math.imul(ah5, bl0) | 0, hi = Math.imul(ah5, bh0), lo = lo + Math.imul(al4, bl1) | 0, mid = mid + Math.imul(al4, bh1) | 0, mid = mid + Math.imul(ah4, bl1) | 0, hi = hi + Math.imul(ah4, bh1) | 0, lo = lo + Math.imul(al3, bl2) | 0, mid = mid + Math.imul(al3, bh2) | 0, mid = mid + Math.imul(ah3, bl2) | 0, hi = hi + Math.imul(ah3, bh2) | 0, lo = lo + Math.imul(al2, bl3) | 0, mid = mid + Math.imul(al2, bh3) | 0, mid = mid + Math.imul(ah2, bl3) | 0, hi = hi + Math.imul(ah2, bh3) | 0, lo = lo + Math.imul(al1, bl4) | 0, mid = mid + Math.imul(al1, bh4) | 0, mid = mid + Math.imul(ah1, bl4) | 0, hi = hi + Math.imul(ah1, bh4) | 0, lo = lo + Math.imul(al0, bl5) | 0, mid = mid + Math.imul(al0, bh5) | 0, mid = mid + Math.imul(ah0, bl5) | 0, hi = hi + Math.imul(ah0, bh5) | 0;
        var w5 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0, w5 &= 67108863, lo = Math.imul(al6, bl0), mid = Math.imul(al6, bh0), mid = mid + Math.imul(ah6, bl0) | 0, hi = Math.imul(ah6, bh0), lo = lo + Math.imul(al5, bl1) | 0, mid = mid + Math.imul(al5, bh1) | 0, mid = mid + Math.imul(ah5, bl1) | 0, hi = hi + Math.imul(ah5, bh1) | 0, lo = lo + Math.imul(al4, bl2) | 0, mid = mid + Math.imul(al4, bh2) | 0, mid = mid + Math.imul(ah4, bl2) | 0, hi = hi + Math.imul(ah4, bh2) | 0, lo = lo + Math.imul(al3, bl3) | 0, mid = mid + Math.imul(al3, bh3) | 0, mid = mid + Math.imul(ah3, bl3) | 0, hi = hi + Math.imul(ah3, bh3) | 0, lo = lo + Math.imul(al2, bl4) | 0, mid = mid + Math.imul(al2, bh4) | 0, mid = mid + Math.imul(ah2, bl4) | 0, hi = hi + Math.imul(ah2, bh4) | 0, lo = lo + Math.imul(al1, bl5) | 0, mid = mid + Math.imul(al1, bh5) | 0, mid = mid + Math.imul(ah1, bl5) | 0, hi = hi + Math.imul(ah1, bh5) | 0, lo = lo + Math.imul(al0, bl6) | 0, mid = mid + Math.imul(al0, bh6) | 0, mid = mid + Math.imul(ah0, bl6) | 0, hi = hi + Math.imul(ah0, bh6) | 0;
        var w6 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0, w6 &= 67108863, lo = Math.imul(al7, bl0), mid = Math.imul(al7, bh0), mid = mid + Math.imul(ah7, bl0) | 0, hi = Math.imul(ah7, bh0), lo = lo + Math.imul(al6, bl1) | 0, mid = mid + Math.imul(al6, bh1) | 0, mid = mid + Math.imul(ah6, bl1) | 0, hi = hi + Math.imul(ah6, bh1) | 0, lo = lo + Math.imul(al5, bl2) | 0, mid = mid + Math.imul(al5, bh2) | 0, mid = mid + Math.imul(ah5, bl2) | 0, hi = hi + Math.imul(ah5, bh2) | 0, lo = lo + Math.imul(al4, bl3) | 0, mid = mid + Math.imul(al4, bh3) | 0, mid = mid + Math.imul(ah4, bl3) | 0, hi = hi + Math.imul(ah4, bh3) | 0, lo = lo + Math.imul(al3, bl4) | 0, mid = mid + Math.imul(al3, bh4) | 0, mid = mid + Math.imul(ah3, bl4) | 0, hi = hi + Math.imul(ah3, bh4) | 0, lo = lo + Math.imul(al2, bl5) | 0, mid = mid + Math.imul(al2, bh5) | 0, mid = mid + Math.imul(ah2, bl5) | 0, hi = hi + Math.imul(ah2, bh5) | 0, lo = lo + Math.imul(al1, bl6) | 0, mid = mid + Math.imul(al1, bh6) | 0, mid = mid + Math.imul(ah1, bl6) | 0, hi = hi + Math.imul(ah1, bh6) | 0, lo = lo + Math.imul(al0, bl7) | 0, mid = mid + Math.imul(al0, bh7) | 0, mid = mid + Math.imul(ah0, bl7) | 0, hi = hi + Math.imul(ah0, bh7) | 0;
        var w7 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0, w7 &= 67108863, lo = Math.imul(al8, bl0), mid = Math.imul(al8, bh0), mid = mid + Math.imul(ah8, bl0) | 0, hi = Math.imul(ah8, bh0), lo = lo + Math.imul(al7, bl1) | 0, mid = mid + Math.imul(al7, bh1) | 0, mid = mid + Math.imul(ah7, bl1) | 0, hi = hi + Math.imul(ah7, bh1) | 0, lo = lo + Math.imul(al6, bl2) | 0, mid = mid + Math.imul(al6, bh2) | 0, mid = mid + Math.imul(ah6, bl2) | 0, hi = hi + Math.imul(ah6, bh2) | 0, lo = lo + Math.imul(al5, bl3) | 0, mid = mid + Math.imul(al5, bh3) | 0, mid = mid + Math.imul(ah5, bl3) | 0, hi = hi + Math.imul(ah5, bh3) | 0, lo = lo + Math.imul(al4, bl4) | 0, mid = mid + Math.imul(al4, bh4) | 0, mid = mid + Math.imul(ah4, bl4) | 0, hi = hi + Math.imul(ah4, bh4) | 0, lo = lo + Math.imul(al3, bl5) | 0, mid = mid + Math.imul(al3, bh5) | 0, mid = mid + Math.imul(ah3, bl5) | 0, hi = hi + Math.imul(ah3, bh5) | 0, lo = lo + Math.imul(al2, bl6) | 0, mid = mid + Math.imul(al2, bh6) | 0, mid = mid + Math.imul(ah2, bl6) | 0, hi = hi + Math.imul(ah2, bh6) | 0, lo = lo + Math.imul(al1, bl7) | 0, mid = mid + Math.imul(al1, bh7) | 0, mid = mid + Math.imul(ah1, bl7) | 0, hi = hi + Math.imul(ah1, bh7) | 0, lo = lo + Math.imul(al0, bl8) | 0, mid = mid + Math.imul(al0, bh8) | 0, mid = mid + Math.imul(ah0, bl8) | 0, hi = hi + Math.imul(ah0, bh8) | 0;
        var w8 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0, w8 &= 67108863, lo = Math.imul(al9, bl0), mid = Math.imul(al9, bh0), mid = mid + Math.imul(ah9, bl0) | 0, hi = Math.imul(ah9, bh0), lo = lo + Math.imul(al8, bl1) | 0, mid = mid + Math.imul(al8, bh1) | 0, mid = mid + Math.imul(ah8, bl1) | 0, hi = hi + Math.imul(ah8, bh1) | 0, lo = lo + Math.imul(al7, bl2) | 0, mid = mid + Math.imul(al7, bh2) | 0, mid = mid + Math.imul(ah7, bl2) | 0, hi = hi + Math.imul(ah7, bh2) | 0, lo = lo + Math.imul(al6, bl3) | 0, mid = mid + Math.imul(al6, bh3) | 0, mid = mid + Math.imul(ah6, bl3) | 0, hi = hi + Math.imul(ah6, bh3) | 0, lo = lo + Math.imul(al5, bl4) | 0, mid = mid + Math.imul(al5, bh4) | 0, mid = mid + Math.imul(ah5, bl4) | 0, hi = hi + Math.imul(ah5, bh4) | 0, lo = lo + Math.imul(al4, bl5) | 0, mid = mid + Math.imul(al4, bh5) | 0, mid = mid + Math.imul(ah4, bl5) | 0, hi = hi + Math.imul(ah4, bh5) | 0, lo = lo + Math.imul(al3, bl6) | 0, mid = mid + Math.imul(al3, bh6) | 0, mid = mid + Math.imul(ah3, bl6) | 0, hi = hi + Math.imul(ah3, bh6) | 0, lo = lo + Math.imul(al2, bl7) | 0, mid = mid + Math.imul(al2, bh7) | 0, mid = mid + Math.imul(ah2, bl7) | 0, hi = hi + Math.imul(ah2, bh7) | 0, lo = lo + Math.imul(al1, bl8) | 0, mid = mid + Math.imul(al1, bh8) | 0, mid = mid + Math.imul(ah1, bl8) | 0, hi = hi + Math.imul(ah1, bh8) | 0, lo = lo + Math.imul(al0, bl9) | 0, mid = mid + Math.imul(al0, bh9) | 0, mid = mid + Math.imul(ah0, bl9) | 0, hi = hi + Math.imul(ah0, bh9) | 0;
        var w9 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0, w9 &= 67108863, lo = Math.imul(al9, bl1), mid = Math.imul(al9, bh1), mid = mid + Math.imul(ah9, bl1) | 0, hi = Math.imul(ah9, bh1), lo = lo + Math.imul(al8, bl2) | 0, mid = mid + Math.imul(al8, bh2) | 0, mid = mid + Math.imul(ah8, bl2) | 0, hi = hi + Math.imul(ah8, bh2) | 0, lo = lo + Math.imul(al7, bl3) | 0, mid = mid + Math.imul(al7, bh3) | 0, mid = mid + Math.imul(ah7, bl3) | 0, hi = hi + Math.imul(ah7, bh3) | 0, lo = lo + Math.imul(al6, bl4) | 0, mid = mid + Math.imul(al6, bh4) | 0, mid = mid + Math.imul(ah6, bl4) | 0, hi = hi + Math.imul(ah6, bh4) | 0, lo = lo + Math.imul(al5, bl5) | 0, mid = mid + Math.imul(al5, bh5) | 0, mid = mid + Math.imul(ah5, bl5) | 0, hi = hi + Math.imul(ah5, bh5) | 0, lo = lo + Math.imul(al4, bl6) | 0, mid = mid + Math.imul(al4, bh6) | 0, mid = mid + Math.imul(ah4, bl6) | 0, hi = hi + Math.imul(ah4, bh6) | 0, lo = lo + Math.imul(al3, bl7) | 0, mid = mid + Math.imul(al3, bh7) | 0, mid = mid + Math.imul(ah3, bl7) | 0, hi = hi + Math.imul(ah3, bh7) | 0, lo = lo + Math.imul(al2, bl8) | 0, mid = mid + Math.imul(al2, bh8) | 0, mid = mid + Math.imul(ah2, bl8) | 0, hi = hi + Math.imul(ah2, bh8) | 0, lo = lo + Math.imul(al1, bl9) | 0, mid = mid + Math.imul(al1, bh9) | 0, mid = mid + Math.imul(ah1, bl9) | 0, hi = hi + Math.imul(ah1, bh9) | 0;
        var w10 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0, w10 &= 67108863, lo = Math.imul(al9, bl2), mid = Math.imul(al9, bh2), mid = mid + Math.imul(ah9, bl2) | 0, hi = Math.imul(ah9, bh2), lo = lo + Math.imul(al8, bl3) | 0, mid = mid + Math.imul(al8, bh3) | 0, mid = mid + Math.imul(ah8, bl3) | 0, hi = hi + Math.imul(ah8, bh3) | 0, lo = lo + Math.imul(al7, bl4) | 0, mid = mid + Math.imul(al7, bh4) | 0, mid = mid + Math.imul(ah7, bl4) | 0, hi = hi + Math.imul(ah7, bh4) | 0, lo = lo + Math.imul(al6, bl5) | 0, mid = mid + Math.imul(al6, bh5) | 0, mid = mid + Math.imul(ah6, bl5) | 0, hi = hi + Math.imul(ah6, bh5) | 0, lo = lo + Math.imul(al5, bl6) | 0, mid = mid + Math.imul(al5, bh6) | 0, mid = mid + Math.imul(ah5, bl6) | 0, hi = hi + Math.imul(ah5, bh6) | 0, lo = lo + Math.imul(al4, bl7) | 0, mid = mid + Math.imul(al4, bh7) | 0, mid = mid + Math.imul(ah4, bl7) | 0, hi = hi + Math.imul(ah4, bh7) | 0, lo = lo + Math.imul(al3, bl8) | 0, mid = mid + Math.imul(al3, bh8) | 0, mid = mid + Math.imul(ah3, bl8) | 0, hi = hi + Math.imul(ah3, bh8) | 0, lo = lo + Math.imul(al2, bl9) | 0, mid = mid + Math.imul(al2, bh9) | 0, mid = mid + Math.imul(ah2, bl9) | 0, hi = hi + Math.imul(ah2, bh9) | 0;
        var w11 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0, w11 &= 67108863, lo = Math.imul(al9, bl3), mid = Math.imul(al9, bh3), mid = mid + Math.imul(ah9, bl3) | 0, hi = Math.imul(ah9, bh3), lo = lo + Math.imul(al8, bl4) | 0, mid = mid + Math.imul(al8, bh4) | 0, mid = mid + Math.imul(ah8, bl4) | 0, hi = hi + Math.imul(ah8, bh4) | 0, lo = lo + Math.imul(al7, bl5) | 0, mid = mid + Math.imul(al7, bh5) | 0, mid = mid + Math.imul(ah7, bl5) | 0, hi = hi + Math.imul(ah7, bh5) | 0, lo = lo + Math.imul(al6, bl6) | 0, mid = mid + Math.imul(al6, bh6) | 0, mid = mid + Math.imul(ah6, bl6) | 0, hi = hi + Math.imul(ah6, bh6) | 0, lo = lo + Math.imul(al5, bl7) | 0, mid = mid + Math.imul(al5, bh7) | 0, mid = mid + Math.imul(ah5, bl7) | 0, hi = hi + Math.imul(ah5, bh7) | 0, lo = lo + Math.imul(al4, bl8) | 0, mid = mid + Math.imul(al4, bh8) | 0, mid = mid + Math.imul(ah4, bl8) | 0, hi = hi + Math.imul(ah4, bh8) | 0, lo = lo + Math.imul(al3, bl9) | 0, mid = mid + Math.imul(al3, bh9) | 0, mid = mid + Math.imul(ah3, bl9) | 0, hi = hi + Math.imul(ah3, bh9) | 0;
        var w12 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0, w12 &= 67108863, lo = Math.imul(al9, bl4), mid = Math.imul(al9, bh4), mid = mid + Math.imul(ah9, bl4) | 0, hi = Math.imul(ah9, bh4), lo = lo + Math.imul(al8, bl5) | 0, mid = mid + Math.imul(al8, bh5) | 0, mid = mid + Math.imul(ah8, bl5) | 0, hi = hi + Math.imul(ah8, bh5) | 0, lo = lo + Math.imul(al7, bl6) | 0, mid = mid + Math.imul(al7, bh6) | 0, mid = mid + Math.imul(ah7, bl6) | 0, hi = hi + Math.imul(ah7, bh6) | 0, lo = lo + Math.imul(al6, bl7) | 0, mid = mid + Math.imul(al6, bh7) | 0, mid = mid + Math.imul(ah6, bl7) | 0, hi = hi + Math.imul(ah6, bh7) | 0, lo = lo + Math.imul(al5, bl8) | 0, mid = mid + Math.imul(al5, bh8) | 0, mid = mid + Math.imul(ah5, bl8) | 0, hi = hi + Math.imul(ah5, bh8) | 0, lo = lo + Math.imul(al4, bl9) | 0, mid = mid + Math.imul(al4, bh9) | 0, mid = mid + Math.imul(ah4, bl9) | 0, hi = hi + Math.imul(ah4, bh9) | 0;
        var w13 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0, w13 &= 67108863, lo = Math.imul(al9, bl5), mid = Math.imul(al9, bh5), mid = mid + Math.imul(ah9, bl5) | 0, hi = Math.imul(ah9, bh5), lo = lo + Math.imul(al8, bl6) | 0, mid = mid + Math.imul(al8, bh6) | 0, mid = mid + Math.imul(ah8, bl6) | 0, hi = hi + Math.imul(ah8, bh6) | 0, lo = lo + Math.imul(al7, bl7) | 0, mid = mid + Math.imul(al7, bh7) | 0, mid = mid + Math.imul(ah7, bl7) | 0, hi = hi + Math.imul(ah7, bh7) | 0, lo = lo + Math.imul(al6, bl8) | 0, mid = mid + Math.imul(al6, bh8) | 0, mid = mid + Math.imul(ah6, bl8) | 0, hi = hi + Math.imul(ah6, bh8) | 0, lo = lo + Math.imul(al5, bl9) | 0, mid = mid + Math.imul(al5, bh9) | 0, mid = mid + Math.imul(ah5, bl9) | 0, hi = hi + Math.imul(ah5, bh9) | 0;
        var w14 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0, w14 &= 67108863, lo = Math.imul(al9, bl6), mid = Math.imul(al9, bh6), mid = mid + Math.imul(ah9, bl6) | 0, hi = Math.imul(ah9, bh6), lo = lo + Math.imul(al8, bl7) | 0, mid = mid + Math.imul(al8, bh7) | 0, mid = mid + Math.imul(ah8, bl7) | 0, hi = hi + Math.imul(ah8, bh7) | 0, lo = lo + Math.imul(al7, bl8) | 0, mid = mid + Math.imul(al7, bh8) | 0, mid = mid + Math.imul(ah7, bl8) | 0, hi = hi + Math.imul(ah7, bh8) | 0, lo = lo + Math.imul(al6, bl9) | 0, mid = mid + Math.imul(al6, bh9) | 0, mid = mid + Math.imul(ah6, bl9) | 0, hi = hi + Math.imul(ah6, bh9) | 0;
        var w15 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0, w15 &= 67108863, lo = Math.imul(al9, bl7), mid = Math.imul(al9, bh7), mid = mid + Math.imul(ah9, bl7) | 0, hi = Math.imul(ah9, bh7), lo = lo + Math.imul(al8, bl8) | 0, mid = mid + Math.imul(al8, bh8) | 0, mid = mid + Math.imul(ah8, bl8) | 0, hi = hi + Math.imul(ah8, bh8) | 0, lo = lo + Math.imul(al7, bl9) | 0, mid = mid + Math.imul(al7, bh9) | 0, mid = mid + Math.imul(ah7, bl9) | 0, hi = hi + Math.imul(ah7, bh9) | 0;
        var w16 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0, w16 &= 67108863, lo = Math.imul(al9, bl8), mid = Math.imul(al9, bh8), mid = mid + Math.imul(ah9, bl8) | 0, hi = Math.imul(ah9, bh8), lo = lo + Math.imul(al8, bl9) | 0, mid = mid + Math.imul(al8, bh9) | 0, mid = mid + Math.imul(ah8, bl9) | 0, hi = hi + Math.imul(ah8, bh9) | 0;
        var w17 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0, w17 &= 67108863, lo = Math.imul(al9, bl9), mid = Math.imul(al9, bh9), mid = mid + Math.imul(ah9, bl9) | 0, hi = Math.imul(ah9, bh9);
        var w18 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        if (c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0, w18 &= 67108863, o[0] = w0, o[1] = w1, o[2] = w2, o[3] = w3, o[4] = w4, o[5] = w5, o[6] = w6, o[7] = w7, o[8] = w8, o[9] = w9, o[10] = w10, o[11] = w11, o[12] = w12, o[13] = w13, o[14] = w14, o[15] = w15, o[16] = w16, o[17] = w17, o[18] = w18, c !== 0)
          o[19] = c, out.length++;
        return out;
      };
      if (!Math.imul)
        comb10MulTo = smallMulTo;
      function bigMulTo(self2, num, out) {
        out.negative = num.negative ^ self2.negative, out.length = self2.length + num.length;
        var carry = 0, hncarry = 0;
        for (var k = 0;k < out.length - 1; k++) {
          var ncarry = hncarry;
          hncarry = 0;
          var rword = carry & 67108863, maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self2.length + 1);j <= maxJ; j++) {
            var i2 = k - j, a = self2.words[i2] | 0, b = num.words[j] | 0, r = a * b, lo = r & 67108863;
            ncarry = ncarry + (r / 67108864 | 0) | 0, lo = lo + rword | 0, rword = lo & 67108863, ncarry = ncarry + (lo >>> 26) | 0, hncarry += ncarry >>> 26, ncarry &= 67108863;
          }
          out.words[k] = rword, carry = ncarry, ncarry = hncarry;
        }
        if (carry !== 0)
          out.words[k] = carry;
        else
          out.length--;
        return out.strip();
      }
      function jumboMulTo(self2, num, out) {
        var fftm = new FFTM;
        return fftm.mulp(self2, num, out);
      }
      BN.prototype.mulTo = function mulTo(num, out) {
        var res, len2 = this.length + num.length;
        if (this.length === 10 && num.length === 10)
          res = comb10MulTo(this, num, out);
        else if (len2 < 63)
          res = smallMulTo(this, num, out);
        else if (len2 < 1024)
          res = bigMulTo(this, num, out);
        else
          res = jumboMulTo(this, num, out);
        return res;
      };
      function FFTM(x, y) {
        this.x = x, this.y = y;
      }
      FFTM.prototype.makeRBT = function makeRBT(N) {
        var t = new Array(N), l = BN.prototype._countBits(N) - 1;
        for (var i2 = 0;i2 < N; i2++)
          t[i2] = this.revBin(i2, l, N);
        return t;
      }, FFTM.prototype.revBin = function revBin(x, l, N) {
        if (x === 0 || x === N - 1)
          return x;
        var rb = 0;
        for (var i2 = 0;i2 < l; i2++)
          rb |= (x & 1) << l - i2 - 1, x >>= 1;
        return rb;
      }, FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
        for (var i2 = 0;i2 < N; i2++)
          rtws[i2] = rws[rbt[i2]], itws[i2] = iws[rbt[i2]];
      }, FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
        this.permute(rbt, rws, iws, rtws, itws, N);
        for (var s = 1;s < N; s <<= 1) {
          var l = s << 1, rtwdf = Math.cos(2 * Math.PI / l), itwdf = Math.sin(2 * Math.PI / l);
          for (var p = 0;p < N; p += l) {
            var rtwdf_ = rtwdf, itwdf_ = itwdf;
            for (var j = 0;j < s; j++) {
              var re = rtws[p + j], ie = itws[p + j], ro = rtws[p + j + s], io = itws[p + j + s], rx = rtwdf_ * ro - itwdf_ * io;
              if (io = rtwdf_ * io + itwdf_ * ro, ro = rx, rtws[p + j] = re + ro, itws[p + j] = ie + io, rtws[p + j + s] = re - ro, itws[p + j + s] = ie - io, j !== l)
                rx = rtwdf * rtwdf_ - itwdf * itwdf_, itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_, rtwdf_ = rx;
            }
          }
        }
      }, FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
        var N = Math.max(m, n) | 1, odd = N & 1, i2 = 0;
        for (N = N / 2 | 0;N; N = N >>> 1)
          i2++;
        return 1 << i2 + 1 + odd;
      }, FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
        if (N <= 1)
          return;
        for (var i2 = 0;i2 < N / 2; i2++) {
          var t = rws[i2];
          rws[i2] = rws[N - i2 - 1], rws[N - i2 - 1] = t, t = iws[i2], iws[i2] = -iws[N - i2 - 1], iws[N - i2 - 1] = -t;
        }
      }, FFTM.prototype.normalize13b = function normalize13b(ws, N) {
        var carry = 0;
        for (var i2 = 0;i2 < N / 2; i2++) {
          var w = Math.round(ws[2 * i2 + 1] / N) * 8192 + Math.round(ws[2 * i2] / N) + carry;
          if (ws[i2] = w & 67108863, w < 67108864)
            carry = 0;
          else
            carry = w / 67108864 | 0;
        }
        return ws;
      }, FFTM.prototype.convert13b = function convert13b(ws, len2, rws, N) {
        var carry = 0;
        for (var i2 = 0;i2 < len2; i2++)
          carry = carry + (ws[i2] | 0), rws[2 * i2] = carry & 8191, carry = carry >>> 13, rws[2 * i2 + 1] = carry & 8191, carry = carry >>> 13;
        for (i2 = 2 * len2;i2 < N; ++i2)
          rws[i2] = 0;
        assert(carry === 0), assert((carry & -8192) === 0);
      }, FFTM.prototype.stub = function stub(N) {
        var ph = new Array(N);
        for (var i2 = 0;i2 < N; i2++)
          ph[i2] = 0;
        return ph;
      }, FFTM.prototype.mulp = function mulp(x, y, out) {
        var N = 2 * this.guessLen13b(x.length, y.length), rbt = this.makeRBT(N), _ = this.stub(N), rws = new Array(N), rwst = new Array(N), iwst = new Array(N), nrws = new Array(N), nrwst = new Array(N), niwst = new Array(N), rmws = out.words;
        rmws.length = N, this.convert13b(x.words, x.length, rws, N), this.convert13b(y.words, y.length, nrws, N), this.transform(rws, _, rwst, iwst, N, rbt), this.transform(nrws, _, nrwst, niwst, N, rbt);
        for (var i2 = 0;i2 < N; i2++) {
          var rx = rwst[i2] * nrwst[i2] - iwst[i2] * niwst[i2];
          iwst[i2] = rwst[i2] * niwst[i2] + iwst[i2] * nrwst[i2], rwst[i2] = rx;
        }
        return this.conjugate(rwst, iwst, N), this.transform(rwst, iwst, rmws, _, N, rbt), this.conjugate(rmws, _, N), this.normalize13b(rmws, N), out.negative = x.negative ^ y.negative, out.length = x.length + y.length, out.strip();
      }, BN.prototype.mul = function mul(num) {
        var out = new BN(null);
        return out.words = new Array(this.length + num.length), this.mulTo(num, out);
      }, BN.prototype.mulf = function mulf(num) {
        var out = new BN(null);
        return out.words = new Array(this.length + num.length), jumboMulTo(this, num, out);
      }, BN.prototype.imul = function imul(num) {
        return this.clone().mulTo(num, this);
      }, BN.prototype.imuln = function imuln(num) {
        assert(typeof num === "number"), assert(num < 67108864);
        var carry = 0;
        for (var i2 = 0;i2 < this.length; i2++) {
          var w = (this.words[i2] | 0) * num, lo = (w & 67108863) + (carry & 67108863);
          carry >>= 26, carry += w / 67108864 | 0, carry += lo >>> 26, this.words[i2] = lo & 67108863;
        }
        if (carry !== 0)
          this.words[i2] = carry, this.length++;
        return this.length = num === 0 ? 1 : this.length, this;
      }, BN.prototype.muln = function muln(num) {
        return this.clone().imuln(num);
      }, BN.prototype.sqr = function sqr() {
        return this.mul(this);
      }, BN.prototype.isqr = function isqr() {
        return this.imul(this.clone());
      }, BN.prototype.pow = function pow(num) {
        var w = toBitArray(num);
        if (w.length === 0)
          return new BN(1);
        var res = this;
        for (var i2 = 0;i2 < w.length; i2++, res = res.sqr())
          if (w[i2] !== 0)
            break;
        if (++i2 < w.length)
          for (var q = res.sqr();i2 < w.length; i2++, q = q.sqr()) {
            if (w[i2] === 0)
              continue;
            res = res.mul(q);
          }
        return res;
      }, BN.prototype.iushln = function iushln(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26, s = (bits - r) / 26, carryMask = 67108863 >>> 26 - r << 26 - r, i2;
        if (r !== 0) {
          var carry = 0;
          for (i2 = 0;i2 < this.length; i2++) {
            var newCarry = this.words[i2] & carryMask, c = (this.words[i2] | 0) - newCarry << r;
            this.words[i2] = c | carry, carry = newCarry >>> 26 - r;
          }
          if (carry)
            this.words[i2] = carry, this.length++;
        }
        if (s !== 0) {
          for (i2 = this.length - 1;i2 >= 0; i2--)
            this.words[i2 + s] = this.words[i2];
          for (i2 = 0;i2 < s; i2++)
            this.words[i2] = 0;
          this.length += s;
        }
        return this.strip();
      }, BN.prototype.ishln = function ishln(bits) {
        return assert(this.negative === 0), this.iushln(bits);
      }, BN.prototype.iushrn = function iushrn(bits, hint, extended) {
        assert(typeof bits === "number" && bits >= 0);
        var h;
        if (hint)
          h = (hint - hint % 26) / 26;
        else
          h = 0;
        var r = bits % 26, s = Math.min((bits - r) / 26, this.length), mask = 67108863 ^ 67108863 >>> r << r, maskedWords = extended;
        if (h -= s, h = Math.max(0, h), maskedWords) {
          for (var i2 = 0;i2 < s; i2++)
            maskedWords.words[i2] = this.words[i2];
          maskedWords.length = s;
        }
        if (s === 0)
          ;
        else if (this.length > s) {
          this.length -= s;
          for (i2 = 0;i2 < this.length; i2++)
            this.words[i2] = this.words[i2 + s];
        } else
          this.words[0] = 0, this.length = 1;
        var carry = 0;
        for (i2 = this.length - 1;i2 >= 0 && (carry !== 0 || i2 >= h); i2--) {
          var word = this.words[i2] | 0;
          this.words[i2] = carry << 26 - r | word >>> r, carry = word & mask;
        }
        if (maskedWords && carry !== 0)
          maskedWords.words[maskedWords.length++] = carry;
        if (this.length === 0)
          this.words[0] = 0, this.length = 1;
        return this.strip();
      }, BN.prototype.ishrn = function ishrn(bits, hint, extended) {
        return assert(this.negative === 0), this.iushrn(bits, hint, extended);
      }, BN.prototype.shln = function shln(bits) {
        return this.clone().ishln(bits);
      }, BN.prototype.ushln = function ushln(bits) {
        return this.clone().iushln(bits);
      }, BN.prototype.shrn = function shrn(bits) {
        return this.clone().ishrn(bits);
      }, BN.prototype.ushrn = function ushrn(bits) {
        return this.clone().iushrn(bits);
      }, BN.prototype.testn = function testn(bit) {
        assert(typeof bit === "number" && bit >= 0);
        var r = bit % 26, s = (bit - r) / 26, q = 1 << r;
        if (this.length <= s)
          return false;
        var w = this.words[s];
        return !!(w & q);
      }, BN.prototype.imaskn = function imaskn(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26, s = (bits - r) / 26;
        if (assert(this.negative === 0, "imaskn works only with positive numbers"), this.length <= s)
          return this;
        if (r !== 0)
          s++;
        if (this.length = Math.min(s, this.length), r !== 0) {
          var mask = 67108863 ^ 67108863 >>> r << r;
          this.words[this.length - 1] &= mask;
        }
        return this.strip();
      }, BN.prototype.maskn = function maskn(bits) {
        return this.clone().imaskn(bits);
      }, BN.prototype.iaddn = function iaddn(num) {
        if (assert(typeof num === "number"), assert(num < 67108864), num < 0)
          return this.isubn(-num);
        if (this.negative !== 0) {
          if (this.length === 1 && (this.words[0] | 0) < num)
            return this.words[0] = num - (this.words[0] | 0), this.negative = 0, this;
          return this.negative = 0, this.isubn(num), this.negative = 1, this;
        }
        return this._iaddn(num);
      }, BN.prototype._iaddn = function _iaddn(num) {
        this.words[0] += num;
        for (var i2 = 0;i2 < this.length && this.words[i2] >= 67108864; i2++)
          if (this.words[i2] -= 67108864, i2 === this.length - 1)
            this.words[i2 + 1] = 1;
          else
            this.words[i2 + 1]++;
        return this.length = Math.max(this.length, i2 + 1), this;
      }, BN.prototype.isubn = function isubn(num) {
        if (assert(typeof num === "number"), assert(num < 67108864), num < 0)
          return this.iaddn(-num);
        if (this.negative !== 0)
          return this.negative = 0, this.iaddn(num), this.negative = 1, this;
        if (this.words[0] -= num, this.length === 1 && this.words[0] < 0)
          this.words[0] = -this.words[0], this.negative = 1;
        else
          for (var i2 = 0;i2 < this.length && this.words[i2] < 0; i2++)
            this.words[i2] += 67108864, this.words[i2 + 1] -= 1;
        return this.strip();
      }, BN.prototype.addn = function addn(num) {
        return this.clone().iaddn(num);
      }, BN.prototype.subn = function subn(num) {
        return this.clone().isubn(num);
      }, BN.prototype.iabs = function iabs() {
        return this.negative = 0, this;
      }, BN.prototype.abs = function abs() {
        return this.clone().iabs();
      }, BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
        var len2 = num.length + shift, i2;
        this._expand(len2);
        var w, carry = 0;
        for (i2 = 0;i2 < num.length; i2++) {
          w = (this.words[i2 + shift] | 0) + carry;
          var right = (num.words[i2] | 0) * mul;
          w -= right & 67108863, carry = (w >> 26) - (right / 67108864 | 0), this.words[i2 + shift] = w & 67108863;
        }
        for (;i2 < this.length - shift; i2++)
          w = (this.words[i2 + shift] | 0) + carry, carry = w >> 26, this.words[i2 + shift] = w & 67108863;
        if (carry === 0)
          return this.strip();
        assert(carry === -1), carry = 0;
        for (i2 = 0;i2 < this.length; i2++)
          w = -(this.words[i2] | 0) + carry, carry = w >> 26, this.words[i2] = w & 67108863;
        return this.negative = 1, this.strip();
      }, BN.prototype._wordDiv = function _wordDiv(num, mode) {
        var shift = this.length - num.length, a = this.clone(), b = num, bhi = b.words[b.length - 1] | 0, bhiBits = this._countBits(bhi);
        if (shift = 26 - bhiBits, shift !== 0)
          b = b.ushln(shift), a.iushln(shift), bhi = b.words[b.length - 1] | 0;
        var m = a.length - b.length, q;
        if (mode !== "mod") {
          q = new BN(null), q.length = m + 1, q.words = new Array(q.length);
          for (var i2 = 0;i2 < q.length; i2++)
            q.words[i2] = 0;
        }
        var diff = a.clone()._ishlnsubmul(b, 1, m);
        if (diff.negative === 0) {
          if (a = diff, q)
            q.words[m] = 1;
        }
        for (var j = m - 1;j >= 0; j--) {
          var qj = (a.words[b.length + j] | 0) * 67108864 + (a.words[b.length + j - 1] | 0);
          qj = Math.min(qj / bhi | 0, 67108863), a._ishlnsubmul(b, qj, j);
          while (a.negative !== 0)
            if (qj--, a.negative = 0, a._ishlnsubmul(b, 1, j), !a.isZero())
              a.negative ^= 1;
          if (q)
            q.words[j] = qj;
        }
        if (q)
          q.strip();
        if (a.strip(), mode !== "div" && shift !== 0)
          a.iushrn(shift);
        return { div: q || null, mod: a };
      }, BN.prototype.divmod = function divmod(num, mode, positive) {
        if (assert(!num.isZero()), this.isZero())
          return { div: new BN(0), mod: new BN(0) };
        var div, mod, res;
        if (this.negative !== 0 && num.negative === 0) {
          if (res = this.neg().divmod(num, mode), mode !== "mod")
            div = res.div.neg();
          if (mode !== "div") {
            if (mod = res.mod.neg(), positive && mod.negative !== 0)
              mod.iadd(num);
          }
          return { div, mod };
        }
        if (this.negative === 0 && num.negative !== 0) {
          if (res = this.divmod(num.neg(), mode), mode !== "mod")
            div = res.div.neg();
          return { div, mod: res.mod };
        }
        if ((this.negative & num.negative) !== 0) {
          if (res = this.neg().divmod(num.neg(), mode), mode !== "div") {
            if (mod = res.mod.neg(), positive && mod.negative !== 0)
              mod.isub(num);
          }
          return { div: res.div, mod };
        }
        if (num.length > this.length || this.cmp(num) < 0)
          return { div: new BN(0), mod: this };
        if (num.length === 1) {
          if (mode === "div")
            return { div: this.divn(num.words[0]), mod: null };
          if (mode === "mod")
            return { div: null, mod: new BN(this.modn(num.words[0])) };
          return { div: this.divn(num.words[0]), mod: new BN(this.modn(num.words[0])) };
        }
        return this._wordDiv(num, mode);
      }, BN.prototype.div = function div(num) {
        return this.divmod(num, "div", false).div;
      }, BN.prototype.mod = function mod(num) {
        return this.divmod(num, "mod", false).mod;
      }, BN.prototype.umod = function umod(num) {
        return this.divmod(num, "mod", true).mod;
      }, BN.prototype.divRound = function divRound(num) {
        var dm = this.divmod(num);
        if (dm.mod.isZero())
          return dm.div;
        var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod, half = num.ushrn(1), r2 = num.andln(1), cmp = mod.cmp(half);
        if (cmp < 0 || r2 === 1 && cmp === 0)
          return dm.div;
        return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
      }, BN.prototype.modn = function modn(num) {
        assert(num <= 67108863);
        var p = 67108864 % num, acc = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--)
          acc = (p * acc + (this.words[i2] | 0)) % num;
        return acc;
      }, BN.prototype.idivn = function idivn(num) {
        assert(num <= 67108863);
        var carry = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          var w = (this.words[i2] | 0) + carry * 67108864;
          this.words[i2] = w / num | 0, carry = w % num;
        }
        return this.strip();
      }, BN.prototype.divn = function divn(num) {
        return this.clone().idivn(num);
      }, BN.prototype.egcd = function egcd(p) {
        assert(p.negative === 0), assert(!p.isZero());
        var x = this, y = p.clone();
        if (x.negative !== 0)
          x = x.umod(p);
        else
          x = x.clone();
        var A = new BN(1), B = new BN(0), C = new BN(0), D = new BN(1), g = 0;
        while (x.isEven() && y.isEven())
          x.iushrn(1), y.iushrn(1), ++g;
        var yp = y.clone(), xp = x.clone();
        while (!x.isZero()) {
          for (var i2 = 0, im = 1;(x.words[0] & im) === 0 && i2 < 26; ++i2, im <<= 1)
            ;
          if (i2 > 0) {
            x.iushrn(i2);
            while (i2-- > 0) {
              if (A.isOdd() || B.isOdd())
                A.iadd(yp), B.isub(xp);
              A.iushrn(1), B.iushrn(1);
            }
          }
          for (var j = 0, jm = 1;(y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
            ;
          if (j > 0) {
            y.iushrn(j);
            while (j-- > 0) {
              if (C.isOdd() || D.isOdd())
                C.iadd(yp), D.isub(xp);
              C.iushrn(1), D.iushrn(1);
            }
          }
          if (x.cmp(y) >= 0)
            x.isub(y), A.isub(C), B.isub(D);
          else
            y.isub(x), C.isub(A), D.isub(B);
        }
        return { a: C, b: D, gcd: y.iushln(g) };
      }, BN.prototype._invmp = function _invmp(p) {
        assert(p.negative === 0), assert(!p.isZero());
        var a = this, b = p.clone();
        if (a.negative !== 0)
          a = a.umod(p);
        else
          a = a.clone();
        var x1 = new BN(1), x2 = new BN(0), delta = b.clone();
        while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
          for (var i2 = 0, im = 1;(a.words[0] & im) === 0 && i2 < 26; ++i2, im <<= 1)
            ;
          if (i2 > 0) {
            a.iushrn(i2);
            while (i2-- > 0) {
              if (x1.isOdd())
                x1.iadd(delta);
              x1.iushrn(1);
            }
          }
          for (var j = 0, jm = 1;(b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
            ;
          if (j > 0) {
            b.iushrn(j);
            while (j-- > 0) {
              if (x2.isOdd())
                x2.iadd(delta);
              x2.iushrn(1);
            }
          }
          if (a.cmp(b) >= 0)
            a.isub(b), x1.isub(x2);
          else
            b.isub(a), x2.isub(x1);
        }
        var res;
        if (a.cmpn(1) === 0)
          res = x1;
        else
          res = x2;
        if (res.cmpn(0) < 0)
          res.iadd(p);
        return res;
      }, BN.prototype.gcd = function gcd(num) {
        if (this.isZero())
          return num.abs();
        if (num.isZero())
          return this.abs();
        var a = this.clone(), b = num.clone();
        a.negative = 0, b.negative = 0;
        for (var shift = 0;a.isEven() && b.isEven(); shift++)
          a.iushrn(1), b.iushrn(1);
        do {
          while (a.isEven())
            a.iushrn(1);
          while (b.isEven())
            b.iushrn(1);
          var r = a.cmp(b);
          if (r < 0) {
            var t = a;
            a = b, b = t;
          } else if (r === 0 || b.cmpn(1) === 0)
            break;
          a.isub(b);
        } while (true);
        return b.iushln(shift);
      }, BN.prototype.invm = function invm(num) {
        return this.egcd(num).a.umod(num);
      }, BN.prototype.isEven = function isEven() {
        return (this.words[0] & 1) === 0;
      }, BN.prototype.isOdd = function isOdd() {
        return (this.words[0] & 1) === 1;
      }, BN.prototype.andln = function andln(num) {
        return this.words[0] & num;
      }, BN.prototype.bincn = function bincn(bit) {
        assert(typeof bit === "number");
        var r = bit % 26, s = (bit - r) / 26, q = 1 << r;
        if (this.length <= s)
          return this._expand(s + 1), this.words[s] |= q, this;
        var carry = q;
        for (var i2 = s;carry !== 0 && i2 < this.length; i2++) {
          var w = this.words[i2] | 0;
          w += carry, carry = w >>> 26, w &= 67108863, this.words[i2] = w;
        }
        if (carry !== 0)
          this.words[i2] = carry, this.length++;
        return this;
      }, BN.prototype.isZero = function isZero() {
        return this.length === 1 && this.words[0] === 0;
      }, BN.prototype.cmpn = function cmpn(num) {
        var negative = num < 0;
        if (this.negative !== 0 && !negative)
          return -1;
        if (this.negative === 0 && negative)
          return 1;
        this.strip();
        var res;
        if (this.length > 1)
          res = 1;
        else {
          if (negative)
            num = -num;
          assert(num <= 67108863, "Number is too big");
          var w = this.words[0] | 0;
          res = w === num ? 0 : w < num ? -1 : 1;
        }
        if (this.negative !== 0)
          return -res | 0;
        return res;
      }, BN.prototype.cmp = function cmp(num) {
        if (this.negative !== 0 && num.negative === 0)
          return -1;
        if (this.negative === 0 && num.negative !== 0)
          return 1;
        var res = this.ucmp(num);
        if (this.negative !== 0)
          return -res | 0;
        return res;
      }, BN.prototype.ucmp = function ucmp(num) {
        if (this.length > num.length)
          return 1;
        if (this.length < num.length)
          return -1;
        var res = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          var a = this.words[i2] | 0, b = num.words[i2] | 0;
          if (a === b)
            continue;
          if (a < b)
            res = -1;
          else if (a > b)
            res = 1;
          break;
        }
        return res;
      }, BN.prototype.gtn = function gtn(num) {
        return this.cmpn(num) === 1;
      }, BN.prototype.gt = function gt(num) {
        return this.cmp(num) === 1;
      }, BN.prototype.gten = function gten(num) {
        return this.cmpn(num) >= 0;
      }, BN.prototype.gte = function gte(num) {
        return this.cmp(num) >= 0;
      }, BN.prototype.ltn = function ltn(num) {
        return this.cmpn(num) === -1;
      }, BN.prototype.lt = function lt(num) {
        return this.cmp(num) === -1;
      }, BN.prototype.lten = function lten(num) {
        return this.cmpn(num) <= 0;
      }, BN.prototype.lte = function lte(num) {
        return this.cmp(num) <= 0;
      }, BN.prototype.eqn = function eqn(num) {
        return this.cmpn(num) === 0;
      }, BN.prototype.eq = function eq(num) {
        return this.cmp(num) === 0;
      }, BN.red = function red(num) {
        return new Red(num);
      }, BN.prototype.toRed = function toRed(ctx) {
        return assert(!this.red, "Already a number in reduction context"), assert(this.negative === 0, "red works only with positives"), ctx.convertTo(this)._forceRed(ctx);
      }, BN.prototype.fromRed = function fromRed() {
        return assert(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this);
      }, BN.prototype._forceRed = function _forceRed(ctx) {
        return this.red = ctx, this;
      }, BN.prototype.forceRed = function forceRed(ctx) {
        return assert(!this.red, "Already a number in reduction context"), this._forceRed(ctx);
      }, BN.prototype.redAdd = function redAdd(num) {
        return assert(this.red, "redAdd works only with red numbers"), this.red.add(this, num);
      }, BN.prototype.redIAdd = function redIAdd(num) {
        return assert(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, num);
      }, BN.prototype.redSub = function redSub(num) {
        return assert(this.red, "redSub works only with red numbers"), this.red.sub(this, num);
      }, BN.prototype.redISub = function redISub(num) {
        return assert(this.red, "redISub works only with red numbers"), this.red.isub(this, num);
      }, BN.prototype.redShl = function redShl(num) {
        return assert(this.red, "redShl works only with red numbers"), this.red.shl(this, num);
      }, BN.prototype.redMul = function redMul(num) {
        return assert(this.red, "redMul works only with red numbers"), this.red._verify2(this, num), this.red.mul(this, num);
      }, BN.prototype.redIMul = function redIMul(num) {
        return assert(this.red, "redMul works only with red numbers"), this.red._verify2(this, num), this.red.imul(this, num);
      }, BN.prototype.redSqr = function redSqr() {
        return assert(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this);
      }, BN.prototype.redISqr = function redISqr() {
        return assert(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this);
      }, BN.prototype.redSqrt = function redSqrt() {
        return assert(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this);
      }, BN.prototype.redInvm = function redInvm() {
        return assert(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this);
      }, BN.prototype.redNeg = function redNeg() {
        return assert(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this);
      }, BN.prototype.redPow = function redPow(num) {
        return assert(this.red && !num.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, num);
      };
      var primes = { k256: null, p224: null, p192: null, p25519: null };
      function MPrime(name, p) {
        this.name = name, this.p = new BN(p, 16), this.n = this.p.bitLength(), this.k = new BN(1).iushln(this.n).isub(this.p), this.tmp = this._tmp();
      }
      MPrime.prototype._tmp = function _tmp() {
        var tmp = new BN(null);
        return tmp.words = new Array(Math.ceil(this.n / 13)), tmp;
      }, MPrime.prototype.ireduce = function ireduce(num) {
        var r = num, rlen;
        do
          this.split(r, this.tmp), r = this.imulK(r), r = r.iadd(this.tmp), rlen = r.bitLength();
        while (rlen > this.n);
        var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
        if (cmp === 0)
          r.words[0] = 0, r.length = 1;
        else if (cmp > 0)
          r.isub(this.p);
        else if (r.strip !== undefined)
          r.strip();
        else
          r._strip();
        return r;
      }, MPrime.prototype.split = function split(input, out) {
        input.iushrn(this.n, 0, out);
      }, MPrime.prototype.imulK = function imulK(num) {
        return num.imul(this.k);
      };
      function K256() {
        MPrime.call(this, "k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");
      }
      inherits2(K256, MPrime), K256.prototype.split = function split(input, output) {
        var mask = 4194303, outLen = Math.min(input.length, 9);
        for (var i2 = 0;i2 < outLen; i2++)
          output.words[i2] = input.words[i2];
        if (output.length = outLen, input.length <= 9) {
          input.words[0] = 0, input.length = 1;
          return;
        }
        var prev = input.words[9];
        output.words[output.length++] = prev & mask;
        for (i2 = 10;i2 < input.length; i2++) {
          var next = input.words[i2] | 0;
          input.words[i2 - 10] = (next & mask) << 4 | prev >>> 22, prev = next;
        }
        if (prev >>>= 22, input.words[i2 - 10] = prev, prev === 0 && input.length > 10)
          input.length -= 10;
        else
          input.length -= 9;
      }, K256.prototype.imulK = function imulK(num) {
        num.words[num.length] = 0, num.words[num.length + 1] = 0, num.length += 2;
        var lo = 0;
        for (var i2 = 0;i2 < num.length; i2++) {
          var w = num.words[i2] | 0;
          lo += w * 977, num.words[i2] = lo & 67108863, lo = w * 64 + (lo / 67108864 | 0);
        }
        if (num.words[num.length - 1] === 0) {
          if (num.length--, num.words[num.length - 1] === 0)
            num.length--;
        }
        return num;
      };
      function P224() {
        MPrime.call(this, "p224", "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001");
      }
      inherits2(P224, MPrime);
      function P192() {
        MPrime.call(this, "p192", "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff");
      }
      inherits2(P192, MPrime);
      function P25519() {
        MPrime.call(this, "25519", "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed");
      }
      inherits2(P25519, MPrime), P25519.prototype.imulK = function imulK(num) {
        var carry = 0;
        for (var i2 = 0;i2 < num.length; i2++) {
          var hi = (num.words[i2] | 0) * 19 + carry, lo = hi & 67108863;
          hi >>>= 26, num.words[i2] = lo, carry = hi;
        }
        if (carry !== 0)
          num.words[num.length++] = carry;
        return num;
      }, BN._prime = function prime(name) {
        if (primes[name])
          return primes[name];
        var prime;
        if (name === "k256")
          prime = new K256;
        else if (name === "p224")
          prime = new P224;
        else if (name === "p192")
          prime = new P192;
        else if (name === "p25519")
          prime = new P25519;
        else
          throw new Error("Unknown prime " + name);
        return primes[name] = prime, prime;
      };
      function Red(m) {
        if (typeof m === "string") {
          var prime = BN._prime(m);
          this.m = prime.p, this.prime = prime;
        } else
          assert(m.gtn(1), "modulus must be greater than 1"), this.m = m, this.prime = null;
      }
      Red.prototype._verify1 = function _verify1(a) {
        assert(a.negative === 0, "red works only with positives"), assert(a.red, "red works only with red numbers");
      }, Red.prototype._verify2 = function _verify2(a, b) {
        assert((a.negative | b.negative) === 0, "red works only with positives"), assert(a.red && a.red === b.red, "red works only with red numbers");
      }, Red.prototype.imod = function imod(a) {
        if (this.prime)
          return this.prime.ireduce(a)._forceRed(this);
        return a.umod(this.m)._forceRed(this);
      }, Red.prototype.neg = function neg(a) {
        if (a.isZero())
          return a.clone();
        return this.m.sub(a)._forceRed(this);
      }, Red.prototype.add = function add(a, b) {
        this._verify2(a, b);
        var res = a.add(b);
        if (res.cmp(this.m) >= 0)
          res.isub(this.m);
        return res._forceRed(this);
      }, Red.prototype.iadd = function iadd(a, b) {
        this._verify2(a, b);
        var res = a.iadd(b);
        if (res.cmp(this.m) >= 0)
          res.isub(this.m);
        return res;
      }, Red.prototype.sub = function sub(a, b) {
        this._verify2(a, b);
        var res = a.sub(b);
        if (res.cmpn(0) < 0)
          res.iadd(this.m);
        return res._forceRed(this);
      }, Red.prototype.isub = function isub(a, b) {
        this._verify2(a, b);
        var res = a.isub(b);
        if (res.cmpn(0) < 0)
          res.iadd(this.m);
        return res;
      }, Red.prototype.shl = function shl(a, num) {
        return this._verify1(a), this.imod(a.ushln(num));
      }, Red.prototype.imul = function imul(a, b) {
        return this._verify2(a, b), this.imod(a.imul(b));
      }, Red.prototype.mul = function mul(a, b) {
        return this._verify2(a, b), this.imod(a.mul(b));
      }, Red.prototype.isqr = function isqr(a) {
        return this.imul(a, a.clone());
      }, Red.prototype.sqr = function sqr(a) {
        return this.mul(a, a);
      }, Red.prototype.sqrt = function sqrt(a) {
        if (a.isZero())
          return a.clone();
        var mod3 = this.m.andln(3);
        if (assert(mod3 % 2 === 1), mod3 === 3) {
          var pow = this.m.add(new BN(1)).iushrn(2);
          return this.pow(a, pow);
        }
        var q = this.m.subn(1), s = 0;
        while (!q.isZero() && q.andln(1) === 0)
          s++, q.iushrn(1);
        assert(!q.isZero());
        var one = new BN(1).toRed(this), nOne = one.redNeg(), lpow = this.m.subn(1).iushrn(1), z = this.m.bitLength();
        z = new BN(2 * z * z).toRed(this);
        while (this.pow(z, lpow).cmp(nOne) !== 0)
          z.redIAdd(nOne);
        var c = this.pow(z, q), r = this.pow(a, q.addn(1).iushrn(1)), t = this.pow(a, q), m = s;
        while (t.cmp(one) !== 0) {
          var tmp = t;
          for (var i2 = 0;tmp.cmp(one) !== 0; i2++)
            tmp = tmp.redSqr();
          assert(i2 < m);
          var b = this.pow(c, new BN(1).iushln(m - i2 - 1));
          r = r.redMul(b), c = b.redSqr(), t = t.redMul(c), m = i2;
        }
        return r;
      }, Red.prototype.invm = function invm(a) {
        var inv = a._invmp(this.m);
        if (inv.negative !== 0)
          return inv.negative = 0, this.imod(inv).redNeg();
        else
          return this.imod(inv);
      }, Red.prototype.pow = function pow(a, num) {
        if (num.isZero())
          return new BN(1).toRed(this);
        if (num.cmpn(1) === 0)
          return a.clone();
        var windowSize = 4, wnd = new Array(1 << windowSize);
        wnd[0] = new BN(1).toRed(this), wnd[1] = a;
        for (var i2 = 2;i2 < wnd.length; i2++)
          wnd[i2] = this.mul(wnd[i2 - 1], a);
        var res = wnd[0], current = 0, currentLen = 0, start = num.bitLength() % 26;
        if (start === 0)
          start = 26;
        for (i2 = num.length - 1;i2 >= 0; i2--) {
          var word = num.words[i2];
          for (var j = start - 1;j >= 0; j--) {
            var bit = word >> j & 1;
            if (res !== wnd[0])
              res = this.sqr(res);
            if (bit === 0 && current === 0) {
              currentLen = 0;
              continue;
            }
            if (current <<= 1, current |= bit, currentLen++, currentLen !== windowSize && (i2 !== 0 || j !== 0))
              continue;
            res = this.mul(res, wnd[current]), currentLen = 0, current = 0;
          }
          start = 26;
        }
        return res;
      }, Red.prototype.convertTo = function convertTo(num) {
        var r = num.umod(this.m);
        return r === num ? r.clone() : r;
      }, Red.prototype.convertFrom = function convertFrom(num) {
        var res = num.clone();
        return res.red = null, res;
      }, BN.mont = function mont(num) {
        return new Mont(num);
      };
      function Mont(m) {
        if (Red.call(this, m), this.shift = this.m.bitLength(), this.shift % 26 !== 0)
          this.shift += 26 - this.shift % 26;
        this.r = new BN(1).iushln(this.shift), this.r2 = this.imod(this.r.sqr()), this.rinv = this.r._invmp(this.m), this.minv = this.rinv.mul(this.r).isubn(1).div(this.m), this.minv = this.minv.umod(this.r), this.minv = this.r.sub(this.minv);
      }
      inherits2(Mont, Red), Mont.prototype.convertTo = function convertTo(num) {
        return this.imod(num.ushln(this.shift));
      }, Mont.prototype.convertFrom = function convertFrom(num) {
        var r = this.imod(num.mul(this.rinv));
        return r.red = null, r;
      }, Mont.prototype.imul = function imul(a, b) {
        if (a.isZero() || b.isZero())
          return a.words[0] = 0, a.length = 1, a;
        var t = a.imul(b), c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), u = t.isub(c).iushrn(this.shift), res = u;
        if (u.cmp(this.m) >= 0)
          res = u.isub(this.m);
        else if (u.cmpn(0) < 0)
          res = u.iadd(this.m);
        return res._forceRed(this);
      }, Mont.prototype.mul = function mul(a, b) {
        if (a.isZero() || b.isZero())
          return new BN(0)._forceRed(this);
        var t = a.mul(b), c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), u = t.isub(c).iushrn(this.shift), res = u;
        if (u.cmp(this.m) >= 0)
          res = u.isub(this.m);
        else if (u.cmpn(0) < 0)
          res = u.iadd(this.m);
        return res._forceRed(this);
      }, Mont.prototype.invm = function invm(a) {
        var res = this.imod(a._invmp(this.m).mul(this.r2));
        return res._forceRed(this);
      };
    })(typeof module === "undefined" || module, exports);
  });
  require_minimalistic_assert = __commonJS2((exports, module) => {
    module.exports = assert;
    function assert(val, msg) {
      if (!val)
        throw new Error(msg || "Assertion failed");
    }
    assert.equal = function assertEqual(l, r, msg) {
      if (l != r)
        throw new Error(msg || "Assertion failed: " + l + " != " + r);
    };
  });
  require_utils = __commonJS2((exports) => {
    var utils = exports;
    function toArray(msg, enc) {
      if (Array.isArray(msg))
        return msg.slice();
      if (!msg)
        return [];
      var res = [];
      if (typeof msg !== "string") {
        for (var i2 = 0;i2 < msg.length; i2++)
          res[i2] = msg[i2] | 0;
        return res;
      }
      if (enc === "hex") {
        if (msg = msg.replace(/[^a-z0-9]+/ig, ""), msg.length % 2 !== 0)
          msg = "0" + msg;
        for (var i2 = 0;i2 < msg.length; i2 += 2)
          res.push(parseInt(msg[i2] + msg[i2 + 1], 16));
      } else
        for (var i2 = 0;i2 < msg.length; i2++) {
          var c = msg.charCodeAt(i2), hi = c >> 8, lo = c & 255;
          if (hi)
            res.push(hi, lo);
          else
            res.push(lo);
        }
      return res;
    }
    utils.toArray = toArray;
    function zero2(word) {
      if (word.length === 1)
        return "0" + word;
      else
        return word;
    }
    utils.zero2 = zero2;
    function toHex(msg) {
      var res = "";
      for (var i2 = 0;i2 < msg.length; i2++)
        res += zero2(msg[i2].toString(16));
      return res;
    }
    utils.toHex = toHex;
    utils.encode = function encode(arr, enc) {
      if (enc === "hex")
        return toHex(arr);
      else
        return arr;
    };
  });
  require_utils2 = __commonJS2((exports) => {
    var utils = exports, BN = require_bn(), minAssert = require_minimalistic_assert(), minUtils = require_utils();
    utils.assert = minAssert;
    utils.toArray = minUtils.toArray;
    utils.zero2 = minUtils.zero2;
    utils.toHex = minUtils.toHex;
    utils.encode = minUtils.encode;
    function getNAF(num, w, bits) {
      var naf = new Array(Math.max(num.bitLength(), bits) + 1), i2;
      for (i2 = 0;i2 < naf.length; i2 += 1)
        naf[i2] = 0;
      var ws = 1 << w + 1, k = num.clone();
      for (i2 = 0;i2 < naf.length; i2++) {
        var z, mod = k.andln(ws - 1);
        if (k.isOdd()) {
          if (mod > (ws >> 1) - 1)
            z = (ws >> 1) - mod;
          else
            z = mod;
          k.isubn(z);
        } else
          z = 0;
        naf[i2] = z, k.iushrn(1);
      }
      return naf;
    }
    utils.getNAF = getNAF;
    function getJSF(k1, k2) {
      var jsf = [[], []];
      k1 = k1.clone(), k2 = k2.clone();
      var d1 = 0, d2 = 0, m8;
      while (k1.cmpn(-d1) > 0 || k2.cmpn(-d2) > 0) {
        var m14 = k1.andln(3) + d1 & 3, m24 = k2.andln(3) + d2 & 3;
        if (m14 === 3)
          m14 = -1;
        if (m24 === 3)
          m24 = -1;
        var u1;
        if ((m14 & 1) === 0)
          u1 = 0;
        else if (m8 = k1.andln(7) + d1 & 7, (m8 === 3 || m8 === 5) && m24 === 2)
          u1 = -m14;
        else
          u1 = m14;
        jsf[0].push(u1);
        var u2;
        if ((m24 & 1) === 0)
          u2 = 0;
        else if (m8 = k2.andln(7) + d2 & 7, (m8 === 3 || m8 === 5) && m14 === 2)
          u2 = -m24;
        else
          u2 = m24;
        if (jsf[1].push(u2), 2 * d1 === u1 + 1)
          d1 = 1 - d1;
        if (2 * d2 === u2 + 1)
          d2 = 1 - d2;
        k1.iushrn(1), k2.iushrn(1);
      }
      return jsf;
    }
    utils.getJSF = getJSF;
    function cachedProperty(obj, name, computer) {
      var key = "_" + name;
      obj.prototype[name] = function cachedProperty() {
        return this[key] !== undefined ? this[key] : this[key] = computer.call(this);
      };
    }
    utils.cachedProperty = cachedProperty;
    function parseBytes(bytes) {
      return typeof bytes === "string" ? utils.toArray(bytes, "hex") : bytes;
    }
    utils.parseBytes = parseBytes;
    function intFromLE(bytes) {
      return new BN(bytes, "hex", "le");
    }
    utils.intFromLE = intFromLE;
  });
  require_brorand = __commonJS2((exports, module) => {
    var r;
    module.exports = function rand(len2) {
      if (!r)
        r = new Rand(null);
      return r.generate(len2);
    };
    function Rand(rand) {
      this.rand = rand;
    }
    module.exports.Rand = Rand;
    Rand.prototype.generate = function generate(len2) {
      return this._rand(len2);
    };
    Rand.prototype._rand = function _rand(n) {
      if (this.rand.getBytes)
        return this.rand.getBytes(n);
      var res = new Uint8Array(n);
      for (var i2 = 0;i2 < res.length; i2++)
        res[i2] = this.rand.getByte();
      return res;
    };
    if (typeof self === "object") {
      if (self.crypto && self.crypto.getRandomValues)
        Rand.prototype._rand = function _rand(n) {
          var arr = new Uint8Array(n);
          return self.crypto.getRandomValues(arr), arr;
        };
      else if (self.msCrypto && self.msCrypto.getRandomValues)
        Rand.prototype._rand = function _rand(n) {
          var arr = new Uint8Array(n);
          return self.msCrypto.getRandomValues(arr), arr;
        };
      else if (typeof window === "object")
        Rand.prototype._rand = function() {
          throw new Error("Not implemented yet");
        };
    } else
      try {
        if (crypto2 = (init_crypto(), __toCommonJS(exports_crypto)), typeof crypto2.randomBytes !== "function")
          throw new Error("Not supported");
        Rand.prototype._rand = function _rand(n) {
          return crypto2.randomBytes(n);
        };
      } catch (e) {}
    var crypto2;
  });
  require_base = __commonJS2((exports, module) => {
    var BN = require_bn(), utils = require_utils2(), getNAF = utils.getNAF, getJSF = utils.getJSF, assert = utils.assert;
    function BaseCurve(type, conf) {
      this.type = type, this.p = new BN(conf.p, 16), this.red = conf.prime ? BN.red(conf.prime) : BN.mont(this.p), this.zero = new BN(0).toRed(this.red), this.one = new BN(1).toRed(this.red), this.two = new BN(2).toRed(this.red), this.n = conf.n && new BN(conf.n, 16), this.g = conf.g && this.pointFromJSON(conf.g, conf.gRed), this._wnafT1 = new Array(4), this._wnafT2 = new Array(4), this._wnafT3 = new Array(4), this._wnafT4 = new Array(4), this._bitLength = this.n ? this.n.bitLength() : 0;
      var adjustCount = this.n && this.p.div(this.n);
      if (!adjustCount || adjustCount.cmpn(100) > 0)
        this.redN = null;
      else
        this._maxwellTrick = true, this.redN = this.n.toRed(this.red);
    }
    module.exports = BaseCurve;
    BaseCurve.prototype.point = function point() {
      throw new Error("Not implemented");
    };
    BaseCurve.prototype.validate = function validate() {
      throw new Error("Not implemented");
    };
    BaseCurve.prototype._fixedNafMul = function _fixedNafMul(p, k) {
      assert(p.precomputed);
      var doubles = p._getDoubles(), naf = getNAF(k, 1, this._bitLength), I = (1 << doubles.step + 1) - (doubles.step % 2 === 0 ? 2 : 1);
      I /= 3;
      var repr = [], j, nafW;
      for (j = 0;j < naf.length; j += doubles.step) {
        nafW = 0;
        for (var l = j + doubles.step - 1;l >= j; l--)
          nafW = (nafW << 1) + naf[l];
        repr.push(nafW);
      }
      var a = this.jpoint(null, null, null), b = this.jpoint(null, null, null);
      for (var i2 = I;i2 > 0; i2--) {
        for (j = 0;j < repr.length; j++)
          if (nafW = repr[j], nafW === i2)
            b = b.mixedAdd(doubles.points[j]);
          else if (nafW === -i2)
            b = b.mixedAdd(doubles.points[j].neg());
        a = a.add(b);
      }
      return a.toP();
    };
    BaseCurve.prototype._wnafMul = function _wnafMul(p, k) {
      var w = 4, nafPoints = p._getNAFPoints(w);
      w = nafPoints.wnd;
      var wnd = nafPoints.points, naf = getNAF(k, w, this._bitLength), acc = this.jpoint(null, null, null);
      for (var i2 = naf.length - 1;i2 >= 0; i2--) {
        for (var l = 0;i2 >= 0 && naf[i2] === 0; i2--)
          l++;
        if (i2 >= 0)
          l++;
        if (acc = acc.dblp(l), i2 < 0)
          break;
        var z = naf[i2];
        if (assert(z !== 0), p.type === "affine")
          if (z > 0)
            acc = acc.mixedAdd(wnd[z - 1 >> 1]);
          else
            acc = acc.mixedAdd(wnd[-z - 1 >> 1].neg());
        else if (z > 0)
          acc = acc.add(wnd[z - 1 >> 1]);
        else
          acc = acc.add(wnd[-z - 1 >> 1].neg());
      }
      return p.type === "affine" ? acc.toP() : acc;
    };
    BaseCurve.prototype._wnafMulAdd = function _wnafMulAdd(defW, points, coeffs, len2, jacobianResult) {
      var wndWidth = this._wnafT1, wnd = this._wnafT2, naf = this._wnafT3, max = 0, i2, j, p;
      for (i2 = 0;i2 < len2; i2++) {
        p = points[i2];
        var nafPoints = p._getNAFPoints(defW);
        wndWidth[i2] = nafPoints.wnd, wnd[i2] = nafPoints.points;
      }
      for (i2 = len2 - 1;i2 >= 1; i2 -= 2) {
        var a = i2 - 1, b = i2;
        if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
          naf[a] = getNAF(coeffs[a], wndWidth[a], this._bitLength), naf[b] = getNAF(coeffs[b], wndWidth[b], this._bitLength), max = Math.max(naf[a].length, max), max = Math.max(naf[b].length, max);
          continue;
        }
        var comb = [points[a], null, null, points[b]];
        if (points[a].y.cmp(points[b].y) === 0)
          comb[1] = points[a].add(points[b]), comb[2] = points[a].toJ().mixedAdd(points[b].neg());
        else if (points[a].y.cmp(points[b].y.redNeg()) === 0)
          comb[1] = points[a].toJ().mixedAdd(points[b]), comb[2] = points[a].add(points[b].neg());
        else
          comb[1] = points[a].toJ().mixedAdd(points[b]), comb[2] = points[a].toJ().mixedAdd(points[b].neg());
        var index = [-3, -1, -5, -7, 0, 7, 5, 1, 3], jsf = getJSF(coeffs[a], coeffs[b]);
        max = Math.max(jsf[0].length, max), naf[a] = new Array(max), naf[b] = new Array(max);
        for (j = 0;j < max; j++) {
          var ja = jsf[0][j] | 0, jb = jsf[1][j] | 0;
          naf[a][j] = index[(ja + 1) * 3 + (jb + 1)], naf[b][j] = 0, wnd[a] = comb;
        }
      }
      var acc = this.jpoint(null, null, null), tmp = this._wnafT4;
      for (i2 = max;i2 >= 0; i2--) {
        var k = 0;
        while (i2 >= 0) {
          var zero = true;
          for (j = 0;j < len2; j++)
            if (tmp[j] = naf[j][i2] | 0, tmp[j] !== 0)
              zero = false;
          if (!zero)
            break;
          k++, i2--;
        }
        if (i2 >= 0)
          k++;
        if (acc = acc.dblp(k), i2 < 0)
          break;
        for (j = 0;j < len2; j++) {
          var z = tmp[j];
          if (z === 0)
            continue;
          else if (z > 0)
            p = wnd[j][z - 1 >> 1];
          else if (z < 0)
            p = wnd[j][-z - 1 >> 1].neg();
          if (p.type === "affine")
            acc = acc.mixedAdd(p);
          else
            acc = acc.add(p);
        }
      }
      for (i2 = 0;i2 < len2; i2++)
        wnd[i2] = null;
      if (jacobianResult)
        return acc;
      else
        return acc.toP();
    };
    function BasePoint(curve, type) {
      this.curve = curve, this.type = type, this.precomputed = null;
    }
    BaseCurve.BasePoint = BasePoint;
    BasePoint.prototype.eq = function eq() {
      throw new Error("Not implemented");
    };
    BasePoint.prototype.validate = function validate() {
      return this.curve.validate(this);
    };
    BaseCurve.prototype.decodePoint = function decodePoint(bytes, enc) {
      bytes = utils.toArray(bytes, enc);
      var len2 = this.p.byteLength();
      if ((bytes[0] === 4 || bytes[0] === 6 || bytes[0] === 7) && bytes.length - 1 === 2 * len2) {
        if (bytes[0] === 6)
          assert(bytes[bytes.length - 1] % 2 === 0);
        else if (bytes[0] === 7)
          assert(bytes[bytes.length - 1] % 2 === 1);
        var res = this.point(bytes.slice(1, 1 + len2), bytes.slice(1 + len2, 1 + 2 * len2));
        return res;
      } else if ((bytes[0] === 2 || bytes[0] === 3) && bytes.length - 1 === len2)
        return this.pointFromX(bytes.slice(1, 1 + len2), bytes[0] === 3);
      throw new Error("Unknown point format");
    };
    BasePoint.prototype.encodeCompressed = function encodeCompressed(enc) {
      return this.encode(enc, true);
    };
    BasePoint.prototype._encode = function _encode(compact) {
      var len2 = this.curve.p.byteLength(), x = this.getX().toArray("be", len2);
      if (compact)
        return [this.getY().isEven() ? 2 : 3].concat(x);
      return [4].concat(x, this.getY().toArray("be", len2));
    };
    BasePoint.prototype.encode = function encode(enc, compact) {
      return utils.encode(this._encode(compact), enc);
    };
    BasePoint.prototype.precompute = function precompute(power) {
      if (this.precomputed)
        return this;
      var precomputed = { doubles: null, naf: null, beta: null };
      return precomputed.naf = this._getNAFPoints(8), precomputed.doubles = this._getDoubles(4, power), precomputed.beta = this._getBeta(), this.precomputed = precomputed, this;
    };
    BasePoint.prototype._hasDoubles = function _hasDoubles(k) {
      if (!this.precomputed)
        return false;
      var doubles = this.precomputed.doubles;
      if (!doubles)
        return false;
      return doubles.points.length >= Math.ceil((k.bitLength() + 1) / doubles.step);
    };
    BasePoint.prototype._getDoubles = function _getDoubles(step, power) {
      if (this.precomputed && this.precomputed.doubles)
        return this.precomputed.doubles;
      var doubles = [this], acc = this;
      for (var i2 = 0;i2 < power; i2 += step) {
        for (var j = 0;j < step; j++)
          acc = acc.dbl();
        doubles.push(acc);
      }
      return { step, points: doubles };
    };
    BasePoint.prototype._getNAFPoints = function _getNAFPoints(wnd) {
      if (this.precomputed && this.precomputed.naf)
        return this.precomputed.naf;
      var res = [this], max = (1 << wnd) - 1, dbl = max === 1 ? null : this.dbl();
      for (var i2 = 1;i2 < max; i2++)
        res[i2] = res[i2 - 1].add(dbl);
      return { wnd, points: res };
    };
    BasePoint.prototype._getBeta = function _getBeta() {
      return null;
    };
    BasePoint.prototype.dblp = function dblp(k) {
      var r = this;
      for (var i2 = 0;i2 < k; i2++)
        r = r.dbl();
      return r;
    };
  });
  require_inherits_browser = __commonJS2((exports, module) => {
    if (typeof Object.create === "function")
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor)
          ctor.super_ = superCtor, ctor.prototype = Object.create(superCtor.prototype, { constructor: { value: ctor, enumerable: false, writable: true, configurable: true } });
      };
    else
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {};
          TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor, ctor.prototype.constructor = ctor;
        }
      };
  });
  require_inherits = __commonJS2((exports, module) => {
    try {
      if (util = (init_util(), __toCommonJS(exports_util)), typeof util.inherits !== "function")
        throw "";
      module.exports = util.inherits;
    } catch (e) {
      module.exports = require_inherits_browser();
    }
    var util;
  });
  require_short = __commonJS2((exports, module) => {
    var utils = require_utils2(), BN = require_bn(), inherits2 = require_inherits(), Base = require_base(), assert = utils.assert;
    function ShortCurve(conf) {
      Base.call(this, "short", conf), this.a = new BN(conf.a, 16).toRed(this.red), this.b = new BN(conf.b, 16).toRed(this.red), this.tinv = this.two.redInvm(), this.zeroA = this.a.fromRed().cmpn(0) === 0, this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0, this.endo = this._getEndomorphism(conf), this._endoWnafT1 = new Array(4), this._endoWnafT2 = new Array(4);
    }
    inherits2(ShortCurve, Base);
    module.exports = ShortCurve;
    ShortCurve.prototype._getEndomorphism = function _getEndomorphism(conf) {
      if (!this.zeroA || !this.g || !this.n || this.p.modn(3) !== 1)
        return;
      var beta, lambda;
      if (conf.beta)
        beta = new BN(conf.beta, 16).toRed(this.red);
      else {
        var betas = this._getEndoRoots(this.p);
        beta = betas[0].cmp(betas[1]) < 0 ? betas[0] : betas[1], beta = beta.toRed(this.red);
      }
      if (conf.lambda)
        lambda = new BN(conf.lambda, 16);
      else {
        var lambdas = this._getEndoRoots(this.n);
        if (this.g.mul(lambdas[0]).x.cmp(this.g.x.redMul(beta)) === 0)
          lambda = lambdas[0];
        else
          lambda = lambdas[1], assert(this.g.mul(lambda).x.cmp(this.g.x.redMul(beta)) === 0);
      }
      var basis;
      if (conf.basis)
        basis = conf.basis.map(function(vec) {
          return { a: new BN(vec.a, 16), b: new BN(vec.b, 16) };
        });
      else
        basis = this._getEndoBasis(lambda);
      return { beta, lambda, basis };
    };
    ShortCurve.prototype._getEndoRoots = function _getEndoRoots(num) {
      var red = num === this.p ? this.red : BN.mont(num), tinv = new BN(2).toRed(red).redInvm(), ntinv = tinv.redNeg(), s = new BN(3).toRed(red).redNeg().redSqrt().redMul(tinv), l1 = ntinv.redAdd(s).fromRed(), l2 = ntinv.redSub(s).fromRed();
      return [l1, l2];
    };
    ShortCurve.prototype._getEndoBasis = function _getEndoBasis(lambda) {
      var aprxSqrt = this.n.ushrn(Math.floor(this.n.bitLength() / 2)), u = lambda, v = this.n.clone(), x1 = new BN(1), y1 = new BN(0), x2 = new BN(0), y2 = new BN(1), a0, b0, a1, b1, a2, b2, prevR, i2 = 0, r, x;
      while (u.cmpn(0) !== 0) {
        var q = v.div(u);
        r = v.sub(q.mul(u)), x = x2.sub(q.mul(x1));
        var y = y2.sub(q.mul(y1));
        if (!a1 && r.cmp(aprxSqrt) < 0)
          a0 = prevR.neg(), b0 = x1, a1 = r.neg(), b1 = x;
        else if (a1 && ++i2 === 2)
          break;
        prevR = r, v = u, u = r, x2 = x1, x1 = x, y2 = y1, y1 = y;
      }
      a2 = r.neg(), b2 = x;
      var len1 = a1.sqr().add(b1.sqr()), len2 = a2.sqr().add(b2.sqr());
      if (len2.cmp(len1) >= 0)
        a2 = a0, b2 = b0;
      if (a1.negative)
        a1 = a1.neg(), b1 = b1.neg();
      if (a2.negative)
        a2 = a2.neg(), b2 = b2.neg();
      return [{ a: a1, b: b1 }, { a: a2, b: b2 }];
    };
    ShortCurve.prototype._endoSplit = function _endoSplit(k) {
      var basis = this.endo.basis, v1 = basis[0], v2 = basis[1], c1 = v2.b.mul(k).divRound(this.n), c2 = v1.b.neg().mul(k).divRound(this.n), p1 = c1.mul(v1.a), p2 = c2.mul(v2.a), q1 = c1.mul(v1.b), q2 = c2.mul(v2.b), k1 = k.sub(p1).sub(p2), k2 = q1.add(q2).neg();
      return { k1, k2 };
    };
    ShortCurve.prototype.pointFromX = function pointFromX(x, odd) {
      if (x = new BN(x, 16), !x.red)
        x = x.toRed(this.red);
      var y2 = x.redSqr().redMul(x).redIAdd(x.redMul(this.a)).redIAdd(this.b), y = y2.redSqrt();
      if (y.redSqr().redSub(y2).cmp(this.zero) !== 0)
        throw new Error("invalid point");
      var isOdd = y.fromRed().isOdd();
      if (odd && !isOdd || !odd && isOdd)
        y = y.redNeg();
      return this.point(x, y);
    };
    ShortCurve.prototype.validate = function validate(point) {
      if (point.inf)
        return true;
      var { x, y } = point, ax = this.a.redMul(x), rhs = x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b);
      return y.redSqr().redISub(rhs).cmpn(0) === 0;
    };
    ShortCurve.prototype._endoWnafMulAdd = function _endoWnafMulAdd(points, coeffs, jacobianResult) {
      var npoints = this._endoWnafT1, ncoeffs = this._endoWnafT2;
      for (var i2 = 0;i2 < points.length; i2++) {
        var split = this._endoSplit(coeffs[i2]), p = points[i2], beta = p._getBeta();
        if (split.k1.negative)
          split.k1.ineg(), p = p.neg(true);
        if (split.k2.negative)
          split.k2.ineg(), beta = beta.neg(true);
        npoints[i2 * 2] = p, npoints[i2 * 2 + 1] = beta, ncoeffs[i2 * 2] = split.k1, ncoeffs[i2 * 2 + 1] = split.k2;
      }
      var res = this._wnafMulAdd(1, npoints, ncoeffs, i2 * 2, jacobianResult);
      for (var j = 0;j < i2 * 2; j++)
        npoints[j] = null, ncoeffs[j] = null;
      return res;
    };
    function Point(curve, x, y, isRed) {
      if (Base.BasePoint.call(this, curve, "affine"), x === null && y === null)
        this.x = null, this.y = null, this.inf = true;
      else {
        if (this.x = new BN(x, 16), this.y = new BN(y, 16), isRed)
          this.x.forceRed(this.curve.red), this.y.forceRed(this.curve.red);
        if (!this.x.red)
          this.x = this.x.toRed(this.curve.red);
        if (!this.y.red)
          this.y = this.y.toRed(this.curve.red);
        this.inf = false;
      }
    }
    inherits2(Point, Base.BasePoint);
    ShortCurve.prototype.point = function point(x, y, isRed) {
      return new Point(this, x, y, isRed);
    };
    ShortCurve.prototype.pointFromJSON = function pointFromJSON(obj, red) {
      return Point.fromJSON(this, obj, red);
    };
    Point.prototype._getBeta = function _getBeta() {
      if (!this.curve.endo)
        return;
      var pre = this.precomputed;
      if (pre && pre.beta)
        return pre.beta;
      var beta = this.curve.point(this.x.redMul(this.curve.endo.beta), this.y);
      if (pre) {
        var curve = this.curve, endoMul = function(p) {
          return curve.point(p.x.redMul(curve.endo.beta), p.y);
        };
        pre.beta = beta, beta.precomputed = { beta: null, naf: pre.naf && { wnd: pre.naf.wnd, points: pre.naf.points.map(endoMul) }, doubles: pre.doubles && { step: pre.doubles.step, points: pre.doubles.points.map(endoMul) } };
      }
      return beta;
    };
    Point.prototype.toJSON = function toJSON() {
      if (!this.precomputed)
        return [this.x, this.y];
      return [this.x, this.y, this.precomputed && { doubles: this.precomputed.doubles && { step: this.precomputed.doubles.step, points: this.precomputed.doubles.points.slice(1) }, naf: this.precomputed.naf && { wnd: this.precomputed.naf.wnd, points: this.precomputed.naf.points.slice(1) } }];
    };
    Point.fromJSON = function fromJSON(curve, obj, red) {
      if (typeof obj === "string")
        obj = JSON.parse(obj);
      var res = curve.point(obj[0], obj[1], red);
      if (!obj[2])
        return res;
      function obj2point(obj2) {
        return curve.point(obj2[0], obj2[1], red);
      }
      var pre = obj[2];
      return res.precomputed = { beta: null, doubles: pre.doubles && { step: pre.doubles.step, points: [res].concat(pre.doubles.points.map(obj2point)) }, naf: pre.naf && { wnd: pre.naf.wnd, points: [res].concat(pre.naf.points.map(obj2point)) } }, res;
    };
    Point.prototype.inspect = function inspect() {
      if (this.isInfinity())
        return "<EC Point Infinity>";
      return "<EC Point x: " + this.x.fromRed().toString(16, 2) + " y: " + this.y.fromRed().toString(16, 2) + ">";
    };
    Point.prototype.isInfinity = function isInfinity() {
      return this.inf;
    };
    Point.prototype.add = function add(p) {
      if (this.inf)
        return p;
      if (p.inf)
        return this;
      if (this.eq(p))
        return this.dbl();
      if (this.neg().eq(p))
        return this.curve.point(null, null);
      if (this.x.cmp(p.x) === 0)
        return this.curve.point(null, null);
      var c = this.y.redSub(p.y);
      if (c.cmpn(0) !== 0)
        c = c.redMul(this.x.redSub(p.x).redInvm());
      var nx = c.redSqr().redISub(this.x).redISub(p.x), ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
      return this.curve.point(nx, ny);
    };
    Point.prototype.dbl = function dbl() {
      if (this.inf)
        return this;
      var ys1 = this.y.redAdd(this.y);
      if (ys1.cmpn(0) === 0)
        return this.curve.point(null, null);
      var a = this.curve.a, x2 = this.x.redSqr(), dyinv = ys1.redInvm(), c = x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv), nx = c.redSqr().redISub(this.x.redAdd(this.x)), ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
      return this.curve.point(nx, ny);
    };
    Point.prototype.getX = function getX() {
      return this.x.fromRed();
    };
    Point.prototype.getY = function getY() {
      return this.y.fromRed();
    };
    Point.prototype.mul = function mul(k) {
      if (k = new BN(k, 16), this.isInfinity())
        return this;
      else if (this._hasDoubles(k))
        return this.curve._fixedNafMul(this, k);
      else if (this.curve.endo)
        return this.curve._endoWnafMulAdd([this], [k]);
      else
        return this.curve._wnafMul(this, k);
    };
    Point.prototype.mulAdd = function mulAdd(k1, p2, k2) {
      var points = [this, p2], coeffs = [k1, k2];
      if (this.curve.endo)
        return this.curve._endoWnafMulAdd(points, coeffs);
      else
        return this.curve._wnafMulAdd(1, points, coeffs, 2);
    };
    Point.prototype.jmulAdd = function jmulAdd(k1, p2, k2) {
      var points = [this, p2], coeffs = [k1, k2];
      if (this.curve.endo)
        return this.curve._endoWnafMulAdd(points, coeffs, true);
      else
        return this.curve._wnafMulAdd(1, points, coeffs, 2, true);
    };
    Point.prototype.eq = function eq(p) {
      return this === p || this.inf === p.inf && (this.inf || this.x.cmp(p.x) === 0 && this.y.cmp(p.y) === 0);
    };
    Point.prototype.neg = function neg(_precompute) {
      if (this.inf)
        return this;
      var res = this.curve.point(this.x, this.y.redNeg());
      if (_precompute && this.precomputed) {
        var pre = this.precomputed, negate = function(p) {
          return p.neg();
        };
        res.precomputed = { naf: pre.naf && { wnd: pre.naf.wnd, points: pre.naf.points.map(negate) }, doubles: pre.doubles && { step: pre.doubles.step, points: pre.doubles.points.map(negate) } };
      }
      return res;
    };
    Point.prototype.toJ = function toJ() {
      if (this.inf)
        return this.curve.jpoint(null, null, null);
      var res = this.curve.jpoint(this.x, this.y, this.curve.one);
      return res;
    };
    function JPoint(curve, x, y, z) {
      if (Base.BasePoint.call(this, curve, "jacobian"), x === null && y === null && z === null)
        this.x = this.curve.one, this.y = this.curve.one, this.z = new BN(0);
      else
        this.x = new BN(x, 16), this.y = new BN(y, 16), this.z = new BN(z, 16);
      if (!this.x.red)
        this.x = this.x.toRed(this.curve.red);
      if (!this.y.red)
        this.y = this.y.toRed(this.curve.red);
      if (!this.z.red)
        this.z = this.z.toRed(this.curve.red);
      this.zOne = this.z === this.curve.one;
    }
    inherits2(JPoint, Base.BasePoint);
    ShortCurve.prototype.jpoint = function jpoint(x, y, z) {
      return new JPoint(this, x, y, z);
    };
    JPoint.prototype.toP = function toP() {
      if (this.isInfinity())
        return this.curve.point(null, null);
      var zinv = this.z.redInvm(), zinv2 = zinv.redSqr(), ax = this.x.redMul(zinv2), ay = this.y.redMul(zinv2).redMul(zinv);
      return this.curve.point(ax, ay);
    };
    JPoint.prototype.neg = function neg() {
      return this.curve.jpoint(this.x, this.y.redNeg(), this.z);
    };
    JPoint.prototype.add = function add(p) {
      if (this.isInfinity())
        return p;
      if (p.isInfinity())
        return this;
      var pz2 = p.z.redSqr(), z2 = this.z.redSqr(), u1 = this.x.redMul(pz2), u2 = p.x.redMul(z2), s1 = this.y.redMul(pz2.redMul(p.z)), s2 = p.y.redMul(z2.redMul(this.z)), h = u1.redSub(u2), r = s1.redSub(s2);
      if (h.cmpn(0) === 0)
        if (r.cmpn(0) !== 0)
          return this.curve.jpoint(null, null, null);
        else
          return this.dbl();
      var h2 = h.redSqr(), h3 = h2.redMul(h), v = u1.redMul(h2), nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v), ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3)), nz = this.z.redMul(p.z).redMul(h);
      return this.curve.jpoint(nx, ny, nz);
    };
    JPoint.prototype.mixedAdd = function mixedAdd(p) {
      if (this.isInfinity())
        return p.toJ();
      if (p.isInfinity())
        return this;
      var z2 = this.z.redSqr(), u1 = this.x, u2 = p.x.redMul(z2), s1 = this.y, s2 = p.y.redMul(z2).redMul(this.z), h = u1.redSub(u2), r = s1.redSub(s2);
      if (h.cmpn(0) === 0)
        if (r.cmpn(0) !== 0)
          return this.curve.jpoint(null, null, null);
        else
          return this.dbl();
      var h2 = h.redSqr(), h3 = h2.redMul(h), v = u1.redMul(h2), nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v), ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3)), nz = this.z.redMul(h);
      return this.curve.jpoint(nx, ny, nz);
    };
    JPoint.prototype.dblp = function dblp(pow) {
      if (pow === 0)
        return this;
      if (this.isInfinity())
        return this;
      if (!pow)
        return this.dbl();
      var i2;
      if (this.curve.zeroA || this.curve.threeA) {
        var r = this;
        for (i2 = 0;i2 < pow; i2++)
          r = r.dbl();
        return r;
      }
      var a = this.curve.a, tinv = this.curve.tinv, jx = this.x, jy = this.y, jz = this.z, jz4 = jz.redSqr().redSqr(), jyd = jy.redAdd(jy);
      for (i2 = 0;i2 < pow; i2++) {
        var jx2 = jx.redSqr(), jyd2 = jyd.redSqr(), jyd4 = jyd2.redSqr(), c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4)), t1 = jx.redMul(jyd2), nx = c.redSqr().redISub(t1.redAdd(t1)), t2 = t1.redISub(nx), dny = c.redMul(t2);
        dny = dny.redIAdd(dny).redISub(jyd4);
        var nz = jyd.redMul(jz);
        if (i2 + 1 < pow)
          jz4 = jz4.redMul(jyd4);
        jx = nx, jz = nz, jyd = dny;
      }
      return this.curve.jpoint(jx, jyd.redMul(tinv), jz);
    };
    JPoint.prototype.dbl = function dbl() {
      if (this.isInfinity())
        return this;
      if (this.curve.zeroA)
        return this._zeroDbl();
      else if (this.curve.threeA)
        return this._threeDbl();
      else
        return this._dbl();
    };
    JPoint.prototype._zeroDbl = function _zeroDbl() {
      var nx, ny, nz;
      if (this.zOne) {
        var xx = this.x.redSqr(), yy = this.y.redSqr(), yyyy = yy.redSqr(), s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
        s = s.redIAdd(s);
        var m = xx.redAdd(xx).redIAdd(xx), t = m.redSqr().redISub(s).redISub(s), yyyy8 = yyyy.redIAdd(yyyy);
        yyyy8 = yyyy8.redIAdd(yyyy8), yyyy8 = yyyy8.redIAdd(yyyy8), nx = t, ny = m.redMul(s.redISub(t)).redISub(yyyy8), nz = this.y.redAdd(this.y);
      } else {
        var a = this.x.redSqr(), b = this.y.redSqr(), c = b.redSqr(), d = this.x.redAdd(b).redSqr().redISub(a).redISub(c);
        d = d.redIAdd(d);
        var e = a.redAdd(a).redIAdd(a), f = e.redSqr(), c8 = c.redIAdd(c);
        c8 = c8.redIAdd(c8), c8 = c8.redIAdd(c8), nx = f.redISub(d).redISub(d), ny = e.redMul(d.redISub(nx)).redISub(c8), nz = this.y.redMul(this.z), nz = nz.redIAdd(nz);
      }
      return this.curve.jpoint(nx, ny, nz);
    };
    JPoint.prototype._threeDbl = function _threeDbl() {
      var nx, ny, nz;
      if (this.zOne) {
        var xx = this.x.redSqr(), yy = this.y.redSqr(), yyyy = yy.redSqr(), s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
        s = s.redIAdd(s);
        var m = xx.redAdd(xx).redIAdd(xx).redIAdd(this.curve.a), t = m.redSqr().redISub(s).redISub(s);
        nx = t;
        var yyyy8 = yyyy.redIAdd(yyyy);
        yyyy8 = yyyy8.redIAdd(yyyy8), yyyy8 = yyyy8.redIAdd(yyyy8), ny = m.redMul(s.redISub(t)).redISub(yyyy8), nz = this.y.redAdd(this.y);
      } else {
        var delta = this.z.redSqr(), gamma = this.y.redSqr(), beta = this.x.redMul(gamma), alpha = this.x.redSub(delta).redMul(this.x.redAdd(delta));
        alpha = alpha.redAdd(alpha).redIAdd(alpha);
        var beta4 = beta.redIAdd(beta);
        beta4 = beta4.redIAdd(beta4);
        var beta8 = beta4.redAdd(beta4);
        nx = alpha.redSqr().redISub(beta8), nz = this.y.redAdd(this.z).redSqr().redISub(gamma).redISub(delta);
        var ggamma8 = gamma.redSqr();
        ggamma8 = ggamma8.redIAdd(ggamma8), ggamma8 = ggamma8.redIAdd(ggamma8), ggamma8 = ggamma8.redIAdd(ggamma8), ny = alpha.redMul(beta4.redISub(nx)).redISub(ggamma8);
      }
      return this.curve.jpoint(nx, ny, nz);
    };
    JPoint.prototype._dbl = function _dbl() {
      var a = this.curve.a, jx = this.x, jy = this.y, jz = this.z, jz4 = jz.redSqr().redSqr(), jx2 = jx.redSqr(), jy2 = jy.redSqr(), c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4)), jxd4 = jx.redAdd(jx);
      jxd4 = jxd4.redIAdd(jxd4);
      var t1 = jxd4.redMul(jy2), nx = c.redSqr().redISub(t1.redAdd(t1)), t2 = t1.redISub(nx), jyd8 = jy2.redSqr();
      jyd8 = jyd8.redIAdd(jyd8), jyd8 = jyd8.redIAdd(jyd8), jyd8 = jyd8.redIAdd(jyd8);
      var ny = c.redMul(t2).redISub(jyd8), nz = jy.redAdd(jy).redMul(jz);
      return this.curve.jpoint(nx, ny, nz);
    };
    JPoint.prototype.trpl = function trpl() {
      if (!this.curve.zeroA)
        return this.dbl().add(this);
      var xx = this.x.redSqr(), yy = this.y.redSqr(), zz = this.z.redSqr(), yyyy = yy.redSqr(), m = xx.redAdd(xx).redIAdd(xx), mm = m.redSqr(), e = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
      e = e.redIAdd(e), e = e.redAdd(e).redIAdd(e), e = e.redISub(mm);
      var ee = e.redSqr(), t = yyyy.redIAdd(yyyy);
      t = t.redIAdd(t), t = t.redIAdd(t), t = t.redIAdd(t);
      var u = m.redIAdd(e).redSqr().redISub(mm).redISub(ee).redISub(t), yyu4 = yy.redMul(u);
      yyu4 = yyu4.redIAdd(yyu4), yyu4 = yyu4.redIAdd(yyu4);
      var nx = this.x.redMul(ee).redISub(yyu4);
      nx = nx.redIAdd(nx), nx = nx.redIAdd(nx);
      var ny = this.y.redMul(u.redMul(t.redISub(u)).redISub(e.redMul(ee)));
      ny = ny.redIAdd(ny), ny = ny.redIAdd(ny), ny = ny.redIAdd(ny);
      var nz = this.z.redAdd(e).redSqr().redISub(zz).redISub(ee);
      return this.curve.jpoint(nx, ny, nz);
    };
    JPoint.prototype.mul = function mul(k, kbase) {
      return k = new BN(k, kbase), this.curve._wnafMul(this, k);
    };
    JPoint.prototype.eq = function eq(p) {
      if (p.type === "affine")
        return this.eq(p.toJ());
      if (this === p)
        return true;
      var z2 = this.z.redSqr(), pz2 = p.z.redSqr();
      if (this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0) !== 0)
        return false;
      var z3 = z2.redMul(this.z), pz3 = pz2.redMul(p.z);
      return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0) === 0;
    };
    JPoint.prototype.eqXToP = function eqXToP(x) {
      var zs = this.z.redSqr(), rx = x.toRed(this.curve.red).redMul(zs);
      if (this.x.cmp(rx) === 0)
        return true;
      var xc = x.clone(), t = this.curve.redN.redMul(zs);
      for (;; ) {
        if (xc.iadd(this.curve.n), xc.cmp(this.curve.p) >= 0)
          return false;
        if (rx.redIAdd(t), this.x.cmp(rx) === 0)
          return true;
      }
    };
    JPoint.prototype.inspect = function inspect() {
      if (this.isInfinity())
        return "<EC JPoint Infinity>";
      return "<EC JPoint x: " + this.x.toString(16, 2) + " y: " + this.y.toString(16, 2) + " z: " + this.z.toString(16, 2) + ">";
    };
    JPoint.prototype.isInfinity = function isInfinity() {
      return this.z.cmpn(0) === 0;
    };
  });
  require_mont = __commonJS2((exports, module) => {
    var BN = require_bn(), inherits2 = require_inherits(), Base = require_base(), utils = require_utils2();
    function MontCurve(conf) {
      Base.call(this, "mont", conf), this.a = new BN(conf.a, 16).toRed(this.red), this.b = new BN(conf.b, 16).toRed(this.red), this.i4 = new BN(4).toRed(this.red).redInvm(), this.two = new BN(2).toRed(this.red), this.a24 = this.i4.redMul(this.a.redAdd(this.two));
    }
    inherits2(MontCurve, Base);
    module.exports = MontCurve;
    MontCurve.prototype.validate = function validate(point) {
      var x = point.normalize().x, x2 = x.redSqr(), rhs = x2.redMul(x).redAdd(x2.redMul(this.a)).redAdd(x), y = rhs.redSqrt();
      return y.redSqr().cmp(rhs) === 0;
    };
    function Point(curve, x, z) {
      if (Base.BasePoint.call(this, curve, "projective"), x === null && z === null)
        this.x = this.curve.one, this.z = this.curve.zero;
      else {
        if (this.x = new BN(x, 16), this.z = new BN(z, 16), !this.x.red)
          this.x = this.x.toRed(this.curve.red);
        if (!this.z.red)
          this.z = this.z.toRed(this.curve.red);
      }
    }
    inherits2(Point, Base.BasePoint);
    MontCurve.prototype.decodePoint = function decodePoint(bytes, enc) {
      return this.point(utils.toArray(bytes, enc), 1);
    };
    MontCurve.prototype.point = function point(x, z) {
      return new Point(this, x, z);
    };
    MontCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
      return Point.fromJSON(this, obj);
    };
    Point.prototype.precompute = function precompute() {};
    Point.prototype._encode = function _encode() {
      return this.getX().toArray("be", this.curve.p.byteLength());
    };
    Point.fromJSON = function fromJSON(curve, obj) {
      return new Point(curve, obj[0], obj[1] || curve.one);
    };
    Point.prototype.inspect = function inspect() {
      if (this.isInfinity())
        return "<EC Point Infinity>";
      return "<EC Point x: " + this.x.fromRed().toString(16, 2) + " z: " + this.z.fromRed().toString(16, 2) + ">";
    };
    Point.prototype.isInfinity = function isInfinity() {
      return this.z.cmpn(0) === 0;
    };
    Point.prototype.dbl = function dbl() {
      var a = this.x.redAdd(this.z), aa = a.redSqr(), b = this.x.redSub(this.z), bb = b.redSqr(), c = aa.redSub(bb), nx = aa.redMul(bb), nz = c.redMul(bb.redAdd(this.curve.a24.redMul(c)));
      return this.curve.point(nx, nz);
    };
    Point.prototype.add = function add() {
      throw new Error("Not supported on Montgomery curve");
    };
    Point.prototype.diffAdd = function diffAdd(p, diff) {
      var a = this.x.redAdd(this.z), b = this.x.redSub(this.z), c = p.x.redAdd(p.z), d = p.x.redSub(p.z), da = d.redMul(a), cb = c.redMul(b), nx = diff.z.redMul(da.redAdd(cb).redSqr()), nz = diff.x.redMul(da.redISub(cb).redSqr());
      return this.curve.point(nx, nz);
    };
    Point.prototype.mul = function mul(k) {
      var t = k.clone(), a = this, b = this.curve.point(null, null), c = this;
      for (var bits = [];t.cmpn(0) !== 0; t.iushrn(1))
        bits.push(t.andln(1));
      for (var i2 = bits.length - 1;i2 >= 0; i2--)
        if (bits[i2] === 0)
          a = a.diffAdd(b, c), b = b.dbl();
        else
          b = a.diffAdd(b, c), a = a.dbl();
      return b;
    };
    Point.prototype.mulAdd = function mulAdd() {
      throw new Error("Not supported on Montgomery curve");
    };
    Point.prototype.jumlAdd = function jumlAdd() {
      throw new Error("Not supported on Montgomery curve");
    };
    Point.prototype.eq = function eq(other) {
      return this.getX().cmp(other.getX()) === 0;
    };
    Point.prototype.normalize = function normalize() {
      return this.x = this.x.redMul(this.z.redInvm()), this.z = this.curve.one, this;
    };
    Point.prototype.getX = function getX() {
      return this.normalize(), this.x.fromRed();
    };
  });
  require_edwards = __commonJS2((exports, module) => {
    var utils = require_utils2(), BN = require_bn(), inherits2 = require_inherits(), Base = require_base(), assert = utils.assert;
    function EdwardsCurve(conf) {
      this.twisted = (conf.a | 0) !== 1, this.mOneA = this.twisted && (conf.a | 0) === -1, this.extended = this.mOneA, Base.call(this, "edwards", conf), this.a = new BN(conf.a, 16).umod(this.red.m), this.a = this.a.toRed(this.red), this.c = new BN(conf.c, 16).toRed(this.red), this.c2 = this.c.redSqr(), this.d = new BN(conf.d, 16).toRed(this.red), this.dd = this.d.redAdd(this.d), assert(!this.twisted || this.c.fromRed().cmpn(1) === 0), this.oneC = (conf.c | 0) === 1;
    }
    inherits2(EdwardsCurve, Base);
    module.exports = EdwardsCurve;
    EdwardsCurve.prototype._mulA = function _mulA(num) {
      if (this.mOneA)
        return num.redNeg();
      else
        return this.a.redMul(num);
    };
    EdwardsCurve.prototype._mulC = function _mulC(num) {
      if (this.oneC)
        return num;
      else
        return this.c.redMul(num);
    };
    EdwardsCurve.prototype.jpoint = function jpoint(x, y, z, t) {
      return this.point(x, y, z, t);
    };
    EdwardsCurve.prototype.pointFromX = function pointFromX(x, odd) {
      if (x = new BN(x, 16), !x.red)
        x = x.toRed(this.red);
      var x2 = x.redSqr(), rhs = this.c2.redSub(this.a.redMul(x2)), lhs = this.one.redSub(this.c2.redMul(this.d).redMul(x2)), y2 = rhs.redMul(lhs.redInvm()), y = y2.redSqrt();
      if (y.redSqr().redSub(y2).cmp(this.zero) !== 0)
        throw new Error("invalid point");
      var isOdd = y.fromRed().isOdd();
      if (odd && !isOdd || !odd && isOdd)
        y = y.redNeg();
      return this.point(x, y);
    };
    EdwardsCurve.prototype.pointFromY = function pointFromY(y, odd) {
      if (y = new BN(y, 16), !y.red)
        y = y.toRed(this.red);
      var y2 = y.redSqr(), lhs = y2.redSub(this.c2), rhs = y2.redMul(this.d).redMul(this.c2).redSub(this.a), x2 = lhs.redMul(rhs.redInvm());
      if (x2.cmp(this.zero) === 0)
        if (odd)
          throw new Error("invalid point");
        else
          return this.point(this.zero, y);
      var x = x2.redSqrt();
      if (x.redSqr().redSub(x2).cmp(this.zero) !== 0)
        throw new Error("invalid point");
      if (x.fromRed().isOdd() !== odd)
        x = x.redNeg();
      return this.point(x, y);
    };
    EdwardsCurve.prototype.validate = function validate(point) {
      if (point.isInfinity())
        return true;
      point.normalize();
      var x2 = point.x.redSqr(), y2 = point.y.redSqr(), lhs = x2.redMul(this.a).redAdd(y2), rhs = this.c2.redMul(this.one.redAdd(this.d.redMul(x2).redMul(y2)));
      return lhs.cmp(rhs) === 0;
    };
    function Point(curve, x, y, z, t) {
      if (Base.BasePoint.call(this, curve, "projective"), x === null && y === null && z === null)
        this.x = this.curve.zero, this.y = this.curve.one, this.z = this.curve.one, this.t = this.curve.zero, this.zOne = true;
      else {
        if (this.x = new BN(x, 16), this.y = new BN(y, 16), this.z = z ? new BN(z, 16) : this.curve.one, this.t = t && new BN(t, 16), !this.x.red)
          this.x = this.x.toRed(this.curve.red);
        if (!this.y.red)
          this.y = this.y.toRed(this.curve.red);
        if (!this.z.red)
          this.z = this.z.toRed(this.curve.red);
        if (this.t && !this.t.red)
          this.t = this.t.toRed(this.curve.red);
        if (this.zOne = this.z === this.curve.one, this.curve.extended && !this.t) {
          if (this.t = this.x.redMul(this.y), !this.zOne)
            this.t = this.t.redMul(this.z.redInvm());
        }
      }
    }
    inherits2(Point, Base.BasePoint);
    EdwardsCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
      return Point.fromJSON(this, obj);
    };
    EdwardsCurve.prototype.point = function point(x, y, z, t) {
      return new Point(this, x, y, z, t);
    };
    Point.fromJSON = function fromJSON(curve, obj) {
      return new Point(curve, obj[0], obj[1], obj[2]);
    };
    Point.prototype.inspect = function inspect() {
      if (this.isInfinity())
        return "<EC Point Infinity>";
      return "<EC Point x: " + this.x.fromRed().toString(16, 2) + " y: " + this.y.fromRed().toString(16, 2) + " z: " + this.z.fromRed().toString(16, 2) + ">";
    };
    Point.prototype.isInfinity = function isInfinity() {
      return this.x.cmpn(0) === 0 && (this.y.cmp(this.z) === 0 || this.zOne && this.y.cmp(this.curve.c) === 0);
    };
    Point.prototype._extDbl = function _extDbl() {
      var a = this.x.redSqr(), b = this.y.redSqr(), c = this.z.redSqr();
      c = c.redIAdd(c);
      var d = this.curve._mulA(a), e = this.x.redAdd(this.y).redSqr().redISub(a).redISub(b), g = d.redAdd(b), f = g.redSub(c), h = d.redSub(b), nx = e.redMul(f), ny = g.redMul(h), nt = e.redMul(h), nz = f.redMul(g);
      return this.curve.point(nx, ny, nz, nt);
    };
    Point.prototype._projDbl = function _projDbl() {
      var b = this.x.redAdd(this.y).redSqr(), c = this.x.redSqr(), d = this.y.redSqr(), nx, ny, nz, e, h, j;
      if (this.curve.twisted) {
        e = this.curve._mulA(c);
        var f = e.redAdd(d);
        if (this.zOne)
          nx = b.redSub(c).redSub(d).redMul(f.redSub(this.curve.two)), ny = f.redMul(e.redSub(d)), nz = f.redSqr().redSub(f).redSub(f);
        else
          h = this.z.redSqr(), j = f.redSub(h).redISub(h), nx = b.redSub(c).redISub(d).redMul(j), ny = f.redMul(e.redSub(d)), nz = f.redMul(j);
      } else
        e = c.redAdd(d), h = this.curve._mulC(this.z).redSqr(), j = e.redSub(h).redSub(h), nx = this.curve._mulC(b.redISub(e)).redMul(j), ny = this.curve._mulC(e).redMul(c.redISub(d)), nz = e.redMul(j);
      return this.curve.point(nx, ny, nz);
    };
    Point.prototype.dbl = function dbl() {
      if (this.isInfinity())
        return this;
      if (this.curve.extended)
        return this._extDbl();
      else
        return this._projDbl();
    };
    Point.prototype._extAdd = function _extAdd(p) {
      var a = this.y.redSub(this.x).redMul(p.y.redSub(p.x)), b = this.y.redAdd(this.x).redMul(p.y.redAdd(p.x)), c = this.t.redMul(this.curve.dd).redMul(p.t), d = this.z.redMul(p.z.redAdd(p.z)), e = b.redSub(a), f = d.redSub(c), g = d.redAdd(c), h = b.redAdd(a), nx = e.redMul(f), ny = g.redMul(h), nt = e.redMul(h), nz = f.redMul(g);
      return this.curve.point(nx, ny, nz, nt);
    };
    Point.prototype._projAdd = function _projAdd(p) {
      var a = this.z.redMul(p.z), b = a.redSqr(), c = this.x.redMul(p.x), d = this.y.redMul(p.y), e = this.curve.d.redMul(c).redMul(d), f = b.redSub(e), g = b.redAdd(e), tmp = this.x.redAdd(this.y).redMul(p.x.redAdd(p.y)).redISub(c).redISub(d), nx = a.redMul(f).redMul(tmp), ny, nz;
      if (this.curve.twisted)
        ny = a.redMul(g).redMul(d.redSub(this.curve._mulA(c))), nz = f.redMul(g);
      else
        ny = a.redMul(g).redMul(d.redSub(c)), nz = this.curve._mulC(f).redMul(g);
      return this.curve.point(nx, ny, nz);
    };
    Point.prototype.add = function add(p) {
      if (this.isInfinity())
        return p;
      if (p.isInfinity())
        return this;
      if (this.curve.extended)
        return this._extAdd(p);
      else
        return this._projAdd(p);
    };
    Point.prototype.mul = function mul(k) {
      if (this._hasDoubles(k))
        return this.curve._fixedNafMul(this, k);
      else
        return this.curve._wnafMul(this, k);
    };
    Point.prototype.mulAdd = function mulAdd(k1, p, k2) {
      return this.curve._wnafMulAdd(1, [this, p], [k1, k2], 2, false);
    };
    Point.prototype.jmulAdd = function jmulAdd(k1, p, k2) {
      return this.curve._wnafMulAdd(1, [this, p], [k1, k2], 2, true);
    };
    Point.prototype.normalize = function normalize() {
      if (this.zOne)
        return this;
      var zi = this.z.redInvm();
      if (this.x = this.x.redMul(zi), this.y = this.y.redMul(zi), this.t)
        this.t = this.t.redMul(zi);
      return this.z = this.curve.one, this.zOne = true, this;
    };
    Point.prototype.neg = function neg() {
      return this.curve.point(this.x.redNeg(), this.y, this.z, this.t && this.t.redNeg());
    };
    Point.prototype.getX = function getX() {
      return this.normalize(), this.x.fromRed();
    };
    Point.prototype.getY = function getY() {
      return this.normalize(), this.y.fromRed();
    };
    Point.prototype.eq = function eq(other) {
      return this === other || this.getX().cmp(other.getX()) === 0 && this.getY().cmp(other.getY()) === 0;
    };
    Point.prototype.eqXToP = function eqXToP(x) {
      var rx = x.toRed(this.curve.red).redMul(this.z);
      if (this.x.cmp(rx) === 0)
        return true;
      var xc = x.clone(), t = this.curve.redN.redMul(this.z);
      for (;; ) {
        if (xc.iadd(this.curve.n), xc.cmp(this.curve.p) >= 0)
          return false;
        if (rx.redIAdd(t), this.x.cmp(rx) === 0)
          return true;
      }
    };
    Point.prototype.toP = Point.prototype.normalize;
    Point.prototype.mixedAdd = Point.prototype.add;
  });
  require_curve = __commonJS2((exports) => {
    var curve = exports;
    curve.base = require_base();
    curve.short = require_short();
    curve.mont = require_mont();
    curve.edwards = require_edwards();
  });
  require_utils3 = __commonJS2((exports) => {
    var assert = require_minimalistic_assert(), inherits2 = require_inherits();
    exports.inherits = inherits2;
    function isSurrogatePair(msg, i2) {
      if ((msg.charCodeAt(i2) & 64512) !== 55296)
        return false;
      if (i2 < 0 || i2 + 1 >= msg.length)
        return false;
      return (msg.charCodeAt(i2 + 1) & 64512) === 56320;
    }
    function toArray(msg, enc) {
      if (Array.isArray(msg))
        return msg.slice();
      if (!msg)
        return [];
      var res = [];
      if (typeof msg === "string") {
        if (!enc) {
          var p = 0;
          for (var i2 = 0;i2 < msg.length; i2++) {
            var c = msg.charCodeAt(i2);
            if (c < 128)
              res[p++] = c;
            else if (c < 2048)
              res[p++] = c >> 6 | 192, res[p++] = c & 63 | 128;
            else if (isSurrogatePair(msg, i2))
              c = 65536 + ((c & 1023) << 10) + (msg.charCodeAt(++i2) & 1023), res[p++] = c >> 18 | 240, res[p++] = c >> 12 & 63 | 128, res[p++] = c >> 6 & 63 | 128, res[p++] = c & 63 | 128;
            else
              res[p++] = c >> 12 | 224, res[p++] = c >> 6 & 63 | 128, res[p++] = c & 63 | 128;
          }
        } else if (enc === "hex") {
          if (msg = msg.replace(/[^a-z0-9]+/ig, ""), msg.length % 2 !== 0)
            msg = "0" + msg;
          for (i2 = 0;i2 < msg.length; i2 += 2)
            res.push(parseInt(msg[i2] + msg[i2 + 1], 16));
        }
      } else
        for (i2 = 0;i2 < msg.length; i2++)
          res[i2] = msg[i2] | 0;
      return res;
    }
    exports.toArray = toArray;
    function toHex(msg) {
      var res = "";
      for (var i2 = 0;i2 < msg.length; i2++)
        res += zero2(msg[i2].toString(16));
      return res;
    }
    exports.toHex = toHex;
    function htonl(w) {
      var res = w >>> 24 | w >>> 8 & 65280 | w << 8 & 16711680 | (w & 255) << 24;
      return res >>> 0;
    }
    exports.htonl = htonl;
    function toHex32(msg, endian) {
      var res = "";
      for (var i2 = 0;i2 < msg.length; i2++) {
        var w = msg[i2];
        if (endian === "little")
          w = htonl(w);
        res += zero8(w.toString(16));
      }
      return res;
    }
    exports.toHex32 = toHex32;
    function zero2(word) {
      if (word.length === 1)
        return "0" + word;
      else
        return word;
    }
    exports.zero2 = zero2;
    function zero8(word) {
      if (word.length === 7)
        return "0" + word;
      else if (word.length === 6)
        return "00" + word;
      else if (word.length === 5)
        return "000" + word;
      else if (word.length === 4)
        return "0000" + word;
      else if (word.length === 3)
        return "00000" + word;
      else if (word.length === 2)
        return "000000" + word;
      else if (word.length === 1)
        return "0000000" + word;
      else
        return word;
    }
    exports.zero8 = zero8;
    function join32(msg, start, end, endian) {
      var len2 = end - start;
      assert(len2 % 4 === 0);
      var res = new Array(len2 / 4);
      for (var i2 = 0, k = start;i2 < res.length; i2++, k += 4) {
        var w;
        if (endian === "big")
          w = msg[k] << 24 | msg[k + 1] << 16 | msg[k + 2] << 8 | msg[k + 3];
        else
          w = msg[k + 3] << 24 | msg[k + 2] << 16 | msg[k + 1] << 8 | msg[k];
        res[i2] = w >>> 0;
      }
      return res;
    }
    exports.join32 = join32;
    function split32(msg, endian) {
      var res = new Array(msg.length * 4);
      for (var i2 = 0, k = 0;i2 < msg.length; i2++, k += 4) {
        var m = msg[i2];
        if (endian === "big")
          res[k] = m >>> 24, res[k + 1] = m >>> 16 & 255, res[k + 2] = m >>> 8 & 255, res[k + 3] = m & 255;
        else
          res[k + 3] = m >>> 24, res[k + 2] = m >>> 16 & 255, res[k + 1] = m >>> 8 & 255, res[k] = m & 255;
      }
      return res;
    }
    exports.split32 = split32;
    function rotr32(w, b) {
      return w >>> b | w << 32 - b;
    }
    exports.rotr32 = rotr32;
    function rotl32(w, b) {
      return w << b | w >>> 32 - b;
    }
    exports.rotl32 = rotl32;
    function sum32(a, b) {
      return a + b >>> 0;
    }
    exports.sum32 = sum32;
    function sum32_3(a, b, c) {
      return a + b + c >>> 0;
    }
    exports.sum32_3 = sum32_3;
    function sum32_4(a, b, c, d) {
      return a + b + c + d >>> 0;
    }
    exports.sum32_4 = sum32_4;
    function sum32_5(a, b, c, d, e) {
      return a + b + c + d + e >>> 0;
    }
    exports.sum32_5 = sum32_5;
    function sum64(buf, pos, ah, al) {
      var bh = buf[pos], bl = buf[pos + 1], lo = al + bl >>> 0, hi = (lo < al ? 1 : 0) + ah + bh;
      buf[pos] = hi >>> 0, buf[pos + 1] = lo;
    }
    exports.sum64 = sum64;
    function sum64_hi(ah, al, bh, bl) {
      var lo = al + bl >>> 0, hi = (lo < al ? 1 : 0) + ah + bh;
      return hi >>> 0;
    }
    exports.sum64_hi = sum64_hi;
    function sum64_lo(ah, al, bh, bl) {
      var lo = al + bl;
      return lo >>> 0;
    }
    exports.sum64_lo = sum64_lo;
    function sum64_4_hi(ah, al, bh, bl, ch, cl, dh, dl) {
      var carry = 0, lo = al;
      lo = lo + bl >>> 0, carry += lo < al ? 1 : 0, lo = lo + cl >>> 0, carry += lo < cl ? 1 : 0, lo = lo + dl >>> 0, carry += lo < dl ? 1 : 0;
      var hi = ah + bh + ch + dh + carry;
      return hi >>> 0;
    }
    exports.sum64_4_hi = sum64_4_hi;
    function sum64_4_lo(ah, al, bh, bl, ch, cl, dh, dl) {
      var lo = al + bl + cl + dl;
      return lo >>> 0;
    }
    exports.sum64_4_lo = sum64_4_lo;
    function sum64_5_hi(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
      var carry = 0, lo = al;
      lo = lo + bl >>> 0, carry += lo < al ? 1 : 0, lo = lo + cl >>> 0, carry += lo < cl ? 1 : 0, lo = lo + dl >>> 0, carry += lo < dl ? 1 : 0, lo = lo + el >>> 0, carry += lo < el ? 1 : 0;
      var hi = ah + bh + ch + dh + eh + carry;
      return hi >>> 0;
    }
    exports.sum64_5_hi = sum64_5_hi;
    function sum64_5_lo(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
      var lo = al + bl + cl + dl + el;
      return lo >>> 0;
    }
    exports.sum64_5_lo = sum64_5_lo;
    function rotr64_hi(ah, al, num) {
      var r = al << 32 - num | ah >>> num;
      return r >>> 0;
    }
    exports.rotr64_hi = rotr64_hi;
    function rotr64_lo(ah, al, num) {
      var r = ah << 32 - num | al >>> num;
      return r >>> 0;
    }
    exports.rotr64_lo = rotr64_lo;
    function shr64_hi(ah, al, num) {
      return ah >>> num;
    }
    exports.shr64_hi = shr64_hi;
    function shr64_lo(ah, al, num) {
      var r = ah << 32 - num | al >>> num;
      return r >>> 0;
    }
    exports.shr64_lo = shr64_lo;
  });
  require_common = __commonJS2((exports) => {
    var utils = require_utils3(), assert = require_minimalistic_assert();
    function BlockHash() {
      this.pending = null, this.pendingTotal = 0, this.blockSize = this.constructor.blockSize, this.outSize = this.constructor.outSize, this.hmacStrength = this.constructor.hmacStrength, this.padLength = this.constructor.padLength / 8, this.endian = "big", this._delta8 = this.blockSize / 8, this._delta32 = this.blockSize / 32;
    }
    exports.BlockHash = BlockHash;
    BlockHash.prototype.update = function update(msg, enc) {
      if (msg = utils.toArray(msg, enc), !this.pending)
        this.pending = msg;
      else
        this.pending = this.pending.concat(msg);
      if (this.pendingTotal += msg.length, this.pending.length >= this._delta8) {
        msg = this.pending;
        var r = msg.length % this._delta8;
        if (this.pending = msg.slice(msg.length - r, msg.length), this.pending.length === 0)
          this.pending = null;
        msg = utils.join32(msg, 0, msg.length - r, this.endian);
        for (var i2 = 0;i2 < msg.length; i2 += this._delta32)
          this._update(msg, i2, i2 + this._delta32);
      }
      return this;
    };
    BlockHash.prototype.digest = function digest(enc) {
      return this.update(this._pad()), assert(this.pending === null), this._digest(enc);
    };
    BlockHash.prototype._pad = function pad() {
      var len2 = this.pendingTotal, bytes = this._delta8, k = bytes - (len2 + this.padLength) % bytes, res = new Array(k + this.padLength);
      res[0] = 128;
      for (var i2 = 1;i2 < k; i2++)
        res[i2] = 0;
      if (len2 <<= 3, this.endian === "big") {
        for (var t = 8;t < this.padLength; t++)
          res[i2++] = 0;
        res[i2++] = 0, res[i2++] = 0, res[i2++] = 0, res[i2++] = 0, res[i2++] = len2 >>> 24 & 255, res[i2++] = len2 >>> 16 & 255, res[i2++] = len2 >>> 8 & 255, res[i2++] = len2 & 255;
      } else {
        res[i2++] = len2 & 255, res[i2++] = len2 >>> 8 & 255, res[i2++] = len2 >>> 16 & 255, res[i2++] = len2 >>> 24 & 255, res[i2++] = 0, res[i2++] = 0, res[i2++] = 0, res[i2++] = 0;
        for (t = 8;t < this.padLength; t++)
          res[i2++] = 0;
      }
      return res;
    };
  });
  require_common2 = __commonJS2((exports) => {
    var utils = require_utils3(), rotr32 = utils.rotr32;
    function ft_1(s, x, y, z) {
      if (s === 0)
        return ch32(x, y, z);
      if (s === 1 || s === 3)
        return p32(x, y, z);
      if (s === 2)
        return maj32(x, y, z);
    }
    exports.ft_1 = ft_1;
    function ch32(x, y, z) {
      return x & y ^ ~x & z;
    }
    exports.ch32 = ch32;
    function maj32(x, y, z) {
      return x & y ^ x & z ^ y & z;
    }
    exports.maj32 = maj32;
    function p32(x, y, z) {
      return x ^ y ^ z;
    }
    exports.p32 = p32;
    function s0_256(x) {
      return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
    }
    exports.s0_256 = s0_256;
    function s1_256(x) {
      return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
    }
    exports.s1_256 = s1_256;
    function g0_256(x) {
      return rotr32(x, 7) ^ rotr32(x, 18) ^ x >>> 3;
    }
    exports.g0_256 = g0_256;
    function g1_256(x) {
      return rotr32(x, 17) ^ rotr32(x, 19) ^ x >>> 10;
    }
    exports.g1_256 = g1_256;
  });
  require_1 = __commonJS2((exports, module) => {
    var utils = require_utils3(), common = require_common(), shaCommon = require_common2(), rotl32 = utils.rotl32, sum32 = utils.sum32, sum32_5 = utils.sum32_5, ft_1 = shaCommon.ft_1, BlockHash = common.BlockHash, sha1_K = [1518500249, 1859775393, 2400959708, 3395469782];
    function SHA1() {
      if (!(this instanceof SHA1))
        return new SHA1;
      BlockHash.call(this), this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520], this.W = new Array(80);
    }
    utils.inherits(SHA1, BlockHash);
    module.exports = SHA1;
    SHA1.blockSize = 512;
    SHA1.outSize = 160;
    SHA1.hmacStrength = 80;
    SHA1.padLength = 64;
    SHA1.prototype._update = function _update(msg, start) {
      var W = this.W;
      for (var i2 = 0;i2 < 16; i2++)
        W[i2] = msg[start + i2];
      for (;i2 < W.length; i2++)
        W[i2] = rotl32(W[i2 - 3] ^ W[i2 - 8] ^ W[i2 - 14] ^ W[i2 - 16], 1);
      var a = this.h[0], b = this.h[1], c = this.h[2], d = this.h[3], e = this.h[4];
      for (i2 = 0;i2 < W.length; i2++) {
        var s = ~~(i2 / 20), t = sum32_5(rotl32(a, 5), ft_1(s, b, c, d), e, W[i2], sha1_K[s]);
        e = d, d = c, c = rotl32(b, 30), b = a, a = t;
      }
      this.h[0] = sum32(this.h[0], a), this.h[1] = sum32(this.h[1], b), this.h[2] = sum32(this.h[2], c), this.h[3] = sum32(this.h[3], d), this.h[4] = sum32(this.h[4], e);
    };
    SHA1.prototype._digest = function digest(enc) {
      if (enc === "hex")
        return utils.toHex32(this.h, "big");
      else
        return utils.split32(this.h, "big");
    };
  });
  require_256 = __commonJS2((exports, module) => {
    var utils = require_utils3(), common = require_common(), shaCommon = require_common2(), assert = require_minimalistic_assert(), sum32 = utils.sum32, sum32_4 = utils.sum32_4, sum32_5 = utils.sum32_5, ch32 = shaCommon.ch32, maj32 = shaCommon.maj32, s0_256 = shaCommon.s0_256, s1_256 = shaCommon.s1_256, g0_256 = shaCommon.g0_256, g1_256 = shaCommon.g1_256, BlockHash = common.BlockHash, sha256_K = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298];
    function SHA256() {
      if (!(this instanceof SHA256))
        return new SHA256;
      BlockHash.call(this), this.h = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225], this.k = sha256_K, this.W = new Array(64);
    }
    utils.inherits(SHA256, BlockHash);
    module.exports = SHA256;
    SHA256.blockSize = 512;
    SHA256.outSize = 256;
    SHA256.hmacStrength = 192;
    SHA256.padLength = 64;
    SHA256.prototype._update = function _update(msg, start) {
      var W = this.W;
      for (var i2 = 0;i2 < 16; i2++)
        W[i2] = msg[start + i2];
      for (;i2 < W.length; i2++)
        W[i2] = sum32_4(g1_256(W[i2 - 2]), W[i2 - 7], g0_256(W[i2 - 15]), W[i2 - 16]);
      var a = this.h[0], b = this.h[1], c = this.h[2], d = this.h[3], e = this.h[4], f = this.h[5], g = this.h[6], h = this.h[7];
      assert(this.k.length === W.length);
      for (i2 = 0;i2 < W.length; i2++) {
        var T1 = sum32_5(h, s1_256(e), ch32(e, f, g), this.k[i2], W[i2]), T2 = sum32(s0_256(a), maj32(a, b, c));
        h = g, g = f, f = e, e = sum32(d, T1), d = c, c = b, b = a, a = sum32(T1, T2);
      }
      this.h[0] = sum32(this.h[0], a), this.h[1] = sum32(this.h[1], b), this.h[2] = sum32(this.h[2], c), this.h[3] = sum32(this.h[3], d), this.h[4] = sum32(this.h[4], e), this.h[5] = sum32(this.h[5], f), this.h[6] = sum32(this.h[6], g), this.h[7] = sum32(this.h[7], h);
    };
    SHA256.prototype._digest = function digest(enc) {
      if (enc === "hex")
        return utils.toHex32(this.h, "big");
      else
        return utils.split32(this.h, "big");
    };
  });
  require_224 = __commonJS2((exports, module) => {
    var utils = require_utils3(), SHA256 = require_256();
    function SHA224() {
      if (!(this instanceof SHA224))
        return new SHA224;
      SHA256.call(this), this.h = [3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428];
    }
    utils.inherits(SHA224, SHA256);
    module.exports = SHA224;
    SHA224.blockSize = 512;
    SHA224.outSize = 224;
    SHA224.hmacStrength = 192;
    SHA224.padLength = 64;
    SHA224.prototype._digest = function digest(enc) {
      if (enc === "hex")
        return utils.toHex32(this.h.slice(0, 7), "big");
      else
        return utils.split32(this.h.slice(0, 7), "big");
    };
  });
  require_512 = __commonJS2((exports, module) => {
    var utils = require_utils3(), common = require_common(), assert = require_minimalistic_assert(), rotr64_hi = utils.rotr64_hi, rotr64_lo = utils.rotr64_lo, shr64_hi = utils.shr64_hi, shr64_lo = utils.shr64_lo, sum64 = utils.sum64, sum64_hi = utils.sum64_hi, sum64_lo = utils.sum64_lo, sum64_4_hi = utils.sum64_4_hi, sum64_4_lo = utils.sum64_4_lo, sum64_5_hi = utils.sum64_5_hi, sum64_5_lo = utils.sum64_5_lo, BlockHash = common.BlockHash, sha512_K = [1116352408, 3609767458, 1899447441, 602891725, 3049323471, 3964484399, 3921009573, 2173295548, 961987163, 4081628472, 1508970993, 3053834265, 2453635748, 2937671579, 2870763221, 3664609560, 3624381080, 2734883394, 310598401, 1164996542, 607225278, 1323610764, 1426881987, 3590304994, 1925078388, 4068182383, 2162078206, 991336113, 2614888103, 633803317, 3248222580, 3479774868, 3835390401, 2666613458, 4022224774, 944711139, 264347078, 2341262773, 604807628, 2007800933, 770255983, 1495990901, 1249150122, 1856431235, 1555081692, 3175218132, 1996064986, 2198950837, 2554220882, 3999719339, 2821834349, 766784016, 2952996808, 2566594879, 3210313671, 3203337956, 3336571891, 1034457026, 3584528711, 2466948901, 113926993, 3758326383, 338241895, 168717936, 666307205, 1188179964, 773529912, 1546045734, 1294757372, 1522805485, 1396182291, 2643833823, 1695183700, 2343527390, 1986661051, 1014477480, 2177026350, 1206759142, 2456956037, 344077627, 2730485921, 1290863460, 2820302411, 3158454273, 3259730800, 3505952657, 3345764771, 106217008, 3516065817, 3606008344, 3600352804, 1432725776, 4094571909, 1467031594, 275423344, 851169720, 430227734, 3100823752, 506948616, 1363258195, 659060556, 3750685593, 883997877, 3785050280, 958139571, 3318307427, 1322822218, 3812723403, 1537002063, 2003034995, 1747873779, 3602036899, 1955562222, 1575990012, 2024104815, 1125592928, 2227730452, 2716904306, 2361852424, 442776044, 2428436474, 593698344, 2756734187, 3733110249, 3204031479, 2999351573, 3329325298, 3815920427, 3391569614, 3928383900, 3515267271, 566280711, 3940187606, 3454069534, 4118630271, 4000239992, 116418474, 1914138554, 174292421, 2731055270, 289380356, 3203993006, 460393269, 320620315, 685471733, 587496836, 852142971, 1086792851, 1017036298, 365543100, 1126000580, 2618297676, 1288033470, 3409855158, 1501505948, 4234509866, 1607167915, 987167468, 1816402316, 1246189591];
    function SHA512() {
      if (!(this instanceof SHA512))
        return new SHA512;
      BlockHash.call(this), this.h = [1779033703, 4089235720, 3144134277, 2227873595, 1013904242, 4271175723, 2773480762, 1595750129, 1359893119, 2917565137, 2600822924, 725511199, 528734635, 4215389547, 1541459225, 327033209], this.k = sha512_K, this.W = new Array(160);
    }
    utils.inherits(SHA512, BlockHash);
    module.exports = SHA512;
    SHA512.blockSize = 1024;
    SHA512.outSize = 512;
    SHA512.hmacStrength = 192;
    SHA512.padLength = 128;
    SHA512.prototype._prepareBlock = function _prepareBlock(msg, start) {
      var W = this.W;
      for (var i2 = 0;i2 < 32; i2++)
        W[i2] = msg[start + i2];
      for (;i2 < W.length; i2 += 2) {
        var c0_hi = g1_512_hi(W[i2 - 4], W[i2 - 3]), c0_lo = g1_512_lo(W[i2 - 4], W[i2 - 3]), c1_hi = W[i2 - 14], c1_lo = W[i2 - 13], c2_hi = g0_512_hi(W[i2 - 30], W[i2 - 29]), c2_lo = g0_512_lo(W[i2 - 30], W[i2 - 29]), c3_hi = W[i2 - 32], c3_lo = W[i2 - 31];
        W[i2] = sum64_4_hi(c0_hi, c0_lo, c1_hi, c1_lo, c2_hi, c2_lo, c3_hi, c3_lo), W[i2 + 1] = sum64_4_lo(c0_hi, c0_lo, c1_hi, c1_lo, c2_hi, c2_lo, c3_hi, c3_lo);
      }
    };
    SHA512.prototype._update = function _update(msg, start) {
      this._prepareBlock(msg, start);
      var W = this.W, ah = this.h[0], al = this.h[1], bh = this.h[2], bl = this.h[3], ch = this.h[4], cl = this.h[5], dh = this.h[6], dl = this.h[7], eh = this.h[8], el = this.h[9], fh = this.h[10], fl = this.h[11], gh = this.h[12], gl = this.h[13], hh = this.h[14], hl = this.h[15];
      assert(this.k.length === W.length);
      for (var i2 = 0;i2 < W.length; i2 += 2) {
        var c0_hi = hh, c0_lo = hl, c1_hi = s1_512_hi(eh, el), c1_lo = s1_512_lo(eh, el), c2_hi = ch64_hi(eh, el, fh, fl, gh, gl), c2_lo = ch64_lo(eh, el, fh, fl, gh, gl), c3_hi = this.k[i2], c3_lo = this.k[i2 + 1], c4_hi = W[i2], c4_lo = W[i2 + 1], T1_hi = sum64_5_hi(c0_hi, c0_lo, c1_hi, c1_lo, c2_hi, c2_lo, c3_hi, c3_lo, c4_hi, c4_lo), T1_lo = sum64_5_lo(c0_hi, c0_lo, c1_hi, c1_lo, c2_hi, c2_lo, c3_hi, c3_lo, c4_hi, c4_lo);
        c0_hi = s0_512_hi(ah, al), c0_lo = s0_512_lo(ah, al), c1_hi = maj64_hi(ah, al, bh, bl, ch, cl), c1_lo = maj64_lo(ah, al, bh, bl, ch, cl);
        var T2_hi = sum64_hi(c0_hi, c0_lo, c1_hi, c1_lo), T2_lo = sum64_lo(c0_hi, c0_lo, c1_hi, c1_lo);
        hh = gh, hl = gl, gh = fh, gl = fl, fh = eh, fl = el, eh = sum64_hi(dh, dl, T1_hi, T1_lo), el = sum64_lo(dl, dl, T1_hi, T1_lo), dh = ch, dl = cl, ch = bh, cl = bl, bh = ah, bl = al, ah = sum64_hi(T1_hi, T1_lo, T2_hi, T2_lo), al = sum64_lo(T1_hi, T1_lo, T2_hi, T2_lo);
      }
      sum64(this.h, 0, ah, al), sum64(this.h, 2, bh, bl), sum64(this.h, 4, ch, cl), sum64(this.h, 6, dh, dl), sum64(this.h, 8, eh, el), sum64(this.h, 10, fh, fl), sum64(this.h, 12, gh, gl), sum64(this.h, 14, hh, hl);
    };
    SHA512.prototype._digest = function digest(enc) {
      if (enc === "hex")
        return utils.toHex32(this.h, "big");
      else
        return utils.split32(this.h, "big");
    };
    function ch64_hi(xh, xl, yh, yl, zh) {
      var r = xh & yh ^ ~xh & zh;
      if (r < 0)
        r += 4294967296;
      return r;
    }
    function ch64_lo(xh, xl, yh, yl, zh, zl) {
      var r = xl & yl ^ ~xl & zl;
      if (r < 0)
        r += 4294967296;
      return r;
    }
    function maj64_hi(xh, xl, yh, yl, zh) {
      var r = xh & yh ^ xh & zh ^ yh & zh;
      if (r < 0)
        r += 4294967296;
      return r;
    }
    function maj64_lo(xh, xl, yh, yl, zh, zl) {
      var r = xl & yl ^ xl & zl ^ yl & zl;
      if (r < 0)
        r += 4294967296;
      return r;
    }
    function s0_512_hi(xh, xl) {
      var c0_hi = rotr64_hi(xh, xl, 28), c1_hi = rotr64_hi(xl, xh, 2), c2_hi = rotr64_hi(xl, xh, 7), r = c0_hi ^ c1_hi ^ c2_hi;
      if (r < 0)
        r += 4294967296;
      return r;
    }
    function s0_512_lo(xh, xl) {
      var c0_lo = rotr64_lo(xh, xl, 28), c1_lo = rotr64_lo(xl, xh, 2), c2_lo = rotr64_lo(xl, xh, 7), r = c0_lo ^ c1_lo ^ c2_lo;
      if (r < 0)
        r += 4294967296;
      return r;
    }
    function s1_512_hi(xh, xl) {
      var c0_hi = rotr64_hi(xh, xl, 14), c1_hi = rotr64_hi(xh, xl, 18), c2_hi = rotr64_hi(xl, xh, 9), r = c0_hi ^ c1_hi ^ c2_hi;
      if (r < 0)
        r += 4294967296;
      return r;
    }
    function s1_512_lo(xh, xl) {
      var c0_lo = rotr64_lo(xh, xl, 14), c1_lo = rotr64_lo(xh, xl, 18), c2_lo = rotr64_lo(xl, xh, 9), r = c0_lo ^ c1_lo ^ c2_lo;
      if (r < 0)
        r += 4294967296;
      return r;
    }
    function g0_512_hi(xh, xl) {
      var c0_hi = rotr64_hi(xh, xl, 1), c1_hi = rotr64_hi(xh, xl, 8), c2_hi = shr64_hi(xh, xl, 7), r = c0_hi ^ c1_hi ^ c2_hi;
      if (r < 0)
        r += 4294967296;
      return r;
    }
    function g0_512_lo(xh, xl) {
      var c0_lo = rotr64_lo(xh, xl, 1), c1_lo = rotr64_lo(xh, xl, 8), c2_lo = shr64_lo(xh, xl, 7), r = c0_lo ^ c1_lo ^ c2_lo;
      if (r < 0)
        r += 4294967296;
      return r;
    }
    function g1_512_hi(xh, xl) {
      var c0_hi = rotr64_hi(xh, xl, 19), c1_hi = rotr64_hi(xl, xh, 29), c2_hi = shr64_hi(xh, xl, 6), r = c0_hi ^ c1_hi ^ c2_hi;
      if (r < 0)
        r += 4294967296;
      return r;
    }
    function g1_512_lo(xh, xl) {
      var c0_lo = rotr64_lo(xh, xl, 19), c1_lo = rotr64_lo(xl, xh, 29), c2_lo = shr64_lo(xh, xl, 6), r = c0_lo ^ c1_lo ^ c2_lo;
      if (r < 0)
        r += 4294967296;
      return r;
    }
  });
  require_384 = __commonJS2((exports, module) => {
    var utils = require_utils3(), SHA512 = require_512();
    function SHA384() {
      if (!(this instanceof SHA384))
        return new SHA384;
      SHA512.call(this), this.h = [3418070365, 3238371032, 1654270250, 914150663, 2438529370, 812702999, 355462360, 4144912697, 1731405415, 4290775857, 2394180231, 1750603025, 3675008525, 1694076839, 1203062813, 3204075428];
    }
    utils.inherits(SHA384, SHA512);
    module.exports = SHA384;
    SHA384.blockSize = 1024;
    SHA384.outSize = 384;
    SHA384.hmacStrength = 192;
    SHA384.padLength = 128;
    SHA384.prototype._digest = function digest(enc) {
      if (enc === "hex")
        return utils.toHex32(this.h.slice(0, 12), "big");
      else
        return utils.split32(this.h.slice(0, 12), "big");
    };
  });
  require_sha = __commonJS2((exports) => {
    exports.sha1 = require_1();
    exports.sha224 = require_224();
    exports.sha256 = require_256();
    exports.sha384 = require_384();
    exports.sha512 = require_512();
  });
  require_ripemd = __commonJS2((exports) => {
    var utils = require_utils3(), common = require_common(), rotl32 = utils.rotl32, sum32 = utils.sum32, sum32_3 = utils.sum32_3, sum32_4 = utils.sum32_4, BlockHash = common.BlockHash;
    function RIPEMD160() {
      if (!(this instanceof RIPEMD160))
        return new RIPEMD160;
      BlockHash.call(this), this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520], this.endian = "little";
    }
    utils.inherits(RIPEMD160, BlockHash);
    exports.ripemd160 = RIPEMD160;
    RIPEMD160.blockSize = 512;
    RIPEMD160.outSize = 160;
    RIPEMD160.hmacStrength = 192;
    RIPEMD160.padLength = 64;
    RIPEMD160.prototype._update = function update(msg, start) {
      var A = this.h[0], B = this.h[1], C = this.h[2], D = this.h[3], E2 = this.h[4], Ah = A, Bh = B, Ch = C, Dh = D, Eh = E2;
      for (var j = 0;j < 80; j++) {
        var T = sum32(rotl32(sum32_4(A, f(j, B, C, D), msg[r[j] + start], K(j)), s[j]), E2);
        A = E2, E2 = D, D = rotl32(C, 10), C = B, B = T, T = sum32(rotl32(sum32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)), sh[j]), Eh), Ah = Eh, Eh = Dh, Dh = rotl32(Ch, 10), Ch = Bh, Bh = T;
      }
      T = sum32_3(this.h[1], C, Dh), this.h[1] = sum32_3(this.h[2], D, Eh), this.h[2] = sum32_3(this.h[3], E2, Ah), this.h[3] = sum32_3(this.h[4], A, Bh), this.h[4] = sum32_3(this.h[0], B, Ch), this.h[0] = T;
    };
    RIPEMD160.prototype._digest = function digest(enc) {
      if (enc === "hex")
        return utils.toHex32(this.h, "little");
      else
        return utils.split32(this.h, "little");
    };
    function f(j, x, y, z) {
      if (j <= 15)
        return x ^ y ^ z;
      else if (j <= 31)
        return x & y | ~x & z;
      else if (j <= 47)
        return (x | ~y) ^ z;
      else if (j <= 63)
        return x & z | y & ~z;
      else
        return x ^ (y | ~z);
    }
    function K(j) {
      if (j <= 15)
        return 0;
      else if (j <= 31)
        return 1518500249;
      else if (j <= 47)
        return 1859775393;
      else if (j <= 63)
        return 2400959708;
      else
        return 2840853838;
    }
    function Kh(j) {
      if (j <= 15)
        return 1352829926;
      else if (j <= 31)
        return 1548603684;
      else if (j <= 47)
        return 1836072691;
      else if (j <= 63)
        return 2053994217;
      else
        return 0;
    }
    var r = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13], rh = [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11], s = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6], sh = [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11];
  });
  require_hmac = __commonJS2((exports, module) => {
    var utils = require_utils3(), assert = require_minimalistic_assert();
    function Hmac(hash, key, enc) {
      if (!(this instanceof Hmac))
        return new Hmac(hash, key, enc);
      this.Hash = hash, this.blockSize = hash.blockSize / 8, this.outSize = hash.outSize / 8, this.inner = null, this.outer = null, this._init(utils.toArray(key, enc));
    }
    module.exports = Hmac;
    Hmac.prototype._init = function init(key) {
      if (key.length > this.blockSize)
        key = new this.Hash().update(key).digest();
      assert(key.length <= this.blockSize);
      for (var i2 = key.length;i2 < this.blockSize; i2++)
        key.push(0);
      for (i2 = 0;i2 < key.length; i2++)
        key[i2] ^= 54;
      this.inner = new this.Hash().update(key);
      for (i2 = 0;i2 < key.length; i2++)
        key[i2] ^= 106;
      this.outer = new this.Hash().update(key);
    };
    Hmac.prototype.update = function update(msg, enc) {
      return this.inner.update(msg, enc), this;
    };
    Hmac.prototype.digest = function digest(enc) {
      return this.outer.update(this.inner.digest()), this.outer.digest(enc);
    };
  });
  require_hash = __commonJS2((exports) => {
    var hash = exports;
    hash.utils = require_utils3();
    hash.common = require_common();
    hash.sha = require_sha();
    hash.ripemd = require_ripemd();
    hash.hmac = require_hmac();
    hash.sha1 = hash.sha.sha1;
    hash.sha256 = hash.sha.sha256;
    hash.sha224 = hash.sha.sha224;
    hash.sha384 = hash.sha.sha384;
    hash.sha512 = hash.sha.sha512;
    hash.ripemd160 = hash.ripemd.ripemd160;
  });
  require_secp256k1 = __commonJS2((exports, module) => {
    module.exports = { doubles: { step: 4, points: [["e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a", "f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821"], ["8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508", "11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf"], ["175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739", "d3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695"], ["363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640", "4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9"], ["8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c", "4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36"], ["723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda", "96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f"], ["eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa", "5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999"], ["100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0", "cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09"], ["e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d", "9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d"], ["feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d", "e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088"], ["da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1", "9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d"], ["53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0", "5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8"], ["8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047", "10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a"], ["385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862", "283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453"], ["6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7", "7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160"], ["3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd", "56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0"], ["85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83", "7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6"], ["948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a", "53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589"], ["6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8", "bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17"], ["e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d", "4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda"], ["e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725", "7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd"], ["213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754", "4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2"], ["4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c", "17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6"], ["fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6", "6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f"], ["76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39", "c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01"], ["c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891", "893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3"], ["d895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b", "febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f"], ["b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03", "2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7"], ["e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d", "eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78"], ["a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070", "7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1"], ["90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4", "e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150"], ["8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da", "662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82"], ["e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11", "1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc"], ["8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e", "efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b"], ["e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41", "2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51"], ["b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef", "67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45"], ["d68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8", "db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120"], ["324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d", "648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84"], ["4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96", "35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d"], ["9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd", "ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d"], ["6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5", "9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8"], ["a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266", "40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8"], ["7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71", "34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac"], ["928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac", "c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f"], ["85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751", "1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962"], ["ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e", "493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907"], ["827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241", "c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec"], ["eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3", "be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d"], ["e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f", "4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414"], ["1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19", "aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd"], ["146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be", "b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0"], ["fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9", "6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811"], ["da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2", "8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1"], ["a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13", "7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c"], ["174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c", "ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73"], ["959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba", "2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd"], ["d2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151", "e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405"], ["64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073", "d99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589"], ["8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458", "38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e"], ["13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b", "69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27"], ["bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366", "d3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1"], ["8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa", "40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482"], ["8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0", "620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945"], ["dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787", "7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573"], ["f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e", "ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82"]] }, naf: { wnd: 7, points: [["f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9", "388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672"], ["2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4", "d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6"], ["5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc", "6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da"], ["acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe", "cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37"], ["774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb", "d984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b"], ["f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8", "ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81"], ["d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e", "581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58"], ["defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34", "4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77"], ["2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c", "85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a"], ["352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5", "321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c"], ["2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f", "2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67"], ["9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714", "73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402"], ["daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729", "a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55"], ["c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db", "2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482"], ["6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4", "e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82"], ["1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5", "b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396"], ["605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479", "2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49"], ["62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d", "80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf"], ["80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f", "1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a"], ["7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb", "d0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7"], ["d528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9", "eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933"], ["49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963", "758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a"], ["77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74", "958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6"], ["f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530", "e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37"], ["463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b", "5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e"], ["f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247", "cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6"], ["caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1", "cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476"], ["2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120", "4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40"], ["7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435", "91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61"], ["754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18", "673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683"], ["e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8", "59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5"], ["186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb", "3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b"], ["df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f", "55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417"], ["5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143", "efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868"], ["290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba", "e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a"], ["af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45", "f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6"], ["766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a", "744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996"], ["59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e", "c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e"], ["f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8", "e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d"], ["7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c", "30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2"], ["948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519", "e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e"], ["7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab", "100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437"], ["3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca", "ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311"], ["d3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf", "8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4"], ["1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610", "68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575"], ["733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4", "f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d"], ["15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c", "d56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d"], ["a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940", "edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629"], ["e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980", "a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06"], ["311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3", "66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374"], ["34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf", "9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee"], ["f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63", "4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1"], ["d7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448", "fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b"], ["32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf", "5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661"], ["7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5", "8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6"], ["ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6", "8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e"], ["16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5", "5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d"], ["eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99", "f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc"], ["78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51", "f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4"], ["494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5", "42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c"], ["a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5", "204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b"], ["c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997", "4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913"], ["841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881", "73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154"], ["5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5", "39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865"], ["36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66", "d2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc"], ["336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726", "ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224"], ["8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede", "6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e"], ["1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94", "60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6"], ["85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31", "3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511"], ["29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51", "b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b"], ["a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252", "ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2"], ["4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5", "cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c"], ["d24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b", "6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3"], ["ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4", "322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d"], ["af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f", "6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700"], ["e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889", "2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4"], ["591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246", "b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196"], ["11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984", "998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4"], ["3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a", "b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257"], ["cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030", "bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13"], ["c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197", "6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096"], ["c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593", "c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38"], ["a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef", "21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f"], ["347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38", "60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448"], ["da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a", "49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a"], ["c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111", "5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4"], ["4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502", "7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437"], ["3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea", "be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7"], ["cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26", "8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d"], ["b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986", "39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a"], ["d4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e", "62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54"], ["48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4", "25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77"], ["dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda", "ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517"], ["6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859", "cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10"], ["e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f", "f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125"], ["eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c", "6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e"], ["13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942", "fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1"], ["ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a", "1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2"], ["b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80", "5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423"], ["ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d", "438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8"], ["8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1", "cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758"], ["52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63", "c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375"], ["e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352", "6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d"], ["7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193", "ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec"], ["5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00", "9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0"], ["32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58", "ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c"], ["e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7", "d3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4"], ["8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8", "c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f"], ["4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e", "67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649"], ["3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d", "cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826"], ["674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b", "299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5"], ["d32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f", "f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87"], ["30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6", "462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b"], ["be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297", "62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc"], ["93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a", "7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c"], ["b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c", "ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f"], ["d5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52", "4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a"], ["d3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb", "bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46"], ["463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065", "bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f"], ["7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917", "603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03"], ["74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9", "cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08"], ["30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3", "553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8"], ["9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57", "712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373"], ["176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66", "ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3"], ["75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8", "9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8"], ["809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721", "9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1"], ["1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180", "4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9"]] } };
  });
  require_curves = __commonJS2((exports) => {
    var curves = exports, hash = require_hash(), curve = require_curve(), utils = require_utils2(), assert = utils.assert;
    function PresetCurve(options) {
      if (options.type === "short")
        this.curve = new curve.short(options);
      else if (options.type === "edwards")
        this.curve = new curve.edwards(options);
      else
        this.curve = new curve.mont(options);
      this.g = this.curve.g, this.n = this.curve.n, this.hash = options.hash, assert(this.g.validate(), "Invalid curve"), assert(this.g.mul(this.n).isInfinity(), "Invalid curve, G*N != O");
    }
    curves.PresetCurve = PresetCurve;
    function defineCurve(name, options) {
      Object.defineProperty(curves, name, { configurable: true, enumerable: true, get: function() {
        var curve2 = new PresetCurve(options);
        return Object.defineProperty(curves, name, { configurable: true, enumerable: true, value: curve2 }), curve2;
      } });
    }
    defineCurve("p192", { type: "short", prime: "p192", p: "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff", a: "ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc", b: "64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1", n: "ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831", hash: hash.sha256, gRed: false, g: ["188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012", "07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811"] });
    defineCurve("p224", { type: "short", prime: "p224", p: "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001", a: "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe", b: "b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4", n: "ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d", hash: hash.sha256, gRed: false, g: ["b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21", "bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34"] });
    defineCurve("p256", { type: "short", prime: null, p: "ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff", a: "ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc", b: "5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b", n: "ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551", hash: hash.sha256, gRed: false, g: ["6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296", "4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5"] });
    defineCurve("p384", { type: "short", prime: null, p: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 ffffffff", a: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 fffffffc", b: "b3312fa7 e23ee7e4 988e056b e3f82d19 181d9c6e fe814112 0314088f 5013875a c656398d 8a2ed19d 2a85c8ed d3ec2aef", n: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff c7634d81 f4372ddf 581a0db2 48b0a77a ecec196a ccc52973", hash: hash.sha384, gRed: false, g: ["aa87ca22 be8b0537 8eb1c71e f320ad74 6e1d3b62 8ba79b98 59f741e0 82542a38 5502f25d bf55296c 3a545e38 72760ab7", "3617de4a 96262c6f 5d9e98bf 9292dc29 f8f41dbd 289a147c e9da3113 b5f0b8c0 0a60b1ce 1d7e819d 7a431d7c 90ea0e5f"] });
    defineCurve("p521", { type: "short", prime: null, p: "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff", a: "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffc", b: "00000051 953eb961 8e1c9a1f 929a21a0 b68540ee a2da725b 99b315f3 b8b48991 8ef109e1 56193951 ec7e937b 1652c0bd 3bb1bf07 3573df88 3d2c34f1 ef451fd4 6b503f00", n: "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffa 51868783 bf2f966b 7fcc0148 f709a5d0 3bb5c9b8 899c47ae bb6fb71e 91386409", hash: hash.sha512, gRed: false, g: ["000000c6 858e06b7 0404e9cd 9e3ecb66 2395b442 9c648139 053fb521 f828af60 6b4d3dba a14b5e77 efe75928 fe1dc127 a2ffa8de 3348b3c1 856a429b f97e7e31 c2e5bd66", "00000118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd9 98f54449 579b4468 17afbd17 273e662c 97ee7299 5ef42640 c550b901 3fad0761 353c7086 a272c240 88be9476 9fd16650"] });
    defineCurve("curve25519", { type: "mont", prime: "p25519", p: "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed", a: "76d06", b: "1", n: "1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed", hash: hash.sha256, gRed: false, g: ["9"] });
    defineCurve("ed25519", { type: "edwards", prime: "p25519", p: "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed", a: "-1", c: "1", d: "52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3", n: "1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed", hash: hash.sha256, gRed: false, g: ["216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a", "6666666666666666666666666666666666666666666666666666666666666658"] });
    var pre;
    try {
      pre = require_secp256k1();
    } catch (e) {
      pre = undefined;
    }
    defineCurve("secp256k1", { type: "short", prime: "k256", p: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f", a: "0", b: "7", n: "ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141", h: "1", hash: hash.sha256, beta: "7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee", lambda: "5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72", basis: [{ a: "3086d221a7d46bcde86c90e49284eb15", b: "-e4437ed6010e88286f547fa90abfe4c3" }, { a: "114ca50f7a8e2f3f657c1108d9d44cfd8", b: "3086d221a7d46bcde86c90e49284eb15" }], gRed: false, g: ["79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798", "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8", pre] });
  });
  require_hmac_drbg = __commonJS2((exports, module) => {
    var hash = require_hash(), utils = require_utils(), assert = require_minimalistic_assert();
    function HmacDRBG(options) {
      if (!(this instanceof HmacDRBG))
        return new HmacDRBG(options);
      this.hash = options.hash, this.predResist = !!options.predResist, this.outLen = this.hash.outSize, this.minEntropy = options.minEntropy || this.hash.hmacStrength, this._reseed = null, this.reseedInterval = null, this.K = null, this.V = null;
      var entropy = utils.toArray(options.entropy, options.entropyEnc || "hex"), nonce = utils.toArray(options.nonce, options.nonceEnc || "hex"), pers = utils.toArray(options.pers, options.persEnc || "hex");
      assert(entropy.length >= this.minEntropy / 8, "Not enough entropy. Minimum is: " + this.minEntropy + " bits"), this._init(entropy, nonce, pers);
    }
    module.exports = HmacDRBG;
    HmacDRBG.prototype._init = function init(entropy, nonce, pers) {
      var seed = entropy.concat(nonce).concat(pers);
      this.K = new Array(this.outLen / 8), this.V = new Array(this.outLen / 8);
      for (var i2 = 0;i2 < this.V.length; i2++)
        this.K[i2] = 0, this.V[i2] = 1;
      this._update(seed), this._reseed = 1, this.reseedInterval = 281474976710656;
    };
    HmacDRBG.prototype._hmac = function hmac() {
      return new hash.hmac(this.hash, this.K);
    };
    HmacDRBG.prototype._update = function update(seed) {
      var kmac = this._hmac().update(this.V).update([0]);
      if (seed)
        kmac = kmac.update(seed);
      if (this.K = kmac.digest(), this.V = this._hmac().update(this.V).digest(), !seed)
        return;
      this.K = this._hmac().update(this.V).update([1]).update(seed).digest(), this.V = this._hmac().update(this.V).digest();
    };
    HmacDRBG.prototype.reseed = function reseed(entropy, entropyEnc, add, addEnc) {
      if (typeof entropyEnc !== "string")
        addEnc = add, add = entropyEnc, entropyEnc = null;
      entropy = utils.toArray(entropy, entropyEnc), add = utils.toArray(add, addEnc), assert(entropy.length >= this.minEntropy / 8, "Not enough entropy. Minimum is: " + this.minEntropy + " bits"), this._update(entropy.concat(add || [])), this._reseed = 1;
    };
    HmacDRBG.prototype.generate = function generate(len2, enc, add, addEnc) {
      if (this._reseed > this.reseedInterval)
        throw new Error("Reseed is required");
      if (typeof enc !== "string")
        addEnc = add, add = enc, enc = null;
      if (add)
        add = utils.toArray(add, addEnc || "hex"), this._update(add);
      var temp = [];
      while (temp.length < len2)
        this.V = this._hmac().update(this.V).digest(), temp = temp.concat(this.V);
      var res = temp.slice(0, len2);
      return this._update(add), this._reseed++, utils.encode(res, enc);
    };
  });
  require_key = __commonJS2((exports, module) => {
    var BN = require_bn(), utils = require_utils2(), assert = utils.assert;
    function KeyPair(ec, options) {
      if (this.ec = ec, this.priv = null, this.pub = null, options.priv)
        this._importPrivate(options.priv, options.privEnc);
      if (options.pub)
        this._importPublic(options.pub, options.pubEnc);
    }
    module.exports = KeyPair;
    KeyPair.fromPublic = function fromPublic(ec, pub, enc) {
      if (pub instanceof KeyPair)
        return pub;
      return new KeyPair(ec, { pub, pubEnc: enc });
    };
    KeyPair.fromPrivate = function fromPrivate(ec, priv, enc) {
      if (priv instanceof KeyPair)
        return priv;
      return new KeyPair(ec, { priv, privEnc: enc });
    };
    KeyPair.prototype.validate = function validate() {
      var pub = this.getPublic();
      if (pub.isInfinity())
        return { result: false, reason: "Invalid public key" };
      if (!pub.validate())
        return { result: false, reason: "Public key is not a point" };
      if (!pub.mul(this.ec.curve.n).isInfinity())
        return { result: false, reason: "Public key * N != O" };
      return { result: true, reason: null };
    };
    KeyPair.prototype.getPublic = function getPublic(compact, enc) {
      if (typeof compact === "string")
        enc = compact, compact = null;
      if (!this.pub)
        this.pub = this.ec.g.mul(this.priv);
      if (!enc)
        return this.pub;
      return this.pub.encode(enc, compact);
    };
    KeyPair.prototype.getPrivate = function getPrivate(enc) {
      if (enc === "hex")
        return this.priv.toString(16, 2);
      else
        return this.priv;
    };
    KeyPair.prototype._importPrivate = function _importPrivate(key, enc) {
      this.priv = new BN(key, enc || 16), this.priv = this.priv.umod(this.ec.curve.n);
    };
    KeyPair.prototype._importPublic = function _importPublic(key, enc) {
      if (key.x || key.y) {
        if (this.ec.curve.type === "mont")
          assert(key.x, "Need x coordinate");
        else if (this.ec.curve.type === "short" || this.ec.curve.type === "edwards")
          assert(key.x && key.y, "Need both x and y coordinate");
        this.pub = this.ec.curve.point(key.x, key.y);
        return;
      }
      this.pub = this.ec.curve.decodePoint(key, enc);
    };
    KeyPair.prototype.derive = function derive(pub) {
      if (!pub.validate())
        assert(pub.validate(), "public point not validated");
      return pub.mul(this.priv).getX();
    };
    KeyPair.prototype.sign = function sign(msg, enc, options) {
      return this.ec.sign(msg, this, enc, options);
    };
    KeyPair.prototype.verify = function verify(msg, signature, options) {
      return this.ec.verify(msg, signature, this, undefined, options);
    };
    KeyPair.prototype.inspect = function inspect() {
      return "<Key priv: " + (this.priv && this.priv.toString(16, 2)) + " pub: " + (this.pub && this.pub.inspect()) + " >";
    };
  });
  require_signature = __commonJS2((exports, module) => {
    var BN = require_bn(), utils = require_utils2(), assert = utils.assert;
    function Signature(options, enc) {
      if (options instanceof Signature)
        return options;
      if (this._importDER(options, enc))
        return;
      if (assert(options.r && options.s, "Signature without r or s"), this.r = new BN(options.r, 16), this.s = new BN(options.s, 16), options.recoveryParam === undefined)
        this.recoveryParam = null;
      else
        this.recoveryParam = options.recoveryParam;
    }
    module.exports = Signature;
    function Position() {
      this.place = 0;
    }
    function getLength(buf, p) {
      var initial = buf[p.place++];
      if (!(initial & 128))
        return initial;
      var octetLen = initial & 15;
      if (octetLen === 0 || octetLen > 4)
        return false;
      if (buf[p.place] === 0)
        return false;
      var val = 0;
      for (var i2 = 0, off = p.place;i2 < octetLen; i2++, off++)
        val <<= 8, val |= buf[off], val >>>= 0;
      if (val <= 127)
        return false;
      return p.place = off, val;
    }
    function rmPadding(buf) {
      var i2 = 0, len2 = buf.length - 1;
      while (!buf[i2] && !(buf[i2 + 1] & 128) && i2 < len2)
        i2++;
      if (i2 === 0)
        return buf;
      return buf.slice(i2);
    }
    Signature.prototype._importDER = function _importDER(data, enc) {
      data = utils.toArray(data, enc);
      var p = new Position;
      if (data[p.place++] !== 48)
        return false;
      var len2 = getLength(data, p);
      if (len2 === false)
        return false;
      if (len2 + p.place !== data.length)
        return false;
      if (data[p.place++] !== 2)
        return false;
      var rlen = getLength(data, p);
      if (rlen === false)
        return false;
      if ((data[p.place] & 128) !== 0)
        return false;
      var r = data.slice(p.place, rlen + p.place);
      if (p.place += rlen, data[p.place++] !== 2)
        return false;
      var slen = getLength(data, p);
      if (slen === false)
        return false;
      if (data.length !== slen + p.place)
        return false;
      if ((data[p.place] & 128) !== 0)
        return false;
      var s = data.slice(p.place, slen + p.place);
      if (r[0] === 0)
        if (r[1] & 128)
          r = r.slice(1);
        else
          return false;
      if (s[0] === 0)
        if (s[1] & 128)
          s = s.slice(1);
        else
          return false;
      return this.r = new BN(r), this.s = new BN(s), this.recoveryParam = null, true;
    };
    function constructLength(arr, len2) {
      if (len2 < 128) {
        arr.push(len2);
        return;
      }
      var octets = 1 + (Math.log(len2) / Math.LN2 >>> 3);
      arr.push(octets | 128);
      while (--octets)
        arr.push(len2 >>> (octets << 3) & 255);
      arr.push(len2);
    }
    Signature.prototype.toDER = function toDER(enc) {
      var r = this.r.toArray(), s = this.s.toArray();
      if (r[0] & 128)
        r = [0].concat(r);
      if (s[0] & 128)
        s = [0].concat(s);
      r = rmPadding(r), s = rmPadding(s);
      while (!s[0] && !(s[1] & 128))
        s = s.slice(1);
      var arr = [2];
      constructLength(arr, r.length), arr = arr.concat(r), arr.push(2), constructLength(arr, s.length);
      var backHalf = arr.concat(s), res = [48];
      return constructLength(res, backHalf.length), res = res.concat(backHalf), utils.encode(res, enc);
    };
  });
  require_ec = __commonJS2((exports, module) => {
    var BN = require_bn(), HmacDRBG = require_hmac_drbg(), utils = require_utils2(), curves = require_curves(), rand = require_brorand(), assert = utils.assert, KeyPair = require_key(), Signature = require_signature();
    function EC(options) {
      if (!(this instanceof EC))
        return new EC(options);
      if (typeof options === "string")
        assert(Object.prototype.hasOwnProperty.call(curves, options), "Unknown curve " + options), options = curves[options];
      if (options instanceof curves.PresetCurve)
        options = { curve: options };
      this.curve = options.curve.curve, this.n = this.curve.n, this.nh = this.n.ushrn(1), this.g = this.curve.g, this.g = options.curve.g, this.g.precompute(options.curve.n.bitLength() + 1), this.hash = options.hash || options.curve.hash;
    }
    module.exports = EC;
    EC.prototype.keyPair = function keyPair(options) {
      return new KeyPair(this, options);
    };
    EC.prototype.keyFromPrivate = function keyFromPrivate(priv, enc) {
      return KeyPair.fromPrivate(this, priv, enc);
    };
    EC.prototype.keyFromPublic = function keyFromPublic(pub, enc) {
      return KeyPair.fromPublic(this, pub, enc);
    };
    EC.prototype.genKeyPair = function genKeyPair(options) {
      if (!options)
        options = {};
      var drbg = new HmacDRBG({ hash: this.hash, pers: options.pers, persEnc: options.persEnc || "utf8", entropy: options.entropy || rand(this.hash.hmacStrength), entropyEnc: options.entropy && options.entropyEnc || "utf8", nonce: this.n.toArray() }), bytes = this.n.byteLength(), ns2 = this.n.sub(new BN(2));
      for (;; ) {
        var priv = new BN(drbg.generate(bytes));
        if (priv.cmp(ns2) > 0)
          continue;
        return priv.iaddn(1), this.keyFromPrivate(priv);
      }
    };
    EC.prototype._truncateToN = function _truncateToN(msg, truncOnly, bitLength) {
      var byteLength2;
      if (BN.isBN(msg) || typeof msg === "number")
        msg = new BN(msg, 16), byteLength2 = msg.byteLength();
      else if (typeof msg === "object")
        byteLength2 = msg.length, msg = new BN(msg, 16);
      else {
        var str = msg.toString();
        byteLength2 = str.length + 1 >>> 1, msg = new BN(str, 16);
      }
      if (typeof bitLength !== "number")
        bitLength = byteLength2 * 8;
      var delta = bitLength - this.n.bitLength();
      if (delta > 0)
        msg = msg.ushrn(delta);
      if (!truncOnly && msg.cmp(this.n) >= 0)
        return msg.sub(this.n);
      else
        return msg;
    };
    EC.prototype.sign = function sign(msg, key, enc, options) {
      if (typeof enc === "object")
        options = enc, enc = null;
      if (!options)
        options = {};
      if (typeof msg !== "string" && typeof msg !== "number" && !BN.isBN(msg)) {
        assert(typeof msg === "object" && msg && typeof msg.length === "number", "Expected message to be an array-like, a hex string, or a BN instance"), assert(msg.length >>> 0 === msg.length);
        for (var i2 = 0;i2 < msg.length; i2++)
          assert((msg[i2] & 255) === msg[i2]);
      }
      key = this.keyFromPrivate(key, enc), msg = this._truncateToN(msg, false, options.msgBitLength), assert(!msg.isNeg(), "Can not sign a negative message");
      var bytes = this.n.byteLength(), bkey = key.getPrivate().toArray("be", bytes), nonce = msg.toArray("be", bytes);
      assert(new BN(nonce).eq(msg), "Can not sign message");
      var drbg = new HmacDRBG({ hash: this.hash, entropy: bkey, nonce, pers: options.pers, persEnc: options.persEnc || "utf8" }), ns1 = this.n.sub(new BN(1));
      for (var iter = 0;; iter++) {
        var k = options.k ? options.k(iter) : new BN(drbg.generate(this.n.byteLength()));
        if (k = this._truncateToN(k, true), k.cmpn(1) <= 0 || k.cmp(ns1) >= 0)
          continue;
        var kp = this.g.mul(k);
        if (kp.isInfinity())
          continue;
        var kpX = kp.getX(), r = kpX.umod(this.n);
        if (r.cmpn(0) === 0)
          continue;
        var s = k.invm(this.n).mul(r.mul(key.getPrivate()).iadd(msg));
        if (s = s.umod(this.n), s.cmpn(0) === 0)
          continue;
        var recoveryParam = (kp.getY().isOdd() ? 1 : 0) | (kpX.cmp(r) !== 0 ? 2 : 0);
        if (options.canonical && s.cmp(this.nh) > 0)
          s = this.n.sub(s), recoveryParam ^= 1;
        return new Signature({ r, s, recoveryParam });
      }
    };
    EC.prototype.verify = function verify(msg, signature, key, enc, options) {
      if (!options)
        options = {};
      msg = this._truncateToN(msg, false, options.msgBitLength), key = this.keyFromPublic(key, enc), signature = new Signature(signature, "hex");
      var { r, s } = signature;
      if (r.cmpn(1) < 0 || r.cmp(this.n) >= 0)
        return false;
      if (s.cmpn(1) < 0 || s.cmp(this.n) >= 0)
        return false;
      var sinv = s.invm(this.n), u1 = sinv.mul(msg).umod(this.n), u2 = sinv.mul(r).umod(this.n), p;
      if (!this.curve._maxwellTrick) {
        if (p = this.g.mulAdd(u1, key.getPublic(), u2), p.isInfinity())
          return false;
        return p.getX().umod(this.n).cmp(r) === 0;
      }
      if (p = this.g.jmulAdd(u1, key.getPublic(), u2), p.isInfinity())
        return false;
      return p.eqXToP(r);
    };
    EC.prototype.recoverPubKey = function(msg, signature, j, enc) {
      assert((3 & j) === j, "The recovery param is more than two bits"), signature = new Signature(signature, enc);
      var n = this.n, e = new BN(msg), r = signature.r, s = signature.s, isYOdd = j & 1, isSecondKey = j >> 1;
      if (r.cmp(this.curve.p.umod(this.curve.n)) >= 0 && isSecondKey)
        throw new Error("Unable to find sencond key candinate");
      if (isSecondKey)
        r = this.curve.pointFromX(r.add(this.curve.n), isYOdd);
      else
        r = this.curve.pointFromX(r, isYOdd);
      var rInv = signature.r.invm(n), s1 = n.sub(e).mul(rInv).umod(n), s2 = s.mul(rInv).umod(n);
      return this.g.mulAdd(s1, r, s2);
    };
    EC.prototype.getKeyRecoveryParam = function(e, signature, Q, enc) {
      if (signature = new Signature(signature, enc), signature.recoveryParam !== null)
        return signature.recoveryParam;
      for (var i2 = 0;i2 < 4; i2++) {
        var Qprime;
        try {
          Qprime = this.recoverPubKey(e, signature, i2);
        } catch (e2) {
          continue;
        }
        if (Qprime.eq(Q))
          return i2;
      }
      throw new Error("Unable to find valid recovery factor");
    };
  });
  require_key2 = __commonJS2((exports, module) => {
    var utils = require_utils2(), assert = utils.assert, parseBytes = utils.parseBytes, cachedProperty = utils.cachedProperty;
    function KeyPair(eddsa, params) {
      if (this.eddsa = eddsa, this._secret = parseBytes(params.secret), eddsa.isPoint(params.pub))
        this._pub = params.pub;
      else
        this._pubBytes = parseBytes(params.pub);
    }
    KeyPair.fromPublic = function fromPublic(eddsa, pub) {
      if (pub instanceof KeyPair)
        return pub;
      return new KeyPair(eddsa, { pub });
    };
    KeyPair.fromSecret = function fromSecret(eddsa, secret) {
      if (secret instanceof KeyPair)
        return secret;
      return new KeyPair(eddsa, { secret });
    };
    KeyPair.prototype.secret = function secret() {
      return this._secret;
    };
    cachedProperty(KeyPair, "pubBytes", function pubBytes() {
      return this.eddsa.encodePoint(this.pub());
    });
    cachedProperty(KeyPair, "pub", function pub() {
      if (this._pubBytes)
        return this.eddsa.decodePoint(this._pubBytes);
      return this.eddsa.g.mul(this.priv());
    });
    cachedProperty(KeyPair, "privBytes", function privBytes() {
      var eddsa = this.eddsa, hash = this.hash(), lastIx = eddsa.encodingLength - 1, a = hash.slice(0, eddsa.encodingLength);
      return a[0] &= 248, a[lastIx] &= 127, a[lastIx] |= 64, a;
    });
    cachedProperty(KeyPair, "priv", function priv() {
      return this.eddsa.decodeInt(this.privBytes());
    });
    cachedProperty(KeyPair, "hash", function hash() {
      return this.eddsa.hash().update(this.secret()).digest();
    });
    cachedProperty(KeyPair, "messagePrefix", function messagePrefix() {
      return this.hash().slice(this.eddsa.encodingLength);
    });
    KeyPair.prototype.sign = function sign(message) {
      return assert(this._secret, "KeyPair can only verify"), this.eddsa.sign(message, this);
    };
    KeyPair.prototype.verify = function verify(message, sig) {
      return this.eddsa.verify(message, sig, this);
    };
    KeyPair.prototype.getSecret = function getSecret(enc) {
      return assert(this._secret, "KeyPair is public only"), utils.encode(this.secret(), enc);
    };
    KeyPair.prototype.getPublic = function getPublic(enc) {
      return utils.encode(this.pubBytes(), enc);
    };
    module.exports = KeyPair;
  });
  require_signature2 = __commonJS2((exports, module) => {
    var BN = require_bn(), utils = require_utils2(), assert = utils.assert, cachedProperty = utils.cachedProperty, parseBytes = utils.parseBytes;
    function Signature(eddsa, sig) {
      if (this.eddsa = eddsa, typeof sig !== "object")
        sig = parseBytes(sig);
      if (Array.isArray(sig))
        assert(sig.length === eddsa.encodingLength * 2, "Signature has invalid size"), sig = { R: sig.slice(0, eddsa.encodingLength), S: sig.slice(eddsa.encodingLength) };
      if (assert(sig.R && sig.S, "Signature without R or S"), eddsa.isPoint(sig.R))
        this._R = sig.R;
      if (sig.S instanceof BN)
        this._S = sig.S;
      this._Rencoded = Array.isArray(sig.R) ? sig.R : sig.Rencoded, this._Sencoded = Array.isArray(sig.S) ? sig.S : sig.Sencoded;
    }
    cachedProperty(Signature, "S", function S() {
      return this.eddsa.decodeInt(this.Sencoded());
    });
    cachedProperty(Signature, "R", function R() {
      return this.eddsa.decodePoint(this.Rencoded());
    });
    cachedProperty(Signature, "Rencoded", function Rencoded() {
      return this.eddsa.encodePoint(this.R());
    });
    cachedProperty(Signature, "Sencoded", function Sencoded() {
      return this.eddsa.encodeInt(this.S());
    });
    Signature.prototype.toBytes = function toBytes() {
      return this.Rencoded().concat(this.Sencoded());
    };
    Signature.prototype.toHex = function toHex() {
      return utils.encode(this.toBytes(), "hex").toUpperCase();
    };
    module.exports = Signature;
  });
  require_eddsa = __commonJS2((exports, module) => {
    var hash = require_hash(), curves = require_curves(), utils = require_utils2(), assert = utils.assert, parseBytes = utils.parseBytes, KeyPair = require_key2(), Signature = require_signature2();
    function EDDSA(curve) {
      if (assert(curve === "ed25519", "only tested with ed25519 so far"), !(this instanceof EDDSA))
        return new EDDSA(curve);
      curve = curves[curve].curve, this.curve = curve, this.g = curve.g, this.g.precompute(curve.n.bitLength() + 1), this.pointClass = curve.point().constructor, this.encodingLength = Math.ceil(curve.n.bitLength() / 8), this.hash = hash.sha512;
    }
    module.exports = EDDSA;
    EDDSA.prototype.sign = function sign(message, secret) {
      message = parseBytes(message);
      var key = this.keyFromSecret(secret), r = this.hashInt(key.messagePrefix(), message), R = this.g.mul(r), Rencoded = this.encodePoint(R), s_ = this.hashInt(Rencoded, key.pubBytes(), message).mul(key.priv()), S = r.add(s_).umod(this.curve.n);
      return this.makeSignature({ R, S, Rencoded });
    };
    EDDSA.prototype.verify = function verify(message, sig, pub) {
      if (message = parseBytes(message), sig = this.makeSignature(sig), sig.S().gte(sig.eddsa.curve.n) || sig.S().isNeg())
        return false;
      var key = this.keyFromPublic(pub), h = this.hashInt(sig.Rencoded(), key.pubBytes(), message), SG = this.g.mul(sig.S()), RplusAh = sig.R().add(key.pub().mul(h));
      return RplusAh.eq(SG);
    };
    EDDSA.prototype.hashInt = function hashInt() {
      var hash2 = this.hash();
      for (var i2 = 0;i2 < arguments.length; i2++)
        hash2.update(arguments[i2]);
      return utils.intFromLE(hash2.digest()).umod(this.curve.n);
    };
    EDDSA.prototype.keyFromPublic = function keyFromPublic(pub) {
      return KeyPair.fromPublic(this, pub);
    };
    EDDSA.prototype.keyFromSecret = function keyFromSecret(secret) {
      return KeyPair.fromSecret(this, secret);
    };
    EDDSA.prototype.makeSignature = function makeSignature(sig) {
      if (sig instanceof Signature)
        return sig;
      return new Signature(this, sig);
    };
    EDDSA.prototype.encodePoint = function encodePoint(point) {
      var enc = point.getY().toArray("le", this.encodingLength);
      return enc[this.encodingLength - 1] |= point.getX().isOdd() ? 128 : 0, enc;
    };
    EDDSA.prototype.decodePoint = function decodePoint(bytes) {
      bytes = utils.parseBytes(bytes);
      var lastIx = bytes.length - 1, normed = bytes.slice(0, lastIx).concat(bytes[lastIx] & -129), xIsOdd = (bytes[lastIx] & 128) !== 0, y = utils.intFromLE(normed);
      return this.curve.pointFromY(y, xIsOdd);
    };
    EDDSA.prototype.encodeInt = function encodeInt(num) {
      return num.toArray("le", this.encodingLength);
    };
    EDDSA.prototype.decodeInt = function decodeInt(bytes) {
      return utils.intFromLE(bytes);
    };
    EDDSA.prototype.isPoint = function isPoint(val) {
      return val instanceof this.pointClass;
    };
  });
  require_elliptic = __commonJS2((exports) => {
    var elliptic = exports;
    elliptic.version = require_package().version;
    elliptic.utils = require_utils2();
    elliptic.rand = require_brorand();
    elliptic.curve = require_curve();
    elliptic.curves = require_curves();
    elliptic.ec = require_ec();
    elliptic.eddsa = require_eddsa();
  });
  require_bn2 = __commonJS2((exports, module) => {
    (function(module2, exports2) {
      function assert(val, msg) {
        if (!val)
          throw new Error(msg || "Assertion failed");
      }
      function inherits2(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {};
        TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor, ctor.prototype.constructor = ctor;
      }
      function BN(number, base, endian) {
        if (BN.isBN(number))
          return number;
        if (this.negative = 0, this.words = null, this.length = 0, this.red = null, number !== null) {
          if (base === "le" || base === "be")
            endian = base, base = 10;
          this._init(number || 0, base || 10, endian || "be");
        }
      }
      if (typeof module2 === "object")
        module2.exports = BN;
      else
        exports2.BN = BN;
      BN.BN = BN, BN.wordSize = 26;
      var Buffer22;
      try {
        if (typeof window !== "undefined" && typeof window.Buffer !== "undefined")
          Buffer22 = window.Buffer;
        else
          Buffer22 = (init_buffer(), __toCommonJS(exports_buffer)).Buffer;
      } catch (e) {}
      BN.isBN = function isBN(num) {
        if (num instanceof BN)
          return true;
        return num !== null && typeof num === "object" && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
      }, BN.max = function max(left, right) {
        if (left.cmp(right) > 0)
          return left;
        return right;
      }, BN.min = function min(left, right) {
        if (left.cmp(right) < 0)
          return left;
        return right;
      }, BN.prototype._init = function init(number, base, endian) {
        if (typeof number === "number")
          return this._initNumber(number, base, endian);
        if (typeof number === "object")
          return this._initArray(number, base, endian);
        if (base === "hex")
          base = 16;
        assert(base === (base | 0) && base >= 2 && base <= 36), number = number.toString().replace(/\s+/g, "");
        var start = 0;
        if (number[0] === "-")
          start++, this.negative = 1;
        if (start < number.length) {
          if (base === 16)
            this._parseHex(number, start, endian);
          else if (this._parseBase(number, base, start), endian === "le")
            this._initArray(this.toArray(), base, endian);
        }
      }, BN.prototype._initNumber = function _initNumber(number, base, endian) {
        if (number < 0)
          this.negative = 1, number = -number;
        if (number < 67108864)
          this.words = [number & 67108863], this.length = 1;
        else if (number < 4503599627370496)
          this.words = [number & 67108863, number / 67108864 & 67108863], this.length = 2;
        else
          assert(number < 9007199254740992), this.words = [number & 67108863, number / 67108864 & 67108863, 1], this.length = 3;
        if (endian !== "le")
          return;
        this._initArray(this.toArray(), base, endian);
      }, BN.prototype._initArray = function _initArray(number, base, endian) {
        if (assert(typeof number.length === "number"), number.length <= 0)
          return this.words = [0], this.length = 1, this;
        this.length = Math.ceil(number.length / 3), this.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          this.words[i2] = 0;
        var j, w, off = 0;
        if (endian === "be") {
          for (i2 = number.length - 1, j = 0;i2 >= 0; i2 -= 3)
            if (w = number[i2] | number[i2 - 1] << 8 | number[i2 - 2] << 16, this.words[j] |= w << off & 67108863, this.words[j + 1] = w >>> 26 - off & 67108863, off += 24, off >= 26)
              off -= 26, j++;
        } else if (endian === "le") {
          for (i2 = 0, j = 0;i2 < number.length; i2 += 3)
            if (w = number[i2] | number[i2 + 1] << 8 | number[i2 + 2] << 16, this.words[j] |= w << off & 67108863, this.words[j + 1] = w >>> 26 - off & 67108863, off += 24, off >= 26)
              off -= 26, j++;
        }
        return this.strip();
      };
      function parseHex4Bits(string, index) {
        var c = string.charCodeAt(index);
        if (c >= 65 && c <= 70)
          return c - 55;
        else if (c >= 97 && c <= 102)
          return c - 87;
        else
          return c - 48 & 15;
      }
      function parseHexByte(string, lowerBound, index) {
        var r = parseHex4Bits(string, index);
        if (index - 1 >= lowerBound)
          r |= parseHex4Bits(string, index - 1) << 4;
        return r;
      }
      BN.prototype._parseHex = function _parseHex(number, start, endian) {
        this.length = Math.ceil((number.length - start) / 6), this.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          this.words[i2] = 0;
        var off = 0, j = 0, w;
        if (endian === "be")
          for (i2 = number.length - 1;i2 >= start; i2 -= 2)
            if (w = parseHexByte(number, start, i2) << off, this.words[j] |= w & 67108863, off >= 18)
              off -= 18, j += 1, this.words[j] |= w >>> 26;
            else
              off += 8;
        else {
          var parseLength = number.length - start;
          for (i2 = parseLength % 2 === 0 ? start + 1 : start;i2 < number.length; i2 += 2)
            if (w = parseHexByte(number, start, i2) << off, this.words[j] |= w & 67108863, off >= 18)
              off -= 18, j += 1, this.words[j] |= w >>> 26;
            else
              off += 8;
        }
        this.strip();
      };
      function parseBase(str, start, end, mul) {
        var r = 0, len2 = Math.min(str.length, end);
        for (var i2 = start;i2 < len2; i2++) {
          var c = str.charCodeAt(i2) - 48;
          if (r *= mul, c >= 49)
            r += c - 49 + 10;
          else if (c >= 17)
            r += c - 17 + 10;
          else
            r += c;
        }
        return r;
      }
      BN.prototype._parseBase = function _parseBase(number, base, start) {
        this.words = [0], this.length = 1;
        for (var limbLen = 0, limbPow = 1;limbPow <= 67108863; limbPow *= base)
          limbLen++;
        limbLen--, limbPow = limbPow / base | 0;
        var total = number.length - start, mod = total % limbLen, end = Math.min(total, total - mod) + start, word = 0;
        for (var i2 = start;i2 < end; i2 += limbLen)
          if (word = parseBase(number, i2, i2 + limbLen, base), this.imuln(limbPow), this.words[0] + word < 67108864)
            this.words[0] += word;
          else
            this._iaddn(word);
        if (mod !== 0) {
          var pow = 1;
          word = parseBase(number, i2, number.length, base);
          for (i2 = 0;i2 < mod; i2++)
            pow *= base;
          if (this.imuln(pow), this.words[0] + word < 67108864)
            this.words[0] += word;
          else
            this._iaddn(word);
        }
        this.strip();
      }, BN.prototype.copy = function copy(dest) {
        dest.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          dest.words[i2] = this.words[i2];
        dest.length = this.length, dest.negative = this.negative, dest.red = this.red;
      }, BN.prototype.clone = function clone() {
        var r = new BN(null);
        return this.copy(r), r;
      }, BN.prototype._expand = function _expand(size) {
        while (this.length < size)
          this.words[this.length++] = 0;
        return this;
      }, BN.prototype.strip = function strip() {
        while (this.length > 1 && this.words[this.length - 1] === 0)
          this.length--;
        return this._normSign();
      }, BN.prototype._normSign = function _normSign() {
        if (this.length === 1 && this.words[0] === 0)
          this.negative = 0;
        return this;
      }, BN.prototype.inspect = function inspect() {
        return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
      };
      var zeros = ["", "0", "00", "000", "0000", "00000", "000000", "0000000", "00000000", "000000000", "0000000000", "00000000000", "000000000000", "0000000000000", "00000000000000", "000000000000000", "0000000000000000", "00000000000000000", "000000000000000000", "0000000000000000000", "00000000000000000000", "000000000000000000000", "0000000000000000000000", "00000000000000000000000", "000000000000000000000000", "0000000000000000000000000"], groupSizes = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], groupBases = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];
      if (BN.prototype.toString = function toString(base, padding) {
        base = base || 10, padding = padding | 0 || 1;
        var out;
        if (base === 16 || base === "hex") {
          out = "";
          var off = 0, carry = 0;
          for (var i2 = 0;i2 < this.length; i2++) {
            var w = this.words[i2], word = ((w << off | carry) & 16777215).toString(16);
            if (carry = w >>> 24 - off & 16777215, off += 2, off >= 26)
              off -= 26, i2--;
            if (carry !== 0 || i2 !== this.length - 1)
              out = zeros[6 - word.length] + word + out;
            else
              out = word + out;
          }
          if (carry !== 0)
            out = carry.toString(16) + out;
          while (out.length % padding !== 0)
            out = "0" + out;
          if (this.negative !== 0)
            out = "-" + out;
          return out;
        }
        if (base === (base | 0) && base >= 2 && base <= 36) {
          var groupSize = groupSizes[base], groupBase = groupBases[base];
          out = "";
          var c = this.clone();
          c.negative = 0;
          while (!c.isZero()) {
            var r = c.modn(groupBase).toString(base);
            if (c = c.idivn(groupBase), !c.isZero())
              out = zeros[groupSize - r.length] + r + out;
            else
              out = r + out;
          }
          if (this.isZero())
            out = "0" + out;
          while (out.length % padding !== 0)
            out = "0" + out;
          if (this.negative !== 0)
            out = "-" + out;
          return out;
        }
        assert(false, "Base should be between 2 and 36");
      }, BN.prototype.toNumber = function toNumber() {
        var ret = this.words[0];
        if (this.length === 2)
          ret += this.words[1] * 67108864;
        else if (this.length === 3 && this.words[2] === 1)
          ret += 4503599627370496 + this.words[1] * 67108864;
        else if (this.length > 2)
          assert(false, "Number can only safely store up to 53 bits");
        return this.negative !== 0 ? -ret : ret;
      }, BN.prototype.toJSON = function toJSON() {
        return this.toString(16);
      }, BN.prototype.toBuffer = function toBuffer(endian, length) {
        return assert(typeof Buffer22 !== "undefined"), this.toArrayLike(Buffer22, endian, length);
      }, BN.prototype.toArray = function toArray(endian, length) {
        return this.toArrayLike(Array, endian, length);
      }, BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
        var byteLength2 = this.byteLength(), reqLength = length || Math.max(1, byteLength2);
        assert(byteLength2 <= reqLength, "byte array longer than desired length"), assert(reqLength > 0, "Requested array length <= 0"), this.strip();
        var littleEndian = endian === "le", res = new ArrayType(reqLength), b, i2, q = this.clone();
        if (!littleEndian) {
          for (i2 = 0;i2 < reqLength - byteLength2; i2++)
            res[i2] = 0;
          for (i2 = 0;!q.isZero(); i2++)
            b = q.andln(255), q.iushrn(8), res[reqLength - i2 - 1] = b;
        } else {
          for (i2 = 0;!q.isZero(); i2++)
            b = q.andln(255), q.iushrn(8), res[i2] = b;
          for (;i2 < reqLength; i2++)
            res[i2] = 0;
        }
        return res;
      }, Math.clz32)
        BN.prototype._countBits = function _countBits(w) {
          return 32 - Math.clz32(w);
        };
      else
        BN.prototype._countBits = function _countBits(w) {
          var t = w, r = 0;
          if (t >= 4096)
            r += 13, t >>>= 13;
          if (t >= 64)
            r += 7, t >>>= 7;
          if (t >= 8)
            r += 4, t >>>= 4;
          if (t >= 2)
            r += 2, t >>>= 2;
          return r + t;
        };
      BN.prototype._zeroBits = function _zeroBits(w) {
        if (w === 0)
          return 26;
        var t = w, r = 0;
        if ((t & 8191) === 0)
          r += 13, t >>>= 13;
        if ((t & 127) === 0)
          r += 7, t >>>= 7;
        if ((t & 15) === 0)
          r += 4, t >>>= 4;
        if ((t & 3) === 0)
          r += 2, t >>>= 2;
        if ((t & 1) === 0)
          r++;
        return r;
      }, BN.prototype.bitLength = function bitLength() {
        var w = this.words[this.length - 1], hi = this._countBits(w);
        return (this.length - 1) * 26 + hi;
      };
      function toBitArray(num) {
        var w = new Array(num.bitLength());
        for (var bit = 0;bit < w.length; bit++) {
          var off = bit / 26 | 0, wbit = bit % 26;
          w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
        }
        return w;
      }
      BN.prototype.zeroBits = function zeroBits() {
        if (this.isZero())
          return 0;
        var r = 0;
        for (var i2 = 0;i2 < this.length; i2++) {
          var b = this._zeroBits(this.words[i2]);
          if (r += b, b !== 26)
            break;
        }
        return r;
      }, BN.prototype.byteLength = function byteLength() {
        return Math.ceil(this.bitLength() / 8);
      }, BN.prototype.toTwos = function toTwos(width) {
        if (this.negative !== 0)
          return this.abs().inotn(width).iaddn(1);
        return this.clone();
      }, BN.prototype.fromTwos = function fromTwos(width) {
        if (this.testn(width - 1))
          return this.notn(width).iaddn(1).ineg();
        return this.clone();
      }, BN.prototype.isNeg = function isNeg() {
        return this.negative !== 0;
      }, BN.prototype.neg = function neg() {
        return this.clone().ineg();
      }, BN.prototype.ineg = function ineg() {
        if (!this.isZero())
          this.negative ^= 1;
        return this;
      }, BN.prototype.iuor = function iuor(num) {
        while (this.length < num.length)
          this.words[this.length++] = 0;
        for (var i2 = 0;i2 < num.length; i2++)
          this.words[i2] = this.words[i2] | num.words[i2];
        return this.strip();
      }, BN.prototype.ior = function ior(num) {
        return assert((this.negative | num.negative) === 0), this.iuor(num);
      }, BN.prototype.or = function or(num) {
        if (this.length > num.length)
          return this.clone().ior(num);
        return num.clone().ior(this);
      }, BN.prototype.uor = function uor(num) {
        if (this.length > num.length)
          return this.clone().iuor(num);
        return num.clone().iuor(this);
      }, BN.prototype.iuand = function iuand(num) {
        var b;
        if (this.length > num.length)
          b = num;
        else
          b = this;
        for (var i2 = 0;i2 < b.length; i2++)
          this.words[i2] = this.words[i2] & num.words[i2];
        return this.length = b.length, this.strip();
      }, BN.prototype.iand = function iand(num) {
        return assert((this.negative | num.negative) === 0), this.iuand(num);
      }, BN.prototype.and = function and(num) {
        if (this.length > num.length)
          return this.clone().iand(num);
        return num.clone().iand(this);
      }, BN.prototype.uand = function uand(num) {
        if (this.length > num.length)
          return this.clone().iuand(num);
        return num.clone().iuand(this);
      }, BN.prototype.iuxor = function iuxor(num) {
        var a, b;
        if (this.length > num.length)
          a = this, b = num;
        else
          a = num, b = this;
        for (var i2 = 0;i2 < b.length; i2++)
          this.words[i2] = a.words[i2] ^ b.words[i2];
        if (this !== a)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        return this.length = a.length, this.strip();
      }, BN.prototype.ixor = function ixor(num) {
        return assert((this.negative | num.negative) === 0), this.iuxor(num);
      }, BN.prototype.xor = function xor(num) {
        if (this.length > num.length)
          return this.clone().ixor(num);
        return num.clone().ixor(this);
      }, BN.prototype.uxor = function uxor(num) {
        if (this.length > num.length)
          return this.clone().iuxor(num);
        return num.clone().iuxor(this);
      }, BN.prototype.inotn = function inotn(width) {
        assert(typeof width === "number" && width >= 0);
        var bytesNeeded = Math.ceil(width / 26) | 0, bitsLeft = width % 26;
        if (this._expand(bytesNeeded), bitsLeft > 0)
          bytesNeeded--;
        for (var i2 = 0;i2 < bytesNeeded; i2++)
          this.words[i2] = ~this.words[i2] & 67108863;
        if (bitsLeft > 0)
          this.words[i2] = ~this.words[i2] & 67108863 >> 26 - bitsLeft;
        return this.strip();
      }, BN.prototype.notn = function notn(width) {
        return this.clone().inotn(width);
      }, BN.prototype.setn = function setn(bit, val) {
        assert(typeof bit === "number" && bit >= 0);
        var off = bit / 26 | 0, wbit = bit % 26;
        if (this._expand(off + 1), val)
          this.words[off] = this.words[off] | 1 << wbit;
        else
          this.words[off] = this.words[off] & ~(1 << wbit);
        return this.strip();
      }, BN.prototype.iadd = function iadd(num) {
        var r;
        if (this.negative !== 0 && num.negative === 0)
          return this.negative = 0, r = this.isub(num), this.negative ^= 1, this._normSign();
        else if (this.negative === 0 && num.negative !== 0)
          return num.negative = 0, r = this.isub(num), num.negative = 1, r._normSign();
        var a, b;
        if (this.length > num.length)
          a = this, b = num;
        else
          a = num, b = this;
        var carry = 0;
        for (var i2 = 0;i2 < b.length; i2++)
          r = (a.words[i2] | 0) + (b.words[i2] | 0) + carry, this.words[i2] = r & 67108863, carry = r >>> 26;
        for (;carry !== 0 && i2 < a.length; i2++)
          r = (a.words[i2] | 0) + carry, this.words[i2] = r & 67108863, carry = r >>> 26;
        if (this.length = a.length, carry !== 0)
          this.words[this.length] = carry, this.length++;
        else if (a !== this)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        return this;
      }, BN.prototype.add = function add(num) {
        var res;
        if (num.negative !== 0 && this.negative === 0)
          return num.negative = 0, res = this.sub(num), num.negative ^= 1, res;
        else if (num.negative === 0 && this.negative !== 0)
          return this.negative = 0, res = num.sub(this), this.negative = 1, res;
        if (this.length > num.length)
          return this.clone().iadd(num);
        return num.clone().iadd(this);
      }, BN.prototype.isub = function isub(num) {
        if (num.negative !== 0) {
          num.negative = 0;
          var r = this.iadd(num);
          return num.negative = 1, r._normSign();
        } else if (this.negative !== 0)
          return this.negative = 0, this.iadd(num), this.negative = 1, this._normSign();
        var cmp = this.cmp(num);
        if (cmp === 0)
          return this.negative = 0, this.length = 1, this.words[0] = 0, this;
        var a, b;
        if (cmp > 0)
          a = this, b = num;
        else
          a = num, b = this;
        var carry = 0;
        for (var i2 = 0;i2 < b.length; i2++)
          r = (a.words[i2] | 0) - (b.words[i2] | 0) + carry, carry = r >> 26, this.words[i2] = r & 67108863;
        for (;carry !== 0 && i2 < a.length; i2++)
          r = (a.words[i2] | 0) + carry, carry = r >> 26, this.words[i2] = r & 67108863;
        if (carry === 0 && i2 < a.length && a !== this)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        if (this.length = Math.max(this.length, i2), a !== this)
          this.negative = 1;
        return this.strip();
      }, BN.prototype.sub = function sub(num) {
        return this.clone().isub(num);
      };
      function smallMulTo(self2, num, out) {
        out.negative = num.negative ^ self2.negative;
        var len2 = self2.length + num.length | 0;
        out.length = len2, len2 = len2 - 1 | 0;
        var a = self2.words[0] | 0, b = num.words[0] | 0, r = a * b, lo = r & 67108863, carry = r / 67108864 | 0;
        out.words[0] = lo;
        for (var k = 1;k < len2; k++) {
          var ncarry = carry >>> 26, rword = carry & 67108863, maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self2.length + 1);j <= maxJ; j++) {
            var i2 = k - j | 0;
            a = self2.words[i2] | 0, b = num.words[j] | 0, r = a * b + rword, ncarry += r / 67108864 | 0, rword = r & 67108863;
          }
          out.words[k] = rword | 0, carry = ncarry | 0;
        }
        if (carry !== 0)
          out.words[k] = carry | 0;
        else
          out.length--;
        return out.strip();
      }
      var comb10MulTo = function comb10MulTo(self2, num, out) {
        var a = self2.words, b = num.words, o = out.words, c = 0, lo, mid, hi, a0 = a[0] | 0, al0 = a0 & 8191, ah0 = a0 >>> 13, a1 = a[1] | 0, al1 = a1 & 8191, ah1 = a1 >>> 13, a2 = a[2] | 0, al2 = a2 & 8191, ah2 = a2 >>> 13, a3 = a[3] | 0, al3 = a3 & 8191, ah3 = a3 >>> 13, a4 = a[4] | 0, al4 = a4 & 8191, ah4 = a4 >>> 13, a5 = a[5] | 0, al5 = a5 & 8191, ah5 = a5 >>> 13, a6 = a[6] | 0, al6 = a6 & 8191, ah6 = a6 >>> 13, a7 = a[7] | 0, al7 = a7 & 8191, ah7 = a7 >>> 13, a8 = a[8] | 0, al8 = a8 & 8191, ah8 = a8 >>> 13, a9 = a[9] | 0, al9 = a9 & 8191, ah9 = a9 >>> 13, b0 = b[0] | 0, bl0 = b0 & 8191, bh0 = b0 >>> 13, b1 = b[1] | 0, bl1 = b1 & 8191, bh1 = b1 >>> 13, b2 = b[2] | 0, bl2 = b2 & 8191, bh2 = b2 >>> 13, b3 = b[3] | 0, bl3 = b3 & 8191, bh3 = b3 >>> 13, b4 = b[4] | 0, bl4 = b4 & 8191, bh4 = b4 >>> 13, b5 = b[5] | 0, bl5 = b5 & 8191, bh5 = b5 >>> 13, b6 = b[6] | 0, bl6 = b6 & 8191, bh6 = b6 >>> 13, b7 = b[7] | 0, bl7 = b7 & 8191, bh7 = b7 >>> 13, b8 = b[8] | 0, bl8 = b8 & 8191, bh8 = b8 >>> 13, b9 = b[9] | 0, bl9 = b9 & 8191, bh9 = b9 >>> 13;
        out.negative = self2.negative ^ num.negative, out.length = 19, lo = Math.imul(al0, bl0), mid = Math.imul(al0, bh0), mid = mid + Math.imul(ah0, bl0) | 0, hi = Math.imul(ah0, bh0);
        var w0 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0, w0 &= 67108863, lo = Math.imul(al1, bl0), mid = Math.imul(al1, bh0), mid = mid + Math.imul(ah1, bl0) | 0, hi = Math.imul(ah1, bh0), lo = lo + Math.imul(al0, bl1) | 0, mid = mid + Math.imul(al0, bh1) | 0, mid = mid + Math.imul(ah0, bl1) | 0, hi = hi + Math.imul(ah0, bh1) | 0;
        var w1 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0, w1 &= 67108863, lo = Math.imul(al2, bl0), mid = Math.imul(al2, bh0), mid = mid + Math.imul(ah2, bl0) | 0, hi = Math.imul(ah2, bh0), lo = lo + Math.imul(al1, bl1) | 0, mid = mid + Math.imul(al1, bh1) | 0, mid = mid + Math.imul(ah1, bl1) | 0, hi = hi + Math.imul(ah1, bh1) | 0, lo = lo + Math.imul(al0, bl2) | 0, mid = mid + Math.imul(al0, bh2) | 0, mid = mid + Math.imul(ah0, bl2) | 0, hi = hi + Math.imul(ah0, bh2) | 0;
        var w2 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0, w2 &= 67108863, lo = Math.imul(al3, bl0), mid = Math.imul(al3, bh0), mid = mid + Math.imul(ah3, bl0) | 0, hi = Math.imul(ah3, bh0), lo = lo + Math.imul(al2, bl1) | 0, mid = mid + Math.imul(al2, bh1) | 0, mid = mid + Math.imul(ah2, bl1) | 0, hi = hi + Math.imul(ah2, bh1) | 0, lo = lo + Math.imul(al1, bl2) | 0, mid = mid + Math.imul(al1, bh2) | 0, mid = mid + Math.imul(ah1, bl2) | 0, hi = hi + Math.imul(ah1, bh2) | 0, lo = lo + Math.imul(al0, bl3) | 0, mid = mid + Math.imul(al0, bh3) | 0, mid = mid + Math.imul(ah0, bl3) | 0, hi = hi + Math.imul(ah0, bh3) | 0;
        var w3 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0, w3 &= 67108863, lo = Math.imul(al4, bl0), mid = Math.imul(al4, bh0), mid = mid + Math.imul(ah4, bl0) | 0, hi = Math.imul(ah4, bh0), lo = lo + Math.imul(al3, bl1) | 0, mid = mid + Math.imul(al3, bh1) | 0, mid = mid + Math.imul(ah3, bl1) | 0, hi = hi + Math.imul(ah3, bh1) | 0, lo = lo + Math.imul(al2, bl2) | 0, mid = mid + Math.imul(al2, bh2) | 0, mid = mid + Math.imul(ah2, bl2) | 0, hi = hi + Math.imul(ah2, bh2) | 0, lo = lo + Math.imul(al1, bl3) | 0, mid = mid + Math.imul(al1, bh3) | 0, mid = mid + Math.imul(ah1, bl3) | 0, hi = hi + Math.imul(ah1, bh3) | 0, lo = lo + Math.imul(al0, bl4) | 0, mid = mid + Math.imul(al0, bh4) | 0, mid = mid + Math.imul(ah0, bl4) | 0, hi = hi + Math.imul(ah0, bh4) | 0;
        var w4 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0, w4 &= 67108863, lo = Math.imul(al5, bl0), mid = Math.imul(al5, bh0), mid = mid + Math.imul(ah5, bl0) | 0, hi = Math.imul(ah5, bh0), lo = lo + Math.imul(al4, bl1) | 0, mid = mid + Math.imul(al4, bh1) | 0, mid = mid + Math.imul(ah4, bl1) | 0, hi = hi + Math.imul(ah4, bh1) | 0, lo = lo + Math.imul(al3, bl2) | 0, mid = mid + Math.imul(al3, bh2) | 0, mid = mid + Math.imul(ah3, bl2) | 0, hi = hi + Math.imul(ah3, bh2) | 0, lo = lo + Math.imul(al2, bl3) | 0, mid = mid + Math.imul(al2, bh3) | 0, mid = mid + Math.imul(ah2, bl3) | 0, hi = hi + Math.imul(ah2, bh3) | 0, lo = lo + Math.imul(al1, bl4) | 0, mid = mid + Math.imul(al1, bh4) | 0, mid = mid + Math.imul(ah1, bl4) | 0, hi = hi + Math.imul(ah1, bh4) | 0, lo = lo + Math.imul(al0, bl5) | 0, mid = mid + Math.imul(al0, bh5) | 0, mid = mid + Math.imul(ah0, bl5) | 0, hi = hi + Math.imul(ah0, bh5) | 0;
        var w5 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0, w5 &= 67108863, lo = Math.imul(al6, bl0), mid = Math.imul(al6, bh0), mid = mid + Math.imul(ah6, bl0) | 0, hi = Math.imul(ah6, bh0), lo = lo + Math.imul(al5, bl1) | 0, mid = mid + Math.imul(al5, bh1) | 0, mid = mid + Math.imul(ah5, bl1) | 0, hi = hi + Math.imul(ah5, bh1) | 0, lo = lo + Math.imul(al4, bl2) | 0, mid = mid + Math.imul(al4, bh2) | 0, mid = mid + Math.imul(ah4, bl2) | 0, hi = hi + Math.imul(ah4, bh2) | 0, lo = lo + Math.imul(al3, bl3) | 0, mid = mid + Math.imul(al3, bh3) | 0, mid = mid + Math.imul(ah3, bl3) | 0, hi = hi + Math.imul(ah3, bh3) | 0, lo = lo + Math.imul(al2, bl4) | 0, mid = mid + Math.imul(al2, bh4) | 0, mid = mid + Math.imul(ah2, bl4) | 0, hi = hi + Math.imul(ah2, bh4) | 0, lo = lo + Math.imul(al1, bl5) | 0, mid = mid + Math.imul(al1, bh5) | 0, mid = mid + Math.imul(ah1, bl5) | 0, hi = hi + Math.imul(ah1, bh5) | 0, lo = lo + Math.imul(al0, bl6) | 0, mid = mid + Math.imul(al0, bh6) | 0, mid = mid + Math.imul(ah0, bl6) | 0, hi = hi + Math.imul(ah0, bh6) | 0;
        var w6 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0, w6 &= 67108863, lo = Math.imul(al7, bl0), mid = Math.imul(al7, bh0), mid = mid + Math.imul(ah7, bl0) | 0, hi = Math.imul(ah7, bh0), lo = lo + Math.imul(al6, bl1) | 0, mid = mid + Math.imul(al6, bh1) | 0, mid = mid + Math.imul(ah6, bl1) | 0, hi = hi + Math.imul(ah6, bh1) | 0, lo = lo + Math.imul(al5, bl2) | 0, mid = mid + Math.imul(al5, bh2) | 0, mid = mid + Math.imul(ah5, bl2) | 0, hi = hi + Math.imul(ah5, bh2) | 0, lo = lo + Math.imul(al4, bl3) | 0, mid = mid + Math.imul(al4, bh3) | 0, mid = mid + Math.imul(ah4, bl3) | 0, hi = hi + Math.imul(ah4, bh3) | 0, lo = lo + Math.imul(al3, bl4) | 0, mid = mid + Math.imul(al3, bh4) | 0, mid = mid + Math.imul(ah3, bl4) | 0, hi = hi + Math.imul(ah3, bh4) | 0, lo = lo + Math.imul(al2, bl5) | 0, mid = mid + Math.imul(al2, bh5) | 0, mid = mid + Math.imul(ah2, bl5) | 0, hi = hi + Math.imul(ah2, bh5) | 0, lo = lo + Math.imul(al1, bl6) | 0, mid = mid + Math.imul(al1, bh6) | 0, mid = mid + Math.imul(ah1, bl6) | 0, hi = hi + Math.imul(ah1, bh6) | 0, lo = lo + Math.imul(al0, bl7) | 0, mid = mid + Math.imul(al0, bh7) | 0, mid = mid + Math.imul(ah0, bl7) | 0, hi = hi + Math.imul(ah0, bh7) | 0;
        var w7 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0, w7 &= 67108863, lo = Math.imul(al8, bl0), mid = Math.imul(al8, bh0), mid = mid + Math.imul(ah8, bl0) | 0, hi = Math.imul(ah8, bh0), lo = lo + Math.imul(al7, bl1) | 0, mid = mid + Math.imul(al7, bh1) | 0, mid = mid + Math.imul(ah7, bl1) | 0, hi = hi + Math.imul(ah7, bh1) | 0, lo = lo + Math.imul(al6, bl2) | 0, mid = mid + Math.imul(al6, bh2) | 0, mid = mid + Math.imul(ah6, bl2) | 0, hi = hi + Math.imul(ah6, bh2) | 0, lo = lo + Math.imul(al5, bl3) | 0, mid = mid + Math.imul(al5, bh3) | 0, mid = mid + Math.imul(ah5, bl3) | 0, hi = hi + Math.imul(ah5, bh3) | 0, lo = lo + Math.imul(al4, bl4) | 0, mid = mid + Math.imul(al4, bh4) | 0, mid = mid + Math.imul(ah4, bl4) | 0, hi = hi + Math.imul(ah4, bh4) | 0, lo = lo + Math.imul(al3, bl5) | 0, mid = mid + Math.imul(al3, bh5) | 0, mid = mid + Math.imul(ah3, bl5) | 0, hi = hi + Math.imul(ah3, bh5) | 0, lo = lo + Math.imul(al2, bl6) | 0, mid = mid + Math.imul(al2, bh6) | 0, mid = mid + Math.imul(ah2, bl6) | 0, hi = hi + Math.imul(ah2, bh6) | 0, lo = lo + Math.imul(al1, bl7) | 0, mid = mid + Math.imul(al1, bh7) | 0, mid = mid + Math.imul(ah1, bl7) | 0, hi = hi + Math.imul(ah1, bh7) | 0, lo = lo + Math.imul(al0, bl8) | 0, mid = mid + Math.imul(al0, bh8) | 0, mid = mid + Math.imul(ah0, bl8) | 0, hi = hi + Math.imul(ah0, bh8) | 0;
        var w8 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0, w8 &= 67108863, lo = Math.imul(al9, bl0), mid = Math.imul(al9, bh0), mid = mid + Math.imul(ah9, bl0) | 0, hi = Math.imul(ah9, bh0), lo = lo + Math.imul(al8, bl1) | 0, mid = mid + Math.imul(al8, bh1) | 0, mid = mid + Math.imul(ah8, bl1) | 0, hi = hi + Math.imul(ah8, bh1) | 0, lo = lo + Math.imul(al7, bl2) | 0, mid = mid + Math.imul(al7, bh2) | 0, mid = mid + Math.imul(ah7, bl2) | 0, hi = hi + Math.imul(ah7, bh2) | 0, lo = lo + Math.imul(al6, bl3) | 0, mid = mid + Math.imul(al6, bh3) | 0, mid = mid + Math.imul(ah6, bl3) | 0, hi = hi + Math.imul(ah6, bh3) | 0, lo = lo + Math.imul(al5, bl4) | 0, mid = mid + Math.imul(al5, bh4) | 0, mid = mid + Math.imul(ah5, bl4) | 0, hi = hi + Math.imul(ah5, bh4) | 0, lo = lo + Math.imul(al4, bl5) | 0, mid = mid + Math.imul(al4, bh5) | 0, mid = mid + Math.imul(ah4, bl5) | 0, hi = hi + Math.imul(ah4, bh5) | 0, lo = lo + Math.imul(al3, bl6) | 0, mid = mid + Math.imul(al3, bh6) | 0, mid = mid + Math.imul(ah3, bl6) | 0, hi = hi + Math.imul(ah3, bh6) | 0, lo = lo + Math.imul(al2, bl7) | 0, mid = mid + Math.imul(al2, bh7) | 0, mid = mid + Math.imul(ah2, bl7) | 0, hi = hi + Math.imul(ah2, bh7) | 0, lo = lo + Math.imul(al1, bl8) | 0, mid = mid + Math.imul(al1, bh8) | 0, mid = mid + Math.imul(ah1, bl8) | 0, hi = hi + Math.imul(ah1, bh8) | 0, lo = lo + Math.imul(al0, bl9) | 0, mid = mid + Math.imul(al0, bh9) | 0, mid = mid + Math.imul(ah0, bl9) | 0, hi = hi + Math.imul(ah0, bh9) | 0;
        var w9 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0, w9 &= 67108863, lo = Math.imul(al9, bl1), mid = Math.imul(al9, bh1), mid = mid + Math.imul(ah9, bl1) | 0, hi = Math.imul(ah9, bh1), lo = lo + Math.imul(al8, bl2) | 0, mid = mid + Math.imul(al8, bh2) | 0, mid = mid + Math.imul(ah8, bl2) | 0, hi = hi + Math.imul(ah8, bh2) | 0, lo = lo + Math.imul(al7, bl3) | 0, mid = mid + Math.imul(al7, bh3) | 0, mid = mid + Math.imul(ah7, bl3) | 0, hi = hi + Math.imul(ah7, bh3) | 0, lo = lo + Math.imul(al6, bl4) | 0, mid = mid + Math.imul(al6, bh4) | 0, mid = mid + Math.imul(ah6, bl4) | 0, hi = hi + Math.imul(ah6, bh4) | 0, lo = lo + Math.imul(al5, bl5) | 0, mid = mid + Math.imul(al5, bh5) | 0, mid = mid + Math.imul(ah5, bl5) | 0, hi = hi + Math.imul(ah5, bh5) | 0, lo = lo + Math.imul(al4, bl6) | 0, mid = mid + Math.imul(al4, bh6) | 0, mid = mid + Math.imul(ah4, bl6) | 0, hi = hi + Math.imul(ah4, bh6) | 0, lo = lo + Math.imul(al3, bl7) | 0, mid = mid + Math.imul(al3, bh7) | 0, mid = mid + Math.imul(ah3, bl7) | 0, hi = hi + Math.imul(ah3, bh7) | 0, lo = lo + Math.imul(al2, bl8) | 0, mid = mid + Math.imul(al2, bh8) | 0, mid = mid + Math.imul(ah2, bl8) | 0, hi = hi + Math.imul(ah2, bh8) | 0, lo = lo + Math.imul(al1, bl9) | 0, mid = mid + Math.imul(al1, bh9) | 0, mid = mid + Math.imul(ah1, bl9) | 0, hi = hi + Math.imul(ah1, bh9) | 0;
        var w10 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0, w10 &= 67108863, lo = Math.imul(al9, bl2), mid = Math.imul(al9, bh2), mid = mid + Math.imul(ah9, bl2) | 0, hi = Math.imul(ah9, bh2), lo = lo + Math.imul(al8, bl3) | 0, mid = mid + Math.imul(al8, bh3) | 0, mid = mid + Math.imul(ah8, bl3) | 0, hi = hi + Math.imul(ah8, bh3) | 0, lo = lo + Math.imul(al7, bl4) | 0, mid = mid + Math.imul(al7, bh4) | 0, mid = mid + Math.imul(ah7, bl4) | 0, hi = hi + Math.imul(ah7, bh4) | 0, lo = lo + Math.imul(al6, bl5) | 0, mid = mid + Math.imul(al6, bh5) | 0, mid = mid + Math.imul(ah6, bl5) | 0, hi = hi + Math.imul(ah6, bh5) | 0, lo = lo + Math.imul(al5, bl6) | 0, mid = mid + Math.imul(al5, bh6) | 0, mid = mid + Math.imul(ah5, bl6) | 0, hi = hi + Math.imul(ah5, bh6) | 0, lo = lo + Math.imul(al4, bl7) | 0, mid = mid + Math.imul(al4, bh7) | 0, mid = mid + Math.imul(ah4, bl7) | 0, hi = hi + Math.imul(ah4, bh7) | 0, lo = lo + Math.imul(al3, bl8) | 0, mid = mid + Math.imul(al3, bh8) | 0, mid = mid + Math.imul(ah3, bl8) | 0, hi = hi + Math.imul(ah3, bh8) | 0, lo = lo + Math.imul(al2, bl9) | 0, mid = mid + Math.imul(al2, bh9) | 0, mid = mid + Math.imul(ah2, bl9) | 0, hi = hi + Math.imul(ah2, bh9) | 0;
        var w11 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0, w11 &= 67108863, lo = Math.imul(al9, bl3), mid = Math.imul(al9, bh3), mid = mid + Math.imul(ah9, bl3) | 0, hi = Math.imul(ah9, bh3), lo = lo + Math.imul(al8, bl4) | 0, mid = mid + Math.imul(al8, bh4) | 0, mid = mid + Math.imul(ah8, bl4) | 0, hi = hi + Math.imul(ah8, bh4) | 0, lo = lo + Math.imul(al7, bl5) | 0, mid = mid + Math.imul(al7, bh5) | 0, mid = mid + Math.imul(ah7, bl5) | 0, hi = hi + Math.imul(ah7, bh5) | 0, lo = lo + Math.imul(al6, bl6) | 0, mid = mid + Math.imul(al6, bh6) | 0, mid = mid + Math.imul(ah6, bl6) | 0, hi = hi + Math.imul(ah6, bh6) | 0, lo = lo + Math.imul(al5, bl7) | 0, mid = mid + Math.imul(al5, bh7) | 0, mid = mid + Math.imul(ah5, bl7) | 0, hi = hi + Math.imul(ah5, bh7) | 0, lo = lo + Math.imul(al4, bl8) | 0, mid = mid + Math.imul(al4, bh8) | 0, mid = mid + Math.imul(ah4, bl8) | 0, hi = hi + Math.imul(ah4, bh8) | 0, lo = lo + Math.imul(al3, bl9) | 0, mid = mid + Math.imul(al3, bh9) | 0, mid = mid + Math.imul(ah3, bl9) | 0, hi = hi + Math.imul(ah3, bh9) | 0;
        var w12 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0, w12 &= 67108863, lo = Math.imul(al9, bl4), mid = Math.imul(al9, bh4), mid = mid + Math.imul(ah9, bl4) | 0, hi = Math.imul(ah9, bh4), lo = lo + Math.imul(al8, bl5) | 0, mid = mid + Math.imul(al8, bh5) | 0, mid = mid + Math.imul(ah8, bl5) | 0, hi = hi + Math.imul(ah8, bh5) | 0, lo = lo + Math.imul(al7, bl6) | 0, mid = mid + Math.imul(al7, bh6) | 0, mid = mid + Math.imul(ah7, bl6) | 0, hi = hi + Math.imul(ah7, bh6) | 0, lo = lo + Math.imul(al6, bl7) | 0, mid = mid + Math.imul(al6, bh7) | 0, mid = mid + Math.imul(ah6, bl7) | 0, hi = hi + Math.imul(ah6, bh7) | 0, lo = lo + Math.imul(al5, bl8) | 0, mid = mid + Math.imul(al5, bh8) | 0, mid = mid + Math.imul(ah5, bl8) | 0, hi = hi + Math.imul(ah5, bh8) | 0, lo = lo + Math.imul(al4, bl9) | 0, mid = mid + Math.imul(al4, bh9) | 0, mid = mid + Math.imul(ah4, bl9) | 0, hi = hi + Math.imul(ah4, bh9) | 0;
        var w13 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0, w13 &= 67108863, lo = Math.imul(al9, bl5), mid = Math.imul(al9, bh5), mid = mid + Math.imul(ah9, bl5) | 0, hi = Math.imul(ah9, bh5), lo = lo + Math.imul(al8, bl6) | 0, mid = mid + Math.imul(al8, bh6) | 0, mid = mid + Math.imul(ah8, bl6) | 0, hi = hi + Math.imul(ah8, bh6) | 0, lo = lo + Math.imul(al7, bl7) | 0, mid = mid + Math.imul(al7, bh7) | 0, mid = mid + Math.imul(ah7, bl7) | 0, hi = hi + Math.imul(ah7, bh7) | 0, lo = lo + Math.imul(al6, bl8) | 0, mid = mid + Math.imul(al6, bh8) | 0, mid = mid + Math.imul(ah6, bl8) | 0, hi = hi + Math.imul(ah6, bh8) | 0, lo = lo + Math.imul(al5, bl9) | 0, mid = mid + Math.imul(al5, bh9) | 0, mid = mid + Math.imul(ah5, bl9) | 0, hi = hi + Math.imul(ah5, bh9) | 0;
        var w14 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0, w14 &= 67108863, lo = Math.imul(al9, bl6), mid = Math.imul(al9, bh6), mid = mid + Math.imul(ah9, bl6) | 0, hi = Math.imul(ah9, bh6), lo = lo + Math.imul(al8, bl7) | 0, mid = mid + Math.imul(al8, bh7) | 0, mid = mid + Math.imul(ah8, bl7) | 0, hi = hi + Math.imul(ah8, bh7) | 0, lo = lo + Math.imul(al7, bl8) | 0, mid = mid + Math.imul(al7, bh8) | 0, mid = mid + Math.imul(ah7, bl8) | 0, hi = hi + Math.imul(ah7, bh8) | 0, lo = lo + Math.imul(al6, bl9) | 0, mid = mid + Math.imul(al6, bh9) | 0, mid = mid + Math.imul(ah6, bl9) | 0, hi = hi + Math.imul(ah6, bh9) | 0;
        var w15 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0, w15 &= 67108863, lo = Math.imul(al9, bl7), mid = Math.imul(al9, bh7), mid = mid + Math.imul(ah9, bl7) | 0, hi = Math.imul(ah9, bh7), lo = lo + Math.imul(al8, bl8) | 0, mid = mid + Math.imul(al8, bh8) | 0, mid = mid + Math.imul(ah8, bl8) | 0, hi = hi + Math.imul(ah8, bh8) | 0, lo = lo + Math.imul(al7, bl9) | 0, mid = mid + Math.imul(al7, bh9) | 0, mid = mid + Math.imul(ah7, bl9) | 0, hi = hi + Math.imul(ah7, bh9) | 0;
        var w16 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0, w16 &= 67108863, lo = Math.imul(al9, bl8), mid = Math.imul(al9, bh8), mid = mid + Math.imul(ah9, bl8) | 0, hi = Math.imul(ah9, bh8), lo = lo + Math.imul(al8, bl9) | 0, mid = mid + Math.imul(al8, bh9) | 0, mid = mid + Math.imul(ah8, bl9) | 0, hi = hi + Math.imul(ah8, bh9) | 0;
        var w17 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0, w17 &= 67108863, lo = Math.imul(al9, bl9), mid = Math.imul(al9, bh9), mid = mid + Math.imul(ah9, bl9) | 0, hi = Math.imul(ah9, bh9);
        var w18 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        if (c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0, w18 &= 67108863, o[0] = w0, o[1] = w1, o[2] = w2, o[3] = w3, o[4] = w4, o[5] = w5, o[6] = w6, o[7] = w7, o[8] = w8, o[9] = w9, o[10] = w10, o[11] = w11, o[12] = w12, o[13] = w13, o[14] = w14, o[15] = w15, o[16] = w16, o[17] = w17, o[18] = w18, c !== 0)
          o[19] = c, out.length++;
        return out;
      };
      if (!Math.imul)
        comb10MulTo = smallMulTo;
      function bigMulTo(self2, num, out) {
        out.negative = num.negative ^ self2.negative, out.length = self2.length + num.length;
        var carry = 0, hncarry = 0;
        for (var k = 0;k < out.length - 1; k++) {
          var ncarry = hncarry;
          hncarry = 0;
          var rword = carry & 67108863, maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self2.length + 1);j <= maxJ; j++) {
            var i2 = k - j, a = self2.words[i2] | 0, b = num.words[j] | 0, r = a * b, lo = r & 67108863;
            ncarry = ncarry + (r / 67108864 | 0) | 0, lo = lo + rword | 0, rword = lo & 67108863, ncarry = ncarry + (lo >>> 26) | 0, hncarry += ncarry >>> 26, ncarry &= 67108863;
          }
          out.words[k] = rword, carry = ncarry, ncarry = hncarry;
        }
        if (carry !== 0)
          out.words[k] = carry;
        else
          out.length--;
        return out.strip();
      }
      function jumboMulTo(self2, num, out) {
        var fftm = new FFTM;
        return fftm.mulp(self2, num, out);
      }
      BN.prototype.mulTo = function mulTo(num, out) {
        var res, len2 = this.length + num.length;
        if (this.length === 10 && num.length === 10)
          res = comb10MulTo(this, num, out);
        else if (len2 < 63)
          res = smallMulTo(this, num, out);
        else if (len2 < 1024)
          res = bigMulTo(this, num, out);
        else
          res = jumboMulTo(this, num, out);
        return res;
      };
      function FFTM(x, y) {
        this.x = x, this.y = y;
      }
      FFTM.prototype.makeRBT = function makeRBT(N) {
        var t = new Array(N), l = BN.prototype._countBits(N) - 1;
        for (var i2 = 0;i2 < N; i2++)
          t[i2] = this.revBin(i2, l, N);
        return t;
      }, FFTM.prototype.revBin = function revBin(x, l, N) {
        if (x === 0 || x === N - 1)
          return x;
        var rb = 0;
        for (var i2 = 0;i2 < l; i2++)
          rb |= (x & 1) << l - i2 - 1, x >>= 1;
        return rb;
      }, FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
        for (var i2 = 0;i2 < N; i2++)
          rtws[i2] = rws[rbt[i2]], itws[i2] = iws[rbt[i2]];
      }, FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
        this.permute(rbt, rws, iws, rtws, itws, N);
        for (var s = 1;s < N; s <<= 1) {
          var l = s << 1, rtwdf = Math.cos(2 * Math.PI / l), itwdf = Math.sin(2 * Math.PI / l);
          for (var p = 0;p < N; p += l) {
            var rtwdf_ = rtwdf, itwdf_ = itwdf;
            for (var j = 0;j < s; j++) {
              var re = rtws[p + j], ie = itws[p + j], ro = rtws[p + j + s], io = itws[p + j + s], rx = rtwdf_ * ro - itwdf_ * io;
              if (io = rtwdf_ * io + itwdf_ * ro, ro = rx, rtws[p + j] = re + ro, itws[p + j] = ie + io, rtws[p + j + s] = re - ro, itws[p + j + s] = ie - io, j !== l)
                rx = rtwdf * rtwdf_ - itwdf * itwdf_, itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_, rtwdf_ = rx;
            }
          }
        }
      }, FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
        var N = Math.max(m, n) | 1, odd = N & 1, i2 = 0;
        for (N = N / 2 | 0;N; N = N >>> 1)
          i2++;
        return 1 << i2 + 1 + odd;
      }, FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
        if (N <= 1)
          return;
        for (var i2 = 0;i2 < N / 2; i2++) {
          var t = rws[i2];
          rws[i2] = rws[N - i2 - 1], rws[N - i2 - 1] = t, t = iws[i2], iws[i2] = -iws[N - i2 - 1], iws[N - i2 - 1] = -t;
        }
      }, FFTM.prototype.normalize13b = function normalize13b(ws, N) {
        var carry = 0;
        for (var i2 = 0;i2 < N / 2; i2++) {
          var w = Math.round(ws[2 * i2 + 1] / N) * 8192 + Math.round(ws[2 * i2] / N) + carry;
          if (ws[i2] = w & 67108863, w < 67108864)
            carry = 0;
          else
            carry = w / 67108864 | 0;
        }
        return ws;
      }, FFTM.prototype.convert13b = function convert13b(ws, len2, rws, N) {
        var carry = 0;
        for (var i2 = 0;i2 < len2; i2++)
          carry = carry + (ws[i2] | 0), rws[2 * i2] = carry & 8191, carry = carry >>> 13, rws[2 * i2 + 1] = carry & 8191, carry = carry >>> 13;
        for (i2 = 2 * len2;i2 < N; ++i2)
          rws[i2] = 0;
        assert(carry === 0), assert((carry & -8192) === 0);
      }, FFTM.prototype.stub = function stub(N) {
        var ph = new Array(N);
        for (var i2 = 0;i2 < N; i2++)
          ph[i2] = 0;
        return ph;
      }, FFTM.prototype.mulp = function mulp(x, y, out) {
        var N = 2 * this.guessLen13b(x.length, y.length), rbt = this.makeRBT(N), _ = this.stub(N), rws = new Array(N), rwst = new Array(N), iwst = new Array(N), nrws = new Array(N), nrwst = new Array(N), niwst = new Array(N), rmws = out.words;
        rmws.length = N, this.convert13b(x.words, x.length, rws, N), this.convert13b(y.words, y.length, nrws, N), this.transform(rws, _, rwst, iwst, N, rbt), this.transform(nrws, _, nrwst, niwst, N, rbt);
        for (var i2 = 0;i2 < N; i2++) {
          var rx = rwst[i2] * nrwst[i2] - iwst[i2] * niwst[i2];
          iwst[i2] = rwst[i2] * niwst[i2] + iwst[i2] * nrwst[i2], rwst[i2] = rx;
        }
        return this.conjugate(rwst, iwst, N), this.transform(rwst, iwst, rmws, _, N, rbt), this.conjugate(rmws, _, N), this.normalize13b(rmws, N), out.negative = x.negative ^ y.negative, out.length = x.length + y.length, out.strip();
      }, BN.prototype.mul = function mul(num) {
        var out = new BN(null);
        return out.words = new Array(this.length + num.length), this.mulTo(num, out);
      }, BN.prototype.mulf = function mulf(num) {
        var out = new BN(null);
        return out.words = new Array(this.length + num.length), jumboMulTo(this, num, out);
      }, BN.prototype.imul = function imul(num) {
        return this.clone().mulTo(num, this);
      }, BN.prototype.imuln = function imuln(num) {
        assert(typeof num === "number"), assert(num < 67108864);
        var carry = 0;
        for (var i2 = 0;i2 < this.length; i2++) {
          var w = (this.words[i2] | 0) * num, lo = (w & 67108863) + (carry & 67108863);
          carry >>= 26, carry += w / 67108864 | 0, carry += lo >>> 26, this.words[i2] = lo & 67108863;
        }
        if (carry !== 0)
          this.words[i2] = carry, this.length++;
        return this.length = num === 0 ? 1 : this.length, this;
      }, BN.prototype.muln = function muln(num) {
        return this.clone().imuln(num);
      }, BN.prototype.sqr = function sqr() {
        return this.mul(this);
      }, BN.prototype.isqr = function isqr() {
        return this.imul(this.clone());
      }, BN.prototype.pow = function pow(num) {
        var w = toBitArray(num);
        if (w.length === 0)
          return new BN(1);
        var res = this;
        for (var i2 = 0;i2 < w.length; i2++, res = res.sqr())
          if (w[i2] !== 0)
            break;
        if (++i2 < w.length)
          for (var q = res.sqr();i2 < w.length; i2++, q = q.sqr()) {
            if (w[i2] === 0)
              continue;
            res = res.mul(q);
          }
        return res;
      }, BN.prototype.iushln = function iushln(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26, s = (bits - r) / 26, carryMask = 67108863 >>> 26 - r << 26 - r, i2;
        if (r !== 0) {
          var carry = 0;
          for (i2 = 0;i2 < this.length; i2++) {
            var newCarry = this.words[i2] & carryMask, c = (this.words[i2] | 0) - newCarry << r;
            this.words[i2] = c | carry, carry = newCarry >>> 26 - r;
          }
          if (carry)
            this.words[i2] = carry, this.length++;
        }
        if (s !== 0) {
          for (i2 = this.length - 1;i2 >= 0; i2--)
            this.words[i2 + s] = this.words[i2];
          for (i2 = 0;i2 < s; i2++)
            this.words[i2] = 0;
          this.length += s;
        }
        return this.strip();
      }, BN.prototype.ishln = function ishln(bits) {
        return assert(this.negative === 0), this.iushln(bits);
      }, BN.prototype.iushrn = function iushrn(bits, hint, extended) {
        assert(typeof bits === "number" && bits >= 0);
        var h;
        if (hint)
          h = (hint - hint % 26) / 26;
        else
          h = 0;
        var r = bits % 26, s = Math.min((bits - r) / 26, this.length), mask = 67108863 ^ 67108863 >>> r << r, maskedWords = extended;
        if (h -= s, h = Math.max(0, h), maskedWords) {
          for (var i2 = 0;i2 < s; i2++)
            maskedWords.words[i2] = this.words[i2];
          maskedWords.length = s;
        }
        if (s === 0)
          ;
        else if (this.length > s) {
          this.length -= s;
          for (i2 = 0;i2 < this.length; i2++)
            this.words[i2] = this.words[i2 + s];
        } else
          this.words[0] = 0, this.length = 1;
        var carry = 0;
        for (i2 = this.length - 1;i2 >= 0 && (carry !== 0 || i2 >= h); i2--) {
          var word = this.words[i2] | 0;
          this.words[i2] = carry << 26 - r | word >>> r, carry = word & mask;
        }
        if (maskedWords && carry !== 0)
          maskedWords.words[maskedWords.length++] = carry;
        if (this.length === 0)
          this.words[0] = 0, this.length = 1;
        return this.strip();
      }, BN.prototype.ishrn = function ishrn(bits, hint, extended) {
        return assert(this.negative === 0), this.iushrn(bits, hint, extended);
      }, BN.prototype.shln = function shln(bits) {
        return this.clone().ishln(bits);
      }, BN.prototype.ushln = function ushln(bits) {
        return this.clone().iushln(bits);
      }, BN.prototype.shrn = function shrn(bits) {
        return this.clone().ishrn(bits);
      }, BN.prototype.ushrn = function ushrn(bits) {
        return this.clone().iushrn(bits);
      }, BN.prototype.testn = function testn(bit) {
        assert(typeof bit === "number" && bit >= 0);
        var r = bit % 26, s = (bit - r) / 26, q = 1 << r;
        if (this.length <= s)
          return false;
        var w = this.words[s];
        return !!(w & q);
      }, BN.prototype.imaskn = function imaskn(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26, s = (bits - r) / 26;
        if (assert(this.negative === 0, "imaskn works only with positive numbers"), this.length <= s)
          return this;
        if (r !== 0)
          s++;
        if (this.length = Math.min(s, this.length), r !== 0) {
          var mask = 67108863 ^ 67108863 >>> r << r;
          this.words[this.length - 1] &= mask;
        }
        return this.strip();
      }, BN.prototype.maskn = function maskn(bits) {
        return this.clone().imaskn(bits);
      }, BN.prototype.iaddn = function iaddn(num) {
        if (assert(typeof num === "number"), assert(num < 67108864), num < 0)
          return this.isubn(-num);
        if (this.negative !== 0) {
          if (this.length === 1 && (this.words[0] | 0) < num)
            return this.words[0] = num - (this.words[0] | 0), this.negative = 0, this;
          return this.negative = 0, this.isubn(num), this.negative = 1, this;
        }
        return this._iaddn(num);
      }, BN.prototype._iaddn = function _iaddn(num) {
        this.words[0] += num;
        for (var i2 = 0;i2 < this.length && this.words[i2] >= 67108864; i2++)
          if (this.words[i2] -= 67108864, i2 === this.length - 1)
            this.words[i2 + 1] = 1;
          else
            this.words[i2 + 1]++;
        return this.length = Math.max(this.length, i2 + 1), this;
      }, BN.prototype.isubn = function isubn(num) {
        if (assert(typeof num === "number"), assert(num < 67108864), num < 0)
          return this.iaddn(-num);
        if (this.negative !== 0)
          return this.negative = 0, this.iaddn(num), this.negative = 1, this;
        if (this.words[0] -= num, this.length === 1 && this.words[0] < 0)
          this.words[0] = -this.words[0], this.negative = 1;
        else
          for (var i2 = 0;i2 < this.length && this.words[i2] < 0; i2++)
            this.words[i2] += 67108864, this.words[i2 + 1] -= 1;
        return this.strip();
      }, BN.prototype.addn = function addn(num) {
        return this.clone().iaddn(num);
      }, BN.prototype.subn = function subn(num) {
        return this.clone().isubn(num);
      }, BN.prototype.iabs = function iabs() {
        return this.negative = 0, this;
      }, BN.prototype.abs = function abs() {
        return this.clone().iabs();
      }, BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
        var len2 = num.length + shift, i2;
        this._expand(len2);
        var w, carry = 0;
        for (i2 = 0;i2 < num.length; i2++) {
          w = (this.words[i2 + shift] | 0) + carry;
          var right = (num.words[i2] | 0) * mul;
          w -= right & 67108863, carry = (w >> 26) - (right / 67108864 | 0), this.words[i2 + shift] = w & 67108863;
        }
        for (;i2 < this.length - shift; i2++)
          w = (this.words[i2 + shift] | 0) + carry, carry = w >> 26, this.words[i2 + shift] = w & 67108863;
        if (carry === 0)
          return this.strip();
        assert(carry === -1), carry = 0;
        for (i2 = 0;i2 < this.length; i2++)
          w = -(this.words[i2] | 0) + carry, carry = w >> 26, this.words[i2] = w & 67108863;
        return this.negative = 1, this.strip();
      }, BN.prototype._wordDiv = function _wordDiv(num, mode) {
        var shift = this.length - num.length, a = this.clone(), b = num, bhi = b.words[b.length - 1] | 0, bhiBits = this._countBits(bhi);
        if (shift = 26 - bhiBits, shift !== 0)
          b = b.ushln(shift), a.iushln(shift), bhi = b.words[b.length - 1] | 0;
        var m = a.length - b.length, q;
        if (mode !== "mod") {
          q = new BN(null), q.length = m + 1, q.words = new Array(q.length);
          for (var i2 = 0;i2 < q.length; i2++)
            q.words[i2] = 0;
        }
        var diff = a.clone()._ishlnsubmul(b, 1, m);
        if (diff.negative === 0) {
          if (a = diff, q)
            q.words[m] = 1;
        }
        for (var j = m - 1;j >= 0; j--) {
          var qj = (a.words[b.length + j] | 0) * 67108864 + (a.words[b.length + j - 1] | 0);
          qj = Math.min(qj / bhi | 0, 67108863), a._ishlnsubmul(b, qj, j);
          while (a.negative !== 0)
            if (qj--, a.negative = 0, a._ishlnsubmul(b, 1, j), !a.isZero())
              a.negative ^= 1;
          if (q)
            q.words[j] = qj;
        }
        if (q)
          q.strip();
        if (a.strip(), mode !== "div" && shift !== 0)
          a.iushrn(shift);
        return { div: q || null, mod: a };
      }, BN.prototype.divmod = function divmod(num, mode, positive) {
        if (assert(!num.isZero()), this.isZero())
          return { div: new BN(0), mod: new BN(0) };
        var div, mod, res;
        if (this.negative !== 0 && num.negative === 0) {
          if (res = this.neg().divmod(num, mode), mode !== "mod")
            div = res.div.neg();
          if (mode !== "div") {
            if (mod = res.mod.neg(), positive && mod.negative !== 0)
              mod.iadd(num);
          }
          return { div, mod };
        }
        if (this.negative === 0 && num.negative !== 0) {
          if (res = this.divmod(num.neg(), mode), mode !== "mod")
            div = res.div.neg();
          return { div, mod: res.mod };
        }
        if ((this.negative & num.negative) !== 0) {
          if (res = this.neg().divmod(num.neg(), mode), mode !== "div") {
            if (mod = res.mod.neg(), positive && mod.negative !== 0)
              mod.isub(num);
          }
          return { div: res.div, mod };
        }
        if (num.length > this.length || this.cmp(num) < 0)
          return { div: new BN(0), mod: this };
        if (num.length === 1) {
          if (mode === "div")
            return { div: this.divn(num.words[0]), mod: null };
          if (mode === "mod")
            return { div: null, mod: new BN(this.modn(num.words[0])) };
          return { div: this.divn(num.words[0]), mod: new BN(this.modn(num.words[0])) };
        }
        return this._wordDiv(num, mode);
      }, BN.prototype.div = function div(num) {
        return this.divmod(num, "div", false).div;
      }, BN.prototype.mod = function mod(num) {
        return this.divmod(num, "mod", false).mod;
      }, BN.prototype.umod = function umod(num) {
        return this.divmod(num, "mod", true).mod;
      }, BN.prototype.divRound = function divRound(num) {
        var dm = this.divmod(num);
        if (dm.mod.isZero())
          return dm.div;
        var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod, half = num.ushrn(1), r2 = num.andln(1), cmp = mod.cmp(half);
        if (cmp < 0 || r2 === 1 && cmp === 0)
          return dm.div;
        return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
      }, BN.prototype.modn = function modn(num) {
        assert(num <= 67108863);
        var p = 67108864 % num, acc = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--)
          acc = (p * acc + (this.words[i2] | 0)) % num;
        return acc;
      }, BN.prototype.idivn = function idivn(num) {
        assert(num <= 67108863);
        var carry = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          var w = (this.words[i2] | 0) + carry * 67108864;
          this.words[i2] = w / num | 0, carry = w % num;
        }
        return this.strip();
      }, BN.prototype.divn = function divn(num) {
        return this.clone().idivn(num);
      }, BN.prototype.egcd = function egcd(p) {
        assert(p.negative === 0), assert(!p.isZero());
        var x = this, y = p.clone();
        if (x.negative !== 0)
          x = x.umod(p);
        else
          x = x.clone();
        var A = new BN(1), B = new BN(0), C = new BN(0), D = new BN(1), g = 0;
        while (x.isEven() && y.isEven())
          x.iushrn(1), y.iushrn(1), ++g;
        var yp = y.clone(), xp = x.clone();
        while (!x.isZero()) {
          for (var i2 = 0, im = 1;(x.words[0] & im) === 0 && i2 < 26; ++i2, im <<= 1)
            ;
          if (i2 > 0) {
            x.iushrn(i2);
            while (i2-- > 0) {
              if (A.isOdd() || B.isOdd())
                A.iadd(yp), B.isub(xp);
              A.iushrn(1), B.iushrn(1);
            }
          }
          for (var j = 0, jm = 1;(y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
            ;
          if (j > 0) {
            y.iushrn(j);
            while (j-- > 0) {
              if (C.isOdd() || D.isOdd())
                C.iadd(yp), D.isub(xp);
              C.iushrn(1), D.iushrn(1);
            }
          }
          if (x.cmp(y) >= 0)
            x.isub(y), A.isub(C), B.isub(D);
          else
            y.isub(x), C.isub(A), D.isub(B);
        }
        return { a: C, b: D, gcd: y.iushln(g) };
      }, BN.prototype._invmp = function _invmp(p) {
        assert(p.negative === 0), assert(!p.isZero());
        var a = this, b = p.clone();
        if (a.negative !== 0)
          a = a.umod(p);
        else
          a = a.clone();
        var x1 = new BN(1), x2 = new BN(0), delta = b.clone();
        while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
          for (var i2 = 0, im = 1;(a.words[0] & im) === 0 && i2 < 26; ++i2, im <<= 1)
            ;
          if (i2 > 0) {
            a.iushrn(i2);
            while (i2-- > 0) {
              if (x1.isOdd())
                x1.iadd(delta);
              x1.iushrn(1);
            }
          }
          for (var j = 0, jm = 1;(b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
            ;
          if (j > 0) {
            b.iushrn(j);
            while (j-- > 0) {
              if (x2.isOdd())
                x2.iadd(delta);
              x2.iushrn(1);
            }
          }
          if (a.cmp(b) >= 0)
            a.isub(b), x1.isub(x2);
          else
            b.isub(a), x2.isub(x1);
        }
        var res;
        if (a.cmpn(1) === 0)
          res = x1;
        else
          res = x2;
        if (res.cmpn(0) < 0)
          res.iadd(p);
        return res;
      }, BN.prototype.gcd = function gcd(num) {
        if (this.isZero())
          return num.abs();
        if (num.isZero())
          return this.abs();
        var a = this.clone(), b = num.clone();
        a.negative = 0, b.negative = 0;
        for (var shift = 0;a.isEven() && b.isEven(); shift++)
          a.iushrn(1), b.iushrn(1);
        do {
          while (a.isEven())
            a.iushrn(1);
          while (b.isEven())
            b.iushrn(1);
          var r = a.cmp(b);
          if (r < 0) {
            var t = a;
            a = b, b = t;
          } else if (r === 0 || b.cmpn(1) === 0)
            break;
          a.isub(b);
        } while (true);
        return b.iushln(shift);
      }, BN.prototype.invm = function invm(num) {
        return this.egcd(num).a.umod(num);
      }, BN.prototype.isEven = function isEven() {
        return (this.words[0] & 1) === 0;
      }, BN.prototype.isOdd = function isOdd() {
        return (this.words[0] & 1) === 1;
      }, BN.prototype.andln = function andln(num) {
        return this.words[0] & num;
      }, BN.prototype.bincn = function bincn(bit) {
        assert(typeof bit === "number");
        var r = bit % 26, s = (bit - r) / 26, q = 1 << r;
        if (this.length <= s)
          return this._expand(s + 1), this.words[s] |= q, this;
        var carry = q;
        for (var i2 = s;carry !== 0 && i2 < this.length; i2++) {
          var w = this.words[i2] | 0;
          w += carry, carry = w >>> 26, w &= 67108863, this.words[i2] = w;
        }
        if (carry !== 0)
          this.words[i2] = carry, this.length++;
        return this;
      }, BN.prototype.isZero = function isZero() {
        return this.length === 1 && this.words[0] === 0;
      }, BN.prototype.cmpn = function cmpn(num) {
        var negative = num < 0;
        if (this.negative !== 0 && !negative)
          return -1;
        if (this.negative === 0 && negative)
          return 1;
        this.strip();
        var res;
        if (this.length > 1)
          res = 1;
        else {
          if (negative)
            num = -num;
          assert(num <= 67108863, "Number is too big");
          var w = this.words[0] | 0;
          res = w === num ? 0 : w < num ? -1 : 1;
        }
        if (this.negative !== 0)
          return -res | 0;
        return res;
      }, BN.prototype.cmp = function cmp(num) {
        if (this.negative !== 0 && num.negative === 0)
          return -1;
        if (this.negative === 0 && num.negative !== 0)
          return 1;
        var res = this.ucmp(num);
        if (this.negative !== 0)
          return -res | 0;
        return res;
      }, BN.prototype.ucmp = function ucmp(num) {
        if (this.length > num.length)
          return 1;
        if (this.length < num.length)
          return -1;
        var res = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          var a = this.words[i2] | 0, b = num.words[i2] | 0;
          if (a === b)
            continue;
          if (a < b)
            res = -1;
          else if (a > b)
            res = 1;
          break;
        }
        return res;
      }, BN.prototype.gtn = function gtn(num) {
        return this.cmpn(num) === 1;
      }, BN.prototype.gt = function gt(num) {
        return this.cmp(num) === 1;
      }, BN.prototype.gten = function gten(num) {
        return this.cmpn(num) >= 0;
      }, BN.prototype.gte = function gte(num) {
        return this.cmp(num) >= 0;
      }, BN.prototype.ltn = function ltn(num) {
        return this.cmpn(num) === -1;
      }, BN.prototype.lt = function lt(num) {
        return this.cmp(num) === -1;
      }, BN.prototype.lten = function lten(num) {
        return this.cmpn(num) <= 0;
      }, BN.prototype.lte = function lte(num) {
        return this.cmp(num) <= 0;
      }, BN.prototype.eqn = function eqn(num) {
        return this.cmpn(num) === 0;
      }, BN.prototype.eq = function eq(num) {
        return this.cmp(num) === 0;
      }, BN.red = function red(num) {
        return new Red(num);
      }, BN.prototype.toRed = function toRed(ctx) {
        return assert(!this.red, "Already a number in reduction context"), assert(this.negative === 0, "red works only with positives"), ctx.convertTo(this)._forceRed(ctx);
      }, BN.prototype.fromRed = function fromRed() {
        return assert(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this);
      }, BN.prototype._forceRed = function _forceRed(ctx) {
        return this.red = ctx, this;
      }, BN.prototype.forceRed = function forceRed(ctx) {
        return assert(!this.red, "Already a number in reduction context"), this._forceRed(ctx);
      }, BN.prototype.redAdd = function redAdd(num) {
        return assert(this.red, "redAdd works only with red numbers"), this.red.add(this, num);
      }, BN.prototype.redIAdd = function redIAdd(num) {
        return assert(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, num);
      }, BN.prototype.redSub = function redSub(num) {
        return assert(this.red, "redSub works only with red numbers"), this.red.sub(this, num);
      }, BN.prototype.redISub = function redISub(num) {
        return assert(this.red, "redISub works only with red numbers"), this.red.isub(this, num);
      }, BN.prototype.redShl = function redShl(num) {
        return assert(this.red, "redShl works only with red numbers"), this.red.shl(this, num);
      }, BN.prototype.redMul = function redMul(num) {
        return assert(this.red, "redMul works only with red numbers"), this.red._verify2(this, num), this.red.mul(this, num);
      }, BN.prototype.redIMul = function redIMul(num) {
        return assert(this.red, "redMul works only with red numbers"), this.red._verify2(this, num), this.red.imul(this, num);
      }, BN.prototype.redSqr = function redSqr() {
        return assert(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this);
      }, BN.prototype.redISqr = function redISqr() {
        return assert(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this);
      }, BN.prototype.redSqrt = function redSqrt() {
        return assert(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this);
      }, BN.prototype.redInvm = function redInvm() {
        return assert(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this);
      }, BN.prototype.redNeg = function redNeg() {
        return assert(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this);
      }, BN.prototype.redPow = function redPow(num) {
        return assert(this.red && !num.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, num);
      };
      var primes = { k256: null, p224: null, p192: null, p25519: null };
      function MPrime(name, p) {
        this.name = name, this.p = new BN(p, 16), this.n = this.p.bitLength(), this.k = new BN(1).iushln(this.n).isub(this.p), this.tmp = this._tmp();
      }
      MPrime.prototype._tmp = function _tmp() {
        var tmp = new BN(null);
        return tmp.words = new Array(Math.ceil(this.n / 13)), tmp;
      }, MPrime.prototype.ireduce = function ireduce(num) {
        var r = num, rlen;
        do
          this.split(r, this.tmp), r = this.imulK(r), r = r.iadd(this.tmp), rlen = r.bitLength();
        while (rlen > this.n);
        var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
        if (cmp === 0)
          r.words[0] = 0, r.length = 1;
        else if (cmp > 0)
          r.isub(this.p);
        else if (r.strip !== undefined)
          r.strip();
        else
          r._strip();
        return r;
      }, MPrime.prototype.split = function split(input, out) {
        input.iushrn(this.n, 0, out);
      }, MPrime.prototype.imulK = function imulK(num) {
        return num.imul(this.k);
      };
      function K256() {
        MPrime.call(this, "k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");
      }
      inherits2(K256, MPrime), K256.prototype.split = function split(input, output) {
        var mask = 4194303, outLen = Math.min(input.length, 9);
        for (var i2 = 0;i2 < outLen; i2++)
          output.words[i2] = input.words[i2];
        if (output.length = outLen, input.length <= 9) {
          input.words[0] = 0, input.length = 1;
          return;
        }
        var prev = input.words[9];
        output.words[output.length++] = prev & mask;
        for (i2 = 10;i2 < input.length; i2++) {
          var next = input.words[i2] | 0;
          input.words[i2 - 10] = (next & mask) << 4 | prev >>> 22, prev = next;
        }
        if (prev >>>= 22, input.words[i2 - 10] = prev, prev === 0 && input.length > 10)
          input.length -= 10;
        else
          input.length -= 9;
      }, K256.prototype.imulK = function imulK(num) {
        num.words[num.length] = 0, num.words[num.length + 1] = 0, num.length += 2;
        var lo = 0;
        for (var i2 = 0;i2 < num.length; i2++) {
          var w = num.words[i2] | 0;
          lo += w * 977, num.words[i2] = lo & 67108863, lo = w * 64 + (lo / 67108864 | 0);
        }
        if (num.words[num.length - 1] === 0) {
          if (num.length--, num.words[num.length - 1] === 0)
            num.length--;
        }
        return num;
      };
      function P224() {
        MPrime.call(this, "p224", "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001");
      }
      inherits2(P224, MPrime);
      function P192() {
        MPrime.call(this, "p192", "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff");
      }
      inherits2(P192, MPrime);
      function P25519() {
        MPrime.call(this, "25519", "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed");
      }
      inherits2(P25519, MPrime), P25519.prototype.imulK = function imulK(num) {
        var carry = 0;
        for (var i2 = 0;i2 < num.length; i2++) {
          var hi = (num.words[i2] | 0) * 19 + carry, lo = hi & 67108863;
          hi >>>= 26, num.words[i2] = lo, carry = hi;
        }
        if (carry !== 0)
          num.words[num.length++] = carry;
        return num;
      }, BN._prime = function prime(name) {
        if (primes[name])
          return primes[name];
        var prime;
        if (name === "k256")
          prime = new K256;
        else if (name === "p224")
          prime = new P224;
        else if (name === "p192")
          prime = new P192;
        else if (name === "p25519")
          prime = new P25519;
        else
          throw new Error("Unknown prime " + name);
        return primes[name] = prime, prime;
      };
      function Red(m) {
        if (typeof m === "string") {
          var prime = BN._prime(m);
          this.m = prime.p, this.prime = prime;
        } else
          assert(m.gtn(1), "modulus must be greater than 1"), this.m = m, this.prime = null;
      }
      Red.prototype._verify1 = function _verify1(a) {
        assert(a.negative === 0, "red works only with positives"), assert(a.red, "red works only with red numbers");
      }, Red.prototype._verify2 = function _verify2(a, b) {
        assert((a.negative | b.negative) === 0, "red works only with positives"), assert(a.red && a.red === b.red, "red works only with red numbers");
      }, Red.prototype.imod = function imod(a) {
        if (this.prime)
          return this.prime.ireduce(a)._forceRed(this);
        return a.umod(this.m)._forceRed(this);
      }, Red.prototype.neg = function neg(a) {
        if (a.isZero())
          return a.clone();
        return this.m.sub(a)._forceRed(this);
      }, Red.prototype.add = function add(a, b) {
        this._verify2(a, b);
        var res = a.add(b);
        if (res.cmp(this.m) >= 0)
          res.isub(this.m);
        return res._forceRed(this);
      }, Red.prototype.iadd = function iadd(a, b) {
        this._verify2(a, b);
        var res = a.iadd(b);
        if (res.cmp(this.m) >= 0)
          res.isub(this.m);
        return res;
      }, Red.prototype.sub = function sub(a, b) {
        this._verify2(a, b);
        var res = a.sub(b);
        if (res.cmpn(0) < 0)
          res.iadd(this.m);
        return res._forceRed(this);
      }, Red.prototype.isub = function isub(a, b) {
        this._verify2(a, b);
        var res = a.isub(b);
        if (res.cmpn(0) < 0)
          res.iadd(this.m);
        return res;
      }, Red.prototype.shl = function shl(a, num) {
        return this._verify1(a), this.imod(a.ushln(num));
      }, Red.prototype.imul = function imul(a, b) {
        return this._verify2(a, b), this.imod(a.imul(b));
      }, Red.prototype.mul = function mul(a, b) {
        return this._verify2(a, b), this.imod(a.mul(b));
      }, Red.prototype.isqr = function isqr(a) {
        return this.imul(a, a.clone());
      }, Red.prototype.sqr = function sqr(a) {
        return this.mul(a, a);
      }, Red.prototype.sqrt = function sqrt(a) {
        if (a.isZero())
          return a.clone();
        var mod3 = this.m.andln(3);
        if (assert(mod3 % 2 === 1), mod3 === 3) {
          var pow = this.m.add(new BN(1)).iushrn(2);
          return this.pow(a, pow);
        }
        var q = this.m.subn(1), s = 0;
        while (!q.isZero() && q.andln(1) === 0)
          s++, q.iushrn(1);
        assert(!q.isZero());
        var one = new BN(1).toRed(this), nOne = one.redNeg(), lpow = this.m.subn(1).iushrn(1), z = this.m.bitLength();
        z = new BN(2 * z * z).toRed(this);
        while (this.pow(z, lpow).cmp(nOne) !== 0)
          z.redIAdd(nOne);
        var c = this.pow(z, q), r = this.pow(a, q.addn(1).iushrn(1)), t = this.pow(a, q), m = s;
        while (t.cmp(one) !== 0) {
          var tmp = t;
          for (var i2 = 0;tmp.cmp(one) !== 0; i2++)
            tmp = tmp.redSqr();
          assert(i2 < m);
          var b = this.pow(c, new BN(1).iushln(m - i2 - 1));
          r = r.redMul(b), c = b.redSqr(), t = t.redMul(c), m = i2;
        }
        return r;
      }, Red.prototype.invm = function invm(a) {
        var inv = a._invmp(this.m);
        if (inv.negative !== 0)
          return inv.negative = 0, this.imod(inv).redNeg();
        else
          return this.imod(inv);
      }, Red.prototype.pow = function pow(a, num) {
        if (num.isZero())
          return new BN(1).toRed(this);
        if (num.cmpn(1) === 0)
          return a.clone();
        var windowSize = 4, wnd = new Array(1 << windowSize);
        wnd[0] = new BN(1).toRed(this), wnd[1] = a;
        for (var i2 = 2;i2 < wnd.length; i2++)
          wnd[i2] = this.mul(wnd[i2 - 1], a);
        var res = wnd[0], current = 0, currentLen = 0, start = num.bitLength() % 26;
        if (start === 0)
          start = 26;
        for (i2 = num.length - 1;i2 >= 0; i2--) {
          var word = num.words[i2];
          for (var j = start - 1;j >= 0; j--) {
            var bit = word >> j & 1;
            if (res !== wnd[0])
              res = this.sqr(res);
            if (bit === 0 && current === 0) {
              currentLen = 0;
              continue;
            }
            if (current <<= 1, current |= bit, currentLen++, currentLen !== windowSize && (i2 !== 0 || j !== 0))
              continue;
            res = this.mul(res, wnd[current]), currentLen = 0, current = 0;
          }
          start = 26;
        }
        return res;
      }, Red.prototype.convertTo = function convertTo(num) {
        var r = num.umod(this.m);
        return r === num ? r.clone() : r;
      }, Red.prototype.convertFrom = function convertFrom(num) {
        var res = num.clone();
        return res.red = null, res;
      }, BN.mont = function mont(num) {
        return new Mont(num);
      };
      function Mont(m) {
        if (Red.call(this, m), this.shift = this.m.bitLength(), this.shift % 26 !== 0)
          this.shift += 26 - this.shift % 26;
        this.r = new BN(1).iushln(this.shift), this.r2 = this.imod(this.r.sqr()), this.rinv = this.r._invmp(this.m), this.minv = this.rinv.mul(this.r).isubn(1).div(this.m), this.minv = this.minv.umod(this.r), this.minv = this.r.sub(this.minv);
      }
      inherits2(Mont, Red), Mont.prototype.convertTo = function convertTo(num) {
        return this.imod(num.ushln(this.shift));
      }, Mont.prototype.convertFrom = function convertFrom(num) {
        var r = this.imod(num.mul(this.rinv));
        return r.red = null, r;
      }, Mont.prototype.imul = function imul(a, b) {
        if (a.isZero() || b.isZero())
          return a.words[0] = 0, a.length = 1, a;
        var t = a.imul(b), c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), u = t.isub(c).iushrn(this.shift), res = u;
        if (u.cmp(this.m) >= 0)
          res = u.isub(this.m);
        else if (u.cmpn(0) < 0)
          res = u.iadd(this.m);
        return res._forceRed(this);
      }, Mont.prototype.mul = function mul(a, b) {
        if (a.isZero() || b.isZero())
          return new BN(0)._forceRed(this);
        var t = a.mul(b), c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), u = t.isub(c).iushrn(this.shift), res = u;
        if (u.cmp(this.m) >= 0)
          res = u.isub(this.m);
        else if (u.cmpn(0) < 0)
          res = u.iadd(this.m);
        return res._forceRed(this);
      }, Mont.prototype.invm = function invm(a) {
        var res = this.imod(a._invmp(this.m).mul(this.r2));
        return res._forceRed(this);
      };
    })(typeof module === "undefined" || module, exports);
  });
  require_browser = __commonJS2((exports, module) => {
    var elliptic = require_elliptic(), BN = require_bn2();
    module.exports = function createECDH(curve) {
      return new ECDH(curve);
    };
    var aliases = { secp256k1: { name: "secp256k1", byteLength: 32 }, secp224r1: { name: "p224", byteLength: 28 }, prime256v1: { name: "p256", byteLength: 32 }, prime192v1: { name: "p192", byteLength: 24 }, ed25519: { name: "ed25519", byteLength: 32 }, secp384r1: { name: "p384", byteLength: 48 }, secp521r1: { name: "p521", byteLength: 66 } };
    aliases.p224 = aliases.secp224r1;
    aliases.p256 = aliases.secp256r1 = aliases.prime256v1;
    aliases.p192 = aliases.secp192r1 = aliases.prime192v1;
    aliases.p384 = aliases.secp384r1;
    aliases.p521 = aliases.secp521r1;
    function ECDH(curve) {
      if (this.curveType = aliases[curve], !this.curveType)
        this.curveType = { name: curve };
      this.curve = new elliptic.ec(this.curveType.name), this.keys = undefined;
    }
    ECDH.prototype.generateKeys = function(enc, format3) {
      return this.keys = this.curve.genKeyPair(), this.getPublicKey(enc, format3);
    };
    ECDH.prototype.computeSecret = function(other, inenc, enc) {
      if (inenc = inenc || "utf8", !Buffer.isBuffer(other))
        other = new Buffer(other, inenc);
      var otherPub = this.curve.keyFromPublic(other).getPublic(), out = otherPub.mul(this.keys.getPrivate()).getX();
      return formatReturnValue(out, enc, this.curveType.byteLength);
    };
    ECDH.prototype.getPublicKey = function(enc, format3) {
      var key = this.keys.getPublic(format3 === "compressed", true);
      if (format3 === "hybrid")
        if (key[key.length - 1] % 2)
          key[0] = 7;
        else
          key[0] = 6;
      return formatReturnValue(key, enc);
    };
    ECDH.prototype.getPrivateKey = function(enc) {
      return formatReturnValue(this.keys.getPrivate(), enc);
    };
    ECDH.prototype.setPublicKey = function(pub, enc) {
      if (enc = enc || "utf8", !Buffer.isBuffer(pub))
        pub = new Buffer(pub, enc);
      return this.keys._importPublic(pub), this;
    };
    ECDH.prototype.setPrivateKey = function(priv, enc) {
      if (enc = enc || "utf8", !Buffer.isBuffer(priv))
        priv = new Buffer(priv, enc);
      var _priv = new BN(priv);
      return _priv = _priv.toString(16), this.keys = this.curve.genKeyPair(), this.keys._importPrivate(_priv), this;
    };
    function formatReturnValue(bn, enc, len2) {
      if (!Array.isArray(bn))
        bn = bn.toArray();
      var buf = new Buffer(bn);
      if (len2 && buf.length < len2) {
        var zeros = new Buffer(len2 - buf.length);
        zeros.fill(0), buf = Buffer.concat([zeros, buf]);
      }
      if (!enc)
        return buf;
      else
        return buf.toString(enc);
    }
  });
  require_create_ecdh = __commonJS2((exports, module) => {
    var createECDH = (init_crypto(), __toCommonJS(exports_crypto)).createECDH;
    module.exports = createECDH || require_browser();
  });
  require_bn3 = __commonJS2((exports, module) => {
    (function(module2, exports2) {
      function assert(val, msg) {
        if (!val)
          throw new Error(msg || "Assertion failed");
      }
      function inherits2(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {};
        TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor, ctor.prototype.constructor = ctor;
      }
      function BN(number, base, endian) {
        if (BN.isBN(number))
          return number;
        if (this.negative = 0, this.words = null, this.length = 0, this.red = null, number !== null) {
          if (base === "le" || base === "be")
            endian = base, base = 10;
          this._init(number || 0, base || 10, endian || "be");
        }
      }
      if (typeof module2 === "object")
        module2.exports = BN;
      else
        exports2.BN = BN;
      BN.BN = BN, BN.wordSize = 26;
      var Buffer22;
      try {
        if (typeof window !== "undefined" && typeof window.Buffer !== "undefined")
          Buffer22 = window.Buffer;
        else
          Buffer22 = (init_buffer(), __toCommonJS(exports_buffer)).Buffer;
      } catch (e) {}
      BN.isBN = function isBN(num) {
        if (num instanceof BN)
          return true;
        return num !== null && typeof num === "object" && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
      }, BN.max = function max(left, right) {
        if (left.cmp(right) > 0)
          return left;
        return right;
      }, BN.min = function min(left, right) {
        if (left.cmp(right) < 0)
          return left;
        return right;
      }, BN.prototype._init = function init(number, base, endian) {
        if (typeof number === "number")
          return this._initNumber(number, base, endian);
        if (typeof number === "object")
          return this._initArray(number, base, endian);
        if (base === "hex")
          base = 16;
        assert(base === (base | 0) && base >= 2 && base <= 36), number = number.toString().replace(/\s+/g, "");
        var start = 0;
        if (number[0] === "-")
          start++, this.negative = 1;
        if (start < number.length) {
          if (base === 16)
            this._parseHex(number, start, endian);
          else if (this._parseBase(number, base, start), endian === "le")
            this._initArray(this.toArray(), base, endian);
        }
      }, BN.prototype._initNumber = function _initNumber(number, base, endian) {
        if (number < 0)
          this.negative = 1, number = -number;
        if (number < 67108864)
          this.words = [number & 67108863], this.length = 1;
        else if (number < 4503599627370496)
          this.words = [number & 67108863, number / 67108864 & 67108863], this.length = 2;
        else
          assert(number < 9007199254740992), this.words = [number & 67108863, number / 67108864 & 67108863, 1], this.length = 3;
        if (endian !== "le")
          return;
        this._initArray(this.toArray(), base, endian);
      }, BN.prototype._initArray = function _initArray(number, base, endian) {
        if (assert(typeof number.length === "number"), number.length <= 0)
          return this.words = [0], this.length = 1, this;
        this.length = Math.ceil(number.length / 3), this.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          this.words[i2] = 0;
        var j, w, off = 0;
        if (endian === "be") {
          for (i2 = number.length - 1, j = 0;i2 >= 0; i2 -= 3)
            if (w = number[i2] | number[i2 - 1] << 8 | number[i2 - 2] << 16, this.words[j] |= w << off & 67108863, this.words[j + 1] = w >>> 26 - off & 67108863, off += 24, off >= 26)
              off -= 26, j++;
        } else if (endian === "le") {
          for (i2 = 0, j = 0;i2 < number.length; i2 += 3)
            if (w = number[i2] | number[i2 + 1] << 8 | number[i2 + 2] << 16, this.words[j] |= w << off & 67108863, this.words[j + 1] = w >>> 26 - off & 67108863, off += 24, off >= 26)
              off -= 26, j++;
        }
        return this.strip();
      };
      function parseHex4Bits(string, index) {
        var c = string.charCodeAt(index);
        if (c >= 65 && c <= 70)
          return c - 55;
        else if (c >= 97 && c <= 102)
          return c - 87;
        else
          return c - 48 & 15;
      }
      function parseHexByte(string, lowerBound, index) {
        var r = parseHex4Bits(string, index);
        if (index - 1 >= lowerBound)
          r |= parseHex4Bits(string, index - 1) << 4;
        return r;
      }
      BN.prototype._parseHex = function _parseHex(number, start, endian) {
        this.length = Math.ceil((number.length - start) / 6), this.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          this.words[i2] = 0;
        var off = 0, j = 0, w;
        if (endian === "be")
          for (i2 = number.length - 1;i2 >= start; i2 -= 2)
            if (w = parseHexByte(number, start, i2) << off, this.words[j] |= w & 67108863, off >= 18)
              off -= 18, j += 1, this.words[j] |= w >>> 26;
            else
              off += 8;
        else {
          var parseLength = number.length - start;
          for (i2 = parseLength % 2 === 0 ? start + 1 : start;i2 < number.length; i2 += 2)
            if (w = parseHexByte(number, start, i2) << off, this.words[j] |= w & 67108863, off >= 18)
              off -= 18, j += 1, this.words[j] |= w >>> 26;
            else
              off += 8;
        }
        this.strip();
      };
      function parseBase(str, start, end, mul) {
        var r = 0, len2 = Math.min(str.length, end);
        for (var i2 = start;i2 < len2; i2++) {
          var c = str.charCodeAt(i2) - 48;
          if (r *= mul, c >= 49)
            r += c - 49 + 10;
          else if (c >= 17)
            r += c - 17 + 10;
          else
            r += c;
        }
        return r;
      }
      BN.prototype._parseBase = function _parseBase(number, base, start) {
        this.words = [0], this.length = 1;
        for (var limbLen = 0, limbPow = 1;limbPow <= 67108863; limbPow *= base)
          limbLen++;
        limbLen--, limbPow = limbPow / base | 0;
        var total = number.length - start, mod = total % limbLen, end = Math.min(total, total - mod) + start, word = 0;
        for (var i2 = start;i2 < end; i2 += limbLen)
          if (word = parseBase(number, i2, i2 + limbLen, base), this.imuln(limbPow), this.words[0] + word < 67108864)
            this.words[0] += word;
          else
            this._iaddn(word);
        if (mod !== 0) {
          var pow = 1;
          word = parseBase(number, i2, number.length, base);
          for (i2 = 0;i2 < mod; i2++)
            pow *= base;
          if (this.imuln(pow), this.words[0] + word < 67108864)
            this.words[0] += word;
          else
            this._iaddn(word);
        }
        this.strip();
      }, BN.prototype.copy = function copy(dest) {
        dest.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          dest.words[i2] = this.words[i2];
        dest.length = this.length, dest.negative = this.negative, dest.red = this.red;
      }, BN.prototype.clone = function clone() {
        var r = new BN(null);
        return this.copy(r), r;
      }, BN.prototype._expand = function _expand(size) {
        while (this.length < size)
          this.words[this.length++] = 0;
        return this;
      }, BN.prototype.strip = function strip() {
        while (this.length > 1 && this.words[this.length - 1] === 0)
          this.length--;
        return this._normSign();
      }, BN.prototype._normSign = function _normSign() {
        if (this.length === 1 && this.words[0] === 0)
          this.negative = 0;
        return this;
      }, BN.prototype.inspect = function inspect() {
        return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
      };
      var zeros = ["", "0", "00", "000", "0000", "00000", "000000", "0000000", "00000000", "000000000", "0000000000", "00000000000", "000000000000", "0000000000000", "00000000000000", "000000000000000", "0000000000000000", "00000000000000000", "000000000000000000", "0000000000000000000", "00000000000000000000", "000000000000000000000", "0000000000000000000000", "00000000000000000000000", "000000000000000000000000", "0000000000000000000000000"], groupSizes = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], groupBases = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];
      if (BN.prototype.toString = function toString(base, padding) {
        base = base || 10, padding = padding | 0 || 1;
        var out;
        if (base === 16 || base === "hex") {
          out = "";
          var off = 0, carry = 0;
          for (var i2 = 0;i2 < this.length; i2++) {
            var w = this.words[i2], word = ((w << off | carry) & 16777215).toString(16);
            if (carry = w >>> 24 - off & 16777215, off += 2, off >= 26)
              off -= 26, i2--;
            if (carry !== 0 || i2 !== this.length - 1)
              out = zeros[6 - word.length] + word + out;
            else
              out = word + out;
          }
          if (carry !== 0)
            out = carry.toString(16) + out;
          while (out.length % padding !== 0)
            out = "0" + out;
          if (this.negative !== 0)
            out = "-" + out;
          return out;
        }
        if (base === (base | 0) && base >= 2 && base <= 36) {
          var groupSize = groupSizes[base], groupBase = groupBases[base];
          out = "";
          var c = this.clone();
          c.negative = 0;
          while (!c.isZero()) {
            var r = c.modn(groupBase).toString(base);
            if (c = c.idivn(groupBase), !c.isZero())
              out = zeros[groupSize - r.length] + r + out;
            else
              out = r + out;
          }
          if (this.isZero())
            out = "0" + out;
          while (out.length % padding !== 0)
            out = "0" + out;
          if (this.negative !== 0)
            out = "-" + out;
          return out;
        }
        assert(false, "Base should be between 2 and 36");
      }, BN.prototype.toNumber = function toNumber() {
        var ret = this.words[0];
        if (this.length === 2)
          ret += this.words[1] * 67108864;
        else if (this.length === 3 && this.words[2] === 1)
          ret += 4503599627370496 + this.words[1] * 67108864;
        else if (this.length > 2)
          assert(false, "Number can only safely store up to 53 bits");
        return this.negative !== 0 ? -ret : ret;
      }, BN.prototype.toJSON = function toJSON() {
        return this.toString(16);
      }, BN.prototype.toBuffer = function toBuffer(endian, length) {
        return assert(typeof Buffer22 !== "undefined"), this.toArrayLike(Buffer22, endian, length);
      }, BN.prototype.toArray = function toArray(endian, length) {
        return this.toArrayLike(Array, endian, length);
      }, BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
        var byteLength2 = this.byteLength(), reqLength = length || Math.max(1, byteLength2);
        assert(byteLength2 <= reqLength, "byte array longer than desired length"), assert(reqLength > 0, "Requested array length <= 0"), this.strip();
        var littleEndian = endian === "le", res = new ArrayType(reqLength), b, i2, q = this.clone();
        if (!littleEndian) {
          for (i2 = 0;i2 < reqLength - byteLength2; i2++)
            res[i2] = 0;
          for (i2 = 0;!q.isZero(); i2++)
            b = q.andln(255), q.iushrn(8), res[reqLength - i2 - 1] = b;
        } else {
          for (i2 = 0;!q.isZero(); i2++)
            b = q.andln(255), q.iushrn(8), res[i2] = b;
          for (;i2 < reqLength; i2++)
            res[i2] = 0;
        }
        return res;
      }, Math.clz32)
        BN.prototype._countBits = function _countBits(w) {
          return 32 - Math.clz32(w);
        };
      else
        BN.prototype._countBits = function _countBits(w) {
          var t = w, r = 0;
          if (t >= 4096)
            r += 13, t >>>= 13;
          if (t >= 64)
            r += 7, t >>>= 7;
          if (t >= 8)
            r += 4, t >>>= 4;
          if (t >= 2)
            r += 2, t >>>= 2;
          return r + t;
        };
      BN.prototype._zeroBits = function _zeroBits(w) {
        if (w === 0)
          return 26;
        var t = w, r = 0;
        if ((t & 8191) === 0)
          r += 13, t >>>= 13;
        if ((t & 127) === 0)
          r += 7, t >>>= 7;
        if ((t & 15) === 0)
          r += 4, t >>>= 4;
        if ((t & 3) === 0)
          r += 2, t >>>= 2;
        if ((t & 1) === 0)
          r++;
        return r;
      }, BN.prototype.bitLength = function bitLength() {
        var w = this.words[this.length - 1], hi = this._countBits(w);
        return (this.length - 1) * 26 + hi;
      };
      function toBitArray(num) {
        var w = new Array(num.bitLength());
        for (var bit = 0;bit < w.length; bit++) {
          var off = bit / 26 | 0, wbit = bit % 26;
          w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
        }
        return w;
      }
      BN.prototype.zeroBits = function zeroBits() {
        if (this.isZero())
          return 0;
        var r = 0;
        for (var i2 = 0;i2 < this.length; i2++) {
          var b = this._zeroBits(this.words[i2]);
          if (r += b, b !== 26)
            break;
        }
        return r;
      }, BN.prototype.byteLength = function byteLength() {
        return Math.ceil(this.bitLength() / 8);
      }, BN.prototype.toTwos = function toTwos(width) {
        if (this.negative !== 0)
          return this.abs().inotn(width).iaddn(1);
        return this.clone();
      }, BN.prototype.fromTwos = function fromTwos(width) {
        if (this.testn(width - 1))
          return this.notn(width).iaddn(1).ineg();
        return this.clone();
      }, BN.prototype.isNeg = function isNeg() {
        return this.negative !== 0;
      }, BN.prototype.neg = function neg() {
        return this.clone().ineg();
      }, BN.prototype.ineg = function ineg() {
        if (!this.isZero())
          this.negative ^= 1;
        return this;
      }, BN.prototype.iuor = function iuor(num) {
        while (this.length < num.length)
          this.words[this.length++] = 0;
        for (var i2 = 0;i2 < num.length; i2++)
          this.words[i2] = this.words[i2] | num.words[i2];
        return this.strip();
      }, BN.prototype.ior = function ior(num) {
        return assert((this.negative | num.negative) === 0), this.iuor(num);
      }, BN.prototype.or = function or(num) {
        if (this.length > num.length)
          return this.clone().ior(num);
        return num.clone().ior(this);
      }, BN.prototype.uor = function uor(num) {
        if (this.length > num.length)
          return this.clone().iuor(num);
        return num.clone().iuor(this);
      }, BN.prototype.iuand = function iuand(num) {
        var b;
        if (this.length > num.length)
          b = num;
        else
          b = this;
        for (var i2 = 0;i2 < b.length; i2++)
          this.words[i2] = this.words[i2] & num.words[i2];
        return this.length = b.length, this.strip();
      }, BN.prototype.iand = function iand(num) {
        return assert((this.negative | num.negative) === 0), this.iuand(num);
      }, BN.prototype.and = function and(num) {
        if (this.length > num.length)
          return this.clone().iand(num);
        return num.clone().iand(this);
      }, BN.prototype.uand = function uand(num) {
        if (this.length > num.length)
          return this.clone().iuand(num);
        return num.clone().iuand(this);
      }, BN.prototype.iuxor = function iuxor(num) {
        var a, b;
        if (this.length > num.length)
          a = this, b = num;
        else
          a = num, b = this;
        for (var i2 = 0;i2 < b.length; i2++)
          this.words[i2] = a.words[i2] ^ b.words[i2];
        if (this !== a)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        return this.length = a.length, this.strip();
      }, BN.prototype.ixor = function ixor(num) {
        return assert((this.negative | num.negative) === 0), this.iuxor(num);
      }, BN.prototype.xor = function xor(num) {
        if (this.length > num.length)
          return this.clone().ixor(num);
        return num.clone().ixor(this);
      }, BN.prototype.uxor = function uxor(num) {
        if (this.length > num.length)
          return this.clone().iuxor(num);
        return num.clone().iuxor(this);
      }, BN.prototype.inotn = function inotn(width) {
        assert(typeof width === "number" && width >= 0);
        var bytesNeeded = Math.ceil(width / 26) | 0, bitsLeft = width % 26;
        if (this._expand(bytesNeeded), bitsLeft > 0)
          bytesNeeded--;
        for (var i2 = 0;i2 < bytesNeeded; i2++)
          this.words[i2] = ~this.words[i2] & 67108863;
        if (bitsLeft > 0)
          this.words[i2] = ~this.words[i2] & 67108863 >> 26 - bitsLeft;
        return this.strip();
      }, BN.prototype.notn = function notn(width) {
        return this.clone().inotn(width);
      }, BN.prototype.setn = function setn(bit, val) {
        assert(typeof bit === "number" && bit >= 0);
        var off = bit / 26 | 0, wbit = bit % 26;
        if (this._expand(off + 1), val)
          this.words[off] = this.words[off] | 1 << wbit;
        else
          this.words[off] = this.words[off] & ~(1 << wbit);
        return this.strip();
      }, BN.prototype.iadd = function iadd(num) {
        var r;
        if (this.negative !== 0 && num.negative === 0)
          return this.negative = 0, r = this.isub(num), this.negative ^= 1, this._normSign();
        else if (this.negative === 0 && num.negative !== 0)
          return num.negative = 0, r = this.isub(num), num.negative = 1, r._normSign();
        var a, b;
        if (this.length > num.length)
          a = this, b = num;
        else
          a = num, b = this;
        var carry = 0;
        for (var i2 = 0;i2 < b.length; i2++)
          r = (a.words[i2] | 0) + (b.words[i2] | 0) + carry, this.words[i2] = r & 67108863, carry = r >>> 26;
        for (;carry !== 0 && i2 < a.length; i2++)
          r = (a.words[i2] | 0) + carry, this.words[i2] = r & 67108863, carry = r >>> 26;
        if (this.length = a.length, carry !== 0)
          this.words[this.length] = carry, this.length++;
        else if (a !== this)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        return this;
      }, BN.prototype.add = function add(num) {
        var res;
        if (num.negative !== 0 && this.negative === 0)
          return num.negative = 0, res = this.sub(num), num.negative ^= 1, res;
        else if (num.negative === 0 && this.negative !== 0)
          return this.negative = 0, res = num.sub(this), this.negative = 1, res;
        if (this.length > num.length)
          return this.clone().iadd(num);
        return num.clone().iadd(this);
      }, BN.prototype.isub = function isub(num) {
        if (num.negative !== 0) {
          num.negative = 0;
          var r = this.iadd(num);
          return num.negative = 1, r._normSign();
        } else if (this.negative !== 0)
          return this.negative = 0, this.iadd(num), this.negative = 1, this._normSign();
        var cmp = this.cmp(num);
        if (cmp === 0)
          return this.negative = 0, this.length = 1, this.words[0] = 0, this;
        var a, b;
        if (cmp > 0)
          a = this, b = num;
        else
          a = num, b = this;
        var carry = 0;
        for (var i2 = 0;i2 < b.length; i2++)
          r = (a.words[i2] | 0) - (b.words[i2] | 0) + carry, carry = r >> 26, this.words[i2] = r & 67108863;
        for (;carry !== 0 && i2 < a.length; i2++)
          r = (a.words[i2] | 0) + carry, carry = r >> 26, this.words[i2] = r & 67108863;
        if (carry === 0 && i2 < a.length && a !== this)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        if (this.length = Math.max(this.length, i2), a !== this)
          this.negative = 1;
        return this.strip();
      }, BN.prototype.sub = function sub(num) {
        return this.clone().isub(num);
      };
      function smallMulTo(self2, num, out) {
        out.negative = num.negative ^ self2.negative;
        var len2 = self2.length + num.length | 0;
        out.length = len2, len2 = len2 - 1 | 0;
        var a = self2.words[0] | 0, b = num.words[0] | 0, r = a * b, lo = r & 67108863, carry = r / 67108864 | 0;
        out.words[0] = lo;
        for (var k = 1;k < len2; k++) {
          var ncarry = carry >>> 26, rword = carry & 67108863, maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self2.length + 1);j <= maxJ; j++) {
            var i2 = k - j | 0;
            a = self2.words[i2] | 0, b = num.words[j] | 0, r = a * b + rword, ncarry += r / 67108864 | 0, rword = r & 67108863;
          }
          out.words[k] = rword | 0, carry = ncarry | 0;
        }
        if (carry !== 0)
          out.words[k] = carry | 0;
        else
          out.length--;
        return out.strip();
      }
      var comb10MulTo = function comb10MulTo(self2, num, out) {
        var a = self2.words, b = num.words, o = out.words, c = 0, lo, mid, hi, a0 = a[0] | 0, al0 = a0 & 8191, ah0 = a0 >>> 13, a1 = a[1] | 0, al1 = a1 & 8191, ah1 = a1 >>> 13, a2 = a[2] | 0, al2 = a2 & 8191, ah2 = a2 >>> 13, a3 = a[3] | 0, al3 = a3 & 8191, ah3 = a3 >>> 13, a4 = a[4] | 0, al4 = a4 & 8191, ah4 = a4 >>> 13, a5 = a[5] | 0, al5 = a5 & 8191, ah5 = a5 >>> 13, a6 = a[6] | 0, al6 = a6 & 8191, ah6 = a6 >>> 13, a7 = a[7] | 0, al7 = a7 & 8191, ah7 = a7 >>> 13, a8 = a[8] | 0, al8 = a8 & 8191, ah8 = a8 >>> 13, a9 = a[9] | 0, al9 = a9 & 8191, ah9 = a9 >>> 13, b0 = b[0] | 0, bl0 = b0 & 8191, bh0 = b0 >>> 13, b1 = b[1] | 0, bl1 = b1 & 8191, bh1 = b1 >>> 13, b2 = b[2] | 0, bl2 = b2 & 8191, bh2 = b2 >>> 13, b3 = b[3] | 0, bl3 = b3 & 8191, bh3 = b3 >>> 13, b4 = b[4] | 0, bl4 = b4 & 8191, bh4 = b4 >>> 13, b5 = b[5] | 0, bl5 = b5 & 8191, bh5 = b5 >>> 13, b6 = b[6] | 0, bl6 = b6 & 8191, bh6 = b6 >>> 13, b7 = b[7] | 0, bl7 = b7 & 8191, bh7 = b7 >>> 13, b8 = b[8] | 0, bl8 = b8 & 8191, bh8 = b8 >>> 13, b9 = b[9] | 0, bl9 = b9 & 8191, bh9 = b9 >>> 13;
        out.negative = self2.negative ^ num.negative, out.length = 19, lo = Math.imul(al0, bl0), mid = Math.imul(al0, bh0), mid = mid + Math.imul(ah0, bl0) | 0, hi = Math.imul(ah0, bh0);
        var w0 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0, w0 &= 67108863, lo = Math.imul(al1, bl0), mid = Math.imul(al1, bh0), mid = mid + Math.imul(ah1, bl0) | 0, hi = Math.imul(ah1, bh0), lo = lo + Math.imul(al0, bl1) | 0, mid = mid + Math.imul(al0, bh1) | 0, mid = mid + Math.imul(ah0, bl1) | 0, hi = hi + Math.imul(ah0, bh1) | 0;
        var w1 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0, w1 &= 67108863, lo = Math.imul(al2, bl0), mid = Math.imul(al2, bh0), mid = mid + Math.imul(ah2, bl0) | 0, hi = Math.imul(ah2, bh0), lo = lo + Math.imul(al1, bl1) | 0, mid = mid + Math.imul(al1, bh1) | 0, mid = mid + Math.imul(ah1, bl1) | 0, hi = hi + Math.imul(ah1, bh1) | 0, lo = lo + Math.imul(al0, bl2) | 0, mid = mid + Math.imul(al0, bh2) | 0, mid = mid + Math.imul(ah0, bl2) | 0, hi = hi + Math.imul(ah0, bh2) | 0;
        var w2 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0, w2 &= 67108863, lo = Math.imul(al3, bl0), mid = Math.imul(al3, bh0), mid = mid + Math.imul(ah3, bl0) | 0, hi = Math.imul(ah3, bh0), lo = lo + Math.imul(al2, bl1) | 0, mid = mid + Math.imul(al2, bh1) | 0, mid = mid + Math.imul(ah2, bl1) | 0, hi = hi + Math.imul(ah2, bh1) | 0, lo = lo + Math.imul(al1, bl2) | 0, mid = mid + Math.imul(al1, bh2) | 0, mid = mid + Math.imul(ah1, bl2) | 0, hi = hi + Math.imul(ah1, bh2) | 0, lo = lo + Math.imul(al0, bl3) | 0, mid = mid + Math.imul(al0, bh3) | 0, mid = mid + Math.imul(ah0, bl3) | 0, hi = hi + Math.imul(ah0, bh3) | 0;
        var w3 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0, w3 &= 67108863, lo = Math.imul(al4, bl0), mid = Math.imul(al4, bh0), mid = mid + Math.imul(ah4, bl0) | 0, hi = Math.imul(ah4, bh0), lo = lo + Math.imul(al3, bl1) | 0, mid = mid + Math.imul(al3, bh1) | 0, mid = mid + Math.imul(ah3, bl1) | 0, hi = hi + Math.imul(ah3, bh1) | 0, lo = lo + Math.imul(al2, bl2) | 0, mid = mid + Math.imul(al2, bh2) | 0, mid = mid + Math.imul(ah2, bl2) | 0, hi = hi + Math.imul(ah2, bh2) | 0, lo = lo + Math.imul(al1, bl3) | 0, mid = mid + Math.imul(al1, bh3) | 0, mid = mid + Math.imul(ah1, bl3) | 0, hi = hi + Math.imul(ah1, bh3) | 0, lo = lo + Math.imul(al0, bl4) | 0, mid = mid + Math.imul(al0, bh4) | 0, mid = mid + Math.imul(ah0, bl4) | 0, hi = hi + Math.imul(ah0, bh4) | 0;
        var w4 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0, w4 &= 67108863, lo = Math.imul(al5, bl0), mid = Math.imul(al5, bh0), mid = mid + Math.imul(ah5, bl0) | 0, hi = Math.imul(ah5, bh0), lo = lo + Math.imul(al4, bl1) | 0, mid = mid + Math.imul(al4, bh1) | 0, mid = mid + Math.imul(ah4, bl1) | 0, hi = hi + Math.imul(ah4, bh1) | 0, lo = lo + Math.imul(al3, bl2) | 0, mid = mid + Math.imul(al3, bh2) | 0, mid = mid + Math.imul(ah3, bl2) | 0, hi = hi + Math.imul(ah3, bh2) | 0, lo = lo + Math.imul(al2, bl3) | 0, mid = mid + Math.imul(al2, bh3) | 0, mid = mid + Math.imul(ah2, bl3) | 0, hi = hi + Math.imul(ah2, bh3) | 0, lo = lo + Math.imul(al1, bl4) | 0, mid = mid + Math.imul(al1, bh4) | 0, mid = mid + Math.imul(ah1, bl4) | 0, hi = hi + Math.imul(ah1, bh4) | 0, lo = lo + Math.imul(al0, bl5) | 0, mid = mid + Math.imul(al0, bh5) | 0, mid = mid + Math.imul(ah0, bl5) | 0, hi = hi + Math.imul(ah0, bh5) | 0;
        var w5 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0, w5 &= 67108863, lo = Math.imul(al6, bl0), mid = Math.imul(al6, bh0), mid = mid + Math.imul(ah6, bl0) | 0, hi = Math.imul(ah6, bh0), lo = lo + Math.imul(al5, bl1) | 0, mid = mid + Math.imul(al5, bh1) | 0, mid = mid + Math.imul(ah5, bl1) | 0, hi = hi + Math.imul(ah5, bh1) | 0, lo = lo + Math.imul(al4, bl2) | 0, mid = mid + Math.imul(al4, bh2) | 0, mid = mid + Math.imul(ah4, bl2) | 0, hi = hi + Math.imul(ah4, bh2) | 0, lo = lo + Math.imul(al3, bl3) | 0, mid = mid + Math.imul(al3, bh3) | 0, mid = mid + Math.imul(ah3, bl3) | 0, hi = hi + Math.imul(ah3, bh3) | 0, lo = lo + Math.imul(al2, bl4) | 0, mid = mid + Math.imul(al2, bh4) | 0, mid = mid + Math.imul(ah2, bl4) | 0, hi = hi + Math.imul(ah2, bh4) | 0, lo = lo + Math.imul(al1, bl5) | 0, mid = mid + Math.imul(al1, bh5) | 0, mid = mid + Math.imul(ah1, bl5) | 0, hi = hi + Math.imul(ah1, bh5) | 0, lo = lo + Math.imul(al0, bl6) | 0, mid = mid + Math.imul(al0, bh6) | 0, mid = mid + Math.imul(ah0, bl6) | 0, hi = hi + Math.imul(ah0, bh6) | 0;
        var w6 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0, w6 &= 67108863, lo = Math.imul(al7, bl0), mid = Math.imul(al7, bh0), mid = mid + Math.imul(ah7, bl0) | 0, hi = Math.imul(ah7, bh0), lo = lo + Math.imul(al6, bl1) | 0, mid = mid + Math.imul(al6, bh1) | 0, mid = mid + Math.imul(ah6, bl1) | 0, hi = hi + Math.imul(ah6, bh1) | 0, lo = lo + Math.imul(al5, bl2) | 0, mid = mid + Math.imul(al5, bh2) | 0, mid = mid + Math.imul(ah5, bl2) | 0, hi = hi + Math.imul(ah5, bh2) | 0, lo = lo + Math.imul(al4, bl3) | 0, mid = mid + Math.imul(al4, bh3) | 0, mid = mid + Math.imul(ah4, bl3) | 0, hi = hi + Math.imul(ah4, bh3) | 0, lo = lo + Math.imul(al3, bl4) | 0, mid = mid + Math.imul(al3, bh4) | 0, mid = mid + Math.imul(ah3, bl4) | 0, hi = hi + Math.imul(ah3, bh4) | 0, lo = lo + Math.imul(al2, bl5) | 0, mid = mid + Math.imul(al2, bh5) | 0, mid = mid + Math.imul(ah2, bl5) | 0, hi = hi + Math.imul(ah2, bh5) | 0, lo = lo + Math.imul(al1, bl6) | 0, mid = mid + Math.imul(al1, bh6) | 0, mid = mid + Math.imul(ah1, bl6) | 0, hi = hi + Math.imul(ah1, bh6) | 0, lo = lo + Math.imul(al0, bl7) | 0, mid = mid + Math.imul(al0, bh7) | 0, mid = mid + Math.imul(ah0, bl7) | 0, hi = hi + Math.imul(ah0, bh7) | 0;
        var w7 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0, w7 &= 67108863, lo = Math.imul(al8, bl0), mid = Math.imul(al8, bh0), mid = mid + Math.imul(ah8, bl0) | 0, hi = Math.imul(ah8, bh0), lo = lo + Math.imul(al7, bl1) | 0, mid = mid + Math.imul(al7, bh1) | 0, mid = mid + Math.imul(ah7, bl1) | 0, hi = hi + Math.imul(ah7, bh1) | 0, lo = lo + Math.imul(al6, bl2) | 0, mid = mid + Math.imul(al6, bh2) | 0, mid = mid + Math.imul(ah6, bl2) | 0, hi = hi + Math.imul(ah6, bh2) | 0, lo = lo + Math.imul(al5, bl3) | 0, mid = mid + Math.imul(al5, bh3) | 0, mid = mid + Math.imul(ah5, bl3) | 0, hi = hi + Math.imul(ah5, bh3) | 0, lo = lo + Math.imul(al4, bl4) | 0, mid = mid + Math.imul(al4, bh4) | 0, mid = mid + Math.imul(ah4, bl4) | 0, hi = hi + Math.imul(ah4, bh4) | 0, lo = lo + Math.imul(al3, bl5) | 0, mid = mid + Math.imul(al3, bh5) | 0, mid = mid + Math.imul(ah3, bl5) | 0, hi = hi + Math.imul(ah3, bh5) | 0, lo = lo + Math.imul(al2, bl6) | 0, mid = mid + Math.imul(al2, bh6) | 0, mid = mid + Math.imul(ah2, bl6) | 0, hi = hi + Math.imul(ah2, bh6) | 0, lo = lo + Math.imul(al1, bl7) | 0, mid = mid + Math.imul(al1, bh7) | 0, mid = mid + Math.imul(ah1, bl7) | 0, hi = hi + Math.imul(ah1, bh7) | 0, lo = lo + Math.imul(al0, bl8) | 0, mid = mid + Math.imul(al0, bh8) | 0, mid = mid + Math.imul(ah0, bl8) | 0, hi = hi + Math.imul(ah0, bh8) | 0;
        var w8 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0, w8 &= 67108863, lo = Math.imul(al9, bl0), mid = Math.imul(al9, bh0), mid = mid + Math.imul(ah9, bl0) | 0, hi = Math.imul(ah9, bh0), lo = lo + Math.imul(al8, bl1) | 0, mid = mid + Math.imul(al8, bh1) | 0, mid = mid + Math.imul(ah8, bl1) | 0, hi = hi + Math.imul(ah8, bh1) | 0, lo = lo + Math.imul(al7, bl2) | 0, mid = mid + Math.imul(al7, bh2) | 0, mid = mid + Math.imul(ah7, bl2) | 0, hi = hi + Math.imul(ah7, bh2) | 0, lo = lo + Math.imul(al6, bl3) | 0, mid = mid + Math.imul(al6, bh3) | 0, mid = mid + Math.imul(ah6, bl3) | 0, hi = hi + Math.imul(ah6, bh3) | 0, lo = lo + Math.imul(al5, bl4) | 0, mid = mid + Math.imul(al5, bh4) | 0, mid = mid + Math.imul(ah5, bl4) | 0, hi = hi + Math.imul(ah5, bh4) | 0, lo = lo + Math.imul(al4, bl5) | 0, mid = mid + Math.imul(al4, bh5) | 0, mid = mid + Math.imul(ah4, bl5) | 0, hi = hi + Math.imul(ah4, bh5) | 0, lo = lo + Math.imul(al3, bl6) | 0, mid = mid + Math.imul(al3, bh6) | 0, mid = mid + Math.imul(ah3, bl6) | 0, hi = hi + Math.imul(ah3, bh6) | 0, lo = lo + Math.imul(al2, bl7) | 0, mid = mid + Math.imul(al2, bh7) | 0, mid = mid + Math.imul(ah2, bl7) | 0, hi = hi + Math.imul(ah2, bh7) | 0, lo = lo + Math.imul(al1, bl8) | 0, mid = mid + Math.imul(al1, bh8) | 0, mid = mid + Math.imul(ah1, bl8) | 0, hi = hi + Math.imul(ah1, bh8) | 0, lo = lo + Math.imul(al0, bl9) | 0, mid = mid + Math.imul(al0, bh9) | 0, mid = mid + Math.imul(ah0, bl9) | 0, hi = hi + Math.imul(ah0, bh9) | 0;
        var w9 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0, w9 &= 67108863, lo = Math.imul(al9, bl1), mid = Math.imul(al9, bh1), mid = mid + Math.imul(ah9, bl1) | 0, hi = Math.imul(ah9, bh1), lo = lo + Math.imul(al8, bl2) | 0, mid = mid + Math.imul(al8, bh2) | 0, mid = mid + Math.imul(ah8, bl2) | 0, hi = hi + Math.imul(ah8, bh2) | 0, lo = lo + Math.imul(al7, bl3) | 0, mid = mid + Math.imul(al7, bh3) | 0, mid = mid + Math.imul(ah7, bl3) | 0, hi = hi + Math.imul(ah7, bh3) | 0, lo = lo + Math.imul(al6, bl4) | 0, mid = mid + Math.imul(al6, bh4) | 0, mid = mid + Math.imul(ah6, bl4) | 0, hi = hi + Math.imul(ah6, bh4) | 0, lo = lo + Math.imul(al5, bl5) | 0, mid = mid + Math.imul(al5, bh5) | 0, mid = mid + Math.imul(ah5, bl5) | 0, hi = hi + Math.imul(ah5, bh5) | 0, lo = lo + Math.imul(al4, bl6) | 0, mid = mid + Math.imul(al4, bh6) | 0, mid = mid + Math.imul(ah4, bl6) | 0, hi = hi + Math.imul(ah4, bh6) | 0, lo = lo + Math.imul(al3, bl7) | 0, mid = mid + Math.imul(al3, bh7) | 0, mid = mid + Math.imul(ah3, bl7) | 0, hi = hi + Math.imul(ah3, bh7) | 0, lo = lo + Math.imul(al2, bl8) | 0, mid = mid + Math.imul(al2, bh8) | 0, mid = mid + Math.imul(ah2, bl8) | 0, hi = hi + Math.imul(ah2, bh8) | 0, lo = lo + Math.imul(al1, bl9) | 0, mid = mid + Math.imul(al1, bh9) | 0, mid = mid + Math.imul(ah1, bl9) | 0, hi = hi + Math.imul(ah1, bh9) | 0;
        var w10 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0, w10 &= 67108863, lo = Math.imul(al9, bl2), mid = Math.imul(al9, bh2), mid = mid + Math.imul(ah9, bl2) | 0, hi = Math.imul(ah9, bh2), lo = lo + Math.imul(al8, bl3) | 0, mid = mid + Math.imul(al8, bh3) | 0, mid = mid + Math.imul(ah8, bl3) | 0, hi = hi + Math.imul(ah8, bh3) | 0, lo = lo + Math.imul(al7, bl4) | 0, mid = mid + Math.imul(al7, bh4) | 0, mid = mid + Math.imul(ah7, bl4) | 0, hi = hi + Math.imul(ah7, bh4) | 0, lo = lo + Math.imul(al6, bl5) | 0, mid = mid + Math.imul(al6, bh5) | 0, mid = mid + Math.imul(ah6, bl5) | 0, hi = hi + Math.imul(ah6, bh5) | 0, lo = lo + Math.imul(al5, bl6) | 0, mid = mid + Math.imul(al5, bh6) | 0, mid = mid + Math.imul(ah5, bl6) | 0, hi = hi + Math.imul(ah5, bh6) | 0, lo = lo + Math.imul(al4, bl7) | 0, mid = mid + Math.imul(al4, bh7) | 0, mid = mid + Math.imul(ah4, bl7) | 0, hi = hi + Math.imul(ah4, bh7) | 0, lo = lo + Math.imul(al3, bl8) | 0, mid = mid + Math.imul(al3, bh8) | 0, mid = mid + Math.imul(ah3, bl8) | 0, hi = hi + Math.imul(ah3, bh8) | 0, lo = lo + Math.imul(al2, bl9) | 0, mid = mid + Math.imul(al2, bh9) | 0, mid = mid + Math.imul(ah2, bl9) | 0, hi = hi + Math.imul(ah2, bh9) | 0;
        var w11 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0, w11 &= 67108863, lo = Math.imul(al9, bl3), mid = Math.imul(al9, bh3), mid = mid + Math.imul(ah9, bl3) | 0, hi = Math.imul(ah9, bh3), lo = lo + Math.imul(al8, bl4) | 0, mid = mid + Math.imul(al8, bh4) | 0, mid = mid + Math.imul(ah8, bl4) | 0, hi = hi + Math.imul(ah8, bh4) | 0, lo = lo + Math.imul(al7, bl5) | 0, mid = mid + Math.imul(al7, bh5) | 0, mid = mid + Math.imul(ah7, bl5) | 0, hi = hi + Math.imul(ah7, bh5) | 0, lo = lo + Math.imul(al6, bl6) | 0, mid = mid + Math.imul(al6, bh6) | 0, mid = mid + Math.imul(ah6, bl6) | 0, hi = hi + Math.imul(ah6, bh6) | 0, lo = lo + Math.imul(al5, bl7) | 0, mid = mid + Math.imul(al5, bh7) | 0, mid = mid + Math.imul(ah5, bl7) | 0, hi = hi + Math.imul(ah5, bh7) | 0, lo = lo + Math.imul(al4, bl8) | 0, mid = mid + Math.imul(al4, bh8) | 0, mid = mid + Math.imul(ah4, bl8) | 0, hi = hi + Math.imul(ah4, bh8) | 0, lo = lo + Math.imul(al3, bl9) | 0, mid = mid + Math.imul(al3, bh9) | 0, mid = mid + Math.imul(ah3, bl9) | 0, hi = hi + Math.imul(ah3, bh9) | 0;
        var w12 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0, w12 &= 67108863, lo = Math.imul(al9, bl4), mid = Math.imul(al9, bh4), mid = mid + Math.imul(ah9, bl4) | 0, hi = Math.imul(ah9, bh4), lo = lo + Math.imul(al8, bl5) | 0, mid = mid + Math.imul(al8, bh5) | 0, mid = mid + Math.imul(ah8, bl5) | 0, hi = hi + Math.imul(ah8, bh5) | 0, lo = lo + Math.imul(al7, bl6) | 0, mid = mid + Math.imul(al7, bh6) | 0, mid = mid + Math.imul(ah7, bl6) | 0, hi = hi + Math.imul(ah7, bh6) | 0, lo = lo + Math.imul(al6, bl7) | 0, mid = mid + Math.imul(al6, bh7) | 0, mid = mid + Math.imul(ah6, bl7) | 0, hi = hi + Math.imul(ah6, bh7) | 0, lo = lo + Math.imul(al5, bl8) | 0, mid = mid + Math.imul(al5, bh8) | 0, mid = mid + Math.imul(ah5, bl8) | 0, hi = hi + Math.imul(ah5, bh8) | 0, lo = lo + Math.imul(al4, bl9) | 0, mid = mid + Math.imul(al4, bh9) | 0, mid = mid + Math.imul(ah4, bl9) | 0, hi = hi + Math.imul(ah4, bh9) | 0;
        var w13 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0, w13 &= 67108863, lo = Math.imul(al9, bl5), mid = Math.imul(al9, bh5), mid = mid + Math.imul(ah9, bl5) | 0, hi = Math.imul(ah9, bh5), lo = lo + Math.imul(al8, bl6) | 0, mid = mid + Math.imul(al8, bh6) | 0, mid = mid + Math.imul(ah8, bl6) | 0, hi = hi + Math.imul(ah8, bh6) | 0, lo = lo + Math.imul(al7, bl7) | 0, mid = mid + Math.imul(al7, bh7) | 0, mid = mid + Math.imul(ah7, bl7) | 0, hi = hi + Math.imul(ah7, bh7) | 0, lo = lo + Math.imul(al6, bl8) | 0, mid = mid + Math.imul(al6, bh8) | 0, mid = mid + Math.imul(ah6, bl8) | 0, hi = hi + Math.imul(ah6, bh8) | 0, lo = lo + Math.imul(al5, bl9) | 0, mid = mid + Math.imul(al5, bh9) | 0, mid = mid + Math.imul(ah5, bl9) | 0, hi = hi + Math.imul(ah5, bh9) | 0;
        var w14 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0, w14 &= 67108863, lo = Math.imul(al9, bl6), mid = Math.imul(al9, bh6), mid = mid + Math.imul(ah9, bl6) | 0, hi = Math.imul(ah9, bh6), lo = lo + Math.imul(al8, bl7) | 0, mid = mid + Math.imul(al8, bh7) | 0, mid = mid + Math.imul(ah8, bl7) | 0, hi = hi + Math.imul(ah8, bh7) | 0, lo = lo + Math.imul(al7, bl8) | 0, mid = mid + Math.imul(al7, bh8) | 0, mid = mid + Math.imul(ah7, bl8) | 0, hi = hi + Math.imul(ah7, bh8) | 0, lo = lo + Math.imul(al6, bl9) | 0, mid = mid + Math.imul(al6, bh9) | 0, mid = mid + Math.imul(ah6, bl9) | 0, hi = hi + Math.imul(ah6, bh9) | 0;
        var w15 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0, w15 &= 67108863, lo = Math.imul(al9, bl7), mid = Math.imul(al9, bh7), mid = mid + Math.imul(ah9, bl7) | 0, hi = Math.imul(ah9, bh7), lo = lo + Math.imul(al8, bl8) | 0, mid = mid + Math.imul(al8, bh8) | 0, mid = mid + Math.imul(ah8, bl8) | 0, hi = hi + Math.imul(ah8, bh8) | 0, lo = lo + Math.imul(al7, bl9) | 0, mid = mid + Math.imul(al7, bh9) | 0, mid = mid + Math.imul(ah7, bl9) | 0, hi = hi + Math.imul(ah7, bh9) | 0;
        var w16 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0, w16 &= 67108863, lo = Math.imul(al9, bl8), mid = Math.imul(al9, bh8), mid = mid + Math.imul(ah9, bl8) | 0, hi = Math.imul(ah9, bh8), lo = lo + Math.imul(al8, bl9) | 0, mid = mid + Math.imul(al8, bh9) | 0, mid = mid + Math.imul(ah8, bl9) | 0, hi = hi + Math.imul(ah8, bh9) | 0;
        var w17 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0, w17 &= 67108863, lo = Math.imul(al9, bl9), mid = Math.imul(al9, bh9), mid = mid + Math.imul(ah9, bl9) | 0, hi = Math.imul(ah9, bh9);
        var w18 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        if (c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0, w18 &= 67108863, o[0] = w0, o[1] = w1, o[2] = w2, o[3] = w3, o[4] = w4, o[5] = w5, o[6] = w6, o[7] = w7, o[8] = w8, o[9] = w9, o[10] = w10, o[11] = w11, o[12] = w12, o[13] = w13, o[14] = w14, o[15] = w15, o[16] = w16, o[17] = w17, o[18] = w18, c !== 0)
          o[19] = c, out.length++;
        return out;
      };
      if (!Math.imul)
        comb10MulTo = smallMulTo;
      function bigMulTo(self2, num, out) {
        out.negative = num.negative ^ self2.negative, out.length = self2.length + num.length;
        var carry = 0, hncarry = 0;
        for (var k = 0;k < out.length - 1; k++) {
          var ncarry = hncarry;
          hncarry = 0;
          var rword = carry & 67108863, maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self2.length + 1);j <= maxJ; j++) {
            var i2 = k - j, a = self2.words[i2] | 0, b = num.words[j] | 0, r = a * b, lo = r & 67108863;
            ncarry = ncarry + (r / 67108864 | 0) | 0, lo = lo + rword | 0, rword = lo & 67108863, ncarry = ncarry + (lo >>> 26) | 0, hncarry += ncarry >>> 26, ncarry &= 67108863;
          }
          out.words[k] = rword, carry = ncarry, ncarry = hncarry;
        }
        if (carry !== 0)
          out.words[k] = carry;
        else
          out.length--;
        return out.strip();
      }
      function jumboMulTo(self2, num, out) {
        var fftm = new FFTM;
        return fftm.mulp(self2, num, out);
      }
      BN.prototype.mulTo = function mulTo(num, out) {
        var res, len2 = this.length + num.length;
        if (this.length === 10 && num.length === 10)
          res = comb10MulTo(this, num, out);
        else if (len2 < 63)
          res = smallMulTo(this, num, out);
        else if (len2 < 1024)
          res = bigMulTo(this, num, out);
        else
          res = jumboMulTo(this, num, out);
        return res;
      };
      function FFTM(x, y) {
        this.x = x, this.y = y;
      }
      FFTM.prototype.makeRBT = function makeRBT(N) {
        var t = new Array(N), l = BN.prototype._countBits(N) - 1;
        for (var i2 = 0;i2 < N; i2++)
          t[i2] = this.revBin(i2, l, N);
        return t;
      }, FFTM.prototype.revBin = function revBin(x, l, N) {
        if (x === 0 || x === N - 1)
          return x;
        var rb = 0;
        for (var i2 = 0;i2 < l; i2++)
          rb |= (x & 1) << l - i2 - 1, x >>= 1;
        return rb;
      }, FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
        for (var i2 = 0;i2 < N; i2++)
          rtws[i2] = rws[rbt[i2]], itws[i2] = iws[rbt[i2]];
      }, FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
        this.permute(rbt, rws, iws, rtws, itws, N);
        for (var s = 1;s < N; s <<= 1) {
          var l = s << 1, rtwdf = Math.cos(2 * Math.PI / l), itwdf = Math.sin(2 * Math.PI / l);
          for (var p = 0;p < N; p += l) {
            var rtwdf_ = rtwdf, itwdf_ = itwdf;
            for (var j = 0;j < s; j++) {
              var re = rtws[p + j], ie = itws[p + j], ro = rtws[p + j + s], io = itws[p + j + s], rx = rtwdf_ * ro - itwdf_ * io;
              if (io = rtwdf_ * io + itwdf_ * ro, ro = rx, rtws[p + j] = re + ro, itws[p + j] = ie + io, rtws[p + j + s] = re - ro, itws[p + j + s] = ie - io, j !== l)
                rx = rtwdf * rtwdf_ - itwdf * itwdf_, itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_, rtwdf_ = rx;
            }
          }
        }
      }, FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
        var N = Math.max(m, n) | 1, odd = N & 1, i2 = 0;
        for (N = N / 2 | 0;N; N = N >>> 1)
          i2++;
        return 1 << i2 + 1 + odd;
      }, FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
        if (N <= 1)
          return;
        for (var i2 = 0;i2 < N / 2; i2++) {
          var t = rws[i2];
          rws[i2] = rws[N - i2 - 1], rws[N - i2 - 1] = t, t = iws[i2], iws[i2] = -iws[N - i2 - 1], iws[N - i2 - 1] = -t;
        }
      }, FFTM.prototype.normalize13b = function normalize13b(ws, N) {
        var carry = 0;
        for (var i2 = 0;i2 < N / 2; i2++) {
          var w = Math.round(ws[2 * i2 + 1] / N) * 8192 + Math.round(ws[2 * i2] / N) + carry;
          if (ws[i2] = w & 67108863, w < 67108864)
            carry = 0;
          else
            carry = w / 67108864 | 0;
        }
        return ws;
      }, FFTM.prototype.convert13b = function convert13b(ws, len2, rws, N) {
        var carry = 0;
        for (var i2 = 0;i2 < len2; i2++)
          carry = carry + (ws[i2] | 0), rws[2 * i2] = carry & 8191, carry = carry >>> 13, rws[2 * i2 + 1] = carry & 8191, carry = carry >>> 13;
        for (i2 = 2 * len2;i2 < N; ++i2)
          rws[i2] = 0;
        assert(carry === 0), assert((carry & -8192) === 0);
      }, FFTM.prototype.stub = function stub(N) {
        var ph = new Array(N);
        for (var i2 = 0;i2 < N; i2++)
          ph[i2] = 0;
        return ph;
      }, FFTM.prototype.mulp = function mulp(x, y, out) {
        var N = 2 * this.guessLen13b(x.length, y.length), rbt = this.makeRBT(N), _ = this.stub(N), rws = new Array(N), rwst = new Array(N), iwst = new Array(N), nrws = new Array(N), nrwst = new Array(N), niwst = new Array(N), rmws = out.words;
        rmws.length = N, this.convert13b(x.words, x.length, rws, N), this.convert13b(y.words, y.length, nrws, N), this.transform(rws, _, rwst, iwst, N, rbt), this.transform(nrws, _, nrwst, niwst, N, rbt);
        for (var i2 = 0;i2 < N; i2++) {
          var rx = rwst[i2] * nrwst[i2] - iwst[i2] * niwst[i2];
          iwst[i2] = rwst[i2] * niwst[i2] + iwst[i2] * nrwst[i2], rwst[i2] = rx;
        }
        return this.conjugate(rwst, iwst, N), this.transform(rwst, iwst, rmws, _, N, rbt), this.conjugate(rmws, _, N), this.normalize13b(rmws, N), out.negative = x.negative ^ y.negative, out.length = x.length + y.length, out.strip();
      }, BN.prototype.mul = function mul(num) {
        var out = new BN(null);
        return out.words = new Array(this.length + num.length), this.mulTo(num, out);
      }, BN.prototype.mulf = function mulf(num) {
        var out = new BN(null);
        return out.words = new Array(this.length + num.length), jumboMulTo(this, num, out);
      }, BN.prototype.imul = function imul(num) {
        return this.clone().mulTo(num, this);
      }, BN.prototype.imuln = function imuln(num) {
        assert(typeof num === "number"), assert(num < 67108864);
        var carry = 0;
        for (var i2 = 0;i2 < this.length; i2++) {
          var w = (this.words[i2] | 0) * num, lo = (w & 67108863) + (carry & 67108863);
          carry >>= 26, carry += w / 67108864 | 0, carry += lo >>> 26, this.words[i2] = lo & 67108863;
        }
        if (carry !== 0)
          this.words[i2] = carry, this.length++;
        return this.length = num === 0 ? 1 : this.length, this;
      }, BN.prototype.muln = function muln(num) {
        return this.clone().imuln(num);
      }, BN.prototype.sqr = function sqr() {
        return this.mul(this);
      }, BN.prototype.isqr = function isqr() {
        return this.imul(this.clone());
      }, BN.prototype.pow = function pow(num) {
        var w = toBitArray(num);
        if (w.length === 0)
          return new BN(1);
        var res = this;
        for (var i2 = 0;i2 < w.length; i2++, res = res.sqr())
          if (w[i2] !== 0)
            break;
        if (++i2 < w.length)
          for (var q = res.sqr();i2 < w.length; i2++, q = q.sqr()) {
            if (w[i2] === 0)
              continue;
            res = res.mul(q);
          }
        return res;
      }, BN.prototype.iushln = function iushln(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26, s = (bits - r) / 26, carryMask = 67108863 >>> 26 - r << 26 - r, i2;
        if (r !== 0) {
          var carry = 0;
          for (i2 = 0;i2 < this.length; i2++) {
            var newCarry = this.words[i2] & carryMask, c = (this.words[i2] | 0) - newCarry << r;
            this.words[i2] = c | carry, carry = newCarry >>> 26 - r;
          }
          if (carry)
            this.words[i2] = carry, this.length++;
        }
        if (s !== 0) {
          for (i2 = this.length - 1;i2 >= 0; i2--)
            this.words[i2 + s] = this.words[i2];
          for (i2 = 0;i2 < s; i2++)
            this.words[i2] = 0;
          this.length += s;
        }
        return this.strip();
      }, BN.prototype.ishln = function ishln(bits) {
        return assert(this.negative === 0), this.iushln(bits);
      }, BN.prototype.iushrn = function iushrn(bits, hint, extended) {
        assert(typeof bits === "number" && bits >= 0);
        var h;
        if (hint)
          h = (hint - hint % 26) / 26;
        else
          h = 0;
        var r = bits % 26, s = Math.min((bits - r) / 26, this.length), mask = 67108863 ^ 67108863 >>> r << r, maskedWords = extended;
        if (h -= s, h = Math.max(0, h), maskedWords) {
          for (var i2 = 0;i2 < s; i2++)
            maskedWords.words[i2] = this.words[i2];
          maskedWords.length = s;
        }
        if (s === 0)
          ;
        else if (this.length > s) {
          this.length -= s;
          for (i2 = 0;i2 < this.length; i2++)
            this.words[i2] = this.words[i2 + s];
        } else
          this.words[0] = 0, this.length = 1;
        var carry = 0;
        for (i2 = this.length - 1;i2 >= 0 && (carry !== 0 || i2 >= h); i2--) {
          var word = this.words[i2] | 0;
          this.words[i2] = carry << 26 - r | word >>> r, carry = word & mask;
        }
        if (maskedWords && carry !== 0)
          maskedWords.words[maskedWords.length++] = carry;
        if (this.length === 0)
          this.words[0] = 0, this.length = 1;
        return this.strip();
      }, BN.prototype.ishrn = function ishrn(bits, hint, extended) {
        return assert(this.negative === 0), this.iushrn(bits, hint, extended);
      }, BN.prototype.shln = function shln(bits) {
        return this.clone().ishln(bits);
      }, BN.prototype.ushln = function ushln(bits) {
        return this.clone().iushln(bits);
      }, BN.prototype.shrn = function shrn(bits) {
        return this.clone().ishrn(bits);
      }, BN.prototype.ushrn = function ushrn(bits) {
        return this.clone().iushrn(bits);
      }, BN.prototype.testn = function testn(bit) {
        assert(typeof bit === "number" && bit >= 0);
        var r = bit % 26, s = (bit - r) / 26, q = 1 << r;
        if (this.length <= s)
          return false;
        var w = this.words[s];
        return !!(w & q);
      }, BN.prototype.imaskn = function imaskn(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26, s = (bits - r) / 26;
        if (assert(this.negative === 0, "imaskn works only with positive numbers"), this.length <= s)
          return this;
        if (r !== 0)
          s++;
        if (this.length = Math.min(s, this.length), r !== 0) {
          var mask = 67108863 ^ 67108863 >>> r << r;
          this.words[this.length - 1] &= mask;
        }
        return this.strip();
      }, BN.prototype.maskn = function maskn(bits) {
        return this.clone().imaskn(bits);
      }, BN.prototype.iaddn = function iaddn(num) {
        if (assert(typeof num === "number"), assert(num < 67108864), num < 0)
          return this.isubn(-num);
        if (this.negative !== 0) {
          if (this.length === 1 && (this.words[0] | 0) < num)
            return this.words[0] = num - (this.words[0] | 0), this.negative = 0, this;
          return this.negative = 0, this.isubn(num), this.negative = 1, this;
        }
        return this._iaddn(num);
      }, BN.prototype._iaddn = function _iaddn(num) {
        this.words[0] += num;
        for (var i2 = 0;i2 < this.length && this.words[i2] >= 67108864; i2++)
          if (this.words[i2] -= 67108864, i2 === this.length - 1)
            this.words[i2 + 1] = 1;
          else
            this.words[i2 + 1]++;
        return this.length = Math.max(this.length, i2 + 1), this;
      }, BN.prototype.isubn = function isubn(num) {
        if (assert(typeof num === "number"), assert(num < 67108864), num < 0)
          return this.iaddn(-num);
        if (this.negative !== 0)
          return this.negative = 0, this.iaddn(num), this.negative = 1, this;
        if (this.words[0] -= num, this.length === 1 && this.words[0] < 0)
          this.words[0] = -this.words[0], this.negative = 1;
        else
          for (var i2 = 0;i2 < this.length && this.words[i2] < 0; i2++)
            this.words[i2] += 67108864, this.words[i2 + 1] -= 1;
        return this.strip();
      }, BN.prototype.addn = function addn(num) {
        return this.clone().iaddn(num);
      }, BN.prototype.subn = function subn(num) {
        return this.clone().isubn(num);
      }, BN.prototype.iabs = function iabs() {
        return this.negative = 0, this;
      }, BN.prototype.abs = function abs() {
        return this.clone().iabs();
      }, BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
        var len2 = num.length + shift, i2;
        this._expand(len2);
        var w, carry = 0;
        for (i2 = 0;i2 < num.length; i2++) {
          w = (this.words[i2 + shift] | 0) + carry;
          var right = (num.words[i2] | 0) * mul;
          w -= right & 67108863, carry = (w >> 26) - (right / 67108864 | 0), this.words[i2 + shift] = w & 67108863;
        }
        for (;i2 < this.length - shift; i2++)
          w = (this.words[i2 + shift] | 0) + carry, carry = w >> 26, this.words[i2 + shift] = w & 67108863;
        if (carry === 0)
          return this.strip();
        assert(carry === -1), carry = 0;
        for (i2 = 0;i2 < this.length; i2++)
          w = -(this.words[i2] | 0) + carry, carry = w >> 26, this.words[i2] = w & 67108863;
        return this.negative = 1, this.strip();
      }, BN.prototype._wordDiv = function _wordDiv(num, mode) {
        var shift = this.length - num.length, a = this.clone(), b = num, bhi = b.words[b.length - 1] | 0, bhiBits = this._countBits(bhi);
        if (shift = 26 - bhiBits, shift !== 0)
          b = b.ushln(shift), a.iushln(shift), bhi = b.words[b.length - 1] | 0;
        var m = a.length - b.length, q;
        if (mode !== "mod") {
          q = new BN(null), q.length = m + 1, q.words = new Array(q.length);
          for (var i2 = 0;i2 < q.length; i2++)
            q.words[i2] = 0;
        }
        var diff = a.clone()._ishlnsubmul(b, 1, m);
        if (diff.negative === 0) {
          if (a = diff, q)
            q.words[m] = 1;
        }
        for (var j = m - 1;j >= 0; j--) {
          var qj = (a.words[b.length + j] | 0) * 67108864 + (a.words[b.length + j - 1] | 0);
          qj = Math.min(qj / bhi | 0, 67108863), a._ishlnsubmul(b, qj, j);
          while (a.negative !== 0)
            if (qj--, a.negative = 0, a._ishlnsubmul(b, 1, j), !a.isZero())
              a.negative ^= 1;
          if (q)
            q.words[j] = qj;
        }
        if (q)
          q.strip();
        if (a.strip(), mode !== "div" && shift !== 0)
          a.iushrn(shift);
        return { div: q || null, mod: a };
      }, BN.prototype.divmod = function divmod(num, mode, positive) {
        if (assert(!num.isZero()), this.isZero())
          return { div: new BN(0), mod: new BN(0) };
        var div, mod, res;
        if (this.negative !== 0 && num.negative === 0) {
          if (res = this.neg().divmod(num, mode), mode !== "mod")
            div = res.div.neg();
          if (mode !== "div") {
            if (mod = res.mod.neg(), positive && mod.negative !== 0)
              mod.iadd(num);
          }
          return { div, mod };
        }
        if (this.negative === 0 && num.negative !== 0) {
          if (res = this.divmod(num.neg(), mode), mode !== "mod")
            div = res.div.neg();
          return { div, mod: res.mod };
        }
        if ((this.negative & num.negative) !== 0) {
          if (res = this.neg().divmod(num.neg(), mode), mode !== "div") {
            if (mod = res.mod.neg(), positive && mod.negative !== 0)
              mod.isub(num);
          }
          return { div: res.div, mod };
        }
        if (num.length > this.length || this.cmp(num) < 0)
          return { div: new BN(0), mod: this };
        if (num.length === 1) {
          if (mode === "div")
            return { div: this.divn(num.words[0]), mod: null };
          if (mode === "mod")
            return { div: null, mod: new BN(this.modn(num.words[0])) };
          return { div: this.divn(num.words[0]), mod: new BN(this.modn(num.words[0])) };
        }
        return this._wordDiv(num, mode);
      }, BN.prototype.div = function div(num) {
        return this.divmod(num, "div", false).div;
      }, BN.prototype.mod = function mod(num) {
        return this.divmod(num, "mod", false).mod;
      }, BN.prototype.umod = function umod(num) {
        return this.divmod(num, "mod", true).mod;
      }, BN.prototype.divRound = function divRound(num) {
        var dm = this.divmod(num);
        if (dm.mod.isZero())
          return dm.div;
        var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod, half = num.ushrn(1), r2 = num.andln(1), cmp = mod.cmp(half);
        if (cmp < 0 || r2 === 1 && cmp === 0)
          return dm.div;
        return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
      }, BN.prototype.modn = function modn(num) {
        assert(num <= 67108863);
        var p = 67108864 % num, acc = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--)
          acc = (p * acc + (this.words[i2] | 0)) % num;
        return acc;
      }, BN.prototype.idivn = function idivn(num) {
        assert(num <= 67108863);
        var carry = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          var w = (this.words[i2] | 0) + carry * 67108864;
          this.words[i2] = w / num | 0, carry = w % num;
        }
        return this.strip();
      }, BN.prototype.divn = function divn(num) {
        return this.clone().idivn(num);
      }, BN.prototype.egcd = function egcd(p) {
        assert(p.negative === 0), assert(!p.isZero());
        var x = this, y = p.clone();
        if (x.negative !== 0)
          x = x.umod(p);
        else
          x = x.clone();
        var A = new BN(1), B = new BN(0), C = new BN(0), D = new BN(1), g = 0;
        while (x.isEven() && y.isEven())
          x.iushrn(1), y.iushrn(1), ++g;
        var yp = y.clone(), xp = x.clone();
        while (!x.isZero()) {
          for (var i2 = 0, im = 1;(x.words[0] & im) === 0 && i2 < 26; ++i2, im <<= 1)
            ;
          if (i2 > 0) {
            x.iushrn(i2);
            while (i2-- > 0) {
              if (A.isOdd() || B.isOdd())
                A.iadd(yp), B.isub(xp);
              A.iushrn(1), B.iushrn(1);
            }
          }
          for (var j = 0, jm = 1;(y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
            ;
          if (j > 0) {
            y.iushrn(j);
            while (j-- > 0) {
              if (C.isOdd() || D.isOdd())
                C.iadd(yp), D.isub(xp);
              C.iushrn(1), D.iushrn(1);
            }
          }
          if (x.cmp(y) >= 0)
            x.isub(y), A.isub(C), B.isub(D);
          else
            y.isub(x), C.isub(A), D.isub(B);
        }
        return { a: C, b: D, gcd: y.iushln(g) };
      }, BN.prototype._invmp = function _invmp(p) {
        assert(p.negative === 0), assert(!p.isZero());
        var a = this, b = p.clone();
        if (a.negative !== 0)
          a = a.umod(p);
        else
          a = a.clone();
        var x1 = new BN(1), x2 = new BN(0), delta = b.clone();
        while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
          for (var i2 = 0, im = 1;(a.words[0] & im) === 0 && i2 < 26; ++i2, im <<= 1)
            ;
          if (i2 > 0) {
            a.iushrn(i2);
            while (i2-- > 0) {
              if (x1.isOdd())
                x1.iadd(delta);
              x1.iushrn(1);
            }
          }
          for (var j = 0, jm = 1;(b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
            ;
          if (j > 0) {
            b.iushrn(j);
            while (j-- > 0) {
              if (x2.isOdd())
                x2.iadd(delta);
              x2.iushrn(1);
            }
          }
          if (a.cmp(b) >= 0)
            a.isub(b), x1.isub(x2);
          else
            b.isub(a), x2.isub(x1);
        }
        var res;
        if (a.cmpn(1) === 0)
          res = x1;
        else
          res = x2;
        if (res.cmpn(0) < 0)
          res.iadd(p);
        return res;
      }, BN.prototype.gcd = function gcd(num) {
        if (this.isZero())
          return num.abs();
        if (num.isZero())
          return this.abs();
        var a = this.clone(), b = num.clone();
        a.negative = 0, b.negative = 0;
        for (var shift = 0;a.isEven() && b.isEven(); shift++)
          a.iushrn(1), b.iushrn(1);
        do {
          while (a.isEven())
            a.iushrn(1);
          while (b.isEven())
            b.iushrn(1);
          var r = a.cmp(b);
          if (r < 0) {
            var t = a;
            a = b, b = t;
          } else if (r === 0 || b.cmpn(1) === 0)
            break;
          a.isub(b);
        } while (true);
        return b.iushln(shift);
      }, BN.prototype.invm = function invm(num) {
        return this.egcd(num).a.umod(num);
      }, BN.prototype.isEven = function isEven() {
        return (this.words[0] & 1) === 0;
      }, BN.prototype.isOdd = function isOdd() {
        return (this.words[0] & 1) === 1;
      }, BN.prototype.andln = function andln(num) {
        return this.words[0] & num;
      }, BN.prototype.bincn = function bincn(bit) {
        assert(typeof bit === "number");
        var r = bit % 26, s = (bit - r) / 26, q = 1 << r;
        if (this.length <= s)
          return this._expand(s + 1), this.words[s] |= q, this;
        var carry = q;
        for (var i2 = s;carry !== 0 && i2 < this.length; i2++) {
          var w = this.words[i2] | 0;
          w += carry, carry = w >>> 26, w &= 67108863, this.words[i2] = w;
        }
        if (carry !== 0)
          this.words[i2] = carry, this.length++;
        return this;
      }, BN.prototype.isZero = function isZero() {
        return this.length === 1 && this.words[0] === 0;
      }, BN.prototype.cmpn = function cmpn(num) {
        var negative = num < 0;
        if (this.negative !== 0 && !negative)
          return -1;
        if (this.negative === 0 && negative)
          return 1;
        this.strip();
        var res;
        if (this.length > 1)
          res = 1;
        else {
          if (negative)
            num = -num;
          assert(num <= 67108863, "Number is too big");
          var w = this.words[0] | 0;
          res = w === num ? 0 : w < num ? -1 : 1;
        }
        if (this.negative !== 0)
          return -res | 0;
        return res;
      }, BN.prototype.cmp = function cmp(num) {
        if (this.negative !== 0 && num.negative === 0)
          return -1;
        if (this.negative === 0 && num.negative !== 0)
          return 1;
        var res = this.ucmp(num);
        if (this.negative !== 0)
          return -res | 0;
        return res;
      }, BN.prototype.ucmp = function ucmp(num) {
        if (this.length > num.length)
          return 1;
        if (this.length < num.length)
          return -1;
        var res = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          var a = this.words[i2] | 0, b = num.words[i2] | 0;
          if (a === b)
            continue;
          if (a < b)
            res = -1;
          else if (a > b)
            res = 1;
          break;
        }
        return res;
      }, BN.prototype.gtn = function gtn(num) {
        return this.cmpn(num) === 1;
      }, BN.prototype.gt = function gt(num) {
        return this.cmp(num) === 1;
      }, BN.prototype.gten = function gten(num) {
        return this.cmpn(num) >= 0;
      }, BN.prototype.gte = function gte(num) {
        return this.cmp(num) >= 0;
      }, BN.prototype.ltn = function ltn(num) {
        return this.cmpn(num) === -1;
      }, BN.prototype.lt = function lt(num) {
        return this.cmp(num) === -1;
      }, BN.prototype.lten = function lten(num) {
        return this.cmpn(num) <= 0;
      }, BN.prototype.lte = function lte(num) {
        return this.cmp(num) <= 0;
      }, BN.prototype.eqn = function eqn(num) {
        return this.cmpn(num) === 0;
      }, BN.prototype.eq = function eq(num) {
        return this.cmp(num) === 0;
      }, BN.red = function red(num) {
        return new Red(num);
      }, BN.prototype.toRed = function toRed(ctx) {
        return assert(!this.red, "Already a number in reduction context"), assert(this.negative === 0, "red works only with positives"), ctx.convertTo(this)._forceRed(ctx);
      }, BN.prototype.fromRed = function fromRed() {
        return assert(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this);
      }, BN.prototype._forceRed = function _forceRed(ctx) {
        return this.red = ctx, this;
      }, BN.prototype.forceRed = function forceRed(ctx) {
        return assert(!this.red, "Already a number in reduction context"), this._forceRed(ctx);
      }, BN.prototype.redAdd = function redAdd(num) {
        return assert(this.red, "redAdd works only with red numbers"), this.red.add(this, num);
      }, BN.prototype.redIAdd = function redIAdd(num) {
        return assert(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, num);
      }, BN.prototype.redSub = function redSub(num) {
        return assert(this.red, "redSub works only with red numbers"), this.red.sub(this, num);
      }, BN.prototype.redISub = function redISub(num) {
        return assert(this.red, "redISub works only with red numbers"), this.red.isub(this, num);
      }, BN.prototype.redShl = function redShl(num) {
        return assert(this.red, "redShl works only with red numbers"), this.red.shl(this, num);
      }, BN.prototype.redMul = function redMul(num) {
        return assert(this.red, "redMul works only with red numbers"), this.red._verify2(this, num), this.red.mul(this, num);
      }, BN.prototype.redIMul = function redIMul(num) {
        return assert(this.red, "redMul works only with red numbers"), this.red._verify2(this, num), this.red.imul(this, num);
      }, BN.prototype.redSqr = function redSqr() {
        return assert(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this);
      }, BN.prototype.redISqr = function redISqr() {
        return assert(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this);
      }, BN.prototype.redSqrt = function redSqrt() {
        return assert(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this);
      }, BN.prototype.redInvm = function redInvm() {
        return assert(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this);
      }, BN.prototype.redNeg = function redNeg() {
        return assert(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this);
      }, BN.prototype.redPow = function redPow(num) {
        return assert(this.red && !num.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, num);
      };
      var primes = { k256: null, p224: null, p192: null, p25519: null };
      function MPrime(name, p) {
        this.name = name, this.p = new BN(p, 16), this.n = this.p.bitLength(), this.k = new BN(1).iushln(this.n).isub(this.p), this.tmp = this._tmp();
      }
      MPrime.prototype._tmp = function _tmp() {
        var tmp = new BN(null);
        return tmp.words = new Array(Math.ceil(this.n / 13)), tmp;
      }, MPrime.prototype.ireduce = function ireduce(num) {
        var r = num, rlen;
        do
          this.split(r, this.tmp), r = this.imulK(r), r = r.iadd(this.tmp), rlen = r.bitLength();
        while (rlen > this.n);
        var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
        if (cmp === 0)
          r.words[0] = 0, r.length = 1;
        else if (cmp > 0)
          r.isub(this.p);
        else if (r.strip !== undefined)
          r.strip();
        else
          r._strip();
        return r;
      }, MPrime.prototype.split = function split(input, out) {
        input.iushrn(this.n, 0, out);
      }, MPrime.prototype.imulK = function imulK(num) {
        return num.imul(this.k);
      };
      function K256() {
        MPrime.call(this, "k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");
      }
      inherits2(K256, MPrime), K256.prototype.split = function split(input, output) {
        var mask = 4194303, outLen = Math.min(input.length, 9);
        for (var i2 = 0;i2 < outLen; i2++)
          output.words[i2] = input.words[i2];
        if (output.length = outLen, input.length <= 9) {
          input.words[0] = 0, input.length = 1;
          return;
        }
        var prev = input.words[9];
        output.words[output.length++] = prev & mask;
        for (i2 = 10;i2 < input.length; i2++) {
          var next = input.words[i2] | 0;
          input.words[i2 - 10] = (next & mask) << 4 | prev >>> 22, prev = next;
        }
        if (prev >>>= 22, input.words[i2 - 10] = prev, prev === 0 && input.length > 10)
          input.length -= 10;
        else
          input.length -= 9;
      }, K256.prototype.imulK = function imulK(num) {
        num.words[num.length] = 0, num.words[num.length + 1] = 0, num.length += 2;
        var lo = 0;
        for (var i2 = 0;i2 < num.length; i2++) {
          var w = num.words[i2] | 0;
          lo += w * 977, num.words[i2] = lo & 67108863, lo = w * 64 + (lo / 67108864 | 0);
        }
        if (num.words[num.length - 1] === 0) {
          if (num.length--, num.words[num.length - 1] === 0)
            num.length--;
        }
        return num;
      };
      function P224() {
        MPrime.call(this, "p224", "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001");
      }
      inherits2(P224, MPrime);
      function P192() {
        MPrime.call(this, "p192", "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff");
      }
      inherits2(P192, MPrime);
      function P25519() {
        MPrime.call(this, "25519", "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed");
      }
      inherits2(P25519, MPrime), P25519.prototype.imulK = function imulK(num) {
        var carry = 0;
        for (var i2 = 0;i2 < num.length; i2++) {
          var hi = (num.words[i2] | 0) * 19 + carry, lo = hi & 67108863;
          hi >>>= 26, num.words[i2] = lo, carry = hi;
        }
        if (carry !== 0)
          num.words[num.length++] = carry;
        return num;
      }, BN._prime = function prime(name) {
        if (primes[name])
          return primes[name];
        var prime;
        if (name === "k256")
          prime = new K256;
        else if (name === "p224")
          prime = new P224;
        else if (name === "p192")
          prime = new P192;
        else if (name === "p25519")
          prime = new P25519;
        else
          throw new Error("Unknown prime " + name);
        return primes[name] = prime, prime;
      };
      function Red(m) {
        if (typeof m === "string") {
          var prime = BN._prime(m);
          this.m = prime.p, this.prime = prime;
        } else
          assert(m.gtn(1), "modulus must be greater than 1"), this.m = m, this.prime = null;
      }
      Red.prototype._verify1 = function _verify1(a) {
        assert(a.negative === 0, "red works only with positives"), assert(a.red, "red works only with red numbers");
      }, Red.prototype._verify2 = function _verify2(a, b) {
        assert((a.negative | b.negative) === 0, "red works only with positives"), assert(a.red && a.red === b.red, "red works only with red numbers");
      }, Red.prototype.imod = function imod(a) {
        if (this.prime)
          return this.prime.ireduce(a)._forceRed(this);
        return a.umod(this.m)._forceRed(this);
      }, Red.prototype.neg = function neg(a) {
        if (a.isZero())
          return a.clone();
        return this.m.sub(a)._forceRed(this);
      }, Red.prototype.add = function add(a, b) {
        this._verify2(a, b);
        var res = a.add(b);
        if (res.cmp(this.m) >= 0)
          res.isub(this.m);
        return res._forceRed(this);
      }, Red.prototype.iadd = function iadd(a, b) {
        this._verify2(a, b);
        var res = a.iadd(b);
        if (res.cmp(this.m) >= 0)
          res.isub(this.m);
        return res;
      }, Red.prototype.sub = function sub(a, b) {
        this._verify2(a, b);
        var res = a.sub(b);
        if (res.cmpn(0) < 0)
          res.iadd(this.m);
        return res._forceRed(this);
      }, Red.prototype.isub = function isub(a, b) {
        this._verify2(a, b);
        var res = a.isub(b);
        if (res.cmpn(0) < 0)
          res.iadd(this.m);
        return res;
      }, Red.prototype.shl = function shl(a, num) {
        return this._verify1(a), this.imod(a.ushln(num));
      }, Red.prototype.imul = function imul(a, b) {
        return this._verify2(a, b), this.imod(a.imul(b));
      }, Red.prototype.mul = function mul(a, b) {
        return this._verify2(a, b), this.imod(a.mul(b));
      }, Red.prototype.isqr = function isqr(a) {
        return this.imul(a, a.clone());
      }, Red.prototype.sqr = function sqr(a) {
        return this.mul(a, a);
      }, Red.prototype.sqrt = function sqrt(a) {
        if (a.isZero())
          return a.clone();
        var mod3 = this.m.andln(3);
        if (assert(mod3 % 2 === 1), mod3 === 3) {
          var pow = this.m.add(new BN(1)).iushrn(2);
          return this.pow(a, pow);
        }
        var q = this.m.subn(1), s = 0;
        while (!q.isZero() && q.andln(1) === 0)
          s++, q.iushrn(1);
        assert(!q.isZero());
        var one = new BN(1).toRed(this), nOne = one.redNeg(), lpow = this.m.subn(1).iushrn(1), z = this.m.bitLength();
        z = new BN(2 * z * z).toRed(this);
        while (this.pow(z, lpow).cmp(nOne) !== 0)
          z.redIAdd(nOne);
        var c = this.pow(z, q), r = this.pow(a, q.addn(1).iushrn(1)), t = this.pow(a, q), m = s;
        while (t.cmp(one) !== 0) {
          var tmp = t;
          for (var i2 = 0;tmp.cmp(one) !== 0; i2++)
            tmp = tmp.redSqr();
          assert(i2 < m);
          var b = this.pow(c, new BN(1).iushln(m - i2 - 1));
          r = r.redMul(b), c = b.redSqr(), t = t.redMul(c), m = i2;
        }
        return r;
      }, Red.prototype.invm = function invm(a) {
        var inv = a._invmp(this.m);
        if (inv.negative !== 0)
          return inv.negative = 0, this.imod(inv).redNeg();
        else
          return this.imod(inv);
      }, Red.prototype.pow = function pow(a, num) {
        if (num.isZero())
          return new BN(1).toRed(this);
        if (num.cmpn(1) === 0)
          return a.clone();
        var windowSize = 4, wnd = new Array(1 << windowSize);
        wnd[0] = new BN(1).toRed(this), wnd[1] = a;
        for (var i2 = 2;i2 < wnd.length; i2++)
          wnd[i2] = this.mul(wnd[i2 - 1], a);
        var res = wnd[0], current = 0, currentLen = 0, start = num.bitLength() % 26;
        if (start === 0)
          start = 26;
        for (i2 = num.length - 1;i2 >= 0; i2--) {
          var word = num.words[i2];
          for (var j = start - 1;j >= 0; j--) {
            var bit = word >> j & 1;
            if (res !== wnd[0])
              res = this.sqr(res);
            if (bit === 0 && current === 0) {
              currentLen = 0;
              continue;
            }
            if (current <<= 1, current |= bit, currentLen++, currentLen !== windowSize && (i2 !== 0 || j !== 0))
              continue;
            res = this.mul(res, wnd[current]), currentLen = 0, current = 0;
          }
          start = 26;
        }
        return res;
      }, Red.prototype.convertTo = function convertTo(num) {
        var r = num.umod(this.m);
        return r === num ? r.clone() : r;
      }, Red.prototype.convertFrom = function convertFrom(num) {
        var res = num.clone();
        return res.red = null, res;
      }, BN.mont = function mont(num) {
        return new Mont(num);
      };
      function Mont(m) {
        if (Red.call(this, m), this.shift = this.m.bitLength(), this.shift % 26 !== 0)
          this.shift += 26 - this.shift % 26;
        this.r = new BN(1).iushln(this.shift), this.r2 = this.imod(this.r.sqr()), this.rinv = this.r._invmp(this.m), this.minv = this.rinv.mul(this.r).isubn(1).div(this.m), this.minv = this.minv.umod(this.r), this.minv = this.r.sub(this.minv);
      }
      inherits2(Mont, Red), Mont.prototype.convertTo = function convertTo(num) {
        return this.imod(num.ushln(this.shift));
      }, Mont.prototype.convertFrom = function convertFrom(num) {
        var r = this.imod(num.mul(this.rinv));
        return r.red = null, r;
      }, Mont.prototype.imul = function imul(a, b) {
        if (a.isZero() || b.isZero())
          return a.words[0] = 0, a.length = 1, a;
        var t = a.imul(b), c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), u = t.isub(c).iushrn(this.shift), res = u;
        if (u.cmp(this.m) >= 0)
          res = u.isub(this.m);
        else if (u.cmpn(0) < 0)
          res = u.iadd(this.m);
        return res._forceRed(this);
      }, Mont.prototype.mul = function mul(a, b) {
        if (a.isZero() || b.isZero())
          return new BN(0)._forceRed(this);
        var t = a.mul(b), c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), u = t.isub(c).iushrn(this.shift), res = u;
        if (u.cmp(this.m) >= 0)
          res = u.isub(this.m);
        else if (u.cmpn(0) < 0)
          res = u.iadd(this.m);
        return res._forceRed(this);
      }, Mont.prototype.invm = function invm(a) {
        var res = this.imod(a._invmp(this.m).mul(this.r2));
        return res._forceRed(this);
      };
    })(typeof module === "undefined" || module, exports);
  });
  require_api = __commonJS2((exports) => {
    var asn1 = require_asn1(), inherits2 = require_inherits(), api = exports;
    api.define = function define(name, body) {
      return new Entity(name, body);
    };
    function Entity(name, body) {
      this.name = name, this.body = body, this.decoders = {}, this.encoders = {};
    }
    Entity.prototype._createNamed = function createNamed(base) {
      var named;
      try {
        named = (()=>{throw new Error("Cannot require module "+"vm");})().runInThisContext("(function " + this.name + `(entity) {
  this._initNamed(entity);
})`);
      } catch (e) {
        named = function(entity) {
          this._initNamed(entity);
        };
      }
      return inherits2(named, base), named.prototype._initNamed = function initnamed(entity) {
        base.call(this, entity);
      }, new named(this);
    };
    Entity.prototype._getDecoder = function _getDecoder(enc) {
      if (enc = enc || "der", !this.decoders.hasOwnProperty(enc))
        this.decoders[enc] = this._createNamed(asn1.decoders[enc]);
      return this.decoders[enc];
    };
    Entity.prototype.decode = function decode(data, enc, options) {
      return this._getDecoder(enc).decode(data, options);
    };
    Entity.prototype._getEncoder = function _getEncoder(enc) {
      if (enc = enc || "der", !this.encoders.hasOwnProperty(enc))
        this.encoders[enc] = this._createNamed(asn1.encoders[enc]);
      return this.encoders[enc];
    };
    Entity.prototype.encode = function encode(data, enc, reporter) {
      return this._getEncoder(enc).encode(data, reporter);
    };
  });
  require_reporter = __commonJS2((exports) => {
    var inherits2 = require_inherits();
    function Reporter(options) {
      this._reporterState = { obj: null, path: [], options: options || {}, errors: [] };
    }
    exports.Reporter = Reporter;
    Reporter.prototype.isError = function isError(obj) {
      return obj instanceof ReporterError;
    };
    Reporter.prototype.save = function save() {
      var state = this._reporterState;
      return { obj: state.obj, pathLen: state.path.length };
    };
    Reporter.prototype.restore = function restore(data) {
      var state = this._reporterState;
      state.obj = data.obj, state.path = state.path.slice(0, data.pathLen);
    };
    Reporter.prototype.enterKey = function enterKey(key) {
      return this._reporterState.path.push(key);
    };
    Reporter.prototype.exitKey = function exitKey(index) {
      var state = this._reporterState;
      state.path = state.path.slice(0, index - 1);
    };
    Reporter.prototype.leaveKey = function leaveKey(index, key, value) {
      var state = this._reporterState;
      if (this.exitKey(index), state.obj !== null)
        state.obj[key] = value;
    };
    Reporter.prototype.path = function path() {
      return this._reporterState.path.join("/");
    };
    Reporter.prototype.enterObject = function enterObject() {
      var state = this._reporterState, prev = state.obj;
      return state.obj = {}, prev;
    };
    Reporter.prototype.leaveObject = function leaveObject(prev) {
      var state = this._reporterState, now = state.obj;
      return state.obj = prev, now;
    };
    Reporter.prototype.error = function error(msg) {
      var err, state = this._reporterState, inherited = msg instanceof ReporterError;
      if (inherited)
        err = msg;
      else
        err = new ReporterError(state.path.map(function(elem) {
          return "[" + JSON.stringify(elem) + "]";
        }).join(""), msg.message || msg, msg.stack);
      if (!state.options.partial)
        throw err;
      if (!inherited)
        state.errors.push(err);
      return err;
    };
    Reporter.prototype.wrapResult = function wrapResult(result) {
      var state = this._reporterState;
      if (!state.options.partial)
        return result;
      return { result: this.isError(result) ? null : result, errors: state.errors };
    };
    function ReporterError(path, msg) {
      this.path = path, this.rethrow(msg);
    }
    inherits2(ReporterError, Error);
    ReporterError.prototype.rethrow = function rethrow(msg) {
      if (this.message = msg + " at: " + (this.path || "(shallow)"), Error.captureStackTrace)
        Error.captureStackTrace(this, ReporterError);
      if (!this.stack)
        try {
          throw new Error(this.message);
        } catch (e) {
          this.stack = e.stack;
        }
      return this;
    };
  });
  require_buffer = __commonJS2((exports) => {
    var inherits2 = require_inherits(), Reporter = require_base2().Reporter, Buffer22 = (init_buffer(), __toCommonJS(exports_buffer)).Buffer;
    function DecoderBuffer(base, options) {
      if (Reporter.call(this, options), !Buffer22.isBuffer(base)) {
        this.error("Input not Buffer");
        return;
      }
      this.base = base, this.offset = 0, this.length = base.length;
    }
    inherits2(DecoderBuffer, Reporter);
    exports.DecoderBuffer = DecoderBuffer;
    DecoderBuffer.prototype.save = function save() {
      return { offset: this.offset, reporter: Reporter.prototype.save.call(this) };
    };
    DecoderBuffer.prototype.restore = function restore(save) {
      var res = new DecoderBuffer(this.base);
      return res.offset = save.offset, res.length = this.offset, this.offset = save.offset, Reporter.prototype.restore.call(this, save.reporter), res;
    };
    DecoderBuffer.prototype.isEmpty = function isEmpty() {
      return this.offset === this.length;
    };
    DecoderBuffer.prototype.readUInt8 = function readUInt8(fail) {
      if (this.offset + 1 <= this.length)
        return this.base.readUInt8(this.offset++, true);
      else
        return this.error(fail || "DecoderBuffer overrun");
    };
    DecoderBuffer.prototype.skip = function skip(bytes, fail) {
      if (!(this.offset + bytes <= this.length))
        return this.error(fail || "DecoderBuffer overrun");
      var res = new DecoderBuffer(this.base);
      return res._reporterState = this._reporterState, res.offset = this.offset, res.length = this.offset + bytes, this.offset += bytes, res;
    };
    DecoderBuffer.prototype.raw = function raw(save) {
      return this.base.slice(save ? save.offset : this.offset, this.length);
    };
    function EncoderBuffer(value, reporter) {
      if (Array.isArray(value))
        this.length = 0, this.value = value.map(function(item) {
          if (!(item instanceof EncoderBuffer))
            item = new EncoderBuffer(item, reporter);
          return this.length += item.length, item;
        }, this);
      else if (typeof value === "number") {
        if (!(0 <= value && value <= 255))
          return reporter.error("non-byte EncoderBuffer value");
        this.value = value, this.length = 1;
      } else if (typeof value === "string")
        this.value = value, this.length = Buffer22.byteLength(value);
      else if (Buffer22.isBuffer(value))
        this.value = value, this.length = value.length;
      else
        return reporter.error("Unsupported type: " + typeof value);
    }
    exports.EncoderBuffer = EncoderBuffer;
    EncoderBuffer.prototype.join = function join(out, offset) {
      if (!out)
        out = new Buffer22(this.length);
      if (!offset)
        offset = 0;
      if (this.length === 0)
        return out;
      if (Array.isArray(this.value))
        this.value.forEach(function(item) {
          item.join(out, offset), offset += item.length;
        });
      else {
        if (typeof this.value === "number")
          out[offset] = this.value;
        else if (typeof this.value === "string")
          out.write(this.value, offset);
        else if (Buffer22.isBuffer(this.value))
          this.value.copy(out, offset);
        offset += this.length;
      }
      return out;
    };
  });
  require_node = __commonJS2((exports, module) => {
    var Reporter = require_base2().Reporter, EncoderBuffer = require_base2().EncoderBuffer, DecoderBuffer = require_base2().DecoderBuffer, assert = require_minimalistic_assert(), tags = ["seq", "seqof", "set", "setof", "objid", "bool", "gentime", "utctime", "null_", "enum", "int", "objDesc", "bitstr", "bmpstr", "charstr", "genstr", "graphstr", "ia5str", "iso646str", "numstr", "octstr", "printstr", "t61str", "unistr", "utf8str", "videostr"], methods = ["key", "obj", "use", "optional", "explicit", "implicit", "def", "choice", "any", "contains"].concat(tags), overrided = ["_peekTag", "_decodeTag", "_use", "_decodeStr", "_decodeObjid", "_decodeTime", "_decodeNull", "_decodeInt", "_decodeBool", "_decodeList", "_encodeComposite", "_encodeStr", "_encodeObjid", "_encodeTime", "_encodeNull", "_encodeInt", "_encodeBool"];
    function Node(enc, parent) {
      var state = {};
      if (this._baseState = state, state.enc = enc, state.parent = parent || null, state.children = null, state.tag = null, state.args = null, state.reverseArgs = null, state.choice = null, state.optional = false, state.any = false, state.obj = false, state.use = null, state.useDecoder = null, state.key = null, state.default = null, state.explicit = null, state.implicit = null, state.contains = null, !state.parent)
        state.children = [], this._wrap();
    }
    module.exports = Node;
    var stateProps = ["enc", "parent", "children", "tag", "args", "reverseArgs", "choice", "optional", "any", "obj", "use", "alteredUse", "key", "default", "explicit", "implicit", "contains"];
    Node.prototype.clone = function clone() {
      var state = this._baseState, cstate = {};
      stateProps.forEach(function(prop) {
        cstate[prop] = state[prop];
      });
      var res = new this.constructor(cstate.parent);
      return res._baseState = cstate, res;
    };
    Node.prototype._wrap = function wrap() {
      var state = this._baseState;
      methods.forEach(function(method) {
        this[method] = function _wrappedMethod() {
          var clone = new this.constructor(this);
          return state.children.push(clone), clone[method].apply(clone, arguments);
        };
      }, this);
    };
    Node.prototype._init = function init(body) {
      var state = this._baseState;
      assert(state.parent === null), body.call(this), state.children = state.children.filter(function(child) {
        return child._baseState.parent === this;
      }, this), assert.equal(state.children.length, 1, "Root node can have only one child");
    };
    Node.prototype._useArgs = function useArgs(args) {
      var state = this._baseState, children = args.filter(function(arg) {
        return arg instanceof this.constructor;
      }, this);
      if (args = args.filter(function(arg) {
        return !(arg instanceof this.constructor);
      }, this), children.length !== 0)
        assert(state.children === null), state.children = children, children.forEach(function(child) {
          child._baseState.parent = this;
        }, this);
      if (args.length !== 0)
        assert(state.args === null), state.args = args, state.reverseArgs = args.map(function(arg) {
          if (typeof arg !== "object" || arg.constructor !== Object)
            return arg;
          var res = {};
          return Object.keys(arg).forEach(function(key) {
            if (key == (key | 0))
              key |= 0;
            var value = arg[key];
            res[value] = key;
          }), res;
        });
    };
    overrided.forEach(function(method) {
      Node.prototype[method] = function _overrided() {
        var state = this._baseState;
        throw new Error(method + " not implemented for encoding: " + state.enc);
      };
    });
    tags.forEach(function(tag) {
      Node.prototype[tag] = function _tagMethod() {
        var state = this._baseState, args = Array.prototype.slice.call(arguments);
        return assert(state.tag === null), state.tag = tag, this._useArgs(args), this;
      };
    });
    Node.prototype.use = function use(item) {
      assert(item);
      var state = this._baseState;
      return assert(state.use === null), state.use = item, this;
    };
    Node.prototype.optional = function optional() {
      var state = this._baseState;
      return state.optional = true, this;
    };
    Node.prototype.def = function def(val) {
      var state = this._baseState;
      return assert(state.default === null), state.default = val, state.optional = true, this;
    };
    Node.prototype.explicit = function explicit(num) {
      var state = this._baseState;
      return assert(state.explicit === null && state.implicit === null), state.explicit = num, this;
    };
    Node.prototype.implicit = function implicit(num) {
      var state = this._baseState;
      return assert(state.explicit === null && state.implicit === null), state.implicit = num, this;
    };
    Node.prototype.obj = function obj() {
      var state = this._baseState, args = Array.prototype.slice.call(arguments);
      if (state.obj = true, args.length !== 0)
        this._useArgs(args);
      return this;
    };
    Node.prototype.key = function key(newKey) {
      var state = this._baseState;
      return assert(state.key === null), state.key = newKey, this;
    };
    Node.prototype.any = function any() {
      var state = this._baseState;
      return state.any = true, this;
    };
    Node.prototype.choice = function choice(obj) {
      var state = this._baseState;
      return assert(state.choice === null), state.choice = obj, this._useArgs(Object.keys(obj).map(function(key) {
        return obj[key];
      })), this;
    };
    Node.prototype.contains = function contains(item) {
      var state = this._baseState;
      return assert(state.use === null), state.contains = item, this;
    };
    Node.prototype._decode = function decode(input, options) {
      var state = this._baseState;
      if (state.parent === null)
        return input.wrapResult(state.children[0]._decode(input, options));
      var result = state.default, present = true, prevKey = null;
      if (state.key !== null)
        prevKey = input.enterKey(state.key);
      if (state.optional) {
        var tag = null;
        if (state.explicit !== null)
          tag = state.explicit;
        else if (state.implicit !== null)
          tag = state.implicit;
        else if (state.tag !== null)
          tag = state.tag;
        if (tag === null && !state.any) {
          var save = input.save();
          try {
            if (state.choice === null)
              this._decodeGeneric(state.tag, input, options);
            else
              this._decodeChoice(input, options);
            present = true;
          } catch (e) {
            present = false;
          }
          input.restore(save);
        } else if (present = this._peekTag(input, tag, state.any), input.isError(present))
          return present;
      }
      var prevObj;
      if (state.obj && present)
        prevObj = input.enterObject();
      if (present) {
        if (state.explicit !== null) {
          var explicit = this._decodeTag(input, state.explicit);
          if (input.isError(explicit))
            return explicit;
          input = explicit;
        }
        var start = input.offset;
        if (state.use === null && state.choice === null) {
          if (state.any)
            var save = input.save();
          var body = this._decodeTag(input, state.implicit !== null ? state.implicit : state.tag, state.any);
          if (input.isError(body))
            return body;
          if (state.any)
            result = input.raw(save);
          else
            input = body;
        }
        if (options && options.track && state.tag !== null)
          options.track(input.path(), start, input.length, "tagged");
        if (options && options.track && state.tag !== null)
          options.track(input.path(), input.offset, input.length, "content");
        if (state.any)
          result = result;
        else if (state.choice === null)
          result = this._decodeGeneric(state.tag, input, options);
        else
          result = this._decodeChoice(input, options);
        if (input.isError(result))
          return result;
        if (!state.any && state.choice === null && state.children !== null)
          state.children.forEach(function decodeChildren(child) {
            child._decode(input, options);
          });
        if (state.contains && (state.tag === "octstr" || state.tag === "bitstr")) {
          var data = new DecoderBuffer(result);
          result = this._getUse(state.contains, input._reporterState.obj)._decode(data, options);
        }
      }
      if (state.obj && present)
        result = input.leaveObject(prevObj);
      if (state.key !== null && (result !== null || present === true))
        input.leaveKey(prevKey, state.key, result);
      else if (prevKey !== null)
        input.exitKey(prevKey);
      return result;
    };
    Node.prototype._decodeGeneric = function decodeGeneric(tag, input, options) {
      var state = this._baseState;
      if (tag === "seq" || tag === "set")
        return null;
      if (tag === "seqof" || tag === "setof")
        return this._decodeList(input, tag, state.args[0], options);
      else if (/str$/.test(tag))
        return this._decodeStr(input, tag, options);
      else if (tag === "objid" && state.args)
        return this._decodeObjid(input, state.args[0], state.args[1], options);
      else if (tag === "objid")
        return this._decodeObjid(input, null, null, options);
      else if (tag === "gentime" || tag === "utctime")
        return this._decodeTime(input, tag, options);
      else if (tag === "null_")
        return this._decodeNull(input, options);
      else if (tag === "bool")
        return this._decodeBool(input, options);
      else if (tag === "objDesc")
        return this._decodeStr(input, tag, options);
      else if (tag === "int" || tag === "enum")
        return this._decodeInt(input, state.args && state.args[0], options);
      if (state.use !== null)
        return this._getUse(state.use, input._reporterState.obj)._decode(input, options);
      else
        return input.error("unknown tag: " + tag);
    };
    Node.prototype._getUse = function _getUse(entity, obj) {
      var state = this._baseState;
      if (state.useDecoder = this._use(entity, obj), assert(state.useDecoder._baseState.parent === null), state.useDecoder = state.useDecoder._baseState.children[0], state.implicit !== state.useDecoder._baseState.implicit)
        state.useDecoder = state.useDecoder.clone(), state.useDecoder._baseState.implicit = state.implicit;
      return state.useDecoder;
    };
    Node.prototype._decodeChoice = function decodeChoice(input, options) {
      var state = this._baseState, result = null, match = false;
      if (Object.keys(state.choice).some(function(key) {
        var save = input.save(), node = state.choice[key];
        try {
          var value = node._decode(input, options);
          if (input.isError(value))
            return false;
          result = { type: key, value }, match = true;
        } catch (e) {
          return input.restore(save), false;
        }
        return true;
      }, this), !match)
        return input.error("Choice not matched");
      return result;
    };
    Node.prototype._createEncoderBuffer = function createEncoderBuffer(data) {
      return new EncoderBuffer(data, this.reporter);
    };
    Node.prototype._encode = function encode(data, reporter, parent) {
      var state = this._baseState;
      if (state.default !== null && state.default === data)
        return;
      var result = this._encodeValue(data, reporter, parent);
      if (result === undefined)
        return;
      if (this._skipDefault(result, reporter, parent))
        return;
      return result;
    };
    Node.prototype._encodeValue = function encode(data, reporter, parent) {
      var state = this._baseState;
      if (state.parent === null)
        return state.children[0]._encode(data, reporter || new Reporter);
      var result = null;
      if (this.reporter = reporter, state.optional && data === undefined)
        if (state.default !== null)
          data = state.default;
        else
          return;
      var content = null, primitive = false;
      if (state.any)
        result = this._createEncoderBuffer(data);
      else if (state.choice)
        result = this._encodeChoice(data, reporter);
      else if (state.contains)
        content = this._getUse(state.contains, parent)._encode(data, reporter), primitive = true;
      else if (state.children)
        content = state.children.map(function(child2) {
          if (child2._baseState.tag === "null_")
            return child2._encode(null, reporter, data);
          if (child2._baseState.key === null)
            return reporter.error("Child should have a key");
          var prevKey = reporter.enterKey(child2._baseState.key);
          if (typeof data !== "object")
            return reporter.error("Child expected, but input is not object");
          var res = child2._encode(data[child2._baseState.key], reporter, data);
          return reporter.leaveKey(prevKey), res;
        }, this).filter(function(child2) {
          return child2;
        }), content = this._createEncoderBuffer(content);
      else if (state.tag === "seqof" || state.tag === "setof") {
        if (!(state.args && state.args.length === 1))
          return reporter.error("Too many args for : " + state.tag);
        if (!Array.isArray(data))
          return reporter.error("seqof/setof, but data is not Array");
        var child = this.clone();
        child._baseState.implicit = null, content = this._createEncoderBuffer(data.map(function(item) {
          var state2 = this._baseState;
          return this._getUse(state2.args[0], data)._encode(item, reporter);
        }, child));
      } else if (state.use !== null)
        result = this._getUse(state.use, parent)._encode(data, reporter);
      else
        content = this._encodePrimitive(state.tag, data), primitive = true;
      var result;
      if (!state.any && state.choice === null) {
        var tag = state.implicit !== null ? state.implicit : state.tag, cls = state.implicit === null ? "universal" : "context";
        if (tag === null) {
          if (state.use === null)
            reporter.error("Tag could be omitted only for .use()");
        } else if (state.use === null)
          result = this._encodeComposite(tag, primitive, cls, content);
      }
      if (state.explicit !== null)
        result = this._encodeComposite(state.explicit, false, "context", result);
      return result;
    };
    Node.prototype._encodeChoice = function encodeChoice(data, reporter) {
      var state = this._baseState, node = state.choice[data.type];
      if (!node)
        assert(false, data.type + " not found in " + JSON.stringify(Object.keys(state.choice)));
      return node._encode(data.value, reporter);
    };
    Node.prototype._encodePrimitive = function encodePrimitive(tag, data) {
      var state = this._baseState;
      if (/str$/.test(tag))
        return this._encodeStr(data, tag);
      else if (tag === "objid" && state.args)
        return this._encodeObjid(data, state.reverseArgs[0], state.args[1]);
      else if (tag === "objid")
        return this._encodeObjid(data, null, null);
      else if (tag === "gentime" || tag === "utctime")
        return this._encodeTime(data, tag);
      else if (tag === "null_")
        return this._encodeNull();
      else if (tag === "int" || tag === "enum")
        return this._encodeInt(data, state.args && state.reverseArgs[0]);
      else if (tag === "bool")
        return this._encodeBool(data);
      else if (tag === "objDesc")
        return this._encodeStr(data, tag);
      else
        throw new Error("Unsupported tag: " + tag);
    };
    Node.prototype._isNumstr = function isNumstr(str) {
      return /^[0-9 ]*$/.test(str);
    };
    Node.prototype._isPrintstr = function isPrintstr(str) {
      return /^[A-Za-z0-9 '\(\)\+,\-\.\/:=\?]*$/.test(str);
    };
  });
  require_base2 = __commonJS2((exports) => {
    var base = exports;
    base.Reporter = require_reporter().Reporter;
    base.DecoderBuffer = require_buffer().DecoderBuffer;
    base.EncoderBuffer = require_buffer().EncoderBuffer;
    base.Node = require_node();
  });
  require_der = __commonJS2((exports) => {
    var constants2 = require_constants();
    exports.tagClass = { 0: "universal", 1: "application", 2: "context", 3: "private" };
    exports.tagClassByName = constants2._reverse(exports.tagClass);
    exports.tag = { 0: "end", 1: "bool", 2: "int", 3: "bitstr", 4: "octstr", 5: "null_", 6: "objid", 7: "objDesc", 8: "external", 9: "real", 10: "enum", 11: "embed", 12: "utf8str", 13: "relativeOid", 16: "seq", 17: "set", 18: "numstr", 19: "printstr", 20: "t61str", 21: "videostr", 22: "ia5str", 23: "utctime", 24: "gentime", 25: "graphstr", 26: "iso646str", 27: "genstr", 28: "unistr", 29: "charstr", 30: "bmpstr" };
    exports.tagByName = constants2._reverse(exports.tag);
  });
  require_constants = __commonJS2((exports) => {
    var constants2 = exports;
    constants2._reverse = function reverse(map) {
      var res = {};
      return Object.keys(map).forEach(function(key) {
        if ((key | 0) == key)
          key = key | 0;
        var value = map[key];
        res[value] = key;
      }), res;
    };
    constants2.der = require_der();
  });
  require_der2 = __commonJS2((exports, module) => {
    var inherits2 = require_inherits(), asn1 = require_asn1(), base = asn1.base, bignum = asn1.bignum, der = asn1.constants.der;
    function DERDecoder(entity) {
      this.enc = "der", this.name = entity.name, this.entity = entity, this.tree = new DERNode, this.tree._init(entity.body);
    }
    module.exports = DERDecoder;
    DERDecoder.prototype.decode = function decode(data, options) {
      if (!(data instanceof base.DecoderBuffer))
        data = new base.DecoderBuffer(data, options);
      return this.tree._decode(data, options);
    };
    function DERNode(parent) {
      base.Node.call(this, "der", parent);
    }
    inherits2(DERNode, base.Node);
    DERNode.prototype._peekTag = function peekTag(buffer, tag, any) {
      if (buffer.isEmpty())
        return false;
      var state = buffer.save(), decodedTag = derDecodeTag(buffer, 'Failed to peek tag: "' + tag + '"');
      if (buffer.isError(decodedTag))
        return decodedTag;
      return buffer.restore(state), decodedTag.tag === tag || decodedTag.tagStr === tag || decodedTag.tagStr + "of" === tag || any;
    };
    DERNode.prototype._decodeTag = function decodeTag(buffer, tag, any) {
      var decodedTag = derDecodeTag(buffer, 'Failed to decode tag of "' + tag + '"');
      if (buffer.isError(decodedTag))
        return decodedTag;
      var len2 = derDecodeLen(buffer, decodedTag.primitive, 'Failed to get length of "' + tag + '"');
      if (buffer.isError(len2))
        return len2;
      if (!any && decodedTag.tag !== tag && decodedTag.tagStr !== tag && decodedTag.tagStr + "of" !== tag)
        return buffer.error('Failed to match tag: "' + tag + '"');
      if (decodedTag.primitive || len2 !== null)
        return buffer.skip(len2, 'Failed to match body of: "' + tag + '"');
      var state = buffer.save(), res = this._skipUntilEnd(buffer, 'Failed to skip indefinite length body: "' + this.tag + '"');
      if (buffer.isError(res))
        return res;
      return len2 = buffer.offset - state.offset, buffer.restore(state), buffer.skip(len2, 'Failed to match body of: "' + tag + '"');
    };
    DERNode.prototype._skipUntilEnd = function skipUntilEnd(buffer, fail) {
      while (true) {
        var tag = derDecodeTag(buffer, fail);
        if (buffer.isError(tag))
          return tag;
        var len2 = derDecodeLen(buffer, tag.primitive, fail);
        if (buffer.isError(len2))
          return len2;
        var res;
        if (tag.primitive || len2 !== null)
          res = buffer.skip(len2);
        else
          res = this._skipUntilEnd(buffer, fail);
        if (buffer.isError(res))
          return res;
        if (tag.tagStr === "end")
          break;
      }
    };
    DERNode.prototype._decodeList = function decodeList(buffer, tag, decoder, options) {
      var result = [];
      while (!buffer.isEmpty()) {
        var possibleEnd = this._peekTag(buffer, "end");
        if (buffer.isError(possibleEnd))
          return possibleEnd;
        var res = decoder.decode(buffer, "der", options);
        if (buffer.isError(res) && possibleEnd)
          break;
        result.push(res);
      }
      return result;
    };
    DERNode.prototype._decodeStr = function decodeStr(buffer, tag) {
      if (tag === "bitstr") {
        var unused = buffer.readUInt8();
        if (buffer.isError(unused))
          return unused;
        return { unused, data: buffer.raw() };
      } else if (tag === "bmpstr") {
        var raw = buffer.raw();
        if (raw.length % 2 === 1)
          return buffer.error("Decoding of string type: bmpstr length mismatch");
        var str = "";
        for (var i2 = 0;i2 < raw.length / 2; i2++)
          str += String.fromCharCode(raw.readUInt16BE(i2 * 2));
        return str;
      } else if (tag === "numstr") {
        var numstr = buffer.raw().toString("ascii");
        if (!this._isNumstr(numstr))
          return buffer.error("Decoding of string type: numstr unsupported characters");
        return numstr;
      } else if (tag === "octstr")
        return buffer.raw();
      else if (tag === "objDesc")
        return buffer.raw();
      else if (tag === "printstr") {
        var printstr = buffer.raw().toString("ascii");
        if (!this._isPrintstr(printstr))
          return buffer.error("Decoding of string type: printstr unsupported characters");
        return printstr;
      } else if (/str$/.test(tag))
        return buffer.raw().toString();
      else
        return buffer.error("Decoding of string type: " + tag + " unsupported");
    };
    DERNode.prototype._decodeObjid = function decodeObjid(buffer, values, relative2) {
      var result, identifiers = [], ident = 0;
      while (!buffer.isEmpty()) {
        var subident = buffer.readUInt8();
        if (ident <<= 7, ident |= subident & 127, (subident & 128) === 0)
          identifiers.push(ident), ident = 0;
      }
      if (subident & 128)
        identifiers.push(ident);
      var first = identifiers[0] / 40 | 0, second = identifiers[0] % 40;
      if (relative2)
        result = identifiers;
      else
        result = [first, second].concat(identifiers.slice(1));
      if (values) {
        var tmp = values[result.join(" ")];
        if (tmp === undefined)
          tmp = values[result.join(".")];
        if (tmp !== undefined)
          result = tmp;
      }
      return result;
    };
    DERNode.prototype._decodeTime = function decodeTime(buffer, tag) {
      var str = buffer.raw().toString();
      if (tag === "gentime")
        var year = str.slice(0, 4) | 0, mon = str.slice(4, 6) | 0, day = str.slice(6, 8) | 0, hour = str.slice(8, 10) | 0, min = str.slice(10, 12) | 0, sec = str.slice(12, 14) | 0;
      else if (tag === "utctime") {
        var year = str.slice(0, 2) | 0, mon = str.slice(2, 4) | 0, day = str.slice(4, 6) | 0, hour = str.slice(6, 8) | 0, min = str.slice(8, 10) | 0, sec = str.slice(10, 12) | 0;
        if (year < 70)
          year = 2000 + year;
        else
          year = 1900 + year;
      } else
        return buffer.error("Decoding " + tag + " time is not supported yet");
      return Date.UTC(year, mon - 1, day, hour, min, sec, 0);
    };
    DERNode.prototype._decodeNull = function decodeNull(buffer) {
      return null;
    };
    DERNode.prototype._decodeBool = function decodeBool(buffer) {
      var res = buffer.readUInt8();
      if (buffer.isError(res))
        return res;
      else
        return res !== 0;
    };
    DERNode.prototype._decodeInt = function decodeInt(buffer, values) {
      var raw = buffer.raw(), res = new bignum(raw);
      if (values)
        res = values[res.toString(10)] || res;
      return res;
    };
    DERNode.prototype._use = function use(entity, obj) {
      if (typeof entity === "function")
        entity = entity(obj);
      return entity._getDecoder("der").tree;
    };
    function derDecodeTag(buf, fail) {
      var tag = buf.readUInt8(fail);
      if (buf.isError(tag))
        return tag;
      var cls = der.tagClass[tag >> 6], primitive = (tag & 32) === 0;
      if ((tag & 31) === 31) {
        var oct = tag;
        tag = 0;
        while ((oct & 128) === 128) {
          if (oct = buf.readUInt8(fail), buf.isError(oct))
            return oct;
          tag <<= 7, tag |= oct & 127;
        }
      } else
        tag &= 31;
      var tagStr = der.tag[tag];
      return { cls, primitive, tag, tagStr };
    }
    function derDecodeLen(buf, primitive, fail) {
      var len2 = buf.readUInt8(fail);
      if (buf.isError(len2))
        return len2;
      if (!primitive && len2 === 128)
        return null;
      if ((len2 & 128) === 0)
        return len2;
      var num = len2 & 127;
      if (num > 4)
        return buf.error("length octect is too long");
      len2 = 0;
      for (var i2 = 0;i2 < num; i2++) {
        len2 <<= 8;
        var j = buf.readUInt8(fail);
        if (buf.isError(j))
          return j;
        len2 |= j;
      }
      return len2;
    }
  });
  require_pem = __commonJS2((exports, module) => {
    var inherits2 = require_inherits(), Buffer22 = (init_buffer(), __toCommonJS(exports_buffer)).Buffer, DERDecoder = require_der2();
    function PEMDecoder(entity) {
      DERDecoder.call(this, entity), this.enc = "pem";
    }
    inherits2(PEMDecoder, DERDecoder);
    module.exports = PEMDecoder;
    PEMDecoder.prototype.decode = function decode(data, options) {
      var lines = data.toString().split(/[\r\n]+/g), label = options.label.toUpperCase(), re = /^-----(BEGIN|END) ([^-]+)-----$/, start = -1, end = -1;
      for (var i2 = 0;i2 < lines.length; i2++) {
        var match = lines[i2].match(re);
        if (match === null)
          continue;
        if (match[2] !== label)
          continue;
        if (start === -1) {
          if (match[1] !== "BEGIN")
            break;
          start = i2;
        } else {
          if (match[1] !== "END")
            break;
          end = i2;
          break;
        }
      }
      if (start === -1 || end === -1)
        throw new Error("PEM section not found for: " + label);
      var base64 = lines.slice(start + 1, end).join("");
      base64.replace(/[^a-z0-9\+\/=]+/gi, "");
      var input = new Buffer22(base64, "base64");
      return DERDecoder.prototype.decode.call(this, input, options);
    };
  });
  require_decoders = __commonJS2((exports) => {
    var decoders = exports;
    decoders.der = require_der2();
    decoders.pem = require_pem();
  });
  require_der3 = __commonJS2((exports, module) => {
    var inherits2 = require_inherits(), Buffer22 = (init_buffer(), __toCommonJS(exports_buffer)).Buffer, asn1 = require_asn1(), base = asn1.base, der = asn1.constants.der;
    function DEREncoder(entity) {
      this.enc = "der", this.name = entity.name, this.entity = entity, this.tree = new DERNode, this.tree._init(entity.body);
    }
    module.exports = DEREncoder;
    DEREncoder.prototype.encode = function encode(data, reporter) {
      return this.tree._encode(data, reporter).join();
    };
    function DERNode(parent) {
      base.Node.call(this, "der", parent);
    }
    inherits2(DERNode, base.Node);
    DERNode.prototype._encodeComposite = function encodeComposite(tag, primitive, cls, content) {
      var encodedTag = encodeTag(tag, primitive, cls, this.reporter);
      if (content.length < 128) {
        var header = new Buffer22(2);
        return header[0] = encodedTag, header[1] = content.length, this._createEncoderBuffer([header, content]);
      }
      var lenOctets = 1;
      for (var i2 = content.length;i2 >= 256; i2 >>= 8)
        lenOctets++;
      var header = new Buffer22(2 + lenOctets);
      header[0] = encodedTag, header[1] = 128 | lenOctets;
      for (var i2 = 1 + lenOctets, j = content.length;j > 0; i2--, j >>= 8)
        header[i2] = j & 255;
      return this._createEncoderBuffer([header, content]);
    };
    DERNode.prototype._encodeStr = function encodeStr(str, tag) {
      if (tag === "bitstr")
        return this._createEncoderBuffer([str.unused | 0, str.data]);
      else if (tag === "bmpstr") {
        var buf = new Buffer22(str.length * 2);
        for (var i2 = 0;i2 < str.length; i2++)
          buf.writeUInt16BE(str.charCodeAt(i2), i2 * 2);
        return this._createEncoderBuffer(buf);
      } else if (tag === "numstr") {
        if (!this._isNumstr(str))
          return this.reporter.error("Encoding of string type: numstr supports only digits and space");
        return this._createEncoderBuffer(str);
      } else if (tag === "printstr") {
        if (!this._isPrintstr(str))
          return this.reporter.error("Encoding of string type: printstr supports only latin upper and lower case letters, digits, space, apostrophe, left and rigth parenthesis, plus sign, comma, hyphen, dot, slash, colon, equal sign, question mark");
        return this._createEncoderBuffer(str);
      } else if (/str$/.test(tag))
        return this._createEncoderBuffer(str);
      else if (tag === "objDesc")
        return this._createEncoderBuffer(str);
      else
        return this.reporter.error("Encoding of string type: " + tag + " unsupported");
    };
    DERNode.prototype._encodeObjid = function encodeObjid(id, values, relative2) {
      if (typeof id === "string") {
        if (!values)
          return this.reporter.error("string objid given, but no values map found");
        if (!values.hasOwnProperty(id))
          return this.reporter.error("objid not found in values map");
        id = values[id].split(/[\s\.]+/g);
        for (var i2 = 0;i2 < id.length; i2++)
          id[i2] |= 0;
      } else if (Array.isArray(id)) {
        id = id.slice();
        for (var i2 = 0;i2 < id.length; i2++)
          id[i2] |= 0;
      }
      if (!Array.isArray(id))
        return this.reporter.error("objid() should be either array or string, got: " + JSON.stringify(id));
      if (!relative2) {
        if (id[1] >= 40)
          return this.reporter.error("Second objid identifier OOB");
        id.splice(0, 2, id[0] * 40 + id[1]);
      }
      var size = 0;
      for (var i2 = 0;i2 < id.length; i2++) {
        var ident = id[i2];
        for (size++;ident >= 128; ident >>= 7)
          size++;
      }
      var objid = new Buffer22(size), offset = objid.length - 1;
      for (var i2 = id.length - 1;i2 >= 0; i2--) {
        var ident = id[i2];
        objid[offset--] = ident & 127;
        while ((ident >>= 7) > 0)
          objid[offset--] = 128 | ident & 127;
      }
      return this._createEncoderBuffer(objid);
    };
    function two(num) {
      if (num < 10)
        return "0" + num;
      else
        return num;
    }
    DERNode.prototype._encodeTime = function encodeTime(time, tag) {
      var str, date = new Date(time);
      if (tag === "gentime")
        str = [two(date.getFullYear()), two(date.getUTCMonth() + 1), two(date.getUTCDate()), two(date.getUTCHours()), two(date.getUTCMinutes()), two(date.getUTCSeconds()), "Z"].join("");
      else if (tag === "utctime")
        str = [two(date.getFullYear() % 100), two(date.getUTCMonth() + 1), two(date.getUTCDate()), two(date.getUTCHours()), two(date.getUTCMinutes()), two(date.getUTCSeconds()), "Z"].join("");
      else
        this.reporter.error("Encoding " + tag + " time is not supported yet");
      return this._encodeStr(str, "octstr");
    };
    DERNode.prototype._encodeNull = function encodeNull() {
      return this._createEncoderBuffer("");
    };
    DERNode.prototype._encodeInt = function encodeInt(num, values) {
      if (typeof num === "string") {
        if (!values)
          return this.reporter.error("String int or enum given, but no values map");
        if (!values.hasOwnProperty(num))
          return this.reporter.error("Values map doesn't contain: " + JSON.stringify(num));
        num = values[num];
      }
      if (typeof num !== "number" && !Buffer22.isBuffer(num)) {
        var numArray = num.toArray();
        if (!num.sign && numArray[0] & 128)
          numArray.unshift(0);
        num = new Buffer22(numArray);
      }
      if (Buffer22.isBuffer(num)) {
        var size = num.length;
        if (num.length === 0)
          size++;
        var out = new Buffer22(size);
        if (num.copy(out), num.length === 0)
          out[0] = 0;
        return this._createEncoderBuffer(out);
      }
      if (num < 128)
        return this._createEncoderBuffer(num);
      if (num < 256)
        return this._createEncoderBuffer([0, num]);
      var size = 1;
      for (var i2 = num;i2 >= 256; i2 >>= 8)
        size++;
      var out = new Array(size);
      for (var i2 = out.length - 1;i2 >= 0; i2--)
        out[i2] = num & 255, num >>= 8;
      if (out[0] & 128)
        out.unshift(0);
      return this._createEncoderBuffer(new Buffer22(out));
    };
    DERNode.prototype._encodeBool = function encodeBool(value) {
      return this._createEncoderBuffer(value ? 255 : 0);
    };
    DERNode.prototype._use = function use(entity, obj) {
      if (typeof entity === "function")
        entity = entity(obj);
      return entity._getEncoder("der").tree;
    };
    DERNode.prototype._skipDefault = function skipDefault(dataBuffer, reporter, parent) {
      var state = this._baseState, i2;
      if (state.default === null)
        return false;
      var data = dataBuffer.join();
      if (state.defaultBuffer === undefined)
        state.defaultBuffer = this._encodeValue(state.default, reporter, parent).join();
      if (data.length !== state.defaultBuffer.length)
        return false;
      for (i2 = 0;i2 < data.length; i2++)
        if (data[i2] !== state.defaultBuffer[i2])
          return false;
      return true;
    };
    function encodeTag(tag, primitive, cls, reporter) {
      var res;
      if (tag === "seqof")
        tag = "seq";
      else if (tag === "setof")
        tag = "set";
      if (der.tagByName.hasOwnProperty(tag))
        res = der.tagByName[tag];
      else if (typeof tag === "number" && (tag | 0) === tag)
        res = tag;
      else
        return reporter.error("Unknown tag: " + tag);
      if (res >= 31)
        return reporter.error("Multi-octet tag encoding unsupported");
      if (!primitive)
        res |= 32;
      return res |= der.tagClassByName[cls || "universal"] << 6, res;
    }
  });
  require_pem2 = __commonJS2((exports, module) => {
    var inherits2 = require_inherits(), DEREncoder = require_der3();
    function PEMEncoder(entity) {
      DEREncoder.call(this, entity), this.enc = "pem";
    }
    inherits2(PEMEncoder, DEREncoder);
    module.exports = PEMEncoder;
    PEMEncoder.prototype.encode = function encode(data, options) {
      var buf = DEREncoder.prototype.encode.call(this, data), p = buf.toString("base64"), out = ["-----BEGIN " + options.label + "-----"];
      for (var i2 = 0;i2 < p.length; i2 += 64)
        out.push(p.slice(i2, i2 + 64));
      return out.push("-----END " + options.label + "-----"), out.join(`
`);
    };
  });
  require_encoders = __commonJS2((exports) => {
    var encoders = exports;
    encoders.der = require_der3();
    encoders.pem = require_pem2();
  });
  require_asn1 = __commonJS2((exports) => {
    var asn1 = exports;
    asn1.bignum = require_bn3();
    asn1.define = require_api().define;
    asn1.base = require_base2();
    asn1.constants = require_constants();
    asn1.decoders = require_decoders();
    asn1.encoders = require_encoders();
  });
  require_certificate = __commonJS2((exports, module) => {
    var asn = require_asn1(), Time = asn.define("Time", function() {
      this.choice({ utcTime: this.utctime(), generalTime: this.gentime() });
    }), AttributeTypeValue = asn.define("AttributeTypeValue", function() {
      this.seq().obj(this.key("type").objid(), this.key("value").any());
    }), AlgorithmIdentifier = asn.define("AlgorithmIdentifier", function() {
      this.seq().obj(this.key("algorithm").objid(), this.key("parameters").optional(), this.key("curve").objid().optional());
    }), SubjectPublicKeyInfo = asn.define("SubjectPublicKeyInfo", function() {
      this.seq().obj(this.key("algorithm").use(AlgorithmIdentifier), this.key("subjectPublicKey").bitstr());
    }), RelativeDistinguishedName = asn.define("RelativeDistinguishedName", function() {
      this.setof(AttributeTypeValue);
    }), RDNSequence = asn.define("RDNSequence", function() {
      this.seqof(RelativeDistinguishedName);
    }), Name = asn.define("Name", function() {
      this.choice({ rdnSequence: this.use(RDNSequence) });
    }), Validity = asn.define("Validity", function() {
      this.seq().obj(this.key("notBefore").use(Time), this.key("notAfter").use(Time));
    }), Extension = asn.define("Extension", function() {
      this.seq().obj(this.key("extnID").objid(), this.key("critical").bool().def(false), this.key("extnValue").octstr());
    }), TBSCertificate = asn.define("TBSCertificate", function() {
      this.seq().obj(this.key("version").explicit(0).int().optional(), this.key("serialNumber").int(), this.key("signature").use(AlgorithmIdentifier), this.key("issuer").use(Name), this.key("validity").use(Validity), this.key("subject").use(Name), this.key("subjectPublicKeyInfo").use(SubjectPublicKeyInfo), this.key("issuerUniqueID").implicit(1).bitstr().optional(), this.key("subjectUniqueID").implicit(2).bitstr().optional(), this.key("extensions").explicit(3).seqof(Extension).optional());
    }), X509Certificate = asn.define("X509Certificate", function() {
      this.seq().obj(this.key("tbsCertificate").use(TBSCertificate), this.key("signatureAlgorithm").use(AlgorithmIdentifier), this.key("signatureValue").bitstr());
    });
    module.exports = X509Certificate;
  });
  require_asn12 = __commonJS2((exports) => {
    var asn1 = require_asn1();
    exports.certificate = require_certificate();
    var RSAPrivateKey = asn1.define("RSAPrivateKey", function() {
      this.seq().obj(this.key("version").int(), this.key("modulus").int(), this.key("publicExponent").int(), this.key("privateExponent").int(), this.key("prime1").int(), this.key("prime2").int(), this.key("exponent1").int(), this.key("exponent2").int(), this.key("coefficient").int());
    });
    exports.RSAPrivateKey = RSAPrivateKey;
    var RSAPublicKey = asn1.define("RSAPublicKey", function() {
      this.seq().obj(this.key("modulus").int(), this.key("publicExponent").int());
    });
    exports.RSAPublicKey = RSAPublicKey;
    var AlgorithmIdentifier = asn1.define("AlgorithmIdentifier", function() {
      this.seq().obj(this.key("algorithm").objid(), this.key("none").null_().optional(), this.key("curve").objid().optional(), this.key("params").seq().obj(this.key("p").int(), this.key("q").int(), this.key("g").int()).optional());
    }), PublicKey = asn1.define("SubjectPublicKeyInfo", function() {
      this.seq().obj(this.key("algorithm").use(AlgorithmIdentifier), this.key("subjectPublicKey").bitstr());
    });
    exports.PublicKey = PublicKey;
    var PrivateKeyInfo = asn1.define("PrivateKeyInfo", function() {
      this.seq().obj(this.key("version").int(), this.key("algorithm").use(AlgorithmIdentifier), this.key("subjectPrivateKey").octstr());
    });
    exports.PrivateKey = PrivateKeyInfo;
    var EncryptedPrivateKeyInfo = asn1.define("EncryptedPrivateKeyInfo", function() {
      this.seq().obj(this.key("algorithm").seq().obj(this.key("id").objid(), this.key("decrypt").seq().obj(this.key("kde").seq().obj(this.key("id").objid(), this.key("kdeparams").seq().obj(this.key("salt").octstr(), this.key("iters").int())), this.key("cipher").seq().obj(this.key("algo").objid(), this.key("iv").octstr()))), this.key("subjectPrivateKey").octstr());
    });
    exports.EncryptedPrivateKey = EncryptedPrivateKeyInfo;
    var DSAPrivateKey = asn1.define("DSAPrivateKey", function() {
      this.seq().obj(this.key("version").int(), this.key("p").int(), this.key("q").int(), this.key("g").int(), this.key("pub_key").int(), this.key("priv_key").int());
    });
    exports.DSAPrivateKey = DSAPrivateKey;
    exports.DSAparam = asn1.define("DSAparam", function() {
      this.int();
    });
    var ECParameters = asn1.define("ECParameters", function() {
      this.choice({ namedCurve: this.objid() });
    }), ECPrivateKey = asn1.define("ECPrivateKey", function() {
      this.seq().obj(this.key("version").int(), this.key("privateKey").octstr(), this.key("parameters").optional().explicit(0).use(ECParameters), this.key("publicKey").optional().explicit(1).bitstr());
    });
    exports.ECPrivateKey = ECPrivateKey;
    exports.signature = asn1.define("signature", function() {
      this.seq().obj(this.key("r").int(), this.key("s").int());
    });
  });
  require_aesid = __commonJS2((exports, module) => {
    module.exports = { "2.16.840.1.101.3.4.1.1": "aes-128-ecb", "2.16.840.1.101.3.4.1.2": "aes-128-cbc", "2.16.840.1.101.3.4.1.3": "aes-128-ofb", "2.16.840.1.101.3.4.1.4": "aes-128-cfb", "2.16.840.1.101.3.4.1.21": "aes-192-ecb", "2.16.840.1.101.3.4.1.22": "aes-192-cbc", "2.16.840.1.101.3.4.1.23": "aes-192-ofb", "2.16.840.1.101.3.4.1.24": "aes-192-cfb", "2.16.840.1.101.3.4.1.41": "aes-256-ecb", "2.16.840.1.101.3.4.1.42": "aes-256-cbc", "2.16.840.1.101.3.4.1.43": "aes-256-ofb", "2.16.840.1.101.3.4.1.44": "aes-256-cfb" };
  });
  require_hash_base = __commonJS2((exports, module) => {
    var Buffer22 = require_safe_buffer().Buffer, Transform = require_stream().Transform, inherits2 = require_inherits();
    function HashBase(blockSize) {
      Transform.call(this), this._block = Buffer22.allocUnsafe(blockSize), this._blockSize = blockSize, this._blockOffset = 0, this._length = [0, 0, 0, 0], this._finalized = false;
    }
    inherits2(HashBase, Transform);
    HashBase.prototype._transform = function(chunk, encoding, callback) {
      var error = null;
      try {
        this.update(chunk, encoding);
      } catch (err) {
        error = err;
      }
      callback(error);
    };
    HashBase.prototype._flush = function(callback) {
      var error = null;
      try {
        this.push(this.digest());
      } catch (err) {
        error = err;
      }
      callback(error);
    };
    var useUint8Array = typeof Uint8Array !== "undefined", useArrayBuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined" && ArrayBuffer.isView && (Buffer22.prototype instanceof Uint8Array || Buffer22.TYPED_ARRAY_SUPPORT);
    function toBuffer(data, encoding) {
      if (data instanceof Buffer22)
        return data;
      if (typeof data === "string")
        return Buffer22.from(data, encoding);
      if (useArrayBuffer && ArrayBuffer.isView(data)) {
        if (data.byteLength === 0)
          return Buffer22.alloc(0);
        var res = Buffer22.from(data.buffer, data.byteOffset, data.byteLength);
        if (res.byteLength === data.byteLength)
          return res;
      }
      if (useUint8Array && data instanceof Uint8Array)
        return Buffer22.from(data);
      if (Buffer22.isBuffer(data) && data.constructor && typeof data.constructor.isBuffer === "function" && data.constructor.isBuffer(data))
        return Buffer22.from(data);
      throw new TypeError('The "data" argument must be of type string or an instance of Buffer, TypedArray, or DataView.');
    }
    HashBase.prototype.update = function(data, encoding) {
      if (this._finalized)
        throw new Error("Digest already called");
      data = toBuffer(data, encoding);
      var block = this._block, offset = 0;
      while (this._blockOffset + data.length - offset >= this._blockSize) {
        for (var i2 = this._blockOffset;i2 < this._blockSize; )
          block[i2++] = data[offset++];
        this._update(), this._blockOffset = 0;
      }
      while (offset < data.length)
        block[this._blockOffset++] = data[offset++];
      for (var j = 0, carry = data.length * 8;carry > 0; ++j)
        if (this._length[j] += carry, carry = this._length[j] / 4294967296 | 0, carry > 0)
          this._length[j] -= 4294967296 * carry;
      return this;
    };
    HashBase.prototype._update = function() {
      throw new Error("_update is not implemented");
    };
    HashBase.prototype.digest = function(encoding) {
      if (this._finalized)
        throw new Error("Digest already called");
      this._finalized = true;
      var digest = this._digest();
      if (encoding !== undefined)
        digest = digest.toString(encoding);
      this._block.fill(0), this._blockOffset = 0;
      for (var i2 = 0;i2 < 4; ++i2)
        this._length[i2] = 0;
      return digest;
    };
    HashBase.prototype._digest = function() {
      throw new Error("_digest is not implemented");
    };
    module.exports = HashBase;
  });
  require_md5 = __commonJS2((exports, module) => {
    var inherits2 = require_inherits(), HashBase = require_hash_base(), Buffer22 = require_safe_buffer().Buffer, ARRAY16 = new Array(16);
    function MD5() {
      HashBase.call(this, 64), this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878;
    }
    inherits2(MD5, HashBase);
    MD5.prototype._update = function() {
      var M = ARRAY16;
      for (var i2 = 0;i2 < 16; ++i2)
        M[i2] = this._block.readInt32LE(i2 * 4);
      var a = this._a, b = this._b, c = this._c, d = this._d;
      a = fnF(a, b, c, d, M[0], 3614090360, 7), d = fnF(d, a, b, c, M[1], 3905402710, 12), c = fnF(c, d, a, b, M[2], 606105819, 17), b = fnF(b, c, d, a, M[3], 3250441966, 22), a = fnF(a, b, c, d, M[4], 4118548399, 7), d = fnF(d, a, b, c, M[5], 1200080426, 12), c = fnF(c, d, a, b, M[6], 2821735955, 17), b = fnF(b, c, d, a, M[7], 4249261313, 22), a = fnF(a, b, c, d, M[8], 1770035416, 7), d = fnF(d, a, b, c, M[9], 2336552879, 12), c = fnF(c, d, a, b, M[10], 4294925233, 17), b = fnF(b, c, d, a, M[11], 2304563134, 22), a = fnF(a, b, c, d, M[12], 1804603682, 7), d = fnF(d, a, b, c, M[13], 4254626195, 12), c = fnF(c, d, a, b, M[14], 2792965006, 17), b = fnF(b, c, d, a, M[15], 1236535329, 22), a = fnG(a, b, c, d, M[1], 4129170786, 5), d = fnG(d, a, b, c, M[6], 3225465664, 9), c = fnG(c, d, a, b, M[11], 643717713, 14), b = fnG(b, c, d, a, M[0], 3921069994, 20), a = fnG(a, b, c, d, M[5], 3593408605, 5), d = fnG(d, a, b, c, M[10], 38016083, 9), c = fnG(c, d, a, b, M[15], 3634488961, 14), b = fnG(b, c, d, a, M[4], 3889429448, 20), a = fnG(a, b, c, d, M[9], 568446438, 5), d = fnG(d, a, b, c, M[14], 3275163606, 9), c = fnG(c, d, a, b, M[3], 4107603335, 14), b = fnG(b, c, d, a, M[8], 1163531501, 20), a = fnG(a, b, c, d, M[13], 2850285829, 5), d = fnG(d, a, b, c, M[2], 4243563512, 9), c = fnG(c, d, a, b, M[7], 1735328473, 14), b = fnG(b, c, d, a, M[12], 2368359562, 20), a = fnH(a, b, c, d, M[5], 4294588738, 4), d = fnH(d, a, b, c, M[8], 2272392833, 11), c = fnH(c, d, a, b, M[11], 1839030562, 16), b = fnH(b, c, d, a, M[14], 4259657740, 23), a = fnH(a, b, c, d, M[1], 2763975236, 4), d = fnH(d, a, b, c, M[4], 1272893353, 11), c = fnH(c, d, a, b, M[7], 4139469664, 16), b = fnH(b, c, d, a, M[10], 3200236656, 23), a = fnH(a, b, c, d, M[13], 681279174, 4), d = fnH(d, a, b, c, M[0], 3936430074, 11), c = fnH(c, d, a, b, M[3], 3572445317, 16), b = fnH(b, c, d, a, M[6], 76029189, 23), a = fnH(a, b, c, d, M[9], 3654602809, 4), d = fnH(d, a, b, c, M[12], 3873151461, 11), c = fnH(c, d, a, b, M[15], 530742520, 16), b = fnH(b, c, d, a, M[2], 3299628645, 23), a = fnI(a, b, c, d, M[0], 4096336452, 6), d = fnI(d, a, b, c, M[7], 1126891415, 10), c = fnI(c, d, a, b, M[14], 2878612391, 15), b = fnI(b, c, d, a, M[5], 4237533241, 21), a = fnI(a, b, c, d, M[12], 1700485571, 6), d = fnI(d, a, b, c, M[3], 2399980690, 10), c = fnI(c, d, a, b, M[10], 4293915773, 15), b = fnI(b, c, d, a, M[1], 2240044497, 21), a = fnI(a, b, c, d, M[8], 1873313359, 6), d = fnI(d, a, b, c, M[15], 4264355552, 10), c = fnI(c, d, a, b, M[6], 2734768916, 15), b = fnI(b, c, d, a, M[13], 1309151649, 21), a = fnI(a, b, c, d, M[4], 4149444226, 6), d = fnI(d, a, b, c, M[11], 3174756917, 10), c = fnI(c, d, a, b, M[2], 718787259, 15), b = fnI(b, c, d, a, M[9], 3951481745, 21), this._a = this._a + a | 0, this._b = this._b + b | 0, this._c = this._c + c | 0, this._d = this._d + d | 0;
    };
    MD5.prototype._digest = function() {
      if (this._block[this._blockOffset++] = 128, this._blockOffset > 56)
        this._block.fill(0, this._blockOffset, 64), this._update(), this._blockOffset = 0;
      this._block.fill(0, this._blockOffset, 56), this._block.writeUInt32LE(this._length[0], 56), this._block.writeUInt32LE(this._length[1], 60), this._update();
      var buffer = Buffer22.allocUnsafe(16);
      return buffer.writeInt32LE(this._a, 0), buffer.writeInt32LE(this._b, 4), buffer.writeInt32LE(this._c, 8), buffer.writeInt32LE(this._d, 12), buffer;
    };
    function rotl(x, n) {
      return x << n | x >>> 32 - n;
    }
    function fnF(a, b, c, d, m, k, s) {
      return rotl(a + (b & c | ~b & d) + m + k | 0, s) + b | 0;
    }
    function fnG(a, b, c, d, m, k, s) {
      return rotl(a + (b & d | c & ~d) + m + k | 0, s) + b | 0;
    }
    function fnH(a, b, c, d, m, k, s) {
      return rotl(a + (b ^ c ^ d) + m + k | 0, s) + b | 0;
    }
    function fnI(a, b, c, d, m, k, s) {
      return rotl(a + (c ^ (b | ~d)) + m + k | 0, s) + b | 0;
    }
    module.exports = MD5;
  });
  require_evp_bytestokey = __commonJS2((exports, module) => {
    var Buffer22 = require_safe_buffer().Buffer, MD5 = require_md5();
    function EVP_BytesToKey(password, salt, keyBits, ivLen) {
      if (!Buffer22.isBuffer(password))
        password = Buffer22.from(password, "binary");
      if (salt) {
        if (!Buffer22.isBuffer(salt))
          salt = Buffer22.from(salt, "binary");
        if (salt.length !== 8)
          throw new RangeError("salt should be Buffer with 8 byte length");
      }
      var keyLen = keyBits / 8, key = Buffer22.alloc(keyLen), iv = Buffer22.alloc(ivLen || 0), tmp = Buffer22.alloc(0);
      while (keyLen > 0 || ivLen > 0) {
        var hash = new MD5;
        if (hash.update(tmp), hash.update(password), salt)
          hash.update(salt);
        tmp = hash.digest();
        var used = 0;
        if (keyLen > 0) {
          var keyStart = key.length - keyLen;
          used = Math.min(keyLen, tmp.length), tmp.copy(key, keyStart, 0, used), keyLen -= used;
        }
        if (used < tmp.length && ivLen > 0) {
          var ivStart = iv.length - ivLen, length = Math.min(ivLen, tmp.length - used);
          tmp.copy(iv, ivStart, used, used + length), ivLen -= length;
        }
      }
      return tmp.fill(0), { key, iv };
    }
    module.exports = EVP_BytesToKey;
  });
  require_browserify_aes = __commonJS2((exports) => {
    var crypto2 = (init_crypto(), __toCommonJS(exports_crypto));
    exports.createCipher = exports.Cipher = crypto2.createCipher;
    exports.createCipheriv = exports.Cipheriv = crypto2.createCipheriv;
    exports.createDecipher = exports.Decipher = crypto2.createDecipher;
    exports.createDecipheriv = exports.Decipheriv = crypto2.createDecipheriv;
    exports.listCiphers = exports.getCiphers = crypto2.getCiphers;
  });
  require_fixProc = __commonJS2((exports, module) => {
    var findProc = /Proc-Type: 4,ENCRYPTED[\n\r]+DEK-Info: AES-((?:128)|(?:192)|(?:256))-CBC,([0-9A-H]+)[\n\r]+([0-9A-z\n\r+/=]+)[\n\r]+/m, startRegex = /^-----BEGIN ((?:.*? KEY)|CERTIFICATE)-----/m, fullRegex = /^-----BEGIN ((?:.*? KEY)|CERTIFICATE)-----([0-9A-z\n\r+/=]+)-----END \1-----$/m, evp = require_evp_bytestokey(), ciphers = require_browserify_aes(), Buffer22 = require_safe_buffer().Buffer;
    module.exports = function(okey, password) {
      var key = okey.toString(), match = key.match(findProc), decrypted;
      if (!match) {
        var match2 = key.match(fullRegex);
        decrypted = Buffer22.from(match2[2].replace(/[\r\n]/g, ""), "base64");
      } else {
        var suite = "aes" + match[1], iv = Buffer22.from(match[2], "hex"), cipherText = Buffer22.from(match[3].replace(/[\r\n]/g, ""), "base64"), cipherKey = evp(password, iv.slice(0, 8), parseInt(match[1], 10)).key, out = [], cipher = ciphers.createDecipheriv(suite, cipherKey, iv);
        out.push(cipher.update(cipherText)), out.push(cipher.final()), decrypted = Buffer22.concat(out);
      }
      var tag = key.match(startRegex)[1];
      return { tag, data: decrypted };
    };
  });
  require_parse_asn1 = __commonJS2((exports, module) => {
    var asn1 = require_asn12(), aesid = require_aesid(), fixProc = require_fixProc(), ciphers = require_browserify_aes(), compat = require_pbkdf2(), Buffer22 = require_safe_buffer().Buffer;
    function decrypt(data, password) {
      var salt = data.algorithm.decrypt.kde.kdeparams.salt, iters = parseInt(data.algorithm.decrypt.kde.kdeparams.iters.toString(), 10), algo = aesid[data.algorithm.decrypt.cipher.algo.join(".")], iv = data.algorithm.decrypt.cipher.iv, cipherText = data.subjectPrivateKey, keylen = parseInt(algo.split("-")[1], 10) / 8, key = compat.pbkdf2Sync(password, salt, iters, keylen, "sha1"), cipher = ciphers.createDecipheriv(algo, key, iv), out = [];
      return out.push(cipher.update(cipherText)), out.push(cipher.final()), Buffer22.concat(out);
    }
    function parseKeys(buffer) {
      var password;
      if (typeof buffer === "object" && !Buffer22.isBuffer(buffer))
        password = buffer.passphrase, buffer = buffer.key;
      if (typeof buffer === "string")
        buffer = Buffer22.from(buffer);
      var stripped = fixProc(buffer, password), type = stripped.tag, data = stripped.data, subtype, ndata;
      switch (type) {
        case "CERTIFICATE":
          ndata = asn1.certificate.decode(data, "der").tbsCertificate.subjectPublicKeyInfo;
        case "PUBLIC KEY":
          if (!ndata)
            ndata = asn1.PublicKey.decode(data, "der");
          switch (subtype = ndata.algorithm.algorithm.join("."), subtype) {
            case "1.2.840.113549.1.1.1":
              return asn1.RSAPublicKey.decode(ndata.subjectPublicKey.data, "der");
            case "1.2.840.10045.2.1":
              return ndata.subjectPrivateKey = ndata.subjectPublicKey, { type: "ec", data: ndata };
            case "1.2.840.10040.4.1":
              return ndata.algorithm.params.pub_key = asn1.DSAparam.decode(ndata.subjectPublicKey.data, "der"), { type: "dsa", data: ndata.algorithm.params };
            default:
              throw new Error("unknown key id " + subtype);
          }
        case "ENCRYPTED PRIVATE KEY":
          data = asn1.EncryptedPrivateKey.decode(data, "der"), data = decrypt(data, password);
        case "PRIVATE KEY":
          switch (ndata = asn1.PrivateKey.decode(data, "der"), subtype = ndata.algorithm.algorithm.join("."), subtype) {
            case "1.2.840.113549.1.1.1":
              return asn1.RSAPrivateKey.decode(ndata.subjectPrivateKey, "der");
            case "1.2.840.10045.2.1":
              return { curve: ndata.algorithm.curve, privateKey: asn1.ECPrivateKey.decode(ndata.subjectPrivateKey, "der").privateKey };
            case "1.2.840.10040.4.1":
              return ndata.algorithm.params.priv_key = asn1.DSAparam.decode(ndata.subjectPrivateKey, "der"), { type: "dsa", params: ndata.algorithm.params };
            default:
              throw new Error("unknown key id " + subtype);
          }
        case "RSA PUBLIC KEY":
          return asn1.RSAPublicKey.decode(data, "der");
        case "RSA PRIVATE KEY":
          return asn1.RSAPrivateKey.decode(data, "der");
        case "DSA PRIVATE KEY":
          return { type: "dsa", params: asn1.DSAPrivateKey.decode(data, "der") };
        case "EC PRIVATE KEY":
          return data = asn1.ECPrivateKey.decode(data, "der"), { curve: data.parameters.value, privateKey: data.privateKey };
        default:
          throw new Error("unknown key type " + type);
      }
    }
    parseKeys.signature = asn1.signature;
    module.exports = parseKeys;
  });
  require_mgf = __commonJS2((exports, module) => {
    var createHash = require_create_hash(), Buffer22 = require_safe_buffer().Buffer;
    module.exports = function(seed, len2) {
      var t = Buffer22.alloc(0), i2 = 0, c;
      while (t.length < len2)
        c = i2ops(i2++), t = Buffer22.concat([t, createHash("sha1").update(seed).update(c).digest()]);
      return t.slice(0, len2);
    };
    function i2ops(c) {
      var out = Buffer22.allocUnsafe(4);
      return out.writeUInt32BE(c, 0), out;
    }
  });
  require_xor = __commonJS2((exports, module) => {
    module.exports = function xor(a, b) {
      var len2 = a.length, i2 = -1;
      while (++i2 < len2)
        a[i2] ^= b[i2];
      return a;
    };
  });
  require_bn4 = __commonJS2((exports, module) => {
    (function(module2, exports2) {
      function assert(val, msg) {
        if (!val)
          throw new Error(msg || "Assertion failed");
      }
      function inherits2(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {};
        TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor, ctor.prototype.constructor = ctor;
      }
      function BN(number, base, endian) {
        if (BN.isBN(number))
          return number;
        if (this.negative = 0, this.words = null, this.length = 0, this.red = null, number !== null) {
          if (base === "le" || base === "be")
            endian = base, base = 10;
          this._init(number || 0, base || 10, endian || "be");
        }
      }
      if (typeof module2 === "object")
        module2.exports = BN;
      else
        exports2.BN = BN;
      BN.BN = BN, BN.wordSize = 26;
      var Buffer22;
      try {
        if (typeof window !== "undefined" && typeof window.Buffer !== "undefined")
          Buffer22 = window.Buffer;
        else
          Buffer22 = (init_buffer(), __toCommonJS(exports_buffer)).Buffer;
      } catch (e) {}
      BN.isBN = function isBN(num) {
        if (num instanceof BN)
          return true;
        return num !== null && typeof num === "object" && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
      }, BN.max = function max(left, right) {
        if (left.cmp(right) > 0)
          return left;
        return right;
      }, BN.min = function min(left, right) {
        if (left.cmp(right) < 0)
          return left;
        return right;
      }, BN.prototype._init = function init(number, base, endian) {
        if (typeof number === "number")
          return this._initNumber(number, base, endian);
        if (typeof number === "object")
          return this._initArray(number, base, endian);
        if (base === "hex")
          base = 16;
        assert(base === (base | 0) && base >= 2 && base <= 36), number = number.toString().replace(/\s+/g, "");
        var start = 0;
        if (number[0] === "-")
          start++, this.negative = 1;
        if (start < number.length) {
          if (base === 16)
            this._parseHex(number, start, endian);
          else if (this._parseBase(number, base, start), endian === "le")
            this._initArray(this.toArray(), base, endian);
        }
      }, BN.prototype._initNumber = function _initNumber(number, base, endian) {
        if (number < 0)
          this.negative = 1, number = -number;
        if (number < 67108864)
          this.words = [number & 67108863], this.length = 1;
        else if (number < 4503599627370496)
          this.words = [number & 67108863, number / 67108864 & 67108863], this.length = 2;
        else
          assert(number < 9007199254740992), this.words = [number & 67108863, number / 67108864 & 67108863, 1], this.length = 3;
        if (endian !== "le")
          return;
        this._initArray(this.toArray(), base, endian);
      }, BN.prototype._initArray = function _initArray(number, base, endian) {
        if (assert(typeof number.length === "number"), number.length <= 0)
          return this.words = [0], this.length = 1, this;
        this.length = Math.ceil(number.length / 3), this.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          this.words[i2] = 0;
        var j, w, off = 0;
        if (endian === "be") {
          for (i2 = number.length - 1, j = 0;i2 >= 0; i2 -= 3)
            if (w = number[i2] | number[i2 - 1] << 8 | number[i2 - 2] << 16, this.words[j] |= w << off & 67108863, this.words[j + 1] = w >>> 26 - off & 67108863, off += 24, off >= 26)
              off -= 26, j++;
        } else if (endian === "le") {
          for (i2 = 0, j = 0;i2 < number.length; i2 += 3)
            if (w = number[i2] | number[i2 + 1] << 8 | number[i2 + 2] << 16, this.words[j] |= w << off & 67108863, this.words[j + 1] = w >>> 26 - off & 67108863, off += 24, off >= 26)
              off -= 26, j++;
        }
        return this.strip();
      };
      function parseHex4Bits(string, index) {
        var c = string.charCodeAt(index);
        if (c >= 65 && c <= 70)
          return c - 55;
        else if (c >= 97 && c <= 102)
          return c - 87;
        else
          return c - 48 & 15;
      }
      function parseHexByte(string, lowerBound, index) {
        var r = parseHex4Bits(string, index);
        if (index - 1 >= lowerBound)
          r |= parseHex4Bits(string, index - 1) << 4;
        return r;
      }
      BN.prototype._parseHex = function _parseHex(number, start, endian) {
        this.length = Math.ceil((number.length - start) / 6), this.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          this.words[i2] = 0;
        var off = 0, j = 0, w;
        if (endian === "be")
          for (i2 = number.length - 1;i2 >= start; i2 -= 2)
            if (w = parseHexByte(number, start, i2) << off, this.words[j] |= w & 67108863, off >= 18)
              off -= 18, j += 1, this.words[j] |= w >>> 26;
            else
              off += 8;
        else {
          var parseLength = number.length - start;
          for (i2 = parseLength % 2 === 0 ? start + 1 : start;i2 < number.length; i2 += 2)
            if (w = parseHexByte(number, start, i2) << off, this.words[j] |= w & 67108863, off >= 18)
              off -= 18, j += 1, this.words[j] |= w >>> 26;
            else
              off += 8;
        }
        this.strip();
      };
      function parseBase(str, start, end, mul) {
        var r = 0, len2 = Math.min(str.length, end);
        for (var i2 = start;i2 < len2; i2++) {
          var c = str.charCodeAt(i2) - 48;
          if (r *= mul, c >= 49)
            r += c - 49 + 10;
          else if (c >= 17)
            r += c - 17 + 10;
          else
            r += c;
        }
        return r;
      }
      BN.prototype._parseBase = function _parseBase(number, base, start) {
        this.words = [0], this.length = 1;
        for (var limbLen = 0, limbPow = 1;limbPow <= 67108863; limbPow *= base)
          limbLen++;
        limbLen--, limbPow = limbPow / base | 0;
        var total = number.length - start, mod = total % limbLen, end = Math.min(total, total - mod) + start, word = 0;
        for (var i2 = start;i2 < end; i2 += limbLen)
          if (word = parseBase(number, i2, i2 + limbLen, base), this.imuln(limbPow), this.words[0] + word < 67108864)
            this.words[0] += word;
          else
            this._iaddn(word);
        if (mod !== 0) {
          var pow = 1;
          word = parseBase(number, i2, number.length, base);
          for (i2 = 0;i2 < mod; i2++)
            pow *= base;
          if (this.imuln(pow), this.words[0] + word < 67108864)
            this.words[0] += word;
          else
            this._iaddn(word);
        }
        this.strip();
      }, BN.prototype.copy = function copy(dest) {
        dest.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          dest.words[i2] = this.words[i2];
        dest.length = this.length, dest.negative = this.negative, dest.red = this.red;
      }, BN.prototype.clone = function clone() {
        var r = new BN(null);
        return this.copy(r), r;
      }, BN.prototype._expand = function _expand(size) {
        while (this.length < size)
          this.words[this.length++] = 0;
        return this;
      }, BN.prototype.strip = function strip() {
        while (this.length > 1 && this.words[this.length - 1] === 0)
          this.length--;
        return this._normSign();
      }, BN.prototype._normSign = function _normSign() {
        if (this.length === 1 && this.words[0] === 0)
          this.negative = 0;
        return this;
      }, BN.prototype.inspect = function inspect() {
        return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
      };
      var zeros = ["", "0", "00", "000", "0000", "00000", "000000", "0000000", "00000000", "000000000", "0000000000", "00000000000", "000000000000", "0000000000000", "00000000000000", "000000000000000", "0000000000000000", "00000000000000000", "000000000000000000", "0000000000000000000", "00000000000000000000", "000000000000000000000", "0000000000000000000000", "00000000000000000000000", "000000000000000000000000", "0000000000000000000000000"], groupSizes = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], groupBases = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];
      if (BN.prototype.toString = function toString(base, padding) {
        base = base || 10, padding = padding | 0 || 1;
        var out;
        if (base === 16 || base === "hex") {
          out = "";
          var off = 0, carry = 0;
          for (var i2 = 0;i2 < this.length; i2++) {
            var w = this.words[i2], word = ((w << off | carry) & 16777215).toString(16);
            if (carry = w >>> 24 - off & 16777215, off += 2, off >= 26)
              off -= 26, i2--;
            if (carry !== 0 || i2 !== this.length - 1)
              out = zeros[6 - word.length] + word + out;
            else
              out = word + out;
          }
          if (carry !== 0)
            out = carry.toString(16) + out;
          while (out.length % padding !== 0)
            out = "0" + out;
          if (this.negative !== 0)
            out = "-" + out;
          return out;
        }
        if (base === (base | 0) && base >= 2 && base <= 36) {
          var groupSize = groupSizes[base], groupBase = groupBases[base];
          out = "";
          var c = this.clone();
          c.negative = 0;
          while (!c.isZero()) {
            var r = c.modn(groupBase).toString(base);
            if (c = c.idivn(groupBase), !c.isZero())
              out = zeros[groupSize - r.length] + r + out;
            else
              out = r + out;
          }
          if (this.isZero())
            out = "0" + out;
          while (out.length % padding !== 0)
            out = "0" + out;
          if (this.negative !== 0)
            out = "-" + out;
          return out;
        }
        assert(false, "Base should be between 2 and 36");
      }, BN.prototype.toNumber = function toNumber() {
        var ret = this.words[0];
        if (this.length === 2)
          ret += this.words[1] * 67108864;
        else if (this.length === 3 && this.words[2] === 1)
          ret += 4503599627370496 + this.words[1] * 67108864;
        else if (this.length > 2)
          assert(false, "Number can only safely store up to 53 bits");
        return this.negative !== 0 ? -ret : ret;
      }, BN.prototype.toJSON = function toJSON() {
        return this.toString(16);
      }, BN.prototype.toBuffer = function toBuffer(endian, length) {
        return assert(typeof Buffer22 !== "undefined"), this.toArrayLike(Buffer22, endian, length);
      }, BN.prototype.toArray = function toArray(endian, length) {
        return this.toArrayLike(Array, endian, length);
      }, BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
        var byteLength2 = this.byteLength(), reqLength = length || Math.max(1, byteLength2);
        assert(byteLength2 <= reqLength, "byte array longer than desired length"), assert(reqLength > 0, "Requested array length <= 0"), this.strip();
        var littleEndian = endian === "le", res = new ArrayType(reqLength), b, i2, q = this.clone();
        if (!littleEndian) {
          for (i2 = 0;i2 < reqLength - byteLength2; i2++)
            res[i2] = 0;
          for (i2 = 0;!q.isZero(); i2++)
            b = q.andln(255), q.iushrn(8), res[reqLength - i2 - 1] = b;
        } else {
          for (i2 = 0;!q.isZero(); i2++)
            b = q.andln(255), q.iushrn(8), res[i2] = b;
          for (;i2 < reqLength; i2++)
            res[i2] = 0;
        }
        return res;
      }, Math.clz32)
        BN.prototype._countBits = function _countBits(w) {
          return 32 - Math.clz32(w);
        };
      else
        BN.prototype._countBits = function _countBits(w) {
          var t = w, r = 0;
          if (t >= 4096)
            r += 13, t >>>= 13;
          if (t >= 64)
            r += 7, t >>>= 7;
          if (t >= 8)
            r += 4, t >>>= 4;
          if (t >= 2)
            r += 2, t >>>= 2;
          return r + t;
        };
      BN.prototype._zeroBits = function _zeroBits(w) {
        if (w === 0)
          return 26;
        var t = w, r = 0;
        if ((t & 8191) === 0)
          r += 13, t >>>= 13;
        if ((t & 127) === 0)
          r += 7, t >>>= 7;
        if ((t & 15) === 0)
          r += 4, t >>>= 4;
        if ((t & 3) === 0)
          r += 2, t >>>= 2;
        if ((t & 1) === 0)
          r++;
        return r;
      }, BN.prototype.bitLength = function bitLength() {
        var w = this.words[this.length - 1], hi = this._countBits(w);
        return (this.length - 1) * 26 + hi;
      };
      function toBitArray(num) {
        var w = new Array(num.bitLength());
        for (var bit = 0;bit < w.length; bit++) {
          var off = bit / 26 | 0, wbit = bit % 26;
          w[bit] = (num.words[off] & 1 << wbit) >>> wbit;
        }
        return w;
      }
      BN.prototype.zeroBits = function zeroBits() {
        if (this.isZero())
          return 0;
        var r = 0;
        for (var i2 = 0;i2 < this.length; i2++) {
          var b = this._zeroBits(this.words[i2]);
          if (r += b, b !== 26)
            break;
        }
        return r;
      }, BN.prototype.byteLength = function byteLength() {
        return Math.ceil(this.bitLength() / 8);
      }, BN.prototype.toTwos = function toTwos(width) {
        if (this.negative !== 0)
          return this.abs().inotn(width).iaddn(1);
        return this.clone();
      }, BN.prototype.fromTwos = function fromTwos(width) {
        if (this.testn(width - 1))
          return this.notn(width).iaddn(1).ineg();
        return this.clone();
      }, BN.prototype.isNeg = function isNeg() {
        return this.negative !== 0;
      }, BN.prototype.neg = function neg() {
        return this.clone().ineg();
      }, BN.prototype.ineg = function ineg() {
        if (!this.isZero())
          this.negative ^= 1;
        return this;
      }, BN.prototype.iuor = function iuor(num) {
        while (this.length < num.length)
          this.words[this.length++] = 0;
        for (var i2 = 0;i2 < num.length; i2++)
          this.words[i2] = this.words[i2] | num.words[i2];
        return this.strip();
      }, BN.prototype.ior = function ior(num) {
        return assert((this.negative | num.negative) === 0), this.iuor(num);
      }, BN.prototype.or = function or(num) {
        if (this.length > num.length)
          return this.clone().ior(num);
        return num.clone().ior(this);
      }, BN.prototype.uor = function uor(num) {
        if (this.length > num.length)
          return this.clone().iuor(num);
        return num.clone().iuor(this);
      }, BN.prototype.iuand = function iuand(num) {
        var b;
        if (this.length > num.length)
          b = num;
        else
          b = this;
        for (var i2 = 0;i2 < b.length; i2++)
          this.words[i2] = this.words[i2] & num.words[i2];
        return this.length = b.length, this.strip();
      }, BN.prototype.iand = function iand(num) {
        return assert((this.negative | num.negative) === 0), this.iuand(num);
      }, BN.prototype.and = function and(num) {
        if (this.length > num.length)
          return this.clone().iand(num);
        return num.clone().iand(this);
      }, BN.prototype.uand = function uand(num) {
        if (this.length > num.length)
          return this.clone().iuand(num);
        return num.clone().iuand(this);
      }, BN.prototype.iuxor = function iuxor(num) {
        var a, b;
        if (this.length > num.length)
          a = this, b = num;
        else
          a = num, b = this;
        for (var i2 = 0;i2 < b.length; i2++)
          this.words[i2] = a.words[i2] ^ b.words[i2];
        if (this !== a)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        return this.length = a.length, this.strip();
      }, BN.prototype.ixor = function ixor(num) {
        return assert((this.negative | num.negative) === 0), this.iuxor(num);
      }, BN.prototype.xor = function xor(num) {
        if (this.length > num.length)
          return this.clone().ixor(num);
        return num.clone().ixor(this);
      }, BN.prototype.uxor = function uxor(num) {
        if (this.length > num.length)
          return this.clone().iuxor(num);
        return num.clone().iuxor(this);
      }, BN.prototype.inotn = function inotn(width) {
        assert(typeof width === "number" && width >= 0);
        var bytesNeeded = Math.ceil(width / 26) | 0, bitsLeft = width % 26;
        if (this._expand(bytesNeeded), bitsLeft > 0)
          bytesNeeded--;
        for (var i2 = 0;i2 < bytesNeeded; i2++)
          this.words[i2] = ~this.words[i2] & 67108863;
        if (bitsLeft > 0)
          this.words[i2] = ~this.words[i2] & 67108863 >> 26 - bitsLeft;
        return this.strip();
      }, BN.prototype.notn = function notn(width) {
        return this.clone().inotn(width);
      }, BN.prototype.setn = function setn(bit, val) {
        assert(typeof bit === "number" && bit >= 0);
        var off = bit / 26 | 0, wbit = bit % 26;
        if (this._expand(off + 1), val)
          this.words[off] = this.words[off] | 1 << wbit;
        else
          this.words[off] = this.words[off] & ~(1 << wbit);
        return this.strip();
      }, BN.prototype.iadd = function iadd(num) {
        var r;
        if (this.negative !== 0 && num.negative === 0)
          return this.negative = 0, r = this.isub(num), this.negative ^= 1, this._normSign();
        else if (this.negative === 0 && num.negative !== 0)
          return num.negative = 0, r = this.isub(num), num.negative = 1, r._normSign();
        var a, b;
        if (this.length > num.length)
          a = this, b = num;
        else
          a = num, b = this;
        var carry = 0;
        for (var i2 = 0;i2 < b.length; i2++)
          r = (a.words[i2] | 0) + (b.words[i2] | 0) + carry, this.words[i2] = r & 67108863, carry = r >>> 26;
        for (;carry !== 0 && i2 < a.length; i2++)
          r = (a.words[i2] | 0) + carry, this.words[i2] = r & 67108863, carry = r >>> 26;
        if (this.length = a.length, carry !== 0)
          this.words[this.length] = carry, this.length++;
        else if (a !== this)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        return this;
      }, BN.prototype.add = function add(num) {
        var res;
        if (num.negative !== 0 && this.negative === 0)
          return num.negative = 0, res = this.sub(num), num.negative ^= 1, res;
        else if (num.negative === 0 && this.negative !== 0)
          return this.negative = 0, res = num.sub(this), this.negative = 1, res;
        if (this.length > num.length)
          return this.clone().iadd(num);
        return num.clone().iadd(this);
      }, BN.prototype.isub = function isub(num) {
        if (num.negative !== 0) {
          num.negative = 0;
          var r = this.iadd(num);
          return num.negative = 1, r._normSign();
        } else if (this.negative !== 0)
          return this.negative = 0, this.iadd(num), this.negative = 1, this._normSign();
        var cmp = this.cmp(num);
        if (cmp === 0)
          return this.negative = 0, this.length = 1, this.words[0] = 0, this;
        var a, b;
        if (cmp > 0)
          a = this, b = num;
        else
          a = num, b = this;
        var carry = 0;
        for (var i2 = 0;i2 < b.length; i2++)
          r = (a.words[i2] | 0) - (b.words[i2] | 0) + carry, carry = r >> 26, this.words[i2] = r & 67108863;
        for (;carry !== 0 && i2 < a.length; i2++)
          r = (a.words[i2] | 0) + carry, carry = r >> 26, this.words[i2] = r & 67108863;
        if (carry === 0 && i2 < a.length && a !== this)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        if (this.length = Math.max(this.length, i2), a !== this)
          this.negative = 1;
        return this.strip();
      }, BN.prototype.sub = function sub(num) {
        return this.clone().isub(num);
      };
      function smallMulTo(self2, num, out) {
        out.negative = num.negative ^ self2.negative;
        var len2 = self2.length + num.length | 0;
        out.length = len2, len2 = len2 - 1 | 0;
        var a = self2.words[0] | 0, b = num.words[0] | 0, r = a * b, lo = r & 67108863, carry = r / 67108864 | 0;
        out.words[0] = lo;
        for (var k = 1;k < len2; k++) {
          var ncarry = carry >>> 26, rword = carry & 67108863, maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self2.length + 1);j <= maxJ; j++) {
            var i2 = k - j | 0;
            a = self2.words[i2] | 0, b = num.words[j] | 0, r = a * b + rword, ncarry += r / 67108864 | 0, rword = r & 67108863;
          }
          out.words[k] = rword | 0, carry = ncarry | 0;
        }
        if (carry !== 0)
          out.words[k] = carry | 0;
        else
          out.length--;
        return out.strip();
      }
      var comb10MulTo = function comb10MulTo(self2, num, out) {
        var a = self2.words, b = num.words, o = out.words, c = 0, lo, mid, hi, a0 = a[0] | 0, al0 = a0 & 8191, ah0 = a0 >>> 13, a1 = a[1] | 0, al1 = a1 & 8191, ah1 = a1 >>> 13, a2 = a[2] | 0, al2 = a2 & 8191, ah2 = a2 >>> 13, a3 = a[3] | 0, al3 = a3 & 8191, ah3 = a3 >>> 13, a4 = a[4] | 0, al4 = a4 & 8191, ah4 = a4 >>> 13, a5 = a[5] | 0, al5 = a5 & 8191, ah5 = a5 >>> 13, a6 = a[6] | 0, al6 = a6 & 8191, ah6 = a6 >>> 13, a7 = a[7] | 0, al7 = a7 & 8191, ah7 = a7 >>> 13, a8 = a[8] | 0, al8 = a8 & 8191, ah8 = a8 >>> 13, a9 = a[9] | 0, al9 = a9 & 8191, ah9 = a9 >>> 13, b0 = b[0] | 0, bl0 = b0 & 8191, bh0 = b0 >>> 13, b1 = b[1] | 0, bl1 = b1 & 8191, bh1 = b1 >>> 13, b2 = b[2] | 0, bl2 = b2 & 8191, bh2 = b2 >>> 13, b3 = b[3] | 0, bl3 = b3 & 8191, bh3 = b3 >>> 13, b4 = b[4] | 0, bl4 = b4 & 8191, bh4 = b4 >>> 13, b5 = b[5] | 0, bl5 = b5 & 8191, bh5 = b5 >>> 13, b6 = b[6] | 0, bl6 = b6 & 8191, bh6 = b6 >>> 13, b7 = b[7] | 0, bl7 = b7 & 8191, bh7 = b7 >>> 13, b8 = b[8] | 0, bl8 = b8 & 8191, bh8 = b8 >>> 13, b9 = b[9] | 0, bl9 = b9 & 8191, bh9 = b9 >>> 13;
        out.negative = self2.negative ^ num.negative, out.length = 19, lo = Math.imul(al0, bl0), mid = Math.imul(al0, bh0), mid = mid + Math.imul(ah0, bl0) | 0, hi = Math.imul(ah0, bh0);
        var w0 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0, w0 &= 67108863, lo = Math.imul(al1, bl0), mid = Math.imul(al1, bh0), mid = mid + Math.imul(ah1, bl0) | 0, hi = Math.imul(ah1, bh0), lo = lo + Math.imul(al0, bl1) | 0, mid = mid + Math.imul(al0, bh1) | 0, mid = mid + Math.imul(ah0, bl1) | 0, hi = hi + Math.imul(ah0, bh1) | 0;
        var w1 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0, w1 &= 67108863, lo = Math.imul(al2, bl0), mid = Math.imul(al2, bh0), mid = mid + Math.imul(ah2, bl0) | 0, hi = Math.imul(ah2, bh0), lo = lo + Math.imul(al1, bl1) | 0, mid = mid + Math.imul(al1, bh1) | 0, mid = mid + Math.imul(ah1, bl1) | 0, hi = hi + Math.imul(ah1, bh1) | 0, lo = lo + Math.imul(al0, bl2) | 0, mid = mid + Math.imul(al0, bh2) | 0, mid = mid + Math.imul(ah0, bl2) | 0, hi = hi + Math.imul(ah0, bh2) | 0;
        var w2 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0, w2 &= 67108863, lo = Math.imul(al3, bl0), mid = Math.imul(al3, bh0), mid = mid + Math.imul(ah3, bl0) | 0, hi = Math.imul(ah3, bh0), lo = lo + Math.imul(al2, bl1) | 0, mid = mid + Math.imul(al2, bh1) | 0, mid = mid + Math.imul(ah2, bl1) | 0, hi = hi + Math.imul(ah2, bh1) | 0, lo = lo + Math.imul(al1, bl2) | 0, mid = mid + Math.imul(al1, bh2) | 0, mid = mid + Math.imul(ah1, bl2) | 0, hi = hi + Math.imul(ah1, bh2) | 0, lo = lo + Math.imul(al0, bl3) | 0, mid = mid + Math.imul(al0, bh3) | 0, mid = mid + Math.imul(ah0, bl3) | 0, hi = hi + Math.imul(ah0, bh3) | 0;
        var w3 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0, w3 &= 67108863, lo = Math.imul(al4, bl0), mid = Math.imul(al4, bh0), mid = mid + Math.imul(ah4, bl0) | 0, hi = Math.imul(ah4, bh0), lo = lo + Math.imul(al3, bl1) | 0, mid = mid + Math.imul(al3, bh1) | 0, mid = mid + Math.imul(ah3, bl1) | 0, hi = hi + Math.imul(ah3, bh1) | 0, lo = lo + Math.imul(al2, bl2) | 0, mid = mid + Math.imul(al2, bh2) | 0, mid = mid + Math.imul(ah2, bl2) | 0, hi = hi + Math.imul(ah2, bh2) | 0, lo = lo + Math.imul(al1, bl3) | 0, mid = mid + Math.imul(al1, bh3) | 0, mid = mid + Math.imul(ah1, bl3) | 0, hi = hi + Math.imul(ah1, bh3) | 0, lo = lo + Math.imul(al0, bl4) | 0, mid = mid + Math.imul(al0, bh4) | 0, mid = mid + Math.imul(ah0, bl4) | 0, hi = hi + Math.imul(ah0, bh4) | 0;
        var w4 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0, w4 &= 67108863, lo = Math.imul(al5, bl0), mid = Math.imul(al5, bh0), mid = mid + Math.imul(ah5, bl0) | 0, hi = Math.imul(ah5, bh0), lo = lo + Math.imul(al4, bl1) | 0, mid = mid + Math.imul(al4, bh1) | 0, mid = mid + Math.imul(ah4, bl1) | 0, hi = hi + Math.imul(ah4, bh1) | 0, lo = lo + Math.imul(al3, bl2) | 0, mid = mid + Math.imul(al3, bh2) | 0, mid = mid + Math.imul(ah3, bl2) | 0, hi = hi + Math.imul(ah3, bh2) | 0, lo = lo + Math.imul(al2, bl3) | 0, mid = mid + Math.imul(al2, bh3) | 0, mid = mid + Math.imul(ah2, bl3) | 0, hi = hi + Math.imul(ah2, bh3) | 0, lo = lo + Math.imul(al1, bl4) | 0, mid = mid + Math.imul(al1, bh4) | 0, mid = mid + Math.imul(ah1, bl4) | 0, hi = hi + Math.imul(ah1, bh4) | 0, lo = lo + Math.imul(al0, bl5) | 0, mid = mid + Math.imul(al0, bh5) | 0, mid = mid + Math.imul(ah0, bl5) | 0, hi = hi + Math.imul(ah0, bh5) | 0;
        var w5 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0, w5 &= 67108863, lo = Math.imul(al6, bl0), mid = Math.imul(al6, bh0), mid = mid + Math.imul(ah6, bl0) | 0, hi = Math.imul(ah6, bh0), lo = lo + Math.imul(al5, bl1) | 0, mid = mid + Math.imul(al5, bh1) | 0, mid = mid + Math.imul(ah5, bl1) | 0, hi = hi + Math.imul(ah5, bh1) | 0, lo = lo + Math.imul(al4, bl2) | 0, mid = mid + Math.imul(al4, bh2) | 0, mid = mid + Math.imul(ah4, bl2) | 0, hi = hi + Math.imul(ah4, bh2) | 0, lo = lo + Math.imul(al3, bl3) | 0, mid = mid + Math.imul(al3, bh3) | 0, mid = mid + Math.imul(ah3, bl3) | 0, hi = hi + Math.imul(ah3, bh3) | 0, lo = lo + Math.imul(al2, bl4) | 0, mid = mid + Math.imul(al2, bh4) | 0, mid = mid + Math.imul(ah2, bl4) | 0, hi = hi + Math.imul(ah2, bh4) | 0, lo = lo + Math.imul(al1, bl5) | 0, mid = mid + Math.imul(al1, bh5) | 0, mid = mid + Math.imul(ah1, bl5) | 0, hi = hi + Math.imul(ah1, bh5) | 0, lo = lo + Math.imul(al0, bl6) | 0, mid = mid + Math.imul(al0, bh6) | 0, mid = mid + Math.imul(ah0, bl6) | 0, hi = hi + Math.imul(ah0, bh6) | 0;
        var w6 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0, w6 &= 67108863, lo = Math.imul(al7, bl0), mid = Math.imul(al7, bh0), mid = mid + Math.imul(ah7, bl0) | 0, hi = Math.imul(ah7, bh0), lo = lo + Math.imul(al6, bl1) | 0, mid = mid + Math.imul(al6, bh1) | 0, mid = mid + Math.imul(ah6, bl1) | 0, hi = hi + Math.imul(ah6, bh1) | 0, lo = lo + Math.imul(al5, bl2) | 0, mid = mid + Math.imul(al5, bh2) | 0, mid = mid + Math.imul(ah5, bl2) | 0, hi = hi + Math.imul(ah5, bh2) | 0, lo = lo + Math.imul(al4, bl3) | 0, mid = mid + Math.imul(al4, bh3) | 0, mid = mid + Math.imul(ah4, bl3) | 0, hi = hi + Math.imul(ah4, bh3) | 0, lo = lo + Math.imul(al3, bl4) | 0, mid = mid + Math.imul(al3, bh4) | 0, mid = mid + Math.imul(ah3, bl4) | 0, hi = hi + Math.imul(ah3, bh4) | 0, lo = lo + Math.imul(al2, bl5) | 0, mid = mid + Math.imul(al2, bh5) | 0, mid = mid + Math.imul(ah2, bl5) | 0, hi = hi + Math.imul(ah2, bh5) | 0, lo = lo + Math.imul(al1, bl6) | 0, mid = mid + Math.imul(al1, bh6) | 0, mid = mid + Math.imul(ah1, bl6) | 0, hi = hi + Math.imul(ah1, bh6) | 0, lo = lo + Math.imul(al0, bl7) | 0, mid = mid + Math.imul(al0, bh7) | 0, mid = mid + Math.imul(ah0, bl7) | 0, hi = hi + Math.imul(ah0, bh7) | 0;
        var w7 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0, w7 &= 67108863, lo = Math.imul(al8, bl0), mid = Math.imul(al8, bh0), mid = mid + Math.imul(ah8, bl0) | 0, hi = Math.imul(ah8, bh0), lo = lo + Math.imul(al7, bl1) | 0, mid = mid + Math.imul(al7, bh1) | 0, mid = mid + Math.imul(ah7, bl1) | 0, hi = hi + Math.imul(ah7, bh1) | 0, lo = lo + Math.imul(al6, bl2) | 0, mid = mid + Math.imul(al6, bh2) | 0, mid = mid + Math.imul(ah6, bl2) | 0, hi = hi + Math.imul(ah6, bh2) | 0, lo = lo + Math.imul(al5, bl3) | 0, mid = mid + Math.imul(al5, bh3) | 0, mid = mid + Math.imul(ah5, bl3) | 0, hi = hi + Math.imul(ah5, bh3) | 0, lo = lo + Math.imul(al4, bl4) | 0, mid = mid + Math.imul(al4, bh4) | 0, mid = mid + Math.imul(ah4, bl4) | 0, hi = hi + Math.imul(ah4, bh4) | 0, lo = lo + Math.imul(al3, bl5) | 0, mid = mid + Math.imul(al3, bh5) | 0, mid = mid + Math.imul(ah3, bl5) | 0, hi = hi + Math.imul(ah3, bh5) | 0, lo = lo + Math.imul(al2, bl6) | 0, mid = mid + Math.imul(al2, bh6) | 0, mid = mid + Math.imul(ah2, bl6) | 0, hi = hi + Math.imul(ah2, bh6) | 0, lo = lo + Math.imul(al1, bl7) | 0, mid = mid + Math.imul(al1, bh7) | 0, mid = mid + Math.imul(ah1, bl7) | 0, hi = hi + Math.imul(ah1, bh7) | 0, lo = lo + Math.imul(al0, bl8) | 0, mid = mid + Math.imul(al0, bh8) | 0, mid = mid + Math.imul(ah0, bl8) | 0, hi = hi + Math.imul(ah0, bh8) | 0;
        var w8 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0, w8 &= 67108863, lo = Math.imul(al9, bl0), mid = Math.imul(al9, bh0), mid = mid + Math.imul(ah9, bl0) | 0, hi = Math.imul(ah9, bh0), lo = lo + Math.imul(al8, bl1) | 0, mid = mid + Math.imul(al8, bh1) | 0, mid = mid + Math.imul(ah8, bl1) | 0, hi = hi + Math.imul(ah8, bh1) | 0, lo = lo + Math.imul(al7, bl2) | 0, mid = mid + Math.imul(al7, bh2) | 0, mid = mid + Math.imul(ah7, bl2) | 0, hi = hi + Math.imul(ah7, bh2) | 0, lo = lo + Math.imul(al6, bl3) | 0, mid = mid + Math.imul(al6, bh3) | 0, mid = mid + Math.imul(ah6, bl3) | 0, hi = hi + Math.imul(ah6, bh3) | 0, lo = lo + Math.imul(al5, bl4) | 0, mid = mid + Math.imul(al5, bh4) | 0, mid = mid + Math.imul(ah5, bl4) | 0, hi = hi + Math.imul(ah5, bh4) | 0, lo = lo + Math.imul(al4, bl5) | 0, mid = mid + Math.imul(al4, bh5) | 0, mid = mid + Math.imul(ah4, bl5) | 0, hi = hi + Math.imul(ah4, bh5) | 0, lo = lo + Math.imul(al3, bl6) | 0, mid = mid + Math.imul(al3, bh6) | 0, mid = mid + Math.imul(ah3, bl6) | 0, hi = hi + Math.imul(ah3, bh6) | 0, lo = lo + Math.imul(al2, bl7) | 0, mid = mid + Math.imul(al2, bh7) | 0, mid = mid + Math.imul(ah2, bl7) | 0, hi = hi + Math.imul(ah2, bh7) | 0, lo = lo + Math.imul(al1, bl8) | 0, mid = mid + Math.imul(al1, bh8) | 0, mid = mid + Math.imul(ah1, bl8) | 0, hi = hi + Math.imul(ah1, bh8) | 0, lo = lo + Math.imul(al0, bl9) | 0, mid = mid + Math.imul(al0, bh9) | 0, mid = mid + Math.imul(ah0, bl9) | 0, hi = hi + Math.imul(ah0, bh9) | 0;
        var w9 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0, w9 &= 67108863, lo = Math.imul(al9, bl1), mid = Math.imul(al9, bh1), mid = mid + Math.imul(ah9, bl1) | 0, hi = Math.imul(ah9, bh1), lo = lo + Math.imul(al8, bl2) | 0, mid = mid + Math.imul(al8, bh2) | 0, mid = mid + Math.imul(ah8, bl2) | 0, hi = hi + Math.imul(ah8, bh2) | 0, lo = lo + Math.imul(al7, bl3) | 0, mid = mid + Math.imul(al7, bh3) | 0, mid = mid + Math.imul(ah7, bl3) | 0, hi = hi + Math.imul(ah7, bh3) | 0, lo = lo + Math.imul(al6, bl4) | 0, mid = mid + Math.imul(al6, bh4) | 0, mid = mid + Math.imul(ah6, bl4) | 0, hi = hi + Math.imul(ah6, bh4) | 0, lo = lo + Math.imul(al5, bl5) | 0, mid = mid + Math.imul(al5, bh5) | 0, mid = mid + Math.imul(ah5, bl5) | 0, hi = hi + Math.imul(ah5, bh5) | 0, lo = lo + Math.imul(al4, bl6) | 0, mid = mid + Math.imul(al4, bh6) | 0, mid = mid + Math.imul(ah4, bl6) | 0, hi = hi + Math.imul(ah4, bh6) | 0, lo = lo + Math.imul(al3, bl7) | 0, mid = mid + Math.imul(al3, bh7) | 0, mid = mid + Math.imul(ah3, bl7) | 0, hi = hi + Math.imul(ah3, bh7) | 0, lo = lo + Math.imul(al2, bl8) | 0, mid = mid + Math.imul(al2, bh8) | 0, mid = mid + Math.imul(ah2, bl8) | 0, hi = hi + Math.imul(ah2, bh8) | 0, lo = lo + Math.imul(al1, bl9) | 0, mid = mid + Math.imul(al1, bh9) | 0, mid = mid + Math.imul(ah1, bl9) | 0, hi = hi + Math.imul(ah1, bh9) | 0;
        var w10 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0, w10 &= 67108863, lo = Math.imul(al9, bl2), mid = Math.imul(al9, bh2), mid = mid + Math.imul(ah9, bl2) | 0, hi = Math.imul(ah9, bh2), lo = lo + Math.imul(al8, bl3) | 0, mid = mid + Math.imul(al8, bh3) | 0, mid = mid + Math.imul(ah8, bl3) | 0, hi = hi + Math.imul(ah8, bh3) | 0, lo = lo + Math.imul(al7, bl4) | 0, mid = mid + Math.imul(al7, bh4) | 0, mid = mid + Math.imul(ah7, bl4) | 0, hi = hi + Math.imul(ah7, bh4) | 0, lo = lo + Math.imul(al6, bl5) | 0, mid = mid + Math.imul(al6, bh5) | 0, mid = mid + Math.imul(ah6, bl5) | 0, hi = hi + Math.imul(ah6, bh5) | 0, lo = lo + Math.imul(al5, bl6) | 0, mid = mid + Math.imul(al5, bh6) | 0, mid = mid + Math.imul(ah5, bl6) | 0, hi = hi + Math.imul(ah5, bh6) | 0, lo = lo + Math.imul(al4, bl7) | 0, mid = mid + Math.imul(al4, bh7) | 0, mid = mid + Math.imul(ah4, bl7) | 0, hi = hi + Math.imul(ah4, bh7) | 0, lo = lo + Math.imul(al3, bl8) | 0, mid = mid + Math.imul(al3, bh8) | 0, mid = mid + Math.imul(ah3, bl8) | 0, hi = hi + Math.imul(ah3, bh8) | 0, lo = lo + Math.imul(al2, bl9) | 0, mid = mid + Math.imul(al2, bh9) | 0, mid = mid + Math.imul(ah2, bl9) | 0, hi = hi + Math.imul(ah2, bh9) | 0;
        var w11 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0, w11 &= 67108863, lo = Math.imul(al9, bl3), mid = Math.imul(al9, bh3), mid = mid + Math.imul(ah9, bl3) | 0, hi = Math.imul(ah9, bh3), lo = lo + Math.imul(al8, bl4) | 0, mid = mid + Math.imul(al8, bh4) | 0, mid = mid + Math.imul(ah8, bl4) | 0, hi = hi + Math.imul(ah8, bh4) | 0, lo = lo + Math.imul(al7, bl5) | 0, mid = mid + Math.imul(al7, bh5) | 0, mid = mid + Math.imul(ah7, bl5) | 0, hi = hi + Math.imul(ah7, bh5) | 0, lo = lo + Math.imul(al6, bl6) | 0, mid = mid + Math.imul(al6, bh6) | 0, mid = mid + Math.imul(ah6, bl6) | 0, hi = hi + Math.imul(ah6, bh6) | 0, lo = lo + Math.imul(al5, bl7) | 0, mid = mid + Math.imul(al5, bh7) | 0, mid = mid + Math.imul(ah5, bl7) | 0, hi = hi + Math.imul(ah5, bh7) | 0, lo = lo + Math.imul(al4, bl8) | 0, mid = mid + Math.imul(al4, bh8) | 0, mid = mid + Math.imul(ah4, bl8) | 0, hi = hi + Math.imul(ah4, bh8) | 0, lo = lo + Math.imul(al3, bl9) | 0, mid = mid + Math.imul(al3, bh9) | 0, mid = mid + Math.imul(ah3, bl9) | 0, hi = hi + Math.imul(ah3, bh9) | 0;
        var w12 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0, w12 &= 67108863, lo = Math.imul(al9, bl4), mid = Math.imul(al9, bh4), mid = mid + Math.imul(ah9, bl4) | 0, hi = Math.imul(ah9, bh4), lo = lo + Math.imul(al8, bl5) | 0, mid = mid + Math.imul(al8, bh5) | 0, mid = mid + Math.imul(ah8, bl5) | 0, hi = hi + Math.imul(ah8, bh5) | 0, lo = lo + Math.imul(al7, bl6) | 0, mid = mid + Math.imul(al7, bh6) | 0, mid = mid + Math.imul(ah7, bl6) | 0, hi = hi + Math.imul(ah7, bh6) | 0, lo = lo + Math.imul(al6, bl7) | 0, mid = mid + Math.imul(al6, bh7) | 0, mid = mid + Math.imul(ah6, bl7) | 0, hi = hi + Math.imul(ah6, bh7) | 0, lo = lo + Math.imul(al5, bl8) | 0, mid = mid + Math.imul(al5, bh8) | 0, mid = mid + Math.imul(ah5, bl8) | 0, hi = hi + Math.imul(ah5, bh8) | 0, lo = lo + Math.imul(al4, bl9) | 0, mid = mid + Math.imul(al4, bh9) | 0, mid = mid + Math.imul(ah4, bl9) | 0, hi = hi + Math.imul(ah4, bh9) | 0;
        var w13 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0, w13 &= 67108863, lo = Math.imul(al9, bl5), mid = Math.imul(al9, bh5), mid = mid + Math.imul(ah9, bl5) | 0, hi = Math.imul(ah9, bh5), lo = lo + Math.imul(al8, bl6) | 0, mid = mid + Math.imul(al8, bh6) | 0, mid = mid + Math.imul(ah8, bl6) | 0, hi = hi + Math.imul(ah8, bh6) | 0, lo = lo + Math.imul(al7, bl7) | 0, mid = mid + Math.imul(al7, bh7) | 0, mid = mid + Math.imul(ah7, bl7) | 0, hi = hi + Math.imul(ah7, bh7) | 0, lo = lo + Math.imul(al6, bl8) | 0, mid = mid + Math.imul(al6, bh8) | 0, mid = mid + Math.imul(ah6, bl8) | 0, hi = hi + Math.imul(ah6, bh8) | 0, lo = lo + Math.imul(al5, bl9) | 0, mid = mid + Math.imul(al5, bh9) | 0, mid = mid + Math.imul(ah5, bl9) | 0, hi = hi + Math.imul(ah5, bh9) | 0;
        var w14 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0, w14 &= 67108863, lo = Math.imul(al9, bl6), mid = Math.imul(al9, bh6), mid = mid + Math.imul(ah9, bl6) | 0, hi = Math.imul(ah9, bh6), lo = lo + Math.imul(al8, bl7) | 0, mid = mid + Math.imul(al8, bh7) | 0, mid = mid + Math.imul(ah8, bl7) | 0, hi = hi + Math.imul(ah8, bh7) | 0, lo = lo + Math.imul(al7, bl8) | 0, mid = mid + Math.imul(al7, bh8) | 0, mid = mid + Math.imul(ah7, bl8) | 0, hi = hi + Math.imul(ah7, bh8) | 0, lo = lo + Math.imul(al6, bl9) | 0, mid = mid + Math.imul(al6, bh9) | 0, mid = mid + Math.imul(ah6, bl9) | 0, hi = hi + Math.imul(ah6, bh9) | 0;
        var w15 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0, w15 &= 67108863, lo = Math.imul(al9, bl7), mid = Math.imul(al9, bh7), mid = mid + Math.imul(ah9, bl7) | 0, hi = Math.imul(ah9, bh7), lo = lo + Math.imul(al8, bl8) | 0, mid = mid + Math.imul(al8, bh8) | 0, mid = mid + Math.imul(ah8, bl8) | 0, hi = hi + Math.imul(ah8, bh8) | 0, lo = lo + Math.imul(al7, bl9) | 0, mid = mid + Math.imul(al7, bh9) | 0, mid = mid + Math.imul(ah7, bl9) | 0, hi = hi + Math.imul(ah7, bh9) | 0;
        var w16 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0, w16 &= 67108863, lo = Math.imul(al9, bl8), mid = Math.imul(al9, bh8), mid = mid + Math.imul(ah9, bl8) | 0, hi = Math.imul(ah9, bh8), lo = lo + Math.imul(al8, bl9) | 0, mid = mid + Math.imul(al8, bh9) | 0, mid = mid + Math.imul(ah8, bl9) | 0, hi = hi + Math.imul(ah8, bh9) | 0;
        var w17 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0, w17 &= 67108863, lo = Math.imul(al9, bl9), mid = Math.imul(al9, bh9), mid = mid + Math.imul(ah9, bl9) | 0, hi = Math.imul(ah9, bh9);
        var w18 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        if (c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0, w18 &= 67108863, o[0] = w0, o[1] = w1, o[2] = w2, o[3] = w3, o[4] = w4, o[5] = w5, o[6] = w6, o[7] = w7, o[8] = w8, o[9] = w9, o[10] = w10, o[11] = w11, o[12] = w12, o[13] = w13, o[14] = w14, o[15] = w15, o[16] = w16, o[17] = w17, o[18] = w18, c !== 0)
          o[19] = c, out.length++;
        return out;
      };
      if (!Math.imul)
        comb10MulTo = smallMulTo;
      function bigMulTo(self2, num, out) {
        out.negative = num.negative ^ self2.negative, out.length = self2.length + num.length;
        var carry = 0, hncarry = 0;
        for (var k = 0;k < out.length - 1; k++) {
          var ncarry = hncarry;
          hncarry = 0;
          var rword = carry & 67108863, maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self2.length + 1);j <= maxJ; j++) {
            var i2 = k - j, a = self2.words[i2] | 0, b = num.words[j] | 0, r = a * b, lo = r & 67108863;
            ncarry = ncarry + (r / 67108864 | 0) | 0, lo = lo + rword | 0, rword = lo & 67108863, ncarry = ncarry + (lo >>> 26) | 0, hncarry += ncarry >>> 26, ncarry &= 67108863;
          }
          out.words[k] = rword, carry = ncarry, ncarry = hncarry;
        }
        if (carry !== 0)
          out.words[k] = carry;
        else
          out.length--;
        return out.strip();
      }
      function jumboMulTo(self2, num, out) {
        var fftm = new FFTM;
        return fftm.mulp(self2, num, out);
      }
      BN.prototype.mulTo = function mulTo(num, out) {
        var res, len2 = this.length + num.length;
        if (this.length === 10 && num.length === 10)
          res = comb10MulTo(this, num, out);
        else if (len2 < 63)
          res = smallMulTo(this, num, out);
        else if (len2 < 1024)
          res = bigMulTo(this, num, out);
        else
          res = jumboMulTo(this, num, out);
        return res;
      };
      function FFTM(x, y) {
        this.x = x, this.y = y;
      }
      FFTM.prototype.makeRBT = function makeRBT(N) {
        var t = new Array(N), l = BN.prototype._countBits(N) - 1;
        for (var i2 = 0;i2 < N; i2++)
          t[i2] = this.revBin(i2, l, N);
        return t;
      }, FFTM.prototype.revBin = function revBin(x, l, N) {
        if (x === 0 || x === N - 1)
          return x;
        var rb = 0;
        for (var i2 = 0;i2 < l; i2++)
          rb |= (x & 1) << l - i2 - 1, x >>= 1;
        return rb;
      }, FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
        for (var i2 = 0;i2 < N; i2++)
          rtws[i2] = rws[rbt[i2]], itws[i2] = iws[rbt[i2]];
      }, FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
        this.permute(rbt, rws, iws, rtws, itws, N);
        for (var s = 1;s < N; s <<= 1) {
          var l = s << 1, rtwdf = Math.cos(2 * Math.PI / l), itwdf = Math.sin(2 * Math.PI / l);
          for (var p = 0;p < N; p += l) {
            var rtwdf_ = rtwdf, itwdf_ = itwdf;
            for (var j = 0;j < s; j++) {
              var re = rtws[p + j], ie = itws[p + j], ro = rtws[p + j + s], io = itws[p + j + s], rx = rtwdf_ * ro - itwdf_ * io;
              if (io = rtwdf_ * io + itwdf_ * ro, ro = rx, rtws[p + j] = re + ro, itws[p + j] = ie + io, rtws[p + j + s] = re - ro, itws[p + j + s] = ie - io, j !== l)
                rx = rtwdf * rtwdf_ - itwdf * itwdf_, itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_, rtwdf_ = rx;
            }
          }
        }
      }, FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
        var N = Math.max(m, n) | 1, odd = N & 1, i2 = 0;
        for (N = N / 2 | 0;N; N = N >>> 1)
          i2++;
        return 1 << i2 + 1 + odd;
      }, FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
        if (N <= 1)
          return;
        for (var i2 = 0;i2 < N / 2; i2++) {
          var t = rws[i2];
          rws[i2] = rws[N - i2 - 1], rws[N - i2 - 1] = t, t = iws[i2], iws[i2] = -iws[N - i2 - 1], iws[N - i2 - 1] = -t;
        }
      }, FFTM.prototype.normalize13b = function normalize13b(ws, N) {
        var carry = 0;
        for (var i2 = 0;i2 < N / 2; i2++) {
          var w = Math.round(ws[2 * i2 + 1] / N) * 8192 + Math.round(ws[2 * i2] / N) + carry;
          if (ws[i2] = w & 67108863, w < 67108864)
            carry = 0;
          else
            carry = w / 67108864 | 0;
        }
        return ws;
      }, FFTM.prototype.convert13b = function convert13b(ws, len2, rws, N) {
        var carry = 0;
        for (var i2 = 0;i2 < len2; i2++)
          carry = carry + (ws[i2] | 0), rws[2 * i2] = carry & 8191, carry = carry >>> 13, rws[2 * i2 + 1] = carry & 8191, carry = carry >>> 13;
        for (i2 = 2 * len2;i2 < N; ++i2)
          rws[i2] = 0;
        assert(carry === 0), assert((carry & -8192) === 0);
      }, FFTM.prototype.stub = function stub(N) {
        var ph = new Array(N);
        for (var i2 = 0;i2 < N; i2++)
          ph[i2] = 0;
        return ph;
      }, FFTM.prototype.mulp = function mulp(x, y, out) {
        var N = 2 * this.guessLen13b(x.length, y.length), rbt = this.makeRBT(N), _ = this.stub(N), rws = new Array(N), rwst = new Array(N), iwst = new Array(N), nrws = new Array(N), nrwst = new Array(N), niwst = new Array(N), rmws = out.words;
        rmws.length = N, this.convert13b(x.words, x.length, rws, N), this.convert13b(y.words, y.length, nrws, N), this.transform(rws, _, rwst, iwst, N, rbt), this.transform(nrws, _, nrwst, niwst, N, rbt);
        for (var i2 = 0;i2 < N; i2++) {
          var rx = rwst[i2] * nrwst[i2] - iwst[i2] * niwst[i2];
          iwst[i2] = rwst[i2] * niwst[i2] + iwst[i2] * nrwst[i2], rwst[i2] = rx;
        }
        return this.conjugate(rwst, iwst, N), this.transform(rwst, iwst, rmws, _, N, rbt), this.conjugate(rmws, _, N), this.normalize13b(rmws, N), out.negative = x.negative ^ y.negative, out.length = x.length + y.length, out.strip();
      }, BN.prototype.mul = function mul(num) {
        var out = new BN(null);
        return out.words = new Array(this.length + num.length), this.mulTo(num, out);
      }, BN.prototype.mulf = function mulf(num) {
        var out = new BN(null);
        return out.words = new Array(this.length + num.length), jumboMulTo(this, num, out);
      }, BN.prototype.imul = function imul(num) {
        return this.clone().mulTo(num, this);
      }, BN.prototype.imuln = function imuln(num) {
        assert(typeof num === "number"), assert(num < 67108864);
        var carry = 0;
        for (var i2 = 0;i2 < this.length; i2++) {
          var w = (this.words[i2] | 0) * num, lo = (w & 67108863) + (carry & 67108863);
          carry >>= 26, carry += w / 67108864 | 0, carry += lo >>> 26, this.words[i2] = lo & 67108863;
        }
        if (carry !== 0)
          this.words[i2] = carry, this.length++;
        return this.length = num === 0 ? 1 : this.length, this;
      }, BN.prototype.muln = function muln(num) {
        return this.clone().imuln(num);
      }, BN.prototype.sqr = function sqr() {
        return this.mul(this);
      }, BN.prototype.isqr = function isqr() {
        return this.imul(this.clone());
      }, BN.prototype.pow = function pow(num) {
        var w = toBitArray(num);
        if (w.length === 0)
          return new BN(1);
        var res = this;
        for (var i2 = 0;i2 < w.length; i2++, res = res.sqr())
          if (w[i2] !== 0)
            break;
        if (++i2 < w.length)
          for (var q = res.sqr();i2 < w.length; i2++, q = q.sqr()) {
            if (w[i2] === 0)
              continue;
            res = res.mul(q);
          }
        return res;
      }, BN.prototype.iushln = function iushln(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26, s = (bits - r) / 26, carryMask = 67108863 >>> 26 - r << 26 - r, i2;
        if (r !== 0) {
          var carry = 0;
          for (i2 = 0;i2 < this.length; i2++) {
            var newCarry = this.words[i2] & carryMask, c = (this.words[i2] | 0) - newCarry << r;
            this.words[i2] = c | carry, carry = newCarry >>> 26 - r;
          }
          if (carry)
            this.words[i2] = carry, this.length++;
        }
        if (s !== 0) {
          for (i2 = this.length - 1;i2 >= 0; i2--)
            this.words[i2 + s] = this.words[i2];
          for (i2 = 0;i2 < s; i2++)
            this.words[i2] = 0;
          this.length += s;
        }
        return this.strip();
      }, BN.prototype.ishln = function ishln(bits) {
        return assert(this.negative === 0), this.iushln(bits);
      }, BN.prototype.iushrn = function iushrn(bits, hint, extended) {
        assert(typeof bits === "number" && bits >= 0);
        var h;
        if (hint)
          h = (hint - hint % 26) / 26;
        else
          h = 0;
        var r = bits % 26, s = Math.min((bits - r) / 26, this.length), mask = 67108863 ^ 67108863 >>> r << r, maskedWords = extended;
        if (h -= s, h = Math.max(0, h), maskedWords) {
          for (var i2 = 0;i2 < s; i2++)
            maskedWords.words[i2] = this.words[i2];
          maskedWords.length = s;
        }
        if (s === 0)
          ;
        else if (this.length > s) {
          this.length -= s;
          for (i2 = 0;i2 < this.length; i2++)
            this.words[i2] = this.words[i2 + s];
        } else
          this.words[0] = 0, this.length = 1;
        var carry = 0;
        for (i2 = this.length - 1;i2 >= 0 && (carry !== 0 || i2 >= h); i2--) {
          var word = this.words[i2] | 0;
          this.words[i2] = carry << 26 - r | word >>> r, carry = word & mask;
        }
        if (maskedWords && carry !== 0)
          maskedWords.words[maskedWords.length++] = carry;
        if (this.length === 0)
          this.words[0] = 0, this.length = 1;
        return this.strip();
      }, BN.prototype.ishrn = function ishrn(bits, hint, extended) {
        return assert(this.negative === 0), this.iushrn(bits, hint, extended);
      }, BN.prototype.shln = function shln(bits) {
        return this.clone().ishln(bits);
      }, BN.prototype.ushln = function ushln(bits) {
        return this.clone().iushln(bits);
      }, BN.prototype.shrn = function shrn(bits) {
        return this.clone().ishrn(bits);
      }, BN.prototype.ushrn = function ushrn(bits) {
        return this.clone().iushrn(bits);
      }, BN.prototype.testn = function testn(bit) {
        assert(typeof bit === "number" && bit >= 0);
        var r = bit % 26, s = (bit - r) / 26, q = 1 << r;
        if (this.length <= s)
          return false;
        var w = this.words[s];
        return !!(w & q);
      }, BN.prototype.imaskn = function imaskn(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26, s = (bits - r) / 26;
        if (assert(this.negative === 0, "imaskn works only with positive numbers"), this.length <= s)
          return this;
        if (r !== 0)
          s++;
        if (this.length = Math.min(s, this.length), r !== 0) {
          var mask = 67108863 ^ 67108863 >>> r << r;
          this.words[this.length - 1] &= mask;
        }
        return this.strip();
      }, BN.prototype.maskn = function maskn(bits) {
        return this.clone().imaskn(bits);
      }, BN.prototype.iaddn = function iaddn(num) {
        if (assert(typeof num === "number"), assert(num < 67108864), num < 0)
          return this.isubn(-num);
        if (this.negative !== 0) {
          if (this.length === 1 && (this.words[0] | 0) < num)
            return this.words[0] = num - (this.words[0] | 0), this.negative = 0, this;
          return this.negative = 0, this.isubn(num), this.negative = 1, this;
        }
        return this._iaddn(num);
      }, BN.prototype._iaddn = function _iaddn(num) {
        this.words[0] += num;
        for (var i2 = 0;i2 < this.length && this.words[i2] >= 67108864; i2++)
          if (this.words[i2] -= 67108864, i2 === this.length - 1)
            this.words[i2 + 1] = 1;
          else
            this.words[i2 + 1]++;
        return this.length = Math.max(this.length, i2 + 1), this;
      }, BN.prototype.isubn = function isubn(num) {
        if (assert(typeof num === "number"), assert(num < 67108864), num < 0)
          return this.iaddn(-num);
        if (this.negative !== 0)
          return this.negative = 0, this.iaddn(num), this.negative = 1, this;
        if (this.words[0] -= num, this.length === 1 && this.words[0] < 0)
          this.words[0] = -this.words[0], this.negative = 1;
        else
          for (var i2 = 0;i2 < this.length && this.words[i2] < 0; i2++)
            this.words[i2] += 67108864, this.words[i2 + 1] -= 1;
        return this.strip();
      }, BN.prototype.addn = function addn(num) {
        return this.clone().iaddn(num);
      }, BN.prototype.subn = function subn(num) {
        return this.clone().isubn(num);
      }, BN.prototype.iabs = function iabs() {
        return this.negative = 0, this;
      }, BN.prototype.abs = function abs() {
        return this.clone().iabs();
      }, BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
        var len2 = num.length + shift, i2;
        this._expand(len2);
        var w, carry = 0;
        for (i2 = 0;i2 < num.length; i2++) {
          w = (this.words[i2 + shift] | 0) + carry;
          var right = (num.words[i2] | 0) * mul;
          w -= right & 67108863, carry = (w >> 26) - (right / 67108864 | 0), this.words[i2 + shift] = w & 67108863;
        }
        for (;i2 < this.length - shift; i2++)
          w = (this.words[i2 + shift] | 0) + carry, carry = w >> 26, this.words[i2 + shift] = w & 67108863;
        if (carry === 0)
          return this.strip();
        assert(carry === -1), carry = 0;
        for (i2 = 0;i2 < this.length; i2++)
          w = -(this.words[i2] | 0) + carry, carry = w >> 26, this.words[i2] = w & 67108863;
        return this.negative = 1, this.strip();
      }, BN.prototype._wordDiv = function _wordDiv(num, mode) {
        var shift = this.length - num.length, a = this.clone(), b = num, bhi = b.words[b.length - 1] | 0, bhiBits = this._countBits(bhi);
        if (shift = 26 - bhiBits, shift !== 0)
          b = b.ushln(shift), a.iushln(shift), bhi = b.words[b.length - 1] | 0;
        var m = a.length - b.length, q;
        if (mode !== "mod") {
          q = new BN(null), q.length = m + 1, q.words = new Array(q.length);
          for (var i2 = 0;i2 < q.length; i2++)
            q.words[i2] = 0;
        }
        var diff = a.clone()._ishlnsubmul(b, 1, m);
        if (diff.negative === 0) {
          if (a = diff, q)
            q.words[m] = 1;
        }
        for (var j = m - 1;j >= 0; j--) {
          var qj = (a.words[b.length + j] | 0) * 67108864 + (a.words[b.length + j - 1] | 0);
          qj = Math.min(qj / bhi | 0, 67108863), a._ishlnsubmul(b, qj, j);
          while (a.negative !== 0)
            if (qj--, a.negative = 0, a._ishlnsubmul(b, 1, j), !a.isZero())
              a.negative ^= 1;
          if (q)
            q.words[j] = qj;
        }
        if (q)
          q.strip();
        if (a.strip(), mode !== "div" && shift !== 0)
          a.iushrn(shift);
        return { div: q || null, mod: a };
      }, BN.prototype.divmod = function divmod(num, mode, positive) {
        if (assert(!num.isZero()), this.isZero())
          return { div: new BN(0), mod: new BN(0) };
        var div, mod, res;
        if (this.negative !== 0 && num.negative === 0) {
          if (res = this.neg().divmod(num, mode), mode !== "mod")
            div = res.div.neg();
          if (mode !== "div") {
            if (mod = res.mod.neg(), positive && mod.negative !== 0)
              mod.iadd(num);
          }
          return { div, mod };
        }
        if (this.negative === 0 && num.negative !== 0) {
          if (res = this.divmod(num.neg(), mode), mode !== "mod")
            div = res.div.neg();
          return { div, mod: res.mod };
        }
        if ((this.negative & num.negative) !== 0) {
          if (res = this.neg().divmod(num.neg(), mode), mode !== "div") {
            if (mod = res.mod.neg(), positive && mod.negative !== 0)
              mod.isub(num);
          }
          return { div: res.div, mod };
        }
        if (num.length > this.length || this.cmp(num) < 0)
          return { div: new BN(0), mod: this };
        if (num.length === 1) {
          if (mode === "div")
            return { div: this.divn(num.words[0]), mod: null };
          if (mode === "mod")
            return { div: null, mod: new BN(this.modn(num.words[0])) };
          return { div: this.divn(num.words[0]), mod: new BN(this.modn(num.words[0])) };
        }
        return this._wordDiv(num, mode);
      }, BN.prototype.div = function div(num) {
        return this.divmod(num, "div", false).div;
      }, BN.prototype.mod = function mod(num) {
        return this.divmod(num, "mod", false).mod;
      }, BN.prototype.umod = function umod(num) {
        return this.divmod(num, "mod", true).mod;
      }, BN.prototype.divRound = function divRound(num) {
        var dm = this.divmod(num);
        if (dm.mod.isZero())
          return dm.div;
        var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod, half = num.ushrn(1), r2 = num.andln(1), cmp = mod.cmp(half);
        if (cmp < 0 || r2 === 1 && cmp === 0)
          return dm.div;
        return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
      }, BN.prototype.modn = function modn(num) {
        assert(num <= 67108863);
        var p = 67108864 % num, acc = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--)
          acc = (p * acc + (this.words[i2] | 0)) % num;
        return acc;
      }, BN.prototype.idivn = function idivn(num) {
        assert(num <= 67108863);
        var carry = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          var w = (this.words[i2] | 0) + carry * 67108864;
          this.words[i2] = w / num | 0, carry = w % num;
        }
        return this.strip();
      }, BN.prototype.divn = function divn(num) {
        return this.clone().idivn(num);
      }, BN.prototype.egcd = function egcd(p) {
        assert(p.negative === 0), assert(!p.isZero());
        var x = this, y = p.clone();
        if (x.negative !== 0)
          x = x.umod(p);
        else
          x = x.clone();
        var A = new BN(1), B = new BN(0), C = new BN(0), D = new BN(1), g = 0;
        while (x.isEven() && y.isEven())
          x.iushrn(1), y.iushrn(1), ++g;
        var yp = y.clone(), xp = x.clone();
        while (!x.isZero()) {
          for (var i2 = 0, im = 1;(x.words[0] & im) === 0 && i2 < 26; ++i2, im <<= 1)
            ;
          if (i2 > 0) {
            x.iushrn(i2);
            while (i2-- > 0) {
              if (A.isOdd() || B.isOdd())
                A.iadd(yp), B.isub(xp);
              A.iushrn(1), B.iushrn(1);
            }
          }
          for (var j = 0, jm = 1;(y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
            ;
          if (j > 0) {
            y.iushrn(j);
            while (j-- > 0) {
              if (C.isOdd() || D.isOdd())
                C.iadd(yp), D.isub(xp);
              C.iushrn(1), D.iushrn(1);
            }
          }
          if (x.cmp(y) >= 0)
            x.isub(y), A.isub(C), B.isub(D);
          else
            y.isub(x), C.isub(A), D.isub(B);
        }
        return { a: C, b: D, gcd: y.iushln(g) };
      }, BN.prototype._invmp = function _invmp(p) {
        assert(p.negative === 0), assert(!p.isZero());
        var a = this, b = p.clone();
        if (a.negative !== 0)
          a = a.umod(p);
        else
          a = a.clone();
        var x1 = new BN(1), x2 = new BN(0), delta = b.clone();
        while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
          for (var i2 = 0, im = 1;(a.words[0] & im) === 0 && i2 < 26; ++i2, im <<= 1)
            ;
          if (i2 > 0) {
            a.iushrn(i2);
            while (i2-- > 0) {
              if (x1.isOdd())
                x1.iadd(delta);
              x1.iushrn(1);
            }
          }
          for (var j = 0, jm = 1;(b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
            ;
          if (j > 0) {
            b.iushrn(j);
            while (j-- > 0) {
              if (x2.isOdd())
                x2.iadd(delta);
              x2.iushrn(1);
            }
          }
          if (a.cmp(b) >= 0)
            a.isub(b), x1.isub(x2);
          else
            b.isub(a), x2.isub(x1);
        }
        var res;
        if (a.cmpn(1) === 0)
          res = x1;
        else
          res = x2;
        if (res.cmpn(0) < 0)
          res.iadd(p);
        return res;
      }, BN.prototype.gcd = function gcd(num) {
        if (this.isZero())
          return num.abs();
        if (num.isZero())
          return this.abs();
        var a = this.clone(), b = num.clone();
        a.negative = 0, b.negative = 0;
        for (var shift = 0;a.isEven() && b.isEven(); shift++)
          a.iushrn(1), b.iushrn(1);
        do {
          while (a.isEven())
            a.iushrn(1);
          while (b.isEven())
            b.iushrn(1);
          var r = a.cmp(b);
          if (r < 0) {
            var t = a;
            a = b, b = t;
          } else if (r === 0 || b.cmpn(1) === 0)
            break;
          a.isub(b);
        } while (true);
        return b.iushln(shift);
      }, BN.prototype.invm = function invm(num) {
        return this.egcd(num).a.umod(num);
      }, BN.prototype.isEven = function isEven() {
        return (this.words[0] & 1) === 0;
      }, BN.prototype.isOdd = function isOdd() {
        return (this.words[0] & 1) === 1;
      }, BN.prototype.andln = function andln(num) {
        return this.words[0] & num;
      }, BN.prototype.bincn = function bincn(bit) {
        assert(typeof bit === "number");
        var r = bit % 26, s = (bit - r) / 26, q = 1 << r;
        if (this.length <= s)
          return this._expand(s + 1), this.words[s] |= q, this;
        var carry = q;
        for (var i2 = s;carry !== 0 && i2 < this.length; i2++) {
          var w = this.words[i2] | 0;
          w += carry, carry = w >>> 26, w &= 67108863, this.words[i2] = w;
        }
        if (carry !== 0)
          this.words[i2] = carry, this.length++;
        return this;
      }, BN.prototype.isZero = function isZero() {
        return this.length === 1 && this.words[0] === 0;
      }, BN.prototype.cmpn = function cmpn(num) {
        var negative = num < 0;
        if (this.negative !== 0 && !negative)
          return -1;
        if (this.negative === 0 && negative)
          return 1;
        this.strip();
        var res;
        if (this.length > 1)
          res = 1;
        else {
          if (negative)
            num = -num;
          assert(num <= 67108863, "Number is too big");
          var w = this.words[0] | 0;
          res = w === num ? 0 : w < num ? -1 : 1;
        }
        if (this.negative !== 0)
          return -res | 0;
        return res;
      }, BN.prototype.cmp = function cmp(num) {
        if (this.negative !== 0 && num.negative === 0)
          return -1;
        if (this.negative === 0 && num.negative !== 0)
          return 1;
        var res = this.ucmp(num);
        if (this.negative !== 0)
          return -res | 0;
        return res;
      }, BN.prototype.ucmp = function ucmp(num) {
        if (this.length > num.length)
          return 1;
        if (this.length < num.length)
          return -1;
        var res = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          var a = this.words[i2] | 0, b = num.words[i2] | 0;
          if (a === b)
            continue;
          if (a < b)
            res = -1;
          else if (a > b)
            res = 1;
          break;
        }
        return res;
      }, BN.prototype.gtn = function gtn(num) {
        return this.cmpn(num) === 1;
      }, BN.prototype.gt = function gt(num) {
        return this.cmp(num) === 1;
      }, BN.prototype.gten = function gten(num) {
        return this.cmpn(num) >= 0;
      }, BN.prototype.gte = function gte(num) {
        return this.cmp(num) >= 0;
      }, BN.prototype.ltn = function ltn(num) {
        return this.cmpn(num) === -1;
      }, BN.prototype.lt = function lt(num) {
        return this.cmp(num) === -1;
      }, BN.prototype.lten = function lten(num) {
        return this.cmpn(num) <= 0;
      }, BN.prototype.lte = function lte(num) {
        return this.cmp(num) <= 0;
      }, BN.prototype.eqn = function eqn(num) {
        return this.cmpn(num) === 0;
      }, BN.prototype.eq = function eq(num) {
        return this.cmp(num) === 0;
      }, BN.red = function red(num) {
        return new Red(num);
      }, BN.prototype.toRed = function toRed(ctx) {
        return assert(!this.red, "Already a number in reduction context"), assert(this.negative === 0, "red works only with positives"), ctx.convertTo(this)._forceRed(ctx);
      }, BN.prototype.fromRed = function fromRed() {
        return assert(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this);
      }, BN.prototype._forceRed = function _forceRed(ctx) {
        return this.red = ctx, this;
      }, BN.prototype.forceRed = function forceRed(ctx) {
        return assert(!this.red, "Already a number in reduction context"), this._forceRed(ctx);
      }, BN.prototype.redAdd = function redAdd(num) {
        return assert(this.red, "redAdd works only with red numbers"), this.red.add(this, num);
      }, BN.prototype.redIAdd = function redIAdd(num) {
        return assert(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, num);
      }, BN.prototype.redSub = function redSub(num) {
        return assert(this.red, "redSub works only with red numbers"), this.red.sub(this, num);
      }, BN.prototype.redISub = function redISub(num) {
        return assert(this.red, "redISub works only with red numbers"), this.red.isub(this, num);
      }, BN.prototype.redShl = function redShl(num) {
        return assert(this.red, "redShl works only with red numbers"), this.red.shl(this, num);
      }, BN.prototype.redMul = function redMul(num) {
        return assert(this.red, "redMul works only with red numbers"), this.red._verify2(this, num), this.red.mul(this, num);
      }, BN.prototype.redIMul = function redIMul(num) {
        return assert(this.red, "redMul works only with red numbers"), this.red._verify2(this, num), this.red.imul(this, num);
      }, BN.prototype.redSqr = function redSqr() {
        return assert(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this);
      }, BN.prototype.redISqr = function redISqr() {
        return assert(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this);
      }, BN.prototype.redSqrt = function redSqrt() {
        return assert(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this);
      }, BN.prototype.redInvm = function redInvm() {
        return assert(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this);
      }, BN.prototype.redNeg = function redNeg() {
        return assert(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this);
      }, BN.prototype.redPow = function redPow(num) {
        return assert(this.red && !num.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, num);
      };
      var primes = { k256: null, p224: null, p192: null, p25519: null };
      function MPrime(name, p) {
        this.name = name, this.p = new BN(p, 16), this.n = this.p.bitLength(), this.k = new BN(1).iushln(this.n).isub(this.p), this.tmp = this._tmp();
      }
      MPrime.prototype._tmp = function _tmp() {
        var tmp = new BN(null);
        return tmp.words = new Array(Math.ceil(this.n / 13)), tmp;
      }, MPrime.prototype.ireduce = function ireduce(num) {
        var r = num, rlen;
        do
          this.split(r, this.tmp), r = this.imulK(r), r = r.iadd(this.tmp), rlen = r.bitLength();
        while (rlen > this.n);
        var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
        if (cmp === 0)
          r.words[0] = 0, r.length = 1;
        else if (cmp > 0)
          r.isub(this.p);
        else if (r.strip !== undefined)
          r.strip();
        else
          r._strip();
        return r;
      }, MPrime.prototype.split = function split(input, out) {
        input.iushrn(this.n, 0, out);
      }, MPrime.prototype.imulK = function imulK(num) {
        return num.imul(this.k);
      };
      function K256() {
        MPrime.call(this, "k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");
      }
      inherits2(K256, MPrime), K256.prototype.split = function split(input, output) {
        var mask = 4194303, outLen = Math.min(input.length, 9);
        for (var i2 = 0;i2 < outLen; i2++)
          output.words[i2] = input.words[i2];
        if (output.length = outLen, input.length <= 9) {
          input.words[0] = 0, input.length = 1;
          return;
        }
        var prev = input.words[9];
        output.words[output.length++] = prev & mask;
        for (i2 = 10;i2 < input.length; i2++) {
          var next = input.words[i2] | 0;
          input.words[i2 - 10] = (next & mask) << 4 | prev >>> 22, prev = next;
        }
        if (prev >>>= 22, input.words[i2 - 10] = prev, prev === 0 && input.length > 10)
          input.length -= 10;
        else
          input.length -= 9;
      }, K256.prototype.imulK = function imulK(num) {
        num.words[num.length] = 0, num.words[num.length + 1] = 0, num.length += 2;
        var lo = 0;
        for (var i2 = 0;i2 < num.length; i2++) {
          var w = num.words[i2] | 0;
          lo += w * 977, num.words[i2] = lo & 67108863, lo = w * 64 + (lo / 67108864 | 0);
        }
        if (num.words[num.length - 1] === 0) {
          if (num.length--, num.words[num.length - 1] === 0)
            num.length--;
        }
        return num;
      };
      function P224() {
        MPrime.call(this, "p224", "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001");
      }
      inherits2(P224, MPrime);
      function P192() {
        MPrime.call(this, "p192", "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff");
      }
      inherits2(P192, MPrime);
      function P25519() {
        MPrime.call(this, "25519", "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed");
      }
      inherits2(P25519, MPrime), P25519.prototype.imulK = function imulK(num) {
        var carry = 0;
        for (var i2 = 0;i2 < num.length; i2++) {
          var hi = (num.words[i2] | 0) * 19 + carry, lo = hi & 67108863;
          hi >>>= 26, num.words[i2] = lo, carry = hi;
        }
        if (carry !== 0)
          num.words[num.length++] = carry;
        return num;
      }, BN._prime = function prime(name) {
        if (primes[name])
          return primes[name];
        var prime;
        if (name === "k256")
          prime = new K256;
        else if (name === "p224")
          prime = new P224;
        else if (name === "p192")
          prime = new P192;
        else if (name === "p25519")
          prime = new P25519;
        else
          throw new Error("Unknown prime " + name);
        return primes[name] = prime, prime;
      };
      function Red(m) {
        if (typeof m === "string") {
          var prime = BN._prime(m);
          this.m = prime.p, this.prime = prime;
        } else
          assert(m.gtn(1), "modulus must be greater than 1"), this.m = m, this.prime = null;
      }
      Red.prototype._verify1 = function _verify1(a) {
        assert(a.negative === 0, "red works only with positives"), assert(a.red, "red works only with red numbers");
      }, Red.prototype._verify2 = function _verify2(a, b) {
        assert((a.negative | b.negative) === 0, "red works only with positives"), assert(a.red && a.red === b.red, "red works only with red numbers");
      }, Red.prototype.imod = function imod(a) {
        if (this.prime)
          return this.prime.ireduce(a)._forceRed(this);
        return a.umod(this.m)._forceRed(this);
      }, Red.prototype.neg = function neg(a) {
        if (a.isZero())
          return a.clone();
        return this.m.sub(a)._forceRed(this);
      }, Red.prototype.add = function add(a, b) {
        this._verify2(a, b);
        var res = a.add(b);
        if (res.cmp(this.m) >= 0)
          res.isub(this.m);
        return res._forceRed(this);
      }, Red.prototype.iadd = function iadd(a, b) {
        this._verify2(a, b);
        var res = a.iadd(b);
        if (res.cmp(this.m) >= 0)
          res.isub(this.m);
        return res;
      }, Red.prototype.sub = function sub(a, b) {
        this._verify2(a, b);
        var res = a.sub(b);
        if (res.cmpn(0) < 0)
          res.iadd(this.m);
        return res._forceRed(this);
      }, Red.prototype.isub = function isub(a, b) {
        this._verify2(a, b);
        var res = a.isub(b);
        if (res.cmpn(0) < 0)
          res.iadd(this.m);
        return res;
      }, Red.prototype.shl = function shl(a, num) {
        return this._verify1(a), this.imod(a.ushln(num));
      }, Red.prototype.imul = function imul(a, b) {
        return this._verify2(a, b), this.imod(a.imul(b));
      }, Red.prototype.mul = function mul(a, b) {
        return this._verify2(a, b), this.imod(a.mul(b));
      }, Red.prototype.isqr = function isqr(a) {
        return this.imul(a, a.clone());
      }, Red.prototype.sqr = function sqr(a) {
        return this.mul(a, a);
      }, Red.prototype.sqrt = function sqrt(a) {
        if (a.isZero())
          return a.clone();
        var mod3 = this.m.andln(3);
        if (assert(mod3 % 2 === 1), mod3 === 3) {
          var pow = this.m.add(new BN(1)).iushrn(2);
          return this.pow(a, pow);
        }
        var q = this.m.subn(1), s = 0;
        while (!q.isZero() && q.andln(1) === 0)
          s++, q.iushrn(1);
        assert(!q.isZero());
        var one = new BN(1).toRed(this), nOne = one.redNeg(), lpow = this.m.subn(1).iushrn(1), z = this.m.bitLength();
        z = new BN(2 * z * z).toRed(this);
        while (this.pow(z, lpow).cmp(nOne) !== 0)
          z.redIAdd(nOne);
        var c = this.pow(z, q), r = this.pow(a, q.addn(1).iushrn(1)), t = this.pow(a, q), m = s;
        while (t.cmp(one) !== 0) {
          var tmp = t;
          for (var i2 = 0;tmp.cmp(one) !== 0; i2++)
            tmp = tmp.redSqr();
          assert(i2 < m);
          var b = this.pow(c, new BN(1).iushln(m - i2 - 1));
          r = r.redMul(b), c = b.redSqr(), t = t.redMul(c), m = i2;
        }
        return r;
      }, Red.prototype.invm = function invm(a) {
        var inv = a._invmp(this.m);
        if (inv.negative !== 0)
          return inv.negative = 0, this.imod(inv).redNeg();
        else
          return this.imod(inv);
      }, Red.prototype.pow = function pow(a, num) {
        if (num.isZero())
          return new BN(1).toRed(this);
        if (num.cmpn(1) === 0)
          return a.clone();
        var windowSize = 4, wnd = new Array(1 << windowSize);
        wnd[0] = new BN(1).toRed(this), wnd[1] = a;
        for (var i2 = 2;i2 < wnd.length; i2++)
          wnd[i2] = this.mul(wnd[i2 - 1], a);
        var res = wnd[0], current = 0, currentLen = 0, start = num.bitLength() % 26;
        if (start === 0)
          start = 26;
        for (i2 = num.length - 1;i2 >= 0; i2--) {
          var word = num.words[i2];
          for (var j = start - 1;j >= 0; j--) {
            var bit = word >> j & 1;
            if (res !== wnd[0])
              res = this.sqr(res);
            if (bit === 0 && current === 0) {
              currentLen = 0;
              continue;
            }
            if (current <<= 1, current |= bit, currentLen++, currentLen !== windowSize && (i2 !== 0 || j !== 0))
              continue;
            res = this.mul(res, wnd[current]), currentLen = 0, current = 0;
          }
          start = 26;
        }
        return res;
      }, Red.prototype.convertTo = function convertTo(num) {
        var r = num.umod(this.m);
        return r === num ? r.clone() : r;
      }, Red.prototype.convertFrom = function convertFrom(num) {
        var res = num.clone();
        return res.red = null, res;
      }, BN.mont = function mont(num) {
        return new Mont(num);
      };
      function Mont(m) {
        if (Red.call(this, m), this.shift = this.m.bitLength(), this.shift % 26 !== 0)
          this.shift += 26 - this.shift % 26;
        this.r = new BN(1).iushln(this.shift), this.r2 = this.imod(this.r.sqr()), this.rinv = this.r._invmp(this.m), this.minv = this.rinv.mul(this.r).isubn(1).div(this.m), this.minv = this.minv.umod(this.r), this.minv = this.r.sub(this.minv);
      }
      inherits2(Mont, Red), Mont.prototype.convertTo = function convertTo(num) {
        return this.imod(num.ushln(this.shift));
      }, Mont.prototype.convertFrom = function convertFrom(num) {
        var r = this.imod(num.mul(this.rinv));
        return r.red = null, r;
      }, Mont.prototype.imul = function imul(a, b) {
        if (a.isZero() || b.isZero())
          return a.words[0] = 0, a.length = 1, a;
        var t = a.imul(b), c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), u = t.isub(c).iushrn(this.shift), res = u;
        if (u.cmp(this.m) >= 0)
          res = u.isub(this.m);
        else if (u.cmpn(0) < 0)
          res = u.iadd(this.m);
        return res._forceRed(this);
      }, Mont.prototype.mul = function mul(a, b) {
        if (a.isZero() || b.isZero())
          return new BN(0)._forceRed(this);
        var t = a.mul(b), c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), u = t.isub(c).iushrn(this.shift), res = u;
        if (u.cmp(this.m) >= 0)
          res = u.isub(this.m);
        else if (u.cmpn(0) < 0)
          res = u.iadd(this.m);
        return res._forceRed(this);
      }, Mont.prototype.invm = function invm(a) {
        var res = this.imod(a._invmp(this.m).mul(this.r2));
        return res._forceRed(this);
      };
    })(typeof module === "undefined" || module, exports);
  });
  require_withPublic = __commonJS2((exports, module) => {
    var BN = require_bn4(), Buffer22 = require_safe_buffer().Buffer;
    function withPublic(paddedMsg, key) {
      return Buffer22.from(paddedMsg.toRed(BN.mont(key.modulus)).redPow(new BN(key.publicExponent)).fromRed().toArray());
    }
    module.exports = withPublic;
  });
  require_bn5 = __commonJS2((exports, module) => {
    (function(module2, exports2) {
      function assert(val, msg) {
        if (!val)
          throw new Error(msg || "Assertion failed");
      }
      function inherits2(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {};
        TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor, ctor.prototype.constructor = ctor;
      }
      function BN(number, base, endian) {
        if (BN.isBN(number))
          return number;
        if (this.negative = 0, this.words = null, this.length = 0, this.red = null, number !== null) {
          if (base === "le" || base === "be")
            endian = base, base = 10;
          this._init(number || 0, base || 10, endian || "be");
        }
      }
      if (typeof module2 === "object")
        module2.exports = BN;
      else
        exports2.BN = BN;
      BN.BN = BN, BN.wordSize = 26;
      var Buffer22;
      try {
        if (typeof window !== "undefined" && typeof window.Buffer !== "undefined")
          Buffer22 = window.Buffer;
        else
          Buffer22 = (init_buffer(), __toCommonJS(exports_buffer)).Buffer;
      } catch (e) {}
      BN.isBN = function isBN(num) {
        if (num instanceof BN)
          return true;
        return num !== null && typeof num === "object" && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
      }, BN.max = function max(left, right) {
        if (left.cmp(right) > 0)
          return left;
        return right;
      }, BN.min = function min(left, right) {
        if (left.cmp(right) < 0)
          return left;
        return right;
      }, BN.prototype._init = function init(number, base, endian) {
        if (typeof number === "number")
          return this._initNumber(number, base, endian);
        if (typeof number === "object")
          return this._initArray(number, base, endian);
        if (base === "hex")
          base = 16;
        assert(base === (base | 0) && base >= 2 && base <= 36), number = number.toString().replace(/\s+/g, "");
        var start = 0;
        if (number[0] === "-")
          start++, this.negative = 1;
        if (start < number.length) {
          if (base === 16)
            this._parseHex(number, start, endian);
          else if (this._parseBase(number, base, start), endian === "le")
            this._initArray(this.toArray(), base, endian);
        }
      }, BN.prototype._initNumber = function _initNumber(number, base, endian) {
        if (number < 0)
          this.negative = 1, number = -number;
        if (number < 67108864)
          this.words = [number & 67108863], this.length = 1;
        else if (number < 4503599627370496)
          this.words = [number & 67108863, number / 67108864 & 67108863], this.length = 2;
        else
          assert(number < 9007199254740992), this.words = [number & 67108863, number / 67108864 & 67108863, 1], this.length = 3;
        if (endian !== "le")
          return;
        this._initArray(this.toArray(), base, endian);
      }, BN.prototype._initArray = function _initArray(number, base, endian) {
        if (assert(typeof number.length === "number"), number.length <= 0)
          return this.words = [0], this.length = 1, this;
        this.length = Math.ceil(number.length / 3), this.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          this.words[i2] = 0;
        var j, w, off = 0;
        if (endian === "be") {
          for (i2 = number.length - 1, j = 0;i2 >= 0; i2 -= 3)
            if (w = number[i2] | number[i2 - 1] << 8 | number[i2 - 2] << 16, this.words[j] |= w << off & 67108863, this.words[j + 1] = w >>> 26 - off & 67108863, off += 24, off >= 26)
              off -= 26, j++;
        } else if (endian === "le") {
          for (i2 = 0, j = 0;i2 < number.length; i2 += 3)
            if (w = number[i2] | number[i2 + 1] << 8 | number[i2 + 2] << 16, this.words[j] |= w << off & 67108863, this.words[j + 1] = w >>> 26 - off & 67108863, off += 24, off >= 26)
              off -= 26, j++;
        }
        return this._strip();
      };
      function parseHex4Bits(string, index) {
        var c = string.charCodeAt(index);
        if (c >= 48 && c <= 57)
          return c - 48;
        else if (c >= 65 && c <= 70)
          return c - 55;
        else if (c >= 97 && c <= 102)
          return c - 87;
        else
          assert(false, "Invalid character in " + string);
      }
      function parseHexByte(string, lowerBound, index) {
        var r = parseHex4Bits(string, index);
        if (index - 1 >= lowerBound)
          r |= parseHex4Bits(string, index - 1) << 4;
        return r;
      }
      BN.prototype._parseHex = function _parseHex(number, start, endian) {
        this.length = Math.ceil((number.length - start) / 6), this.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          this.words[i2] = 0;
        var off = 0, j = 0, w;
        if (endian === "be")
          for (i2 = number.length - 1;i2 >= start; i2 -= 2)
            if (w = parseHexByte(number, start, i2) << off, this.words[j] |= w & 67108863, off >= 18)
              off -= 18, j += 1, this.words[j] |= w >>> 26;
            else
              off += 8;
        else {
          var parseLength = number.length - start;
          for (i2 = parseLength % 2 === 0 ? start + 1 : start;i2 < number.length; i2 += 2)
            if (w = parseHexByte(number, start, i2) << off, this.words[j] |= w & 67108863, off >= 18)
              off -= 18, j += 1, this.words[j] |= w >>> 26;
            else
              off += 8;
        }
        this._strip();
      };
      function parseBase(str, start, end, mul) {
        var r = 0, b = 0, len2 = Math.min(str.length, end);
        for (var i2 = start;i2 < len2; i2++) {
          var c = str.charCodeAt(i2) - 48;
          if (r *= mul, c >= 49)
            b = c - 49 + 10;
          else if (c >= 17)
            b = c - 17 + 10;
          else
            b = c;
          assert(c >= 0 && b < mul, "Invalid character"), r += b;
        }
        return r;
      }
      BN.prototype._parseBase = function _parseBase(number, base, start) {
        this.words = [0], this.length = 1;
        for (var limbLen = 0, limbPow = 1;limbPow <= 67108863; limbPow *= base)
          limbLen++;
        limbLen--, limbPow = limbPow / base | 0;
        var total = number.length - start, mod = total % limbLen, end = Math.min(total, total - mod) + start, word = 0;
        for (var i2 = start;i2 < end; i2 += limbLen)
          if (word = parseBase(number, i2, i2 + limbLen, base), this.imuln(limbPow), this.words[0] + word < 67108864)
            this.words[0] += word;
          else
            this._iaddn(word);
        if (mod !== 0) {
          var pow = 1;
          word = parseBase(number, i2, number.length, base);
          for (i2 = 0;i2 < mod; i2++)
            pow *= base;
          if (this.imuln(pow), this.words[0] + word < 67108864)
            this.words[0] += word;
          else
            this._iaddn(word);
        }
        this._strip();
      }, BN.prototype.copy = function copy(dest) {
        dest.words = new Array(this.length);
        for (var i2 = 0;i2 < this.length; i2++)
          dest.words[i2] = this.words[i2];
        dest.length = this.length, dest.negative = this.negative, dest.red = this.red;
      };
      function move(dest, src) {
        dest.words = src.words, dest.length = src.length, dest.negative = src.negative, dest.red = src.red;
      }
      if (BN.prototype._move = function _move(dest) {
        move(dest, this);
      }, BN.prototype.clone = function clone() {
        var r = new BN(null);
        return this.copy(r), r;
      }, BN.prototype._expand = function _expand(size) {
        while (this.length < size)
          this.words[this.length++] = 0;
        return this;
      }, BN.prototype._strip = function strip() {
        while (this.length > 1 && this.words[this.length - 1] === 0)
          this.length--;
        return this._normSign();
      }, BN.prototype._normSign = function _normSign() {
        if (this.length === 1 && this.words[0] === 0)
          this.negative = 0;
        return this;
      }, typeof Symbol !== "undefined" && typeof Symbol.for === "function")
        try {
          BN.prototype[Symbol.for("nodejs.util.inspect.custom")] = inspect3;
        } catch (e) {
          BN.prototype.inspect = inspect3;
        }
      else
        BN.prototype.inspect = inspect3;
      function inspect3() {
        return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
      }
      var zeros = ["", "0", "00", "000", "0000", "00000", "000000", "0000000", "00000000", "000000000", "0000000000", "00000000000", "000000000000", "0000000000000", "00000000000000", "000000000000000", "0000000000000000", "00000000000000000", "000000000000000000", "0000000000000000000", "00000000000000000000", "000000000000000000000", "0000000000000000000000", "00000000000000000000000", "000000000000000000000000", "0000000000000000000000000"], groupSizes = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], groupBases = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];
      if (BN.prototype.toString = function toString(base, padding) {
        base = base || 10, padding = padding | 0 || 1;
        var out;
        if (base === 16 || base === "hex") {
          out = "";
          var off = 0, carry = 0;
          for (var i2 = 0;i2 < this.length; i2++) {
            var w = this.words[i2], word = ((w << off | carry) & 16777215).toString(16);
            if (carry = w >>> 24 - off & 16777215, off += 2, off >= 26)
              off -= 26, i2--;
            if (carry !== 0 || i2 !== this.length - 1)
              out = zeros[6 - word.length] + word + out;
            else
              out = word + out;
          }
          if (carry !== 0)
            out = carry.toString(16) + out;
          while (out.length % padding !== 0)
            out = "0" + out;
          if (this.negative !== 0)
            out = "-" + out;
          return out;
        }
        if (base === (base | 0) && base >= 2 && base <= 36) {
          var groupSize = groupSizes[base], groupBase = groupBases[base];
          out = "";
          var c = this.clone();
          c.negative = 0;
          while (!c.isZero()) {
            var r = c.modrn(groupBase).toString(base);
            if (c = c.idivn(groupBase), !c.isZero())
              out = zeros[groupSize - r.length] + r + out;
            else
              out = r + out;
          }
          if (this.isZero())
            out = "0" + out;
          while (out.length % padding !== 0)
            out = "0" + out;
          if (this.negative !== 0)
            out = "-" + out;
          return out;
        }
        assert(false, "Base should be between 2 and 36");
      }, BN.prototype.toNumber = function toNumber() {
        var ret = this.words[0];
        if (this.length === 2)
          ret += this.words[1] * 67108864;
        else if (this.length === 3 && this.words[2] === 1)
          ret += 4503599627370496 + this.words[1] * 67108864;
        else if (this.length > 2)
          assert(false, "Number can only safely store up to 53 bits");
        return this.negative !== 0 ? -ret : ret;
      }, BN.prototype.toJSON = function toJSON() {
        return this.toString(16, 2);
      }, Buffer22)
        BN.prototype.toBuffer = function toBuffer(endian, length) {
          return this.toArrayLike(Buffer22, endian, length);
        };
      BN.prototype.toArray = function toArray(endian, length) {
        return this.toArrayLike(Array, endian, length);
      };
      var allocate = function allocate(ArrayType, size) {
        if (ArrayType.allocUnsafe)
          return ArrayType.allocUnsafe(size);
        return new ArrayType(size);
      };
      if (BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
        this._strip();
        var byteLength2 = this.byteLength(), reqLength = length || Math.max(1, byteLength2);
        assert(byteLength2 <= reqLength, "byte array longer than desired length"), assert(reqLength > 0, "Requested array length <= 0");
        var res = allocate(ArrayType, reqLength), postfix = endian === "le" ? "LE" : "BE";
        return this["_toArrayLike" + postfix](res, byteLength2), res;
      }, BN.prototype._toArrayLikeLE = function _toArrayLikeLE(res, byteLength2) {
        var position = 0, carry = 0;
        for (var i2 = 0, shift = 0;i2 < this.length; i2++) {
          var word = this.words[i2] << shift | carry;
          if (res[position++] = word & 255, position < res.length)
            res[position++] = word >> 8 & 255;
          if (position < res.length)
            res[position++] = word >> 16 & 255;
          if (shift === 6) {
            if (position < res.length)
              res[position++] = word >> 24 & 255;
            carry = 0, shift = 0;
          } else
            carry = word >>> 24, shift += 2;
        }
        if (position < res.length) {
          res[position++] = carry;
          while (position < res.length)
            res[position++] = 0;
        }
      }, BN.prototype._toArrayLikeBE = function _toArrayLikeBE(res, byteLength2) {
        var position = res.length - 1, carry = 0;
        for (var i2 = 0, shift = 0;i2 < this.length; i2++) {
          var word = this.words[i2] << shift | carry;
          if (res[position--] = word & 255, position >= 0)
            res[position--] = word >> 8 & 255;
          if (position >= 0)
            res[position--] = word >> 16 & 255;
          if (shift === 6) {
            if (position >= 0)
              res[position--] = word >> 24 & 255;
            carry = 0, shift = 0;
          } else
            carry = word >>> 24, shift += 2;
        }
        if (position >= 0) {
          res[position--] = carry;
          while (position >= 0)
            res[position--] = 0;
        }
      }, Math.clz32)
        BN.prototype._countBits = function _countBits(w) {
          return 32 - Math.clz32(w);
        };
      else
        BN.prototype._countBits = function _countBits(w) {
          var t = w, r = 0;
          if (t >= 4096)
            r += 13, t >>>= 13;
          if (t >= 64)
            r += 7, t >>>= 7;
          if (t >= 8)
            r += 4, t >>>= 4;
          if (t >= 2)
            r += 2, t >>>= 2;
          return r + t;
        };
      BN.prototype._zeroBits = function _zeroBits(w) {
        if (w === 0)
          return 26;
        var t = w, r = 0;
        if ((t & 8191) === 0)
          r += 13, t >>>= 13;
        if ((t & 127) === 0)
          r += 7, t >>>= 7;
        if ((t & 15) === 0)
          r += 4, t >>>= 4;
        if ((t & 3) === 0)
          r += 2, t >>>= 2;
        if ((t & 1) === 0)
          r++;
        return r;
      }, BN.prototype.bitLength = function bitLength() {
        var w = this.words[this.length - 1], hi = this._countBits(w);
        return (this.length - 1) * 26 + hi;
      };
      function toBitArray(num) {
        var w = new Array(num.bitLength());
        for (var bit = 0;bit < w.length; bit++) {
          var off = bit / 26 | 0, wbit = bit % 26;
          w[bit] = num.words[off] >>> wbit & 1;
        }
        return w;
      }
      BN.prototype.zeroBits = function zeroBits() {
        if (this.isZero())
          return 0;
        var r = 0;
        for (var i2 = 0;i2 < this.length; i2++) {
          var b = this._zeroBits(this.words[i2]);
          if (r += b, b !== 26)
            break;
        }
        return r;
      }, BN.prototype.byteLength = function byteLength() {
        return Math.ceil(this.bitLength() / 8);
      }, BN.prototype.toTwos = function toTwos(width) {
        if (this.negative !== 0)
          return this.abs().inotn(width).iaddn(1);
        return this.clone();
      }, BN.prototype.fromTwos = function fromTwos(width) {
        if (this.testn(width - 1))
          return this.notn(width).iaddn(1).ineg();
        return this.clone();
      }, BN.prototype.isNeg = function isNeg() {
        return this.negative !== 0;
      }, BN.prototype.neg = function neg() {
        return this.clone().ineg();
      }, BN.prototype.ineg = function ineg() {
        if (!this.isZero())
          this.negative ^= 1;
        return this;
      }, BN.prototype.iuor = function iuor(num) {
        while (this.length < num.length)
          this.words[this.length++] = 0;
        for (var i2 = 0;i2 < num.length; i2++)
          this.words[i2] = this.words[i2] | num.words[i2];
        return this._strip();
      }, BN.prototype.ior = function ior(num) {
        return assert((this.negative | num.negative) === 0), this.iuor(num);
      }, BN.prototype.or = function or(num) {
        if (this.length > num.length)
          return this.clone().ior(num);
        return num.clone().ior(this);
      }, BN.prototype.uor = function uor(num) {
        if (this.length > num.length)
          return this.clone().iuor(num);
        return num.clone().iuor(this);
      }, BN.prototype.iuand = function iuand(num) {
        var b;
        if (this.length > num.length)
          b = num;
        else
          b = this;
        for (var i2 = 0;i2 < b.length; i2++)
          this.words[i2] = this.words[i2] & num.words[i2];
        return this.length = b.length, this._strip();
      }, BN.prototype.iand = function iand(num) {
        return assert((this.negative | num.negative) === 0), this.iuand(num);
      }, BN.prototype.and = function and(num) {
        if (this.length > num.length)
          return this.clone().iand(num);
        return num.clone().iand(this);
      }, BN.prototype.uand = function uand(num) {
        if (this.length > num.length)
          return this.clone().iuand(num);
        return num.clone().iuand(this);
      }, BN.prototype.iuxor = function iuxor(num) {
        var a, b;
        if (this.length > num.length)
          a = this, b = num;
        else
          a = num, b = this;
        for (var i2 = 0;i2 < b.length; i2++)
          this.words[i2] = a.words[i2] ^ b.words[i2];
        if (this !== a)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        return this.length = a.length, this._strip();
      }, BN.prototype.ixor = function ixor(num) {
        return assert((this.negative | num.negative) === 0), this.iuxor(num);
      }, BN.prototype.xor = function xor(num) {
        if (this.length > num.length)
          return this.clone().ixor(num);
        return num.clone().ixor(this);
      }, BN.prototype.uxor = function uxor(num) {
        if (this.length > num.length)
          return this.clone().iuxor(num);
        return num.clone().iuxor(this);
      }, BN.prototype.inotn = function inotn(width) {
        assert(typeof width === "number" && width >= 0);
        var bytesNeeded = Math.ceil(width / 26) | 0, bitsLeft = width % 26;
        if (this._expand(bytesNeeded), bitsLeft > 0)
          bytesNeeded--;
        for (var i2 = 0;i2 < bytesNeeded; i2++)
          this.words[i2] = ~this.words[i2] & 67108863;
        if (bitsLeft > 0)
          this.words[i2] = ~this.words[i2] & 67108863 >> 26 - bitsLeft;
        return this._strip();
      }, BN.prototype.notn = function notn(width) {
        return this.clone().inotn(width);
      }, BN.prototype.setn = function setn(bit, val) {
        assert(typeof bit === "number" && bit >= 0);
        var off = bit / 26 | 0, wbit = bit % 26;
        if (this._expand(off + 1), val)
          this.words[off] = this.words[off] | 1 << wbit;
        else
          this.words[off] = this.words[off] & ~(1 << wbit);
        return this._strip();
      }, BN.prototype.iadd = function iadd(num) {
        var r;
        if (this.negative !== 0 && num.negative === 0)
          return this.negative = 0, r = this.isub(num), this.negative ^= 1, this._normSign();
        else if (this.negative === 0 && num.negative !== 0)
          return num.negative = 0, r = this.isub(num), num.negative = 1, r._normSign();
        var a, b;
        if (this.length > num.length)
          a = this, b = num;
        else
          a = num, b = this;
        var carry = 0;
        for (var i2 = 0;i2 < b.length; i2++)
          r = (a.words[i2] | 0) + (b.words[i2] | 0) + carry, this.words[i2] = r & 67108863, carry = r >>> 26;
        for (;carry !== 0 && i2 < a.length; i2++)
          r = (a.words[i2] | 0) + carry, this.words[i2] = r & 67108863, carry = r >>> 26;
        if (this.length = a.length, carry !== 0)
          this.words[this.length] = carry, this.length++;
        else if (a !== this)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        return this;
      }, BN.prototype.add = function add(num) {
        var res;
        if (num.negative !== 0 && this.negative === 0)
          return num.negative = 0, res = this.sub(num), num.negative ^= 1, res;
        else if (num.negative === 0 && this.negative !== 0)
          return this.negative = 0, res = num.sub(this), this.negative = 1, res;
        if (this.length > num.length)
          return this.clone().iadd(num);
        return num.clone().iadd(this);
      }, BN.prototype.isub = function isub(num) {
        if (num.negative !== 0) {
          num.negative = 0;
          var r = this.iadd(num);
          return num.negative = 1, r._normSign();
        } else if (this.negative !== 0)
          return this.negative = 0, this.iadd(num), this.negative = 1, this._normSign();
        var cmp = this.cmp(num);
        if (cmp === 0)
          return this.negative = 0, this.length = 1, this.words[0] = 0, this;
        var a, b;
        if (cmp > 0)
          a = this, b = num;
        else
          a = num, b = this;
        var carry = 0;
        for (var i2 = 0;i2 < b.length; i2++)
          r = (a.words[i2] | 0) - (b.words[i2] | 0) + carry, carry = r >> 26, this.words[i2] = r & 67108863;
        for (;carry !== 0 && i2 < a.length; i2++)
          r = (a.words[i2] | 0) + carry, carry = r >> 26, this.words[i2] = r & 67108863;
        if (carry === 0 && i2 < a.length && a !== this)
          for (;i2 < a.length; i2++)
            this.words[i2] = a.words[i2];
        if (this.length = Math.max(this.length, i2), a !== this)
          this.negative = 1;
        return this._strip();
      }, BN.prototype.sub = function sub(num) {
        return this.clone().isub(num);
      };
      function smallMulTo(self2, num, out) {
        out.negative = num.negative ^ self2.negative;
        var len2 = self2.length + num.length | 0;
        out.length = len2, len2 = len2 - 1 | 0;
        var a = self2.words[0] | 0, b = num.words[0] | 0, r = a * b, lo = r & 67108863, carry = r / 67108864 | 0;
        out.words[0] = lo;
        for (var k = 1;k < len2; k++) {
          var ncarry = carry >>> 26, rword = carry & 67108863, maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self2.length + 1);j <= maxJ; j++) {
            var i2 = k - j | 0;
            a = self2.words[i2] | 0, b = num.words[j] | 0, r = a * b + rword, ncarry += r / 67108864 | 0, rword = r & 67108863;
          }
          out.words[k] = rword | 0, carry = ncarry | 0;
        }
        if (carry !== 0)
          out.words[k] = carry | 0;
        else
          out.length--;
        return out._strip();
      }
      var comb10MulTo = function comb10MulTo(self2, num, out) {
        var a = self2.words, b = num.words, o = out.words, c = 0, lo, mid, hi, a0 = a[0] | 0, al0 = a0 & 8191, ah0 = a0 >>> 13, a1 = a[1] | 0, al1 = a1 & 8191, ah1 = a1 >>> 13, a2 = a[2] | 0, al2 = a2 & 8191, ah2 = a2 >>> 13, a3 = a[3] | 0, al3 = a3 & 8191, ah3 = a3 >>> 13, a4 = a[4] | 0, al4 = a4 & 8191, ah4 = a4 >>> 13, a5 = a[5] | 0, al5 = a5 & 8191, ah5 = a5 >>> 13, a6 = a[6] | 0, al6 = a6 & 8191, ah6 = a6 >>> 13, a7 = a[7] | 0, al7 = a7 & 8191, ah7 = a7 >>> 13, a8 = a[8] | 0, al8 = a8 & 8191, ah8 = a8 >>> 13, a9 = a[9] | 0, al9 = a9 & 8191, ah9 = a9 >>> 13, b0 = b[0] | 0, bl0 = b0 & 8191, bh0 = b0 >>> 13, b1 = b[1] | 0, bl1 = b1 & 8191, bh1 = b1 >>> 13, b2 = b[2] | 0, bl2 = b2 & 8191, bh2 = b2 >>> 13, b3 = b[3] | 0, bl3 = b3 & 8191, bh3 = b3 >>> 13, b4 = b[4] | 0, bl4 = b4 & 8191, bh4 = b4 >>> 13, b5 = b[5] | 0, bl5 = b5 & 8191, bh5 = b5 >>> 13, b6 = b[6] | 0, bl6 = b6 & 8191, bh6 = b6 >>> 13, b7 = b[7] | 0, bl7 = b7 & 8191, bh7 = b7 >>> 13, b8 = b[8] | 0, bl8 = b8 & 8191, bh8 = b8 >>> 13, b9 = b[9] | 0, bl9 = b9 & 8191, bh9 = b9 >>> 13;
        out.negative = self2.negative ^ num.negative, out.length = 19, lo = Math.imul(al0, bl0), mid = Math.imul(al0, bh0), mid = mid + Math.imul(ah0, bl0) | 0, hi = Math.imul(ah0, bh0);
        var w0 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0, w0 &= 67108863, lo = Math.imul(al1, bl0), mid = Math.imul(al1, bh0), mid = mid + Math.imul(ah1, bl0) | 0, hi = Math.imul(ah1, bh0), lo = lo + Math.imul(al0, bl1) | 0, mid = mid + Math.imul(al0, bh1) | 0, mid = mid + Math.imul(ah0, bl1) | 0, hi = hi + Math.imul(ah0, bh1) | 0;
        var w1 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0, w1 &= 67108863, lo = Math.imul(al2, bl0), mid = Math.imul(al2, bh0), mid = mid + Math.imul(ah2, bl0) | 0, hi = Math.imul(ah2, bh0), lo = lo + Math.imul(al1, bl1) | 0, mid = mid + Math.imul(al1, bh1) | 0, mid = mid + Math.imul(ah1, bl1) | 0, hi = hi + Math.imul(ah1, bh1) | 0, lo = lo + Math.imul(al0, bl2) | 0, mid = mid + Math.imul(al0, bh2) | 0, mid = mid + Math.imul(ah0, bl2) | 0, hi = hi + Math.imul(ah0, bh2) | 0;
        var w2 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0, w2 &= 67108863, lo = Math.imul(al3, bl0), mid = Math.imul(al3, bh0), mid = mid + Math.imul(ah3, bl0) | 0, hi = Math.imul(ah3, bh0), lo = lo + Math.imul(al2, bl1) | 0, mid = mid + Math.imul(al2, bh1) | 0, mid = mid + Math.imul(ah2, bl1) | 0, hi = hi + Math.imul(ah2, bh1) | 0, lo = lo + Math.imul(al1, bl2) | 0, mid = mid + Math.imul(al1, bh2) | 0, mid = mid + Math.imul(ah1, bl2) | 0, hi = hi + Math.imul(ah1, bh2) | 0, lo = lo + Math.imul(al0, bl3) | 0, mid = mid + Math.imul(al0, bh3) | 0, mid = mid + Math.imul(ah0, bl3) | 0, hi = hi + Math.imul(ah0, bh3) | 0;
        var w3 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0, w3 &= 67108863, lo = Math.imul(al4, bl0), mid = Math.imul(al4, bh0), mid = mid + Math.imul(ah4, bl0) | 0, hi = Math.imul(ah4, bh0), lo = lo + Math.imul(al3, bl1) | 0, mid = mid + Math.imul(al3, bh1) | 0, mid = mid + Math.imul(ah3, bl1) | 0, hi = hi + Math.imul(ah3, bh1) | 0, lo = lo + Math.imul(al2, bl2) | 0, mid = mid + Math.imul(al2, bh2) | 0, mid = mid + Math.imul(ah2, bl2) | 0, hi = hi + Math.imul(ah2, bh2) | 0, lo = lo + Math.imul(al1, bl3) | 0, mid = mid + Math.imul(al1, bh3) | 0, mid = mid + Math.imul(ah1, bl3) | 0, hi = hi + Math.imul(ah1, bh3) | 0, lo = lo + Math.imul(al0, bl4) | 0, mid = mid + Math.imul(al0, bh4) | 0, mid = mid + Math.imul(ah0, bl4) | 0, hi = hi + Math.imul(ah0, bh4) | 0;
        var w4 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0, w4 &= 67108863, lo = Math.imul(al5, bl0), mid = Math.imul(al5, bh0), mid = mid + Math.imul(ah5, bl0) | 0, hi = Math.imul(ah5, bh0), lo = lo + Math.imul(al4, bl1) | 0, mid = mid + Math.imul(al4, bh1) | 0, mid = mid + Math.imul(ah4, bl1) | 0, hi = hi + Math.imul(ah4, bh1) | 0, lo = lo + Math.imul(al3, bl2) | 0, mid = mid + Math.imul(al3, bh2) | 0, mid = mid + Math.imul(ah3, bl2) | 0, hi = hi + Math.imul(ah3, bh2) | 0, lo = lo + Math.imul(al2, bl3) | 0, mid = mid + Math.imul(al2, bh3) | 0, mid = mid + Math.imul(ah2, bl3) | 0, hi = hi + Math.imul(ah2, bh3) | 0, lo = lo + Math.imul(al1, bl4) | 0, mid = mid + Math.imul(al1, bh4) | 0, mid = mid + Math.imul(ah1, bl4) | 0, hi = hi + Math.imul(ah1, bh4) | 0, lo = lo + Math.imul(al0, bl5) | 0, mid = mid + Math.imul(al0, bh5) | 0, mid = mid + Math.imul(ah0, bl5) | 0, hi = hi + Math.imul(ah0, bh5) | 0;
        var w5 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0, w5 &= 67108863, lo = Math.imul(al6, bl0), mid = Math.imul(al6, bh0), mid = mid + Math.imul(ah6, bl0) | 0, hi = Math.imul(ah6, bh0), lo = lo + Math.imul(al5, bl1) | 0, mid = mid + Math.imul(al5, bh1) | 0, mid = mid + Math.imul(ah5, bl1) | 0, hi = hi + Math.imul(ah5, bh1) | 0, lo = lo + Math.imul(al4, bl2) | 0, mid = mid + Math.imul(al4, bh2) | 0, mid = mid + Math.imul(ah4, bl2) | 0, hi = hi + Math.imul(ah4, bh2) | 0, lo = lo + Math.imul(al3, bl3) | 0, mid = mid + Math.imul(al3, bh3) | 0, mid = mid + Math.imul(ah3, bl3) | 0, hi = hi + Math.imul(ah3, bh3) | 0, lo = lo + Math.imul(al2, bl4) | 0, mid = mid + Math.imul(al2, bh4) | 0, mid = mid + Math.imul(ah2, bl4) | 0, hi = hi + Math.imul(ah2, bh4) | 0, lo = lo + Math.imul(al1, bl5) | 0, mid = mid + Math.imul(al1, bh5) | 0, mid = mid + Math.imul(ah1, bl5) | 0, hi = hi + Math.imul(ah1, bh5) | 0, lo = lo + Math.imul(al0, bl6) | 0, mid = mid + Math.imul(al0, bh6) | 0, mid = mid + Math.imul(ah0, bl6) | 0, hi = hi + Math.imul(ah0, bh6) | 0;
        var w6 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0, w6 &= 67108863, lo = Math.imul(al7, bl0), mid = Math.imul(al7, bh0), mid = mid + Math.imul(ah7, bl0) | 0, hi = Math.imul(ah7, bh0), lo = lo + Math.imul(al6, bl1) | 0, mid = mid + Math.imul(al6, bh1) | 0, mid = mid + Math.imul(ah6, bl1) | 0, hi = hi + Math.imul(ah6, bh1) | 0, lo = lo + Math.imul(al5, bl2) | 0, mid = mid + Math.imul(al5, bh2) | 0, mid = mid + Math.imul(ah5, bl2) | 0, hi = hi + Math.imul(ah5, bh2) | 0, lo = lo + Math.imul(al4, bl3) | 0, mid = mid + Math.imul(al4, bh3) | 0, mid = mid + Math.imul(ah4, bl3) | 0, hi = hi + Math.imul(ah4, bh3) | 0, lo = lo + Math.imul(al3, bl4) | 0, mid = mid + Math.imul(al3, bh4) | 0, mid = mid + Math.imul(ah3, bl4) | 0, hi = hi + Math.imul(ah3, bh4) | 0, lo = lo + Math.imul(al2, bl5) | 0, mid = mid + Math.imul(al2, bh5) | 0, mid = mid + Math.imul(ah2, bl5) | 0, hi = hi + Math.imul(ah2, bh5) | 0, lo = lo + Math.imul(al1, bl6) | 0, mid = mid + Math.imul(al1, bh6) | 0, mid = mid + Math.imul(ah1, bl6) | 0, hi = hi + Math.imul(ah1, bh6) | 0, lo = lo + Math.imul(al0, bl7) | 0, mid = mid + Math.imul(al0, bh7) | 0, mid = mid + Math.imul(ah0, bl7) | 0, hi = hi + Math.imul(ah0, bh7) | 0;
        var w7 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0, w7 &= 67108863, lo = Math.imul(al8, bl0), mid = Math.imul(al8, bh0), mid = mid + Math.imul(ah8, bl0) | 0, hi = Math.imul(ah8, bh0), lo = lo + Math.imul(al7, bl1) | 0, mid = mid + Math.imul(al7, bh1) | 0, mid = mid + Math.imul(ah7, bl1) | 0, hi = hi + Math.imul(ah7, bh1) | 0, lo = lo + Math.imul(al6, bl2) | 0, mid = mid + Math.imul(al6, bh2) | 0, mid = mid + Math.imul(ah6, bl2) | 0, hi = hi + Math.imul(ah6, bh2) | 0, lo = lo + Math.imul(al5, bl3) | 0, mid = mid + Math.imul(al5, bh3) | 0, mid = mid + Math.imul(ah5, bl3) | 0, hi = hi + Math.imul(ah5, bh3) | 0, lo = lo + Math.imul(al4, bl4) | 0, mid = mid + Math.imul(al4, bh4) | 0, mid = mid + Math.imul(ah4, bl4) | 0, hi = hi + Math.imul(ah4, bh4) | 0, lo = lo + Math.imul(al3, bl5) | 0, mid = mid + Math.imul(al3, bh5) | 0, mid = mid + Math.imul(ah3, bl5) | 0, hi = hi + Math.imul(ah3, bh5) | 0, lo = lo + Math.imul(al2, bl6) | 0, mid = mid + Math.imul(al2, bh6) | 0, mid = mid + Math.imul(ah2, bl6) | 0, hi = hi + Math.imul(ah2, bh6) | 0, lo = lo + Math.imul(al1, bl7) | 0, mid = mid + Math.imul(al1, bh7) | 0, mid = mid + Math.imul(ah1, bl7) | 0, hi = hi + Math.imul(ah1, bh7) | 0, lo = lo + Math.imul(al0, bl8) | 0, mid = mid + Math.imul(al0, bh8) | 0, mid = mid + Math.imul(ah0, bl8) | 0, hi = hi + Math.imul(ah0, bh8) | 0;
        var w8 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0, w8 &= 67108863, lo = Math.imul(al9, bl0), mid = Math.imul(al9, bh0), mid = mid + Math.imul(ah9, bl0) | 0, hi = Math.imul(ah9, bh0), lo = lo + Math.imul(al8, bl1) | 0, mid = mid + Math.imul(al8, bh1) | 0, mid = mid + Math.imul(ah8, bl1) | 0, hi = hi + Math.imul(ah8, bh1) | 0, lo = lo + Math.imul(al7, bl2) | 0, mid = mid + Math.imul(al7, bh2) | 0, mid = mid + Math.imul(ah7, bl2) | 0, hi = hi + Math.imul(ah7, bh2) | 0, lo = lo + Math.imul(al6, bl3) | 0, mid = mid + Math.imul(al6, bh3) | 0, mid = mid + Math.imul(ah6, bl3) | 0, hi = hi + Math.imul(ah6, bh3) | 0, lo = lo + Math.imul(al5, bl4) | 0, mid = mid + Math.imul(al5, bh4) | 0, mid = mid + Math.imul(ah5, bl4) | 0, hi = hi + Math.imul(ah5, bh4) | 0, lo = lo + Math.imul(al4, bl5) | 0, mid = mid + Math.imul(al4, bh5) | 0, mid = mid + Math.imul(ah4, bl5) | 0, hi = hi + Math.imul(ah4, bh5) | 0, lo = lo + Math.imul(al3, bl6) | 0, mid = mid + Math.imul(al3, bh6) | 0, mid = mid + Math.imul(ah3, bl6) | 0, hi = hi + Math.imul(ah3, bh6) | 0, lo = lo + Math.imul(al2, bl7) | 0, mid = mid + Math.imul(al2, bh7) | 0, mid = mid + Math.imul(ah2, bl7) | 0, hi = hi + Math.imul(ah2, bh7) | 0, lo = lo + Math.imul(al1, bl8) | 0, mid = mid + Math.imul(al1, bh8) | 0, mid = mid + Math.imul(ah1, bl8) | 0, hi = hi + Math.imul(ah1, bh8) | 0, lo = lo + Math.imul(al0, bl9) | 0, mid = mid + Math.imul(al0, bh9) | 0, mid = mid + Math.imul(ah0, bl9) | 0, hi = hi + Math.imul(ah0, bh9) | 0;
        var w9 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0, w9 &= 67108863, lo = Math.imul(al9, bl1), mid = Math.imul(al9, bh1), mid = mid + Math.imul(ah9, bl1) | 0, hi = Math.imul(ah9, bh1), lo = lo + Math.imul(al8, bl2) | 0, mid = mid + Math.imul(al8, bh2) | 0, mid = mid + Math.imul(ah8, bl2) | 0, hi = hi + Math.imul(ah8, bh2) | 0, lo = lo + Math.imul(al7, bl3) | 0, mid = mid + Math.imul(al7, bh3) | 0, mid = mid + Math.imul(ah7, bl3) | 0, hi = hi + Math.imul(ah7, bh3) | 0, lo = lo + Math.imul(al6, bl4) | 0, mid = mid + Math.imul(al6, bh4) | 0, mid = mid + Math.imul(ah6, bl4) | 0, hi = hi + Math.imul(ah6, bh4) | 0, lo = lo + Math.imul(al5, bl5) | 0, mid = mid + Math.imul(al5, bh5) | 0, mid = mid + Math.imul(ah5, bl5) | 0, hi = hi + Math.imul(ah5, bh5) | 0, lo = lo + Math.imul(al4, bl6) | 0, mid = mid + Math.imul(al4, bh6) | 0, mid = mid + Math.imul(ah4, bl6) | 0, hi = hi + Math.imul(ah4, bh6) | 0, lo = lo + Math.imul(al3, bl7) | 0, mid = mid + Math.imul(al3, bh7) | 0, mid = mid + Math.imul(ah3, bl7) | 0, hi = hi + Math.imul(ah3, bh7) | 0, lo = lo + Math.imul(al2, bl8) | 0, mid = mid + Math.imul(al2, bh8) | 0, mid = mid + Math.imul(ah2, bl8) | 0, hi = hi + Math.imul(ah2, bh8) | 0, lo = lo + Math.imul(al1, bl9) | 0, mid = mid + Math.imul(al1, bh9) | 0, mid = mid + Math.imul(ah1, bl9) | 0, hi = hi + Math.imul(ah1, bh9) | 0;
        var w10 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0, w10 &= 67108863, lo = Math.imul(al9, bl2), mid = Math.imul(al9, bh2), mid = mid + Math.imul(ah9, bl2) | 0, hi = Math.imul(ah9, bh2), lo = lo + Math.imul(al8, bl3) | 0, mid = mid + Math.imul(al8, bh3) | 0, mid = mid + Math.imul(ah8, bl3) | 0, hi = hi + Math.imul(ah8, bh3) | 0, lo = lo + Math.imul(al7, bl4) | 0, mid = mid + Math.imul(al7, bh4) | 0, mid = mid + Math.imul(ah7, bl4) | 0, hi = hi + Math.imul(ah7, bh4) | 0, lo = lo + Math.imul(al6, bl5) | 0, mid = mid + Math.imul(al6, bh5) | 0, mid = mid + Math.imul(ah6, bl5) | 0, hi = hi + Math.imul(ah6, bh5) | 0, lo = lo + Math.imul(al5, bl6) | 0, mid = mid + Math.imul(al5, bh6) | 0, mid = mid + Math.imul(ah5, bl6) | 0, hi = hi + Math.imul(ah5, bh6) | 0, lo = lo + Math.imul(al4, bl7) | 0, mid = mid + Math.imul(al4, bh7) | 0, mid = mid + Math.imul(ah4, bl7) | 0, hi = hi + Math.imul(ah4, bh7) | 0, lo = lo + Math.imul(al3, bl8) | 0, mid = mid + Math.imul(al3, bh8) | 0, mid = mid + Math.imul(ah3, bl8) | 0, hi = hi + Math.imul(ah3, bh8) | 0, lo = lo + Math.imul(al2, bl9) | 0, mid = mid + Math.imul(al2, bh9) | 0, mid = mid + Math.imul(ah2, bl9) | 0, hi = hi + Math.imul(ah2, bh9) | 0;
        var w11 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0, w11 &= 67108863, lo = Math.imul(al9, bl3), mid = Math.imul(al9, bh3), mid = mid + Math.imul(ah9, bl3) | 0, hi = Math.imul(ah9, bh3), lo = lo + Math.imul(al8, bl4) | 0, mid = mid + Math.imul(al8, bh4) | 0, mid = mid + Math.imul(ah8, bl4) | 0, hi = hi + Math.imul(ah8, bh4) | 0, lo = lo + Math.imul(al7, bl5) | 0, mid = mid + Math.imul(al7, bh5) | 0, mid = mid + Math.imul(ah7, bl5) | 0, hi = hi + Math.imul(ah7, bh5) | 0, lo = lo + Math.imul(al6, bl6) | 0, mid = mid + Math.imul(al6, bh6) | 0, mid = mid + Math.imul(ah6, bl6) | 0, hi = hi + Math.imul(ah6, bh6) | 0, lo = lo + Math.imul(al5, bl7) | 0, mid = mid + Math.imul(al5, bh7) | 0, mid = mid + Math.imul(ah5, bl7) | 0, hi = hi + Math.imul(ah5, bh7) | 0, lo = lo + Math.imul(al4, bl8) | 0, mid = mid + Math.imul(al4, bh8) | 0, mid = mid + Math.imul(ah4, bl8) | 0, hi = hi + Math.imul(ah4, bh8) | 0, lo = lo + Math.imul(al3, bl9) | 0, mid = mid + Math.imul(al3, bh9) | 0, mid = mid + Math.imul(ah3, bl9) | 0, hi = hi + Math.imul(ah3, bh9) | 0;
        var w12 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0, w12 &= 67108863, lo = Math.imul(al9, bl4), mid = Math.imul(al9, bh4), mid = mid + Math.imul(ah9, bl4) | 0, hi = Math.imul(ah9, bh4), lo = lo + Math.imul(al8, bl5) | 0, mid = mid + Math.imul(al8, bh5) | 0, mid = mid + Math.imul(ah8, bl5) | 0, hi = hi + Math.imul(ah8, bh5) | 0, lo = lo + Math.imul(al7, bl6) | 0, mid = mid + Math.imul(al7, bh6) | 0, mid = mid + Math.imul(ah7, bl6) | 0, hi = hi + Math.imul(ah7, bh6) | 0, lo = lo + Math.imul(al6, bl7) | 0, mid = mid + Math.imul(al6, bh7) | 0, mid = mid + Math.imul(ah6, bl7) | 0, hi = hi + Math.imul(ah6, bh7) | 0, lo = lo + Math.imul(al5, bl8) | 0, mid = mid + Math.imul(al5, bh8) | 0, mid = mid + Math.imul(ah5, bl8) | 0, hi = hi + Math.imul(ah5, bh8) | 0, lo = lo + Math.imul(al4, bl9) | 0, mid = mid + Math.imul(al4, bh9) | 0, mid = mid + Math.imul(ah4, bl9) | 0, hi = hi + Math.imul(ah4, bh9) | 0;
        var w13 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0, w13 &= 67108863, lo = Math.imul(al9, bl5), mid = Math.imul(al9, bh5), mid = mid + Math.imul(ah9, bl5) | 0, hi = Math.imul(ah9, bh5), lo = lo + Math.imul(al8, bl6) | 0, mid = mid + Math.imul(al8, bh6) | 0, mid = mid + Math.imul(ah8, bl6) | 0, hi = hi + Math.imul(ah8, bh6) | 0, lo = lo + Math.imul(al7, bl7) | 0, mid = mid + Math.imul(al7, bh7) | 0, mid = mid + Math.imul(ah7, bl7) | 0, hi = hi + Math.imul(ah7, bh7) | 0, lo = lo + Math.imul(al6, bl8) | 0, mid = mid + Math.imul(al6, bh8) | 0, mid = mid + Math.imul(ah6, bl8) | 0, hi = hi + Math.imul(ah6, bh8) | 0, lo = lo + Math.imul(al5, bl9) | 0, mid = mid + Math.imul(al5, bh9) | 0, mid = mid + Math.imul(ah5, bl9) | 0, hi = hi + Math.imul(ah5, bh9) | 0;
        var w14 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0, w14 &= 67108863, lo = Math.imul(al9, bl6), mid = Math.imul(al9, bh6), mid = mid + Math.imul(ah9, bl6) | 0, hi = Math.imul(ah9, bh6), lo = lo + Math.imul(al8, bl7) | 0, mid = mid + Math.imul(al8, bh7) | 0, mid = mid + Math.imul(ah8, bl7) | 0, hi = hi + Math.imul(ah8, bh7) | 0, lo = lo + Math.imul(al7, bl8) | 0, mid = mid + Math.imul(al7, bh8) | 0, mid = mid + Math.imul(ah7, bl8) | 0, hi = hi + Math.imul(ah7, bh8) | 0, lo = lo + Math.imul(al6, bl9) | 0, mid = mid + Math.imul(al6, bh9) | 0, mid = mid + Math.imul(ah6, bl9) | 0, hi = hi + Math.imul(ah6, bh9) | 0;
        var w15 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0, w15 &= 67108863, lo = Math.imul(al9, bl7), mid = Math.imul(al9, bh7), mid = mid + Math.imul(ah9, bl7) | 0, hi = Math.imul(ah9, bh7), lo = lo + Math.imul(al8, bl8) | 0, mid = mid + Math.imul(al8, bh8) | 0, mid = mid + Math.imul(ah8, bl8) | 0, hi = hi + Math.imul(ah8, bh8) | 0, lo = lo + Math.imul(al7, bl9) | 0, mid = mid + Math.imul(al7, bh9) | 0, mid = mid + Math.imul(ah7, bl9) | 0, hi = hi + Math.imul(ah7, bh9) | 0;
        var w16 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0, w16 &= 67108863, lo = Math.imul(al9, bl8), mid = Math.imul(al9, bh8), mid = mid + Math.imul(ah9, bl8) | 0, hi = Math.imul(ah9, bh8), lo = lo + Math.imul(al8, bl9) | 0, mid = mid + Math.imul(al8, bh9) | 0, mid = mid + Math.imul(ah8, bl9) | 0, hi = hi + Math.imul(ah8, bh9) | 0;
        var w17 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0, w17 &= 67108863, lo = Math.imul(al9, bl9), mid = Math.imul(al9, bh9), mid = mid + Math.imul(ah9, bl9) | 0, hi = Math.imul(ah9, bh9);
        var w18 = (c + lo | 0) + ((mid & 8191) << 13) | 0;
        if (c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0, w18 &= 67108863, o[0] = w0, o[1] = w1, o[2] = w2, o[3] = w3, o[4] = w4, o[5] = w5, o[6] = w6, o[7] = w7, o[8] = w8, o[9] = w9, o[10] = w10, o[11] = w11, o[12] = w12, o[13] = w13, o[14] = w14, o[15] = w15, o[16] = w16, o[17] = w17, o[18] = w18, c !== 0)
          o[19] = c, out.length++;
        return out;
      };
      if (!Math.imul)
        comb10MulTo = smallMulTo;
      function bigMulTo(self2, num, out) {
        out.negative = num.negative ^ self2.negative, out.length = self2.length + num.length;
        var carry = 0, hncarry = 0;
        for (var k = 0;k < out.length - 1; k++) {
          var ncarry = hncarry;
          hncarry = 0;
          var rword = carry & 67108863, maxJ = Math.min(k, num.length - 1);
          for (var j = Math.max(0, k - self2.length + 1);j <= maxJ; j++) {
            var i2 = k - j, a = self2.words[i2] | 0, b = num.words[j] | 0, r = a * b, lo = r & 67108863;
            ncarry = ncarry + (r / 67108864 | 0) | 0, lo = lo + rword | 0, rword = lo & 67108863, ncarry = ncarry + (lo >>> 26) | 0, hncarry += ncarry >>> 26, ncarry &= 67108863;
          }
          out.words[k] = rword, carry = ncarry, ncarry = hncarry;
        }
        if (carry !== 0)
          out.words[k] = carry;
        else
          out.length--;
        return out._strip();
      }
      function jumboMulTo(self2, num, out) {
        return bigMulTo(self2, num, out);
      }
      BN.prototype.mulTo = function mulTo(num, out) {
        var res, len2 = this.length + num.length;
        if (this.length === 10 && num.length === 10)
          res = comb10MulTo(this, num, out);
        else if (len2 < 63)
          res = smallMulTo(this, num, out);
        else if (len2 < 1024)
          res = bigMulTo(this, num, out);
        else
          res = jumboMulTo(this, num, out);
        return res;
      };
      function FFTM(x, y) {
        this.x = x, this.y = y;
      }
      FFTM.prototype.makeRBT = function makeRBT(N) {
        var t = new Array(N), l = BN.prototype._countBits(N) - 1;
        for (var i2 = 0;i2 < N; i2++)
          t[i2] = this.revBin(i2, l, N);
        return t;
      }, FFTM.prototype.revBin = function revBin(x, l, N) {
        if (x === 0 || x === N - 1)
          return x;
        var rb = 0;
        for (var i2 = 0;i2 < l; i2++)
          rb |= (x & 1) << l - i2 - 1, x >>= 1;
        return rb;
      }, FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
        for (var i2 = 0;i2 < N; i2++)
          rtws[i2] = rws[rbt[i2]], itws[i2] = iws[rbt[i2]];
      }, FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
        this.permute(rbt, rws, iws, rtws, itws, N);
        for (var s = 1;s < N; s <<= 1) {
          var l = s << 1, rtwdf = Math.cos(2 * Math.PI / l), itwdf = Math.sin(2 * Math.PI / l);
          for (var p = 0;p < N; p += l) {
            var rtwdf_ = rtwdf, itwdf_ = itwdf;
            for (var j = 0;j < s; j++) {
              var re = rtws[p + j], ie = itws[p + j], ro = rtws[p + j + s], io = itws[p + j + s], rx = rtwdf_ * ro - itwdf_ * io;
              if (io = rtwdf_ * io + itwdf_ * ro, ro = rx, rtws[p + j] = re + ro, itws[p + j] = ie + io, rtws[p + j + s] = re - ro, itws[p + j + s] = ie - io, j !== l)
                rx = rtwdf * rtwdf_ - itwdf * itwdf_, itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_, rtwdf_ = rx;
            }
          }
        }
      }, FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
        var N = Math.max(m, n) | 1, odd = N & 1, i2 = 0;
        for (N = N / 2 | 0;N; N = N >>> 1)
          i2++;
        return 1 << i2 + 1 + odd;
      }, FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
        if (N <= 1)
          return;
        for (var i2 = 0;i2 < N / 2; i2++) {
          var t = rws[i2];
          rws[i2] = rws[N - i2 - 1], rws[N - i2 - 1] = t, t = iws[i2], iws[i2] = -iws[N - i2 - 1], iws[N - i2 - 1] = -t;
        }
      }, FFTM.prototype.normalize13b = function normalize13b(ws, N) {
        var carry = 0;
        for (var i2 = 0;i2 < N / 2; i2++) {
          var w = Math.round(ws[2 * i2 + 1] / N) * 8192 + Math.round(ws[2 * i2] / N) + carry;
          if (ws[i2] = w & 67108863, w < 67108864)
            carry = 0;
          else
            carry = w / 67108864 | 0;
        }
        return ws;
      }, FFTM.prototype.convert13b = function convert13b(ws, len2, rws, N) {
        var carry = 0;
        for (var i2 = 0;i2 < len2; i2++)
          carry = carry + (ws[i2] | 0), rws[2 * i2] = carry & 8191, carry = carry >>> 13, rws[2 * i2 + 1] = carry & 8191, carry = carry >>> 13;
        for (i2 = 2 * len2;i2 < N; ++i2)
          rws[i2] = 0;
        assert(carry === 0), assert((carry & -8192) === 0);
      }, FFTM.prototype.stub = function stub(N) {
        var ph = new Array(N);
        for (var i2 = 0;i2 < N; i2++)
          ph[i2] = 0;
        return ph;
      }, FFTM.prototype.mulp = function mulp(x, y, out) {
        var N = 2 * this.guessLen13b(x.length, y.length), rbt = this.makeRBT(N), _ = this.stub(N), rws = new Array(N), rwst = new Array(N), iwst = new Array(N), nrws = new Array(N), nrwst = new Array(N), niwst = new Array(N), rmws = out.words;
        rmws.length = N, this.convert13b(x.words, x.length, rws, N), this.convert13b(y.words, y.length, nrws, N), this.transform(rws, _, rwst, iwst, N, rbt), this.transform(nrws, _, nrwst, niwst, N, rbt);
        for (var i2 = 0;i2 < N; i2++) {
          var rx = rwst[i2] * nrwst[i2] - iwst[i2] * niwst[i2];
          iwst[i2] = rwst[i2] * niwst[i2] + iwst[i2] * nrwst[i2], rwst[i2] = rx;
        }
        return this.conjugate(rwst, iwst, N), this.transform(rwst, iwst, rmws, _, N, rbt), this.conjugate(rmws, _, N), this.normalize13b(rmws, N), out.negative = x.negative ^ y.negative, out.length = x.length + y.length, out._strip();
      }, BN.prototype.mul = function mul(num) {
        var out = new BN(null);
        return out.words = new Array(this.length + num.length), this.mulTo(num, out);
      }, BN.prototype.mulf = function mulf(num) {
        var out = new BN(null);
        return out.words = new Array(this.length + num.length), jumboMulTo(this, num, out);
      }, BN.prototype.imul = function imul(num) {
        return this.clone().mulTo(num, this);
      }, BN.prototype.imuln = function imuln(num) {
        var isNegNum = num < 0;
        if (isNegNum)
          num = -num;
        assert(typeof num === "number"), assert(num < 67108864);
        var carry = 0;
        for (var i2 = 0;i2 < this.length; i2++) {
          var w = (this.words[i2] | 0) * num, lo = (w & 67108863) + (carry & 67108863);
          carry >>= 26, carry += w / 67108864 | 0, carry += lo >>> 26, this.words[i2] = lo & 67108863;
        }
        if (carry !== 0)
          this.words[i2] = carry, this.length++;
        return this.length = num === 0 ? 1 : this.length, isNegNum ? this.ineg() : this;
      }, BN.prototype.muln = function muln(num) {
        return this.clone().imuln(num);
      }, BN.prototype.sqr = function sqr() {
        return this.mul(this);
      }, BN.prototype.isqr = function isqr() {
        return this.imul(this.clone());
      }, BN.prototype.pow = function pow(num) {
        var w = toBitArray(num);
        if (w.length === 0)
          return new BN(1);
        var res = this;
        for (var i2 = 0;i2 < w.length; i2++, res = res.sqr())
          if (w[i2] !== 0)
            break;
        if (++i2 < w.length)
          for (var q = res.sqr();i2 < w.length; i2++, q = q.sqr()) {
            if (w[i2] === 0)
              continue;
            res = res.mul(q);
          }
        return res;
      }, BN.prototype.iushln = function iushln(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26, s = (bits - r) / 26, carryMask = 67108863 >>> 26 - r << 26 - r, i2;
        if (r !== 0) {
          var carry = 0;
          for (i2 = 0;i2 < this.length; i2++) {
            var newCarry = this.words[i2] & carryMask, c = (this.words[i2] | 0) - newCarry << r;
            this.words[i2] = c | carry, carry = newCarry >>> 26 - r;
          }
          if (carry)
            this.words[i2] = carry, this.length++;
        }
        if (s !== 0) {
          for (i2 = this.length - 1;i2 >= 0; i2--)
            this.words[i2 + s] = this.words[i2];
          for (i2 = 0;i2 < s; i2++)
            this.words[i2] = 0;
          this.length += s;
        }
        return this._strip();
      }, BN.prototype.ishln = function ishln(bits) {
        return assert(this.negative === 0), this.iushln(bits);
      }, BN.prototype.iushrn = function iushrn(bits, hint, extended) {
        assert(typeof bits === "number" && bits >= 0);
        var h;
        if (hint)
          h = (hint - hint % 26) / 26;
        else
          h = 0;
        var r = bits % 26, s = Math.min((bits - r) / 26, this.length), mask = 67108863 ^ 67108863 >>> r << r, maskedWords = extended;
        if (h -= s, h = Math.max(0, h), maskedWords) {
          for (var i2 = 0;i2 < s; i2++)
            maskedWords.words[i2] = this.words[i2];
          maskedWords.length = s;
        }
        if (s === 0)
          ;
        else if (this.length > s) {
          this.length -= s;
          for (i2 = 0;i2 < this.length; i2++)
            this.words[i2] = this.words[i2 + s];
        } else
          this.words[0] = 0, this.length = 1;
        var carry = 0;
        for (i2 = this.length - 1;i2 >= 0 && (carry !== 0 || i2 >= h); i2--) {
          var word = this.words[i2] | 0;
          this.words[i2] = carry << 26 - r | word >>> r, carry = word & mask;
        }
        if (maskedWords && carry !== 0)
          maskedWords.words[maskedWords.length++] = carry;
        if (this.length === 0)
          this.words[0] = 0, this.length = 1;
        return this._strip();
      }, BN.prototype.ishrn = function ishrn(bits, hint, extended) {
        return assert(this.negative === 0), this.iushrn(bits, hint, extended);
      }, BN.prototype.shln = function shln(bits) {
        return this.clone().ishln(bits);
      }, BN.prototype.ushln = function ushln(bits) {
        return this.clone().iushln(bits);
      }, BN.prototype.shrn = function shrn(bits) {
        return this.clone().ishrn(bits);
      }, BN.prototype.ushrn = function ushrn(bits) {
        return this.clone().iushrn(bits);
      }, BN.prototype.testn = function testn(bit) {
        assert(typeof bit === "number" && bit >= 0);
        var r = bit % 26, s = (bit - r) / 26, q = 1 << r;
        if (this.length <= s)
          return false;
        var w = this.words[s];
        return !!(w & q);
      }, BN.prototype.imaskn = function imaskn(bits) {
        assert(typeof bits === "number" && bits >= 0);
        var r = bits % 26, s = (bits - r) / 26;
        if (assert(this.negative === 0, "imaskn works only with positive numbers"), this.length <= s)
          return this;
        if (r !== 0)
          s++;
        if (this.length = Math.min(s, this.length), r !== 0) {
          var mask = 67108863 ^ 67108863 >>> r << r;
          this.words[this.length - 1] &= mask;
        }
        return this._strip();
      }, BN.prototype.maskn = function maskn(bits) {
        return this.clone().imaskn(bits);
      }, BN.prototype.iaddn = function iaddn(num) {
        if (assert(typeof num === "number"), assert(num < 67108864), num < 0)
          return this.isubn(-num);
        if (this.negative !== 0) {
          if (this.length === 1 && (this.words[0] | 0) <= num)
            return this.words[0] = num - (this.words[0] | 0), this.negative = 0, this;
          return this.negative = 0, this.isubn(num), this.negative = 1, this;
        }
        return this._iaddn(num);
      }, BN.prototype._iaddn = function _iaddn(num) {
        this.words[0] += num;
        for (var i2 = 0;i2 < this.length && this.words[i2] >= 67108864; i2++)
          if (this.words[i2] -= 67108864, i2 === this.length - 1)
            this.words[i2 + 1] = 1;
          else
            this.words[i2 + 1]++;
        return this.length = Math.max(this.length, i2 + 1), this;
      }, BN.prototype.isubn = function isubn(num) {
        if (assert(typeof num === "number"), assert(num < 67108864), num < 0)
          return this.iaddn(-num);
        if (this.negative !== 0)
          return this.negative = 0, this.iaddn(num), this.negative = 1, this;
        if (this.words[0] -= num, this.length === 1 && this.words[0] < 0)
          this.words[0] = -this.words[0], this.negative = 1;
        else
          for (var i2 = 0;i2 < this.length && this.words[i2] < 0; i2++)
            this.words[i2] += 67108864, this.words[i2 + 1] -= 1;
        return this._strip();
      }, BN.prototype.addn = function addn(num) {
        return this.clone().iaddn(num);
      }, BN.prototype.subn = function subn(num) {
        return this.clone().isubn(num);
      }, BN.prototype.iabs = function iabs() {
        return this.negative = 0, this;
      }, BN.prototype.abs = function abs() {
        return this.clone().iabs();
      }, BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
        var len2 = num.length + shift, i2;
        this._expand(len2);
        var w, carry = 0;
        for (i2 = 0;i2 < num.length; i2++) {
          w = (this.words[i2 + shift] | 0) + carry;
          var right = (num.words[i2] | 0) * mul;
          w -= right & 67108863, carry = (w >> 26) - (right / 67108864 | 0), this.words[i2 + shift] = w & 67108863;
        }
        for (;i2 < this.length - shift; i2++)
          w = (this.words[i2 + shift] | 0) + carry, carry = w >> 26, this.words[i2 + shift] = w & 67108863;
        if (carry === 0)
          return this._strip();
        assert(carry === -1), carry = 0;
        for (i2 = 0;i2 < this.length; i2++)
          w = -(this.words[i2] | 0) + carry, carry = w >> 26, this.words[i2] = w & 67108863;
        return this.negative = 1, this._strip();
      }, BN.prototype._wordDiv = function _wordDiv(num, mode) {
        var shift = this.length - num.length, a = this.clone(), b = num, bhi = b.words[b.length - 1] | 0, bhiBits = this._countBits(bhi);
        if (shift = 26 - bhiBits, shift !== 0)
          b = b.ushln(shift), a.iushln(shift), bhi = b.words[b.length - 1] | 0;
        var m = a.length - b.length, q;
        if (mode !== "mod") {
          q = new BN(null), q.length = m + 1, q.words = new Array(q.length);
          for (var i2 = 0;i2 < q.length; i2++)
            q.words[i2] = 0;
        }
        var diff = a.clone()._ishlnsubmul(b, 1, m);
        if (diff.negative === 0) {
          if (a = diff, q)
            q.words[m] = 1;
        }
        for (var j = m - 1;j >= 0; j--) {
          var qj = (a.words[b.length + j] | 0) * 67108864 + (a.words[b.length + j - 1] | 0);
          qj = Math.min(qj / bhi | 0, 67108863), a._ishlnsubmul(b, qj, j);
          while (a.negative !== 0)
            if (qj--, a.negative = 0, a._ishlnsubmul(b, 1, j), !a.isZero())
              a.negative ^= 1;
          if (q)
            q.words[j] = qj;
        }
        if (q)
          q._strip();
        if (a._strip(), mode !== "div" && shift !== 0)
          a.iushrn(shift);
        return { div: q || null, mod: a };
      }, BN.prototype.divmod = function divmod(num, mode, positive) {
        if (assert(!num.isZero()), this.isZero())
          return { div: new BN(0), mod: new BN(0) };
        var div, mod, res;
        if (this.negative !== 0 && num.negative === 0) {
          if (res = this.neg().divmod(num, mode), mode !== "mod")
            div = res.div.neg();
          if (mode !== "div") {
            if (mod = res.mod.neg(), positive && mod.negative !== 0)
              mod.iadd(num);
          }
          return { div, mod };
        }
        if (this.negative === 0 && num.negative !== 0) {
          if (res = this.divmod(num.neg(), mode), mode !== "mod")
            div = res.div.neg();
          return { div, mod: res.mod };
        }
        if ((this.negative & num.negative) !== 0) {
          if (res = this.neg().divmod(num.neg(), mode), mode !== "div") {
            if (mod = res.mod.neg(), positive && mod.negative !== 0)
              mod.isub(num);
          }
          return { div: res.div, mod };
        }
        if (num.length > this.length || this.cmp(num) < 0)
          return { div: new BN(0), mod: this };
        if (num.length === 1) {
          if (mode === "div")
            return { div: this.divn(num.words[0]), mod: null };
          if (mode === "mod")
            return { div: null, mod: new BN(this.modrn(num.words[0])) };
          return { div: this.divn(num.words[0]), mod: new BN(this.modrn(num.words[0])) };
        }
        return this._wordDiv(num, mode);
      }, BN.prototype.div = function div(num) {
        return this.divmod(num, "div", false).div;
      }, BN.prototype.mod = function mod(num) {
        return this.divmod(num, "mod", false).mod;
      }, BN.prototype.umod = function umod(num) {
        return this.divmod(num, "mod", true).mod;
      }, BN.prototype.divRound = function divRound(num) {
        var dm = this.divmod(num);
        if (dm.mod.isZero())
          return dm.div;
        var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod, half = num.ushrn(1), r2 = num.andln(1), cmp = mod.cmp(half);
        if (cmp < 0 || r2 === 1 && cmp === 0)
          return dm.div;
        return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
      }, BN.prototype.modrn = function modrn(num) {
        var isNegNum = num < 0;
        if (isNegNum)
          num = -num;
        assert(num <= 67108863);
        var p = 67108864 % num, acc = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--)
          acc = (p * acc + (this.words[i2] | 0)) % num;
        return isNegNum ? -acc : acc;
      }, BN.prototype.modn = function modn(num) {
        return this.modrn(num);
      }, BN.prototype.idivn = function idivn(num) {
        var isNegNum = num < 0;
        if (isNegNum)
          num = -num;
        assert(num <= 67108863);
        var carry = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          var w = (this.words[i2] | 0) + carry * 67108864;
          this.words[i2] = w / num | 0, carry = w % num;
        }
        return this._strip(), isNegNum ? this.ineg() : this;
      }, BN.prototype.divn = function divn(num) {
        return this.clone().idivn(num);
      }, BN.prototype.egcd = function egcd(p) {
        assert(p.negative === 0), assert(!p.isZero());
        var x = this, y = p.clone();
        if (x.negative !== 0)
          x = x.umod(p);
        else
          x = x.clone();
        var A = new BN(1), B = new BN(0), C = new BN(0), D = new BN(1), g = 0;
        while (x.isEven() && y.isEven())
          x.iushrn(1), y.iushrn(1), ++g;
        var yp = y.clone(), xp = x.clone();
        while (!x.isZero()) {
          for (var i2 = 0, im = 1;(x.words[0] & im) === 0 && i2 < 26; ++i2, im <<= 1)
            ;
          if (i2 > 0) {
            x.iushrn(i2);
            while (i2-- > 0) {
              if (A.isOdd() || B.isOdd())
                A.iadd(yp), B.isub(xp);
              A.iushrn(1), B.iushrn(1);
            }
          }
          for (var j = 0, jm = 1;(y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
            ;
          if (j > 0) {
            y.iushrn(j);
            while (j-- > 0) {
              if (C.isOdd() || D.isOdd())
                C.iadd(yp), D.isub(xp);
              C.iushrn(1), D.iushrn(1);
            }
          }
          if (x.cmp(y) >= 0)
            x.isub(y), A.isub(C), B.isub(D);
          else
            y.isub(x), C.isub(A), D.isub(B);
        }
        return { a: C, b: D, gcd: y.iushln(g) };
      }, BN.prototype._invmp = function _invmp(p) {
        assert(p.negative === 0), assert(!p.isZero());
        var a = this, b = p.clone();
        if (a.negative !== 0)
          a = a.umod(p);
        else
          a = a.clone();
        var x1 = new BN(1), x2 = new BN(0), delta = b.clone();
        while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
          for (var i2 = 0, im = 1;(a.words[0] & im) === 0 && i2 < 26; ++i2, im <<= 1)
            ;
          if (i2 > 0) {
            a.iushrn(i2);
            while (i2-- > 0) {
              if (x1.isOdd())
                x1.iadd(delta);
              x1.iushrn(1);
            }
          }
          for (var j = 0, jm = 1;(b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1)
            ;
          if (j > 0) {
            b.iushrn(j);
            while (j-- > 0) {
              if (x2.isOdd())
                x2.iadd(delta);
              x2.iushrn(1);
            }
          }
          if (a.cmp(b) >= 0)
            a.isub(b), x1.isub(x2);
          else
            b.isub(a), x2.isub(x1);
        }
        var res;
        if (a.cmpn(1) === 0)
          res = x1;
        else
          res = x2;
        if (res.cmpn(0) < 0)
          res.iadd(p);
        return res;
      }, BN.prototype.gcd = function gcd(num) {
        if (this.isZero())
          return num.abs();
        if (num.isZero())
          return this.abs();
        var a = this.clone(), b = num.clone();
        a.negative = 0, b.negative = 0;
        for (var shift = 0;a.isEven() && b.isEven(); shift++)
          a.iushrn(1), b.iushrn(1);
        do {
          while (a.isEven())
            a.iushrn(1);
          while (b.isEven())
            b.iushrn(1);
          var r = a.cmp(b);
          if (r < 0) {
            var t = a;
            a = b, b = t;
          } else if (r === 0 || b.cmpn(1) === 0)
            break;
          a.isub(b);
        } while (true);
        return b.iushln(shift);
      }, BN.prototype.invm = function invm(num) {
        return this.egcd(num).a.umod(num);
      }, BN.prototype.isEven = function isEven() {
        return (this.words[0] & 1) === 0;
      }, BN.prototype.isOdd = function isOdd() {
        return (this.words[0] & 1) === 1;
      }, BN.prototype.andln = function andln(num) {
        return this.words[0] & num;
      }, BN.prototype.bincn = function bincn(bit) {
        assert(typeof bit === "number");
        var r = bit % 26, s = (bit - r) / 26, q = 1 << r;
        if (this.length <= s)
          return this._expand(s + 1), this.words[s] |= q, this;
        var carry = q;
        for (var i2 = s;carry !== 0 && i2 < this.length; i2++) {
          var w = this.words[i2] | 0;
          w += carry, carry = w >>> 26, w &= 67108863, this.words[i2] = w;
        }
        if (carry !== 0)
          this.words[i2] = carry, this.length++;
        return this;
      }, BN.prototype.isZero = function isZero() {
        return this.length === 1 && this.words[0] === 0;
      }, BN.prototype.cmpn = function cmpn(num) {
        var negative = num < 0;
        if (this.negative !== 0 && !negative)
          return -1;
        if (this.negative === 0 && negative)
          return 1;
        this._strip();
        var res;
        if (this.length > 1)
          res = 1;
        else {
          if (negative)
            num = -num;
          assert(num <= 67108863, "Number is too big");
          var w = this.words[0] | 0;
          res = w === num ? 0 : w < num ? -1 : 1;
        }
        if (this.negative !== 0)
          return -res | 0;
        return res;
      }, BN.prototype.cmp = function cmp(num) {
        if (this.negative !== 0 && num.negative === 0)
          return -1;
        if (this.negative === 0 && num.negative !== 0)
          return 1;
        var res = this.ucmp(num);
        if (this.negative !== 0)
          return -res | 0;
        return res;
      }, BN.prototype.ucmp = function ucmp(num) {
        if (this.length > num.length)
          return 1;
        if (this.length < num.length)
          return -1;
        var res = 0;
        for (var i2 = this.length - 1;i2 >= 0; i2--) {
          var a = this.words[i2] | 0, b = num.words[i2] | 0;
          if (a === b)
            continue;
          if (a < b)
            res = -1;
          else if (a > b)
            res = 1;
          break;
        }
        return res;
      }, BN.prototype.gtn = function gtn(num) {
        return this.cmpn(num) === 1;
      }, BN.prototype.gt = function gt(num) {
        return this.cmp(num) === 1;
      }, BN.prototype.gten = function gten(num) {
        return this.cmpn(num) >= 0;
      }, BN.prototype.gte = function gte(num) {
        return this.cmp(num) >= 0;
      }, BN.prototype.ltn = function ltn(num) {
        return this.cmpn(num) === -1;
      }, BN.prototype.lt = function lt(num) {
        return this.cmp(num) === -1;
      }, BN.prototype.lten = function lten(num) {
        return this.cmpn(num) <= 0;
      }, BN.prototype.lte = function lte(num) {
        return this.cmp(num) <= 0;
      }, BN.prototype.eqn = function eqn(num) {
        return this.cmpn(num) === 0;
      }, BN.prototype.eq = function eq(num) {
        return this.cmp(num) === 0;
      }, BN.red = function red(num) {
        return new Red(num);
      }, BN.prototype.toRed = function toRed(ctx) {
        return assert(!this.red, "Already a number in reduction context"), assert(this.negative === 0, "red works only with positives"), ctx.convertTo(this)._forceRed(ctx);
      }, BN.prototype.fromRed = function fromRed() {
        return assert(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this);
      }, BN.prototype._forceRed = function _forceRed(ctx) {
        return this.red = ctx, this;
      }, BN.prototype.forceRed = function forceRed(ctx) {
        return assert(!this.red, "Already a number in reduction context"), this._forceRed(ctx);
      }, BN.prototype.redAdd = function redAdd(num) {
        return assert(this.red, "redAdd works only with red numbers"), this.red.add(this, num);
      }, BN.prototype.redIAdd = function redIAdd(num) {
        return assert(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, num);
      }, BN.prototype.redSub = function redSub(num) {
        return assert(this.red, "redSub works only with red numbers"), this.red.sub(this, num);
      }, BN.prototype.redISub = function redISub(num) {
        return assert(this.red, "redISub works only with red numbers"), this.red.isub(this, num);
      }, BN.prototype.redShl = function redShl(num) {
        return assert(this.red, "redShl works only with red numbers"), this.red.shl(this, num);
      }, BN.prototype.redMul = function redMul(num) {
        return assert(this.red, "redMul works only with red numbers"), this.red._verify2(this, num), this.red.mul(this, num);
      }, BN.prototype.redIMul = function redIMul(num) {
        return assert(this.red, "redMul works only with red numbers"), this.red._verify2(this, num), this.red.imul(this, num);
      }, BN.prototype.redSqr = function redSqr() {
        return assert(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this);
      }, BN.prototype.redISqr = function redISqr() {
        return assert(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this);
      }, BN.prototype.redSqrt = function redSqrt() {
        return assert(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this);
      }, BN.prototype.redInvm = function redInvm() {
        return assert(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this);
      }, BN.prototype.redNeg = function redNeg() {
        return assert(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this);
      }, BN.prototype.redPow = function redPow(num) {
        return assert(this.red && !num.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, num);
      };
      var primes = { k256: null, p224: null, p192: null, p25519: null };
      function MPrime(name, p) {
        this.name = name, this.p = new BN(p, 16), this.n = this.p.bitLength(), this.k = new BN(1).iushln(this.n).isub(this.p), this.tmp = this._tmp();
      }
      MPrime.prototype._tmp = function _tmp() {
        var tmp = new BN(null);
        return tmp.words = new Array(Math.ceil(this.n / 13)), tmp;
      }, MPrime.prototype.ireduce = function ireduce(num) {
        var r = num, rlen;
        do
          this.split(r, this.tmp), r = this.imulK(r), r = r.iadd(this.tmp), rlen = r.bitLength();
        while (rlen > this.n);
        var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
        if (cmp === 0)
          r.words[0] = 0, r.length = 1;
        else if (cmp > 0)
          r.isub(this.p);
        else if (r.strip !== undefined)
          r.strip();
        else
          r._strip();
        return r;
      }, MPrime.prototype.split = function split(input, out) {
        input.iushrn(this.n, 0, out);
      }, MPrime.prototype.imulK = function imulK(num) {
        return num.imul(this.k);
      };
      function K256() {
        MPrime.call(this, "k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");
      }
      inherits2(K256, MPrime), K256.prototype.split = function split(input, output) {
        var mask = 4194303, outLen = Math.min(input.length, 9);
        for (var i2 = 0;i2 < outLen; i2++)
          output.words[i2] = input.words[i2];
        if (output.length = outLen, input.length <= 9) {
          input.words[0] = 0, input.length = 1;
          return;
        }
        var prev = input.words[9];
        output.words[output.length++] = prev & mask;
        for (i2 = 10;i2 < input.length; i2++) {
          var next = input.words[i2] | 0;
          input.words[i2 - 10] = (next & mask) << 4 | prev >>> 22, prev = next;
        }
        if (prev >>>= 22, input.words[i2 - 10] = prev, prev === 0 && input.length > 10)
          input.length -= 10;
        else
          input.length -= 9;
      }, K256.prototype.imulK = function imulK(num) {
        num.words[num.length] = 0, num.words[num.length + 1] = 0, num.length += 2;
        var lo = 0;
        for (var i2 = 0;i2 < num.length; i2++) {
          var w = num.words[i2] | 0;
          lo += w * 977, num.words[i2] = lo & 67108863, lo = w * 64 + (lo / 67108864 | 0);
        }
        if (num.words[num.length - 1] === 0) {
          if (num.length--, num.words[num.length - 1] === 0)
            num.length--;
        }
        return num;
      };
      function P224() {
        MPrime.call(this, "p224", "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001");
      }
      inherits2(P224, MPrime);
      function P192() {
        MPrime.call(this, "p192", "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff");
      }
      inherits2(P192, MPrime);
      function P25519() {
        MPrime.call(this, "25519", "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed");
      }
      inherits2(P25519, MPrime), P25519.prototype.imulK = function imulK(num) {
        var carry = 0;
        for (var i2 = 0;i2 < num.length; i2++) {
          var hi = (num.words[i2] | 0) * 19 + carry, lo = hi & 67108863;
          hi >>>= 26, num.words[i2] = lo, carry = hi;
        }
        if (carry !== 0)
          num.words[num.length++] = carry;
        return num;
      }, BN._prime = function prime(name) {
        if (primes[name])
          return primes[name];
        var prime;
        if (name === "k256")
          prime = new K256;
        else if (name === "p224")
          prime = new P224;
        else if (name === "p192")
          prime = new P192;
        else if (name === "p25519")
          prime = new P25519;
        else
          throw new Error("Unknown prime " + name);
        return primes[name] = prime, prime;
      };
      function Red(m) {
        if (typeof m === "string") {
          var prime = BN._prime(m);
          this.m = prime.p, this.prime = prime;
        } else
          assert(m.gtn(1), "modulus must be greater than 1"), this.m = m, this.prime = null;
      }
      Red.prototype._verify1 = function _verify1(a) {
        assert(a.negative === 0, "red works only with positives"), assert(a.red, "red works only with red numbers");
      }, Red.prototype._verify2 = function _verify2(a, b) {
        assert((a.negative | b.negative) === 0, "red works only with positives"), assert(a.red && a.red === b.red, "red works only with red numbers");
      }, Red.prototype.imod = function imod(a) {
        if (this.prime)
          return this.prime.ireduce(a)._forceRed(this);
        return move(a, a.umod(this.m)._forceRed(this)), a;
      }, Red.prototype.neg = function neg(a) {
        if (a.isZero())
          return a.clone();
        return this.m.sub(a)._forceRed(this);
      }, Red.prototype.add = function add(a, b) {
        this._verify2(a, b);
        var res = a.add(b);
        if (res.cmp(this.m) >= 0)
          res.isub(this.m);
        return res._forceRed(this);
      }, Red.prototype.iadd = function iadd(a, b) {
        this._verify2(a, b);
        var res = a.iadd(b);
        if (res.cmp(this.m) >= 0)
          res.isub(this.m);
        return res;
      }, Red.prototype.sub = function sub(a, b) {
        this._verify2(a, b);
        var res = a.sub(b);
        if (res.cmpn(0) < 0)
          res.iadd(this.m);
        return res._forceRed(this);
      }, Red.prototype.isub = function isub(a, b) {
        this._verify2(a, b);
        var res = a.isub(b);
        if (res.cmpn(0) < 0)
          res.iadd(this.m);
        return res;
      }, Red.prototype.shl = function shl(a, num) {
        return this._verify1(a), this.imod(a.ushln(num));
      }, Red.prototype.imul = function imul(a, b) {
        return this._verify2(a, b), this.imod(a.imul(b));
      }, Red.prototype.mul = function mul(a, b) {
        return this._verify2(a, b), this.imod(a.mul(b));
      }, Red.prototype.isqr = function isqr(a) {
        return this.imul(a, a.clone());
      }, Red.prototype.sqr = function sqr(a) {
        return this.mul(a, a);
      }, Red.prototype.sqrt = function sqrt(a) {
        if (a.isZero())
          return a.clone();
        var mod3 = this.m.andln(3);
        if (assert(mod3 % 2 === 1), mod3 === 3) {
          var pow = this.m.add(new BN(1)).iushrn(2);
          return this.pow(a, pow);
        }
        var q = this.m.subn(1), s = 0;
        while (!q.isZero() && q.andln(1) === 0)
          s++, q.iushrn(1);
        assert(!q.isZero());
        var one = new BN(1).toRed(this), nOne = one.redNeg(), lpow = this.m.subn(1).iushrn(1), z = this.m.bitLength();
        z = new BN(2 * z * z).toRed(this);
        while (this.pow(z, lpow).cmp(nOne) !== 0)
          z.redIAdd(nOne);
        var c = this.pow(z, q), r = this.pow(a, q.addn(1).iushrn(1)), t = this.pow(a, q), m = s;
        while (t.cmp(one) !== 0) {
          var tmp = t;
          for (var i2 = 0;tmp.cmp(one) !== 0; i2++)
            tmp = tmp.redSqr();
          assert(i2 < m);
          var b = this.pow(c, new BN(1).iushln(m - i2 - 1));
          r = r.redMul(b), c = b.redSqr(), t = t.redMul(c), m = i2;
        }
        return r;
      }, Red.prototype.invm = function invm(a) {
        var inv = a._invmp(this.m);
        if (inv.negative !== 0)
          return inv.negative = 0, this.imod(inv).redNeg();
        else
          return this.imod(inv);
      }, Red.prototype.pow = function pow(a, num) {
        if (num.isZero())
          return new BN(1).toRed(this);
        if (num.cmpn(1) === 0)
          return a.clone();
        var windowSize = 4, wnd = new Array(1 << windowSize);
        wnd[0] = new BN(1).toRed(this), wnd[1] = a;
        for (var i2 = 2;i2 < wnd.length; i2++)
          wnd[i2] = this.mul(wnd[i2 - 1], a);
        var res = wnd[0], current = 0, currentLen = 0, start = num.bitLength() % 26;
        if (start === 0)
          start = 26;
        for (i2 = num.length - 1;i2 >= 0; i2--) {
          var word = num.words[i2];
          for (var j = start - 1;j >= 0; j--) {
            var bit = word >> j & 1;
            if (res !== wnd[0])
              res = this.sqr(res);
            if (bit === 0 && current === 0) {
              currentLen = 0;
              continue;
            }
            if (current <<= 1, current |= bit, currentLen++, currentLen !== windowSize && (i2 !== 0 || j !== 0))
              continue;
            res = this.mul(res, wnd[current]), currentLen = 0, current = 0;
          }
          start = 26;
        }
        return res;
      }, Red.prototype.convertTo = function convertTo(num) {
        var r = num.umod(this.m);
        return r === num ? r.clone() : r;
      }, Red.prototype.convertFrom = function convertFrom(num) {
        var res = num.clone();
        return res.red = null, res;
      }, BN.mont = function mont(num) {
        return new Mont(num);
      };
      function Mont(m) {
        if (Red.call(this, m), this.shift = this.m.bitLength(), this.shift % 26 !== 0)
          this.shift += 26 - this.shift % 26;
        this.r = new BN(1).iushln(this.shift), this.r2 = this.imod(this.r.sqr()), this.rinv = this.r._invmp(this.m), this.minv = this.rinv.mul(this.r).isubn(1).div(this.m), this.minv = this.minv.umod(this.r), this.minv = this.r.sub(this.minv);
      }
      inherits2(Mont, Red), Mont.prototype.convertTo = function convertTo(num) {
        return this.imod(num.ushln(this.shift));
      }, Mont.prototype.convertFrom = function convertFrom(num) {
        var r = this.imod(num.mul(this.rinv));
        return r.red = null, r;
      }, Mont.prototype.imul = function imul(a, b) {
        if (a.isZero() || b.isZero())
          return a.words[0] = 0, a.length = 1, a;
        var t = a.imul(b), c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), u = t.isub(c).iushrn(this.shift), res = u;
        if (u.cmp(this.m) >= 0)
          res = u.isub(this.m);
        else if (u.cmpn(0) < 0)
          res = u.iadd(this.m);
        return res._forceRed(this);
      }, Mont.prototype.mul = function mul(a, b) {
        if (a.isZero() || b.isZero())
          return new BN(0)._forceRed(this);
        var t = a.mul(b), c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m), u = t.isub(c).iushrn(this.shift), res = u;
        if (u.cmp(this.m) >= 0)
          res = u.isub(this.m);
        else if (u.cmpn(0) < 0)
          res = u.iadd(this.m);
        return res._forceRed(this);
      }, Mont.prototype.invm = function invm(a) {
        var res = this.imod(a._invmp(this.m).mul(this.r2));
        return res._forceRed(this);
      };
    })(typeof module === "undefined" || module, exports);
  });
  require_browserify_rsa = __commonJS2((exports, module) => {
    var BN = require_bn5(), randomBytes = require_randombytes(), Buffer22 = require_safe_buffer().Buffer;
    function getr(priv) {
      var len2 = priv.modulus.byteLength(), r;
      do
        r = new BN(randomBytes(len2));
      while (r.cmp(priv.modulus) >= 0 || !r.umod(priv.prime1) || !r.umod(priv.prime2));
      return r;
    }
    function blind(priv) {
      var r = getr(priv), blinder = r.toRed(BN.mont(priv.modulus)).redPow(new BN(priv.publicExponent)).fromRed();
      return { blinder, unblinder: r.invm(priv.modulus) };
    }
    function crt(msg, priv) {
      var blinds = blind(priv), len2 = priv.modulus.byteLength(), blinded = new BN(msg).mul(blinds.blinder).umod(priv.modulus), c1 = blinded.toRed(BN.mont(priv.prime1)), c2 = blinded.toRed(BN.mont(priv.prime2)), qinv = priv.coefficient, p = priv.prime1, q = priv.prime2, m1 = c1.redPow(priv.exponent1).fromRed(), m2 = c2.redPow(priv.exponent2).fromRed(), h = m1.isub(m2).imul(qinv).umod(p).imul(q);
      return m2.iadd(h).imul(blinds.unblinder).umod(priv.modulus).toArrayLike(Buffer22, "be", len2);
    }
    crt.getr = getr;
    module.exports = crt;
  });
  require_publicEncrypt = __commonJS2((exports, module) => {
    var parseKeys = require_parse_asn1(), randomBytes = require_randombytes(), createHash = require_create_hash(), mgf = require_mgf(), xor = require_xor(), BN = require_bn4(), withPublic = require_withPublic(), crt = require_browserify_rsa(), Buffer22 = require_safe_buffer().Buffer;
    module.exports = function publicEncrypt(publicKey, msg, reverse) {
      var padding;
      if (publicKey.padding)
        padding = publicKey.padding;
      else if (reverse)
        padding = 1;
      else
        padding = 4;
      var key = parseKeys(publicKey), paddedMsg;
      if (padding === 4)
        paddedMsg = oaep(key, msg);
      else if (padding === 1)
        paddedMsg = pkcs1(key, msg, reverse);
      else if (padding === 3) {
        if (paddedMsg = new BN(msg), paddedMsg.cmp(key.modulus) >= 0)
          throw new Error("data too long for modulus");
      } else
        throw new Error("unknown padding");
      if (reverse)
        return crt(paddedMsg, key);
      else
        return withPublic(paddedMsg, key);
    };
    function oaep(key, msg) {
      var k = key.modulus.byteLength(), mLen = msg.length, iHash = createHash("sha1").update(Buffer22.alloc(0)).digest(), hLen = iHash.length, hLen2 = 2 * hLen;
      if (mLen > k - hLen2 - 2)
        throw new Error("message too long");
      var ps = Buffer22.alloc(k - mLen - hLen2 - 2), dblen = k - hLen - 1, seed = randomBytes(hLen), maskedDb = xor(Buffer22.concat([iHash, ps, Buffer22.alloc(1, 1), msg], dblen), mgf(seed, dblen)), maskedSeed = xor(seed, mgf(maskedDb, hLen));
      return new BN(Buffer22.concat([Buffer22.alloc(1), maskedSeed, maskedDb], k));
    }
    function pkcs1(key, msg, reverse) {
      var mLen = msg.length, k = key.modulus.byteLength();
      if (mLen > k - 11)
        throw new Error("message too long");
      var ps;
      if (reverse)
        ps = Buffer22.alloc(k - mLen - 3, 255);
      else
        ps = nonZero(k - mLen - 3);
      return new BN(Buffer22.concat([Buffer22.from([0, reverse ? 1 : 2]), ps, Buffer22.alloc(1), msg], k));
    }
    function nonZero(len2) {
      var out = Buffer22.allocUnsafe(len2), i2 = 0, cache = randomBytes(len2 * 2), cur = 0, num;
      while (i2 < len2) {
        if (cur === cache.length)
          cache = randomBytes(len2 * 2), cur = 0;
        if (num = cache[cur++], num)
          out[i2++] = num;
      }
      return out;
    }
  });
  require_privateDecrypt = __commonJS2((exports, module) => {
    var parseKeys = require_parse_asn1(), mgf = require_mgf(), xor = require_xor(), BN = require_bn4(), crt = require_browserify_rsa(), createHash = require_create_hash(), withPublic = require_withPublic(), Buffer22 = require_safe_buffer().Buffer;
    module.exports = function privateDecrypt(privateKey, enc, reverse) {
      var padding;
      if (privateKey.padding)
        padding = privateKey.padding;
      else if (reverse)
        padding = 1;
      else
        padding = 4;
      var key = parseKeys(privateKey), k = key.modulus.byteLength();
      if (enc.length > k || new BN(enc).cmp(key.modulus) >= 0)
        throw new Error("decryption error");
      var msg;
      if (reverse)
        msg = withPublic(new BN(enc), key);
      else
        msg = crt(enc, key);
      var zBuffer = Buffer22.alloc(k - msg.length);
      if (msg = Buffer22.concat([zBuffer, msg], k), padding === 4)
        return oaep(key, msg);
      else if (padding === 1)
        return pkcs1(key, msg, reverse);
      else if (padding === 3)
        return msg;
      else
        throw new Error("unknown padding");
    };
    function oaep(key, msg) {
      var k = key.modulus.byteLength(), iHash = createHash("sha1").update(Buffer22.alloc(0)).digest(), hLen = iHash.length;
      if (msg[0] !== 0)
        throw new Error("decryption error");
      var maskedSeed = msg.slice(1, hLen + 1), maskedDb = msg.slice(hLen + 1), seed = xor(maskedSeed, mgf(maskedDb, hLen)), db = xor(maskedDb, mgf(seed, k - hLen - 1));
      if (compare3(iHash, db.slice(0, hLen)))
        throw new Error("decryption error");
      var i2 = hLen;
      while (db[i2] === 0)
        i2++;
      if (db[i2++] !== 1)
        throw new Error("decryption error");
      return db.slice(i2);
    }
    function pkcs1(key, msg, reverse) {
      var p1 = msg.slice(0, 2), i2 = 2, status = 0;
      while (msg[i2++] !== 0)
        if (i2 >= msg.length) {
          status++;
          break;
        }
      var ps = msg.slice(2, i2 - 1);
      if (p1.toString("hex") !== "0002" && !reverse || p1.toString("hex") !== "0001" && reverse)
        status++;
      if (ps.length < 8)
        status++;
      if (status)
        throw new Error("decryption error");
      return msg.slice(i2);
    }
    function compare3(a, b) {
      a = Buffer22.from(a), b = Buffer22.from(b);
      var dif = 0, len2 = a.length;
      if (a.length !== b.length)
        dif++, len2 = Math.min(a.length, b.length);
      var i2 = -1;
      while (++i2 < len2)
        dif += a[i2] ^ b[i2];
      return dif;
    }
  });
  require_browser2 = __commonJS2((exports) => {
    exports.publicEncrypt = require_publicEncrypt();
    exports.privateDecrypt = require_privateDecrypt();
    exports.privateEncrypt = function privateEncrypt(key, buf) {
      return exports.publicEncrypt(key, buf, true);
    };
    exports.publicDecrypt = function publicDecrypt(key, buf) {
      return exports.privateDecrypt(key, buf, true);
    };
  });
  require_public_encrypt = __commonJS2((exports) => {
    var crypto2 = (init_crypto(), __toCommonJS(exports_crypto));
    if (typeof crypto2.publicEncrypt !== "function")
      crypto2 = require_browser2();
    exports.publicEncrypt = crypto2.publicEncrypt;
    exports.privateDecrypt = crypto2.privateDecrypt;
    if (typeof crypto2.privateEncrypt !== "function")
      exports.privateEncrypt = require_browser2().privateEncrypt;
    else
      exports.privateEncrypt = crypto2.privateEncrypt;
    if (typeof crypto2.publicDecrypt !== "function")
      exports.publicDecrypt = require_browser2().publicDecrypt;
    else
      exports.publicDecrypt = crypto2.publicDecrypt;
  });
  require_browser3 = __commonJS2((exports) => {
    var safeBuffer = require_safe_buffer(), randombytes = require_randombytes(), Buffer22 = safeBuffer.Buffer, kBufferMaxLength = safeBuffer.kMaxLength, crypto2 = globalThis.crypto || globalThis.msCrypto, kMaxUint32 = Math.pow(2, 32) - 1;
    function assertOffset(offset, length) {
      if (typeof offset !== "number" || offset !== offset)
        throw new TypeError("offset must be a number");
      if (offset > kMaxUint32 || offset < 0)
        throw new TypeError("offset must be a uint32");
      if (offset > kBufferMaxLength || offset > length)
        throw new RangeError("offset out of range");
    }
    function assertSize2(size, offset, length) {
      if (typeof size !== "number" || size !== size)
        throw new TypeError("size must be a number");
      if (size > kMaxUint32 || size < 0)
        throw new TypeError("size must be a uint32");
      if (size + offset > length || size > kBufferMaxLength)
        throw new RangeError("buffer too small");
    }
    crypto2 && crypto2.getRandomValues, exports.randomFill = randomFill, exports.randomFillSync = randomFillSync;
    function randomFill(buf, offset, size, cb) {
      if (!Buffer22.isBuffer(buf) && !(buf instanceof globalThis.Uint8Array))
        throw new TypeError('"buf" argument must be a Buffer or Uint8Array');
      if (typeof offset === "function")
        cb = offset, offset = 0, size = buf.length;
      else if (typeof size === "function")
        cb = size, size = buf.length - offset;
      else if (typeof cb !== "function")
        throw new TypeError('"cb" argument must be a function');
      return assertOffset(offset, buf.length), assertSize2(size, offset, buf.length), actualFill(buf, offset, size, cb);
    }
    function actualFill(buf, offset, size, cb) {
      if (false)
        var ourBuf, uint;
      if (cb) {
        randombytes(size, function(err, bytes2) {
          if (err)
            return cb(err);
          bytes2.copy(buf, offset), cb(null, buf);
        });
        return;
      }
      var bytes = randombytes(size);
      return bytes.copy(buf, offset), buf;
    }
    function randomFillSync(buf, offset, size) {
      if (typeof offset === "undefined")
        offset = 0;
      if (!Buffer22.isBuffer(buf) && !(buf instanceof globalThis.Uint8Array))
        throw new TypeError('"buf" argument must be a Buffer or Uint8Array');
      if (assertOffset(offset, buf.length), size === undefined)
        size = buf.length - offset;
      return assertSize2(size, offset, buf.length), actualFill(buf, offset, size);
    }
  });
  require_randomfill = __commonJS2((exports, module) => {
    var crypto2 = (init_crypto(), __toCommonJS(exports_crypto));
    if (typeof crypto2.randomFill === "function" && typeof crypto2.randomFillSync === "function")
      exports.randomFill = crypto2.randomFill, exports.randomFillSync = crypto2.randomFillSync;
    else
      module.exports = require_browser3();
  });
  require_crypto_browserify = __commonJS2((exports) => {
    exports.randomBytes = exports.rng = exports.pseudoRandomBytes = exports.prng = require_randombytes();
    exports.createHash = exports.Hash = require_create_hash();
    exports.createHmac = exports.Hmac = require_create_hmac();
    var algos = require_algorithms(), algoKeys = Object.keys(algos), hashes = ["sha1", "sha224", "sha256", "sha384", "sha512", "md5", "rmd160"].concat(algoKeys);
    exports.getHashes = function() {
      return hashes;
    };
    var p = require_pbkdf2();
    exports.pbkdf2 = p.pbkdf2;
    exports.pbkdf2Sync = p.pbkdf2Sync;
    var aes = require_browserify_cipher();
    exports.Cipher = aes.Cipher;
    exports.createCipher = aes.createCipher;
    exports.Cipheriv = aes.Cipheriv;
    exports.createCipheriv = aes.createCipheriv;
    exports.Decipher = aes.Decipher;
    exports.createDecipher = aes.createDecipher;
    exports.Decipheriv = aes.Decipheriv;
    exports.createDecipheriv = aes.createDecipheriv;
    exports.getCiphers = aes.getCiphers;
    exports.listCiphers = aes.listCiphers;
    var dh = require_diffie_hellman();
    exports.DiffieHellmanGroup = dh.DiffieHellmanGroup;
    exports.createDiffieHellmanGroup = dh.createDiffieHellmanGroup;
    exports.getDiffieHellman = dh.getDiffieHellman;
    exports.createDiffieHellman = dh.createDiffieHellman;
    exports.DiffieHellman = dh.DiffieHellman;
    var sign = require_browserify_sign();
    exports.createSign = sign.createSign;
    exports.Sign = sign.Sign;
    exports.createVerify = sign.createVerify;
    exports.Verify = sign.Verify;
    exports.createECDH = require_create_ecdh();
    var publicEncrypt = require_public_encrypt();
    exports.publicEncrypt = publicEncrypt.publicEncrypt;
    exports.privateEncrypt = publicEncrypt.privateEncrypt;
    exports.publicDecrypt = publicEncrypt.publicDecrypt;
    exports.privateDecrypt = publicEncrypt.privateDecrypt;
    var rf = require_randomfill();
    exports.randomFill = rf.randomFill;
    exports.randomFillSync = rf.randomFillSync;
    exports.createCredentials = function() {
      throw new Error(`sorry, createCredentials is not implemented yet
we accept pull requests
https://github.com/browserify/crypto-browserify`);
    };
    exports.constants = { DH_CHECK_P_NOT_SAFE_PRIME: 2, DH_CHECK_P_NOT_PRIME: 1, DH_UNABLE_TO_CHECK_GENERATOR: 4, DH_NOT_SUITABLE_GENERATOR: 8, NPN_ENABLED: 1, ALPN_ENABLED: 1, RSA_PKCS1_PADDING: 1, RSA_SSLV23_PADDING: 2, RSA_NO_PADDING: 3, RSA_PKCS1_OAEP_PADDING: 4, RSA_X931_PADDING: 5, RSA_PKCS1_PSS_PADDING: 6, POINT_CONVERSION_COMPRESSED: 2, POINT_CONVERSION_UNCOMPRESSED: 4, POINT_CONVERSION_HYBRID: 6 };
  });
  cryptoBrowserify = __toESM2(require_crypto_browserify(), 1);
  prng2 = cryptoBrowserify.prng;
  pseudoRandomBytes2 = cryptoBrowserify.pseudoRandomBytes;
  rng2 = cryptoBrowserify.rng;
  randomBytes2 = cryptoBrowserify.randomBytes;
  Hash2 = cryptoBrowserify.Hash;
  createHash2 = cryptoBrowserify.createHash;
  Hmac2 = cryptoBrowserify.Hmac;
  createHmac2 = cryptoBrowserify.createHmac;
  getHashes2 = cryptoBrowserify.getHashes;
  pbkdf22 = cryptoBrowserify.pbkdf2;
  pbkdf2Sync2 = cryptoBrowserify.pbkdf2Sync;
  Cipher2 = cryptoBrowserify.Cipher;
  createCipher2 = cryptoBrowserify.createCipher;
  Cipheriv2 = cryptoBrowserify.Cipheriv;
  createCipheriv2 = cryptoBrowserify.createCipheriv;
  Decipher2 = cryptoBrowserify.Decipher;
  createDecipher2 = cryptoBrowserify.createDecipher;
  Decipheriv2 = cryptoBrowserify.Decipheriv;
  createDecipheriv2 = cryptoBrowserify.createDecipheriv;
  getCiphers2 = cryptoBrowserify.getCiphers;
  listCiphers2 = cryptoBrowserify.listCiphers;
  DiffieHellmanGroup2 = cryptoBrowserify.DiffieHellmanGroup;
  createDiffieHellmanGroup2 = cryptoBrowserify.createDiffieHellmanGroup;
  getDiffieHellman2 = cryptoBrowserify.getDiffieHellman;
  createDiffieHellman2 = cryptoBrowserify.createDiffieHellman;
  DiffieHellman2 = cryptoBrowserify.DiffieHellman;
  createSign2 = cryptoBrowserify.createSign;
  Sign2 = cryptoBrowserify.Sign;
  createVerify2 = cryptoBrowserify.createVerify;
  Verify2 = cryptoBrowserify.Verify;
  createECDH2 = cryptoBrowserify.createECDH;
  publicEncrypt2 = cryptoBrowserify.publicEncrypt;
  privateEncrypt2 = cryptoBrowserify.privateEncrypt;
  publicDecrypt2 = cryptoBrowserify.publicDecrypt;
  privateDecrypt2 = cryptoBrowserify.privateDecrypt;
  randomFill2 = cryptoBrowserify.randomFill;
  randomFillSync2 = cryptoBrowserify.randomFillSync;
  createCredentials2 = cryptoBrowserify.createCredentials;
  constants2 = cryptoBrowserify.constants;
  hardcoded_curves = ["p192", "p224", "p256", "p384", "p521", "curve25519", "ed25519", "secp256k1", "secp224r1", "prime256v1", "prime192v1", "ed25519", "secp384r1", "secp521r1"];
  webcrypto = crypto;
  crypto_default = crypto;
});

// ../node_modules/sql.js/dist/sql-wasm.js
var require_sql_wasm = __commonJS((exports, module) => {
  var __dirname = "/Users/pablofernandez/projects/NDK-nhlteu/node_modules/sql.js/dist";
  var initSqlJsPromise = undefined;
  var initSqlJs = function(moduleConfig) {
    if (initSqlJsPromise) {
      return initSqlJsPromise;
    }
    initSqlJsPromise = new Promise(function(resolveModule, reject) {
      var Module = typeof moduleConfig !== "undefined" ? moduleConfig : {};
      var originalOnAbortFunction = Module["onAbort"];
      Module["onAbort"] = function(errorThatCausedAbort) {
        reject(new Error(errorThatCausedAbort));
        if (originalOnAbortFunction) {
          originalOnAbortFunction(errorThatCausedAbort);
        }
      };
      Module["postRun"] = Module["postRun"] || [];
      Module["postRun"].push(function() {
        resolveModule(Module);
      });
      module = undefined;
      var f;
      f ||= typeof Module != "undefined" ? Module : {};
      var aa = typeof window == "object", ba = typeof WorkerGlobalScope != "undefined", ca = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
      f.onRuntimeInitialized = function() {
        function a(g, l) {
          switch (typeof l) {
            case "boolean":
              dc(g, l ? 1 : 0);
              break;
            case "number":
              ec(g, l);
              break;
            case "string":
              fc(g, l, -1, -1);
              break;
            case "object":
              if (l === null)
                lb(g);
              else if (l.length != null) {
                var n = da(l, ea);
                gc(g, n, l.length, -1);
                fa(n);
              } else
                va(g, "Wrong API use : tried to return a value of an unknown type (" + l + ").", -1);
              break;
            default:
              lb(g);
          }
        }
        function b(g, l) {
          for (var n = [], r = 0;r < g; r += 1) {
            var t = m(l + 4 * r, "i32"), y = hc(t);
            if (y === 1 || y === 2)
              t = ic(t);
            else if (y === 3)
              t = jc(t);
            else if (y === 4) {
              y = t;
              t = kc(y);
              y = lc(y);
              for (var L = new Uint8Array(t), J = 0;J < t; J += 1)
                L[J] = p[y + J];
              t = L;
            } else
              t = null;
            n.push(t);
          }
          return n;
        }
        function c(g, l) {
          this.Qa = g;
          this.db = l;
          this.Oa = 1;
          this.lb = [];
        }
        function d(g, l) {
          this.db = l;
          l = ha(g) + 1;
          this.eb = ia(l);
          if (this.eb === null)
            throw Error("Unable to allocate memory for the SQL string");
          u(g, x, this.eb, l);
          this.kb = this.eb;
          this.Za = this.pb = null;
        }
        function e(g) {
          this.filename = "dbfile_" + (4294967295 * Math.random() >>> 0);
          if (g != null) {
            var l = this.filename, n = "/", r = l;
            n && (n = typeof n == "string" ? n : ja(n), r = l ? ka(n + "/" + l) : n);
            l = la(true, true);
            r = ma(r, l);
            if (g) {
              if (typeof g == "string") {
                n = Array(g.length);
                for (var t = 0, y = g.length;t < y; ++t)
                  n[t] = g.charCodeAt(t);
                g = n;
              }
              na(r, l | 146);
              n = oa(r, 577);
              pa(n, g, 0, g.length, 0);
              qa(n);
              na(r, l);
            }
          }
          this.handleError(q(this.filename, h));
          this.db = m(h, "i32");
          ob(this.db);
          this.fb = {};
          this.Sa = {};
        }
        var h = z(4), k = f.cwrap, q = k("sqlite3_open", "number", ["string", "number"]), w = k("sqlite3_close_v2", "number", ["number"]), v = k("sqlite3_exec", "number", ["number", "string", "number", "number", "number"]), C = k("sqlite3_changes", "number", ["number"]), G = k("sqlite3_prepare_v2", "number", ["number", "string", "number", "number", "number"]), pb = k("sqlite3_sql", "string", ["number"]), nc = k("sqlite3_normalized_sql", "string", ["number"]), qb = k("sqlite3_prepare_v2", "number", ["number", "number", "number", "number", "number"]), oc = k("sqlite3_bind_text", "number", ["number", "number", "number", "number", "number"]), rb = k("sqlite3_bind_blob", "number", ["number", "number", "number", "number", "number"]), pc = k("sqlite3_bind_double", "number", ["number", "number", "number"]), qc = k("sqlite3_bind_int", "number", ["number", "number", "number"]), rc = k("sqlite3_bind_parameter_index", "number", ["number", "string"]), sc = k("sqlite3_step", "number", ["number"]), tc = k("sqlite3_errmsg", "string", ["number"]), uc = k("sqlite3_column_count", "number", ["number"]), vc = k("sqlite3_data_count", "number", ["number"]), wc = k("sqlite3_column_double", "number", ["number", "number"]), sb = k("sqlite3_column_text", "string", ["number", "number"]), xc = k("sqlite3_column_blob", "number", ["number", "number"]), yc = k("sqlite3_column_bytes", "number", [
          "number",
          "number"
        ]), zc = k("sqlite3_column_type", "number", ["number", "number"]), Ac = k("sqlite3_column_name", "string", ["number", "number"]), Bc = k("sqlite3_reset", "number", ["number"]), Cc = k("sqlite3_clear_bindings", "number", ["number"]), Dc = k("sqlite3_finalize", "number", ["number"]), tb = k("sqlite3_create_function_v2", "number", "number string number number number number number number number".split(" ")), hc = k("sqlite3_value_type", "number", ["number"]), kc = k("sqlite3_value_bytes", "number", ["number"]), jc = k("sqlite3_value_text", "string", ["number"]), lc = k("sqlite3_value_blob", "number", ["number"]), ic = k("sqlite3_value_double", "number", ["number"]), ec = k("sqlite3_result_double", "", ["number", "number"]), lb = k("sqlite3_result_null", "", ["number"]), fc = k("sqlite3_result_text", "", ["number", "string", "number", "number"]), gc = k("sqlite3_result_blob", "", ["number", "number", "number", "number"]), dc = k("sqlite3_result_int", "", ["number", "number"]), va = k("sqlite3_result_error", "", ["number", "string", "number"]), ub = k("sqlite3_aggregate_context", "number", ["number", "number"]), ob = k("RegisterExtensionFunctions", "number", ["number"]), vb = k("sqlite3_update_hook", "number", ["number", "number", "number"]);
        c.prototype.bind = function(g) {
          if (!this.Qa)
            throw "Statement closed";
          this.reset();
          return Array.isArray(g) ? this.Cb(g) : g != null && typeof g === "object" ? this.Db(g) : true;
        };
        c.prototype.step = function() {
          if (!this.Qa)
            throw "Statement closed";
          this.Oa = 1;
          var g = sc(this.Qa);
          switch (g) {
            case 100:
              return true;
            case 101:
              return false;
            default:
              throw this.db.handleError(g);
          }
        };
        c.prototype.wb = function(g) {
          g == null && (g = this.Oa, this.Oa += 1);
          return wc(this.Qa, g);
        };
        c.prototype.Gb = function(g) {
          g == null && (g = this.Oa, this.Oa += 1);
          g = sb(this.Qa, g);
          if (typeof BigInt !== "function")
            throw Error("BigInt is not supported");
          return BigInt(g);
        };
        c.prototype.Hb = function(g) {
          g == null && (g = this.Oa, this.Oa += 1);
          return sb(this.Qa, g);
        };
        c.prototype.getBlob = function(g) {
          g == null && (g = this.Oa, this.Oa += 1);
          var l = yc(this.Qa, g);
          g = xc(this.Qa, g);
          for (var n = new Uint8Array(l), r = 0;r < l; r += 1)
            n[r] = p[g + r];
          return n;
        };
        c.prototype.get = function(g, l) {
          l = l || {};
          g != null && this.bind(g) && this.step();
          g = [];
          for (var n = vc(this.Qa), r = 0;r < n; r += 1)
            switch (zc(this.Qa, r)) {
              case 1:
                var t = l.useBigInt ? this.Gb(r) : this.wb(r);
                g.push(t);
                break;
              case 2:
                g.push(this.wb(r));
                break;
              case 3:
                g.push(this.Hb(r));
                break;
              case 4:
                g.push(this.getBlob(r));
                break;
              default:
                g.push(null);
            }
          return g;
        };
        c.prototype.getColumnNames = function() {
          for (var g = [], l = uc(this.Qa), n = 0;n < l; n += 1)
            g.push(Ac(this.Qa, n));
          return g;
        };
        c.prototype.getAsObject = function(g, l) {
          g = this.get(g, l);
          l = this.getColumnNames();
          for (var n = {}, r = 0;r < l.length; r += 1)
            n[l[r]] = g[r];
          return n;
        };
        c.prototype.getSQL = function() {
          return pb(this.Qa);
        };
        c.prototype.getNormalizedSQL = function() {
          return nc(this.Qa);
        };
        c.prototype.run = function(g) {
          g != null && this.bind(g);
          this.step();
          return this.reset();
        };
        c.prototype.sb = function(g, l) {
          l == null && (l = this.Oa, this.Oa += 1);
          g = ra(g);
          var n = da(g, ea);
          this.lb.push(n);
          this.db.handleError(oc(this.Qa, l, n, g.length - 1, 0));
        };
        c.prototype.Bb = function(g, l) {
          l == null && (l = this.Oa, this.Oa += 1);
          var n = da(g, ea);
          this.lb.push(n);
          this.db.handleError(rb(this.Qa, l, n, g.length, 0));
        };
        c.prototype.rb = function(g, l) {
          l == null && (l = this.Oa, this.Oa += 1);
          this.db.handleError((g === (g | 0) ? qc : pc)(this.Qa, l, g));
        };
        c.prototype.Eb = function(g) {
          g == null && (g = this.Oa, this.Oa += 1);
          rb(this.Qa, g, 0, 0, 0);
        };
        c.prototype.tb = function(g, l) {
          l == null && (l = this.Oa, this.Oa += 1);
          switch (typeof g) {
            case "string":
              this.sb(g, l);
              return;
            case "number":
              this.rb(g, l);
              return;
            case "bigint":
              this.sb(g.toString(), l);
              return;
            case "boolean":
              this.rb(g + 0, l);
              return;
            case "object":
              if (g === null) {
                this.Eb(l);
                return;
              }
              if (g.length != null) {
                this.Bb(g, l);
                return;
              }
          }
          throw "Wrong API use : tried to bind a value of an unknown type (" + g + ").";
        };
        c.prototype.Db = function(g) {
          var l = this;
          Object.keys(g).forEach(function(n) {
            var r = rc(l.Qa, n);
            r !== 0 && l.tb(g[n], r);
          });
          return true;
        };
        c.prototype.Cb = function(g) {
          for (var l = 0;l < g.length; l += 1)
            this.tb(g[l], l + 1);
          return true;
        };
        c.prototype.reset = function() {
          this.freemem();
          return Cc(this.Qa) === 0 && Bc(this.Qa) === 0;
        };
        c.prototype.freemem = function() {
          for (var g;(g = this.lb.pop()) !== undefined; )
            fa(g);
        };
        c.prototype.free = function() {
          this.freemem();
          var g = Dc(this.Qa) === 0;
          delete this.db.fb[this.Qa];
          this.Qa = 0;
          return g;
        };
        d.prototype.next = function() {
          if (this.eb === null)
            return { done: true };
          this.Za !== null && (this.Za.free(), this.Za = null);
          if (!this.db.db)
            throw this.mb(), Error("Database closed");
          var g = sa(), l = z(4);
          ta(h);
          ta(l);
          try {
            this.db.handleError(qb(this.db.db, this.kb, -1, h, l));
            this.kb = m(l, "i32");
            var n = m(h, "i32");
            if (n === 0)
              return this.mb(), { done: true };
            this.Za = new c(n, this.db);
            this.db.fb[n] = this.Za;
            return { value: this.Za, done: false };
          } catch (r) {
            throw this.pb = ua(this.kb), this.mb(), r;
          } finally {
            wa(g);
          }
        };
        d.prototype.mb = function() {
          fa(this.eb);
          this.eb = null;
        };
        d.prototype.getRemainingSQL = function() {
          return this.pb !== null ? this.pb : ua(this.kb);
        };
        typeof Symbol === "function" && typeof Symbol.iterator === "symbol" && (d.prototype[Symbol.iterator] = function() {
          return this;
        });
        e.prototype.run = function(g, l) {
          if (!this.db)
            throw "Database closed";
          if (l) {
            g = this.prepare(g, l);
            try {
              g.step();
            } finally {
              g.free();
            }
          } else
            this.handleError(v(this.db, g, 0, 0, h));
          return this;
        };
        e.prototype.exec = function(g, l, n) {
          if (!this.db)
            throw "Database closed";
          var r = sa(), t = null;
          try {
            var y = xa(g), L = z(4);
            for (g = [];m(y, "i8") !== 0; ) {
              ta(h);
              ta(L);
              this.handleError(qb(this.db, y, -1, h, L));
              var J = m(h, "i32");
              y = m(L, "i32");
              if (J !== 0) {
                var I = null;
                t = new c(J, this);
                for (l != null && t.bind(l);t.step(); )
                  I === null && (I = { columns: t.getColumnNames(), values: [] }, g.push(I)), I.values.push(t.get(null, n));
                t.free();
              }
            }
            return g;
          } catch (M) {
            throw t && t.free(), M;
          } finally {
            wa(r);
          }
        };
        e.prototype.each = function(g, l, n, r, t) {
          typeof l === "function" && (r = n, n = l, l = undefined);
          g = this.prepare(g, l);
          try {
            for (;g.step(); )
              n(g.getAsObject(null, t));
          } finally {
            g.free();
          }
          if (typeof r === "function")
            return r();
        };
        e.prototype.prepare = function(g, l) {
          ta(h);
          this.handleError(G(this.db, g, -1, h, 0));
          g = m(h, "i32");
          if (g === 0)
            throw "Nothing to prepare";
          var n = new c(g, this);
          l != null && n.bind(l);
          return this.fb[g] = n;
        };
        e.prototype.iterateStatements = function(g) {
          return new d(g, this);
        };
        e.prototype["export"] = function() {
          Object.values(this.fb).forEach(function(l) {
            l.free();
          });
          Object.values(this.Sa).forEach(A);
          this.Sa = {};
          this.handleError(w(this.db));
          var g = ya(this.filename);
          this.handleError(q(this.filename, h));
          this.db = m(h, "i32");
          ob(this.db);
          return g;
        };
        e.prototype.close = function() {
          this.db !== null && (Object.values(this.fb).forEach(function(g) {
            g.free();
          }), Object.values(this.Sa).forEach(A), this.Sa = {}, this.Ya && (A(this.Ya), this.Ya = undefined), this.handleError(w(this.db)), za("/" + this.filename), this.db = null);
        };
        e.prototype.handleError = function(g) {
          if (g === 0)
            return null;
          g = tc(this.db);
          throw Error(g);
        };
        e.prototype.getRowsModified = function() {
          return C(this.db);
        };
        e.prototype.create_function = function(g, l) {
          Object.prototype.hasOwnProperty.call(this.Sa, g) && (A(this.Sa[g]), delete this.Sa[g]);
          var n = Aa(function(r, t, y) {
            t = b(t, y);
            try {
              var L = l.apply(null, t);
            } catch (J) {
              va(r, J, -1);
              return;
            }
            a(r, L);
          }, "viii");
          this.Sa[g] = n;
          this.handleError(tb(this.db, g, l.length, 1, 0, n, 0, 0, 0));
          return this;
        };
        e.prototype.create_aggregate = function(g, l) {
          var n = l.init || function() {
            return null;
          }, r = l.finalize || function(I) {
            return I;
          }, t = l.step;
          if (!t)
            throw "An aggregate function must have a step function in " + g;
          var y = {};
          Object.hasOwnProperty.call(this.Sa, g) && (A(this.Sa[g]), delete this.Sa[g]);
          l = g + "__finalize";
          Object.hasOwnProperty.call(this.Sa, l) && (A(this.Sa[l]), delete this.Sa[l]);
          var L = Aa(function(I, M, Ra) {
            var X = ub(I, 1);
            Object.hasOwnProperty.call(y, X) || (y[X] = n());
            M = b(M, Ra);
            M = [y[X]].concat(M);
            try {
              y[X] = t.apply(null, M);
            } catch (Fc) {
              delete y[X], va(I, Fc, -1);
            }
          }, "viii"), J = Aa(function(I) {
            var M = ub(I, 1);
            try {
              var Ra = r(y[M]);
            } catch (X) {
              delete y[M];
              va(I, X, -1);
              return;
            }
            a(I, Ra);
            delete y[M];
          }, "vi");
          this.Sa[g] = L;
          this.Sa[l] = J;
          this.handleError(tb(this.db, g, t.length - 1, 1, 0, 0, L, J, 0));
          return this;
        };
        e.prototype.updateHook = function(g) {
          this.Ya && (vb(this.db, 0, 0), A(this.Ya), this.Ya = undefined);
          g && (this.Ya = Aa(function(l, n, r, t, y) {
            switch (n) {
              case 18:
                l = "insert";
                break;
              case 23:
                l = "update";
                break;
              case 9:
                l = "delete";
                break;
              default:
                throw "unknown operationCode in updateHook callback: " + n;
            }
            r = r ? B(x, r) : "";
            t = t ? B(x, t) : "";
            if (y > Number.MAX_SAFE_INTEGER)
              throw "rowId too big to fit inside a Number";
            g(l, r, t, Number(y));
          }, "viiiij"), vb(this.db, this.Ya, 0));
        };
        f.Database = e;
      };
      var Ba = { ...f }, Ca = "./this.program", Da = (a, b) => {
        throw b;
      }, D = "", Ea, Fa;
      if (ca) {
        var fs = (() => ({}));
        init_path();
        D = __dirname + "/";
        Fa = (a) => {
          a = Ga(a) ? new URL(a) : a;
          return fs.readFileSync(a);
        };
        Ea = async (a) => {
          a = Ga(a) ? new URL(a) : a;
          return fs.readFileSync(a, undefined);
        };
        !f.thisProgram && 1 < process.argv.length && (Ca = process.argv[1].replace(/\\/g, "/"));
        process.argv.slice(2);
        typeof module != "undefined" && (module.exports = f);
        Da = (a, b) => {
          process.exitCode = a;
          throw b;
        };
      } else if (aa || ba)
        ba ? D = self.location.href : typeof document != "undefined" && document.currentScript && (D = document.currentScript.src), D = D.startsWith("blob:") ? "" : D.slice(0, D.replace(/[?#].*/, "").lastIndexOf("/") + 1), ba && (Fa = (a) => {
          var b = new XMLHttpRequest;
          b.open("GET", a, false);
          b.responseType = "arraybuffer";
          b.send(null);
          return new Uint8Array(b.response);
        }), Ea = async (a) => {
          if (Ga(a))
            return new Promise((c, d) => {
              var e = new XMLHttpRequest;
              e.open("GET", a, true);
              e.responseType = "arraybuffer";
              e.onload = () => {
                e.status == 200 || e.status == 0 && e.response ? c(e.response) : d(e.status);
              };
              e.onerror = d;
              e.send(null);
            });
          var b = await fetch(a, { credentials: "same-origin" });
          if (b.ok)
            return b.arrayBuffer();
          throw Error(b.status + " : " + b.url);
        };
      var Ha = f.print || console.log.bind(console), Ia = f.printErr || console.error.bind(console);
      Object.assign(f, Ba);
      Ba = null;
      f.thisProgram && (Ca = f.thisProgram);
      var Ja = f.wasmBinary, Ka, La = false, Ma, p, x, Na, E2, F, Oa, H, Pa, Ga = (a) => a.startsWith("file://");
      function Qa() {
        var a = Ka.buffer;
        f.HEAP8 = p = new Int8Array(a);
        f.HEAP16 = Na = new Int16Array(a);
        f.HEAPU8 = x = new Uint8Array(a);
        f.HEAPU16 = new Uint16Array(a);
        f.HEAP32 = E2 = new Int32Array(a);
        f.HEAPU32 = F = new Uint32Array(a);
        f.HEAPF32 = Oa = new Float32Array(a);
        f.HEAPF64 = Pa = new Float64Array(a);
        f.HEAP64 = H = new BigInt64Array(a);
        f.HEAPU64 = new BigUint64Array(a);
      }
      var K = 0, Sa = null;
      function Ta(a) {
        f.onAbort?.(a);
        a = "Aborted(" + a + ")";
        Ia(a);
        La = true;
        throw new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
      }
      var Ua;
      async function Va(a) {
        if (!Ja)
          try {
            var b = await Ea(a);
            return new Uint8Array(b);
          } catch {}
        if (a == Ua && Ja)
          a = new Uint8Array(Ja);
        else if (Fa)
          a = Fa(a);
        else
          throw "both async and sync fetching of the wasm failed";
        return a;
      }
      async function Wa(a, b) {
        try {
          var c = await Va(a);
          return await WebAssembly.instantiate(c, b);
        } catch (d) {
          Ia(`failed to asynchronously prepare wasm: ${d}`), Ta(d);
        }
      }
      async function Xa(a) {
        var b = Ua;
        if (!Ja && typeof WebAssembly.instantiateStreaming == "function" && !Ga(b) && !ca)
          try {
            var c = fetch(b, { credentials: "same-origin" });
            return await WebAssembly.instantiateStreaming(c, a);
          } catch (d) {
            Ia(`wasm streaming compile failed: ${d}`), Ia("falling back to ArrayBuffer instantiation");
          }
        return Wa(b, a);
      }

      class Ya {
        name = "ExitStatus";
        constructor(a) {
          this.message = `Program terminated with exit(${a})`;
          this.status = a;
        }
      }
      var Za = (a) => {
        for (;0 < a.length; )
          a.shift()(f);
      }, $a = [], ab = [], bb = () => {
        var a = f.preRun.shift();
        ab.unshift(a);
      };
      function m(a, b = "i8") {
        b.endsWith("*") && (b = "*");
        switch (b) {
          case "i1":
            return p[a];
          case "i8":
            return p[a];
          case "i16":
            return Na[a >> 1];
          case "i32":
            return E2[a >> 2];
          case "i64":
            return H[a >> 3];
          case "float":
            return Oa[a >> 2];
          case "double":
            return Pa[a >> 3];
          case "*":
            return F[a >> 2];
          default:
            Ta(`invalid type for getValue: ${b}`);
        }
      }
      var cb = f.noExitRuntime || true;
      function ta(a) {
        var b = "i32";
        b.endsWith("*") && (b = "*");
        switch (b) {
          case "i1":
            p[a] = 0;
            break;
          case "i8":
            p[a] = 0;
            break;
          case "i16":
            Na[a >> 1] = 0;
            break;
          case "i32":
            E2[a >> 2] = 0;
            break;
          case "i64":
            H[a >> 3] = BigInt(0);
            break;
          case "float":
            Oa[a >> 2] = 0;
            break;
          case "double":
            Pa[a >> 3] = 0;
            break;
          case "*":
            F[a >> 2] = 0;
            break;
          default:
            Ta(`invalid type for setValue: ${b}`);
        }
      }
      var db = typeof TextDecoder != "undefined" ? new TextDecoder : undefined, B = (a, b = 0, c = NaN) => {
        var d = b + c;
        for (c = b;a[c] && !(c >= d); )
          ++c;
        if (16 < c - b && a.buffer && db)
          return db.decode(a.subarray(b, c));
        for (d = "";b < c; ) {
          var e = a[b++];
          if (e & 128) {
            var h = a[b++] & 63;
            if ((e & 224) == 192)
              d += String.fromCharCode((e & 31) << 6 | h);
            else {
              var k = a[b++] & 63;
              e = (e & 240) == 224 ? (e & 15) << 12 | h << 6 | k : (e & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;
              65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
            }
          } else
            d += String.fromCharCode(e);
        }
        return d;
      }, ua = (a, b) => a ? B(x, a, b) : "", eb = (a, b) => {
        for (var c = 0, d = a.length - 1;0 <= d; d--) {
          var e = a[d];
          e === "." ? a.splice(d, 1) : e === ".." ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
        }
        if (b)
          for (;c; c--)
            a.unshift("..");
        return a;
      }, ka = (a) => {
        var b = a.charAt(0) === "/", c = a.slice(-1) === "/";
        (a = eb(a.split("/").filter((d) => !!d), !b).join("/")) || b || (a = ".");
        a && c && (a += "/");
        return (b ? "/" : "") + a;
      }, fb = (a) => {
        var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
        a = b[0];
        b = b[1];
        if (!a && !b)
          return ".";
        b &&= b.slice(0, -1);
        return a + b;
      }, gb = (a) => a && a.match(/([^\/]+|\/)\/*$/)[1], hb = () => {
        if (ca) {
          var a = (init_crypto(), __toCommonJS(exports_crypto));
          return (b) => a.randomFillSync(b);
        }
        return (b) => crypto.getRandomValues(b);
      }, ib = (a) => {
        (ib = hb())(a);
      }, jb = (...a) => {
        for (var b = "", c = false, d = a.length - 1;-1 <= d && !c; d--) {
          c = 0 <= d ? a[d] : "/";
          if (typeof c != "string")
            throw new TypeError("Arguments to path.resolve must be strings");
          if (!c)
            return "";
          b = c + "/" + b;
          c = c.charAt(0) === "/";
        }
        b = eb(b.split("/").filter((e) => !!e), !c).join("/");
        return (c ? "/" : "") + b || ".";
      }, kb = [], ha = (a) => {
        for (var b = 0, c = 0;c < a.length; ++c) {
          var d = a.charCodeAt(c);
          127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
        }
        return b;
      }, u = (a, b, c, d) => {
        if (!(0 < d))
          return 0;
        var e = c;
        d = c + d - 1;
        for (var h = 0;h < a.length; ++h) {
          var k = a.charCodeAt(h);
          if (55296 <= k && 57343 >= k) {
            var q = a.charCodeAt(++h);
            k = 65536 + ((k & 1023) << 10) | q & 1023;
          }
          if (127 >= k) {
            if (c >= d)
              break;
            b[c++] = k;
          } else {
            if (2047 >= k) {
              if (c + 1 >= d)
                break;
              b[c++] = 192 | k >> 6;
            } else {
              if (65535 >= k) {
                if (c + 2 >= d)
                  break;
                b[c++] = 224 | k >> 12;
              } else {
                if (c + 3 >= d)
                  break;
                b[c++] = 240 | k >> 18;
                b[c++] = 128 | k >> 12 & 63;
              }
              b[c++] = 128 | k >> 6 & 63;
            }
            b[c++] = 128 | k & 63;
          }
        }
        b[c] = 0;
        return c - e;
      }, ra = (a, b) => {
        var c = Array(ha(a) + 1);
        a = u(a, c, 0, c.length);
        b && (c.length = a);
        return c;
      }, mb = [];
      function nb(a, b) {
        mb[a] = { input: [], output: [], cb: b };
        wb(a, xb);
      }
      var xb = { open(a) {
        var b = mb[a.node.rdev];
        if (!b)
          throw new N(43);
        a.tty = b;
        a.seekable = false;
      }, close(a) {
        a.tty.cb.fsync(a.tty);
      }, fsync(a) {
        a.tty.cb.fsync(a.tty);
      }, read(a, b, c, d) {
        if (!a.tty || !a.tty.cb.xb)
          throw new N(60);
        for (var e = 0, h = 0;h < d; h++) {
          try {
            var k = a.tty.cb.xb(a.tty);
          } catch (q) {
            throw new N(29);
          }
          if (k === undefined && e === 0)
            throw new N(6);
          if (k === null || k === undefined)
            break;
          e++;
          b[c + h] = k;
        }
        e && (a.node.atime = Date.now());
        return e;
      }, write(a, b, c, d) {
        if (!a.tty || !a.tty.cb.qb)
          throw new N(60);
        try {
          for (var e = 0;e < d; e++)
            a.tty.cb.qb(a.tty, b[c + e]);
        } catch (h) {
          throw new N(29);
        }
        d && (a.node.mtime = a.node.ctime = Date.now());
        return e;
      } }, yb = { xb() {
        a: {
          if (!kb.length) {
            var a = null;
            if (ca) {
              var b = Buffer.alloc(256), c = 0, d = process.stdin.fd;
              try {
                c = fs.readSync(d, b, 0, 256);
              } catch (e) {
                if (e.toString().includes("EOF"))
                  c = 0;
                else
                  throw e;
              }
              0 < c && (a = b.slice(0, c).toString("utf-8"));
            } else
              typeof window != "undefined" && typeof window.prompt == "function" && (a = window.prompt("Input: "), a !== null && (a += `
`));
            if (!a) {
              a = null;
              break a;
            }
            kb = ra(a, true);
          }
          a = kb.shift();
        }
        return a;
      }, qb(a, b) {
        b === null || b === 10 ? (Ha(B(a.output)), a.output = []) : b != 0 && a.output.push(b);
      }, fsync(a) {
        0 < a.output?.length && (Ha(B(a.output)), a.output = []);
      }, Tb() {
        return { Ob: 25856, Qb: 5, Nb: 191, Pb: 35387, Mb: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
      }, Ub() {
        return 0;
      }, Vb() {
        return [24, 80];
      } }, zb = { qb(a, b) {
        b === null || b === 10 ? (Ia(B(a.output)), a.output = []) : b != 0 && a.output.push(b);
      }, fsync(a) {
        0 < a.output?.length && (Ia(B(a.output)), a.output = []);
      } }, O = { Wa: null, Xa() {
        return O.createNode(null, "/", 16895, 0);
      }, createNode(a, b, c, d) {
        if ((c & 61440) === 24576 || (c & 61440) === 4096)
          throw new N(63);
        O.Wa || (O.Wa = { dir: { node: { Ta: O.La.Ta, Ua: O.La.Ua, lookup: O.La.lookup, hb: O.La.hb, rename: O.La.rename, unlink: O.La.unlink, rmdir: O.La.rmdir, readdir: O.La.readdir, symlink: O.La.symlink }, stream: { Va: O.Ma.Va } }, file: { node: { Ta: O.La.Ta, Ua: O.La.Ua }, stream: { Va: O.Ma.Va, read: O.Ma.read, write: O.Ma.write, ib: O.Ma.ib, jb: O.Ma.jb } }, link: { node: { Ta: O.La.Ta, Ua: O.La.Ua, readlink: O.La.readlink }, stream: {} }, ub: { node: { Ta: O.La.Ta, Ua: O.La.Ua }, stream: Ab } });
        c = Bb(a, b, c, d);
        P(c.mode) ? (c.La = O.Wa.dir.node, c.Ma = O.Wa.dir.stream, c.Na = {}) : (c.mode & 61440) === 32768 ? (c.La = O.Wa.file.node, c.Ma = O.Wa.file.stream, c.Ra = 0, c.Na = null) : (c.mode & 61440) === 40960 ? (c.La = O.Wa.link.node, c.Ma = O.Wa.link.stream) : (c.mode & 61440) === 8192 && (c.La = O.Wa.ub.node, c.Ma = O.Wa.ub.stream);
        c.atime = c.mtime = c.ctime = Date.now();
        a && (a.Na[b] = c, a.atime = a.mtime = a.ctime = c.atime);
        return c;
      }, Sb(a) {
        return a.Na ? a.Na.subarray ? a.Na.subarray(0, a.Ra) : new Uint8Array(a.Na) : new Uint8Array(0);
      }, La: { Ta(a) {
        var b = {};
        b.dev = (a.mode & 61440) === 8192 ? a.id : 1;
        b.ino = a.id;
        b.mode = a.mode;
        b.nlink = 1;
        b.uid = 0;
        b.gid = 0;
        b.rdev = a.rdev;
        P(a.mode) ? b.size = 4096 : (a.mode & 61440) === 32768 ? b.size = a.Ra : (a.mode & 61440) === 40960 ? b.size = a.link.length : b.size = 0;
        b.atime = new Date(a.atime);
        b.mtime = new Date(a.mtime);
        b.ctime = new Date(a.ctime);
        b.blksize = 4096;
        b.blocks = Math.ceil(b.size / b.blksize);
        return b;
      }, Ua(a, b) {
        for (var c of ["mode", "atime", "mtime", "ctime"])
          b[c] != null && (a[c] = b[c]);
        b.size !== undefined && (b = b.size, a.Ra != b && (b == 0 ? (a.Na = null, a.Ra = 0) : (c = a.Na, a.Na = new Uint8Array(b), c && a.Na.set(c.subarray(0, Math.min(b, a.Ra))), a.Ra = b)));
      }, lookup() {
        throw O.vb;
      }, hb(a, b, c, d) {
        return O.createNode(a, b, c, d);
      }, rename(a, b, c) {
        try {
          var d = Q(b, c);
        } catch (h) {}
        if (d) {
          if (P(a.mode))
            for (var e in d.Na)
              throw new N(55);
          Cb(d);
        }
        delete a.parent.Na[a.name];
        b.Na[c] = a;
        a.name = c;
        b.ctime = b.mtime = a.parent.ctime = a.parent.mtime = Date.now();
      }, unlink(a, b) {
        delete a.Na[b];
        a.ctime = a.mtime = Date.now();
      }, rmdir(a, b) {
        var c = Q(a, b), d;
        for (d in c.Na)
          throw new N(55);
        delete a.Na[b];
        a.ctime = a.mtime = Date.now();
      }, readdir(a) {
        return [".", "..", ...Object.keys(a.Na)];
      }, symlink(a, b, c) {
        a = O.createNode(a, b, 41471, 0);
        a.link = c;
        return a;
      }, readlink(a) {
        if ((a.mode & 61440) !== 40960)
          throw new N(28);
        return a.link;
      } }, Ma: { read(a, b, c, d, e) {
        var h = a.node.Na;
        if (e >= a.node.Ra)
          return 0;
        a = Math.min(a.node.Ra - e, d);
        if (8 < a && h.subarray)
          b.set(h.subarray(e, e + a), c);
        else
          for (d = 0;d < a; d++)
            b[c + d] = h[e + d];
        return a;
      }, write(a, b, c, d, e, h) {
        b.buffer === p.buffer && (h = false);
        if (!d)
          return 0;
        a = a.node;
        a.mtime = a.ctime = Date.now();
        if (b.subarray && (!a.Na || a.Na.subarray)) {
          if (h)
            return a.Na = b.subarray(c, c + d), a.Ra = d;
          if (a.Ra === 0 && e === 0)
            return a.Na = b.slice(c, c + d), a.Ra = d;
          if (e + d <= a.Ra)
            return a.Na.set(b.subarray(c, c + d), e), d;
        }
        h = e + d;
        var k = a.Na ? a.Na.length : 0;
        k >= h || (h = Math.max(h, k * (1048576 > k ? 2 : 1.125) >>> 0), k != 0 && (h = Math.max(h, 256)), k = a.Na, a.Na = new Uint8Array(h), 0 < a.Ra && a.Na.set(k.subarray(0, a.Ra), 0));
        if (a.Na.subarray && b.subarray)
          a.Na.set(b.subarray(c, c + d), e);
        else
          for (h = 0;h < d; h++)
            a.Na[e + h] = b[c + h];
        a.Ra = Math.max(a.Ra, e + d);
        return d;
      }, Va(a, b, c) {
        c === 1 ? b += a.position : c === 2 && (a.node.mode & 61440) === 32768 && (b += a.node.Ra);
        if (0 > b)
          throw new N(28);
        return b;
      }, ib(a, b, c, d, e) {
        if ((a.node.mode & 61440) !== 32768)
          throw new N(43);
        a = a.node.Na;
        if (e & 2 || !a || a.buffer !== p.buffer) {
          e = true;
          d = 65536 * Math.ceil(b / 65536);
          var h = Db(65536, d);
          h && x.fill(0, h, h + d);
          d = h;
          if (!d)
            throw new N(48);
          if (a) {
            if (0 < c || c + b < a.length)
              a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
            p.set(a, d);
          }
        } else
          e = false, d = a.byteOffset;
        return { Kb: d, Ab: e };
      }, jb(a, b, c, d) {
        O.Ma.write(a, b, 0, d, c, false);
        return 0;
      } } }, la = (a, b) => {
        var c = 0;
        a && (c |= 365);
        b && (c |= 146);
        return c;
      }, Eb = null, Fb = {}, Gb = [], Hb = 1, R = null, Ib = false, Jb = true, Kb = {}, N = class {
        name = "ErrnoError";
        constructor(a) {
          this.Pa = a;
        }
      }, Lb = class {
        gb = {};
        node = null;
        get flags() {
          return this.gb.flags;
        }
        set flags(a) {
          this.gb.flags = a;
        }
        get position() {
          return this.gb.position;
        }
        set position(a) {
          this.gb.position = a;
        }
      }, Mb = class {
        La = {};
        Ma = {};
        ab = null;
        constructor(a, b, c, d) {
          a ||= this;
          this.parent = a;
          this.Xa = a.Xa;
          this.id = Hb++;
          this.name = b;
          this.mode = c;
          this.rdev = d;
          this.atime = this.mtime = this.ctime = Date.now();
        }
        get read() {
          return (this.mode & 365) === 365;
        }
        set read(a) {
          a ? this.mode |= 365 : this.mode &= -366;
        }
        get write() {
          return (this.mode & 146) === 146;
        }
        set write(a) {
          a ? this.mode |= 146 : this.mode &= -147;
        }
      };
      function S(a, b = {}) {
        if (!a)
          throw new N(44);
        b.nb ?? (b.nb = true);
        a.charAt(0) === "/" || (a = "//" + a);
        var c = 0;
        a:
          for (;40 > c; c++) {
            a = a.split("/").filter((q) => !!q);
            for (var d = Eb, e = "/", h = 0;h < a.length; h++) {
              var k = h === a.length - 1;
              if (k && b.parent)
                break;
              if (a[h] !== ".")
                if (a[h] === "..")
                  e = fb(e), d = d.parent;
                else {
                  e = ka(e + "/" + a[h]);
                  try {
                    d = Q(d, a[h]);
                  } catch (q) {
                    if (q?.Pa === 44 && k && b.Jb)
                      return { path: e };
                    throw q;
                  }
                  !d.ab || k && !b.nb || (d = d.ab.root);
                  if ((d.mode & 61440) === 40960 && (!k || b.$a)) {
                    if (!d.La.readlink)
                      throw new N(52);
                    d = d.La.readlink(d);
                    d.charAt(0) === "/" || (d = fb(e) + "/" + d);
                    a = d + "/" + a.slice(h + 1).join("/");
                    continue a;
                  }
                }
            }
            return { path: e, node: d };
          }
        throw new N(32);
      }
      function ja(a) {
        for (var b;; ) {
          if (a === a.parent)
            return a = a.Xa.zb, b ? a[a.length - 1] !== "/" ? `${a}/${b}` : a + b : a;
          b = b ? `${a.name}/${b}` : a.name;
          a = a.parent;
        }
      }
      function Nb(a, b) {
        for (var c = 0, d = 0;d < b.length; d++)
          c = (c << 5) - c + b.charCodeAt(d) | 0;
        return (a + c >>> 0) % R.length;
      }
      function Cb(a) {
        var b = Nb(a.parent.id, a.name);
        if (R[b] === a)
          R[b] = a.bb;
        else
          for (b = R[b];b; ) {
            if (b.bb === a) {
              b.bb = a.bb;
              break;
            }
            b = b.bb;
          }
      }
      function Q(a, b) {
        var c = P(a.mode) ? (c = Ob(a, "x")) ? c : a.La.lookup ? 0 : 2 : 54;
        if (c)
          throw new N(c);
        for (c = R[Nb(a.id, b)];c; c = c.bb) {
          var d = c.name;
          if (c.parent.id === a.id && d === b)
            return c;
        }
        return a.La.lookup(a, b);
      }
      function Bb(a, b, c, d) {
        a = new Mb(a, b, c, d);
        b = Nb(a.parent.id, a.name);
        a.bb = R[b];
        return R[b] = a;
      }
      function P(a) {
        return (a & 61440) === 16384;
      }
      function Pb(a) {
        var b = ["r", "w", "rw"][a & 3];
        a & 512 && (b += "w");
        return b;
      }
      function Ob(a, b) {
        if (Jb)
          return 0;
        if (!b.includes("r") || a.mode & 292) {
          if (b.includes("w") && !(a.mode & 146) || b.includes("x") && !(a.mode & 73))
            return 2;
        } else
          return 2;
        return 0;
      }
      function Qb(a, b) {
        if (!P(a.mode))
          return 54;
        try {
          return Q(a, b), 20;
        } catch (c) {}
        return Ob(a, "wx");
      }
      function Rb(a, b, c) {
        try {
          var d = Q(a, b);
        } catch (e) {
          return e.Pa;
        }
        if (a = Ob(a, "wx"))
          return a;
        if (c) {
          if (!P(d.mode))
            return 54;
          if (d === d.parent || ja(d) === "/")
            return 10;
        } else if (P(d.mode))
          return 31;
        return 0;
      }
      function Sb(a) {
        if (!a)
          throw new N(63);
        return a;
      }
      function T(a) {
        a = Gb[a];
        if (!a)
          throw new N(8);
        return a;
      }
      function Tb(a, b = -1) {
        a = Object.assign(new Lb, a);
        if (b == -1)
          a: {
            for (b = 0;4096 >= b; b++)
              if (!Gb[b])
                break a;
            throw new N(33);
          }
        a.fd = b;
        return Gb[b] = a;
      }
      function Ub(a, b = -1) {
        a = Tb(a, b);
        a.Ma?.Rb?.(a);
        return a;
      }
      function Vb(a, b, c) {
        var d = a?.Ma.Ua;
        a = d ? a : b;
        d ??= b.La.Ua;
        Sb(d);
        d(a, c);
      }
      var Ab = { open(a) {
        a.Ma = Fb[a.node.rdev].Ma;
        a.Ma.open?.(a);
      }, Va() {
        throw new N(70);
      } };
      function wb(a, b) {
        Fb[a] = { Ma: b };
      }
      function Wb(a, b) {
        var c = b === "/";
        if (c && Eb)
          throw new N(10);
        if (!c && b) {
          var d = S(b, { nb: false });
          b = d.path;
          d = d.node;
          if (d.ab)
            throw new N(10);
          if (!P(d.mode))
            throw new N(54);
        }
        b = { type: a, Wb: {}, zb: b, Ib: [] };
        a = a.Xa(b);
        a.Xa = b;
        b.root = a;
        c ? Eb = a : d && (d.ab = b, d.Xa && d.Xa.Ib.push(b));
      }
      function Xb(a, b, c) {
        var d = S(a, { parent: true }).node;
        a = gb(a);
        if (!a)
          throw new N(28);
        if (a === "." || a === "..")
          throw new N(20);
        var e = Qb(d, a);
        if (e)
          throw new N(e);
        if (!d.La.hb)
          throw new N(63);
        return d.La.hb(d, a, b, c);
      }
      function ma(a, b = 438) {
        return Xb(a, b & 4095 | 32768, 0);
      }
      function U(a, b = 511) {
        return Xb(a, b & 1023 | 16384, 0);
      }
      function Yb(a, b, c) {
        typeof c == "undefined" && (c = b, b = 438);
        Xb(a, b | 8192, c);
      }
      function Zb(a, b) {
        if (!jb(a))
          throw new N(44);
        var c = S(b, { parent: true }).node;
        if (!c)
          throw new N(44);
        b = gb(b);
        var d = Qb(c, b);
        if (d)
          throw new N(d);
        if (!c.La.symlink)
          throw new N(63);
        c.La.symlink(c, b, a);
      }
      function $b(a) {
        var b = S(a, { parent: true }).node;
        a = gb(a);
        var c = Q(b, a), d = Rb(b, a, true);
        if (d)
          throw new N(d);
        if (!b.La.rmdir)
          throw new N(63);
        if (c.ab)
          throw new N(10);
        b.La.rmdir(b, a);
        Cb(c);
      }
      function za(a) {
        var b = S(a, { parent: true }).node;
        if (!b)
          throw new N(44);
        a = gb(a);
        var c = Q(b, a), d = Rb(b, a, false);
        if (d)
          throw new N(d);
        if (!b.La.unlink)
          throw new N(63);
        if (c.ab)
          throw new N(10);
        b.La.unlink(b, a);
        Cb(c);
      }
      function ac(a, b) {
        a = S(a, { $a: !b }).node;
        return Sb(a.La.Ta)(a);
      }
      function bc(a, b, c, d) {
        Vb(a, b, { mode: c & 4095 | b.mode & -4096, ctime: Date.now(), Fb: d });
      }
      function na(a, b) {
        a = typeof a == "string" ? S(a, { $a: true }).node : a;
        bc(null, a, b);
      }
      function cc(a, b, c) {
        if (P(b.mode))
          throw new N(31);
        if ((b.mode & 61440) !== 32768)
          throw new N(28);
        var d = Ob(b, "w");
        if (d)
          throw new N(d);
        Vb(a, b, { size: c, timestamp: Date.now() });
      }
      function oa(a, b, c = 438) {
        if (a === "")
          throw new N(44);
        if (typeof b == "string") {
          var d = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[b];
          if (typeof d == "undefined")
            throw Error(`Unknown file open mode: ${b}`);
          b = d;
        }
        c = b & 64 ? c & 4095 | 32768 : 0;
        if (typeof a == "object")
          d = a;
        else {
          var e = a.endsWith("/");
          a = S(a, { $a: !(b & 131072), Jb: true });
          d = a.node;
          a = a.path;
        }
        var h = false;
        if (b & 64)
          if (d) {
            if (b & 128)
              throw new N(20);
          } else {
            if (e)
              throw new N(31);
            d = Xb(a, c | 511, 0);
            h = true;
          }
        if (!d)
          throw new N(44);
        (d.mode & 61440) === 8192 && (b &= -513);
        if (b & 65536 && !P(d.mode))
          throw new N(54);
        if (!h && (e = d ? (d.mode & 61440) === 40960 ? 32 : P(d.mode) && (Pb(b) !== "r" || b & 576) ? 31 : Ob(d, Pb(b)) : 44))
          throw new N(e);
        b & 512 && !h && (e = d, e = typeof e == "string" ? S(e, { $a: true }).node : e, cc(null, e, 0));
        b &= -131713;
        e = Tb({ node: d, path: ja(d), flags: b, seekable: true, position: 0, Ma: d.Ma, Lb: [], error: false });
        e.Ma.open && e.Ma.open(e);
        h && na(d, c & 511);
        !f.logReadFiles || b & 1 || a in Kb || (Kb[a] = 1);
        return e;
      }
      function qa(a) {
        if (a.fd === null)
          throw new N(8);
        a.ob && (a.ob = null);
        try {
          a.Ma.close && a.Ma.close(a);
        } catch (b) {
          throw b;
        } finally {
          Gb[a.fd] = null;
        }
        a.fd = null;
      }
      function mc(a, b, c) {
        if (a.fd === null)
          throw new N(8);
        if (!a.seekable || !a.Ma.Va)
          throw new N(70);
        if (c != 0 && c != 1 && c != 2)
          throw new N(28);
        a.position = a.Ma.Va(a, b, c);
        a.Lb = [];
      }
      function Ec(a, b, c, d, e) {
        if (0 > d || 0 > e)
          throw new N(28);
        if (a.fd === null)
          throw new N(8);
        if ((a.flags & 2097155) === 1)
          throw new N(8);
        if (P(a.node.mode))
          throw new N(31);
        if (!a.Ma.read)
          throw new N(28);
        var h = typeof e != "undefined";
        if (!h)
          e = a.position;
        else if (!a.seekable)
          throw new N(70);
        b = a.Ma.read(a, b, c, d, e);
        h || (a.position += b);
        return b;
      }
      function pa(a, b, c, d, e) {
        if (0 > d || 0 > e)
          throw new N(28);
        if (a.fd === null)
          throw new N(8);
        if ((a.flags & 2097155) === 0)
          throw new N(8);
        if (P(a.node.mode))
          throw new N(31);
        if (!a.Ma.write)
          throw new N(28);
        a.seekable && a.flags & 1024 && mc(a, 0, 2);
        var h = typeof e != "undefined";
        if (!h)
          e = a.position;
        else if (!a.seekable)
          throw new N(70);
        b = a.Ma.write(a, b, c, d, e, undefined);
        h || (a.position += b);
        return b;
      }
      function ya(a) {
        var b = "binary";
        if (b !== "utf8" && b !== "binary")
          throw Error(`Invalid encoding type "${b}"`);
        var c;
        var d = oa(a, d || 0);
        a = ac(a).size;
        var e = new Uint8Array(a);
        Ec(d, e, 0, a, 0);
        b === "utf8" ? c = B(e) : b === "binary" && (c = e);
        qa(d);
        return c;
      }
      function V(a, b, c) {
        a = ka("/dev/" + a);
        var d = la(!!b, !!c);
        V.yb ?? (V.yb = 64);
        var e = V.yb++ << 8 | 0;
        wb(e, { open(h) {
          h.seekable = false;
        }, close() {
          c?.buffer?.length && c(10);
        }, read(h, k, q, w) {
          for (var v = 0, C = 0;C < w; C++) {
            try {
              var G = b();
            } catch (pb) {
              throw new N(29);
            }
            if (G === undefined && v === 0)
              throw new N(6);
            if (G === null || G === undefined)
              break;
            v++;
            k[q + C] = G;
          }
          v && (h.node.atime = Date.now());
          return v;
        }, write(h, k, q, w) {
          for (var v = 0;v < w; v++)
            try {
              c(k[q + v]);
            } catch (C) {
              throw new N(29);
            }
          w && (h.node.mtime = h.node.ctime = Date.now());
          return v;
        } });
        Yb(a, d, e);
      }
      var W = {};
      function Gc(a, b, c) {
        if (b.charAt(0) === "/")
          return b;
        a = a === -100 ? "/" : T(a).path;
        if (b.length == 0) {
          if (!c)
            throw new N(44);
          return a;
        }
        return a + "/" + b;
      }
      function Hc(a, b) {
        E2[a >> 2] = b.dev;
        E2[a + 4 >> 2] = b.mode;
        F[a + 8 >> 2] = b.nlink;
        E2[a + 12 >> 2] = b.uid;
        E2[a + 16 >> 2] = b.gid;
        E2[a + 20 >> 2] = b.rdev;
        H[a + 24 >> 3] = BigInt(b.size);
        E2[a + 32 >> 2] = 4096;
        E2[a + 36 >> 2] = b.blocks;
        var c = b.atime.getTime(), d = b.mtime.getTime(), e = b.ctime.getTime();
        H[a + 40 >> 3] = BigInt(Math.floor(c / 1000));
        F[a + 48 >> 2] = c % 1000 * 1e6;
        H[a + 56 >> 3] = BigInt(Math.floor(d / 1000));
        F[a + 64 >> 2] = d % 1000 * 1e6;
        H[a + 72 >> 3] = BigInt(Math.floor(e / 1000));
        F[a + 80 >> 2] = e % 1000 * 1e6;
        H[a + 88 >> 3] = BigInt(b.ino);
        return 0;
      }
      var Ic = undefined, Jc = () => {
        var a = E2[+Ic >> 2];
        Ic += 4;
        return a;
      }, Kc = 0, Lc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Mc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Nc = {}, Oc = (a) => {
        Ma = a;
        cb || 0 < Kc || (f.onExit?.(a), La = true);
        Da(a, new Ya(a));
      }, Pc = (a) => {
        if (!La)
          try {
            if (a(), !(cb || 0 < Kc))
              try {
                Ma = a = Ma, Oc(a);
              } catch (b) {
                b instanceof Ya || b == "unwind" || Da(1, b);
              }
          } catch (b) {
            b instanceof Ya || b == "unwind" || Da(1, b);
          }
      }, Qc = {}, Sc = () => {
        if (!Rc) {
          var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: Ca || "./this.program" }, b;
          for (b in Qc)
            Qc[b] === undefined ? delete a[b] : a[b] = Qc[b];
          var c = [];
          for (b in a)
            c.push(`${b}=${a[b]}`);
          Rc = c;
        }
        return Rc;
      }, Rc, xa = (a) => {
        var b = ha(a) + 1, c = z(b);
        u(a, x, c, b);
        return c;
      }, Tc = (a, b, c, d) => {
        var e = { string: (v) => {
          var C = 0;
          v !== null && v !== undefined && v !== 0 && (C = xa(v));
          return C;
        }, array: (v) => {
          var C = z(v.length);
          p.set(v, C);
          return C;
        } };
        a = f["_" + a];
        var h = [], k = 0;
        if (d)
          for (var q = 0;q < d.length; q++) {
            var w = e[c[q]];
            w ? (k === 0 && (k = sa()), h[q] = w(d[q])) : h[q] = d[q];
          }
        c = a(...h);
        return c = function(v) {
          k !== 0 && wa(k);
          return b === "string" ? v ? B(x, v) : "" : b === "boolean" ? !!v : v;
        }(c);
      }, ea = 0, da = (a, b) => {
        b = b == 1 ? z(a.length) : ia(a.length);
        a.subarray || a.slice || (a = new Uint8Array(a));
        x.set(a, b);
        return b;
      }, Uc, Vc = [], Y, A = (a) => {
        Uc.delete(Y.get(a));
        Y.set(a, null);
        Vc.push(a);
      }, Aa = (a, b) => {
        if (!Uc) {
          Uc = new WeakMap;
          var c = Y.length;
          if (Uc)
            for (var d = 0;d < 0 + c; d++) {
              var e = Y.get(d);
              e && Uc.set(e, d);
            }
        }
        if (c = Uc.get(a) || 0)
          return c;
        if (Vc.length)
          c = Vc.pop();
        else {
          try {
            Y.grow(1);
          } catch (w) {
            if (!(w instanceof RangeError))
              throw w;
            throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
          }
          c = Y.length - 1;
        }
        try {
          Y.set(c, a);
        } catch (w) {
          if (!(w instanceof TypeError))
            throw w;
          if (typeof WebAssembly.Function == "function") {
            var h = WebAssembly.Function;
            d = { i: "i32", j: "i64", f: "f32", d: "f64", e: "externref", p: "i32" };
            e = { parameters: [], results: b[0] == "v" ? [] : [d[b[0]]] };
            for (var k = 1;k < b.length; ++k)
              e.parameters.push(d[b[k]]);
            b = new h(e, a);
          } else {
            d = [1];
            e = b.slice(0, 1);
            b = b.slice(1);
            k = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
            d.push(96);
            var q = b.length;
            128 > q ? d.push(q) : d.push(q % 128 | 128, q >> 7);
            for (h of b)
              d.push(k[h]);
            e == "v" ? d.push(0) : d.push(1, k[e]);
            b = [0, 97, 115, 109, 1, 0, 0, 0, 1];
            h = d.length;
            128 > h ? b.push(h) : b.push(h % 128 | 128, h >> 7);
            b.push(...d);
            b.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
            b = new WebAssembly.Module(new Uint8Array(b));
            b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;
          }
          Y.set(c, b);
        }
        Uc.set(a, c);
        return c;
      };
      R = Array(4096);
      Wb(O, "/");
      U("/tmp");
      U("/home");
      U("/home/web_user");
      (function() {
        U("/dev");
        wb(259, { read: () => 0, write: (d, e, h, k) => k, Va: () => 0 });
        Yb("/dev/null", 259);
        nb(1280, yb);
        nb(1536, zb);
        Yb("/dev/tty", 1280);
        Yb("/dev/tty1", 1536);
        var a = new Uint8Array(1024), b = 0, c = () => {
          b === 0 && (ib(a), b = a.byteLength);
          return a[--b];
        };
        V("random", c);
        V("urandom", c);
        U("/dev/shm");
        U("/dev/shm/tmp");
      })();
      (function() {
        U("/proc");
        var a = U("/proc/self");
        U("/proc/self/fd");
        Wb({ Xa() {
          var b = Bb(a, "fd", 16895, 73);
          b.Ma = { Va: O.Ma.Va };
          b.La = { lookup(c, d) {
            c = +d;
            var e = T(c);
            c = { parent: null, Xa: { zb: "fake" }, La: { readlink: () => e.path }, id: c + 1 };
            return c.parent = c;
          }, readdir() {
            return Array.from(Gb.entries()).filter(([, c]) => c).map(([c]) => c.toString());
          } };
          return b;
        } }, "/proc/self/fd");
      })();
      O.vb = new N(44);
      O.vb.stack = "<generic error, no stack>";
      var Xc = { a: (a, b, c, d) => Ta(`Assertion failed: ${a ? B(x, a) : ""}, at: ` + [b ? b ? B(x, b) : "" : "unknown filename", c, d ? d ? B(x, d) : "" : "unknown function"]), i: function(a, b) {
        try {
          return a = a ? B(x, a) : "", na(a, b), 0;
        } catch (c) {
          if (typeof W == "undefined" || c.name !== "ErrnoError")
            throw c;
          return -c.Pa;
        }
      }, L: function(a, b, c) {
        try {
          b = b ? B(x, b) : "";
          b = Gc(a, b);
          if (c & -8)
            return -28;
          var d = S(b, { $a: true }).node;
          if (!d)
            return -44;
          a = "";
          c & 4 && (a += "r");
          c & 2 && (a += "w");
          c & 1 && (a += "x");
          return a && Ob(d, a) ? -2 : 0;
        } catch (e) {
          if (typeof W == "undefined" || e.name !== "ErrnoError")
            throw e;
          return -e.Pa;
        }
      }, j: function(a, b) {
        try {
          var c = T(a);
          bc(c, c.node, b, false);
          return 0;
        } catch (d) {
          if (typeof W == "undefined" || d.name !== "ErrnoError")
            throw d;
          return -d.Pa;
        }
      }, h: function(a) {
        try {
          var b = T(a);
          Vb(b, b.node, { timestamp: Date.now(), Fb: false });
          return 0;
        } catch (c) {
          if (typeof W == "undefined" || c.name !== "ErrnoError")
            throw c;
          return -c.Pa;
        }
      }, b: function(a, b, c) {
        Ic = c;
        try {
          var d = T(a);
          switch (b) {
            case 0:
              var e = Jc();
              if (0 > e)
                break;
              for (;Gb[e]; )
                e++;
              return Ub(d, e).fd;
            case 1:
            case 2:
              return 0;
            case 3:
              return d.flags;
            case 4:
              return e = Jc(), d.flags |= e, 0;
            case 12:
              return e = Jc(), Na[e + 0 >> 1] = 2, 0;
            case 13:
            case 14:
              return 0;
          }
          return -28;
        } catch (h) {
          if (typeof W == "undefined" || h.name !== "ErrnoError")
            throw h;
          return -h.Pa;
        }
      }, g: function(a, b) {
        try {
          var c = T(a), d = c.node, e = c.Ma.Ta;
          a = e ? c : d;
          e ??= d.La.Ta;
          Sb(e);
          var h = e(a);
          return Hc(b, h);
        } catch (k) {
          if (typeof W == "undefined" || k.name !== "ErrnoError")
            throw k;
          return -k.Pa;
        }
      }, H: function(a, b) {
        b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
        try {
          if (isNaN(b))
            return 61;
          var c = T(a);
          if (0 > b || (c.flags & 2097155) === 0)
            throw new N(28);
          cc(c, c.node, b);
          return 0;
        } catch (d) {
          if (typeof W == "undefined" || d.name !== "ErrnoError")
            throw d;
          return -d.Pa;
        }
      }, G: function(a, b) {
        try {
          if (b === 0)
            return -28;
          var c = ha("/") + 1;
          if (b < c)
            return -68;
          u("/", x, a, b);
          return c;
        } catch (d) {
          if (typeof W == "undefined" || d.name !== "ErrnoError")
            throw d;
          return -d.Pa;
        }
      }, K: function(a, b) {
        try {
          return a = a ? B(x, a) : "", Hc(b, ac(a, true));
        } catch (c) {
          if (typeof W == "undefined" || c.name !== "ErrnoError")
            throw c;
          return -c.Pa;
        }
      }, C: function(a, b, c) {
        try {
          return b = b ? B(x, b) : "", b = Gc(a, b), U(b, c), 0;
        } catch (d) {
          if (typeof W == "undefined" || d.name !== "ErrnoError")
            throw d;
          return -d.Pa;
        }
      }, J: function(a, b, c, d) {
        try {
          b = b ? B(x, b) : "";
          var e = d & 256;
          b = Gc(a, b, d & 4096);
          return Hc(c, e ? ac(b, true) : ac(b));
        } catch (h) {
          if (typeof W == "undefined" || h.name !== "ErrnoError")
            throw h;
          return -h.Pa;
        }
      }, x: function(a, b, c, d) {
        Ic = d;
        try {
          b = b ? B(x, b) : "";
          b = Gc(a, b);
          var e = d ? Jc() : 0;
          return oa(b, c, e).fd;
        } catch (h) {
          if (typeof W == "undefined" || h.name !== "ErrnoError")
            throw h;
          return -h.Pa;
        }
      }, v: function(a, b, c, d) {
        try {
          b = b ? B(x, b) : "";
          b = Gc(a, b);
          if (0 >= d)
            return -28;
          var e = S(b).node;
          if (!e)
            throw new N(44);
          if (!e.La.readlink)
            throw new N(28);
          var h = e.La.readlink(e);
          var k = Math.min(d, ha(h)), q = p[c + k];
          u(h, x, c, d + 1);
          p[c + k] = q;
          return k;
        } catch (w) {
          if (typeof W == "undefined" || w.name !== "ErrnoError")
            throw w;
          return -w.Pa;
        }
      }, u: function(a) {
        try {
          return a = a ? B(x, a) : "", $b(a), 0;
        } catch (b) {
          if (typeof W == "undefined" || b.name !== "ErrnoError")
            throw b;
          return -b.Pa;
        }
      }, f: function(a, b) {
        try {
          return a = a ? B(x, a) : "", Hc(b, ac(a));
        } catch (c) {
          if (typeof W == "undefined" || c.name !== "ErrnoError")
            throw c;
          return -c.Pa;
        }
      }, r: function(a, b, c) {
        try {
          return b = b ? B(x, b) : "", b = Gc(a, b), c === 0 ? za(b) : c === 512 ? $b(b) : Ta("Invalid flags passed to unlinkat"), 0;
        } catch (d) {
          if (typeof W == "undefined" || d.name !== "ErrnoError")
            throw d;
          return -d.Pa;
        }
      }, q: function(a, b, c) {
        try {
          b = b ? B(x, b) : "";
          b = Gc(a, b, true);
          var d = Date.now(), e, h;
          if (c) {
            var k = F[c >> 2] + 4294967296 * E2[c + 4 >> 2], q = E2[c + 8 >> 2];
            q == 1073741823 ? e = d : q == 1073741822 ? e = null : e = 1000 * k + q / 1e6;
            c += 16;
            k = F[c >> 2] + 4294967296 * E2[c + 4 >> 2];
            q = E2[c + 8 >> 2];
            q == 1073741823 ? h = d : q == 1073741822 ? h = null : h = 1000 * k + q / 1e6;
          } else
            h = e = d;
          if ((h ?? e) !== null) {
            a = e;
            var w = S(b, { $a: true }).node;
            Sb(w.La.Ua)(w, { atime: a, mtime: h });
          }
          return 0;
        } catch (v) {
          if (typeof W == "undefined" || v.name !== "ErrnoError")
            throw v;
          return -v.Pa;
        }
      }, m: () => Ta(""), l: () => {
        cb = false;
        Kc = 0;
      }, A: function(a, b) {
        a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
        a = new Date(1000 * a);
        E2[b >> 2] = a.getSeconds();
        E2[b + 4 >> 2] = a.getMinutes();
        E2[b + 8 >> 2] = a.getHours();
        E2[b + 12 >> 2] = a.getDate();
        E2[b + 16 >> 2] = a.getMonth();
        E2[b + 20 >> 2] = a.getFullYear() - 1900;
        E2[b + 24 >> 2] = a.getDay();
        var c = a.getFullYear();
        E2[b + 28 >> 2] = (c % 4 !== 0 || c % 100 === 0 && c % 400 !== 0 ? Mc : Lc)[a.getMonth()] + a.getDate() - 1 | 0;
        E2[b + 36 >> 2] = -(60 * a.getTimezoneOffset());
        c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
        var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
        E2[b + 32 >> 2] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
      }, y: function(a, b, c, d, e, h, k) {
        e = -9007199254740992 > e || 9007199254740992 < e ? NaN : Number(e);
        try {
          if (isNaN(e))
            return 61;
          var q = T(d);
          if ((b & 2) !== 0 && (c & 2) === 0 && (q.flags & 2097155) !== 2)
            throw new N(2);
          if ((q.flags & 2097155) === 1)
            throw new N(2);
          if (!q.Ma.ib)
            throw new N(43);
          if (!a)
            throw new N(28);
          var w = q.Ma.ib(q, a, e, b, c);
          var v = w.Kb;
          E2[h >> 2] = w.Ab;
          F[k >> 2] = v;
          return 0;
        } catch (C) {
          if (typeof W == "undefined" || C.name !== "ErrnoError")
            throw C;
          return -C.Pa;
        }
      }, z: function(a, b, c, d, e, h) {
        h = -9007199254740992 > h || 9007199254740992 < h ? NaN : Number(h);
        try {
          var k = T(e);
          if (c & 2) {
            c = h;
            if ((k.node.mode & 61440) !== 32768)
              throw new N(43);
            if (!(d & 2)) {
              var q = x.slice(a, a + b);
              k.Ma.jb && k.Ma.jb(k, q, c, b, d);
            }
          }
        } catch (w) {
          if (typeof W == "undefined" || w.name !== "ErrnoError")
            throw w;
          return -w.Pa;
        }
      }, n: (a, b) => {
        Nc[a] && (clearTimeout(Nc[a].id), delete Nc[a]);
        if (!b)
          return 0;
        var c = setTimeout(() => {
          delete Nc[a];
          Pc(() => Wc(a, performance.now()));
        }, b);
        Nc[a] = {
          id: c,
          Xb: b
        };
        return 0;
      }, B: (a, b, c, d) => {
        var e = new Date().getFullYear(), h = new Date(e, 0, 1).getTimezoneOffset();
        e = new Date(e, 6, 1).getTimezoneOffset();
        F[a >> 2] = 60 * Math.max(h, e);
        E2[b >> 2] = Number(h != e);
        b = (k) => {
          var q = Math.abs(k);
          return `UTC${0 <= k ? "-" : "+"}${String(Math.floor(q / 60)).padStart(2, "0")}${String(q % 60).padStart(2, "0")}`;
        };
        a = b(h);
        b = b(e);
        e < h ? (u(a, x, c, 17), u(b, x, d, 17)) : (u(a, x, d, 17), u(b, x, c, 17));
      }, d: () => Date.now(), s: () => 2147483648, c: () => performance.now(), o: (a) => {
        var b = x.length;
        a >>>= 0;
        if (2147483648 < a)
          return false;
        for (var c = 1;4 >= c; c *= 2) {
          var d = b * (1 + 0.2 / c);
          d = Math.min(d, a + 100663296);
          a: {
            d = (Math.min(2147483648, 65536 * Math.ceil(Math.max(a, d) / 65536)) - Ka.buffer.byteLength + 65535) / 65536 | 0;
            try {
              Ka.grow(d);
              Qa();
              var e = 1;
              break a;
            } catch (h) {}
            e = undefined;
          }
          if (e)
            return true;
        }
        return false;
      }, E: (a, b) => {
        var c = 0;
        Sc().forEach((d, e) => {
          var h = b + c;
          e = F[a + 4 * e >> 2] = h;
          for (h = 0;h < d.length; ++h)
            p[e++] = d.charCodeAt(h);
          p[e] = 0;
          c += d.length + 1;
        });
        return 0;
      }, F: (a, b) => {
        var c = Sc();
        F[a >> 2] = c.length;
        var d = 0;
        c.forEach((e) => d += e.length + 1);
        F[b >> 2] = d;
        return 0;
      }, e: function(a) {
        try {
          var b = T(a);
          qa(b);
          return 0;
        } catch (c) {
          if (typeof W == "undefined" || c.name !== "ErrnoError")
            throw c;
          return c.Pa;
        }
      }, p: function(a, b) {
        try {
          var c = T(a);
          p[b] = c.tty ? 2 : P(c.mode) ? 3 : (c.mode & 61440) === 40960 ? 7 : 4;
          Na[b + 2 >> 1] = 0;
          H[b + 8 >> 3] = BigInt(0);
          H[b + 16 >> 3] = BigInt(0);
          return 0;
        } catch (d) {
          if (typeof W == "undefined" || d.name !== "ErrnoError")
            throw d;
          return d.Pa;
        }
      }, w: function(a, b, c, d) {
        try {
          a: {
            var e = T(a);
            a = b;
            for (var h, k = b = 0;k < c; k++) {
              var q = F[a >> 2], w = F[a + 4 >> 2];
              a += 8;
              var v = Ec(e, p, q, w, h);
              if (0 > v) {
                var C = -1;
                break a;
              }
              b += v;
              if (v < w)
                break;
              typeof h != "undefined" && (h += v);
            }
            C = b;
          }
          F[d >> 2] = C;
          return 0;
        } catch (G) {
          if (typeof W == "undefined" || G.name !== "ErrnoError")
            throw G;
          return G.Pa;
        }
      }, D: function(a, b, c, d) {
        b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
        try {
          if (isNaN(b))
            return 61;
          var e = T(a);
          mc(e, b, c);
          H[d >> 3] = BigInt(e.position);
          e.ob && b === 0 && c === 0 && (e.ob = null);
          return 0;
        } catch (h) {
          if (typeof W == "undefined" || h.name !== "ErrnoError")
            throw h;
          return h.Pa;
        }
      }, I: function(a) {
        try {
          var b = T(a);
          return b.Ma?.fsync ? b.Ma.fsync(b) : 0;
        } catch (c) {
          if (typeof W == "undefined" || c.name !== "ErrnoError")
            throw c;
          return c.Pa;
        }
      }, t: function(a, b, c, d) {
        try {
          a: {
            var e = T(a);
            a = b;
            for (var h, k = b = 0;k < c; k++) {
              var q = F[a >> 2], w = F[a + 4 >> 2];
              a += 8;
              var v = pa(e, p, q, w, h);
              if (0 > v) {
                var C = -1;
                break a;
              }
              b += v;
              if (v < w)
                break;
              typeof h != "undefined" && (h += v);
            }
            C = b;
          }
          F[d >> 2] = C;
          return 0;
        } catch (G) {
          if (typeof W == "undefined" || G.name !== "ErrnoError")
            throw G;
          return G.Pa;
        }
      }, k: Oc }, Z;
      (async function() {
        function a(c) {
          Z = c.exports;
          Ka = Z.M;
          Qa();
          Y = Z.O;
          K--;
          f.monitorRunDependencies?.(K);
          K == 0 && Sa && (c = Sa, Sa = null, c());
          return Z;
        }
        K++;
        f.monitorRunDependencies?.(K);
        var b = { a: Xc };
        if (f.instantiateWasm)
          return new Promise((c) => {
            f.instantiateWasm(b, (d, e) => {
              a(d, e);
              c(d.exports);
            });
          });
        Ua ??= f.locateFile ? f.locateFile("sql-wasm.wasm", D) : D + "sql-wasm.wasm";
        return a((await Xa(b)).instance);
      })();
      f._sqlite3_free = (a) => (f._sqlite3_free = Z.P)(a);
      f._sqlite3_value_text = (a) => (f._sqlite3_value_text = Z.Q)(a);
      f._sqlite3_prepare_v2 = (a, b, c, d, e) => (f._sqlite3_prepare_v2 = Z.R)(a, b, c, d, e);
      f._sqlite3_step = (a) => (f._sqlite3_step = Z.S)(a);
      f._sqlite3_reset = (a) => (f._sqlite3_reset = Z.T)(a);
      f._sqlite3_exec = (a, b, c, d, e) => (f._sqlite3_exec = Z.U)(a, b, c, d, e);
      f._sqlite3_finalize = (a) => (f._sqlite3_finalize = Z.V)(a);
      f._sqlite3_column_name = (a, b) => (f._sqlite3_column_name = Z.W)(a, b);
      f._sqlite3_column_text = (a, b) => (f._sqlite3_column_text = Z.X)(a, b);
      f._sqlite3_column_type = (a, b) => (f._sqlite3_column_type = Z.Y)(a, b);
      f._sqlite3_errmsg = (a) => (f._sqlite3_errmsg = Z.Z)(a);
      f._sqlite3_clear_bindings = (a) => (f._sqlite3_clear_bindings = Z._)(a);
      f._sqlite3_value_blob = (a) => (f._sqlite3_value_blob = Z.$)(a);
      f._sqlite3_value_bytes = (a) => (f._sqlite3_value_bytes = Z.aa)(a);
      f._sqlite3_value_double = (a) => (f._sqlite3_value_double = Z.ba)(a);
      f._sqlite3_value_int = (a) => (f._sqlite3_value_int = Z.ca)(a);
      f._sqlite3_value_type = (a) => (f._sqlite3_value_type = Z.da)(a);
      f._sqlite3_result_blob = (a, b, c, d) => (f._sqlite3_result_blob = Z.ea)(a, b, c, d);
      f._sqlite3_result_double = (a, b) => (f._sqlite3_result_double = Z.fa)(a, b);
      f._sqlite3_result_error = (a, b, c) => (f._sqlite3_result_error = Z.ga)(a, b, c);
      f._sqlite3_result_int = (a, b) => (f._sqlite3_result_int = Z.ha)(a, b);
      f._sqlite3_result_int64 = (a, b) => (f._sqlite3_result_int64 = Z.ia)(a, b);
      f._sqlite3_result_null = (a) => (f._sqlite3_result_null = Z.ja)(a);
      f._sqlite3_result_text = (a, b, c, d) => (f._sqlite3_result_text = Z.ka)(a, b, c, d);
      f._sqlite3_aggregate_context = (a, b) => (f._sqlite3_aggregate_context = Z.la)(a, b);
      f._sqlite3_column_count = (a) => (f._sqlite3_column_count = Z.ma)(a);
      f._sqlite3_data_count = (a) => (f._sqlite3_data_count = Z.na)(a);
      f._sqlite3_column_blob = (a, b) => (f._sqlite3_column_blob = Z.oa)(a, b);
      f._sqlite3_column_bytes = (a, b) => (f._sqlite3_column_bytes = Z.pa)(a, b);
      f._sqlite3_column_double = (a, b) => (f._sqlite3_column_double = Z.qa)(a, b);
      f._sqlite3_bind_blob = (a, b, c, d, e) => (f._sqlite3_bind_blob = Z.ra)(a, b, c, d, e);
      f._sqlite3_bind_double = (a, b, c) => (f._sqlite3_bind_double = Z.sa)(a, b, c);
      f._sqlite3_bind_int = (a, b, c) => (f._sqlite3_bind_int = Z.ta)(a, b, c);
      f._sqlite3_bind_text = (a, b, c, d, e) => (f._sqlite3_bind_text = Z.ua)(a, b, c, d, e);
      f._sqlite3_bind_parameter_index = (a, b) => (f._sqlite3_bind_parameter_index = Z.va)(a, b);
      f._sqlite3_sql = (a) => (f._sqlite3_sql = Z.wa)(a);
      f._sqlite3_normalized_sql = (a) => (f._sqlite3_normalized_sql = Z.xa)(a);
      f._sqlite3_changes = (a) => (f._sqlite3_changes = Z.ya)(a);
      f._sqlite3_close_v2 = (a) => (f._sqlite3_close_v2 = Z.za)(a);
      f._sqlite3_create_function_v2 = (a, b, c, d, e, h, k, q, w) => (f._sqlite3_create_function_v2 = Z.Aa)(a, b, c, d, e, h, k, q, w);
      f._sqlite3_update_hook = (a, b, c) => (f._sqlite3_update_hook = Z.Ba)(a, b, c);
      f._sqlite3_open = (a, b) => (f._sqlite3_open = Z.Ca)(a, b);
      var ia = f._malloc = (a) => (ia = f._malloc = Z.Da)(a), fa = f._free = (a) => (fa = f._free = Z.Ea)(a);
      f._RegisterExtensionFunctions = (a) => (f._RegisterExtensionFunctions = Z.Fa)(a);
      var Db = (a, b) => (Db = Z.Ga)(a, b), Wc = (a, b) => (Wc = Z.Ha)(a, b), wa = (a) => (wa = Z.Ia)(a), z = (a) => (z = Z.Ja)(a), sa = () => (sa = Z.Ka)();
      f.stackSave = () => sa();
      f.stackRestore = (a) => wa(a);
      f.stackAlloc = (a) => z(a);
      f.cwrap = (a, b, c, d) => {
        var e = !c || c.every((h) => h === "number" || h === "boolean");
        return b !== "string" && e && !d ? f["_" + a] : (...h) => Tc(a, b, c, h);
      };
      f.addFunction = Aa;
      f.removeFunction = A;
      f.UTF8ToString = ua;
      f.ALLOC_NORMAL = ea;
      f.allocate = da;
      f.allocateUTF8OnStack = xa;
      function Yc() {
        function a() {
          f.calledRun = true;
          if (!La) {
            if (!f.noFSInit && !Ib) {
              var b, c;
              Ib = true;
              d ??= f.stdin;
              b ??= f.stdout;
              c ??= f.stderr;
              d ? V("stdin", d) : Zb("/dev/tty", "/dev/stdin");
              b ? V("stdout", null, b) : Zb("/dev/tty", "/dev/stdout");
              c ? V("stderr", null, c) : Zb("/dev/tty1", "/dev/stderr");
              oa("/dev/stdin", 0);
              oa("/dev/stdout", 1);
              oa("/dev/stderr", 1);
            }
            Z.N();
            Jb = false;
            f.onRuntimeInitialized?.();
            if (f.postRun)
              for (typeof f.postRun == "function" && (f.postRun = [f.postRun]);f.postRun.length; ) {
                var d = f.postRun.shift();
                $a.unshift(d);
              }
            Za($a);
          }
        }
        if (0 < K)
          Sa = Yc;
        else {
          if (f.preRun)
            for (typeof f.preRun == "function" && (f.preRun = [f.preRun]);f.preRun.length; )
              bb();
          Za(ab);
          0 < K ? Sa = Yc : f.setStatus ? (f.setStatus("Running..."), setTimeout(() => {
            setTimeout(() => f.setStatus(""), 1);
            a();
          }, 1)) : a();
        }
      }
      if (f.preInit)
        for (typeof f.preInit == "function" && (f.preInit = [f.preInit]);0 < f.preInit.length; )
          f.preInit.pop()();
      Yc();
      return Module;
    });
    return initSqlJsPromise;
  };
  if (typeof exports === "object" && typeof module === "object") {
    module.exports = initSqlJs;
    module.exports.default = initSqlJs;
  } else if (typeof define === "function" && define["amd"]) {
    define([], function() {
      return initSqlJs;
    });
  } else if (typeof exports === "object") {
    exports["Module"] = initSqlJs;
  }
});

// src/worker.ts
var import_sql = __toESM(require_sql_wasm(), 1);

// src/db/indexeddb-utils.ts
function openIndexedDB(dbName) {
  return new Promise((resolve2, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("db", { keyPath: "id" });
    };
    request.onsuccess = () => resolve2(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function loadFromIndexedDB(dbName) {
  const db = await openIndexedDB(dbName);
  return new Promise((resolve2, reject) => {
    const tx = db.transaction("db", "readonly");
    const store = tx.objectStore("db");
    const getReq = store.get("main");
    getReq.onsuccess = () => resolve2(getReq.result ? getReq.result.data : null);
    getReq.onerror = () => reject(getReq.error);
  });
}
async function saveToIndexedDB(dbName, data) {
  const db = await openIndexedDB(dbName);
  return new Promise((resolve2, reject) => {
    const tx = db.transaction("db", "readwrite");
    const store = tx.objectStore("db");
    const putReq = store.put({ id: "main", data });
    putReq.onsuccess = () => {
      resolve2();
    };
    putReq.onerror = () => reject(putReq.error);
  });
}

// src/db/schema.ts
var SCHEMA = {
  events: `
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            pubkey TEXT,
            created_at INTEGER,
            kind INTEGER,
            tags TEXT,
            content TEXT,
            sig TEXT,
            raw TEXT,
            deleted INTEGER DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_events_pubkey ON events(pubkey);
        CREATE INDEX IF NOT EXISTS idx_events_kind ON events(kind);
        CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
    `,
  profiles: `
        CREATE TABLE IF NOT EXISTS profiles (
            pubkey TEXT PRIMARY KEY,
            profile TEXT,
            updated_at INTEGER
        );
    `,
  nutzap_monitor_state: `
        CREATE TABLE IF NOT EXISTS nutzap_monitor_state (
            id TEXT PRIMARY KEY,
            state TEXT
        );
    `,
  decrypted_events: `
        CREATE TABLE IF NOT EXISTS decrypted_events (
            id TEXT PRIMARY KEY,
            event TEXT
        );
    `,
  unpublished_events: `
        CREATE TABLE IF NOT EXISTS unpublished_events (
            id TEXT PRIMARY KEY,
            event TEXT,
            relays TEXT,
            lastTryAt INTEGER
        );
    `,
  event_tags: `
        CREATE TABLE IF NOT EXISTS event_tags (
            event_id TEXT NOT NULL,
            tag TEXT NOT NULL,
            value TEXT,
            PRIMARY KEY (event_id, tag, value)
        );
        CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON event_tags(event_id);
        CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON event_tags(tag);
    `,
  cashu_mint_info: `
        CREATE TABLE IF NOT EXISTS cashu_mint_info (
            mint_url TEXT PRIMARY KEY,
            info TEXT NOT NULL,
            cached_at INTEGER NOT NULL
        );
    `,
  cashu_mint_keys: `
        CREATE TABLE IF NOT EXISTS cashu_mint_keys (
            mint_url TEXT PRIMARY KEY,
            keys TEXT NOT NULL,
            cached_at INTEGER NOT NULL
        );
    `,
  event_relays: `
        CREATE TABLE IF NOT EXISTS event_relays (
            event_id TEXT NOT NULL,
            relay_url TEXT NOT NULL,
            seen_at INTEGER NOT NULL,
            PRIMARY KEY (event_id, relay_url)
        );
        CREATE INDEX IF NOT EXISTS idx_event_relays_event_id ON event_relays(event_id);
    `
};

// src/db/migrations.ts
async function runMigrations(db) {
  db.exec?.(SCHEMA.events);
  db.exec?.(SCHEMA.profiles);
  db.exec?.(SCHEMA.nutzap_monitor_state);
  db.exec?.(SCHEMA.decrypted_events);
  db.exec?.(SCHEMA.unpublished_events);
  db.exec?.(SCHEMA.event_tags);
  db.exec?.(SCHEMA.cashu_mint_info);
  db.exec?.(SCHEMA.cashu_mint_keys);
  db.exec?.(SCHEMA.event_relays);
}

// src/worker.ts
var db = null;
var SQL = null;
var dbName = "ndk-cache";
var saveTimeout = null;
var SAVE_DEBOUNCE_MS = 500;
function scheduleSave() {
  if (saveTimeout !== null) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    if (db && dbName) {
      const data = db.export();
      saveToIndexedDB(dbName, data).catch((err) => {
        console.error("Worker: Failed to save DB to IndexedDB", err);
      });
    }
  }, SAVE_DEBOUNCE_MS);
}
function patchDbPersistence(database) {
  const origRun = database.run;
  database.run = function(sql, params) {
    const result = origRun.call(this, sql, params);
    scheduleSave();
    return result;
  };
}
async function initializeDatabase(config) {
  dbName = config.dbName || "ndk-cache";
  try {
    const sqlJsConfig = {};
    if (config.wasmUrl) {
      sqlJsConfig.locateFile = () => config.wasmUrl;
    } else {}
    SQL = await import_sql.default(sqlJsConfig);
    const savedData = await loadFromIndexedDB(dbName);
    if (savedData) {
      db = new SQL.Database(new Uint8Array(savedData));
    } else {
      db = new SQL.Database;
    }
    patchDbPersistence(db);
    await runMigrations(db);
    scheduleSave();
  } catch (error) {
    console.error("Worker: Database initialization failed", error);
    throw error;
  }
}
self.onmessage = async (event) => {
  const { id, type, payload } = event.data;
  try {
    if (type === "init") {
      await initializeDatabase(payload);
      self.postMessage({ id, result: "initialized" });
      return;
    }
    if (!db) {
      throw new Error("Database not initialized yet.");
    }
    let result;
    switch (type) {
      case "run":
        db.run(payload.sql, payload.params);
        result = undefined;
        break;
      case "exec":
        result = db.exec(payload.sql, payload.params);
        break;
      case "get": {
        const stmt = db.prepare(payload.sql, payload.params);
        if (stmt.step()) {
          result = stmt.getAsObject();
        } else {
          result = null;
        }
        stmt.free();
        break;
      }
      case "all": {
        const stmtAll = db.prepare(payload.sql, payload.params);
        result = [];
        while (stmtAll.step()) {
          result.push(stmtAll.getAsObject());
        }
        stmtAll.free();
        break;
      }
      case "getProfiles": {
        const { field, contains } = payload;
        const sql = `
                    SELECT pubkey, profile
                    FROM profiles
                    WHERE json_extract(profile, '$.${field}') LIKE ?
                `;
        const param = `%${contains}%`;
        const stmt = db.prepare(sql, [param]);
        result = [];
        while (stmt.step()) {
          const row = stmt.getAsObject();
          try {
            result.push({
              pubkey: row.pubkey,
              profile: JSON.parse(row.profile)
            });
          } catch {}
        }
        stmt.free();
        break;
      }
      case "export":
        result = db.export();
        break;
      default:
        throw new Error(`Unknown command type: ${type}`);
    }
    self.postMessage({ id, result });
  } catch (error) {
    console.error(`Worker: Error processing command ${id} (${type}):`, error);
    self.postMessage({ id, error: { message: error.message, stack: error.stack } });
  }
};
self.addEventListener("error", (event) => {
  console.error("Worker: Uncaught error:", event.message, event.error);
});
