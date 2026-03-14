const TelegramBot = require("node-telegram-bot-api");
const { generateWheel } = require("./wheel");
const express = require("express");
const https = require("https");

/* ---------------- KEEP ALIVE SERVER ---------------- */

const app = express();

app.get("/", (req,res)=>{
res.send("Bot Running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("Keep alive server running");
});

/* ---------------- SELF PING SYSTEM ---------------- */

const RENDER_URL = "https://truth-dare-bot-1-5r5d.onrender.com/";

setInterval(()=>{

https.get(RENDER_URL,(res)=>{

console.log("Self ping:",res.statusCode);

}).on("error",(e)=>{

console.log("Ping failed");

});

},300000);
/* ---------------- TELEGRAM BOT ---------------- */

const bot = new TelegramBot(process.env.BOT_TOKEN,{
polling:{
autoStart:true,
interval:300,
params:{timeout:10}
}
});

const OWNER="https://t.me/akz_sovereign";
const BOT_USERNAME="pixel_truth_dare_bot";

let games={};

/* ---------------- UTILITY ---------------- */

async function deleteCommand(msg){
try{
await bot.deleteMessage(msg.chat.id,msg.message_id);
}catch(e){}
}

async function isAdmin(chatId,userId){

const admins=await bot.getChatAdministrators(chatId);

return admins.some(a=>a.user.id===userId);

}

/* ---------------- START MESSAGE ---------------- */

bot.onText(/\/start/,async(msg)=>{

const chatId=msg.chat.id;

if(msg.chat.type==="private"){

bot.sendPhoto(chatId,"./images/welcome.jpg",{

caption:`🤖 *ULTIMATE TRUTH & DARE BOT*

🎮 Make your group games more fun

🎡 Spin the wheel  
👥 Add players  
🏆 Random turns
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

/* ---------------- RUN GAME ---------------- */

bot.onText(/\/run/,async(msg)=>{

await deleteCommand(msg);

const chatId=msg.chat.id;

if(games[chatId]){
return bot.sendMessage(chatId,"⚠ Game already running");
}

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

/* ---------------- CONTROL PANEL ---------------- */

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

/* ---------------- END GAME ---------------- */

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

/* ---------------- BUTTON SYSTEM ---------------- */

bot.on("callback_query",async(q)=>{

bot.answerCallbackQuery(q.id);

const chatId=q.message.chat.id;
const user=q.from;

if(!games[chatId]) return;

let players=games[chatId].participants;

/* JOIN */

if(q.data==="add"){

if(players.find(p=>p.id===user.id)){
return;
}

players.push({
id:user.id,
name:user.first_name
});

bot.sendMessage(chatId,
`⚡ *${user.first_name} joined the arena*

👥 Players: ${players.length}`,
{parse_mode:"Markdown"});

}

/* LEAVE */

if(q.data==="remove"){

games[chatId].participants=
players.filter(p=>p.id!==user.id);

bot.sendMessage(chatId,
`❌ ${user.first_name} left the game`);

}

/* LIST */

if(q.data==="list"){

if(players.length===0){
return bot.sendMessage(chatId,"⚠ No players yet");
}

let text="👥 *PLAYERS*\n\n";

players.forEach((p,i)=>{
text+=`${i+1}. ${p.name}\n`;
});

bot.sendMessage(chatId,text,{parse_mode:"Markdown"});

}

/* SPIN */

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

const wheel=await generateWheel(players,bot);

bot.sendPhoto(chatId,wheel,{
caption:`🎡 *WHEEL RESULT*

🔥 *${winner.name}*

Your turn!`,
parse_mode:"Markdown"
});

},3000);

}

/* RESTART */

if(q.data==="restart"){

games[chatId]={participants:[]};

bot.sendMessage(chatId,"🔄 Game restarted");

}

/* FORCE END */

if(q.data==="force_end"){

delete games[chatId];

bot.sendMessage(chatId,"🛑 Game force ended");

}

});
