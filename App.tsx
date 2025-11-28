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

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

function App(): React.JSX.Element {
  const containerRef = useRef(null);

  return (
    <NavigationContainer
      ref={containerRef}
      onReady={() => {
        // This is where navigationIntegration.registerNavigationContainer(containerRef)
        // would be called when Sentry is integrated
        console.log('Navigation container ready');
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
