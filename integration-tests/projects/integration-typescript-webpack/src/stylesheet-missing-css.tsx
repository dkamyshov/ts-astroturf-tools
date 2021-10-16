import { stylesheet } from 'astroturf';

// this should produce an error about missing classB
export const { classA, classB } = stylesheet`
  .classA {
    color: red;
  }
`;
