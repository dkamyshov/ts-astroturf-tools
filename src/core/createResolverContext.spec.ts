import * as path from 'path';
import { createCustomFileSystem } from '../test-utils/createCustomFileSystem';
import { createResolverContext } from './createResolverContext';

describe('createResolverContext', () => {
  it('fails to read the file', () => {
    const mockfs = createCustomFileSystem({});
    const context = createResolverContext(void 0, mockfs);
    expect(() => {
      context.resolverRequire('/file.tsx', './module');
    }).toThrow('Unable to find "./module" in "/"');
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
});
