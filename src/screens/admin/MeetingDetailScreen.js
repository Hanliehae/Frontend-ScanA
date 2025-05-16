import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Text, ActivityIndicator, DataTable, IconButton, Portal, Modal, TextInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MeetingDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { meeting, class: classData, course, meetingIndex } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scanType, setScanType] = useState('check_in'); // 'check_in' or 'check_out'

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

      const response = await api.get(`/class-students/by-class/${classData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const handleScanResult = async (handData) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.post(
        '/attendance/scan',
        {
          meeting_id: meeting.id,
          student_id: selectedStudent.id,
          hand_data: handData,
          type: scanType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showMessage({
        message: 'Success',
        description: 'Absensi berhasil direkam',
        type: 'success',
      });

      setShowScanModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      showMessage({
        message: 'Error',
        description: err.message || 'Gagal merekam absensi',
        type: 'danger',
      });
    }
  };

  const handleScanPress = (student, type) => {
    setSelectedStudent(student);
    setScanType(type);
    setShowScanModal(true);
  };

  const handleOpenCamera = () => {
    setShowScanModal(false);
    navigation.navigate('HandScan', {
      student: selectedStudent,
      type: scanType,
      meetingId: meeting.id
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'green';
      case 'late':
        return 'orange';
      case 'absent':
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>NIM</DataTable.Title>
            <DataTable.Title>Nama</DataTable.Title>
            <DataTable.Title>Jam Masuk</DataTable.Title>
            <DataTable.Title>Jam Keluar</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
          </DataTable.Header>

          {students.map((student) => (
            <DataTable.Row key={student.id}>
              <DataTable.Cell>{student.nim}</DataTable.Cell>
              <DataTable.Cell>{student.name}</DataTable.Cell>
              <DataTable.Cell>
                {student.check_in_time ? (
                  student.check_in_time
                ) : (
                  <IconButton
                    icon="camera"
                    size={20}
                    onPress={() => handleScanPress(student, 'check_in')}
                  />
                )}
              </DataTable.Cell>
              <DataTable.Cell>
                {student.check_out_time ? (
                  student.check_out_time
                ) : (
                  <IconButton
                    icon="camera"
                    size={20}
                    onPress={() => handleScanPress(student, 'check_out')}
                  />
                )}
              </DataTable.Cell>
              <DataTable.Cell>
                <Text style={{ color: getStatusColor(student.status) }}>
                  {student.status}
                </Text>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>

      <Portal>
        <Modal
          visible={showScanModal}
          onDismiss={() => setShowScanModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>
            Scan Tangan {selectedStudent?.name}
          </Text>
          <Text>
            {scanType === 'check_in' ? 'Jam Masuk' : 'Jam Keluar'}
          </Text>
          <Button
            mode="contained"
            onPress={handleOpenCamera}
            style={styles.scanButton}
          >
            Buka Kamera
          </Button>
          <Button
            mode="outlined"
            onPress={() => setShowScanModal(false)}
            style={styles.cancelButton}
          >
            Batal
          </Button>
        </Modal>
      </Portal>
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
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  
  scanButton: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default MeetingDetailScreen; 