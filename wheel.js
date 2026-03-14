const { createCanvas, loadImage } = require("canvas");

async function generateWheel(players, bot){

const size = 700;
const canvas = createCanvas(size,size);
const ctx = canvas.getContext("2d");

const center = size/2;
const radius = size/2;

const angle = (2*Math.PI)/players.length;

for(let i=0;i<players.length;i++){

const p = players[i];

ctx.beginPath();
ctx.moveTo(center,center);

ctx.arc(center,center,radius,i*angle,(i+1)*angle);

ctx.fillStyle=`hsl(${i*360/players.length},70%,60%)`;
ctx.fill();

ctx.save();

ctx.translate(center,center);
ctx.rotate(i*angle+angle/2);

let photoURL = null;

try{

const photos = await bot.getUserProfilePhotos(p.id, {limit:1});

if(photos.total_count>0){

const fileId = photos.photos[0][0].file_id;
const file = await bot.getFile(fileId);

photoURL = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

}

}catch(e){}

if(photoURL){

try{

const img = await loadImage(photoURL);

ctx.save();

ctx.beginPath();
ctx.arc(180,0,40,0,Math.PI*2);
ctx.closePath();
ctx.clip();

ctx.drawImage(img,140,-40,80,80);

ctx.restore();

}catch(e){}

}

ctx.fillStyle="#000";
ctx.font="18px Arial";
ctx.fillText(p.name,140,70);

ctx.restore();

}

return canvas.toBuffer();

}

module.exports={generateWheel};
