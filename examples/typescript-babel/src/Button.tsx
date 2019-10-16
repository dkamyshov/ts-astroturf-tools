import * as React from 'react';
import styled, { css } from 'astroturf';

export const Button = React.memo(() => {
  return <ButtonStyled className={classA} />;
});

const ButtonStyled = styled.button`
  color: red;
`;

const { classA } = css`
  .classA {
    font-size: 1rem;
  }

  .classB {
    font-size: 2rem;
  }
`;
