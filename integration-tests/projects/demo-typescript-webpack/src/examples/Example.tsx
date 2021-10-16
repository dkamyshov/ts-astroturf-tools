import { css } from 'astroturf';
import * as React from 'react';

const className = css`
  color: black;
`;

export const Example = React.memo<{
  caption: string;
  children?: React.ReactNode;
}>(props => {
  return (
    <div className="example">
      <h3 className={className}>{props.caption}</h3>
      {props.children}
    </div>
  );
});
