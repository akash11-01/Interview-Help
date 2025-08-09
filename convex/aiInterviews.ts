import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createAiInterview = mutation({
  args: {
    jobPosition: v.string(),
    jobDescription: v.string(),
    duration: v.string(),
    type: v.string(),
    questions: v.array(
      v.object({
        question: v.string(),
        type: v.string(),
      })
    ),
    userId: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const aiInterviewId = await ctx.db.insert("aiInterviews", {
      ...args,
      createdAt: Date.now(),
    });

    return aiInterviewId;
  },
});

export const getAiInterviewsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const aiInterviews = await ctx.db
      .query("aiInterviews")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return aiInterviews;
  },
});

export const getAiInterviewById = query({
  args: { id: v.id("aiInterviews") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
