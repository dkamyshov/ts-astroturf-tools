import { NodePath } from '@babel/traverse';
import * as babelTypes from '@babel/types';
import * as ts from 'typescript';
import { packageName } from '../core/constants';
import { getAssignmentsMetadata } from '../core/getAssignmentsMetadata';
import { getMissingIdentifiers } from '../core/getMissingIdentifiers';
import { getUnusedTokens } from '../core/getUnusedTokens';
import * as colors from 'colors';

const plugin = () => {
  const visitor = {
    Program: function(path: NodePath<babelTypes.Program>, stats: any) {
      const filename = stats.file.opts.filename;
      const sourceCode = path.getSource();

      // essentially we are just reusing TS core
      // in the babel plugin
      const sourceFile = ts.createSourceFile(
        stats.file.opts.filename,
        sourceCode,
        ts.ScriptTarget.ESNext
      );

      const assignmentsMetadata = getAssignmentsMetadata(sourceFile);

      assignmentsMetadata.forEach(assignmentMetadata => {
        getMissingIdentifiers(assignmentMetadata).forEach(missingIdentifier => {
          throw new Error(
            colors.red(
              `[${packageName}/babel-plugin] ${filename}:${missingIdentifier.line +
                1}:${missingIdentifier.character + 1}:\n    Identifier "${
                missingIdentifier.name
              }" is missing in corresponding CSS.`
            )
          );
        });

        getUnusedTokens(assignmentMetadata).forEach(unusedToken => {
          console.warn(
            colors.yellow(
              `WARNING [${packageName}/babel-plugin] ${filename}:${unusedToken.line +
                1}:${unusedToken.character + 1}:\n    Identifier "${
                unusedToken.name
              }" is unused. Consider removing it from CSS.`
            )
          );
        });
      });
    },
  };

  return { visitor };
};

export default plugin;
