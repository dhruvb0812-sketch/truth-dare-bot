const TelegramBot = require("node-telegram-bot-api");
const { generateWheel } = require("./wheel");
const express = require("express");

const app = express();
app.get("/",(req,res)=>res.send("Bot running"));
app.listen(3000);

const bot = new TelegramBot(process.env.BOT_TOKEN,{polling:true});

const OWNER="https://t.me/akz_sovereign";
const BOT_USERNAME="pixel_truth_dare_bot";

let games={};

async function deleteCommand(msg){
try{
await bot.deleteMessage(msg.chat.id,msg.message_id);
}catch(e){}
}

async function isAdmin(chatId,userId){
const admins=await bot.getChatAdministrators(chatId);
return admins.some(a=>a.user.id===userId);
}

bot.onText(/\/start/,async(msg)=>{

const chatId=msg.chat.id;

if(msg.chat.type==="private"){

bot.sendPhoto(chatId,"./images/welcome.jpg",{

caption:`🤖 *ULTIMATE TRUTH & DARE BOT*

🎮 Start fun games in your group

🎡 Spin the wheel  
👥 Add players  
🏆 Random turns`,
━━━━━━━━━━━━━━
*How To Play*

1️⃣ Add the bot to your group  
2️⃣ Type /run  
3️⃣ Players click Add Me  
4️⃣ Admin spins the wheel 🎡

Let the chaos begin 😈`,
parse_mode:"Markdown",

reply_markup:{
inline_keyboard:[
[
{text:"👑 Owner",url:OWNER}
],
[
{text:"➕ Add To Group",url:`https://t.me/${BOT_USERNAME}?startgroup=true`}
]
]
}

});

}

});

bot.onText(/\/run/,async(msg)=>{

await deleteCommand(msg);

const chatId=msg.chat.id;

games[chatId]={participants:[]};

bot.sendMessage(chatId,
`🎮 *GAME STARTED*

Players join the arena!

👇 Tap to join`,
{
parse_mode:"Markdown",
reply_markup:{
inline_keyboard:[
[
{text:"➕ Join Game",callback_data:"add"},
{text:"➖ Leave",callback_data:"remove"}
],
[
{text:"👥 Players",callback_data:"list"}
],
[
{text:"🎡 Spin Wheel",callback_data:"spin"}
]
]
}
});

});

bot.onText(/\/insight/,async(msg)=>{

await deleteCommand(msg);

const chatId=msg.chat.id;

bot.sendMessage(chatId,
`⚙ *GAME CONTROL PANEL*

Manage the game`,
{
parse_mode:"Markdown",
reply_markup:{
inline_keyboard:[
[
{text:"🎡 Spin",callback_data:"spin"}
],
[
{text:"👥 Players",callback_data:"list"}
],
[
{text:"🔄 Restart Game",callback_data:"restart"}
],
[
{text:"🛑 End Game",callback_data:"force_end"}
]
]
}
});

});

bot.onText(/\/endgame/,async(msg)=>{

await deleteCommand(msg);

const chatId=msg.chat.id;
const userId=msg.from.id;

if(!games[chatId]){
return bot.sendMessage(chatId,"❌ No game running");
}

const admin=await isAdmin(chatId,userId);

if(!admin){
return bot.sendMessage(chatId,"⚠ Admin only command");
}

delete games[chatId];

bot.sendMessage(chatId,"🛑 Game ended");

});

bot.on("callback_query",async(q)=>{

const chatId=q.message.chat.id;
const user=q.from;

if(!games[chatId]) return;

let players=games[chatId].participants;

if(q.data==="add"){

if(players.find(p=>p.id===user.id)){
return bot.answerCallbackQuery(q.id,{text:"Already joined"});
}

players.push({id:user.id,name:user.first_name});

bot.sendMessage(chatId,
`⚡ *${user.first_name} joined the game*

👥 Players: ${players.length}`,
{parse_mode:"Markdown"});

}

if(q.data==="remove"){

games[chatId].participants=
players.filter(p=>p.id!==user.id);

bot.sendMessage(chatId,
`❌ ${user.first_name} left the game`);

}

if(q.data==="list"){

if(players.length===0){
return bot.sendMessage(chatId,"⚠ No players yet");
}

let text="👥 *PLAYERS*\n\n";

players.forEach((p,i)=>{
text+=`${i+1}. ${p.name}\n`
});

bot.sendMessage(chatId,text,{parse_mode:"Markdown"});

}

if(q.data==="spin"){

const admin=await isAdmin(chatId,user.id);

if(!admin){
return bot.answerCallbackQuery(q.id,{
text:"Admin only",
show_alert:true
});
}

if(players.length<2){
return bot.sendMessage(chatId,"⚠ Need at least 2 players");
}

const winner=
players[Math.floor(Math.random()*players.length)];

bot.sendAnimation(chatId,
"https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif");

setTimeout(async()=>{

const wheel=await generateWheel(players);

bot.sendPhoto(chatId,wheel,{
caption:`🎡 *WHEEL RESULT*

🔥 *${winner.name}*

Your turn!`,
parse_mode:"Markdown"
});

},3000)

}

if(q.data==="restart"){

games[chatId]={participants:[]};

bot.sendMessage(chatId,"🔄 Game restarted");

}

if(q.data==="force_end"){

delete games[chatId];

bot.sendMessage(chatId,"🛑 Game force ended");

}

});
