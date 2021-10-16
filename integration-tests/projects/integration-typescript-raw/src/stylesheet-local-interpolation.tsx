import { stylesheet } from 'astroturf';

const RED = 'red';

export const { a } = stylesheet`
  .a {
    color: ${RED};
  }
`;
