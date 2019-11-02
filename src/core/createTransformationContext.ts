import * as internalTs from 'typescript';
import { createTemplateExpressionProcessor } from './createTemplateExpressionProcessor';
import { getDefaultFileSystem } from './utils';

export const createTransformationContext = (
  sourceFile: internalTs.SourceFile,
  localTs: typeof internalTs,
  sourceCode?: string,
  watcherCallback?: (fullPath: string) => void,
  fs = getDefaultFileSystem()
) => {
  let resultSourceCode = sourceCode;

  const identifiers: {
    [identifier: string]: number | undefined;
  } = {};

  const getLocalVariableName = (identifier: string) => {
    const currentCount = identifiers[identifier];
    const currentTotalCount =
      typeof currentCount === 'number' ? currentCount : 0;
    identifiers[identifier] = currentTotalCount + 1;

    if (currentTotalCount === 0) {
      return `p_${identifier}`;
    } else {
      return `p_${identifier}_${currentTotalCount}`;
    }
  };

  const transformer = (context: internalTs.TransformationContext) => {
    const visit: internalTs.Visitor = node => {
      if (internalTs.isPropertyAssignment(node)) {
        const firstChild = node.getChildAt(0, sourceFile);
        if (internalTs.isIdentifier(firstChild)) {
          const lastChild = node.getChildAt(2, sourceFile);
          if (internalTs.isTaggedTemplateExpression(lastChild)) {
            const identifierName = lastChild
              .getChildAt(0, sourceFile)
              .getText(sourceFile);

            if (identifierName === 'xcss') {
              const templateExpression = lastChild.getChildAt(1, sourceFile) as
                | internalTs.TemplateExpression
                | internalTs.NoSubstitutionTemplateLiteral;

              const variableName = firstChild.getText(sourceFile);

              const processor = createTemplateExpressionProcessor(
                context,
                sourceFile,
                localTs,
                templateExpression.getText(sourceFile),
                watcherCallback,
                fs
              );

              const newTemplateExpression = processor.processTemplateExpression(
                templateExpression,
                variableName
              );

              const localVariableName = getLocalVariableName(variableName);

              let nodeText = node.getText(sourceFile);

              if (resultSourceCode) {
                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  `${variableName}: (function() { var ${localVariableName} = css${processor.getResultCode()}; return ${localVariableName}.${variableName}; })()`
                );
              }

              return internalTs.createPropertyAssignment(
                internalTs.createIdentifier(variableName),
                internalTs.createCall(
                  internalTs.createParen(
                    internalTs.createFunctionExpression(
                      undefined,
                      undefined,
                      undefined,
                      undefined,
                      [],
                      undefined,
                      internalTs.createBlock(
                        [
                          internalTs.createVariableStatement(
                            undefined,
                            internalTs.createVariableDeclarationList(
                              [
                                internalTs.createVariableDeclaration(
                                  internalTs.createIdentifier(
                                    localVariableName
                                  ),
                                  undefined,
                                  internalTs.createTaggedTemplate(
                                    internalTs.createIdentifier('css'),
                                    newTemplateExpression
                                  )
                                ),
                              ],
                              internalTs.NodeFlags.None
                            )
                          ),
                          internalTs.createReturn(
                            internalTs.createPropertyAccess(
                              internalTs.createIdentifier(localVariableName),
                              internalTs.createIdentifier(variableName)
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

      if (internalTs.isVariableDeclaration(node)) {
        const firstChild = node.getChildAt(0, sourceFile);
        if (firstChild && internalTs.isIdentifier(firstChild)) {
          const lastChild = node.getChildAt(2, sourceFile);
          if (lastChild && internalTs.isTaggedTemplateExpression(lastChild)) {
            const identifierName = lastChild
              .getChildAt(0, sourceFile)
              .getText(sourceFile);

            if (identifierName === 'xcss') {
              const templateExpression = lastChild.getChildAt(1, sourceFile) as
                | internalTs.TemplateExpression
                | internalTs.NoSubstitutionTemplateLiteral;

              const variableName = firstChild.getText(sourceFile);

              const processor = createTemplateExpressionProcessor(
                context,
                sourceFile,
                localTs,
                templateExpression.getText(sourceFile),
                watcherCallback,
                fs
              );

              const newTemplateExpression = processor.processTemplateExpression(
                templateExpression,
                variableName
              );

              let nodeText = node.getFullText(sourceFile);

              if (resultSourceCode) {
                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  ` ${variableName} = (css${processor.getResultCode()}).${variableName}`
                );
              }

              return internalTs.createVariableDeclaration(
                internalTs.createIdentifier(variableName),
                undefined,
                internalTs.createPropertyAccess(
                  internalTs.createParen(
                    internalTs.createTaggedTemplate(
                      internalTs.createIdentifier('css'),
                      newTemplateExpression
                    )
                  ),
                  internalTs.createIdentifier(variableName)
                )
              );
            }
          }
        }
      }

      if (internalTs.isTaggedTemplateExpression(node)) {
        const childrenCount = node.getChildCount(sourceFile);
        if (childrenCount === 2) {
          const firstChild = node.getChildAt(0, sourceFile);
          if (internalTs.isPropertyAccessExpression(firstChild)) {
            const accessExpression = firstChild.getText(sourceFile);
            if (/^styled\./.test(accessExpression)) {
              const templateExpression = node.getChildAt(1, sourceFile) as
                | internalTs.TemplateExpression
                | internalTs.NoSubstitutionTemplateLiteral;

              const processor = createTemplateExpressionProcessor(
                context,
                sourceFile,
                localTs,
                templateExpression.getText(sourceFile),
                watcherCallback,
                fs
              );

              const newTemplateExpression = processor.processTemplateExpression(
                templateExpression
              );

              let nodeText = node.getFullText(sourceFile);

              if (resultSourceCode) {
                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  `${accessExpression}${processor.getResultCode()}`
                );
              }

              return internalTs.createTaggedTemplate(
                firstChild,
                newTemplateExpression
              );
            }
          }
        }
      }

      return internalTs.visitEachChild(node, visit, context);
    };

    return () => internalTs.visitNode(sourceFile, visit);
  };

  const getResultSourceCode = () => resultSourceCode;

  return {
    transformer,
    getResultSourceCode,
  };
};
