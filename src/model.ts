export type ParamKey = 'a' | 'b' | 'c';
export type Easing = 'linear' | 'smooth' | 'hold';

export interface Parameter {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

export interface Interval {
  id: string;
  name: string;
  parameter: ParamKey;
  start: number;
  end: number;
  from: number;
  to: number;
  easing: Easing;
}

export interface FigureProject {
  version: 1;
  title: string;
  formula: string;
  formulaLabel: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  duration: number;
  fps: number;
  parameters: Record<ParamKey, Parameter>;
  intervals: Interval[];
}

export const sampleProject = (): FigureProject => ({
  version: 1,
  title: 'A wave gathers amplitude',
  formula: 'a * sin(b * x) + c',
  formulaLabel: 'y = a · sin(bx) + c',
  xMin: -6.28,
  xMax: 6.28,
  yMin: -3,
  yMax: 3,
  duration: 6,
  fps: 30,
  parameters: {
    a: { label: 'Amplitude', value: 0.5, min: 0, max: 2.5, step: 0.1 },
    b: { label: 'Frequency', value: 1, min: 0.25, max: 3, step: 0.05 },
    c: { label: 'Offset', value: 0, min: -2, max: 2, step: 0.1 }
  },
  intervals: [
    { id: crypto.randomUUID(), name: 'Reveal amplitude', parameter: 'a', start: 0, end: 3, from: 0.2, to: 2, easing: 'smooth' },
    { id: crypto.randomUUID(), name: 'Lift the baseline', parameter: 'c', start: 3.2, end: 5.4, from: 0, to: 0.8, easing: 'linear' }
  ]
});

export const blankProject = (): FigureProject => ({
  ...sampleProject(),
  title: 'Untitled figure',
  formula: 'a * x + c',
  formulaLabel: 'y = ax + c',
  xMin: -5,
  xMax: 5,
  yMin: -5,
  yMax: 5,
  duration: 5,
  intervals: []
});

type Vars = Record<'x' | ParamKey, number>;
type Node = { evaluate: (vars: Vars) => number; source: string };
type Token = { kind: 'number' | 'name' | 'op' | 'eof'; value: string };

const functions: Record<string, (...values: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  abs: Math.abs,
  sqrt: Math.sqrt,
  exp: Math.exp,
  log: Math.log,
  ln: Math.log,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  min: Math.min,
  max: Math.max,
  pow: Math.pow
};

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  while (cursor < source.length) {
    const rest = source.slice(cursor);
    const whitespace = rest.match(/^\s+/);
    if (whitespace) { cursor += whitespace[0].length; continue; }
    const number = rest.match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
    if (number) { tokens.push({ kind: 'number', value: number[0] }); cursor += number[0].length; continue; }
    const name = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (name) { tokens.push({ kind: 'name', value: name[0].toLowerCase() }); cursor += name[0].length; continue; }
    const char = source[cursor];
    if (char && '+-*/^(),'.includes(char)) { tokens.push({ kind: 'op', value: char }); cursor++; continue; }
    throw new Error(`Unexpected “${char ?? ''}” at character ${cursor + 1}.`);
  }
  tokens.push({ kind: 'eof', value: '' });
  return tokens;
}

class Parser {
  private index = 0;
  constructor(private readonly tokens: Token[]) {}
  private current(): Token { return this.tokens[this.index] ?? { kind: 'eof', value: '' }; }
  private take(value?: string): Token {
    const token = this.current();
    if (value && token.value !== value) throw new Error(`Expected “${value}”.`);
    this.index++;
    return token;
  }
  parse(): Node {
    const node = this.expression();
    if (this.current().kind !== 'eof') throw new Error(`Unexpected “${this.current().value}”.`);
    return node;
  }
  private expression(): Node {
    let left = this.term();
    while (['+', '-'].includes(this.current().value)) {
      const operator = this.take().value;
      const right = this.term();
      const prior = left;
      left = { evaluate: operator === '+' ? vars => prior.evaluate(vars) + right.evaluate(vars) : vars => prior.evaluate(vars) - right.evaluate(vars), source: `(${prior.source}${operator}${right.source})` };
    }
    return left;
  }
  private term(): Node {
    let left = this.power();
    while (['*', '/'].includes(this.current().value)) {
      const operator = this.take().value;
      const right = this.power();
      const prior = left;
      left = { evaluate: operator === '*' ? vars => prior.evaluate(vars) * right.evaluate(vars) : vars => prior.evaluate(vars) / right.evaluate(vars), source: `(${prior.source}${operator}${right.source})` };
    }
    return left;
  }
  private power(): Node {
    let left = this.unary();
    if (this.current().value === '^') {
      this.take('^');
      const right = this.power();
      const prior = left;
      left = { evaluate: vars => Math.pow(prior.evaluate(vars), right.evaluate(vars)), source: `Math.pow(${prior.source},${right.source})` };
    }
    return left;
  }
  private unary(): Node {
    if (this.current().value === '+') { this.take('+'); return this.unary(); }
    if (this.current().value === '-') { this.take('-'); const value = this.unary(); return { evaluate: vars => -value.evaluate(vars), source: `(-${value.source})` }; }
    return this.primary();
  }
  private primary(): Node {
    const token = this.current();
    if (token.kind === 'number') { this.take(); const value = Number(token.value); return { evaluate: () => value, source: String(value) }; }
    if (token.value === '(') { this.take('('); const value = this.expression(); this.take(')'); return value; }
    if (token.kind === 'name') {
      const name = this.take().value;
      if (this.current().value === '(') {
        const operation = functions[name];
        if (!operation) throw new Error(`Unknown function “${name}”.`);
        this.take('(');
        const args: Node[] = [];
        if (this.current().value !== ')') {
          args.push(this.expression());
          while (this.current().value === ',') { this.take(','); args.push(this.expression()); }
        }
        this.take(')');
        if (args.length === 0) throw new Error(`Function “${name}” needs a value.`);
        const scriptName = name === 'ln' ? 'log' : name;
        return { evaluate: vars => operation(...args.map(arg => arg.evaluate(vars))), source: `Math.${scriptName}(${args.map(arg => arg.source).join(',')})` };
      }
      if (name === 'pi') return { evaluate: () => Math.PI, source: 'Math.PI' };
      if (name === 'e') return { evaluate: () => Math.E, source: 'Math.E' };
      if (['x', 'a', 'b', 'c'].includes(name)) return { evaluate: vars => vars[name as keyof Vars], source: name };
      throw new Error(`Unknown symbol “${name}”. Use x, a, b, c, pi, or a supported function.`);
    }
    throw new Error(token.kind === 'eof' ? 'The equation is incomplete.' : `Unexpected “${token.value}”.`);
  }
}

export function compileExpression(source: string): (vars: Vars) => number {
  if (!source.trim()) throw new Error('Enter an equation to draw.');
  return new Parser(tokenize(source)).parse().evaluate;
}

export function expressionToJavaScript(source: string): string {
  if (!source.trim()) throw new Error('Enter an equation to draw.');
  return new Parser(tokenize(source)).parse().source;
}

export function ease(value: number, easing: Easing): number {
  const t = Math.max(0, Math.min(1, value));
  if (easing === 'hold') return t >= 1 ? 1 : 0;
  if (easing === 'smooth') return t * t * (3 - 2 * t);
  return t;
}

export function parametersAt(project: FigureProject, time: number): Record<ParamKey, number> {
  const values: Record<ParamKey, number> = {
    a: project.parameters.a.value,
    b: project.parameters.b.value,
    c: project.parameters.c.value
  };
  for (const interval of [...project.intervals].sort((a, b) => a.start - b.start)) {
    if (time < interval.start) continue;
    const progress = ease((time - interval.start) / (interval.end - interval.start), interval.easing);
    values[interval.parameter] = interval.from + (interval.to - interval.from) * progress;
  }
  return values;
}

export function validateProject(project: FigureProject): string[] {
  const errors: string[] = [];
  if (!project.title.trim()) errors.push('Give the figure a title.');
  if (!(project.xMin < project.xMax) || !(project.yMin < project.yMax)) errors.push('Each plot minimum must be less than its maximum.');
  if (!(project.duration >= 1 && project.duration <= 60)) errors.push('Duration must be between 1 and 60 seconds.');
  if (!(project.fps >= 1 && project.fps <= 60)) errors.push('Frame rate must be between 1 and 60 fps.');
  try { compileExpression(project.formula); } catch (error) { errors.push((error as Error).message); }
  for (const interval of project.intervals) {
    if (!interval.name.trim()) errors.push('Every interval needs a name.');
    if (interval.start < 0 || interval.end > project.duration || interval.end <= interval.start) errors.push(`“${interval.name || 'Untitled interval'}” must sit inside the deck and end after it starts.`);
  }
  for (const key of ['a', 'b', 'c'] as ParamKey[]) {
    const tracks = project.intervals.filter(item => item.parameter === key).sort((a, b) => a.start - b.start);
    for (let index = 1; index < tracks.length; index++) {
      const previous = tracks[index - 1];
      const current = tracks[index];
      if (previous && current && current.start < previous.end) errors.push(`Intervals “${previous.name}” and “${current.name}” overlap on ${key}.`);
    }
  }
  return [...new Set(errors)];
}

export function safeProject(value: unknown): FigureProject | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<FigureProject>;
  if (candidate.version !== 1 || !candidate.parameters || !Array.isArray(candidate.intervals)) return null;
  try {
    const clone = structuredClone(candidate) as FigureProject;
    return validateProject(clone).some(error => error.includes('incomplete')) ? null : clone;
  } catch { return null; }
}
