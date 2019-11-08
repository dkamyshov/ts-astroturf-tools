// import from the "main" file of the external package

import { RED } from 'ts-astroturf-tools-imported-package';
import { xcss } from '../../../../xcss';

export const someClassName = xcss`
  color: ${RED};
`;
