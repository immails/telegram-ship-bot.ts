import { Context } from 'grammy';
import { db } from "../index.js"
import { bot_user, escape } from '../shared.js';

export default async function(ctx : Context) {
    let list = (await db.ref(`chats/${ctx.message.chat.id}/pairings`).get()).val()
    if(list == null) list = {};
    let list_keys : String[] = Object.keys(list);
    let nicknames_to_request : String[] = []
    for(let pair of list_keys) {
        let pair_ids = pair.split("+");
        if(!nicknames_to_request.includes(pair_ids[0])) nicknames_to_request.push(pair_ids[0])
        if(!nicknames_to_request.includes(pair_ids[1])) nicknames_to_request.push(pair_ids[1])
    }
    let nickname_map : Map<String, String> = new Map();
    for(let userid of nicknames_to_request) {
        let nickname : bot_user = (await db.ref(`users/${userid}`).get()).val();
        nickname_map.set(userid, nickname.fn);
    }
    
    let entries : [string, number][] = Object.entries(list);
    let pairings = entries.sort((a, b) => {
        return b[1] - a[1]
    });
    let text : String[] = [];
    let i = 0;
    for(let [key, value] of pairings) {
        i++;
        let members = key.split("+");
        text.push(`${i}. ${escape(nickname_map.get(members[0]))} + ${escape(nickname_map.get(members[1]))} — ${value}`)
    }

    ctx.reply("💞 СПИСОК ПЕЙРИНГОВ:\n" + text.join("\n"), {"parse_mode": "HTML"})
}