// @ts-ignore
import * as get from 'lodash.get';
import * as internalTs from 'typescript';
import { createResolverContext } from './createResolverContext';
import { findAllNodes } from './findAllNodes';
import { getClearCSSCode, getDefaultFileSystem } from './utils';

export const createTemplateExpressionProcessor = (
  context: internalTs.TransformationContext,
  sourceFile: internalTs.SourceFile,
  ts: typeof internalTs,
  sourceCode?: string,
  watcherCallback?: (filename: string) => void,
  fs = getDefaultFileSystem()
) => {
  let resultCode = sourceCode;

  const processTemplateExpression = (
    templateExpression:
      | ts.TemplateExpression
      | ts.NoSubstitutionTemplateLiteral,
    wrapClass?: string
  ) => {
    if (ts.isNoSubstitutionTemplateLiteral(templateExpression)) {
      if (typeof wrapClass === 'string') {
        const rawText = templateExpression.getText(sourceFile);
        const clearRawText = getClearCSSCode(rawText);
        const wrappedText = `\n.${wrapClass} {\n${clearRawText}\n}`;
        const replacedText = '`' + wrappedText + '`';

        if (resultCode) {
          resultCode = resultCode.replace(rawText, replacedText);
        }

        return ts.createNoSubstitutionTemplateLiteral(wrappedText, wrappedText);
      }

      return templateExpression;
    }

    const visit: ts.Visitor = node => {
      if (typeof wrapClass === 'string') {
        if (ts.isTemplateHead(node)) {
          const rawText = node.getText(sourceFile);
          const clearRawText = getClearTemplateHead(rawText);
          const wrappedText = `\n.${wrapClass} {\n${clearRawText}`;
          const replacedText = '`' + wrappedText + '${';

          if (resultCode) {
            resultCode = resultCode.replace(rawText, replacedText);
          }

          return ts.createTemplateHead(wrappedText, wrappedText);
        }

        if (ts.isTemplateTail(node)) {
          const rawText = node.getText(sourceFile);
          const clearRawText = getClearCSSCode(rawText);
          const wrappedText = `${clearRawText}\n}\n`;
          const replacedText = '}' + wrappedText + '`';

          if (resultCode) {
            resultCode = resultCode.replace(rawText, replacedText);
          }

          return ts.createTemplateTail(wrappedText, wrappedText);
        }
      }

      if (ts.isPropertyAccessExpression(node) || ts.isIdentifier(node)) {
        const identifierName = node.getText(sourceFile);
        const parts = identifierName.split('.');

        const importNodes = findAllNodes(
          sourceFile,
          node => {
            if (ts.isImportDeclaration(node)) {
              return (
                findAllNodes(
                  node,
                  n2 => {
                    if (ts.isIdentifier(n2)) {
                      return n2.getText(sourceFile) === parts[0];
                    }

                    return false;
                  },
                  ts
                ).length > 0
              );
            }

            return false;
          },
          ts
        );

        if (importNodes.length > 0) {
          const importNode = importNodes[0];

          const literals = findAllNodes(importNode, ts.isStringLiteral, ts);

          if (literals.length > 0) {
            const literal = literals[0];

            const importPath = literal.getText(sourceFile);

            const clearImportPath = importPath
              .substring(0, importPath.length - 1)
              .substring(1);

            const moduleExports = createResolverContext(
              watcherCallback,
              fs
            ).resolverRequire(sourceFile.fileName, clearImportPath);

            const value = get(moduleExports, identifierName);

            if (resultCode) {
              resultCode = resultCode.replace(
                identifierName,
                JSON.stringify(String(value))
              );
            }

            return ts.createStringLiteral(String(value));
          }
        }
      }

      return ts.visitEachChild(node, visit, context);
    };

    return ts.visitNode(templateExpression, visit);
  };

  return {
    processTemplateExpression,
    getResultCode: () => resultCode,
  };
};

const getClearTemplateHead = (templateHead: string) => {
  return templateHead.substring(0, templateHead.length - 2).substring(1);
};
