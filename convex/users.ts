import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Frontend-friendly user sync that accepts Clerk user data from the frontend
export const syncUserWithClerkData = mutation({
  args: {
    clerkId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the clerkId matches the authenticated user
    if (identity.subject !== args.clerkId) {
      throw new Error("ClerkId mismatch - not authorized");
    }

    console.log("Syncing user with Clerk data:", args);

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      console.log("User already exists:", existingUser);
      return existingUser;
    }

    // Construct the best name from available data
    const userName =
      args.fullName ||
      (args.firstName && args.lastName
        ? `${args.firstName} ${args.lastName}`
        : "") ||
      args.firstName ||
      args.lastName ||
      (args.email ? args.email.split("@")[0] : "") ||
      "Unknown User";

    const userData = {
      clerkId: args.clerkId,
      name: userName,
      email: args.email || "",
      imageUrl: args.imageUrl || undefined,
      // Don't assign role here - let user choose
      role: undefined,
    };

    console.log("Creating user with data:", userData);

    const newUserId = await ctx.db.insert("users", userData);
    const newUser = await ctx.db.get(newUserId);
    console.log("New user created:", newUser);
    return newUser;
  },
});

// Frontend-friendly user sync that uses the authenticated user's identity
export const syncCurrentUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    console.log("Syncing current user:", identity.subject);
    console.log("Full identity object:", identity);

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existingUser) {
      console.log("User already exists:", existingUser);
      return existingUser;
    }

    // Extract user data from Clerk identity - try multiple property names
    const userName = String(
      identity.name ||
        identity.given_name ||
        identity.family_name ||
        identity.nickname ||
        (typeof identity.email === "string"
          ? identity.email.split("@")[0]
          : "") ||
        "Unknown User"
    );

    const userEmail = String(identity.email || identity.emailAddress || "");

    const userImageUrl =
      identity.picture ||
      identity.pictureUrl ||
      identity.imageUrl ||
      identity.avatar_url;

    console.log("Extracted user data:", {
      name: userName,
      email: userEmail,
      imageUrl: userImageUrl,
    });

    // Create new user from Clerk identity
    const newUserId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: userName,
      email: userEmail,
      imageUrl: typeof userImageUrl === "string" ? userImageUrl : undefined,
      // Don't assign role here - let user choose
      role: undefined,
    });

    const newUser = await ctx.db.get(newUserId);
    console.log("New user created:", newUser);
    return newUser;
  },
});

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

// Update user role with Clerk data (for role selection)
export const updateUserRoleWithClerkData = mutation({
  args: {
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
    clerkId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the clerkId matches the authenticated user
    if (identity.subject !== args.clerkId) {
      throw new Error("ClerkId mismatch - not authorized");
    }

    console.log("Updating user role with Clerk data:", args);

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      // User doesn't exist, create them with the proper data
      console.log("User not found, creating with Clerk data");

      // Construct the best name from available data
      const userName =
        args.fullName ||
        (args.firstName && args.lastName
          ? `${args.firstName} ${args.lastName}`
          : "") ||
        args.firstName ||
        args.lastName ||
        (args.email ? args.email.split("@")[0] : "") ||
        "Unknown User";

      const newUserId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: userName,
        email: args.email || "",
        imageUrl: args.imageUrl || undefined,
        role: args.role,
      });

      const newUser = await ctx.db.get(newUserId);
      console.log("New user created with role:", newUser);
      return newUser;
    }

    // User exists, update their role
    await ctx.db.patch(user._id, {
      role: args.role,
    });

    const updatedUser = await ctx.db.get(user._id);
    console.log("User role updated:", updatedUser);
    return updatedUser;
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

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      // User doesn't exist in Convex DB, create them first
      console.log(
        "User not found in Convex DB, creating user:",
        identity.subject
      );
      console.log("Full identity object for role update:", identity);

      // Extract user data from Clerk identity - try multiple property names
      const userName = String(
        identity.name ||
          identity.given_name ||
          identity.family_name ||
          identity.nickname ||
          (typeof identity.email === "string"
            ? identity.email.split("@")[0]
            : "") ||
          "Unknown User"
      );

      const userEmail = String(identity.email || identity.emailAddress || "");

      const userImageUrl =
        identity.picture ||
        identity.pictureUrl ||
        identity.imageUrl ||
        identity.avatar_url;

      console.log("Extracted user data for role update:", {
        name: userName,
        email: userEmail,
        imageUrl: userImageUrl,
        role: args.role,
      });

      const newUserId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        name: userName,
        email: userEmail,
        imageUrl: typeof userImageUrl === "string" ? userImageUrl : undefined,
        role: args.role,
      });

      return await ctx.db.get(newUserId);
    }

    // User exists, update their role
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
