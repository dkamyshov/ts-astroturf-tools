import * as ts from 'typescript';
import { createCustomFileSystem } from '../test-utils/createCustomFileSystem';
import { createTransformationContext } from './createTransformationContext';
import { FileSystem } from './interface';

describe('createTransformationContext', () => {
  const process = (
    sourceCode: string,
    fs: FileSystem | undefined,
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
    const sourceCode = `const someClassName = xcss\`color: red;\`;`;

    const referenceResult = `const someClassName = (css\`
.someClassName {
color: red;
}\`).someClassName;`;

    process(sourceCode, void 0, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });

  it('processes property assignment', () => {
    const sourceCode = `const obj = { someProperty: xcss\`color: red\` };`;

    const referenceResult = `const obj = { someProperty: (function() { var p_someProperty = css\`
.someProperty {
color: red
}\`; return p_someProperty.someProperty; })() };`;

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

  it('processes "xcss" property assignments with remote interpolation', () => {
    const sourceCode = `import { RED } from './colors'; const classes = { someClass: xcss\`color: \${RED}\`; };`;

    const referenceResult = `import { RED } from './colors'; const classes = { someClass: (function() { var p_someClass = css\`
.someClass {
color: \${"red"}
}
\`; return p_someClass.someClass; })(); };`;

    const mockfs = createCustomFileSystem({
      '/colors.tsx': 'export const RED = "red";',
    });

    process(sourceCode, mockfs, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });

  it('processes "xcss" property assignments with multiple identifiers', () => {
    const sourceCode = `const a = { a: xcss\`color: red;\`; }; const b = { a: xcss\`color: green;\`; };`;
    const referenceResult = `const a = { a: (function() { var p_a = css\`
.a {
color: red;
}\`; return p_a.a; })(); }; const b = { a: (function() { var p_a_1 = css\`
.a {
color: green;
}\`; return p_a_1.a; })(); };`;

    process(sourceCode, void 0, resultCode => {
      expect(resultCode).toBe(referenceResult);
    });
  });
});
