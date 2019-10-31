import { RED, GREEN } from './utils/colors';
import { xcss } from '../../../xcss';

export const classes = {
  someClassName: xcss`
    color: ${RED};
    background: ${GREEN};
  `,
};
