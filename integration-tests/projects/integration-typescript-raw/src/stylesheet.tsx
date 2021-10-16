import { stylesheet } from 'astroturf';

export const { classA, classB } = stylesheet`
  .classA {
    color: red;
  }

  .classB {
    color: green;
  }
`;
