import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { NetworkErrorScreen } from '../src/features/network/screens/NetworkErrorScreen';
import AppProviders from '../src/app/providers/AppProviders';

describe('NetworkErrorScreen', () => {
  test('renders full-screen network error UI correctly', async () => {
    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AppProviders>
          <NetworkErrorScreen />
        </AppProviders>,
      );
      await new Promise((resolve) => setTimeout(() => resolve(undefined), 50));
    });

    const root = renderer.root;
    expect(root).toBeDefined();

    // Check presence of offline headline and diagnostics
    const textNodes = root.findAllByType('Text');
    const texts = textNodes.map((node: any) => node.props.children).flat();

    expect(texts.some((t: any) => typeof t === 'string' && t.includes("You're Offline"))).toBe(true);
    expect(texts.some((t: any) => typeof t === 'string' && t.includes('NO INTERNET CONNECTION'))).toBe(true);
    expect(texts.some((t: any) => typeof t === 'string' && t.includes('QUICK TROUBLESHOOTING'))).toBe(true);
    expect(texts.some((t: any) => typeof t === 'string' && t.includes('Try Again'))).toBe(true);

    renderer.unmount();
  });

  test('calls onRetry callback when provided', async () => {
    const onRetryMock = jest.fn().mockResolvedValue(true);
    let renderer: any;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AppProviders>
          <NetworkErrorScreen onRetry={onRetryMock} />
        </AppProviders>,
      );
      await new Promise((resolve) => setTimeout(() => resolve(undefined), 50));
    });

    const root = renderer.root;
    const retryButton = root.findByProps({ accessibilityLabel: 'Retry internet connection' });

    await ReactTestRenderer.act(async () => {
      retryButton.props.onPress();
      await new Promise((resolve) => setTimeout(() => resolve(undefined), 50));
    });

    expect(onRetryMock).toHaveBeenCalled();
    renderer.unmount();
  });
});
