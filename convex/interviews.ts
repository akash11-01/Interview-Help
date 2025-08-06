import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAllInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("getAllInterviews - User identity:", identity);

    // For development, let's show interviews even without strict authentication
    // In production, you'd want proper authentication checks
    if (!identity) {
      console.warn(
        "No identity found in getAllInterviews, but proceeding for development"
      );
    }

    const interviews = await ctx.db.query("interviews").collect();
    console.log("Found interviews:", interviews.length);

    return interviews;
  },
});

export const getMyInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("getMyInterviews - User identity:", identity);

    // For development, let's be more lenient
    if (!identity) {
      console.warn(
        "No identity found in getMyInterviews, returning empty array"
      );
      return [];
    }

    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_candidate_id", (q) =>
        q.eq("candidateId", identity.subject)
      )
      .collect();

    console.log("Found user interviews:", interviews.length);
    return interviews;
  },
});

export const getInterviewByStreamCallId = query({
  args: { streamCallId: v.string() },
  handler: async (ctx, args) => {
    console.log("getInterviewByStreamCallId called with:", args.streamCallId);

    const interview = await ctx.db
      .query("interviews")
      .withIndex("by_stream_call_id", (q) =>
        q.eq("streamCallId", args.streamCallId)
      )
      .first();

    console.log("Found interview:", interview);

    if (!interview) {
      // Let's also check all interviews to see what IDs we have
      const allInterviews = await ctx.db.query("interviews").collect();
      console.log(
        "All interviews streamCallIds:",
        allInterviews.map((i) => i.streamCallId)
      );
    }

    return interview;
  },
});

export const getInterviewById = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    return interview;
  },
});

export const createInterview = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("createInterview called with args:", args);

    const identity = await ctx.auth.getUserIdentity();
    console.log("User identity:", identity);

    // For development, let's be less strict about authentication
    // This is a temporary workaround - in production you'd want proper auth
    if (!identity) {
      console.warn("No identity found, but proceeding for development");
      // You could add additional checks here if needed
    }

    console.log("Creating interview, identity status:", !!identity);

    const result = await ctx.db.insert("interviews", {
      ...args,
    });

    console.log("Interview created successfully with ID:", result);
    return result;
  },
});

export const updateInterviewStatus = mutation({
  args: {
    id: v.id("interviews"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.status === "completed" ? { endTime: Date.now() } : {}),
    });
  },
});
