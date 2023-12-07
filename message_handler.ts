import ship from "./commands/ship.js";
import ship_list from "./commands/ship_list.js";
import ignore from "./commands/ignore.js";
import { bot, db } from "./index.js";
import { info } from "./logger.js";
import { Context } from "grammy"

async function handle_commands(ctx : Context) {
    switch(true) {
        case ctx.hasCommand("ship"): return await ship(ctx);
        case ctx.hasCommand("ship_list"): return await ship_list(ctx);
        case ctx.hasCommand("ignore"): return await ignore(ctx);
    }
}

bot.on("message", async (ctx : Context) => {
    await handle_commands(ctx)
    if(ctx.update.message.from.username == 'GroupAnonymousBot') return;
    db.ref(`users/${ctx.update.message.from.id}`).update({
        "un": ctx.update.message.from.username,
        "fn": ctx.update.message.from.first_name
    });
    db.ref(`chats/${ctx.update.message.chat.id}/members`).transaction(snapshot => {
        let members = snapshot.exists() ? snapshot.val() : [];
        if(!members.includes(ctx.update.message.from.id)) members.push(ctx.update.message.from.id)
        return members;
    });
})

