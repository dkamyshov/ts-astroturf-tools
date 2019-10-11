import * as ts from 'typescript';
import { createTransformationContext } from '../core/createTransformationContext';

const transformer = () => {
  return (context: ts.TransformationContext) => {
    return (file: ts.SourceFile) =>
      createTransformationContext(file).transformer(context)();
  };
};

export = transformer;
