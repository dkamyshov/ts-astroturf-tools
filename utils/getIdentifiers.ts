import * as ts from 'typescript';
import { findAllNodes } from './findAllNodes';
import { isDestructuringCSSAssignment } from './isDestructuringCSSAssignment';
import { getFirstLevelIdentifiers } from './getFirstLevelIdentifiers';
import { getCSSText } from './getCSSText';
import { literalsRegExp, tokensRegExp } from './constants';
import { getTargetNodes } from './getTargetNodes';

export interface IdentifiersResult {
  available: string[];
  requested: ts.Node[];
}

export const getIdentifiers = (file: ts.SourceFile): IdentifiersResult[] => {
  const result: IdentifiersResult[] = [];

  const targetNodes = getTargetNodes(file);

  if (targetNodes.length > 0) {
    targetNodes.forEach(node => {
      const identifiers = getFirstLevelIdentifiers(node, file);
      const cssSource = getCSSText(node, file);
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
