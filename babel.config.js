module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      'next/babel',
      '@zeit/next-typescript/babel',
      '@babel/preset-typescript',
    ],
    plugins: [
      '@babel/proposal-class-properties',
    ],
  };
};
