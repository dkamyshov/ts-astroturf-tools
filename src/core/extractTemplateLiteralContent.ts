import * as internalTs from 'typescript';

/**
 * Extracts tagged template literal content from
 * astroturf css assignment node:
 *
 *     const { a } = stylesheet` .a { color: black; } `;
 *                             ^^^^^^^^^^^^^^^^^^^^^^^^
 *
 * @param node
 * @param file
 */
export const extractTemplateLiteralContent = (
  node: internalTs.Node,
  file: internalTs.SourceFile
): string => {
  const taggedTemplateExpression = node.getChildAt(2, file);
  const childNode = taggedTemplateExpression.getChildAt(1, file);
  return childNode.getText(file);
};
