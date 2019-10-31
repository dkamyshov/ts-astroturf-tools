import * as React from 'react';
import { xcss } from '../../../../xcss';

const A = '#FF6633';

// check for:
// - xcss
// - simple interpolations

const someClassName = xcss`
  color: ${A};
`;

export const BasicXCSSInterpolation = React.memo(() => {
  return <div className={someClassName}>This text must be #FF6633</div>;
});
