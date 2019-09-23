import { getUnusedTokens } from './getUnusedTokens';
import { AssignmentMetadata } from './getAssignmentsMetadata';

describe('getUnusedTokens', () => {
  it('finds unused tokens', () => {
    const assignmentMetadata: AssignmentMetadata = {
      from: 0,
      to: 100,
      bindingFrom: 0,
      bindingTo: 10,
      requestedIdentifiers: [
        {
          from: 3,
          to: 4,
          line: 0,
          character: 0,
          name: 'a',
        },
        {
          from: 6,
          to: 8,
          line: 0,
          character: 0,
          name: 'b',
        },
      ],
      availableIdentifiers: [
        {
          from: 20,
          to: 22,
          line: 0,
          character: 0,
          name: 'a',
        },
        {
          from: 30,
          to: 32,
          line: 0,
          character: 0,
          name: 'c',
        },
      ],
    };

    expect(getUnusedTokens(assignmentMetadata)).toEqual([
      {
        from: 30,
        to: 32,
        line: 0,
        character: 0,
        name: 'c',
      },
    ]);
  });
});
