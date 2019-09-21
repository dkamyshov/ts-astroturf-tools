import * as ts from 'typescript';
import { IdentifiersResult } from './getIdentifiers';

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
