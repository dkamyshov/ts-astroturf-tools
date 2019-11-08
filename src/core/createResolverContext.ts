import { create, NodeJsInputFileSystem } from 'enhanced-resolve';
import * as path from 'path';
import * as internalTs from 'typescript';

export const createResolverContext = (
  watcherCallback?: (filename: string) => void,
  fs = new NodeJsInputFileSystem()
) => {
  const resolveSync = create.sync({
    fileSystem: fs,
    extensions: ['.tsx', '.ts', '.js'],
  });

  const resolverRequire = (
    currentFileAbsolutePath: string,
    importPath: string
  ) => {
    const lookupStartPath = path.dirname(currentFileAbsolutePath);
    const targetFileName = resolveSync({}, lookupStartPath, importPath);
    const importedFileContent = fs.readFileSync(targetFileName).toString();

    const transpiledFile = internalTs.transpile(importedFileContent);

    const wrapperModuleFunc = new Function(
      'module,exports,require',
      transpiledFile
    );

    const localModule = { exports: {} };

    wrapperModuleFunc(
      localModule,
      localModule.exports,
      (newImportPath: string) => resolverRequire(targetFileName, newImportPath)
    );

    watcherCallback && watcherCallback(targetFileName);

    return localModule.exports;
  };

  return {
    resolverRequire,
  };
};
