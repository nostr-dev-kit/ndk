# Integrate `ndk-mobile/sig-check-module` into Your Expo-managed App

This document shows **all file paths** and exact steps to set up a native Schnorr signature‑verification module under **`ndk-mobile/sig-check-module`**, with an Expo EAS plugin invoked as **`ndk-mobile-sig-check`**, and wiring it into the NDK singleton.

---

## Repo Layout

```
ndk-mobile/
├── CHANGELOG.md
├── LICENSE
├── README.md
├── package.json
├── tsconfig.json
├── ... (other existing folders/files)
├── src/
│   └── ... (your TS code)
└── sig-check-module/
    ├── expo-plugin.js
    ├── android/
    │   ├── CMakeLists.txt
    │   ├── build.gradle
    │   └── jsi-schnorr.cpp
    ├── ios/
    │   ├── jsi-schnorr.mm
    │   ├── ndk_mobile_sig_check.podspec
    │   └── libsecp256k1.a
    ├── native/                  ← git submodule
    │   └── secp256k1/           ← clone of Bitcoin Core secp256k1
    └── src/
        └── index.ts             ← JS wrapper & `verifySignatureAsync`
```

---

## 1. Create and populate `sig-check-module/`

```bash
cd ndk-mobile
mkdir -p sig-check-module
```

### 1.1 Clone `secp256k1` submodule

```bash
cd sig-check-module
mkdir native
git submodule add https://github.com/bitcoin-core/secp256k1.git native/secp256k1
```

### 1.2 JavaScript wrapper

**File:** `sig-check-module/src/index.ts`

```ts
import { sha256 } from "@noble/hashes/sha256";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

export async function verifySignatureAsync(event: NDKEvent): Promise<boolean> {
  // JS-thread hashing
  const raw = new TextEncoder().encode(event.serialize());
  const hash = sha256(raw);
  // nativeVerifySchnorr injected by JSI
  return (global as any).nativeVerifySchnorr(event.sig!, hash, event.pubkey!);
}
```

---

## 2. Expo EAS Config Plugin

**File:** `sig-check-module/expo-plugin.js`

```js
const fs = require("fs");
const path = require("path");
const {
  withAndroidSettingsGradle,
  withAndroidProjectBuildGradle,
  withDangerousMod,
  withPlugins,
} = require("@expo/config-plugins");

function addAndroidInclude(config) {
  return withAndroidSettingsGradle(config, cfg => {
    const rel = path.relative(
      path.dirname(cfg.modResults.settingsGradlePath),
      path.join(__dirname, "android")
    ).replace(/\\/g, "/");
    const inc = [
      "include ':sig-check-module'",
      "project(':sig-check-module').projectDir = file('" + rel + "')"
    ].join("\n");
    if (!cfg.modResults.contents.includes("sig-check-module")) {
      cfg.modResults.contents = inc + "\n" + cfg.modResults.contents;
    }
    return cfg;
  });
}

function addAndroidDependency(config) {
  return withAndroidProjectBuildGradle(config, cfg => {
    const dep = "    implementation project(':sig-check-module')";
    if (!cfg.modResults.contents.includes(dep)) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /dependencies\s*{/,
        match => match + "\n" + dep
      );
    }
    return cfg;
  });
}

function addIosPod(config) {
  return withDangerousMod(config, [
    "ios",
    cfg => {
      const file = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
      let txt = fs.readFileSync(file, "utf8");
      const pod = "  pod 'ndk_mobile_sig_check', :path => '../node_modules/ndk-mobile/sig-check-module/ios'";
      if (!txt.includes("pod 'ndk_mobile_sig_check'")) {
        txt = txt.replace(
          /target\s+'[^']+'\s+do/,
          m => m + "\n" + pod
        );
        fs.writeFileSync(file, txt);
      }
      return cfg;
    },
  ]);
}

module.exports = function withSigCheckModule(config) {
  return withPlugins(config, [
    addAndroidInclude,
    addAndroidDependency,
    addIosPod,
  ]);
};
```

---

## 3. Android JSI Module

### 3.1 `sig-check-module/android/CMakeLists.txt`

```cmake
cmake_minimum_required(VERSION 3.13)
project(jsi_schnorr)

# Build secp256k1
add_subdirectory(
  ${CMAKE_SOURCE_DIR}/../native/secp256k1
  ${CMAKE_BINARY_DIR}/secp
)

# JSI host binding
add_library(sig_check_schnorr SHARED jsi-schnorr.cpp)
target_include_directories(sig_check_schnorr PRIVATE
  ${CMAKE_SOURCE_DIR}/../native/secp256k1/include
)
target_link_libraries(sig_check_schnorr
  secp256k1
  log
  jsi
)
```

### 3.2 `sig-check-module/android/build.gradle`

```groovy
apply plugin: 'com.android.library'

android {
  compileSdkVersion 33
  defaultConfig {
    minSdkVersion 21
    externalNativeBuild {
      cmake { cppFlags "-std=c++17 -fvisibility=hidden" }
    }
  }
  externalNativeBuild {
    cmake { path "CMakeLists.txt" }
  }
}

dependencies {
  implementation "com.facebook.react:react-native:+"
}
```

### 3.3 `sig-check-module/android/jsi-schnorr.cpp`

```cpp
#include <jsi/jsi.h>
#include "secp256k1.h"
#include "secp256k1_schnorrsig.h"
using namespace facebook::jsi;

static void installSigCheck(Runtime& rt) {
  auto fn = Function::createFromHostFunction(
    rt,
    PropNameID::forAscii(rt, "nativeVerifySchnorr"),
    3,
    [](Runtime& rt, const Value&, const Value* args, size_t) -> Value {
      auto sigHex = args[0].asString(rt).utf8(rt);
      auto arr = args[1].asObject(rt).getTypedArray(rt);
      auto pubHex = args[2].asString(rt).utf8(rt);

      size_t sigLen = sigHex.size()/2, pubLen = pubHex.size()/2;
      std::vector<uint8_t> sig(sigLen), pub(pubLen);
      for (size_t i=0; i<sigLen; i++)
        sig[i] = strtol(sigHex.substr(2*i,2).c_str(), nullptr, 16);
      for (size_t i=0; i<pubLen; i++)
        pub[i] = strtol(pubHex.substr(2*i,2).c_cstr(), nullptr, 16);

      auto data = arr.data(rt);
      size_t len = arr.length(rt);

      secp256k1_context* ctx = secp256k1_context_create(SECP256K1_CONTEXT_VERIFY);
      int ok = secp256k1_schnorrsig_verify(
        ctx,
        sig.data(),
        reinterpret_cast<const uint8_t*>(data),
        len,
        pub.data()
      );
      secp256k1_context_destroy(ctx);
      return Value((bool)ok);
    }
  );
  rt.global().setProperty(rt, "nativeVerifySchnorr", fn);
}

extern "C" JNIEXPORT jint JNI_OnLoad(JavaVM* vm, void*) {
  facebook::jni::initialize(vm);
  return JNI_VERSION_1_6;
}

extern "C" JNIEXPORT void JNICALL
Java_com_ndkmobile_sigcheck_SigCheckModule_install(JNIEnv*, jobject, jlong rtPtr) {
  auto rt = reinterpret_cast<facebook::jsi::Runtime*>(rtPtr);
  installSigCheck(*rt);
}
```

---

## 4. iOS JSI Module

### 4.1 Build & copy `libsecp256k1.a`

Compile a fat iOS binary for simulator & device; place it at:
```
sig-check-module/ios/libsecp256k1.a
```

### 4.2 `sig-check-module/ios/ndk_mobile_sig_check.podspec`

```ruby
Pod::Spec.new do |s|
  s.name         = "ndk_mobile_sig_check"
  s.version      = "1.0.0"
  s.summary      = "JSI Schnorr binding"
  s.platform     = :ios, "12.0"
  s.source       = { :path => "." }
  s.vendored_libraries = "libsecp256k1.a"
  s.source_files = "jsi-schnorr.mm"
  s.dependency "React-jsi"
  s.pod_target_xcconfig = { 'OTHER_CFLAGS' => '-std=c++17 -fvisibility=hidden' }
end
```

### 4.3 `sig-check-module/ios/jsi-schnorr.mm`

```cpp
#import <jsi/jsi.h>
#import "secp256k1.h"
#import "secp256k1_schnorrsig.h"
using namespace facebook::jsi;

static void installSigCheck(Runtime& rt) {
  auto fn = Function::createFromHostFunction(
    rt,
    PropNameID::forAscii(rt, "nativeVerifySchnorr"),
    3,
    [](Runtime& rt, const Value&, const Value* args, size_t) -> Value {
      auto sigHex = args[0].asString(rt).utf8(rt);
      auto buf = args[1].asObject(rt).getArrayBuffer(rt);
      auto pubHex = args[2].asString(rt).utf8(rt);

      // hex→bytes
      size_t sigLen = sigHex.size()/2, pubLen = pubHex.size()/2;
      std::vector<uint8_t> sig(sigLen), pub(pubLen);
      for (size_t i=0; i<sigLen; i++)
        sig[i] = strtol(sigHex.substr(2*i,2).c_str(), nullptr, 16);
      for (size_t i=0; i<pubLen; i++)
        pub[i] = strtol(pubHex.substr(2*i,2).c_str(), nullptr, 16);

      // verify
      secp256k1_context* ctx = secp256k1_context_create(SECP256K1_CONTEXT_VERIFY);
      int ok = secp256k1_schnorrsig_verify(
        ctx, sig.data(),
        reinterpret_cast<const uint8_t*>(buf.data(rt)),
        buf.size(rt),
        pub.data()
      );
      secp256k1_context_destroy(ctx);
      return Value((bool)ok);
    }
  );
  rt.global().setProperty(rt, "nativeVerifySchnorr", fn);
}

extern "C" void installJSISigCheck(jsi::Runtime& rt) {
  installSigCheck(rt);
}
```

### 4.4 Hook in AppDelegate of consuming app

```objc
#import "AppDelegate.h"
#import "jsi-schnorr.h"

- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions {
  [super application:application didFinishLaunchingWithOptions:launchOptions];
  installJSISigCheck(self.bridge.jsContext.runtime);
  return YES;
}
```

---

## 5. Update `package.json`

```json
{
  "name": "ndk-mobile",
  "expo": {
    "plugins": ["ndk-mobile-sig-check"]
  }
}
```

---

## 6. Usage in your App

The intended way to use this is....

```ts
import { verifySignatureAsync } from "ndk-mobile/sig-check-module";
import { NDK } from "@nostr-dev-kit/ndk";

const ndk = new NDK();

ndk.signatureVerificationFunction = verifySignatureAsync;
```

Then call:

```ts
const ok = await ndk.signatureVerificationFunction!(event);
```

---

## 7. Build with EAS

```bash
cd my-expo-app
yarn add ndk-mobile
# ensure "ndk-mobile-sig-check" is in expo.plugins
expo prebuild
eas build --platform android
eas build --platform ios
```

That’s the complete setup under `sig-check-module`, invoked as `ndk-mobile-sig-check`, and integrated into the NDK singleton.