import { Context } from 'grammy';
import { db } from "../index.js";

export default async function(ctx : Context) {
    await db.ref(`chats/${ctx.update.message.chat.id}/ignore_list`).transaction(async (snapshot) => {
        let ignore_list = snapshot.val() != null ? snapshot.val() : [];
        if (ignore_list.includes(ctx.message.from.id)) {
            ignore_list.splice(ignore_list.indexOf(ctx.message.from.id), 1);
            ctx.reply("📛 ИГНОРИРОВАНИЕ: Теперь вы снова участвуете в пейрингах");
        } else {
            ignore_list.push(ctx.message.from.id);
            ctx.reply("📛 ИГНОРИРОВАНИЕ: Теперь вы больше не участвуете в пейрингах");
        }
        return ignore_list;
    })
}