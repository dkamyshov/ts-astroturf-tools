import get from 'lodash.get';
import * as ts from 'typescript';
import { findAllNodes } from '../core/findAllNodes';
import { literalsRegExp } from './constants';
import { createResolverContext } from './createResolverContext';

export const replaceWithValues = (
  clearCssCode: string,
  sourceFile: ts.SourceFile,
  watcherCallback?: (fullPath: string) => void
) => {
  const identifiers: string[] = [];
  const cssCode = clearCssCode.replace(literalsRegExp, (matched, group) => {
    if (typeof group !== 'string') {
      return matched;
    }

    const identifierName = group.split('.')[0];

    if (typeof identifierName !== 'string') {
      return matched;
    }

    const importNodes = findAllNodes(sourceFile, node => {
      if (ts.isImportDeclaration(node)) {
        return (
          findAllNodes(node, n2 => {
            if (ts.isIdentifier(n2)) {
              return n2.getText(sourceFile) === identifierName;
            }

            return false;
          }).length > 0
        );
      }

      return false;
    });

    if (importNodes.length > 0) {
      const importNode = importNodes[0];

      const literals = findAllNodes(importNode, node =>
        ts.isStringLiteral(node)
      );

      if (literals.length > 0) {
        const literal = literals[0];

        const importPath = literal.getText(sourceFile);

        const clearImportPath = importPath
          .substring(0, importPath.length - 1)
          .substring(1);

        const moduleExports = createResolverContext(
          watcherCallback
        ).resolverRequire(sourceFile.fileName, clearImportPath);

        const value = get(moduleExports, group);

        return value + '                                        ';
      }
    }

    return matched;
  });

  return {
    identifiers,
    cssCode,
  };
};
