import * as tsserver from 'typescript/lib/tsserverlibrary';
import {
  missingIdentifierCode,
  packageName,
  unusedTokenCode,
} from '../core/constants';
import { getAssignmentsMetadata } from '../core/getAssignmentsMetadata';
import { getMissingIdentifiers } from '../core/getMissingIdentifiers';
import { getSourceFile } from '../core/getSourceFile';
import { getUnusedTokens } from '../core/getUnusedTokens';

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

      try {
        const assignmentsMetadata = getAssignmentsMetadata(sourceFile, ts);

        assignmentsMetadata.forEach(item => {
          if (item.bindingTo >= position && position >= item.bindingFrom) {
            const unusedIdentifiers = item.availableIdentifiers.filter(
              availableIdentifier => {
                return (
                  item.requestedIdentifiers.filter(requestedIdentifier => {
                    return (
                      requestedIdentifier.name === availableIdentifier.name
                    );
                  }).length < 1
                );
              }
            );

            unusedIdentifiers.forEach(unusedIdentifier => {
              working.entries.push({
                name: unusedIdentifier.name,
                kind: ts.ScriptElementKind.memberVariableElement,
                sortText: unusedIdentifier.name,
                insertText: unusedIdentifier.name,
                isRecommended: true,
              });
            });
          }
        });
      } catch (e) {
        if (e) {
          info.project.projectService.logger.info(
            `[ts-astroturf-tools/plugin] Exception:\n${e.message}\n\n${e.stack}`
          );
        }
      }

      return working;
    };

    proxy.getSemanticDiagnostics = (fileName: string) => {
      const original =
        info.languageService.getSemanticDiagnostics(fileName) || [];

      const result = [...original];

      const sourceFile = getSourceFile(info, fileName);

      try {
        getAssignmentsMetadata(sourceFile, ts).forEach(assignmentMetadata => {
          getMissingIdentifiers(assignmentMetadata).forEach(
            missingIdentifier => {
              result.push({
                source: packageName,
                category: ts.DiagnosticCategory.Error,
                code: missingIdentifierCode,
                file: sourceFile,
                start: missingIdentifier.from,
                length: missingIdentifier.to - missingIdentifier.from,
                messageText: `Identifier "${missingIdentifier.name}" is missing in corresponding CSS.`,
              });
            }
          );

          getUnusedTokens(assignmentMetadata).forEach(unusedToken => {
            result.push({
              source: packageName,
              category: ts.DiagnosticCategory.Suggestion,
              code: unusedTokenCode,
              file: sourceFile,
              start: unusedToken.from,
              length: unusedToken.to - unusedToken.from,
              messageText: `Identifier "${unusedToken.name}" is unused. Consider removing it from CSS.`,
            });
          });
        });
      } catch (e) {
        if (e) {
          info.project.projectService.logger.info(
            `[ts-astroturf-tools/plugin] Exception:\n${e.message}\n\n${e.stack}`
          );
        }
      }

      return result;
    };

    return proxy;
  };

  return { create };
};

export = init;
