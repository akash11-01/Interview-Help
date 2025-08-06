import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addComment = mutation({
  args: {
    interviewId: v.id("interviews"),
    content: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    console.log("addComment called with args:", args);

    const identity = await ctx.auth.getUserIdentity();
    console.log("addComment - User identity:", identity);

    // For development, let's be less strict about authentication
    if (!identity) {
      console.warn(
        "No identity found in addComment, but proceeding for development"
      );
      // Use a fallback interviewer ID for development
      const fallbackInterviewerId = "development-user";

      return await ctx.db.insert("comments", {
        content: args.content,
        rating: args.rating,
        interviewerId: fallbackInterviewerId,
        interviewId: args.interviewId,
      });
    }

    // const user = await ctx.db
    //     .query("users")
    //     .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.id))
    //     .first();

    // if (!user) {
    //     throw new Error(`User with clerkId ${identity.id} not found`);
    // }

    console.log("Creating comment with authenticated user:", identity.subject);

    return await ctx.db.insert("comments", {
      content: args.content,
      rating: args.rating,
      interviewerId: identity.subject,
      interviewId: args.interviewId,
    });
  },
});

export const getComments = query({
  args: {
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("getComments - User identity:", identity);

    // For development, let's be more lenient with authentication
    if (!identity) {
      console.warn("No identity found in getComments, returning empty array");
      return [];
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_interview_id", (q) =>
        q.eq("interviewId", args.interviewId)
      )
      .collect();

    console.log(
      "Found comments for interview:",
      args.interviewId,
      "count:",
      comments.length
    );
    return comments;
  },
});

export const getCommentsByInterview = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_interview_id", (q) =>
        q.eq("interviewId", args.interviewId)
      )
      .collect();

    return comments;
  },
});
