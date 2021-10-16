import { NodeJsInputFileSystem } from 'enhanced-resolve';
import * as ts from 'typescript';
import { createCustomFileSystem } from '../test-utils/createCustomFileSystem';
import { createTransformationContext } from './createTransformationContext';

describe('createTransformationContext', () => {
  const process = (
    sourceCode: string,
    fs: NodeJsInputFileSystem | undefined,
    callback: (
      resultCode: string | undefined,
      resultFile: ts.SourceFile,
      sourceFile: ts.SourceFile
    ) => void
  ) => {
    const sourceFile = ts.createSourceFile(
      '/index.tsx',
      sourceCode,
      ts.ScriptTarget.ESNext
    );

    const transformationContext = createTransformationContext(
      sourceFile,
      ts,
      sourceCode,
      void 0,
      fs
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

      export const AnotherStyledComponent = styledA\`
        color: red;
      \`;
    `;

    process(sourceCode, void 0, (resultCode, resultFile, sourceFile) => {
      expect(resultCode).toBe(sourceCode);
      expect(resultFile).toBe(sourceFile);
    });
  });

  it('processes variable declaration', () => {
    const sourceCode = `const someClassName = css\`color: red;\`;`;

    const referenceResult = `const someClassName =css\`color: red;\`;`;

    process(sourceCode, void 0, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });

  it('processes property assignment', () => {
    const sourceCode = `const obj = { someProperty: css\`color: red\` };`;

    const referenceResult = `const obj = { someProperty:css\`color: red\` };`;

    process(sourceCode, void 0, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });

  it('processes "styled" expressions', () => {
    const sourceCode = `const SomeComponent = styled.div\`color:red\`;`;
    const referenceResult = `const SomeComponent =styled.div\`color:red\`;`;

    process(sourceCode, void 0, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });

  it('processes "styled" functions', () => {
    const sourceCode = `const SomeComponent = styled(SourceComponent)\`color: red;\`;`;
    const referenceResult = `const SomeComponent =styled(SourceComponent)\`color: red;\`;`;

    process(sourceCode, void 0, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });

  it('processes "styled" expressions with remote interpolations', () => {
    const sourceCode = `import { RED } from './colors'; const SomeComponent = styled.div\`color: \${RED};\`;`;
    const referenceResult = `import { RED } from './colors'; const SomeComponent =styled.div\`color: \${"red"};\`;`;
    const mockfs = createCustomFileSystem({
      '/colors.tsx': 'export const RED = "red";',
    });

    process(sourceCode, mockfs, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });

  it('processes "styled" functions with remote interpolations', () => {
    const sourceCode = `import { RED } from './colors'; const B = styled(A)\`color: \${RED}\`;`;
    const referenceResult = `import { RED } from './colors'; const B =styled(A)\`color: \${"red"}\`;`;
    const mockfs = createCustomFileSystem({
      '/colors.tsx': 'export const RED = "red";',
    });

    process(sourceCode, mockfs, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });

  it('processes "stylesheet" variable declaration with remote interpolation', () => {
    const sourceCode = `import { RED } from './colors'; const { a } = stylesheet\`.a { color: \${RED}; }\`;`;

    const referenceResult = `import { RED } from './colors'; const { a } =stylesheet\`.a { color: \${"red"}; }\`;`;

    const mockfs = createCustomFileSystem({
      '/colors.tsx': 'export const RED = "red";',
    });

    process(sourceCode, mockfs, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });

  it('processes "css" property assignments with remote interpolation', () => {
    const sourceCode = `import { RED } from './colors'; const classes = { someClass: css\`color: \${RED}\` };`;

    const referenceResult = `import { RED } from './colors'; const classes = { someClass:css\`color: \${"red"}\` };`;

    const mockfs = createCustomFileSystem({
      '/colors.tsx': 'export const RED = "red";',
    });

    process(sourceCode, mockfs, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });

  it('processes "css" property assignments with multiple identifiers', () => {
    const sourceCode = `const a = { a: css\`color: red;\`; }; const b = { a: css\`color: green;\`; };`;
    const referenceResult = `const a = { a:css\`color: red;\`; }; const b = { a:css\`color: green;\`; };`;

    process(sourceCode, void 0, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });
});
