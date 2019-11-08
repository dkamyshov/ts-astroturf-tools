import * as path from 'path';
import { createCustomFileSystem } from '../test-utils/createCustomFileSystem';
import { createResolverContext } from './createResolverContext';

describe('createResolverContext', () => {
  it('fails to read the file', () => {
    const mockfs = createCustomFileSystem({});
    const context = createResolverContext(void 0, mockfs);
    expect(() => {
      context.resolverRequire('/file.tsx', './module');
    }).toThrow("Can't resolve './module' in '/'");
  });

  it('reads file and processes its content', () => {
    const mockfs = createCustomFileSystem({
      '/module.tsx': 'export const RED = "red";',
    });
    const context = createResolverContext(void 0, mockfs);
    const localExports = context.resolverRequire('/file.tsx', './module');
    expect(localExports).toEqual({
      RED: 'red',
    });
  });

  it('processes nested imports', () => {
    const mockfs = createCustomFileSystem({
      '/a.tsx': 'export { RED } from "./b";',
      '/b.tsx': 'export const RED = "red";',
    });
    const context = createResolverContext(void 0, mockfs);
    const localExports = context.resolverRequire('/file.tsx', './a');
    expect(localExports).toEqual({
      RED: 'red',
    });
  });

  it('calls watcher callback (when provided)', () => {
    const watcherCallback = jest.fn();
    const mockfs = createCustomFileSystem({
      '/a.tsx': 'export { RED } from "./b";',
      '/b.tsx': 'export const RED = "red";',
    });
    const context = createResolverContext(watcherCallback, mockfs);
    context.resolverRequire('/file.tsx', './a');
    expect(watcherCallback).toHaveBeenNthCalledWith(1, '/b.tsx');
    expect(watcherCallback).toHaveBeenNthCalledWith(2, '/a.tsx');
  });

  it('resolves index file', () => {
    const mockfs = createCustomFileSystem({
      [`/a${path.sep}index.tsx`]: 'export const RED = "red";',
    });
    const context = createResolverContext(void 0, mockfs);
    const localExports = context.resolverRequire('/file.tsx', './a');
    expect(localExports).toEqual({
      RED: 'red',
    });
  });

  it('resolves file from external package', () => {
    const mockfs = createCustomFileSystem({
      '/project/node_modules/external-package/package.json': `{"main":"./lib/index.js"}`,
      '/project/node_modules/external-package/lib/index.js':
        'exports.RED = "red";',
    });
    const context = createResolverContext(void 0, mockfs);
    const localExports = context.resolverRequire(
      '/project/src/index.tsx',
      'external-package'
    );
    expect(localExports).toEqual({
      RED: 'red',
    });
  });

  it('resolves file from external package (not main)', () => {
    const mockfs = createCustomFileSystem({
      '/project/node_modules/external-package/package.json': `{"main":"./lib/index.js"}`,
      '/project/node_modules/external-package/lib/colors.js':
        'exports.colors = {GREEN:"green"};',
      '/project/node_modules/external-package/lib/index.js':
        'exports.RED = "red";',
    });
    const context = createResolverContext(void 0, mockfs);
    const localExports = context.resolverRequire(
      '/project/src/index.tsx',
      'external-package/lib/colors'
    );
    expect(localExports).toEqual({
      colors: {
        GREEN: 'green',
      },
    });
  });
});
