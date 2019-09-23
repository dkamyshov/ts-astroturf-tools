import { getMissingIdentifiers } from './getMissingIdentifiers';
import { AssignmentMetadata } from './getAssignmentsMetadata';

describe('getMissingIdentifiers', () => {
  it('finds missing identifiers', () => {
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
      ],
    };

    expect(getMissingIdentifiers(assignmentMetadata)).toEqual([
      {
        from: 6,
        to: 8,
        line: 0,
        character: 0,
        name: 'b',
      },
    ]);
  });
});
