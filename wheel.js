const { createCanvas } = require("canvas");

async function generateWheel(players){

const size = 500;
const canvas = createCanvas(size,size);
const ctx = canvas.getContext("2d");

const angle = (2*Math.PI)/players.length;

players.forEach((p,i)=>{

ctx.beginPath();
ctx.moveTo(size/2,size/2);
ctx.arc(size/2,size/2,size/2,i*angle,(i+1)*angle);
ctx.fillStyle=`hsl(${i*360/players.length},70%,60%)`;
ctx.fill();
ctx.stroke();

ctx.save();
ctx.translate(size/2,size/2);
ctx.rotate(i*angle+angle/2);
ctx.fillStyle="#000";
ctx.font="20px Arial";
ctx.fillText(p.name,150,10);
ctx.restore();

});

return canvas.toBuffer();

}

module.exports={generateWheel};
