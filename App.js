import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { store } from './src/store';
import FlashMessage from 'react-native-flash-message';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider store={store}>
        <PaperProvider>
          <AppNavigator />
          <FlashMessage position="top" />
        </PaperProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
