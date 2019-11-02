import * as internalTs from 'typescript';

export const findAllNodes = (
  node: internalTs.Node,
  predicate: (n: internalTs.Node) => boolean,
  ts: typeof internalTs
): internalTs.Node[] => {
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
