import {
  AssignmentIdentifier,
  AssignmentMetadata,
} from './getAssignmentsMetadata';

/**
 * Computes identifiers that are used in an assignment
 * but are missing in the CSS source.
 *
 *     const { a, b } = css` .a { color: #aaa; } `;
 *                ^
 *
 * @param assignmentMetadata
 */
export const getMissingIdentifiers = (
  assignmentMetadata: AssignmentMetadata
): AssignmentIdentifier[] => {
  return assignmentMetadata.requestedIdentifiers.filter(requestedIdentifier => {
    return (
      assignmentMetadata.availableIdentifiers.filter(availableIdentifier => {
        return availableIdentifier.name === requestedIdentifier.name;
      }).length < 1
    );
  });
};
