import { getOptions } from 'loader-utils';
import * as ts from 'typescript';
import * as webpack from 'webpack';
import { packageName } from './utils/constants';
import { getAssignmentsMetadata } from './utils/getAssignmentsMetadata';
import { getMissingIdentifiers } from './utils/getMissingIdentifiers';
import { getUnusedTokens } from './utils/getUnusedTokens';

const cache: {
  [resourcePath: string]: {
    source: string;
    transformed: string;
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

interface LoaderOptions {
  /**
   * Enable direct mode.
   *
   * Direct mode allows for calls to `xcss`.
   */
  direct: boolean;
}

const loader: webpack.loader.Loader = function(source, map) {
  this.cacheable && this.cacheable();

  setupErrorsHook(this._compiler);

  const options: LoaderOptions = {
    ...{
      direct: false,
    },
    ...getOptions(this),
  };

  const resourcePath = this.resourcePath;
  const sourceCode = source.toString();
  let resultSourceCode = sourceCode;

  if (Object.prototype.hasOwnProperty.call(cache, resourcePath)) {
    const entry = cache[resourcePath];

    if (entry.source === sourceCode) {
      this.callback(null, entry.transformed, map);
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

  if (options.direct) {
    const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
      const visit: ts.Visitor = node => {
        node = ts.visitEachChild(node, visit, context);

        if (ts.isPropertyAssignment(node)) {
          const firstChild = node.getChildAt(0, sourceFile);
          if (ts.isIdentifier(firstChild)) {
            const lastChild = node.getChildAt(2, sourceFile);
            if (ts.isTaggedTemplateExpression(lastChild)) {
              const identifierName = lastChild
                .getChildAt(0, sourceFile)
                .getText(sourceFile);

              if (identifierName === 'xcss') {
                const variableName = firstChild.getText(sourceFile);

                const cssCode = lastChild
                  .getChildAt(1, sourceFile)
                  .getText(sourceFile);

                const clearCssCode = cssCode
                  .substring(0, cssCode.length - 1)
                  .substring(1);

                const newCssCode = `.${variableName} {\n${clearCssCode}\n}`;

                let nodeText = node.getText(sourceFile);

                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  `${variableName}: (function() { var __local_${variableName} = (css\`\n${newCssCode}\n\`).${variableName}; return __local_${variableName}; })()`
                );

                return ts.createPropertyAssignment(
                  ts.createIdentifier('a'),
                  ts.createCall(
                    ts.createParen(
                      ts.createFunctionExpression(
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        [],
                        undefined,
                        ts.createBlock(
                          [
                            ts.createVariableStatement(
                              undefined,
                              ts.createVariableDeclarationList(
                                [
                                  ts.createVariableDeclaration(
                                    ts.createIdentifier(
                                      `__local_${variableName}`
                                    ),
                                    undefined,
                                    ts.createTaggedTemplate(
                                      ts.createIdentifier('css'),
                                      ts.createNoSubstitutionTemplateLiteral(
                                        newCssCode,
                                        newCssCode
                                      )
                                    )
                                  ),
                                ],
                                ts.NodeFlags.Const
                              )
                            ),
                            ts.createReturn(
                              ts.createPropertyAccess(
                                ts.createIdentifier(`__local_${variableName}`),
                                ts.createIdentifier(variableName)
                              )
                            ),
                          ],
                          true
                        )
                      )
                    ),
                    undefined,
                    []
                  )
                );
              }
            }
          }
        }

        if (ts.isVariableDeclaration(node)) {
          const firstChild = node.getChildAt(0, sourceFile);
          if (ts.isIdentifier(firstChild)) {
            const lastChild = node.getChildAt(2, sourceFile);
            if (ts.isTaggedTemplateExpression(lastChild)) {
              const identifierName = lastChild
                .getChildAt(0, sourceFile)
                .getText(sourceFile);

              if (identifierName === 'xcss') {
                const variableName = firstChild.getText(sourceFile);

                const cssCode = lastChild
                  .getChildAt(1, sourceFile)
                  .getText(sourceFile);

                const clearCssCode = cssCode
                  .substring(0, cssCode.length - 1)
                  .substring(1);

                const newCssCode = `.${variableName} {\n${clearCssCode}\n}`;

                let nodeText = node.getFullText(sourceFile);

                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  ` ${variableName} = (css\`\n${newCssCode}\n\`).${variableName}`
                );

                return ts.createVariableDeclaration(
                  ts.createIdentifier(variableName),
                  undefined,
                  ts.createPropertyAccess(
                    ts.createParen(
                      ts.createTaggedTemplate(
                        ts.createIdentifier('css'),
                        ts.createNoSubstitutionTemplateLiteral(
                          newCssCode,
                          newCssCode
                        )
                      )
                    ),
                    ts.createIdentifier(`${variableName}`)
                  )
                );
              }
            }
          }
        }

        return node;
      };

      return node => ts.visitNode(node, visit);
    };

    ts.transform(sourceFile, [transformer]);
  }

  cache[resourcePath] = {
    source: sourceCode,
    transformed: resultSourceCode,
    errors: currentSessionErrors,
    warnings: currentSessionWarnings,
  };

  this.callback(null, resultSourceCode, map);
  return;
};

export = loader;
