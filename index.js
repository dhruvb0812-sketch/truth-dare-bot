const TelegramBot = require("node-telegram-bot-api");
const { generateWheel } = require("./wheel");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const OWNER = "https://t.me/@akz_sovereign";
const BOT_USERNAME = "@pixel_truth_dare_bot";

let games = {};

async function isAdmin(chatId, userId) {
  const admins = await bot.getChatAdministrators(chatId);
  return admins.some(a => a.user.id === userId);
}

bot.onText(/\/start/, (msg) => {

const chatId = msg.chat.id;

if(msg.chat.type === "private"){

bot.sendPhoto(chatId,
"https://i.imgur.com/2yaf2wb.jpeg",
{
caption:
`🤖 *Ultimate Truth & Dare Wheel Bot*

This bot makes group games super fun 🎉

🎡 Spin the wheel
👥 Add participants
🏆 Random turn selector

Perfect for playing Truth & Dare in Telegram groups!`,
parse_mode:"Markdown",
reply_markup:{
inline_keyboard:[
[
{text:"👑 Owner",url:https://t.me/@akz_sovereign}
],
[
{text:"➕ Add To Your Group",
url:`https://t.me/${@pixel_truth_dare_bot}?startgroup=true`}
]
]
}
});

}

});

bot.onText(/\/run/, (msg)=>{

const chatId = msg.chat.id;

games[chatId] = { participants: [] };

bot.sendMessage(chatId,
`🎯 *WELCOME TO TRUTH & DARE BOT*

Add players and spin the wheel!`,
{
parse_mode:"Markdown",
reply_markup:{
inline_keyboard:[
[
{text:"➕ Add Me",callback_data:"add"},
{text:"➖ Remove Me",callback_data:"remove"}
],
[
{text:"👥 Participants",callback_data:"list"}
],
[
{text:"🎡 Spin Wheel",callback_data:"spin"}
]
]
}
});

});

bot.onText(/\/endgame/, async (msg)=>{

const chatId = msg.chat.id;
const userId = msg.from.id;

if(!games[chatId]){
return bot.sendMessage(chatId,"No game running.");
}

const admin = await isAdmin(chatId,userId);

if(!admin){
return bot.sendMessage(chatId,
"Only admins can end the game.");
}

delete games[chatId];

bot.sendMessage(chatId,
"🛑 Game ended successfully.");

});

bot.on("callback_query", async (q)=>{

const chatId = q.message.chat.id;
const user = q.from;

if(!games[chatId]) return;

let players = games[chatId].participants;

if(q.data === "add"){

if(players.find(p => p.id === user.id)){

return bot.answerCallbackQuery(q.id,{
text:"You already joined"
});

}

players.push({
id:user.id,
name:user.first_name
});

bot.sendMessage(chatId,
`✅ New participant added
👤 ${user.first_name}
🆔 ${user.id}`);

}

if(q.data === "remove"){

games[chatId].participants =
players.filter(p => p.id !== user.id);

bot.sendMessage(chatId,
`❌ ${user.first_name} left the game`);

}

if(q.data === "list"){

if(players.length === 0){
return bot.sendMessage(chatId,"No participants yet");
}

let text = "👥 *Participants*\n\n";

players.forEach((p,i)=>{
text += `${i+1}. ${p.name}\n`
})

bot.sendMessage(chatId,text,{parse_mode:"Markdown"});

}

if(q.data === "spin"){

const admin = await isAdmin(chatId,user.id);

if(!admin){

return bot.answerCallbackQuery(q.id,{
text:"Only admins can spin",
show_alert:true
});

}

if(players.length < 2){
return bot.sendMessage(chatId,
"Need at least 2 players");
}

const winner =
players[Math.floor(Math.random()*players.length)];

bot.sendAnimation(chatId,
"https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif");

setTimeout(async ()=>{

const wheel = await generateWheel(players);

bot.sendPhoto(chatId,wheel,{
caption:`🎯 *${winner.name}'s Turn*`,
parse_mode:"Markdown"
});

},3000)

}

});
