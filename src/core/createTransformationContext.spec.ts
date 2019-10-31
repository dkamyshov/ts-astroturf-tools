import { createTransformationContext } from './createTransformationContext';
import * as ts from 'typescript';

describe('createTransformationContext', () => {
  const process = (
    sourceCode: string,
    callback: (
      resultCode: string | undefined,
      resultFile: ts.SourceFile,
      sourceFile: ts.SourceFile
    ) => void
  ) => {
    const sourceFile = ts.createSourceFile(
      'index.tsx',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    const transformationContext = createTransformationContext(
      sourceFile,
      sourceCode
    );

    ts.transform(sourceFile, [
      context => {
        return () => {
          const result = transformationContext.transformer(context)();
          const resultCode = transformationContext.getResultSourceCode();
          callback(resultCode, result, sourceFile);
          return result;
        };
      },
    ]);
  };

  it('keeps file intact', () => {
    const sourceCode = `
      import * as React from 'react';

      export const SomeComponent = <div>Hello!</div>;

      export const someOtherTag = gql\`
        query GetUsers {
          getUsers {
            id
            username
          }
        }
      \`;

      export const property = {
        gqlQuery: gql\`
          query GetEntries {
            getEntries {
              id
            }
          }
        \`
      };
    `;

    process(sourceCode, (resultCode, resultFile, sourceFile) => {
      expect(resultCode).toBe(sourceCode);
      expect(resultFile).toBe(sourceFile);
    });
  });

  it('processes variable declaration', () => {
    const sourceCode = `const someClassName = xcss\`color: red;\`;`;

    const referenceResult = `const someClassName = (css\`
.someClassName {
color: red;
}\`).someClassName;`;

    process(sourceCode, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });

  it('processes property assignment', () => {
    const sourceCode = `const obj = { someProperty: xcss\`color: red\` };`;

    const referenceResult = `const obj = { someProperty: (function() { var p_someProperty = css\`
.someProperty {
color: red
}\`; return p_someProperty.someProperty; })() };`;

    process(sourceCode, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });

  it('processes "styled" expressions', () => {
    const sourceCode = `const SomeComponent = styled.div\`color:red\`;`;
    const referenceResult = `const SomeComponent =styled.div\`color:red\`;`;

    process(sourceCode, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });
});
