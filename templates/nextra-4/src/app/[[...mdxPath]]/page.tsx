import {useMDXComponents as getMDXComponents} from '#/mdx-components';
import {generateStaticParamsFor, importPage} from 'nextra/pages';

export const generateStaticParams = generateStaticParamsFor('mdxPath');

export default async function Page(props: {params: Promise<{mdxPath?: string[]}>}): Promise<React.JSX.Element> {
  const {mdxPath = []} = await props.params;
  const {default: MDXContent, ...wrapperProps} = await importPage(mdxPath);
  const components = getMDXComponents({});
  const Wrapper = components.wrapper as React.ComponentType<Record<string, unknown>>;

  return (
    <Wrapper {...wrapperProps}>
      <MDXContent components={components} />
    </Wrapper>
  );
}
