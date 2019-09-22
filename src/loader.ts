import * as ts from 'typescript';
import * as webpack from 'webpack';
import { packageName } from './utils/constants';
import { getAssignmentsMetadata } from './utils/getAssignmentsMetadata';
import { getMissingIdentifiers } from './utils/getMissingIdentifiers';
import { getUnusedTokens } from './utils/getUnusedTokens';

const cache: {
  [resourcePath: string]: {
    source: string;
    errors: string[];
    warnings: string[];
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

      entry.warnings.forEach(warningMessage => {
        compilation.warnings.push(new Error(warningMessage));
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
  let currentSessionWarnings: string[] = [];

  const assignmentsMetadata = getAssignmentsMetadata(sourceFile);

  assignmentsMetadata.forEach(assignmentMetadata => {
    getMissingIdentifiers(assignmentMetadata).forEach(missingIdentifier => {
      currentSessionErrors.push(
        `[${packageName}/loader] ${resourcePath}:${missingIdentifier.line +
          1}:${missingIdentifier.character + 1}:\n    Identifier "${
          missingIdentifier.name
        }" is missing in corresponding CSS.`
      );
    });

    getUnusedTokens(assignmentMetadata).forEach(unusedToken => {
      currentSessionWarnings.push(
        `[${packageName}/loader] ${resourcePath}:${unusedToken.line +
          1}:${unusedToken.character + 1}:\n    Identifier "${
          unusedToken.name
        }" is unused. Consider removing it from CSS.`
      );
    });
  });

  cache[resourcePath] = {
    source: sourceCode,
    errors: currentSessionErrors,
    warnings: currentSessionWarnings,
  };

  this.callback(null, source, map);
  return;
};

export = loader;
