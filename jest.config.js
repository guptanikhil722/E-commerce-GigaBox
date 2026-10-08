module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-redux|@reduxjs|immer|@tanstack|@react-navigation|react-native-maps|@react-native-async-storage)/)',
  ],
};




