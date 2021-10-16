# ts-astroturf-tools [beta! 🚧]

[![npm](https://img.shields.io/npm/v/ts-astroturf-tools)](https://www.npmjs.com/package/ts-astroturf-tools) [![npm](https://img.shields.io/npm/dm/ts-astroturf-tools)](https://www.npmjs.com/package/ts-astroturf-tools) [![Build Status](https://travis-ci.org/dkamyshov/ts-astroturf-tools.svg?branch=master)](https://travis-ci.org/dkamyshov/ts-astroturf-tools) [![Coverage Status](https://coveralls.io/repos/github/dkamyshov/ts-astroturf-tools/badge.svg?branch=master)](https://coveralls.io/github/dkamyshov/ts-astroturf-tools?branch=master)

This package improves DX for [astroturf](https://github.com/4Catalyzer/astroturf) users.

Compatible with `astroturf@>=1.0.0-beta`, `typescript@>=4` and `webpack@>=5`! For compatibility with `astroturf@>=0.9 <= 1`, use `ts-astroturf-tools@<=0.14.3`.

## Installation

```
yarn add -D ts-astroturf-tools
```

```
npm i --save-dev ts-astroturf-tools
```

## Overview

Features are divided in three major categories:

- [linaria](https://github.com/callstack/linaria)-like functionality
- diagnostic messages
- autocomplete for identifiers

## `linaria`-like functionality

- Use variables declared in other modules inside your CSS:

  ```js
  // * before
  // impossible :(

  // * after
  // colors.tsx
  export const RED = 'red';

  // index.tsx
  import { css } from 'astroturf';
  import { RED } from './colors';

  const btn = css`
    color: ${RED};
  `;

  // works for 'stylesheet' and ...
  import { stylesheet } from 'astroturf';

  const { a } = stylesheet`
    .a {
      color: ${RED};
    }
  `;

  // .. styled components too!
  import styled from 'astroturf/react';

  const Button = styled.button`
    color: ${RED};
  `;
  ```

## Diagnostic messages

These messages are available if you use plain `stylesheet` tag from `astroturf`.

There are two types of diagnostic messages:

- warnings in case there is unused CSS

  Available via:

  - webpack loader
  - babel plugin
  - TS Language Service Plugin (VS Code)

  ```js
  import { stylesheet } from 'astroturf';

  const { btn } = stylesheet`
    .btn {
      color: red;
    }
  
    .active {
      color: green;
    }
  `;
  ```

  The warning will look like this:

  <pre style="color: orange;">
  /path/to/file.js:8:3:
    Identifier "active" is unused. Consider removing it from CSS.
  </pre>

  In VS Code the warning will become a suggestion:

  ![](docs/assets/editor-suggestion.png)

- errors in case there is missing CSS

  Available via:

  - webpack loader
  - babel plugin
  - TS Language Service Plugin (VS Code)

  ```js
  import { stylesheet } from 'astroturf';

  const { btn, active } = stylesheet`
    .btn {
      color: red;
    }
  `;
  ```

  The error will look like this:

  <pre style="color: red;">
  /path/to/file.js:3:14:
    Identifier "active" is missing in corresponding CSS.
  </pre>

  In VS Code:

  ![](docs/assets/editor-error.png)

## Autocomplete for identifiers

Available via:

- TS Language Service Plugin (VS Code)

![](docs/assets/editor-autocomplete.png)

## Quick summary of tools and their respective features

| Tool                       | Diagnostic messages | Autocomplete for identifiers | `linaria`-like functionality |
| -------------------------- | ------------------- | ---------------------------- | ---------------------------- |
| TS Language Service Plugin | ✅                  | ✅                           | `N/A`                        |
| webpack loader             | ✅                  | `N/A`                        | ✅ _optional_                |
| babel plugin               | ✅                  | `N/A`                        | ❌                           |
| TS transformer             | ❌                  | `N/A`                        | ✅                           |

- `N/A` - not applicable

## Configuration

- TS Language Service Plugin

  Add `ts-astroturf-tools` as a plugin to your `tsconfig.json`:

  ```json
  {
    "compilerOptions": {
      "plugins": [
        {
          "name": "ts-astroturf-tools"
        }
      ]
    },
    "files": ["src/index.tsx"],
    "exclude": ["node_modules"]
  }
  ```

  Don't forget to switch to workspace typescript instance:

  ![](docs/assets/workspace-typescript.png)

- TS transformer:

  - raw TypeScript

    You should use [ttypescript](https://www.npmjs.com/package/ttypescript) as a compiler.

    Add `ts-astroturf-tools/transformer` as a transformer to your `tsconfig.json`:

    ```json
    {
      "compilerOptions": {
        "plugins": [
          {
            "transform": "ts-astroturf-tools/transformer"
          }
        ]
      },
      "files": ["src/index.tsx"],
      "exclude": ["node_modules"]
    }
    ```

  - webpack / ts-loader

    ```js
    const transformer = require('ts-astroturf-tools/transformer');

    module.exports = {
      // ...
      module: {
        // ...
        rules: [
          {
            test: /\.tsx$/,
            use: {
              loader: 'ts-loader',
              options: {
                // ...
                getCustomTransformers: () => ({
                  before: [transformer()],
                }),
              },
            },
          },
        ],
      },
    };
    ```

- webpack loader

  Add `ts-astroturf-tools/loader` as a first loader for ts-files:

  ```javascript
  module.exports = {
    // ...
    module: {
      rules: [
        // ...
        {
          test: /\.tsx?$/,
          use: [
            // works with any typescript loader
            'ts-loader',
            'astroturf/loader',
            'ts-astroturf-tools/loader',
          ],
        },
      ],
    },
  };
  ```

  Available options:

  | Option name | Type      | Description                           |
  | ----------- | --------- | ------------------------------------- |
  | `linaria`   | `boolean` | Enables `linaria`-like functionality. |

  Defaults:

  ```javascript
  module.exports = {
    // ...
    module: {
      rules: [
        // ...
        {
          test: /\.tsx?$/,
          use: [
            // works with any typescript loader
            'awesome-typescript-loader',
            'astroturf/loader',
            {
              loader: 'ts-astroturf-tools/loader',
              options: {
                linaria: false,
              },
            },
          ],
        },
      ],
    },
  };
  ```

- Babel plugin

  Add `ts-astroturf-tools/babel-plugin` to your babel plugins:

  ```js
  module.exports = {
    presets: ['@babel/env', '@babel/preset-react'],
    plugins: ['ts-astroturf-tools/babel-plugin'],
  };
  ```

## Known limitations

- Regex-based parser is used to extract CSS class names.

- Limited support for imports

  Supported extensions: `.tsx`, `.ts`, `.js`.

  Files must not contain side-effects, import other heavy modules and / or libraries and code that must be transpiled.

  This is ok:

  ```js
  // a.js
  export const redColor = 'red';

  // b.js
  export const greenColor = 'green';
  export { redColor } from './a.js';

  // index.js
  import { greenColor, redColor } from './a.js';
  import styled from 'astroturf/react';

  const Button = styled.button`
    color: ${redColor};
    background: ${greenColor};
  `;
  ```

  This is **not ok** and will most likely result in an error:

  ```js
  // a.js
  import * as React from 'react';
  import image from './someImage.png';
  export const redColor = 'red';

  export const Something = () => (
    <div style={{ background: `url(${image});` }}>Hello!</div>
  );

  // b.js
  export const greenColor = 'green';
  export { redColor } from './a.js';

  // index.js
  import { greenColor, redColor } from './a.js';
  import styled from 'astroturf/react';

  const Button = styled.button`
    color: ${redColor};
    background: ${greenColor};
  `;
  ```

- Performance issues with imports **(this issue is in progress of being fixed)**

  As of now, files are parsed and executed for each encountered import.

  For example:

  ```js
  // a.js
  export const RED = 'red';

  // b.js
  export { RED } from './a';
  export const GREEN = 'green';

  // ComponentA.js
  import styled from 'astroturf/react';
  import { GREEN } from './b';

  export const ComponentA = styled.div`
    color: ${GREEN};
  `;

  // ComponentB.js
  import styled from 'astroturf/react';
  import { RED } from './b';

  export const ComponentB = styled.div`
    color: ${RED};
  `;
  ```

  In this case both `a.js` and `b.js` will be parsed and executed twice (first for `ComponentA.js` and then for `ComponentB.js`). Keep this in mind and try to avoid creating large dependency trees.

- Limited support for interpolations

  ```javascript
  const WIDTH = '500px';

  // ok
  const { a } = stylesheet`
    .a {
      width: ${WIDTH};
    }
  `;
  ```

  ```javascript
  const NAME = 'someClass';

  //        error
  //      vvvvvvvvv
  const { someClass } = stylesheet`
    .${NAME} {
      color: red;
    }
  `;
  ```

- Only plain CSS is supported.

  Basic features of SASS/LESS/etc. may work:

  ```javascript
  // simple nesting is ok
  const { someClass, anotherClass } = stylesheet`
    .someClass {
      color: red;
  
      &.anotherClass {
        border: 1px solid black;
      }
    }
  `;
  ```

  Advanced features will most probably not work:

  ```javascript
  //                    error!
  //                 vvvvvvvvvvvv
  const { someClass, anotherClass } = stylesheet`
    @name: anotherClass;
  
    .someClass {
      color: red;
  
      &.@{name} {
        color: black;
      }
    }
  `;
  ```

- It is not possible to show errors in case destructuring is not used:

  ```typescript
  const classes = stylesheet`
    .a {
      color: red;
    }
  `;

  console.log(a.b); // <- no error
  ```

  _This is not hugely important because you should always use `css` in the first place._
