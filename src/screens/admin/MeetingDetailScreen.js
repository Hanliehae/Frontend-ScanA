import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TABLE_PADDING = 16;
const NIM_WIDTH = 100;
const NAME_WIDTH = 150;
const TIME_WIDTH = 100;
const STATUS_WIDTH = 100;

const MeetingDetailScreen = () => {
  const route = useRoute();
  const { meeting, class: classData, course, meetingIndex } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, [meeting.id]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get(`/class-students/by-class/${classData.id}?meeting_id=${meeting.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data)
      setStudents(response.data.students || []);
    } catch (err) {
      showMessage({
        message: 'Error',
        description: err.message || 'Failed to load students',
        type: 'danger',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hadir':
        return 'green';
      case 'Terlambat':
        return 'orange';
      case 'Belum Hadir':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title>{course.name}</Title>
          <Paragraph>Kelas {classData.name}</Paragraph>
          <Paragraph>Pertemuan {Number(meetingIndex) + 1}</Paragraph>
          <Paragraph>Tanggal: {meeting.date}</Paragraph>
          <Paragraph>Waktu: {meeting.start_time} - {meeting.end_time}</Paragraph>
        </Card.Content>
      </Card>

      <ScrollView
        horizontal={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={[styles.headerCell, { width: NIM_WIDTH }]}>
              <Text style={styles.headerText}>NIM</Text>
            </View>
            <View style={[styles.headerCell, { width: NAME_WIDTH }]}>
              <Text style={styles.headerText}>Nama</Text>
            </View>
            <View style={[styles.headerCell, { width: TIME_WIDTH }]}>
              <Text style={styles.headerText}>Jam Masuk</Text>
            </View>
            <View style={[styles.headerCell, { width: TIME_WIDTH }]}>
              <Text style={styles.headerText}>Jam Keluar</Text>
            </View>
            <View style={[styles.headerCell, { width: STATUS_WIDTH }]}>
              <Text style={styles.headerText}>Status</Text>
            </View>
          </View>

          {/* Table Body */}
          {students.map((student) => (
            <View key={student.id} style={styles.tableRow}>
              <View style={[styles.cell, { width: NIM_WIDTH }]}>
                <Text style={styles.cellText}>{student.nim}</Text>
              </View>
              <View style={[styles.cell, { width: NAME_WIDTH }]}>
                <Text style={styles.cellText} numberOfLines={1}>{student.name}</Text>
              </View>
              <View style={[styles.cell, { width: TIME_WIDTH }]}>
                <Text style={styles.cellText}>{student.check_in_time || '-'}</Text>
              </View>
              <View style={[styles.cell, { width: TIME_WIDTH }]}>
                <Text style={styles.cellText}>{student.check_out_time || '-'}</Text>
              </View>
              <View style={[styles.cell, { width: STATUS_WIDTH }]}>
                <Text style={[styles.cellText, { color: getStatusColor(student.status) }]}>
                  {student.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableContainer: {
    margin: TABLE_PADDING,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    minWidth: SCREEN_WIDTH - (TABLE_PADDING * 2),
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerCell: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cell: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  cellText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default MeetingDetailScreen; 