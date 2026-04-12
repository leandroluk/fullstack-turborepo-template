import nextra from 'nextra';

const withNextra = nextra({});

export default withNextra({
  allowedDevOrigins: ['*'],
  turbopack: {resolveAlias: {'next-mdx-import-source-file': './src/mdx-components.tsx'}},
});
