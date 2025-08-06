import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("candidate"), v.literal("interviewer"))),
  },

  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    if (existingUser) {
      console.log("User already exists:", existingUser);
      return existingUser;
    }

    const newUser = await ctx.db.insert("users", {
      ...args,
      role: args.role, // Don't assign default role - let user choose
    });

    console.log("New user created:", newUser);
    return newUser;
  },
});

// Force sync function that doesn't require authentication (for debugging)
export const forceSyncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("candidate"), v.literal("interviewer"))),
  },

  handler: async (ctx, args) => {
    console.log("Force syncing user:", args);

    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existingUser) {
      console.log("User already exists:", existingUser);
      return existingUser;
    }

    const newUser = await ctx.db.insert("users", {
      ...args,
      role: args.role || "interviewer",
    });

    console.log("Force sync - new user created:", newUser);
    return newUser;
  },
});

export const getUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    // For now, return users if we have any identity or if there are users in the database
    // This is a more permissive approach while we debug auth issues
    const users = await ctx.db.query("users").collect();

    if (!identity) {
      // Still return users but log the auth issue for debugging
      console.log(
        "Warning: No Convex identity found, but returning users anyway"
      );
      return users;
    }

    return users;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user; // Returns null if not found, which is the correct pattern
  },
});

export const updateUserRole = mutation({
  args: {
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      role: args.role,
    });

    return await ctx.db.get(user._id);
  },
});

// Mutation to create a test candidate (for development purposes)
export const createTestCandidate = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const testClerkId = `test_candidate_${Date.now()}`;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", testClerkId))
      .first();

    if (existingUser) {
      return existingUser;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: testClerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      role: "candidate",
    });

    return await ctx.db.get(userId);
  },
});
