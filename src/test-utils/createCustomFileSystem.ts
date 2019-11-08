import { NodeJsInputFileSystem } from 'enhanced-resolve';
import { createFsFromVolume, Volume } from 'memfs';

/**
 * Creates mock file system for use with `createResolverContext`.
 *
 * Used in tests.
 *
 * @param files filesystem contents `{ '/colors.tsx': 'export const RED = "red"'; }`
 */
export const createCustomFileSystem = (content: Record<string, string>) => {
  const volume = Volume.fromJSON(content);
  return createFsFromVolume(volume) as NodeJsInputFileSystem;
};
