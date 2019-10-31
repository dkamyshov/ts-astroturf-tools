import * as realFs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const extensions = [
  '.tsx',
  '.ts',
  '.js',
  path.sep + 'index.tsx',
  path.sep + 'index.ts',
  path.sep + 'index.js',
];

export const createResolverContext = (
  watcherCallback?: (filename: string) => void,
  fs = {
    dirname: path.dirname,
    resolve: path.resolve,
    existsSync: realFs.existsSync as (filename: string) => boolean,
    readFileSync: realFs.readFileSync as (filename: string) => Buffer,
  }
) => {
  const resolverRequire = (
    currentFileAbsolutePath: string,
    importPath: string
  ) => {
    const directoryAbsolutePath = fs.dirname(currentFileAbsolutePath);
    const importAbsolutePath = fs.resolve(directoryAbsolutePath, importPath);

    for (let i = 0; i < extensions.length; ++i) {
      const importAbsolutePathWithExtension =
        importAbsolutePath + extensions[i];

      if (!fs.existsSync(importAbsolutePathWithExtension)) {
        continue;
      }

      const importedFileContent = fs
        .readFileSync(importAbsolutePathWithExtension)
        .toString();

      const transpiledFile = ts.transpile(importedFileContent);

      const wrapperModuleFunc = new Function(
        'module,exports,require',
        transpiledFile
      );

      const localModule = { exports: {} };

      wrapperModuleFunc(
        localModule,
        localModule.exports,
        (newImportPath: string) =>
          resolverRequire(importAbsolutePathWithExtension, newImportPath)
      );

      watcherCallback && watcherCallback(importAbsolutePathWithExtension);

      return localModule.exports;
    }

    throw new Error(
      `Unable to find "${importPath}" in "${directoryAbsolutePath}"`
    );
  };

  return {
    resolverRequire,
  };
};
