import { describe, expect, it } from "vitest";
import { validateCallback } from "./validate-callback.js";

describe("validateCallback", () => {
  it("should not throw when passed a function", () => {
    expect(() => {
      validateCallback(() => {}, "$testFunction", "callback");
    }).not.toThrow();
  });

  it("should not throw when passed an arrow function", () => {
    expect(() => {
      validateCallback(() => "value", "$testFunction", "callback");
    }).not.toThrow();
  });

  it("should not throw when passed a named function", () => {
    function namedFunction() {
      return "value";
    }
    expect(() => {
      validateCallback(namedFunction, "$testFunction", "callback");
    }).not.toThrow();
  });

  it("should throw TypeError when passed a string", () => {
    expect(() => {
      validateCallback("not a function", "$testFunction", "callback");
    }).toThrow(TypeError);
  });

  it("should throw TypeError when passed a number", () => {
    expect(() => {
      validateCallback(42, "$testFunction", "callback");
    }).toThrow(TypeError);
  });

  it("should throw TypeError when passed an object", () => {
    expect(() => {
      validateCallback({ key: "value" }, "$testFunction", "callback");
    }).toThrow(TypeError);
  });

  it("should throw TypeError when passed an array", () => {
    expect(() => {
      validateCallback([1, 2, 3], "$testFunction", "callback");
    }).toThrow(TypeError);
  });

  it("should throw TypeError when passed null", () => {
    expect(() => {
      validateCallback(null, "$testFunction", "callback");
    }).toThrow(TypeError);
  });

  it("should throw TypeError when passed undefined", () => {
    expect(() => {
      validateCallback(undefined, "$testFunction", "callback");
    }).toThrow(TypeError);
  });

  it("should include function name in error message", () => {
    expect(() => {
      validateCallback("value", "$subscribe", "config");
    }).toThrow("$subscribe expects config to be a function");
  });

  it("should include parameter name in error message", () => {
    expect(() => {
      validateCallback("value", "$fetchUser", "identifier");
    }).toThrow("$fetchUser expects identifier to be a function");
  });

  it("should include type of received value in error message", () => {
    expect(() => {
      validateCallback("value", "$fetchUser", "identifier");
    }).toThrow("but received string");
  });

  it("should include usage example in error message", () => {
    expect(() => {
      validateCallback("value", "$fetchUser", "identifier");
    }).toThrow(
      "Example: ndk.$fetchUser(() => value) instead of ndk.$fetchUser(value)",
    );
  });

  it("should handle different types correctly in error message", () => {
    expect(() => {
      validateCallback(123, "$fetchEvent", "idOrFilter");
    }).toThrow("but received number");

    expect(() => {
      validateCallback({}, "$fetchEvents", "filters");
    }).toThrow("but received object");

    expect(() => {
      validateCallback([], "$fetchProfile", "pubkey");
    }).toThrow("but received object"); // arrays are objects in typeof
  });
});
