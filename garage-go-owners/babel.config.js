module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 4 uses the worklets runtime; its Babel plugin must be LAST.
    plugins: ['react-native-worklets/plugin'],
  };
};
