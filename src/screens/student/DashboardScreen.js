import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Fetch student info and today's schedule
      const [studentResponse, scheduleResponse] = await Promise.all([
        api.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/student/schedule/today', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setStudentInfo(studentResponse.data.data);
      setTodaySchedule(scheduleResponse.data.data || []);
    } catch (err) {
      showMessage({
        message: 'Error',
        description: err.message || 'Failed to load student data',
        type: 'danger',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudentData();
  };

  const quickActions = [
    {
      title: 'Mata Kuliah',
      icon: 'book-open-page-variant',
      onPress: () => navigation.navigate('CoursesTab'),
    },
    {
      title: 'Riwayat',
      icon: 'history',
      onPress: () => navigation.navigate('HistoryTab'),
    },
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Title>Selamat Datang, {studentInfo?.name || 'Mahasiswa'}!</Title>
          <Paragraph>Berikut adalah jadwal perkuliahan hari ini.</Paragraph>
          <View style={styles.semesterInfo}>
            <Text style={styles.semesterText}>
              Semester Ganjil Tahun Ajaran 2024/2025
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.scheduleCard}>
        <Card.Content>
          <Title>Jadwal Hari Ini</Title>
          {todaySchedule.length === 0 ? (
            <Paragraph>Tidak ada jadwal perkuliahan hari ini.</Paragraph>
          ) : (
            todaySchedule.map((item) => {
              const now = new Date();
              const startTime = new Date(`${item.date}T${item.start_time}`);
              const endTime = new Date(`${item.date}T${item.end_time}`);

              let status = 'Tidak Diketahui';
              if (now < startTime) {
                status = 'Belum Dimulai';
              } else if (now >= startTime && now <= endTime) {
                status = 'Sedang Berlangsung';
              } else {
                status = 'Selesai';
              }

              return (
                <View key={item.id} style={styles.scheduleItem}>
                  <Text style={styles.courseName}>{item.course?.name || 'Mata Kuliah'}</Text>
                  <Text>Waktu: {item.start_time} - {item.end_time}</Text>
                  <Text>Ruangan: {item.room || 'Belum ditentukan'}</Text>
                  <Text style={[
                    styles.status,
                    status === 'Sedang Berlangsung' ? styles.statusActive : 
                    status === 'Selesai' ? styles.statusEnded : styles.statusUpcoming
                  ]}>
                    {status}
                  </Text>
                </View>
              );
            })
          )}
        </Card.Content>
      </Card>

      <View style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <Card
            key={index}
            style={styles.actionCard}
            onPress={action.onPress}
          >
            <Card.Content style={styles.actionContent}>
              <Button
                icon={action.icon}
                mode="contained"
                style={styles.actionButton}
                onPress={action.onPress}
              >
                {action.title}
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeCard: {
    marginBottom: 16,
  },
  semesterInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
  },
  semesterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
  },
  scheduleCard: {
    marginBottom: 16,
  },
  scheduleItem: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  status: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  statusActive: {
    color: '#4CAF50',
  },
  statusEnded: {
    color: '#F44336',
  },
  statusUpcoming: {
    color: '#2196F3',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 16,
  },
  actionContent: {
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
  },
});

export default DashboardScreen; 