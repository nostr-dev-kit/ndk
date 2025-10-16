# Signer Persistence

NDK provides mechanisms to serialize and deserialize signer instances, allowing applications to store authentication
credentials (e.g., in `localStorage` or a secure store) and restore them later. This enables users to maintain their
session state across app restarts without requiring re-authentication.

This is achieved through the `toPayload()` method available on signer instances and the central `ndkSignerFromPayload()`
function.

## Serialization: `signer.toPayload()`

Every NDK signer (`NDKPrivateKeySigner`, `NDKNip07Signer`, `NDKNip46Signer`, etc.) implements a `toPayload()` method.
This method returns a JSON string containing the minimal information needed to reconstruct a functionally equivalent
signer instance later.
Every NDK signer (`NDKPrivateKeySigner`, `NDKNip07Signer`, `NDKNip46Signer`, etc.) implements a `toPayload()` method.
This method returns a string containing the information needed to reconstruct a functionally equivalent signer instance
later.

**Example Usage:**

```typescript
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

// Create or obtain a signer instance
const signer = new NDKPrivateKeySigner("your-nsec-or-hex-private-key");

// Serialize the signer
const payloadString = signer.toPayload();

// Store the payload string (e.g., in localStorage)
localStorage.setItem("currentUserSigner", payloadString);

console.log("Signer stored:", payloadString);
```

## Deserialization: `ndkSignerFromPayload()`

The `ndkSignerFromPayload()` function handles reconstructing signers from their serialized form:

```typescript
async function ndkSignerFromPayload(
  payloadString: string,
  ndk?: NDK
): Promise<NDKSigner>
```

* `payloadString`: The JSON string from a signer's `toPayload()` method
* `ndk`: Optional NDK instance (required for some signers like NIP-46)
* Returns a Promise resolving to the restored signer
* Throws an error if deserialization fails for any reason

**Example Usage:**

```typescript
import NDK, { ndkSignerFromPayload } from "@nostr-dev-kit/ndk";

const ndk = new NDK();

// Retrieve the stored payload string
const storedPayload = localStorage.getItem("currentUserSigner");

if (storedPayload) {
    try {
        // Deserialize the signer
        // Note: Pass 'ndk' if the signer might be NIP-46 or another type requiring it
        const restoredSigner = await ndkSignerFromPayload(storedPayload, ndk);
        
        // Successfully restored - use the signer
        ndk.signer = restoredSigner;
        console.log("Signer restored successfully!");
        const user = await restoredSigner.user();
        console.log("Restored user pubkey:", user.pubkey);
    } catch (error) {
        console.error("Error during signer deserialization:", error);
    }
} else {
    console.log("No stored signer found.");
    // Initiate login/key entry flow
}
```

## Error Handling

The `ndkSignerFromPayload()` function will throw errors in the following cases:

1. **Invalid JSON**: If the payload string cannot be parsed as valid JSON
   ```typescript
   throw new Error(`Failed to parse signer payload: ${errorMessage}`);
   ```

2. **Missing or Invalid Type**: If the parsed JSON doesn't contain a valid `type` field
   ```typescript
   throw new Error("Invalid signer payload format: missing or invalid type field");
   ```

3. **Unknown Signer Type**: If the `type` value doesn't match any registered signer
   ```typescript
   throw new Error(`Unknown signer type: ${parsed.type}`);
   ```

4. **Deserialization Failure**: If the signer's `fromPayload` implementation throws an error
   ```typescript
   throw new Error(`Failed to deserialize signer type ${parsed.type}: ${errorMessage}`);
   ```

Always wrap calls to `ndkSignerFromPayload()` in a try/catch block to handle potential errors:

```typescript
try {
  const signer = await ndkSignerFromPayload(storedPayload, ndk);
  // Success - use the signer
  ndk.signer = signer;
} catch (error) {
  // Handle specific error cases as needed
  console.error("Failed to restore signer:", error.message);
  // Fallback to login flow or other error handling
}
```

When using `ndkSignerFromPayload()`, always check for a `undefined` result, which indicates that deserialization failed.
The function handles errors internally, but returns `undefined` rather than throwing exceptions.

## Usage Recommendations

1. **Security Considerations**:
    * For `NDKPrivateKeySigner`, the serialized payload contains a private key in hex format - store it in a secure
      location
    * Consider using device-specific secure storage rather than localStorage for sensitive payloads

2. **Type-Specific Considerations**:
    * `NDKNip07Signer`: Use when you need browser extension integration; requires minimal storage
    * `NDKPrivateKeySigner`: Best for self-contained applications that manage their own keys
    * `NDKNip46Signer`: Ideal for remote signing scenarios such as NIP-46 Nostr Connect

3. **NDK Instance**:
    * Always provide the `ndk` parameter when deserializing signers that need it (like `NDKNip46Signer`)
    * For client-side apps, try to deserialize the signer early in the application lifecycle

## How it Works Internally

The serialization system uses a registry pattern to handle different signer types:

1. **Registration**: Each signer class is registered in a central `signerRegistry` map with its type string as the key.
   ```typescript
   // From signers/deserialization.ts
   export const signerRegistry: Map<string, NDKSignerStatic<NDKSigner>> = new Map();
   signerRegistry.set("private-key", NDKPrivateKeySigner);
   signerRegistry.set("nip07", NDKNip07Signer);
   signerRegistry.set("nip46", NDKNip46Signer);
   ```

2. **Serialization**: Each signer's `toPayload()` method creates a JSON string with:
    * A `type` field that identifies which signer class to use for reconstruction
    * A `payload` field containing class-specific data needed for reconstruction

3. **Deserialization Flow**:
    * `ndkSignerFromPayload()` parses the JSON string
    * It uses the `type` field to look up the correct signer class in the registry
    * It calls the static `fromPayload(payloadString, ndk)` method on that class
    * Each signer's `fromPayload` method handles its own type-specific reconstruction

4. **Recursive Deserialization**: For composite signers like `NDKNip46Signer`, the `fromPayload` method recursively
   calls `ndkSignerFromPayload()` on nested signer payloads.

5. **Extensibility**: Custom signer types can participate in this system by:
    * Implementing a `toPayload()` method that returns a JSON string with the proper format
    * Implementing a static `fromPayload(payloadString, ndk)` method
    * Registering the class in the `signerRegistry` with a unique type identifier