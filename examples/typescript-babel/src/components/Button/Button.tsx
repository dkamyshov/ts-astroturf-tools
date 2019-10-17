import styled, { css } from 'astroturf';
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

// warning about unused classB should be generated
const { classA } = css`
  .classA {
    font-size: 1rem;
  }

  .classB {
    font-size: 2rem;
  }
`;
