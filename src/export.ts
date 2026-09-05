import { expressionToJavaScript, type FigureProject } from './model';
import { drawPlotContext } from './plot';

function download(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'live-figure';
}

function safeFormulaForJavaScript(source: string): string {
  return expressionToJavaScript(source);
}

export function exportHtml(project: FigureProject): void {
  const data = JSON.stringify(project).replace(/</g, '\\u003c');
  const formula = JSON.stringify(safeFormulaForJavaScript(project.formula));
  const title = project.title.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);
  const label = project.formulaLabel.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Live Figure</title><style>
:root{color-scheme:dark;background:#080b14;color:#f4f7e9;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px}main{width:min(1100px,100%)}h1{font:600 clamp(22px,4vw,42px)/1.1 Inter,system-ui,sans-serif;margin:0 0 8px}.formula{color:#8cb4ff;margin:0 0 20px;font-size:clamp(16px,2.4vw,24px)}canvas{width:100%;height:min(65vh,620px);border:1px solid #293349;background:#080b14;display:block}.controls{display:flex;align-items:center;gap:16px;margin-top:16px}.controls button{min-width:96px;min-height:48px;border:1px solid #81f7c1;background:#81f7c1;color:#08251c;font:700 16px inherit}.controls input{flex:1;accent-color:#ff8f70}.time{min-width:12ch;text-align:right;font-variant-numeric:tabular-nums}.note{color:#b8c3bd;font:14px Inter,system-ui,sans-serif}button:focus-visible,input:focus-visible{outline:3px solid #ff8f70;outline-offset:3px}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}</style></head>
<body><main><h1>${title}</h1><p class="formula">${label}</p><canvas id="plot" role="img" aria-label="Animated plot for ${label}"></canvas><div class="controls"><button id="play">Play</button><input id="time" type="range" min="0" max="${project.duration * project.fps}" value="0" aria-label="Animation frame"><output class="time">0.00 s</output></div><p class="note">Space plays or pauses · arrows step one frame · exported from Live Figure Deck</p></main>
<script>
const p=${data}, expression=${formula}, canvas=document.querySelector('#plot'), ctx=canvas.getContext('2d'), input=document.querySelector('#time'), output=document.querySelector('output'), play=document.querySelector('#play');let frame=0,playing=false,startAt=0,startFrame=0;
const fn=Function('x','a','b','c','return ('+expression+')');
function ease(t,e){t=Math.max(0,Math.min(1,t));return e==='hold'?(t>=1?1:0):e==='smooth'?t*t*(3-2*t):t}
function params(time){const v={a:p.parameters.a.value,b:p.parameters.b.value,c:p.parameters.c.value};[...p.intervals].sort((x,y)=>x.start-y.start).forEach(i=>{if(time>=i.start)v[i.parameter]=i.from+(i.to-i.from)*ease((time-i.start)/(i.end-i.start),i.easing)});return v}
function draw(){const dpr=devicePixelRatio||1,w=Math.max(320,canvas.clientWidth*dpr|0),h=Math.max(220,canvas.clientHeight*dpr|0);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}const pad=42*dpr,pw=w-pad*2,ph=h-pad*2,mx=x=>pad+(x-p.xMin)/(p.xMax-p.xMin)*pw,my=y=>pad+(1-(y-p.yMin)/(p.yMax-p.yMin))*ph,t=frame/p.fps,v=params(t);ctx.fillStyle='#080b14';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#293349';ctx.lineWidth=dpr;ctx.setLineDash([2*dpr,5*dpr]);for(let i=0;i<=8;i++){let x=pad+pw*i/8,y=pad+ph*i/8;ctx.beginPath();ctx.moveTo(x,pad);ctx.lineTo(x,h-pad);ctx.stroke();ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke()}ctx.setLineDash([]);ctx.strokeStyle='#b8c3bd';if(p.xMin<=0&&p.xMax>=0){let x=mx(0);ctx.beginPath();ctx.moveTo(x,pad);ctx.lineTo(x,h-pad);ctx.stroke()}if(p.yMin<=0&&p.yMax>=0){let y=my(0);ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke()}ctx.beginPath();let on=false;for(let i=0;i<=pw;i++){let x=p.xMin+i/pw*(p.xMax-p.xMin),y=fn(x,v.a,v.b,v.c);if(!Number.isFinite(y)){on=false;continue}if(!on){ctx.moveTo(mx(x),my(y));on=true}else ctx.lineTo(mx(x),my(y))}ctx.strokeStyle='#81f7c1';ctx.lineWidth=2.5*dpr;ctx.shadowColor='#81f7c1';ctx.shadowBlur=8*dpr;ctx.stroke();ctx.shadowBlur=0;input.value=String(frame);output.value=t.toFixed(2)+' s';play.textContent=playing?'Pause':'Play'}
function tick(now){if(!playing)return;if(!startAt)startAt=now;frame=Math.min(p.duration*p.fps,startFrame+Math.floor((now-startAt)*p.fps/1000));if(frame>=p.duration*p.fps)playing=false;draw();if(playing)requestAnimationFrame(tick)}
play.onclick=()=>{playing=!playing;if(playing&&frame>=p.duration*p.fps)frame=0;startFrame=frame;startAt=0;draw();if(playing)requestAnimationFrame(tick)};input.oninput=()=>{frame=+input.value;playing=false;draw()};addEventListener('resize',draw);addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();play.click()}if(e.key==='ArrowRight'){frame=Math.min(p.duration*p.fps,frame+1);playing=false;draw()}if(e.key==='ArrowLeft'){frame=Math.max(0,frame-1);playing=false;draw()}});draw();
<\/script></body></html>`;
  download(new Blob([html], { type: 'text/html' }), `${slug(project.title)}.html`);
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index++) { let value = index; for (let bit = 0; bit < 8; bit++) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1; table[index] = value >>> 0; }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) crc = (crc >>> 8) ^ (crcTable[(crc ^ byte) & 0xff] ?? 0);
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStore(files: { name: string; data: Uint8Array }[]): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  const write16 = (view: DataView, at: number, value: number) => view.setUint16(at, value, true);
  const write32 = (view: DataView, at: number, value: number) => view.setUint32(at, value, true);
  for (const file of files) {
    const name = encoder.encode(file.name); const crc = crc32(file.data);
    const local = new Uint8Array(30 + name.length); const localView = new DataView(local.buffer);
    write32(localView, 0, 0x04034b50); write16(localView, 4, 20); write32(localView, 14, crc); write32(localView, 18, file.data.length); write32(localView, 22, file.data.length); write16(localView, 26, name.length); local.set(name, 30);
    localParts.push(local, file.data);
    const central = new Uint8Array(46 + name.length); const centralView = new DataView(central.buffer);
    write32(centralView, 0, 0x02014b50); write16(centralView, 4, 20); write16(centralView, 6, 20); write32(centralView, 16, crc); write32(centralView, 20, file.data.length); write32(centralView, 24, file.data.length); write16(centralView, 28, name.length); write32(centralView, 42, offset); central.set(name, 46); centralParts.push(central);
    offset += local.length + file.data.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22); const view = new DataView(end.buffer);
  write32(view, 0, 0x06054b50); write16(view, 8, files.length); write16(view, 10, files.length); write32(view, 12, centralSize); write32(view, 16, offset);
  return new Blob([...localParts, ...centralParts, end] as unknown as BlobPart[], { type: 'application/zip' });
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not encode a frame.')), 'image/png'));
}

export async function exportFramePack(project: FigureProject, progress: (done: number, total: number) => void): Promise<void> {
  const total = Math.round(project.duration * project.fps) + 1;
  if (total > 600) throw new Error(`This frame pack would contain ${total} images. Lower the duration or frame rate to export 600 images or fewer.`);
  const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
  const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas export is not available in this browser.');
  const files: { name: string; data: Uint8Array }[] = [];
  for (let frame = 0; frame < total; frame++) {
    context.fillStyle = '#080b14'; context.fillRect(0, 0, 1280, 720);
    context.fillStyle = '#f4f7e9'; context.font = '600 34px system-ui, sans-serif'; context.fillText(project.title, 56, 52);
    context.fillStyle = '#8cb4ff'; context.font = '22px ui-monospace, monospace'; context.fillText(project.formulaLabel || project.formula, 56, 86);
    context.save(); context.translate(0, 88); drawPlotContext(context, 1280, 632, project, frame / project.fps, 1); context.restore();
    const blob = await canvasBlob(canvas);
    files.push({ name: `frame-${String(frame).padStart(5, '0')}.png`, data: new Uint8Array(await blob.arrayBuffer()) });
    progress(frame + 1, total);
    if (frame % 6 === 0) await new Promise(resolve => setTimeout(resolve, 0));
  }
  const manifest = new TextEncoder().encode(JSON.stringify({ title: project.title, fps: project.fps, frames: total, duration: project.duration, command: `ffmpeg -framerate ${project.fps} -i frame-%05d.png -c:v libx264 -pix_fmt yuv420p figure.mp4` }, null, 2));
  files.push({ name: 'manifest.json', data: manifest });
  download(zipStore(files), `${slug(project.title)}-frames.zip`);
}
