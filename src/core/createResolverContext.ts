import { existsSync, readFileSync } from 'fs';
import { dirname, resolve, sep } from 'path';
import * as ts from 'typescript';

const extensions = [
  '.tsx',
  '.ts',
  '.js',
  sep + 'index.tsx',
  sep + 'index.ts',
  sep + 'index.js',
];

export const createResolverContext = (
  watcherCallback?: (filename: string) => void
) => {
  const resolverRequire = (
    currentFileAbsolutePath: string,
    importPath: string
  ) => {
    const directoryAbsolutePath = dirname(currentFileAbsolutePath);
    const importAbsolutePath = resolve(directoryAbsolutePath, importPath);

    for (let i = 0; i < extensions.length; ++i) {
      const importAbsolutePathWithExtension =
        importAbsolutePath + extensions[i];

      if (!existsSync(importAbsolutePathWithExtension)) {
        continue;
      }

      const importedFileContent = readFileSync(
        importAbsolutePathWithExtension
      ).toString();

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
