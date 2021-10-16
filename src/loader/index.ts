import { getOptions } from 'loader-utils';
import * as ts from 'typescript';
import * as webpack from 'webpack';
import { packageName } from '../core/constants';
import { createTransformationContext } from '../core/createTransformationContext';
import { getAssignmentsMetadata } from '../core/getAssignmentsMetadata';
import { getMissingIdentifiers } from '../core/getMissingIdentifiers';
import { getUnusedTokens } from '../core/getUnusedTokens';
import { cache } from './cache';
import { createSetupErrorsHook } from './createSetupErrorsHook';

const setupErrorsHook = createSetupErrorsHook(cache);

interface LoaderOptions {
  /**
   * Enables linaria-like functionality (interpolations).
   */
  linaria: boolean;
}

const loader: webpack.LoaderDefinitionFunction<LoaderOptions> = function (
  source,
  map
) {
  this.cacheable && this.cacheable();

  if (this._compiler) {
    setupErrorsHook(this._compiler);
  }

  const options: LoaderOptions = {
    ...{
      linaria: false,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...getOptions(this as any),
  };

  const resourcePath = this.resourcePath;
  const sourceCode = source.toString();
  let resultSourceCode = sourceCode;

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

  const currentSessionErrors: string[] = [];
  const currentSessionWarnings: string[] = [];

  const assignmentsMetadata = getAssignmentsMetadata(sourceFile, ts);

  assignmentsMetadata.forEach(assignmentMetadata => {
    getMissingIdentifiers(assignmentMetadata).forEach(missingIdentifier => {
      currentSessionErrors.push(
        `[${packageName}/loader] ${resourcePath}:${
          missingIdentifier.line + 1
        }:${missingIdentifier.character + 1}:\n    Identifier "${
          missingIdentifier.name
        }" is missing in corresponding CSS.`
      );
    });

    getUnusedTokens(assignmentMetadata).forEach(unusedToken => {
      currentSessionWarnings.push(
        `[${packageName}/loader] ${resourcePath}:${unusedToken.line + 1}:${
          unusedToken.character + 1
        }:\n    Identifier "${
          unusedToken.name
        }" is unused. Consider removing it from CSS.`
      );
    });
  });

  if (options.linaria) {
    const transformationContext = createTransformationContext(
      sourceFile,
      ts,
      resultSourceCode,
      this.addDependency
    );
    ts.transform(sourceFile, [transformationContext.transformer]);
    const result = transformationContext.getResultSourceCode();

    if (result) {
      resultSourceCode = result;
    }
  }

  cache[resourcePath] = {
    errors: currentSessionErrors,
    warnings: currentSessionWarnings,
  };

  this.callback(null, resultSourceCode, map);
  return;
};

export = loader;
