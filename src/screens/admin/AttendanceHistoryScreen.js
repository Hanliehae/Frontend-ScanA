import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, SegmentedButtons, TextInput, Card, Chip } from 'react-native-paper';

const AttendanceHistoryScreen = () => {
  const [semester, setSemester] = useState('ganjil');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [courseId, setCourseId] = useState('');

  // Mock data
  const mockAttendance = [
    {
      id: 1,
      studentName: 'John Doe',
      nim: '1234567890',
      courseName: 'Pemrograman Mobile',
      class: 'A',
      date: '2024-03-01',
      timeIn: '08:00',
      timeOut: '10:00',
      status: 'Hadir',
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      nim: '0987654321',
      courseName: 'Pemrograman Mobile',
      class: 'A',
      date: '2024-03-01',
      timeIn: '08:05',
      timeOut: '09:55',
      status: 'Hadir',
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'hadir':
        return '#4CAF50';
      case 'terlambat':
        return '#FFC107';
      case 'tidak hadir':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderAttendanceItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Chip
            textStyle={{ color: 'white' }}
            style={{ backgroundColor: getStatusColor(item.status) }}
          >
            {item.status}
          </Chip>
        </View>
        <Text style={styles.nim}>NIM: {item.nim}</Text>
        <Text style={styles.courseInfo}>
          {item.courseName} - Kelas {item.class}
        </Text>
        <View style={styles.timeContainer}>
          <Text>Tanggal: {item.date}</Text>
          <Text>Masuk: {item.timeIn}</Text>
          <Text>Keluar: {item.timeOut}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter</Text>
        <SegmentedButtons
          value={semester}
          onValueChange={setSemester}
          buttons={[
            { value: 'ganjil', label: 'Ganjil' },
            { value: 'genap', label: 'Genap' },
          ]}
          style={styles.segmentedButtons}
        />
        <TextInput
          label="Tahun Akademik"
          value={academicYear}
          onChangeText={setAcademicYear}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
        />
        <TextInput
          label="ID Mata Kuliah"
          value={courseId}
          onChangeText={setCourseId}
          style={styles.input}
          mode="outlined"
        />
      </View>

      <FlatList
        data={mockAttendance}
        renderItem={renderAttendanceItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nim: {
    color: '#666',
    marginBottom: 4,
  },
  courseInfo: {
    marginBottom: 8,
  },
  timeContainer: {
    gap: 4,
  },
});

export default AttendanceHistoryScreen; 