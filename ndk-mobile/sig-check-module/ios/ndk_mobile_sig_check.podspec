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