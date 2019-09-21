import * as ts from 'typescript';
import { findAllNodes } from './findAllNodes';

export const getFirstLevelIdentifiers = (
  node: ts.Node,
  file: ts.SourceFile
): ts.Node[] => {
  let result: ts.Node[] = [];

  const objectBindingPattern = findAllNodes(node, n => {
    return n.kind === ts.SyntaxKind.ObjectBindingPattern;
  })[0];

  if (!objectBindingPattern) {
    return result;
  }

  objectBindingPattern.forEachChild(child => {
    if (child.kind === ts.SyntaxKind.BindingElement) {
      if (child.getChildCount(file) !== 1) {
        throw new Error(
          `Multilevel destructuring assignments are not yet supported.`
        );
      }

      const identifier = child.getChildAt(0);

      result.push(identifier);
    }
  });

  return result;
};
