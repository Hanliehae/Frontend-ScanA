import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { store } from './src/store';
import FlashMessage from 'react-native-flash-message';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <StoreProvider store={store}>
      <PaperProvider>
        <AppNavigator />
        <FlashMessage position="top" />
      </PaperProvider>
    </StoreProvider>
  );
}
