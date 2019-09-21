import * as ts from 'typescript';
import { findAllNodes } from './findAllNodes';
import { isDestructuringCSSAssignment } from './isDestructuringCSSAssignment';

export const getTargetNodes = (file: ts.SourceFile) => {
  return findAllNodes(
    file,
    n =>
      n.kind === ts.SyntaxKind.VariableDeclaration &&
      isDestructuringCSSAssignment(n, file)
  );
};
