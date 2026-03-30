import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

export const removeReactionsField = internalMutation({
  handler: async (ctx) => {
    const chats = await ctx.db.query("globalChat").collect();
    let migratedCount = 0;

    for (const chat of chats) {
      if ("reactions" in chat) {
        const { reactions, ...rest } = chat;
        await ctx.db.replace(chat._id, rest);
        migratedCount++;
      }
    }

    console.log(`Migrated ${migratedCount} documents in globalChat.`);
  },
});
