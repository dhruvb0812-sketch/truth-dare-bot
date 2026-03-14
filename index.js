const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const { generateWheel } = require("./wheel");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const OWNER = "https://t.me/akz_sovereign";
const BOT_USERNAME = "pixel_truth_dare_bot";

let games = {};

async function isAdmin(chatId, userId) {
  const admins = await bot.getChatAdministrators(chatId);
  return admins.some((a) => a.user.id === userId);
}

bot.onText(/\/start/, async (msg) => {

const chatId = msg.chat.id;

bot.sendPhoto(
chatId,
fs.createReadStream("./images/welcome.jpg"),
{
caption:`✨ *WELCOME TO THE ULTIMATE TRUTH & DARE BOT* ✨

🎡 Spin the wheel and let fate decide  
👥 Add your friends to the game  
🏆 Random player selector  

━━━━━━━━━━━━━━
*How To Play*

1️⃣ Add bot to your group  
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
{text:"➕ Add To Your Group",
url:`https://t.me/${BOT_USERNAME}?startgroup=true`}
],
[
{text:"🎮 How To Play",callback_data:"help"}
]
]
}
});
});

bot.onText(/\/run/, (msg) => {
  const chatId = msg.chat.id;

  games[chatId] = { participants: [] };

  bot.sendMessage(
    chatId,
    `🎯 *WELCOME TO TRUTH & DARE GAME*

Players click *Add Me* to join.`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "➕ Add Me", callback_data: "add" },
            { text: "➖ Remove Me", callback_data: "remove" },
          ],
          [{ text: "👥 Participants", callback_data: "list" }],
          [{ text: "🎡 Spin Wheel", callback_data: "spin" }],
        ],
      },
    }
  );
});

bot.onText(/\/endgame/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!games[chatId]) {
    return bot.sendMessage(chatId, "❌ No game running.");
  }

  const admin = await isAdmin(chatId, userId);

  if (!admin) {
    return bot.sendMessage(chatId, "⚠ Only admins can end the game.");
  }

  delete games[chatId];

  bot.sendMessage(chatId, "🛑 Game ended successfully.");
});

bot.on("callback_query", async (q) => {
  const chatId = q.message.chat.id;
  const user = q.from;

  if (q.data === "help") {
    return bot.sendMessage(
      chatId,
      `🎮 *HOW TO PLAY*

1️⃣ Add bot to group
2️⃣ Type /run
3️⃣ Players click ➕ Add Me
4️⃣ Admin presses 🎡 Spin Wheel

Use /endgame to stop the game`,
      { parse_mode: "Markdown" }
    );
  }

  if (!games[chatId]) return;

  let players = games[chatId].participants;

  if (q.data === "add") {
    if (players.find((p) => p.id === user.id)) {
      return bot.answerCallbackQuery(q.id, { text: "⚠ Already joined" });
    }

    players.push({ id: user.id, name: user.first_name });

    bot.sendMessage(
      chatId,
      `✅ New participant added
👤 ${user.first_name}
🆔 ${user.id}`
    );
  }

  if (q.data === "remove") {
    games[chatId].participants =
      players.filter((p) => p.id !== user.id);

    bot.sendMessage(
      chatId,
      `❌ ${user.first_name} left the game`
    );
  }

  if (q.data === "list") {
    if (players.length === 0) {
      return bot.sendMessage(chatId, "⚠ No participants yet");
    }

    let text = "👥 *Participants*\n\n";

    players.forEach((p, i) => {
      text += `${i + 1}. ${p.name}\n`;
    });

    bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  }

  if (q.data === "spin") {
    const admin = await isAdmin(chatId, user.id);

    if (!admin) {
      return bot.answerCallbackQuery(q.id, {
        text: "⚠ Only admins can spin",
        show_alert: true,
      });
    }

    if (players.length < 2) {
      return bot.sendMessage(chatId, "⚠ Need at least 2 players");
    }

    const winner =
      players[Math.floor(Math.random() * players.length)];

    bot.sendAnimation(
      chatId,
      "https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif"
    );

    setTimeout(async () => {
      const wheel = await generateWheel(players);

      bot.sendPhoto(chatId, wheel, {
        caption: `🎯 *${winner.name}'s Turn*`,
        parse_mode: "Markdown",
      });
    }, 3000);
  }
});
