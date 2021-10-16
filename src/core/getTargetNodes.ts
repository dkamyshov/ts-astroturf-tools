import * as internalTs from 'typescript';
import { findAllNodes } from './findAllNodes';
import { isDestructuringCSSAssignment } from './isDestructuringCSSAssignment';

/**
 * Returns an array of nodes representing astroturf
 * css assignments.
 *
 *     const { a } = stylesheet` .a { color: black; } `;
 *                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *
 * @param file
 */
export const getTargetNodes = (
  file: internalTs.SourceFile,
  localTs: typeof internalTs
) => {
  return findAllNodes(
    file,
    n =>
      n.kind === localTs.SyntaxKind.VariableDeclaration &&
      isDestructuringCSSAssignment(n, file, localTs),
    localTs
  );
};
