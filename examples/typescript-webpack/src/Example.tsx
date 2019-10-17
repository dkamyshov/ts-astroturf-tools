import * as React from 'react';

export const Example = React.memo<{
  caption: string;
  children?: React.ReactNode;
}>(props => {
  return (
    <div className="example">
      <h3
        style={{
          color: 'black',
        }}
      >
        {props.caption}
      </h3>
      {props.children}
    </div>
  );
});
