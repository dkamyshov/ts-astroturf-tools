import * as ts from 'typescript';
import { getIdentifiers } from './getIdentifiers';

describe('getIdentifiers', () => {
  it('throws is no css tokens were found', () => {
    const sourceCode = `
      const { a } = css\`\`;
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    expect(() => getIdentifiers(sourceFile)).toThrow();
  });

  it('throws if reassignment is used', () => {
    const sourceCode = `
      const { a: b } = css\` .a { color: #aaa; } \`;
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    expect(() => getIdentifiers(sourceFile)).toThrow();
  });

  it('throws if multi-level destructuring is used', () => {
    const sourceCode = `
      const { a: { length } } = css\` .a { color: #aaa; } \`;
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    expect(() => getIdentifiers(sourceFile)).toThrow();
  });

  it('returns nothing if there are no css assignments in this file', () => {
    const sourceCode = `
      const a = 1;
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    const identifiers = getIdentifiers(sourceFile);

    expect(identifiers.length).toBe(0);
  });

  it('returns identifiers', () => {
    const sourceCode = `
      const { a } = css\` .a { color: #aaa; } .b { color: #bbb; } \`; 
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    const identifiers = getIdentifiers(sourceFile);

    expect(identifiers.length).toBe(1);

    const firstResult = identifiers[0];

    expect(firstResult.available).toEqual(['a', 'b']);
    expect(firstResult.requested.length).toEqual(1);
  });
});
