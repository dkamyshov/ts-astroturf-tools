import * as ts from 'typescript';

export const getCSSText = (node: ts.Node, file: ts.SourceFile): string => {
  const taggedTemplateExpression = node.getChildAt(2, file);
  const childNode = taggedTemplateExpression.getChildAt(1, file);
  return childNode.getText(file);
};
