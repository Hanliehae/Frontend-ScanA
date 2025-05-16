import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { IconButton } from 'react-native-paper';
import { logout } from '../store/slices/authSlice';

// Admin Screens
import DashboardScreen from '../screens/admin/DashboardScreen';
import StudentListScreen from '../screens/admin/StudentListScreen';
import CourseListScreen from '../screens/admin/CourseListScreen';
import CourseFormScreen from '../screens/admin/CourseFormScreen';
import CourseDetailScreen from '../screens/admin/CourseDetailScreen';
import ClassDetailScreen from '../screens/admin/ClassDetailScreen';
import MeetingDetailScreen from '../screens/admin/MeetingDetailScreen';
import ScheduleScreen from '../screens/admin/ScheduleScreen';
import MeetingListScreen from '../screens/admin/MeetingListScreen';
import CreateMeetingScreen from '../screens/admin/CreateMeetingScreen';
import HandScanScreen from '../screens/admin/HandScanScreen';
import ExportAttendanceScreen from '../screens/admin/ExportAttendanceScreen';
import RegisterStudentScreen from '../screens/admin/RegisterStudentScreen';
import HistoryScreen from '../screens/admin/HistoryScreen';
import StudentDetailScreen from '../screens/admin/StudentDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AdminTabs = () => {
  const dispatch = useDispatch();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'StudentsTab') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'CoursesTab') {
            iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
          } else if (route.name === 'ScheduleTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'HistoryTab') {
            iconName = focused ? 'history' : 'history';
          }

          return <IconButton icon={iconName} size={size} color={color} />;
        },
        headerRight: () => (
          <IconButton
            icon="logout"
            size={24}
            onPress={() => dispatch(logout())}
          />
        ),
      })}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="StudentsTab" 
        component={StudentListScreen} 
        options={{ title: 'Mahasiswa' }}
      />
      <Tab.Screen 
        name="CoursesTab" 
        component={CourseListScreen} 
        options={{ title: 'Mata Kuliah' }}
      />
      <Tab.Screen 
        name="ScheduleTab" 
        component={ScheduleScreen} 
        options={{ title: 'Jadwal' }}
      />
      <Tab.Screen 
        name="HistoryTab" 
        component={HistoryScreen} 
        options={{ title: 'Riwayat' }}
      />
    </Tab.Navigator>
  );
};

const AdminStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AdminTabs" 
        component={AdminTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreateMeeting" 
        component={CreateMeetingScreen} 
        options={{ title: 'Buat Pertemuan' }}
      />
      <Stack.Screen 
        name="HandScan" 
        component={HandScanScreen} 
        options={{ title: 'Scan Telapak Tangan' }}
      />
      <Stack.Screen 
        name="ExportAttendance" 
        component={ExportAttendanceScreen} 
        options={{ title: 'Export Kehadiran' }}
      />
      <Stack.Screen 
        name="RegisterStudent" 
        component={RegisterStudentScreen} 
        options={{ title: 'Daftar Mahasiswa Baru' }}
      />
      <Stack.Screen 
      name="StudentDetail" component={StudentDetailScreen} />

      <Stack.Screen 
        name="AddCourse" 
        component={CourseFormScreen} 
        options={{ title: 'Tambah Mata Kuliah' }}
      />
      <Stack.Screen 
        name="EditCourse" 
        component={CourseFormScreen} 
        options={{ title: 'Edit Mata Kuliah' }}
      />
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen} 
        options={{ title: 'Detail Mata Kuliah' }}
      />
      <Stack.Screen 
        name="ClassDetail" 
        component={ClassDetailScreen} 
        options={{ title: 'Detail Kelas' }}
      />
      <Stack.Screen 
        name="MeetingDetail" 
        component={MeetingDetailScreen} 
        options={{ title: 'Detail Pertemuan' }}
      />
    </Stack.Navigator>
  );
};

export default AdminStack; 