import * as ts from 'typescript';

export const isDestructuringCSSAssignment = (
  node: ts.Node,
  file: ts.SourceFile
) => {
  if (node.getChildCount(file) !== 3) {
    return false;
  }

  const firstChild = node.getChildAt(0);

  if (firstChild.kind !== ts.SyntaxKind.ObjectBindingPattern) {
    return false;
  }

  const lastChild = node.getChildAt(2);

  if (lastChild.kind !== ts.SyntaxKind.TaggedTemplateExpression) {
    return false;
  }

  return true;
};
