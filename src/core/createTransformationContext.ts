import { NodeJsInputFileSystem } from 'enhanced-resolve';
import * as internalTs from 'typescript';
import { createTemplateExpressionProcessor } from './createTemplateExpressionProcessor';

export const createTransformationContext = (
  sourceFile: internalTs.SourceFile,
  ts: typeof internalTs,
  sourceCode?: string,
  watcherCallback?: (fullPath: string) => void,
  fs = new NodeJsInputFileSystem()
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
      if (ts.isPropertyAssignment(node)) {
        const firstChild = node.getChildAt(0, sourceFile);
        if (ts.isIdentifier(firstChild)) {
          const lastChild = node.getChildAt(2, sourceFile);
          if (ts.isTaggedTemplateExpression(lastChild)) {
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
                ts,
                templateExpression.getText(sourceFile),
                watcherCallback,
                fs
              );

              const newTemplateExpression = processor.processTemplateExpression(
                templateExpression,
                variableName
              );

              const localVariableName = getLocalVariableName(variableName);

              const nodeText = node.getText(sourceFile);

              if (resultSourceCode) {
                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  `${variableName}: (function() { var ${localVariableName} = css${processor.getResultCode()}; return ${localVariableName}.${variableName}; })()`
                );
              }

              return ts.createPropertyAssignment(
                ts.createIdentifier(variableName),
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
                                  ts.createIdentifier(localVariableName),
                                  undefined,
                                  ts.createTaggedTemplate(
                                    ts.createIdentifier('css'),
                                    newTemplateExpression
                                  )
                                ),
                              ],
                              ts.NodeFlags.None
                            )
                          ),
                          ts.createReturn(
                            ts.createPropertyAccess(
                              ts.createIdentifier(localVariableName),
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
        if (firstChild && ts.isIdentifier(firstChild)) {
          const lastChild = node.getChildAt(2, sourceFile);
          if (lastChild && ts.isTaggedTemplateExpression(lastChild)) {
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
                ts,
                templateExpression.getText(sourceFile),
                watcherCallback,
                fs
              );

              const newTemplateExpression = processor.processTemplateExpression(
                templateExpression,
                variableName
              );

              const nodeText = node.getFullText(sourceFile);

              if (resultSourceCode) {
                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  ` ${variableName} = (css${processor.getResultCode()}).${variableName}`
                );
              }

              return ts.createVariableDeclaration(
                ts.createIdentifier(variableName),
                undefined,
                ts.createPropertyAccess(
                  ts.createParen(
                    ts.createTaggedTemplate(
                      ts.createIdentifier('css'),
                      newTemplateExpression
                    )
                  ),
                  ts.createIdentifier(variableName)
                )
              );
            }
          }
        }
      }

      if (ts.isTaggedTemplateExpression(node)) {
        const childrenCount = node.getChildCount(sourceFile);
        if (childrenCount === 2) {
          const firstChild = node.getChildAt(0, sourceFile);

          if (
            ts.isPropertyAccessExpression(firstChild) ||
            ts.isCallExpression(firstChild)
          ) {
            const firstChildText = firstChild.getText(sourceFile);
            if (/^styled[.(]/.test(firstChildText)) {
              const templateExpression = node.getChildAt(1, sourceFile) as
                | internalTs.TemplateExpression
                | internalTs.NoSubstitutionTemplateLiteral;

              const processor = createTemplateExpressionProcessor(
                context,
                sourceFile,
                ts,
                templateExpression.getText(sourceFile),
                watcherCallback,
                fs
              );

              const newTemplateExpression = processor.processTemplateExpression(
                templateExpression
              );

              const nodeText = node.getFullText(sourceFile);

              if (resultSourceCode) {
                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  `${firstChildText}${processor.getResultCode()}`
                );
              }

              return ts.createTaggedTemplate(firstChild, newTemplateExpression);
            }
          }
        }
      }

      return ts.visitEachChild(node, visit, context);
    };

    return () => ts.visitNode(sourceFile, visit);
  };

  const getResultSourceCode = () => resultSourceCode;

  return {
    transformer,
    getResultSourceCode,
  };
};
