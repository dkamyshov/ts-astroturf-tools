import * as ts from 'typescript';
import {
  getAssignmentsMetadata,
  AssignmentMetadata,
} from './getAssignmentsMetadata';

describe('getAssignmentsMetadata', () => {
  it('returns nothing if there are no assignments', () => {
    const sourceCode = `
      import * as React from 'react';

      export const A = ({children}) => <div>{children}</div>;
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    expect(getAssignmentsMetadata(sourceFile)).toEqual([]);
  });

  it('returns all assignments in a file', () => {
    const sourceCode = `
        import * as React from 'react';
        import { css } from 'astroturf';
  
        const { a } = css\`
          .a {
            color: red;
          }
        \`;

        const { b } = css\`
          .b {
            color: blue;
          }
        \`;

        export const A = ({children}) => <div className={a}>
          {children}
          <span className={b}>Some span</span>
        </div>;
      `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    const reference: AssignmentMetadata[] = [
      {
        availableIdentifiers: [
          {
            character: 10,
            from: 122,
            line: 5,
            name: 'a',
            to: 124,
          },
        ],
        bindingFrom: 99,
        bindingTo: 104,
        from: 99,
        requestedIdentifiers: [
          {
            character: 16,
            from: 101,
            line: 4,
            name: 'a',
            to: 102,
          },
        ],
        to: 172,
      },
      {
        availableIdentifiers: [
          {
            character: 10,
            from: 212,
            line: 11,
            name: 'b',
            to: 214,
          },
        ],
        bindingFrom: 189,
        bindingTo: 194,
        from: 189,
        requestedIdentifiers: [
          {
            character: 16,
            from: 191,
            line: 10,
            name: 'b',
            to: 192,
          },
        ],
        to: 263,
      },
    ];

    expect(getAssignmentsMetadata(sourceFile)).toEqual(reference);
  });

  it('does not include an assignment if tokens list is empty', () => {
    const sourceCode = `
        import * as React from 'react';
        import { css } from 'astroturf';
  
        const { a } = css\`\`;

        export const A = ({children}) => <div className={a}>
          {children}
        </div>;
      `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    const reference: AssignmentMetadata[] = [];

    expect(getAssignmentsMetadata(sourceFile)).toEqual(reference);
  });
});
