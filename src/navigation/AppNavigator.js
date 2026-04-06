import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookMarked, Settings, Star, Quote } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ReaderScreen from '../screens/ReaderScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DetailScreen from '../screens/DetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import QuoteScreen from '../screens/QuoteScreen';
import { useThemeStore } from '../store/themeStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function MainTabs() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const initNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📚 Edebi Akşamlar!",
          body: "Günün yorgunluğunu klasikler dünyasında atmak için mükemmel bir zaman. Hemen uygulamaya dönün!",
          sound: true,
        },
        trigger: {
          hour: 20,
          minute: 30,
          repeats: true,
        },
      });
    };
    initNotifications();
  }, []);
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          elevation: 0,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Keşfet" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Kitaplığım" 
        component={LibraryScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <BookMarked color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Favoriler" 
        component={FavoritesScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Star color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Alıntılar" 
        component={QuoteScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Quote color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Tasarım" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useThemeStore();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
