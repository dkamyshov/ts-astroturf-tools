import * as ts from 'typescript';
import * as webpack from 'webpack';
import { packageName } from './utils/constants';
import { getMissingIdentifiers } from './utils/getMissingIdentifiers';
import { getIdentifiers } from './utils/getIdentifiers';

const cache: {
  [resourcePath: string]: {
    source: string;
    errors: string[];
  };
} = {};

const setupErrorsHook = (() => {
  let isAfterCompileHookSet = false;

  const afterCompileErrorsHook = (
    compilation: webpack.compilation.Compilation,
    callback: () => void
  ) => {
    if (compilation.compiler.isChild()) {
      callback();
      return;
    }

    Object.keys(cache).forEach(cachedResourcePath => {
      const entry = cache[cachedResourcePath];

      entry.errors.forEach(errorMessage => {
        compilation.errors.push(new Error(errorMessage));
      });
    });

    callback();
  };

  return (compiler: webpack.Compiler) => {
    if (!isAfterCompileHookSet) {
      compiler.hooks.afterCompile.tapAsync(packageName, afterCompileErrorsHook);
      isAfterCompileHookSet = true;
    }
  };
})();

const loader: webpack.loader.Loader = function(source, map) {
  this.cacheable && this.cacheable();

  setupErrorsHook(this._compiler);

  const resourcePath = this.resourcePath;
  const sourceCode = source.toString();

  if (Object.prototype.hasOwnProperty.call(cache, resourcePath)) {
    const entry = cache[resourcePath];

    if (entry.source === sourceCode) {
      this.callback(null, source, map);
      return;
    }
  }

  const sourceFile = ts.createSourceFile(
    resourcePath,
    sourceCode,
    ts.ScriptTarget.ESNext,
    false
  );

  if (!sourceFile) {
    this.emitError(new Error(`Unable to get source file.`));
    this.callback(null, source, map);
    return;
  }

  let currentSessionErrors: string[] = [];

  const pushCurrentSessionError = (msg: string) => {
    currentSessionErrors.push(`[${packageName}/loader] ${msg}`);
  };

  const process = (file: ts.SourceFile) => {
    try {
      const missingIdentifiers = getMissingIdentifiers(
        getIdentifiers(file),
        file
      );

      if (missingIdentifiers.length > 0) {
        missingIdentifiers.forEach(missingIdentifier => {
          const linePosition = file.getLineAndCharacterOfPosition(
            missingIdentifier.getStart(file)
          );

          pushCurrentSessionError(
            `${resourcePath}:${linePosition.line + 1}:${linePosition.character +
              1}:\n    Identifier "${missingIdentifier.getText(
              file
            )}" is missing in corresponding CSS.`
          );
        });
      }
    } catch (e) {
      const linePosition = file.getLineAndCharacterOfPosition(file.getStart());
      pushCurrentSessionError(
        `${resourcePath}:${linePosition.line + 1}:${linePosition.character +
          1}:\n    Failed to execute "${packageName}/loader".\n    ${e.message}`
      );
    }
    return file;
  };

  process(sourceFile);

  cache[resourcePath] = {
    source: sourceCode,
    errors: currentSessionErrors,
  };

  this.callback(null, source, map);
  return;
};

export = loader;
