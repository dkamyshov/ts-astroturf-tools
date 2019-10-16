import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled, { css } from 'astroturf';
import { xcss } from '../../../xcss';
import { A } from './A';
import { B } from './B';
import { LinkComponent } from '../../typescript-babel/lib';

const StyledAstroturfComponent = styled.div`
  padding: 0.5rem;
  color: green;
  border: 1px solid green;
`;

const simpleClassDeclaration = xcss`
  padding: 0.5rem;
  color: blue;
  border: 1px solid blue;
`;

const classes = {
  simpleClassProperty: xcss`
    padding: 0.5rem;
    color: lightblue;
    border: 1px solid lightblue;
  `,
};

const { basicA } = css`
  .basicA {
    color: green;
  }
`;

ReactDOM.render(
  <>
    <StyledAstroturfComponent>
      This is basic astroturf component.
    </StyledAstroturfComponent>
    <div className={simpleClassDeclaration}>
      This is an xcss-based class (via variable declaration).
    </div>
    <div className={classes.simpleClassProperty}>
      This is an xcss-based class (via property).
    </div>
    <div className={basicA}>This is a css-based class.</div>
    <A />
    <B />
    <div>
      External linked component:
      <LinkComponent />
    </div>
  </>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
