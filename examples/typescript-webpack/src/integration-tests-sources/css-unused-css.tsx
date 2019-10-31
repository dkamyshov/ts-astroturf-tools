import { css } from 'astroturf';

// this should produce a warning about unused classB
export const { classA } = css`
  .classA {
    color: red;
  }

  .classB {
    color: green;
  }
`;
