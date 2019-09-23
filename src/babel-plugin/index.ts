import * as babelTypes from '@babel/types';
import { NodePath } from '@babel/traverse';

const plugin = ({ types: t }: { types: typeof babelTypes }) => {
  const visitor = {
    TaggedTemplateExpression: (
      path: NodePath<babelTypes.TaggedTemplateExpression>
    ) => {
      path.replaceWith(t.callExpression(t.identifier('f'), [path.node.quasi]));
    },
  };

  return { visitor };
};

export default plugin;
