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