import * as React from 'react';
import styled, { css } from 'astroturf';

// check for:
// - warnings from other modules

const { classA } = css`
  .classA {
    color: red;
  }

  .classB {
    color: blue;
  }
`;

export const A = React.memo(() => {
  return (
    <div className={classA}>
      A!
      <Link>
        <Icon />
        Hello!
      </Link>
    </div>
  );
});

const Link = styled.a`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  background: papayawhip;
  color: palevioletred;
`;

const Icon = styled.div`
  flex: none;
  transition: fill 0.25s;
  width: 48px;
  height: 48px;

  ${Link}:hover & {
    background-color: rebeccapurple;
  }
`;
