const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          '@chordcraft/common'
        ]
      }
    },
    argv
  );

  // Add resolution for @chordcraft/common
  config.resolve.alias = {
    ...config.resolve.alias,
    '@chordcraft/common': path.resolve(__dirname, '../common/src')
  };

  return config;
};