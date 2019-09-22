import * as ts from 'typescript';
import { literalsRegExp, tokensRegExp } from './constants';
import { extractTemplateLiteralContent } from './extractTemplateLiteralContent';
import { findAllNodes } from './findAllNodes';
import { getFirstLevelIdentifiers } from './getFirstLevelIdentifiers';
import { getTargetNodes } from './getTargetNodes';

interface PositionMetadata {
  /**
   * Starting position of ObjectBindingPattern.
   */
  from: number;

  /**
   * Ending position of ObjectBindingPattern.
   */
  to: number;

  /**
   * Tokens from CSS that aren't yet used
   * in an assignment.
   */
  available: string[];
}

/**
 * Returns position metadata for each astroturf
 * css assignment is a file.
 *
 *     const { a } = css` .a { color: #aaa; } .b { color: #bbb; } `;
 *     //    ^   ^         ^                   ^
 *     //    6   10        used                unused
 *     // =>
 *     // [{
 *     //   from: 6,
 *     //   to: 10,
 *     //   available: ['b']
 *     // }]
 *
 * @param file
 */
export const getPositionsMetadata = (file: ts.SourceFile) => {
  const result: PositionMetadata[] = [];

  const targetNodes = getTargetNodes(file);

  targetNodes.forEach(node => {
    const objectBindingPattern = findAllNodes(node, n => {
      return n.kind === ts.SyntaxKind.ObjectBindingPattern;
    })[0]; // there will always be an ObjectBindingPattern

    const identifiers = getFirstLevelIdentifiers(node, file);
    const identifiersStrings = identifiers.map(identifier =>
      identifier.getText(file)
    );
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
      from: objectBindingPattern.getStart(file),
      to: objectBindingPattern.getEnd(), // for some reason getEnd() does not require a file
      available: clearTokens.filter(token => {
        return identifiersStrings.indexOf(token) === -1;
      }),
    });
  });

  return result;
};
