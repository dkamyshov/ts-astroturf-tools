import * as internalTs from 'typescript';
import { tokensRegExp } from './constants';
import { extractTemplateLiteralContent } from './extractTemplateLiteralContent';
import { findAllNodes } from './findAllNodes';
import { getFirstLevelIdentifiers } from './getFirstLevelIdentifiers';
import { getTargetNodes } from './getTargetNodes';

export interface AssignmentIdentifier {
  /**
   * Position where identifier starts.
   */
  from: number;

  /**
   * Position where identifier ends.
   */
  to: number;

  /**
   * Line where identifier is located.
   */
  line: number;

  /**
   * Position in line where identifier starts.
   */
  character: number;

  /**
   * Name of the identifier.
   */
  name: string;
}

export interface AssignmentCSSIdentifier {
  /**
   * Position where identifier starts.
   */
  from: number;

  /**
   * Position where identifier ends.
   */
  to: number;

  /**
   * Line where identifier is located.
   */
  line: number;

  /**
   * Position in line where identifier starts.
   */
  character: number;

  /**
   * Name of the identifier.
   */
  name: string;
}

export interface AssignmentMetadata {
  /**
   * Position where assignment starts.
   */
  from: number;

  /**
   * Position where assignment ends.
   */
  to: number;

  /**
   * Position where binding (` { a, b, c} `) starts.
   */
  bindingFrom: number;

  /**
   * Position where binding ends.
   */
  bindingTo: number;

  /**
   * Identifiers listed in binding.
   */
  requestedIdentifiers: AssignmentIdentifier[];

  /**
   * Identifiers in CSS code.
   */
  availableIdentifiers: AssignmentCSSIdentifier[];
}

/**
 * Returns all CSS assignments in a given file.
 *
 * @param file
 */
export const getAssignmentsMetadata = (
  file: internalTs.SourceFile,
  localTs: typeof internalTs
) => {
  const result: AssignmentMetadata[] = [];

  const targetNodes = getTargetNodes(file, localTs);

  targetNodes.forEach(assignmentNode => {
    const objectBindingPattern = findAllNodes(
      assignmentNode,
      n => n.kind === localTs.SyntaxKind.ObjectBindingPattern,
      localTs
    )[0];

    const identifiers = getFirstLevelIdentifiers(assignmentNode, file, localTs);
    const taggedTemplateExpression = assignmentNode.getChildAt(2, file);
    const taggedTemplateExpressionFrom =
      taggedTemplateExpression.getStart(file);
    const cssSource = extractTemplateLiteralContent(assignmentNode, file);
    const clearCssSource = cssSource
      .substring(0, cssSource.length - 1)
      .substring(1);

    const tokens: AssignmentCSSIdentifier[] = [];

    clearCssSource.replace(tokensRegExp, (fullMatch, group, index) => {
      const from = taggedTemplateExpressionFrom + 11 + index;
      const to = from + fullMatch.length;
      const tokenSourcePosition = internalTs.getLineAndCharacterOfPosition(
        file,
        from
      );

      tokens.push({
        name: group,
        from,
        to,
        line: tokenSourcePosition.line,
        character: tokenSourcePosition.character,
      });
      return '';
    });

    if (tokens.length < 1) {
      return;
    }

    result.push({
      from: assignmentNode.getStart(file),
      to: assignmentNode.getEnd(),
      bindingFrom: objectBindingPattern.getStart(file),
      bindingTo: objectBindingPattern.getEnd(),
      requestedIdentifiers: identifiers.map(identifier => {
        const from = identifier.getStart(file);
        const identifierSourcePosition = localTs.getLineAndCharacterOfPosition(
          file,
          from
        );

        return {
          from,
          to: identifier.getEnd(),
          name: identifier.getText(file),
          line: identifierSourcePosition.line,
          character: identifierSourcePosition.character,
        };
      }),
      availableIdentifiers: tokens,
    });
  });

  return result;
};
