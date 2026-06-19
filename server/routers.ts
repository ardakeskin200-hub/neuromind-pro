import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { advancedRouter } from "./routers-advanced";

// Admin procedure
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Premium Key Management (Admin Only)
  premium: router({
    createKey: adminProcedure
      .input(z.object({
        features: z.record(z.string(), z.unknown()).optional(),
        expiresAt: z.date().optional(),
        maxUsage: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const keyCode = await db.createPremiumKey(
          ctx.user.id,
          input.features || {},
          input.expiresAt,
          input.maxUsage
        );
        
        await db.logAdminAction(ctx.user.id, "CREATE_PREMIUM_KEY", "premiumKey", undefined, {
          keyCode,
          features: input.features,
        });
        
        return { keyCode, success: true };
      }),

    activateKey: protectedProcedure
      .input(z.object({ keyCode: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const success = await db.activatePremiumKey(input.keyCode, ctx.user.id);
        
        if (success) {
          await db.logAdminAction(ctx.user.id, "ACTIVATE_PREMIUM_KEY", "user", ctx.user.id, {
            keyCode: input.keyCode,
          });
        }
        
        return { success };
      }),

    listKeys: adminProcedure.query(async () => {
      // This would need a custom query function
      return { keys: [] };
    }),
  }),

  // Chat Management
  chat: router({
    createSession: protectedProcedure
      .input(z.object({ title: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.createChatSession(ctx.user.id, input.title);
        return { success: true };
      }),

    getSessions: protectedProcedure.query(async ({ ctx }) => {
      const sessions = await db.getChatSessions(ctx.user.id);
      return sessions;
    }),

    sendMessage: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        content: z.string(),
        useMultipleModels: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Store user message
        await db.addChatMessage(input.sessionId, "user", input.content);
        
        // Simulate LLM response (in real app, call actual LLM API)
        const isPremium = (ctx.user as any).isPremium || false;
        const modelUsed = isPremium ? "gpt-4" : "claude-3-haiku";
        const response = `Response to: "${input.content}" (using ${modelUsed})`;
        
        // Store assistant response
        await db.addChatMessage(input.sessionId, "assistant", response, modelUsed, 150);
        
        return {
          response,
          model: modelUsed,
          success: true,
        };
      }),

    getMessages: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const messages = await db.getChatMessages(input.sessionId);
        return messages;
      }),
  }),

  // Motor Development (Admin Only)
  motor: router({
    addCapability: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addCapability(input.name, input.description || "", ctx.user.id);
        
        await db.logAdminAction(ctx.user.id, "ADD_CAPABILITY", "motorCapability", undefined, {
          name: input.name,
        });
        
        return { success: true };
      }),

    getCapabilities: publicProcedure.query(async () => {
      const capabilities = await db.getCapabilities();
      return capabilities;
    }),

    storeMemory: adminProcedure
      .input(z.object({
        category: z.string(),
        key: z.string(),
        value: z.string(),
        importance: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.storeMemory(input.category, input.key, input.value, input.importance || 1);
        
        await db.logAdminAction(ctx.user.id, "STORE_MEMORY", "systemMemory", undefined, {
          category: input.category,
          key: input.key,
        });
        
        return { success: true };
      }),

    getMemory: publicProcedure
      .input(z.object({
        category: z.string(),
        key: z.string(),
      }))
      .query(async ({ input }) => {
        const value = await db.getMemory(input.category, input.key);
        return { value };
      }),
  }),

  // Admin Dashboard
  admin: router({
    getStats: adminProcedure.query(async () => {
      return {
        totalUsers: 0,
        premiumUsers: 0,
        totalSessions: 0,
        totalMessages: 0,
        motorCapabilities: 0,
      };
    }),

    getAuditLog: adminProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        // This would need a custom query function
        return { logs: [] };
      }),

    manageUser: adminProcedure
      .input(z.object({
        userId: z.number(),
        isPremium: z.boolean().optional(),
        role: z.enum(["user", "admin"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.logAdminAction(ctx.user.id, "MANAGE_USER", "user", input.userId, {
          isPremium: input.isPremium,
          role: input.role,
        });
        
        return { success: true };
      }),
  }),

  // Advanced features
  advanced: advancedRouter,
});

export type AppRouter = typeof appRouter;
