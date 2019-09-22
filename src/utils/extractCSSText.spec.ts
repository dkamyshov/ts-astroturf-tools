import * as ts from 'typescript';
import { extractTemplateLiteralContent } from './extractTemplateLiteralContent';
import { getTargetNodes } from './getTargetNodes';

describe('extractCSSText', () => {
  it('extracts css text from astroturf css assignment', () => {
    const cssSource = `\` .a { color: #aaa; } \``;
    const referenceSource = `
        import * as React from 'react';

        const { a } = css${cssSource};

        const { label } = {
          label: 'some label'
        };

        export const A = (props) => <div className={a}>{props.children} {label}</div>;
      `;

    const sourceFile = ts.createSourceFile(
      'test.ts',
      referenceSource,
      ts.ScriptTarget.ESNext
    );

    const targetNodes = getTargetNodes(sourceFile);

    expect(targetNodes.length).toBe(1);

    const targetNode = targetNodes[0];

    const extractedText = extractTemplateLiteralContent(targetNode, sourceFile);

    expect(extractedText).toBe(cssSource);
  });
});
