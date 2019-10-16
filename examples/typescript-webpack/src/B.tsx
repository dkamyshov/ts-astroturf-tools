import * as React from 'react';
import { xcss } from '../../../xcss';

const A = 'blue';

// check for:
// - xcss
// - simple interpolations

const someClassName = xcss`
  color: ${A};
`;

export const B = React.memo(() => {
  return <div className={someClassName}>B!</div>;
});
