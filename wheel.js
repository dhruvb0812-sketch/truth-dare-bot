const { createCanvas } = require("canvas");

async function generateWheel(players) {

const size = 800;
const canvas = createCanvas(size,size);
const ctx = canvas.getContext("2d");

const center = size/2;
const radius = size/2;

const angle = (2*Math.PI)/players.length;

players.forEach((p,i)=>{

const start = i*angle;
const end = start+angle;

ctx.beginPath();
ctx.moveTo(center,center);
ctx.arc(center,center,radius,start,end);

ctx.fillStyle = i%2 ? "#ff7675":"#74b9ff";

ctx.fill();

ctx.save();

ctx.translate(center,center);
ctx.rotate(start+angle/2);

ctx.fillStyle="black";
ctx.font="24px Arial";

ctx.fillText(p.name,150,0);

ctx.restore();

});

ctx.beginPath();

ctx.moveTo(center-20,20);
ctx.lineTo(center+20,20);
ctx.lineTo(center,70);

ctx.fillStyle="red";
ctx.fill();

return canvas.toBuffer();

}

module.exports = { generateWheel };
