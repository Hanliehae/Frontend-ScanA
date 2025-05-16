import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button, Text, SegmentedButtons, TextInput } from 'react-native-paper';

const AttendanceHistoryScreen = () => {
  const [semester, setSemester] = useState('ganjil');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [courseId, setCourseId] = useState('');

  const mockAttendance = [
    {
      id: 1,
      course: 'Pemrograman Dasar',
      class: 'A',
      date: '2024-03-01',
      timeIn: '08:00',
      timeOut: '10:00',
      status: 'Hadir',
    },
    {
      id: 2,
      course: 'Struktur Data',
      class: 'B',
      date: '2024-03-02',
      timeIn: '10:00',
      timeOut: '12:00',
      status: 'Terlambat',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hadir':
        return '#4CAF50';
      case 'Terlambat':
        return '#FFC107';
      case 'Tidak Hadir':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderAttendanceItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.course}</Title>
        <Paragraph>Kelas: {item.class}</Paragraph>
        <Paragraph>Tanggal: {item.date}</Paragraph>
        <Paragraph>Waktu: {item.timeIn} - {item.timeOut}</Paragraph>
        <View style={styles.statusContainer}>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Semester</Text>
        <SegmentedButtons
          value={semester}
          onValueChange={setSemester}
          buttons={[
            { value: 'ganjil', label: 'Ganjil' },
            { value: 'genap', label: 'Genap' },
          ]}
          style={styles.segmentedButtons}
        />
        <Text style={styles.filterLabel}>Tahun Akademik</Text>
        <TextInput
          label="Tahun Akademik"
          value={academicYear}
          onChangeText={setAcademicYear}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
        />
        <Text style={styles.filterLabel}>Kode Mata Kuliah</Text>
        <TextInput
          label="Kode Mata Kuliah"
          value={courseId}
          onChangeText={setCourseId}
          style={styles.input}
          mode="outlined"
        />
      </View>

      <FlatList
        data={mockAttendance}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  statusContainer: {
    marginTop: 8,
  },
  status: {
    fontWeight: 'bold',
  },
});

export default AttendanceHistoryScreen; 