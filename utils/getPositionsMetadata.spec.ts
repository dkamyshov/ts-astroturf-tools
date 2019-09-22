import * as ts from 'typescript';
import { getPositionsMetadata } from './getPositionsMetadata';

describe('getPositionsMetadata', () => {
  it('returns positions metadata', () => {
    const sourceCode = `
      const { a } = css\` .a { color: #aaa; } .b { color: #bbb; } \`;
      const { c } = css\` .c { color: #ccc; } \`;
      const d = css\` .d { color: #ddd; } \`;
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    const positionsMetadata = getPositionsMetadata(sourceFile);

    expect(positionsMetadata).toEqual([
      {
        from: 13,
        to: 18,
        available: ['b'],
      },
      {
        from: 81,
        to: 86,
        available: [],
      },
    ]);
  });

  it('fails to parse empty / weird css', () => {
    const sourceCode = `
      const { a } = css\` a { color: #aaa; } \`;
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    expect(() => getPositionsMetadata(sourceFile)).toThrow();
  });
});
