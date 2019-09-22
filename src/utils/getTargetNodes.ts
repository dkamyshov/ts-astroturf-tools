import * as ts from 'typescript';
import { findAllNodes } from './findAllNodes';
import { isDestructuringCSSAssignment } from './isDestructuringCSSAssignment';

/**
 * Returns an array of nodes representing astroturf
 * css assignments.
 *
 *     const { a } = css` .a { color: black; } `;
 *           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *
 * @param file
 */
export const getTargetNodes = (file: ts.SourceFile) => {
  return findAllNodes(
    file,
    n =>
      n.kind === ts.SyntaxKind.VariableDeclaration &&
      isDestructuringCSSAssignment(n, file)
  );
};
