import { stylesheet } from 'astroturf';
import styled from 'astroturf/react';
import * as React from 'react';
import { redColor } from './colors';
import { pinkColor } from './moreColors';

export const Button = React.memo(() => {
  return <ButtonStyled className={classA} />;
});

const ButtonStyled = styled.button`
  color: ${redColor};
  background: ${pinkColor};
`;

const { classA } = stylesheet`
  .classA {
    font-size: 1rem;
  }
`;
