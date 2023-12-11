import { Context } from 'grammy';
import { bot, db } from "../index.js";
import { escape } from "../shared.js";
import { info } from '../logger.js';

var cooldowns = new Map();
var cooldown_per_user = process.env.cd ? Number(process.env.cd) : 15000 

export default async function(ctx : Context) {
    var time = Date.now()
    var cooldown = cooldowns.get(ctx.message.from.id)
    if (cooldown > time) {
        var message = await ctx.reply(`⏱️ КУЛДАУН: осталось ${Number((cooldown - time) / 1000)}с.`)
        setTimeout(() => {
            bot.api.deleteMessage(message.chat.id, message.message_id)
            ctx.deleteMessage().catch((e) => console.log("can't delete"))
        }, 5000)
        return;
    }
    else if(cooldowns.has(ctx.message.from.id)) cooldowns.delete(ctx.message.from.id);
    cooldowns.set(ctx.message.from.id, Date.now() + cooldown_per_user)
    let users = (await db.ref(`chats/${ctx.update.message.chat.id}/members`).get()).val();
    let ignore_list = (await db.ref(`chats/${ctx.update.message.chat.id}/ignore_list`).get()).val();
    let picked_users_ids = [pick_member(ctx, users, ignore_list), pick_member(ctx, users, ignore_list)].sort()
    add_to_list(picked_users_ids, ctx.update.message.chat.id);
    let first_user = (await db.ref(`users/${picked_users_ids[0]}`).get()).val()
    let second_user = (await db.ref(`users/${picked_users_ids[1]}`).get()).val()
    await ctx.reply(`💞 РАНДОМ ШИП: <a href="tg://user?id=${picked_users_ids[0]}">${escape(first_user.fn)}</a> + <a href="tg://user?id=${picked_users_ids[1]}">${escape(second_user.fn)}</a>. Любите друг друга и берегите. Мур.`, {
        "parse_mode": "HTML"
    })
}

async function add_to_list(picked_users : Number[], chat_id : Number) {
    db.ref(`chats/${chat_id}/pairings`).transaction((snapshot) => {
        let dictionary = snapshot.val() != null ? snapshot.val() : {};
        let key = `${picked_users[0]}+${picked_users[1]}`;
        if (key in dictionary) dictionary[key] += 1;
        else dictionary[key] = 1;
        return dictionary;
    })
}

function pick_member(ctx : Context, users : Number[], ignore_list : Number[] | null) {
    let member : Number
    let attempts = 0;
    do {
        attempts++;
        member = users[Math.round(Math.random() * (users.length - 1))]
    } while (ignore_list != null && ignore_list.includes(member) && attempts < 5)
    if(attempts >= 5) {
        member = ctx.message.from.id;
        info(`не удалось подобрать пользователя для шипа (${ctx.chat.id})`)
    }
    return member;
}