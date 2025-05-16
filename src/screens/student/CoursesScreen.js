import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button, Text, SegmentedButtons, TextInput } from 'react-native-paper';

const CoursesScreen = () => {
  const [semester, setSemester] = useState('ganjil');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());

  const enrolledCourses = [
    {
      id: 1,
      code: 'CS101',
      name: 'Pemrograman Dasar',
      credits: 3,
      lecturer: 'Dr. John Doe',
      class: 'A',
      schedule: 'Senin, 08:00 - 10:00',
      room: 'Lab. Komputer 1',
      attendance: 80,
    },
    {
      id: 2,
      code: 'CS102',
      name: 'Struktur Data',
      credits: 3,
      lecturer: 'Dr. Jane Smith',
      class: 'B',
      schedule: 'Selasa, 10:00 - 12:00',
      room: 'Lab. Komputer 2',
      attendance: 90,
    },
  ];

  const renderCourseItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>Kode: {item.code}</Paragraph>
        <Paragraph>SKS: {item.credits}</Paragraph>
        <Paragraph>Dosen: {item.lecturer}</Paragraph>
        <Paragraph>Kelas: {item.class}</Paragraph>
        <Paragraph>Jadwal: {item.schedule}</Paragraph>
        <Paragraph>Ruangan: {item.room}</Paragraph>
        <View style={styles.attendanceContainer}>
          <Text>Kehadiran: {item.attendance}%</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${item.attendance}%` },
              ]}
            />
          </View>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => {}}>
          Detail
        </Button>
      </Card.Actions>
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
      </View>

      <FlatList
        data={enrolledCourses}
        renderItem={renderCourseItem}
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
  attendanceContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200ee',
    borderRadius: 4,
  },
});

export default CoursesScreen; 