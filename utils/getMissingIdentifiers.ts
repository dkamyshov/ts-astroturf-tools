import * as ts from 'typescript';
import { IdentifiersResult } from './getIdentifiers';

/**
 * Computes identifiers that are used in an assignment
 * but are missing in the CSS source.
 *
 *     const { a, b } = css` .a { color: #aaa; } `;
 *                ^
 *
 * @param identifiersResult
 * @param file
 */
export const getMissingIdentifiers = (
  identifiersResult: IdentifiersResult[],
  file: ts.SourceFile
): ts.Node[] => {
  const result: ts.Node[] = [];

  identifiersResult.forEach(item => {
    result.push(
      ...item.requested.filter(requested => {
        return item.available.indexOf(requested.getText(file)) === -1;
      })
    );
  });

  return result;
};
