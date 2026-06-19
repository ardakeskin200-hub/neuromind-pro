import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(role: "admin" | "user" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("Integration Tests", () => {
  describe("Premium System", () => {
    it("should create and activate premium key", async () => {
      const adminCtx = createUserContext("admin");
      const caller = appRouter.createCaller(adminCtx);

      const createResult = await caller.premium.createKey({
        features: { llm: "gpt-4", storage: "100gb" },
      });

      expect(createResult).toHaveProperty("keyCode");
      expect(createResult.keyCode).toContain("NK-");
    });

    it("should get current subscription plan", async () => {
      const userCtx = createUserContext("user");
      const caller = appRouter.createCaller(userCtx);

      const plan = await caller.advanced.subscription.getCurrentPlan();

      expect(plan).toHaveProperty("planId");
      expect(plan.planId).toBe("free");
      expect(plan.features).toContain("basic-chat");
    });
  });

  describe("Chat System", () => {
    it("should create chat session", async () => {
      const userCtx = createUserContext("user");
      const caller = appRouter.createCaller(userCtx);

      const session = await caller.chat.createSession({
        title: "Test Session",
      });

      expect(session).toHaveProperty("sessionId");
    });

    it("should send message to chat", async () => {
      const userCtx = createUserContext("user");
      const caller = appRouter.createCaller(userCtx);

      const response = await caller.chat.sendMessage({
        sessionId: 1,
        content: "Hello, how are you?",
        useMultipleModels: false,
      });

      expect(response).toHaveProperty("response");
      expect(response.response).toBeDefined();
    });
  });

  describe("Admin Functions", () => {
    it("should add motor capability (admin only)", async () => {
      const adminCtx = createUserContext("admin");
      const caller = appRouter.createCaller(adminCtx);

      const result = await caller.motor.addCapability({
        name: "Test Capability",
        description: "A test capability",
      });

      expect(result.success).toBe(true);
    });

    it("should record evolution (admin only)", async () => {
      const adminCtx = createUserContext("admin");
      const caller = appRouter.createCaller(adminCtx);

      const result = await caller.advanced.evolution.recordEvolution({
        action: "Added new capability",
        capabilityId: 1,
      });

      expect(result.success).toBe(true);
    });

    it("should get admin stats", async () => {
      const adminCtx = createUserContext("admin");
      const caller = appRouter.createCaller(adminCtx);

      const stats = await caller.advanced.analytics.getUserActivity();

      expect(stats).toHaveProperty("activeUsers");
      expect(stats).toHaveProperty("totalSessions");
      expect(stats).toHaveProperty("premiumUsers");
    });
  });

  describe("Multi-LLM Chat", () => {
    it("should generate multi-LLM response", async () => {
      const userCtx = createUserContext("user");
      const caller = appRouter.createCaller(userCtx);

      const response = await caller.advanced.multiLLMChat({
        sessionId: 1,
        query: "What is AI?",
        useCache: false,
      });

      expect(response).toHaveProperty("response");
      expect(response).toHaveProperty("models");
      expect(response.models.length).toBeGreaterThan(0);
      expect(response.tokensUsed).toBeGreaterThan(0);
    });

    it("should cache multi-LLM responses", async () => {
      const userCtx = createUserContext("user");
      const caller = appRouter.createCaller(userCtx);

      const query = "Test caching query";

      const firstResponse = await caller.advanced.multiLLMChat({
        sessionId: 1,
        query,
        useCache: true,
      });

      const secondResponse = await caller.advanced.multiLLMChat({
        sessionId: 1,
        query,
        useCache: true,
      });

      expect(secondResponse.fromCache).toBe(true);
    });
  });

  describe("Research System", () => {
    it("should start research session", async () => {
      const userCtx = createUserContext("user");
      const caller = appRouter.createCaller(userCtx);

      const session = await caller.advanced.research.startSession({
        topic: "Artificial Intelligence",
      });

      expect(session).toHaveProperty("sessionId");
      expect(session.status).toBe("active");
    });

    it("should complete research session", async () => {
      const userCtx = createUserContext("user");
      const caller = appRouter.createCaller(userCtx);

      const result = await caller.advanced.research.completeSession({
        sessionId: 1,
        findings: { key: "value" },
        sources: ["https://example.com"],
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Analytics", () => {
    it("should get user stats", async () => {
      const userCtx = createUserContext("user");
      const caller = appRouter.createCaller(userCtx);

      const stats = await caller.advanced.analytics.getStats();

      expect(stats).toHaveProperty("totalQueries");
      expect(stats).toHaveProperty("totalTokensUsed");
      expect(stats).toHaveProperty("averageResponseTime");
      expect(stats).toHaveProperty("cacheHitRate");
    });
  });

  describe("Authorization", () => {
    it("should deny admin access to regular users", async () => {
      const userCtx = createUserContext("user");
      const caller = appRouter.createCaller(userCtx);

      try {
        await caller.motor.addCapability({
          name: "Unauthorized",
          description: "Should fail",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});
