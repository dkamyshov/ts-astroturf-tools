import * as path from 'path';
import { FileSystem } from '../core/interface';

/**
 * Creates mock file system for use with `createResolverContext`.
 *
 * Used in tests.
 *
 * @param files filesystem contents `{ '/colors.tsx': 'export const RED = "red"'; }`
 */
export const createCustomFileSystem = (
  files: Record<string, string>
): FileSystem => {
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
    sep: path.sep,
  };
};
