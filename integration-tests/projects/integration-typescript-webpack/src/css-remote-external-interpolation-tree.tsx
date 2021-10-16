// import from non-main file of the external package

import { colors } from 'ts-astroturf-tools-imported-package/lib/colors';
import { css } from 'astroturf';

export const someClassName = css`
  color: ${colors.GREEN};
`;
