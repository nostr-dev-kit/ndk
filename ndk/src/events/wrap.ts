import { NDKEvent } from ".";
import { NDKImage } from "./kinds/image";
import { NDKVideo } from "./kinds/video";

export const eventWrappingMap = new Map();

[
    NDKImage,
    NDKVideo,
].forEach((klass) => {
    klass.kinds.forEach((kind) => {
        eventWrappingMap.set(kind, klass);
    });
});

export function wrapEvent<T extends NDKEvent>(event: NDKEvent): T | NDKEvent {
    const klass = eventWrappingMap.get(event.kind);
    if (klass) return klass.from(event);
    return event;
}