import { describe, expect, it } from 'vitest';
import { compileExpression, expressionToJavaScript, parametersAt, safeProject, sampleProject, validateProject } from '../src/model';

describe('expression evaluator', () => {
  it('evaluates supported variables, constants, powers, and functions', () => {
    const evaluate = compileExpression('a * sin(b * x) + c + cos(pi) + 2^3');
    expect(evaluate({ x: Math.PI / 2, a: 2, b: 1, c: 0.5 })).toBeCloseTo(9.5);
  });

  it('uses standard precedence for powers and unary values', () => {
    expect(compileExpression('2^3^2')({ x: 0, a: 0, b: 0, c: 0 })).toBe(512);
    expect(compileExpression('-x^2')({ x: 3, a: 0, b: 0, c: 0 })).toBe(-9);
    expect(compileExpression('(-x)^2')({ x: 3, a: 0, b: 0, c: 0 })).toBe(9);
    expect(compileExpression('2^-2')({ x: 0, a: 0, b: 0, c: 0 })).toBe(0.25);
    const exported = Function('x', 'a', 'b', 'c', `return ${expressionToJavaScript('-x^2 + sin(pi)')}`);
    expect(exported(3, 0, 0, 0)).toBeCloseTo(-9);
  });

  it('rejects incomplete saved parameter data', () => {
    const damaged = { ...sampleProject(), parameters: {} };
    expect(safeProject(damaged)).toBeNull();
    const valid = sampleProject();
    expect(safeProject(valid)).toEqual(valid);
  });

  it('rejects unknown symbols and executable input', () => {
    expect(() => compileExpression('window.alert(1)')).toThrow(/Unexpected|Unknown/);
    expect(() => compileExpression('secret + x')).toThrow(/Unknown symbol/);
  });
});

describe('animation semantics', () => {
  it('interpolates named intervals deterministically', () => {
    const project = sampleProject();
    const start = parametersAt(project, 0);
    const middle = parametersAt(project, 1.5);
    const end = parametersAt(project, 6);
    expect(start.a).toBeCloseTo(0.2);
    expect(middle.a).toBeCloseTo(1.1);
    expect(end.a).toBeCloseTo(2);
    expect(end.c).toBeCloseTo(0.8);
  });

  it('rejects overlapping intervals on one parameter', () => {
    const project = sampleProject();
    project.intervals.push({ ...project.intervals[0]!, id: 'overlap', name: 'Overlap', start: 2, end: 4 });
    expect(validateProject(project).join(' ')).toMatch(/overlap on a/i);
  });
});
