import * as ts from 'typescript';
import * as webpack from 'webpack';
import { packageName } from './utils/constants';
import { getAssignmentsMetadata } from './utils/getAssignmentsMetadata';
import { getMissingIdentifiers } from './utils/getMissingIdentifiers';

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
    const assignmentsMetadata = getAssignmentsMetadata(file);

    assignmentsMetadata.forEach(assignmentMetadata => {
      const missingIdentifiers = getMissingIdentifiers(assignmentMetadata);

      missingIdentifiers.forEach(missingIdentifier => {
        pushCurrentSessionError(
          `${resourcePath}:${missingIdentifier.line +
            1}:${missingIdentifier.character + 1}:\n    Identifier "${
            missingIdentifier.name
          }" is missing in corresponding CSS.`
        );
      });
    });
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
