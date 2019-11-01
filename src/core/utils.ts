import { FileSystem } from './interface';
import * as path from 'path';
import * as fs from 'fs';

export const getClearCSSCode = (tagContent: string): string => {
  return tagContent.substring(0, tagContent.length - 1).substring(1);
};

/**
 * Returns default file system API used by
 * `createResolverContext`.
 */
export const getDefaultFileSystem = (): FileSystem => {
  return {
    dirname: path.dirname,
    resolve: path.resolve,
    existsSync: fs.existsSync as (filename: string) => boolean,
    readFileSync: fs.readFileSync as (filename: string) => Buffer,
    sep: path.sep,
  };
};
