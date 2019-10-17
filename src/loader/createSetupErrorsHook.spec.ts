import { createSetupErrorsHook } from './createSetupErrorsHook';
import { cache } from './cache';

describe('setupErrorsHook', () => {
  it('set errorsHook only once', () => {
    const setupErrorsHook = createSetupErrorsHook({});

    const tapAsync = jest.fn();

    const compiler: any = {
      hooks: {
        afterCompile: {
          tapAsync,
        },
      },
    };

    setupErrorsHook(compiler);
    setupErrorsHook(compiler);

    expect(tapAsync).toHaveBeenCalledTimes(1);
  });

  it('pushes errors and warnings', () => {
    const cacheInstance: typeof cache = {
      'file.ts': {
        errors: ['error1'],
        warnings: ['warning1'],
      },
    };

    const setupErrorsHook = createSetupErrorsHook(cacheInstance);

    let hookCallback: (compilation: any, callback: any) => void = () => {};

    const compiler: any = {
      hooks: {
        afterCompile: {
          tapAsync: (name: string, callback: any) => (hookCallback = callback),
        },
      },
    };

    const compilation = {
      errors: {
        push: jest.fn(),
      },
      warnings: {
        push: jest.fn(),
      },
      compiler: {
        isChild: () => false,
      },
    };

    setupErrorsHook(compiler);

    hookCallback(compilation, () => {
      expect(compilation.errors.push).toHaveBeenCalledTimes(1);
      expect(compilation.warnings.push).toHaveBeenCalledTimes(1);
    });

    compilation.compiler.isChild = () => true;

    compilation.errors.push.mockClear();
    compilation.warnings.push.mockClear();

    hookCallback(compilation, () => {
      expect(compilation.errors.push).not.toHaveBeenCalled();
      expect(compilation.warnings.push).not.toHaveBeenCalled();
    });
  });
});
