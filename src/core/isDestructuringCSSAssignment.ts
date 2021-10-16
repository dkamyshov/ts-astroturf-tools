import * as internalTs from 'typescript';

/**
 * Checks whether specified node is an astroturf
 * css assignment:
 *
 *
 *    const { a } = stylesheet` .a { color: black; } `;
 *          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *
 * @param node
 * @param file
 */
export const isDestructuringCSSAssignment = (
  node: internalTs.Node,
  file: internalTs.SourceFile,
  localTs: typeof internalTs
) => {
  // assignment node has exactly 3 children:
  //
  // const { a } = stylesheet` .a { color: black; } `;
  //       ^^^^  ^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //         0   1                 2
  //
  // 0 - ObjectBindingPattern
  // 1 - EqualsToken
  // 2 - TaggedTemplateExpression
  //
  // see https://ts-ast-viewer.com/#code/MYewdgzgLgBA3jAhjAvjAvDYEIAMYB0yCoANiAE4BcMARqYsANYDcqMuLQA

  if (node.getChildCount(file) !== 3) {
    return false;
  }

  const firstChild = node.getChildAt(0, file);

  // const { a } = stylesheet` .a { color: black; } `;
  //       ^^^^
  if (firstChild.kind !== localTs.SyntaxKind.ObjectBindingPattern) {
    return false;
  }

  const lastChild = node.getChildAt(2, file);

  // const { a } = stylesheet` .a { color: black; } `;
  //               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  if (lastChild.kind !== localTs.SyntaxKind.TaggedTemplateExpression) {
    return false;
  }

  // const { a } = stylesheet` .a { color: black; } `;
  //               ^^^^^^^^^^
  const identifierChild = lastChild.getChildAt(0, file);

  if (identifierChild.getText(file) !== 'stylesheet') {
    return false;
  }

  return true;
};
