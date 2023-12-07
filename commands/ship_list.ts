import { Context } from 'grammy';
import { db } from "../index.js"

export default async function(ctx : Context) {
    let list = (await db.ref(`chats/${ctx.message.chat.id}/pairings`).get()).val()
    ctx.reply(JSON.stringify(list))
}