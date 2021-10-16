import { stylesheet } from 'astroturf';
import { colors } from 'ts-astroturf-tools-imported-package/lib/colors';

export const { a } = stylesheet`
  .a {
    color: ${colors.GREEN};
  }
`;
