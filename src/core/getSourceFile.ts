import * as internalTs from 'typescript';
import * as tsserver from 'typescript/lib/tsserverlibrary';

export const getSourceFile = (
  info: tsserver.server.PluginCreateInfo,
  fileName: string
): internalTs.SourceFile => {
  const program = info.languageService.getProgram();

  if (!program) {
    throw new Error();
  }

  const sourceFile = program.getSourceFile(fileName);

  if (!sourceFile) {
    throw new Error();
  }

  return sourceFile;
};
