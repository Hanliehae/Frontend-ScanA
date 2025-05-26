import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

// Student Screens
import DashboardScreen from '../screens/student/DashboardScreen';
import CoursesScreen from '../screens/student/CoursesScreen';
import AttendanceHistoryScreen from '../screens/student/AttendanceHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StudentTabs = () => {
  const dispatch = useDispatch();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerRight: () => (
          <MaterialCommunityIcons
            name="logout"
            size={24}
            color="#6200ee"
            style={{ marginRight: 16 }}
            onPress={() => dispatch(logout())}
          />
        ),
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="CoursesTab"
        component={CoursesScreen}
        options={{
          tabBarLabel: 'Mata Kuliah',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-page-variant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={AttendanceHistoryScreen}
        options={{
          tabBarLabel: 'Riwayat',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const StudentStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StudentTabs"
        component={StudentTabs}
        options={{ 
          headerShown: false,
          title: 'Dashboard Mahasiswa'
        }}
      />
    </Stack.Navigator>
  );
};

export default StudentStack; 