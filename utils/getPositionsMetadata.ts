import * as ts from 'typescript';
import { getTargetNodes } from './getTargetNodes';
import { findAllNodes } from './findAllNodes';
import { getFirstLevelIdentifiers } from './getFirstLevelIdentifiers';
import { getCSSText } from './getCSSText';
import { literalsRegExp, tokensRegExp } from './constants';

interface PositionMetadata {
  from: number;
  to: number;
  available: string[];
}

export const getPositionsMetadata = (file: ts.SourceFile) => {
  const result: PositionMetadata[] = [];

  const targetNodes = getTargetNodes(file);

  targetNodes.forEach(node => {
    const objectBindingPattern = findAllNodes(node, n => {
      return n.kind === ts.SyntaxKind.ObjectBindingPattern;
    })[0];

    if (!objectBindingPattern) {
      return;
    }

    const identifiers = getFirstLevelIdentifiers(node, file);
    const identifiersStrings = identifiers.map(identifier =>
      identifier.getText(file)
    );
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
      from: objectBindingPattern.getStart(),
      to: objectBindingPattern.getEnd(),
      available: clearTokens.filter(token => {
        return identifiersStrings.indexOf(token) === -1;
      }),
    });
  });

  return result;
};
