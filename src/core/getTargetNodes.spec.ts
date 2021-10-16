import { getTargetNodes } from './getTargetNodes';
import * as ts from 'typescript';

describe('getTargetNodes', () => {
  describe('finds destructuring stylesheet assignments', () => {
    it('finds declarations at all', () => {
      const referenceSource = `
        import * as React from 'react';

        const { a, b, c } = stylesheet\`
          .a {
            color: #aaa;
          }
  
          .b {
            color: #bbb;
          }
  
          .c {
            color: #ccc;
          }
        \`;

        const { label } = {
          label: 'some label'
        };

        export const A = (props) => <div className={a}>{props.children} {label}</div>;
      `;

      const sourceFile = ts.createSourceFile(
        'test.ts',
        referenceSource,
        ts.ScriptTarget.ESNext
      );

      const targetNodes = getTargetNodes(sourceFile, ts);

      expect(targetNodes.length).toBe(1);
    });

    it('skips declarations that are not "stylesheet"', () => {
      const referenceSource = `
        const { a } = stylesheet\`
          .a {
            color: #aaa;
          }
        \`;
  
        const { someGqlIdentifier } = gql\`
          // some gql code
        \`;
      `;

      const sourceFile = ts.createSourceFile(
        'test.ts',
        referenceSource,
        ts.ScriptTarget.ESNext
      );

      const targetNodes = getTargetNodes(sourceFile, ts);

      expect(targetNodes.length).toBe(1);
    });
  });
});
