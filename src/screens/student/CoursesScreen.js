import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button, Text, SegmentedButtons, TextInput } from 'react-native-paper';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CoursesScreen = () => {
  const [semester, setSemester] = useState('ganjil');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({});

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      const profile = await api.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } });
      const student_id = profile.data.id;
      setProfile(profile.data);
      const response = await api.get(`/courses/detail/by-student/${student_id}`, { 
        headers: { Authorization: `Bearer ${token}` },
        params: {
          semester: semester,
          academic_year: academicYear
        }
      });

      if (response.data.courses) {
        setCourses(response.data.courses);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [semester, academicYear]);

  const renderCourseItem = ({ item }) => {
    const attendanceRate = Math.round(item.attendance_rate);
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.name}</Title>
          <Paragraph>Kode: {item.course_id}</Paragraph>
          <Paragraph>Kelas: {item.class}</Paragraph>
          <View style={styles.attendanceContainer}>
            <Text>Kehadiran: {item.attendance}/{item.total_meetings} ({attendanceRate}%)</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${attendanceRate}%` },
                ]}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

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
          value={academicYear}
          onChangeText={setAcademicYear}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
        />
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {loading ? (
        <Text style={styles.loadingText}>Loading courses...</Text>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => `${item.id}-${item.class_id}`}
          contentContainerStyle={styles.list}
        />
      )}
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
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
  }
});

export default CoursesScreen; 