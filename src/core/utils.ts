export const getClearCSSCode = (tagContent: string): string => {
  return tagContent.substring(0, tagContent.length - 1).substring(1);
};

export const getClearTemplateHead = (templateHead: string) => {
  return templateHead.substring(0, templateHead.length - 2).substring(1);
};
