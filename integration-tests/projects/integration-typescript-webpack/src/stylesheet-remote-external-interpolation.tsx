import { stylesheet } from 'astroturf';
import { RED } from 'ts-astroturf-tools-imported-package';

export const { a } = stylesheet`
  .a {
    color: ${RED};
  }
`;
