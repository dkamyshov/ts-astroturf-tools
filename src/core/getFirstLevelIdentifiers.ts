import * as internalTs from 'typescript';
import { findAllNodes } from './findAllNodes';

export const getFirstLevelIdentifiers = (
  node: internalTs.Node,
  file: internalTs.SourceFile,
  localTs: typeof internalTs
): internalTs.Node[] => {
  const result: internalTs.Node[] = [];

  const objectBindingPattern = findAllNodes(
    node,
    n => n.kind === localTs.SyntaxKind.ObjectBindingPattern,
    localTs
  )[0];

  objectBindingPattern.forEachChild(child => {
    if (child.kind === localTs.SyntaxKind.BindingElement) {
      if (child.getChildCount(file) !== 1) {
        throw new Error(
          `Multilevel destructuring assignments are not yet supported.`
        );
      }

      const identifier = child.getChildAt(0, file);

      result.push(identifier);
    }
  });

  return result;
};
