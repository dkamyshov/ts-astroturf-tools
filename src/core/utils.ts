export const getClearCSSCode = (tagContent: string): string => {
  return tagContent.substring(0, tagContent.length - 1).substring(1);
};
