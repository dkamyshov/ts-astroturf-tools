import * as ts from 'typescript';
import { createTransformationContext } from '../core/createTransformationContext';

const transformer = () => {
  return (context: ts.TransformationContext) => {
    return (file: ts.SourceFile) => {
      const transformationContext = createTransformationContext(file);
      return transformationContext.transformer(context)(file);
    };
  };
};

export = transformer;
