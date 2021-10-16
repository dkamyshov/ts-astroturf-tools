import * as React from 'react';
import { css, stylesheet } from 'astroturf';
import styled from 'astroturf/react';

const cssColor = '#d64f68';
const cssClassName = css`
  color: ${cssColor};
`;

const stylesheetColor = '#4f83d6';
const { stylesheetClassName } = stylesheet`
  .stylesheetClassName {
    color: ${stylesheetColor};
  }
`;

const styledColor = '#8cd64f';
const Styled = styled.div`
  color: ${styledColor};
`;

export const LocalInterpolation = () => {
  return (
    <div>
      <div className={cssClassName}>This text must be {cssColor}; css`...`</div>
      <div className={stylesheetClassName}>
        This text must be {stylesheetColor}; stylesheet`...`
      </div>
      <Styled>This text must be {styledColor}; styled.X`...`</Styled>
    </div>
  );
};
