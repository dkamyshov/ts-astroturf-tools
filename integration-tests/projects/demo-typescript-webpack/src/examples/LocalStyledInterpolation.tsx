import * as React from 'react';
import styled from 'astroturf/react';

const COLOR = '#3f7ad8';

// this demonstrates basic astroturf's built-in
// functions
const Styled = styled.div`
  color: ${COLOR};
`;

export const LocalStyledInterpolation = () => {
  return <Styled>This text must be {COLOR}</Styled>;
};
