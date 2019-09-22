import {
  AssignmentIdentifier,
  AssignmentMetadata,
} from './getAssignmentsMetadata';

/**
 * Computes tokens from the CSS source that
 * are unused.
 *
 *     const { a } = css` .a { color: #aaa; } .b { color: #bbb; } `;
 *                                             ^
 * @param assignmentMetadata
 */
export const getUnusedTokens = (
  assignmentMetadata: AssignmentMetadata
): AssignmentIdentifier[] => {
  return assignmentMetadata.availableIdentifiers.filter(availableIdentifier => {
    return (
      assignmentMetadata.requestedIdentifiers.filter(requestedIdentifier => {
        return requestedIdentifier.name === availableIdentifier.name;
      }).length < 1
    );
  });
};
