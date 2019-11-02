import * as internalTs from 'typescript';
import { FileSystem } from './interface';
import { getDefaultFileSystem } from './utils';

const defaultFileSystem = getDefaultFileSystem();

const extensions = [
  '.tsx',
  '.ts',
  '.js',
  defaultFileSystem.sep + 'index.tsx',
  defaultFileSystem.sep + 'index.ts',
  defaultFileSystem.sep + 'index.js',
];

export const createResolverContext = (
  watcherCallback?: (filename: string) => void,
  fs: FileSystem = defaultFileSystem
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

      const transpiledFile = internalTs.transpile(importedFileContent);

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
