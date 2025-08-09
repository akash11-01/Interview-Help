import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("candidate"), v.literal("interviewer"))),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  interviews: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(), // Clerk ID of the candidate
    interviewerIds: v.array(v.string()), // Clerk IDs of the interviewers
  })
    .index("by_candidate_id", ["candidateId"])
    .index("by_stream_call_id", ["streamCallId"]),

  comments: defineTable({
    content: v.string(),
    rating: v.number(),
    interviewerId: v.string(),
    interviewId: v.id("interviews"),
  }).index("by_interview_id", ["interviewId"]),

  aiInterviews: defineTable({
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
    userId: v.string(), // Clerk ID of the user who created this
    createdAt: v.number(),
    source: v.string(), // "openrouter-ai" or "fallback"
  })
    .index("by_user_id", ["userId"])
    .index("by_created_at", ["createdAt"]),
});

// https://dynamic-yak-36.clerk.accounts.dev
