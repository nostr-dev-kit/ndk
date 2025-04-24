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