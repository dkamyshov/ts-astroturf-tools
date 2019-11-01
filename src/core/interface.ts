/**
 * File system interface that is used by `createResolverContext`.
 */
export interface FileSystem {
  dirname: (filename: string) => string;
  resolve: (...parts: string[]) => string;
  existsSync: (filename: string) => boolean;
  readFileSync: (filename: string) => Buffer;
  sep: string;
}
