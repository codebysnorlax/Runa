import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("globalChat", args);
  },
});

const DEVELOPER_EMAIL = "codebysnorlax@gmail.com";

export const editMessage = mutation({
  args: { id: v.id("globalChat"), userId: v.string(), userEmail: v.optional(v.string()), message: v.string() },
  handler: async (ctx, { id, userId, userEmail, message }) => {
    const msg = await ctx.db.get(id);
    if (!msg) return;
    if (msg.userId !== userId && userEmail !== DEVELOPER_EMAIL) return;
    await ctx.db.patch(id, { message, edited: true });
  },
});

export const deleteMessage = mutation({
  args: { id: v.id("globalChat"), userId: v.string(), userEmail: v.optional(v.string()) },
  handler: async (ctx, { id, userId, userEmail }) => {
    const msg = await ctx.db.get(id);
    if (!msg) return;
    if (msg.userId !== userId && userEmail !== DEVELOPER_EMAIL) return;
    await ctx.db.patch(id, { deleted: true, message: "This message was deleted" });
  },
});

export const getMessages = query({
  args: { cursor: v.optional(v.string()) },
  handler: async (ctx, { cursor }) => {
    const result = await ctx.db
      .query("globalChat")
      .order("desc")
      .paginate({ numItems: 50, cursor: cursor ?? null });
    return {
      messages: result.page.reverse(),
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});
