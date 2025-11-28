/**
 * Reproduction app for Sentry React Native Issue #5074
 * https://github.com/getsentry/sentry-react-native/issues/5074
 *
 * This app demonstrates the issue where replay sessions are not recorded
 * when using both reactNavigationIntegration() and mobileReplayIntegration()
 * with a button that has the sentry-label prop.
 *
 * @format
 */

import React, {useRef} from 'react';
import {Button, View, StyleSheet, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE',
  tracesSampleRate: 0.2,
  environment: 'development',
  appHangTimeoutInterval: 10,
  enableUserInteractionTracing: true,
  replaysSessionSampleRate: 0.0, // No need to record full session
  replaysOnErrorSampleRate: 1.0, // Record a replay for 100% of error sessions
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: false,
      maskAllImages: false,
      maskAllVectors: false,
    }),
    Sentry.reactNativeTracingIntegration(),
    navigationIntegration,
  ],
});

function App(): React.JSX.Element {
  const containerRef = useRef(null);

  return (
    <NavigationContainer
      ref={containerRef}
      onReady={() => {
        navigationIntegration.registerNavigationContainer(containerRef);
      }}>
      <View style={styles.container}>
        <Text style={styles.title}>Sentry Issue #5074 Reproduction</Text>
        <Text style={styles.description}>
          This button has the sentry-label prop which causes replay sessions
          not to be recorded when used with React Navigation integration.
        </Text>
        <Button
          title="Test Crash"
          // Having sentry-label will affect the sentry replay session
          // with sentry-label, iOS not able to record replay session
          // Android totally not able to record replay session
          sentry-label="DISABLE_REPLAY"
          onPress={() => {
            throw new Error('Test Crash New App Replay');
          }}
        />
        <View style={styles.spacer} />
        <Button
          title="Test Button Without sentry-label"
          onPress={() => {
            console.log('Button without sentry-label pressed');
          }}
        />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 20,
  },
  spacer: {
    height: 20,
  },
});

export default Sentry.wrap(App);
