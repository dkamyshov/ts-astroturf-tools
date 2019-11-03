import styled from 'astroturf';
import * as React from 'react';
import { xcss } from '../../../../xcss';
import { firstLevelExport, secondLevelExport, SomeColors } from './colors';
import { Example } from './Example';

const Wrapper = styled.div`
  padding: 0.25rem;
  color: #33ff66;
  border: 1px solid #33ff66;
`;

const simpleFirstLevelExport = xcss`
  padding: 0.25rem;
  color: ${firstLevelExport};
  border: 1px solid ${firstLevelExport};
`;

const enumFirstLevelExport = xcss`
  padding: 0.25rem;
  color: ${SomeColors.Green};
  border: 1px solid ${SomeColors.Green};
`;

const simpleSecondLevelExport = xcss`
  padding: 0.25rem;
  color: ${secondLevelExport};
  border: 1px solid ${secondLevelExport};
`;

const InterpolatedStyledTag = styled.div`
  padding: 0.25rem;
  color: ${firstLevelExport};
  border: 1px solid ${firstLevelExport};
`;

export const XCSSInterpolationFromImportedFile = React.memo(() => {
  return (
    <Wrapper>
      <Example caption="interpolation from first-level export">
        <div className={simpleFirstLevelExport}>Hello!</div>
      </Example>

      <Example caption="interpolation from enum">
        <div className={enumFirstLevelExport}>Hello!</div>
      </Example>

      <Example caption="interpolation from second-level export">
        <div className={simpleSecondLevelExport}>Hello!</div>
      </Example>

      <Example caption="interpolation in styled.X tag">
        <InterpolatedStyledTag>Hello!</InterpolatedStyledTag>
      </Example>
    </Wrapper>
  );
});
