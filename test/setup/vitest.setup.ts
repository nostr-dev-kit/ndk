import { expect, vi } from "vitest";
import "./msw.setup";

// Mock timers globally for predictable testing
vi.useFakeTimers();

// This will be populated with custom matchers once we create them
const customMatchers = {};

// Add custom matchers
expect.extend(customMatchers);
