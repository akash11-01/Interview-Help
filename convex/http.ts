import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = "whsec_cj2jZfZKco4v7bjxsl1/1PE+O/lvC7KK";
    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET is not set");
    }

    // Log headers for debugging
    console.log("All request headers:");
    request.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    console.log("Svix headers:", { svix_id, svix_signature, svix_timestamp });

    const payload = await request.json();
    console.log("Payload received:", payload);

    if (!svix_id || !svix_signature || !svix_timestamp) {
      console.log("Missing Svix headers - this might be a test request");

      // For testing purposes, let's try to process the payload directly
      if (payload && payload.type) {
        console.log("Processing test payload:", payload);

        if (payload.type === "user.created") {
          const { id, email_addresses, first_name, last_name, image_url } =
            payload.data;
          const email = email_addresses[0].email_address;
          const name = `${first_name || ""} ${last_name || ""}`.trim();

          try {
            await ctx.runMutation(api.users.syncUser, {
              clerkId: id,
              email,
              name,
              imageUrl: image_url || "",
            });
            console.log("Test user created successfully");
            return new Response("Test webhook processed successfully", {
              status: 200,
            });
          } catch (error) {
            console.log("Error creating test user:", error);
            return new Response("Error creating test user", { status: 500 });
          }
        }
      }

      return new Response("No Svix headers found", {
        status: 400,
      });
    }

    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-signature": svix_signature,
        "svix-timestamp": svix_timestamp,
      }) as WebhookEvent;
    } catch (error) {
      console.error("Error verifying webhook:", error);
      return new Response("Error occured", { status: 400 });
    }

    const eventType = evt.type;
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          clerkId: id,
          email,
          name,
          imageUrl: image_url || "",
        });
      } catch (error) {
        console.log("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

export default http;
