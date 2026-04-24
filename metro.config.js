const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Fix for "Failed to get the SHA-1 for: .../web.css" on Vercel
// We add the node_modules directory to watchFolders and ensure the cache is handled correctly.
config.watchFolders = [
  ...config.watchFolders,
  path.resolve(__dirname, "node_modules"),
];

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Disable forceWriteFileSystem in CI/Vercel as it causes SHA-1 resolution errors
  forceWriteFileSystem: false,
});
