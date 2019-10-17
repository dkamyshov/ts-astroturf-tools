import styled, { css } from 'astroturf';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { xcss } from '../../../xcss';
import { NestedIconWithLink } from '../../typescript-babel/lib';
import { BasicXCSSInterpolation } from './BasicXCSSInterpolation';
import { Example } from './Example';
import { LocalNestedIconWithLink } from './LocalNestedIconWithLink';

const StyledAstroturfComponent = styled.div`
  padding: 0.5rem;
  color: #3366ff;
  border: 1px solid #3366ff;
`;

const simpleClassDeclaration = xcss`
  padding: 0.5rem;
  color: #6633FF;
  border: 1px solid #6633FF;
`;

const classes = {
  simpleClassProperty: xcss`
    padding: 0.5rem;
    color: #CC33FF;
    border: 1px solid #CC33FF;
  `,
};

const { basicA } = css`
  .basicA {
    padding: 0.5rem;
    color: #ff33cc;
    border: 1px solid #ff33cc;
  }
`;

ReactDOM.render(
  <>
    <Example caption="basic astroturf component">
      <StyledAstroturfComponent>Hello!</StyledAstroturfComponent>
    </Example>

    <Example caption="xcss variable declaration">
      <div className={simpleClassDeclaration}>Hello!</div>
    </Example>

    <Example caption="xcss property assignment">
      <div className={classes.simpleClassProperty}>Hello!</div>
    </Example>

    <Example caption="css destricturing">
      <div className={basicA}>Hello!</div>
    </Example>

    <Example caption="component with dependent styled components and an unused CSS warning">
      <LocalNestedIconWithLink />
    </Example>

    <Example caption="basic xcss interpolation">
      <BasicXCSSInterpolation />
    </Example>

    <Example caption="external linked component">
      <NestedIconWithLink />
    </Example>
  </>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
