const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];
config.resolver.assetExts.push('md');

module.exports = config; 