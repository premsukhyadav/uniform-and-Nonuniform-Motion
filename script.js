// Simple simulation & plotting for uniform vs non-uniform motion

// DOM
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const tMaxInput = document.getElementById('tMax');
const dtInput = document.getElementById('dt');

const simCanvas = document.getElementById('simCanvas');
const sctx = simCanvas.getContext('2d');

const posCanvas = document.getElementById('posGraph');
const pctx = posCanvas.getContext('2d');

const velCanvas = document.getElementById('velGraph');
const vctx = velCanvas.getContext('2d');

// Parameters (defaults)
let t = 0;
let tMax = parseFloat(tMaxInput.value) || 12;
let dt = parseFloat(dtInput.value) || 0.05;

let intervalId = null;

function acceleration(t){
  return 1.0 + 0.8 * Math.sin(0.6 * t);
}

function reset(){
  t = 0;
  tMax = parseFloat(tMaxInput.value) || 12;
  dt = parseFloat(dtInput.value) || 0.05;
  if(intervalId) { clearInterval(intervalId); intervalId = null; }
  clearCanvas(sctx, simCanvas);
  clearCanvas(pctx, posCanvas);
  clearCanvas(vctx, velCanvas);
}

function clearCanvas(ctx, canvas){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // draw baseline
  ctx.fillStyle = "#000";
  ctx.font = "14px Arial";
}

function drawCar(ctx, x, color){
  // map x (meters) to canvas (clamp)
  const margin = 20;
  const maxDisplay = 200; // meters mapped to full width
  let px = margin + Math.min(x, maxDisplay) / maxDisplay * (simCanvas.width - 2*margin);
  ctx.fillStyle = color;
  ctx.fillRect(px, 40, 48, 24);
  // wheel
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.arc(px+10, 72, 4,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(px+38, 72, 4,0,Math.PI*2); ctx.fill();
}

function plotTwoSeries(ctx, canvas, tArr, seriesA, seriesB, labelA, labelB, yLabel){
  clearCanvas(ctx, canvas);

  // compute bounds
  const maxVal = Math.max(...seriesA.concat(seriesB)) || 1;
  const minVal = Math.min(...seriesA.concat(seriesB));
  const left = 60, right = canvas.width - 20, top = 20, bottom = canvas.height - 40;

  // axes
  ctx.strokeStyle = "#444"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, bottom); ctx.lineTo(right, bottom); ctx.stroke();

  // labels
  ctx.fillStyle = "#111"; ctx.font = "14px Arial";
  ctx.fillText(yLabel, 8, 20);
  ctx.fillText("Time (s)", canvas.width/2 - 30, canvas.height - 8);

  // helper to map
  function mapX(i){ return left + i/(tArr.length-1) * (right-left); }
  function mapY(val){ return bottom - ( (val - minVal) / (maxVal - minVal || 1) ) * (bottom - top); }

  // draw seriesA (blue)
  ctx.strokeStyle = "#1f6feb";
  ctx.beginPath();
  for(let i=0;i<tArr.length;i++){
    const x = mapX(i), y = mapY(seriesA[i]);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();

  // draw seriesB (red)
  ctx.strokeStyle = "#e03b3b";
  ctx.beginPath();
  for(let i=0;i<tArr.length;i++){
    const x = mapX(i), y = mapY(seriesB[i]);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();

  // legend
  ctx.fillStyle = "#1f6feb"; ctx.fillRect(right-150, top+6, 12, 12); ctx.fillStyle="#111"; ctx.fillText(labelA, right-130, top+16);
  ctx.fillStyle = "#e03b3b"; ctx.fillRect(right-150, top+28, 12, 12); ctx.fillStyle="#111"; ctx.fillText(labelB, right-130, top+38);
}

function startSimulation(){
  reset(); // clear and reset values
  // initial states
  let xU = 0;
  const vU = 15; // uniform v
  let xN = 0;
  let vN = 5;

  const tArr = [];
  const xUArr = [], xNA = [], vUArr = [], vNA = [], aNA = [];

  intervalId = setInterval(()=>{
    t += dt;

    // uniform
    xU += vU * dt;

    // non-uniform (Euler integration)
    const a = acceleration(t);
    vN += a * dt;
    xN += vN * dt;

    // store
    tArr.push(t);
    xUArr.push(xU);
    xNA.push(xN);
    vUArr.push(vU);
    vNA.push(vN);
    aNA.push(a);

    // draw animation
    clearCanvas(sctx, simCanvas);
    drawCar(sctx, xU, "#1f6feb");
    drawCar(sctx, xN, "#e03b3b");

    if(t >= tMax){
      clearInterval(intervalId);
      intervalId = null;
      // plot graphs
      plotTwoSeries(pctx, posCanvas, tArr, xUArr, xNA, "Uniform pos", "Non-uniform pos", "Position (m)");
      plotTwoSeries(vctx, velCanvas, tArr, vUArr, vNA, "Uniform vel", "Non-uniform vel", "Velocity (m/s)");
    }
  }, 30);
}

// wire buttons
startBtn.addEventListener('click', startSimulation);
resetBtn.addEventListener('click', reset);
