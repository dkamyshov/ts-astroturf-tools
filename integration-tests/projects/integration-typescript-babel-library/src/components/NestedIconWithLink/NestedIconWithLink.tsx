import styled from 'astroturf/react';
import * as React from 'react';

export const NestedIconWithLink = () => {
  return (
    <Link>
      <Icon />
      Hello!
    </Link>
  );
};

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
