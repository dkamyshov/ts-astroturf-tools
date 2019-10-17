/**
 * Regexp used to extract CSS class names
 * from CSS sources.
 */
export const tokensRegExp = /\.(\D[\w\-]*)/g;

/**
 * Regexp used to clear CSS source of
 * template placeholders.
 */
export const literalsRegExp = /\$\{(.*)\}/g;

export const packageName = 'ts-astroturf-tools';
export const missingIdentifierCode = 1;
export const failedToExecuteCode = 2;
export const unusedTokenCode = 3;
