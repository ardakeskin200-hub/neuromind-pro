import { describe, expect, it } from "vitest";
import * as db from "./db";

describe("Premium Key Management", () => {
  it("should create a premium key", async () => {
    const keyCode = await db.createPremiumKey(
      1,
      { llm: "gpt-4", storage: "100gb" },
      undefined,
      100
    );
    
    expect(keyCode).toBeDefined();
    expect(keyCode).toContain("NK-");
  });

  it("should validate a premium key", async () => {
    const keyCode = await db.createPremiumKey(1, {}, undefined, 50);
    const key = await db.validatePremiumKey(keyCode);
    
    expect(key).toBeDefined();
    expect(key?.isActive).toBe(true);
  });
});

describe("Chat Management", () => {
  it("should create a chat session", async () => {
    await db.createChatSession(1, "Test Session", false);
  });

  it("should add chat messages", async () => {
    await db.createChatSession(1, "Test Session", false);
    await db.addChatMessage(1, "user", "Hello", "gpt-4", 100);
  });
});

describe("System Memory", () => {
  it("should store and retrieve memory", async () => {
    await db.storeMemory("learning", "test-key", "test-value", 5);
    const value = await db.getMemory("learning", "test-key");
    
    expect(value).toBe("test-value");
  });
});

describe("Motor Capabilities", () => {
  it("should add a capability", async () => {
    await db.addCapability("Test Capability", "A test capability", 1);
  });

  it("should retrieve capabilities", async () => {
    await db.addCapability("Retrieval Test", "Test retrieval", 1);
    const capabilities = await db.getCapabilities();
    
    expect(capabilities).toBeDefined();
    expect(Array.isArray(capabilities)).toBe(true);
  });
});
