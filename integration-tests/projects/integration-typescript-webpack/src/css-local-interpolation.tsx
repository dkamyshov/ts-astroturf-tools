import { css } from 'astroturf';

const RED = 'red';
const GREEN = 'green';

export const { classA, classB } = css`
  .classA {
    color: ${RED};
  }

  .classB {
    color: ${GREEN};
  }
`;
