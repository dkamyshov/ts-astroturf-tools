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

  const transformer = (context: internalTs.TransformationContext) => {
    const visit: internalTs.Visitor = node => {
      if (ts.isTaggedTemplateExpression(node)) {
        const childrenCount = node.getChildCount(sourceFile);
        if (childrenCount === 2) {
          const firstChild = node.getChildAt(0, sourceFile);

          if (
            ts.isPropertyAccessExpression(firstChild) ||
            ts.isCallExpression(firstChild) ||
            ts.isIdentifier(firstChild)
          ) {
            const firstChildText = firstChild.getText(sourceFile);
            if (
              firstChildText === 'css' ||
              firstChildText === 'stylesheet' ||
              /^styled[.(]/.test(firstChildText)
            ) {
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

              const newTemplateExpression =
                processor.processTemplateExpression(templateExpression);

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
