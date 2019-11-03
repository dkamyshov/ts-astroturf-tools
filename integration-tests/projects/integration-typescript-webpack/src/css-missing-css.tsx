import { css } from 'astroturf';

// this should produce an error abound missing classB
export const { classA, classB } = css`
  .classA {
    color: red;
  }
`;
