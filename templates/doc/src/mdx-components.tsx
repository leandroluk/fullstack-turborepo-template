import {useMDXComponents as getThemeComponents} from 'nextra-theme-docs';

export function useMDXComponents(components: Record<string, unknown>): Record<string, unknown> {
  const themeComponents = getThemeComponents();
  return {...themeComponents, ...components};
}
