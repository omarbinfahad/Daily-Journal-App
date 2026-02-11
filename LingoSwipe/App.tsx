import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { onAuthStateChanged } from 'firebase/auth';
import AppNavigator from './src/navigation/AppNavigator';
import { auth } from './src/config/firebase';
import { useAppStore } from './src/stores/useAppStore';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setUserId, loadUserProgress, setIsOnline } = useAppStore();

  useEffect(() => {
    const initializeNetwork = async () => {
      const netInfo = await NetInfo.fetch();
      setIsOnline(netInfo.isConnected ?? false);
    };

    void initializeNetwork();

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUserId(user.uid);
          await loadUserProgress(user.uid);
        } else {
          setUserId(null);
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, [loadUserProgress, setIsOnline, setUserId]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#4A9B8E" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
