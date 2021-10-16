import { stylesheet } from 'astroturf';
import { GREEN, RED } from './utils/colors';

export const { a } = stylesheet`
  .a {
    color: ${RED};
    background: ${GREEN};
  }
`;
