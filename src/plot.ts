import { compileExpression, parametersAt, type FigureProject } from './model';

export interface PlotResult {
  finitePoints: number;
  minimum: number;
  maximum: number;
}

const colors = { background: '#080b14', grid: '#293349', axis: '#b8c3bd', curve: '#81f7c1', playhead: '#ff8f70' };

export function drawPlot(canvas: HTMLCanvasElement, project: FigureProject, time: number, scale = devicePixelRatio): PlotResult {
  const cssWidth = canvas.clientWidth || 900;
  const cssHeight = canvas.clientHeight || 560;
  const width = Math.max(320, Math.round(cssWidth * scale));
  const height = Math.max(220, Math.round(cssHeight * scale));
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  const context = canvas.getContext('2d');
  if (!context) return { finitePoints: 0, minimum: 0, maximum: 0 };
  return drawPlotContext(context, width, height, project, time, scale);
}

export function drawPlotContext(context: CanvasRenderingContext2D, width: number, height: number, project: FigureProject, time: number, scale = 1): PlotResult {
  const pad = 42 * scale;
  const plotWidth = width - pad * 2;
  const plotHeight = height - pad * 2;
  const mapX = (x: number) => pad + ((x - project.xMin) / (project.xMax - project.xMin)) * plotWidth;
  const mapY = (y: number) => pad + (1 - (y - project.yMin) / (project.yMax - project.yMin)) * plotHeight;
  context.fillStyle = colors.background;
  context.fillRect(0, 0, width, height);
  context.lineWidth = scale;
  context.strokeStyle = colors.grid;
  context.setLineDash([2 * scale, 5 * scale]);
  for (let index = 0; index <= 8; index++) {
    const x = pad + (plotWidth * index) / 8;
    const y = pad + (plotHeight * index) / 8;
    context.beginPath(); context.moveTo(x, pad); context.lineTo(x, height - pad); context.stroke();
    context.beginPath(); context.moveTo(pad, y); context.lineTo(width - pad, y); context.stroke();
  }
  context.setLineDash([]);
  context.strokeStyle = colors.axis;
  context.globalAlpha = 0.7;
  if (project.xMin <= 0 && project.xMax >= 0) { const axisX = mapX(0); context.beginPath(); context.moveTo(axisX, pad); context.lineTo(axisX, height - pad); context.stroke(); }
  if (project.yMin <= 0 && project.yMax >= 0) { const axisY = mapY(0); context.beginPath(); context.moveTo(pad, axisY); context.lineTo(width - pad, axisY); context.stroke(); }
  context.globalAlpha = 1;
  const evaluate = compileExpression(project.formula);
  const params = parametersAt(project, time);
  let minimum = Infinity;
  let maximum = -Infinity;
  let finitePoints = 0;
  let drawing = false;
  context.beginPath();
  for (let pixel = 0; pixel <= Math.round(plotWidth); pixel++) {
    const x = project.xMin + (pixel / plotWidth) * (project.xMax - project.xMin);
    const y = evaluate({ x, ...params });
    if (!Number.isFinite(y) || y < project.yMin - (project.yMax - project.yMin) * 2 || y > project.yMax + (project.yMax - project.yMin) * 2) { drawing = false; continue; }
    finitePoints++;
    minimum = Math.min(minimum, y); maximum = Math.max(maximum, y);
    const px = mapX(x); const py = mapY(y);
    if (!drawing) { context.moveTo(px, py); drawing = true; } else context.lineTo(px, py);
  }
  context.strokeStyle = colors.curve;
  context.lineWidth = 2.5 * scale;
  context.shadowColor = colors.curve;
  context.shadowBlur = 8 * scale;
  context.stroke();
  context.shadowBlur = 0;
  context.fillStyle = colors.axis;
  context.font = `${11 * scale}px ui-monospace, monospace`;
  context.textAlign = 'left'; context.fillText(project.xMin.toPrecision(3), pad, height - 16 * scale);
  context.textAlign = 'right'; context.fillText(project.xMax.toPrecision(3), width - pad, height - 16 * scale);
  context.textAlign = 'left'; context.fillText(project.yMax.toPrecision(3), 8 * scale, pad + 4 * scale);
  context.fillStyle = colors.playhead;
  context.fillRect(pad, height - 7 * scale, plotWidth * Math.max(0, Math.min(1, time / project.duration)), 2 * scale);
  return { finitePoints, minimum: finitePoints ? minimum : 0, maximum: finitePoints ? maximum : 0 };
}

export function chartDescription(project: FigureProject, result: PlotResult, time: number): string {
  const params = parametersAt(project, time);
  if (!result.finitePoints) return `Plot of ${project.formulaLabel || project.formula}. No finite values are visible in the current window.`;
  return `Plot of ${project.formulaLabel || project.formula} from x ${project.xMin} to ${project.xMax}. At ${time.toFixed(2)} seconds: a ${params.a.toFixed(2)}, b ${params.b.toFixed(2)}, c ${params.c.toFixed(2)}. Visible sampled y values range from ${result.minimum.toFixed(2)} to ${result.maximum.toFixed(2)}.`;
}
