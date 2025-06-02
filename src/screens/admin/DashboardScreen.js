import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, useTheme, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalClasses: 0,
    totalMeetings: 0,
    totalAttendance: 0,
    attendanceRate: 0,
    activeMeetings: 0,
    presentStudents: 0
  });

  // Menghitung semester dan tahun ajaran yang sedang berjalan
  const getCurrentSemester = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const semester = currentMonth >= 7 && currentMonth <= 12 ? 'Ganjil' : 'Genap';
    const academicYear = currentMonth >= 7 ? `${currentYear}/${currentYear + 1}` : `${currentYear - 1}/${currentYear}`;
    return { semester, academicYear };
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Fetch all required data
      const [usersResponse, coursesResponse, classesResponse, meetingsResponse, attendanceResponse] = await Promise.all([
        api.get('/user/', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/courses/', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/classes/', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/meetings/all', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/admin/history/', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Calculate statistics
      const totalStudents = usersResponse.data.users?.length || 0;
      const totalCourses = coursesResponse.data.courses?.length || 0;
      const totalClasses = classesResponse.data.data.classes?.length || 0;
      const totalMeetings = meetingsResponse.data.data?.meetings?.length || 0;
      const totalAttendance = attendanceResponse.data.data?.history?.length || 0;
      
      // Calculate attendance rate
      const attendanceRate = totalMeetings > 0 ? (totalAttendance / (totalStudents * totalMeetings)) * 100 : 0;

      // Get active meetings and present students for today
      const today = new Date().toLocaleDateString('en-CA');
      const todayMeetingsData = meetingsResponse.data.data?.meetings?.filter(meeting => 
        meeting.date === today
      ) || [];

      setTodayMeetings(todayMeetingsData);


      const presentStudents = attendanceResponse.data.data?.history?.filter(record => 
        record.meeting.date === today && record.status === 'present'
      ).length || 0;

      setStats({
        totalStudents,
        totalCourses,
        totalClasses,
        totalMeetings,
        totalAttendance,
        attendanceRate,
        presentStudents
      });
    } catch (err) {
      showMessage({
        message: 'Error',
        description: err.message || 'Failed to load dashboard data',
        type: 'danger',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const quickActions = [
    // Menghapus quick actions yang tidak diperlukan
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
          <Title>Selamat Datang, Admin!</Title>
          <Paragraph>Anda dapat mengelola kehadiran mahasiswa melalui aplikasi ini.</Paragraph>
          <View style={styles.semesterInfo}>
            <Text style={styles.semesterText}>
              Semester {getCurrentSemester().semester} Tahun Ajaran {getCurrentSemester().academicYear}
            </Text>
          </View>
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

      <Card style={styles.statsCard}>
        <Card.Content>
          <Title>Pertemuan Hari Ini</Title>
          {todayMeetings.length === 0 ? (
            <Paragraph>Tidak ada pertemuan hari ini.</Paragraph>
          ) : (
            todayMeetings.map((meeting, index) => {
              const now = new Date();
              const meetingStart = new Date(`${meeting.date}T${meeting.start_time}`);
              const meetingEnd = new Date(`${meeting.date}T${meeting.end_time}`);

              let status = 'Tidak Diketahui';
              let isEnded = false;
              let canScanIn = true;
              let canScanOut = true;

              if (now < meetingStart) {
                status = 'Belum Dimulai';
                canScanOut = false;
              } else if (now >= meetingStart && now <= meetingEnd) {
                status = 'Sedang Berlangsung';
              } else if (now > meetingEnd) {
                status = 'Selesai';
                isEnded = true;
                canScanIn = false;
              }

              // Detail tambahan
              return (
                <View key={index} style={styles.meetingItem}>
                  <View style={styles.meetingContent}>
                    <Paragraph style={styles.meetingTitle}>
                      {meeting.class?.name || 'Kelas'} - {meeting.course?.name || 'Mata Kuliah'}
                    </Paragraph>
                    <Paragraph style={styles.meetingDetail}>
                      Tanggal: {meeting.date || 'N/A'}
                    </Paragraph>
                    <Paragraph style={styles.meetingDetail}>
                      Jam: {meeting.start_time || 'N/A'} - {meeting.end_time || 'N/A'}
                    </Paragraph>
                    {meeting.room && (
                      <Paragraph style={styles.meetingDetail}>
                        Ruangan: {meeting.room}
                      </Paragraph>
                    )}
                    <Paragraph style={styles.meetingDetail}>
                      Status: {status}
                    </Paragraph>
                    {!canScanIn && canScanOut && (
                      <Paragraph style={styles.scanMessage}>
                        Hanya tersedia scan keluar
                      </Paragraph>
                    )}
                    {isEnded && !canScanIn && !canScanOut && (
                      <Paragraph style={styles.endedMessage}>
                        Pertemuan telah selesai. Scan tidak tersedia.
                      </Paragraph>
                    )}
                  </View>
                  <View style={styles.scanButtons}>
                    <Button
                      mode="contained"
                      icon="login"
                      onPress={() => navigation.navigate('HandScan', { 
                        meetingId: meeting.id,
                        scanType: 'in'
                      })}
                      style={[styles.scanButton, styles.scanInButton]}
                      disabled={!canScanIn}
                    >
                      Masuk
                    </Button>
                    <Button
                      mode="contained"
                      icon="logout"
                      onPress={() => navigation.navigate('HandScan', { 
                        meetingId: meeting.id,
                        scanType: 'out'
                      })}
                      style={[styles.scanButton, styles.scanOutButton]}
                      disabled={!canScanOut}
                    >
                      Keluar
                    </Button>
                  </View>
                </View>
              );
            })
          )}
        </Card.Content>
      </Card>


      <Card style={styles.statsCard}>
        <Card.Content>
          <Title>Statistik Keseluruhan</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Paragraph style={styles.statValue}>{stats.totalStudents}</Paragraph>
              <Paragraph style={styles.statLabel}>Total Mahasiswa</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Paragraph style={styles.statValue}>{stats.totalCourses}</Paragraph>
              <Paragraph style={styles.statLabel}>Total Mata Kuliah</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Paragraph style={styles.statValue}>{stats.totalClasses}</Paragraph>
              <Paragraph style={styles.statLabel}>Total Kelas</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Paragraph style={styles.statValue}>{stats.totalMeetings}</Paragraph>
              <Paragraph style={styles.statLabel}>Total Pertemuan</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Paragraph style={styles.statValue}>{stats.totalAttendance}</Paragraph>
              <Paragraph style={styles.statLabel}>Total Kehadiran</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Paragraph style={styles.statValue}>{stats.attendanceRate.toFixed(1)}%</Paragraph>
              <Paragraph style={styles.statLabel}>Rata-rata Kehadiran</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeCard: {
    margin: 16,
    marginBottom: 8,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
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
  statsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: 'gray',
  },
  meetingItem: {
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meetingContent: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  meetingDetail: {
    fontSize: 14,
    color: '#555',
  },
  scanMessage: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
    marginTop: 4,
  },
  endedMessage: {
    fontSize: 12,
    color: '#F44336',
    fontStyle: 'italic',
    marginTop: 4,
  },
  scanButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  scanButton: {
    marginLeft: 10,
  },
  scanInButton: {
    backgroundColor: '#4CAF50', // Warna hijau untuk scan masuk
  },
  scanOutButton: {
    backgroundColor: '#F44336', // Warna merah untuk scan keluar
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
});

export default DashboardScreen; 