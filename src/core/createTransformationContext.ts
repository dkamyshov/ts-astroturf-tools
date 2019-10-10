import * as ts from 'typescript';

export const createTransformationContext = (
  sourceFile: ts.SourceFile,
  sourceCode?: string
) => {
  let resultSourceCode = sourceCode;

  const transformer = (context: ts.TransformationContext) => {
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

              const newCssCode = `\n.${variableName} {\n${clearCssCode}\n}\n`;

              let nodeText = node.getText(sourceFile);

              if (resultSourceCode) {
                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  `${variableName}: (function() { var __local_${variableName} = css\`\n${newCssCode}\n\`; return __local_${variableName}.${variableName}; })()`
                );
              }

              return ts.createPropertyAssignment(
                ts.createIdentifier(variableName),
                ts.createParen(
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
                                ts.NodeFlags.None
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

              if (resultSourceCode) {
                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  ` ${variableName} = (css\`\n${newCssCode}\n\`).${variableName}`
                );
              }

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

    return (node: ts.Node) => ts.visitNode(node, visit);
  };

  const getResultSourceCode = () => resultSourceCode;

  return {
    transformer,
    getResultSourceCode,
  };
};
