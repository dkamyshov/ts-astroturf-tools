import * as ts from 'typescript';
import {
  AssignmentMetadata,
  getAssignmentsMetadata,
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

    expect(getAssignmentsMetadata(sourceFile, ts)).toEqual([]);
  });

  it('returns all assignments in a file', () => {
    const sourceCode = `
        import * as React from 'react';
        import { stylesheet } from 'astroturf';
  
        const { a } = stylesheet\`
          .a {
            color: red;
          }
        \`;

        const { b } = stylesheet\`
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
            from: 136,
            line: 5,
            name: 'a',
            to: 138,
          },
        ],
        bindingFrom: 106,
        bindingTo: 111,
        from: 106,
        requestedIdentifiers: [
          {
            character: 16,
            from: 108,
            line: 4,
            name: 'a',
            to: 109,
          },
        ],
        to: 186,
      },
      {
        availableIdentifiers: [
          {
            character: 10,
            from: 233,
            line: 11,
            name: 'b',
            to: 235,
          },
        ],
        bindingFrom: 203,
        bindingTo: 208,
        from: 203,
        requestedIdentifiers: [
          {
            character: 16,
            from: 205,
            line: 10,
            name: 'b',
            to: 206,
          },
        ],
        to: 284,
      },
    ];

    expect(getAssignmentsMetadata(sourceFile, ts)).toEqual(reference);
  });

  it('does not include an assignment if tokens list is empty', () => {
    const sourceCode = `
        import * as React from 'react';
        import { stylesheet } from 'astroturf';
  
        const { a } = stylesheet\`\`;

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

    expect(getAssignmentsMetadata(sourceFile, ts)).toEqual(reference);
  });

  it('does not include tokens that are not classes', () => {
    const sourceCode = `
      import * as React from 'react';
      import { stylesheet } from 'astroturf';

      const { a } = stylesheet\`
        .a {
          color: \${
            "red".toUpperCase().toLowerCase()
          };
          padding: 0.125rem;
        }
      \`;

      export const A = ({children}) => <div className={a}>
        {children}
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
            character: 8,
            from: 126,
            line: 5,
            name: 'a',
            to: 128,
          },
        ],
        bindingFrom: 98,
        bindingTo: 103,
        from: 98,
        requestedIdentifiers: [
          {
            character: 14,
            from: 100,
            line: 4,
            name: 'a',
            to: 101,
          },
        ],
        to: 256,
      },
    ];

    expect(getAssignmentsMetadata(sourceFile, ts)).toEqual(reference);
  });

  it('throws an error in case multilevel assignment is used', () => {
    const sourceCode = `
      const { classA: { length } } = stylesheet\`
        .classA {
          color: red;
        }
      \`;
    `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    expect(() => {
      getAssignmentsMetadata(sourceFile, ts);
    }).toThrow();
  });

  it('throws an error in case reassignment is used', () => {
    const sourceCode = `
    const { classA: classB } = stylesheet\`
      .classA {
        color: red;
      }
    \`;
  `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    expect(() => {
      getAssignmentsMetadata(sourceFile, ts);
    }).toThrow();
  });
});
