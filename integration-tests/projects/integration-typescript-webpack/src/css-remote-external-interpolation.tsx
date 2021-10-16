// import from the "main" file of the external package

import { RED } from 'ts-astroturf-tools-imported-package';
import { css } from 'astroturf';

export const someClassName = css`
  color: ${RED};
`;
