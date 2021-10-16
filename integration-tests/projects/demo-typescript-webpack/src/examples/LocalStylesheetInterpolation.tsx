import * as React from 'react';
import { stylesheet } from 'astroturf';

const COLOR = '#89d83f';

// this demonstrates basic astroturf's built-in
// functions
const { className } = stylesheet`
  .className {
    color: ${COLOR};
  }
`;

export const LocalStylesheetInterpolation = () => {
  return <div className={className}>This text must be {COLOR}</div>;
};
