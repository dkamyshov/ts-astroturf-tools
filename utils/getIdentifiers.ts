import * as ts from 'typescript';
import { literalsRegExp, tokensRegExp } from './constants';
import { extractTemplateLiteralContent } from './extractTemplateLiteralContent';
import { getFirstLevelIdentifiers } from './getFirstLevelIdentifiers';
import { getTargetNodes } from './getTargetNodes';

export interface IdentifiersResult {
  /**
   * List of available class names.
   *
   *     const { a } = css` .a { color: #aaa; } .b { color: #bbb; } `;
   *                         ^                   ^
   */
  available: string[];

  /**
   * List of identifiers in ObjectBindingPattern
   *
   *     const { a } = css` .a { color: #aaa; } .b { color: #bbb; } `;
   *             ^
   */
  requested: ts.Node[];
}

/**
 * Returns metadata for all astroturf css assignments
 * in the file.
 *
 * @param file
 */
export const getIdentifiers = (file: ts.SourceFile): IdentifiersResult[] => {
  const result: IdentifiersResult[] = [];

  const targetNodes = getTargetNodes(file);

  if (targetNodes.length > 0) {
    targetNodes.forEach(node => {
      const identifiers = getFirstLevelIdentifiers(node, file);
      const cssSource = extractTemplateLiteralContent(node, file);
      const clearCssSource = cssSource
        .substring(0, cssSource.length - 1)
        .substring(1);

      const filtered = clearCssSource.replace(literalsRegExp, 'none');

      const tokens = filtered.match(tokensRegExp);

      if (!tokens) {
        throw new Error(`failed to parse tokens`);
      }

      const clearTokens = tokens.map(x => x.substring(1));

      result.push({
        requested: identifiers,
        available: clearTokens,
      });
    });
  }

  return result;
};
