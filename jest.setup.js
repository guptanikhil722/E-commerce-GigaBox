/* eslint-env jest */
const React = require('react');

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  clear: jest.fn(() => Promise.resolve(null)),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve(null)),
  multiRemove: jest.fn(() => Promise.resolve(null)),
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
  ...mockAsyncStorage,
}));

// Mock react-native-safe-area-context
const mockSafeAreaContext = require('react-native-safe-area-context/jest/mock').default;
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props) => <View testID="mock-map-view" {...props} />;
  const MockMarker = (props) => <View testID="mock-marker" {...props} />;
  MockMarker.Animated = MockMarker;
  const MockPolyline = (props) => <View testID="mock-polyline" {...props} />;

  class MockAnimatedRegion {
    constructor(coords) {
      this.latitude = coords?.latitude || 0;
      this.longitude = coords?.longitude || 0;
      this.latitudeDelta = coords?.latitudeDelta || 0;
      this.longitudeDelta = coords?.longitudeDelta || 0;
    }
    timing() {
      return { start: (cb) => cb && cb() };
    }
    setValue() {}
  }

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Polyline: MockPolyline,
    AnimatedRegion: MockAnimatedRegion,
    PROVIDER_GOOGLE: 'google',
    PROVIDER_DEFAULT: 'default',
  };
});

// Mock @react-native-community/netinfo
const mockNetInfoState = {
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
  details: { isConnectionExpensive: false },
};

const mockNetInfo = {
  configure: jest.fn(),
  fetch: jest.fn(() => Promise.resolve(mockNetInfoState)),
  addEventListener: jest.fn((callback) => {
    callback(mockNetInfoState);
    return jest.fn();
  }),
  useNetInfo: jest.fn(() => mockNetInfoState),
};

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: mockNetInfo,
  ...mockNetInfo,
}));
