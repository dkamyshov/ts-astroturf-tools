import * as React from 'react';
import styled, { css } from 'astroturf';

// check for:
// - warnings from other modules

const { classA } = css`
  .classA {
    color: #003df5;
  }

  .classB {
    color: #003df5;
  }
`;

export const LocalNestedIconWithLink = React.memo(() => {
  return (
    <div className={classA}>
      <p>
        This is the "A" component. It must generate a warning during build.
        "colorB" class is unused.
      </p>

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
