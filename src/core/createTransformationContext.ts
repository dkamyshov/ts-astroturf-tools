import * as ts from 'typescript';

export const createTransformationContext = (
  sourceFile: ts.SourceFile,
  sourceCode?: string
) => {
  let resultSourceCode = sourceCode;

  const identifiers: {
    [identifier: string]: number | undefined;
  } = {};

  const processImports = (cleanCSSCode: string) => {
    const lines = cleanCSSCode.split('\n');

    const [rest, imports] = lines.reduce(
      (accumulator, current) => {
        accumulator[+current.trim().startsWith('@import')].push(current);
        return accumulator;
      },
      [[], []] as string[][]
    );

    return {
      imports: imports.join('\n'),
      code: rest.join('\n'),
    };
  };

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

              const clearCssCode = getClearCSSCode(
                lastChild.getChildAt(1, sourceFile).getText(sourceFile)
              );
              const { imports, code } = processImports(clearCssCode);
              const localVariableName = getLocalVariableName(variableName);
              const newCssCode = `\n${imports}\n.${variableName} {\n${code}\n}\n`;

              let nodeText = node.getText(sourceFile);

              if (resultSourceCode) {
                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  `${variableName}: (function() { var ${localVariableName} = css\`\n${newCssCode}\n\`; return ${localVariableName}.${variableName}; })()`
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
                                    ts.createIdentifier(localVariableName),
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

              const clearCssCode = getClearCSSCode(
                lastChild.getChildAt(1, sourceFile).getText(sourceFile)
              );
              const { imports, code } = processImports(clearCssCode);
              const newCssCode = `\n${imports}\n.${variableName} {\n${code}\n}\n`;

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

const getClearCSSCode = (tagContent: string): string => {
  return tagContent.substring(0, tagContent.length - 1).substring(1);
};
