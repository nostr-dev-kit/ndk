# Custom Event Class Registration

NDK provides a registration system that allows you to register custom event classes to work with the `wrapEvent()`
function. This enables you to create your own event types that integrate seamlessly with NDK's event wrapping system.

## Overview

The `wrapEvent()` function automatically wraps raw `NDKEvent` objects into more specific event types based on their
`kind` property. By default, NDK includes many built-in event classes (like `NDKArticle`, `NDKImage`, etc.), but you can
also register your own custom event classes.

## Registering Custom Event Classes

### Requirements

Your custom event class must meet these requirements:

1. **Extend NDKEvent**: Your class should extend the `NDKEvent` base class
2. **Static `kinds` property**: An array of event kind numbers this class handles
3. **Static `from` method**: A factory method that creates an instance from an `NDKEvent`

### Example

```typescript
import { NDKEvent, registerEventClass } from "@nostr-dev-kit/ndk";

class MyCustomEvent extends NDKEvent {
    static kinds = [12345]; // Custom event kind number
    
    static from(event: NDKEvent) {
        return new MyCustomEvent(event.ndk, event);
    }
    
    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= 12345;
    }
    
    // Add your custom methods and properties
    get customProperty(): string | undefined {
        return this.tagValue("custom");
    }
    
    set customProperty(value: string | undefined) {
        this.removeTag("custom");
        if (value) this.tags.push(["custom", value]);
    }
}

// Register the class
registerEventClass(MyCustomEvent);
```

### Multiple Kinds

Your custom event class can handle multiple event kinds:

```typescript
class MyMultiKindEvent extends NDKEvent {
    static kinds = [12345, 12346, 12347];
    
    static from(event: NDKEvent) {
        return new MyMultiKindEvent(event.ndk, event);
    }
    
    // Implementation...
}

registerEventClass(MyMultiKindEvent);
```

## API Reference

### `registerEventClass(eventClass)`

Registers a custom event class to be used with `wrapEvent()`.

**Parameters:**

- `eventClass`: An object that implements the `NDKEventClass` interface

**Example:**

```typescript
registerEventClass(MyCustomEvent);
```

### `unregisterEventClass(eventClass)`

Removes a previously registered event class.

**Parameters:**

- `eventClass`: The event class to unregister

**Example:**

```typescript
unregisterEventClass(MyCustomEvent);
```

### `getRegisteredEventClasses()`

Returns a Set of all currently registered custom event classes.

**Returns:**

- `Set<NDKEventClass>`: Set of registered event classes

**Example:**

```typescript
const registeredClasses = getRegisteredEventClasses();
console.log(`${registeredClasses.size} custom classes registered`);
```

## How It Works

When you call `wrapEvent()` on an `NDKEvent`, the function:

1. Creates a mapping of event kinds to their corresponding classes
2. Includes both built-in NDK classes and your registered custom classes
3. Looks up the event's `kind` in this mapping
4. If found, calls the class's `from()` method to create a wrapped instance
5. If not found, returns the original `NDKEvent`

```typescript
// This will now return a MyCustomEvent instance for kind 12345
const wrappedEvent = wrapEvent(rawEvent); // rawEvent.kind === 12345
```

## Best Practices

1. **Choose unique kind numbers**: Make sure your custom event kinds don't conflict with existing Nostr event kinds
2. **Follow NIP specifications**: If you're implementing a NIP, follow its specifications for event structure
3. **Extend existing functionality**: Build upon NDK's existing event capabilities rather than replacing them
4. **Handle errors gracefully**: Your `from()` method should handle invalid or malformed events
5. **Test thoroughly**: Test your custom event classes with various input scenarios

## Example: Custom Chat Message Event

```typescript
import { NDKEvent, registerEventClass, NDKKind } from "@nostr-dev-kit/ndk";

class NDKChatMessage extends NDKEvent {
    static kinds = [42]; // Using kind 42 for chat messages
    
    static from(event: NDKEvent) {
        return new NDKChatMessage(event.ndk, event);
    }
    
    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent | NDKEvent) {
        super(ndk, rawEvent);
        this.kind ??= 42;
    }
    
    get roomId(): string | undefined {
        return this.tagValue("room");
    }
    
    set roomId(roomId: string | undefined) {
        this.removeTag("room");
        if (roomId) this.tags.push(["room", roomId]);
    }
    
    get replyTo(): string | undefined {
        return this.tagValue("reply");
    }
    
    set replyTo(eventId: string | undefined) {
        this.removeTag("reply");
        if (eventId) this.tags.push(["reply", eventId]);
    }
}

// Register the custom chat message class
registerEventClass(NDKChatMessage);

// Now wrapEvent will automatically create NDKChatMessage instances for kind 42 events
```

This registration system provides a flexible way to extend NDK with your own event types while maintaining compatibility
with the existing event wrapping infrastructure.