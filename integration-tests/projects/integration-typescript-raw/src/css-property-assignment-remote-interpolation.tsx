import { RED, GREEN } from './utils/colors';
import { css } from 'astroturf';

export const classes = {
  someClassName: css`
    color: ${RED};
    background: ${GREEN};
  `,
};
