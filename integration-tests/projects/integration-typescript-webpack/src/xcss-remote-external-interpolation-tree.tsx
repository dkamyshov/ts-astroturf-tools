// import from non-main file of the external package

import { colors } from 'ts-astroturf-tools-imported-package/lib/colors';
import { xcss } from '../../../../xcss';

export const someClassName = xcss`
  color: ${colors.GREEN};
`;
