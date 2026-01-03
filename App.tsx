import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { googleOAuthService } from './src/services';
import { ENV } from './src/config/env';

export default function App() {
  useEffect(() => {
    // Configure Google Sign-In when app starts
    if (ENV.ENABLE_OAUTH && ENV.GOOGLE_WEB_CLIENT_ID) {
      googleOAuthService.configure();
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

