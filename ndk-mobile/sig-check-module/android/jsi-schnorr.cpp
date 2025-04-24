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
        pub[i] = strtol(pubHex.substr(2*i,2).c_str(), nullptr, 16);

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