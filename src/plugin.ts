import * as tsserver from 'typescript/lib/tsserverlibrary';
import {
  failedToExecuteCode,
  missingIdentifierCode,
  packageName,
} from './utils/constants';
import { getIdentifiers } from './utils/getIdentifiers';
import { getMissingIdentifiers } from './utils/getMissingIdentifiers';
import { getSourceFile } from './utils/getSourceFile';
import { getPositionsMetadata } from './utils/getPositionsMetadata';

const init = (modules: { typescript: typeof tsserver }) => {
  const ts = modules.typescript;

  const create = (info: tsserver.server.PluginCreateInfo) => {
    const proxy = { ...info.languageService };

    proxy.getCompletionsAtPosition = (
      fileName: string,
      position: number,
      options: tsserver.GetCompletionsAtPositionOptions | undefined
    ): tsserver.WithMetadata<tsserver.CompletionInfo> | undefined => {
      let original = info.languageService.getCompletionsAtPosition(
        fileName,
        position,
        options
      );

      const working = original
        ? original
        : {
            isGlobalCompletion: false,
            isMemberCompletion: false,
            isNewIdentifierLocation: false,
            entries: [],
          };

      working.entries = [...working.entries];

      const sourceFile = getSourceFile(info, fileName);

      const positionsMetadata = getPositionsMetadata(sourceFile);

      positionsMetadata.forEach(md => {
        if (md.from <= position && md.to >= position) {
          md.available.forEach(a => {
            working.entries.unshift({
              name: a,
              kind: ts.ScriptElementKind.memberVariableElement,
              sortText: a,
              insertText: a,
              isRecommended: true,
            });
          });
        }
      });

      return working;
    };

    proxy.getSemanticDiagnostics = (fileName: string) => {
      const original =
        info.languageService.getSemanticDiagnostics(fileName) || [];
      const result = [...original];

      const sourceFile = getSourceFile(info, fileName);

      try {
        const missingIdentifiers = getMissingIdentifiers(
          getIdentifiers(sourceFile),
          sourceFile
        );

        if (missingIdentifiers.length > 0) {
          missingIdentifiers.forEach(missingIdentifier => {
            result.push({
              source: packageName,
              category: ts.DiagnosticCategory.Error,
              code: missingIdentifierCode,
              file: sourceFile,
              start: missingIdentifier.getStart(),
              length: missingIdentifier.getEnd() - missingIdentifier.getStart(),
              messageText: `Identifier "${missingIdentifier.getText()}" is missing in corresponding CSS.`,
            });
          });
        }
      } catch (e) {
        result.push({
          source: packageName,
          category: ts.DiagnosticCategory.Error,
          code: failedToExecuteCode,
          file: sourceFile,
          start: 0,
          length: 1,
          messageText: `Failed to execute ${packageName}.`,
        });
      }

      return result;
    };

    return proxy;
  };

  return { create };
};

export = init;
