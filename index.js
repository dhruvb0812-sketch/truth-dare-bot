const TelegramBot = require("node-telegram-bot-api");
const { generateWheel } = require("./wheel");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

let games = {};

async function isAdmin(chatId, userId) {
  const admins = await bot.getChatAdministrators(chatId);
  return admins.some(a => a.user.id === userId);
}

bot.onText(/\/run/, (msg) => {

  const chatId = msg.chat.id;

  games[chatId] = {
    participants: []
  };

  bot.sendMessage(chatId,
`🎯 WELCOME TO TRUTH & DARE BOT

Add participants and spin the wheel`,
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

bot.on("callback_query", async (q) => {

const chatId = q.message.chat.id;
const user = q.from;

if(!games[chatId]) return;

let players = games[chatId].participants;

if(q.data === "add"){

if(players.find(p => p.id === user.id)){

bot.answerCallbackQuery(q.id,{
text:"Already joined"
});

return;
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

let text = "👥 Participants\n\n";

players.forEach((p,i)=>{
text += `${i+1}. ${p.name}\n`
});

bot.sendMessage(chatId,text);

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
"Need at least 2 participants");
}

const winner =
players[Math.floor(Math.random()*players.length)];

bot.sendAnimation(chatId,
"https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif");

setTimeout(async ()=>{

const wheel = await generateWheel(players);

bot.sendPhoto(chatId,wheel,{
caption:`🎯 ${winner.name}'s Turn`
});

},3000)

}

});
