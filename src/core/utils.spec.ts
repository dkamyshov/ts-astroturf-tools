import { getClearCSSCode } from './utils';

describe('utils', () => {
  describe('getClearCSSCode', () => {
    it('filters excess symbols', () => {
      const code = '`color: red;`';
      expect(getClearCSSCode(code)).toBe('color: red;');
    });
  });
});
