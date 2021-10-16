import * as React from 'react';
import { stylesheet } from 'astroturf';
import styled from 'astroturf/react';

// check for:
// - warnings from other modules

const { classA } = stylesheet`
  .classA {
    color: #003df5;
  }

  .colorB {
    color: red;
  }
`;

const Link = styled.a`
  display: flex;
  align-items: center;
  padding: 1px 2px;
  background: papayawhip;
  color: palevioletred;
`;

const Icon = styled.div`
  flex: none;
  transition: fill 0.25s;
  width: 16px;
  height: 16px;

  ${Link}:hover & {
    background-color: rebeccapurple;
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
