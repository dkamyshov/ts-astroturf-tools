import * as React from 'react';
import { css, stylesheet } from 'astroturf';
import styled from 'astroturf/react';
import { firstLevelExport, secondLevelExport, SomeColors } from './colors';

const cssFirstLevelClassName = css`
  color: ${firstLevelExport};
`;

const cssSecondLevelClassName = css`
  color: ${secondLevelExport};
`;

const cssEnumClassName = css`
  color: ${SomeColors.Green};
`;

const {
  stylesheetFirstLevelClassName,
  stylesheetSecondLevelClassName,
  stylesheetEnumClassName,
} = stylesheet`
  .stylesheetFirstLevelClassName {
    color: ${firstLevelExport};
  }

  .stylesheetSecondLevelClassName {
    color: ${secondLevelExport};
  }

  .stylesheetEnumClassName {
    color: ${SomeColors.Green};
  }
`;

const StyledFirstLevel = styled.div`
  color: ${firstLevelExport};
`;

const StyledSecondLevel = styled.div`
  color: ${secondLevelExport};
`;

const StyledEnum = styled.div`
  color: ${SomeColors.Green};
`;

export const RemoteInterpolation = () => {
  return (
    <div>
      <div className={cssFirstLevelClassName}>
        This text must be {firstLevelExport}; css`...(firstLevelExport)`
      </div>
      <div className={stylesheetFirstLevelClassName}>
        This text must be {firstLevelExport}; stylesheet`...(firstLevelExport)`
      </div>
      <StyledFirstLevel>
        This text must be {firstLevelExport}; style.div`...(firstLevelExport)`
      </StyledFirstLevel>

      <div className={cssSecondLevelClassName}>
        This text must be {secondLevelExport}; css`...(secondLevelExport)`
      </div>
      <div className={stylesheetSecondLevelClassName}>
        This text must be {secondLevelExport};
        stylesheet`...(secondLevelExport)`
      </div>
      <StyledSecondLevel>
        This text must be {secondLevelExport};
        styled.div`...(secondLevelExport)`
      </StyledSecondLevel>

      <div className={cssEnumClassName}>
        This text must be {SomeColors.Green}; css`...(SomeColors.Green)`
      </div>
      <div className={stylesheetEnumClassName}>
        This text must be {SomeColors.Green}; stylesheet`...(SomeColors.green)`
      </div>
      <StyledEnum>
        This text must be {SomeColors.Green}; styled.div`...(SomeColors.green)`
      </StyledEnum>
    </div>
  );
};
