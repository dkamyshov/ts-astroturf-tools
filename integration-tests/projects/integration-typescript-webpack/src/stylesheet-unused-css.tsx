import { stylesheet } from 'astroturf';

// this should produce a warning about unused classB
export const { classA } = stylesheet`
  .classA {
    color: red;
  }

  .classB {
    color: green;
  }
`;
