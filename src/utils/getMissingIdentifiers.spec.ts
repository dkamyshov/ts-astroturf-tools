import * as ts from 'typescript';
import { getMissingIdentifiers } from './getMissingIdentifiers';
import { getIdentifiers } from './getIdentifiers';

describe('getMissingIdentifiers', () => {
  it('returns identifiers', () => {
    const sourceCode = `
      const { a, b } = css\` .a { color: #aaa; } \`; 
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    const identifiers = getMissingIdentifiers(
      getIdentifiers(sourceFile),
      sourceFile
    );

    expect(identifiers.length).toBe(1);

    const firstResult = identifiers[0];

    expect(firstResult.getText(sourceFile)).toBe('b');
  });
});
