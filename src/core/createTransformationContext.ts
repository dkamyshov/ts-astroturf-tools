import * as ts from 'typescript';
import { replaceWithValues } from './replaceWithValues';
import { processTemplateExpression } from './processTemplateExpression';

export const createTransformationContext = (
  sourceFile: ts.SourceFile,
  sourceCode?: string,
  watcherCallback?: (fullPath: string) => void
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
      // console.log(`Processing\n${node.getText(sourceFile)}\n\n`);

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
                | ts.TemplateExpression
                | ts.NoSubstitutionTemplateLiteral;

              const variableName = firstChild.getText(sourceFile);

              const clearCssCode = getClearCSSCode(
                lastChild.getChildAt(1, sourceFile).getText(sourceFile)
              );

              const newClearCssCode = replaceWithValues(
                clearCssCode,
                sourceFile,
                watcherCallback
              );

              // const { imports, code } = processImports(newClearCssCode.cssCode);
              const localVariableName = getLocalVariableName(variableName);
              const newCssCode = `\n.${variableName} {\n${newClearCssCode.cssCode}\n}\n`;

              let nodeText = node.getText(sourceFile);

              if (resultSourceCode) {
                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  `${variableName}: (function() { var ${localVariableName} = css\`\n${newCssCode}\n\`; return [${localVariableName}.${variableName}${
                    newClearCssCode.identifiers.length > 0
                      ? `, ${newClearCssCode.identifiers.join(', ')}`
                      : ''
                  }][0]; })()`
                );
              }

              const pte = processTemplateExpression(
                context,
                sourceFile,
                templateExpression,
                localVariableName,
                watcherCallback
              );

              console.log(pte);
              console.log(pte.getText(sourceFile));

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
                                    pte
                                  )
                                ),
                              ],
                              ts.NodeFlags.None
                            )
                          ),
                          ts.createReturn(
                            ts.createElementAccess(
                              ts.createArrayLiteral(
                                [
                                  ts.createPropertyAccess(
                                    ts.createIdentifier(localVariableName),
                                    ts.createIdentifier(variableName)
                                  ),
                                  ...newClearCssCode.identifiers.map(
                                    identifier => {
                                      const parts = identifier.split('.');

                                      if (parts.length === 1) {
                                        return ts.createIdentifier(parts[0]);
                                      }

                                      let node = ts.createPropertyAccess(
                                        ts.createIdentifier(parts[0]),
                                        ts.createIdentifier(parts[1])
                                      );

                                      if (parts.length === 2) {
                                        return node;
                                      }

                                      for (let i = 2; i < parts.length; ++i) {
                                        node = ts.createPropertyAccess(
                                          node,
                                          ts.createIdentifier(parts[i])
                                        );
                                      }

                                      return node;
                                    }
                                  ),
                                ],
                                false
                              ),
                              ts.createNumericLiteral('0')
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
              const templateExpression = lastChild.getChildAt(1, sourceFile) as
                | ts.TemplateExpression
                | ts.NoSubstitutionTemplateLiteral;

              const variableName = firstChild.getText(sourceFile);

              const clearCssCode = getClearCSSCode(
                lastChild.getChildAt(1, sourceFile).getText(sourceFile)
              );

              const newClearCssCode = replaceWithValues(
                clearCssCode,
                sourceFile,
                watcherCallback
              );
              const { imports, code } = processImports(newClearCssCode.cssCode);
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
                      processTemplateExpression(
                        context,
                        sourceFile,
                        templateExpression,
                        variableName,
                        watcherCallback
                      )
                      // ts.createNoSubstitutionTemplateLiteral(
                      //   newCssCode,
                      //   newCssCode
                      // )
                    )
                  ),
                  ts.createIdentifier(`${variableName}`)
                )
              );
            }
          }
        }
      }

      if (ts.isTaggedTemplateExpression(node)) {
        // console.log(`This is a tagged template expression`);
        const childrenCount = node.getChildCount(sourceFile);
        console.log(childrenCount);
        if (childrenCount === 2) {
          const firstChild = node.getChildAt(0, sourceFile);
          if (ts.isPropertyAccessExpression(firstChild)) {
            const accessExpression = firstChild.getText(sourceFile);
            // console.log(accessExpression);
            if (/^styled\./.test(accessExpression)) {
              const templateExpression = node.getChildAt(1, sourceFile) as
                | ts.TemplateExpression
                | ts.NoSubstitutionTemplateLiteral;

              const clearCssCode = getClearCSSCode(
                templateExpression.getText(sourceFile)
              );

              const newClearCssCode = replaceWithValues(
                clearCssCode,
                sourceFile,
                watcherCallback
              );

              const { imports, code } = processImports(newClearCssCode.cssCode);

              const newCssCode = code;

              let nodeText = node.getFullText(sourceFile);

              if (resultSourceCode) {
                resultSourceCode = resultSourceCode.replace(
                  nodeText,
                  `${accessExpression}\`\n${newCssCode}\n\``
                );
              }

              // console.log('Going to transform!');

              return ts.createTaggedTemplate(
                firstChild,
                processTemplateExpression(
                  context,
                  sourceFile,
                  templateExpression,
                  void 0,
                  watcherCallback
                )
              );
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

const getClearCSSCode = (tagContent: string): string => {
  return tagContent.substring(0, tagContent.length - 1).substring(1);
};
