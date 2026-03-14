const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN,{polling:true});

let games = {};

bot.onText(/\/run/, (msg)=>{

const chatId = msg.chat.id;

games[chatId] = {participants:[]};

bot.sendMessage(chatId,
"🎯 WELCOME TO TRUTH AND DARE BOT\n\nAdd players and spin the wheel!",
{
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

bot.on("callback_query",(q)=>{

const chatId = q.message.chat.id;
const user = q.from;

if(!games[chatId]) return;

let list = games[chatId].participants;

if(q.data==="add"){

if(!list.find(p=>p.id===user.id)){

list.push({id:user.id,name:user.first_name});

bot.sendMessage(chatId,
`✅ New participant added\n👤 ${user.first_name}\n🆔 ${user.id}`
);

}

}

if(q.data==="remove"){

games[chatId].participants =
list.filter(p=>p.id!==user.id);

bot.sendMessage(chatId,"❌ Participant removed");

}

if(q.data==="list"){

let text="👥 Participants\n\n";

games[chatId].participants.forEach((p,i)=>{
text+=`${i+1}. ${p.name}\n`
})

bot.sendMessage(chatId,text);

}

if(q.data==="spin"){

let players = games[chatId].participants;

if(players.length<2){

return bot.sendMessage(chatId,"Need at least 2 players")

}

const winner = players[Math.floor(Math.random()*players.length)];

bot.sendAnimation(chatId,"https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif");

setTimeout(()=>{

bot.sendMessage(chatId,`🎯 ${winner.name}'s Turn`)

},3000)

}

})
