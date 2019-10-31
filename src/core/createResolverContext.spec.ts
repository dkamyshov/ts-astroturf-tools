import * as path from 'path';
import { createResolverContext } from './createResolverContext';

const createCustomFileSystem = (files: Record<string, string>) => {
  const dirname = path.dirname;

  const resolve = (...parts: string[]): string => path.resolve('/', ...parts);

  const existsSync = (filename: string) =>
    Object.prototype.hasOwnProperty.call(files, filename);

  const readFileSync = (filename: string) => {
    if (existsSync(filename)) {
      return Buffer.from(files[filename], 'utf8');
    } else {
      throw new Error(`[createCustomFileSystem] "${filename}" does not exist!`);
    }
  };

  return {
    dirname,
    resolve,
    existsSync,
    readFileSync,
  };
};

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
