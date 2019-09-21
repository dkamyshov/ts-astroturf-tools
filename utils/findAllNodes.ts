import * as ts from 'typescript';

export const findAllNodes = (
  node: ts.Node,
  predicate: (n: ts.Node) => boolean
): ts.Node[] => {
  const result: ts.Node[] = [];

  function traverse(node: ts.Node) {
    if (predicate(node)) {
      result.push(node);
    } else {
      ts.forEachChild(node, traverse);
    }
  }

  traverse(node);

  return result;
};
