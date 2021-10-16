import { css } from 'astroturf';
import styled from 'astroturf/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { NestedIconWithLink } from '../../integration-typescript-babel-library/lib';
import { CSSInterpolationFromImportedFile } from './examples/InterpolationFromImportedFile';
import { LocalInterpolation } from './examples/LocalInterpolation';
import { RemoteInterpolation } from './examples/RemoteInterpolation';
import { LocalNestedIconWithLink } from './examples/LocalNestedIconWithLink';

const PINK = 'pink';

const StyledAstroturfComponent = styled.div`
  padding: 0.25rem;
  color: #3366ff;
  border: 1px solid #3366ff;
`;

const ComposedComponent = styled(StyledAstroturfComponent)`
  background: ${PINK};
`;

const classes = {
  simpleClassProperty: css`
    padding: 0.25rem;
    color: #cc33ff;
    border: 1px solid #cc33ff;
  `,
};

const tableClassName = css`
  border-collapse: collapse;
  margin: 0.5rem;

  td {
    padding: 0.5rem;
    border: 1px solid black;
  }
`;

const App = React.memo(() => {
  return (
    <div>
      <table className={tableClassName}>
        <tbody>
          <tr>
            <td>local interpolation (built-in)</td>
            <td>
              <LocalInterpolation />
            </td>
          </tr>
          <tr>
            <td>css`...` property assignment (built-in)</td>
            <td>
              <div className={classes.simpleClassProperty}>Hello!</div>
            </td>
          </tr>
          <tr>
            <td>composed component (built-in)</td>
            <td>
              <ComposedComponent>Hi!</ComposedComponent>
            </td>
          </tr>
          <tr>
            <td>basic styled component (built-in)</td>
            <td>
              <StyledAstroturfComponent>Hello!</StyledAstroturfComponent>
            </td>
          </tr>
          <tr>
            <td>remote interpolation</td>
            <td>
              <RemoteInterpolation />
            </td>
          </tr>
          <tr>
            <td>
              component with dependent styled components and an unused CSS
              warning
            </td>
            <td>
              <LocalNestedIconWithLink />
            </td>
          </tr>
          <tr>
            <td>external linked component</td>
            <td>
              <NestedIconWithLink />
            </td>
          </tr>
          <tr>
            <td>interpolation from imported files</td>
            <td>
              <CSSInterpolationFromImportedFile />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

ReactDOM.render(<App />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}
