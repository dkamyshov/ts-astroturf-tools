import * as webpack from 'webpack';
import { packageName } from '../core/constants';
import { cache } from './cache';

export const createSetupErrorsHook = (cacheInstance: typeof cache) => {
  let isAfterCompileHookSet = false;

  const afterCompileErrorsHook = (
    compilation: webpack.compilation.Compilation,
    callback: () => void
  ) => {
    if (compilation.compiler.isChild()) {
      callback();
      return;
    }

    Object.keys(cacheInstance).forEach(cachedResourcePath => {
      const entry = cacheInstance[cachedResourcePath];

      entry.errors.forEach(errorMessage => {
        compilation.errors.push(new Error(errorMessage));
      });

      entry.warnings.forEach(warningMessage => {
        compilation.warnings.push(new Error(warningMessage));
      });
    });

    callback();
  };

  return (compiler: webpack.Compiler) => {
    if (!isAfterCompileHookSet) {
      compiler.hooks.afterCompile.tapAsync(packageName, afterCompileErrorsHook);
      isAfterCompileHookSet = true;
    }
  };
};
