import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button, Text, FAB, ActivityIndicator, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const CourseDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { course } = route.params;
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchClasses();
    }
  }, [isFocused]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get(`/classes/by-course/${course.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setClasses(response.data.data.classes);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to load classes');
      }
    } catch (err) {
      setError('Failed to fetch classes');
      showMessage({
        message: 'Error',
        description: err.message || 'Failed to load classes',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.post(
        `/classes/create`,
        { course_id: course.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        showMessage({
          message: 'Success',
          description: 'Kelas berhasil ditambahkan',
          type: 'success',
        });

        fetchClasses(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Gagal menambahkan kelas');
      }
    } catch (err) {
      showMessage({
        message: 'Error',
        description: err.message || 'Gagal menambahkan kelas',
        type: 'danger',
      });
    }
  };

  const renderHeader = () => (
    <View>
      <Card style={styles.courseCard}>
        <Card.Content>
          <Title>{course.name}</Title>
          <Paragraph>Kode: {course.course_id}</Paragraph>
          <Paragraph>Tahun Akademik: {course.academic_year}</Paragraph>
          <Paragraph>Semester: {course.semester === 'ganjil' ? 'Ganjil' : 'Genap'}</Paragraph>
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>Daftar Kelas</Text>
    </View>
  );

  const renderClassItem = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('ClassDetail', { class: item, course })}>
      <Card.Content>
        <Title>{item.name}</Title>
        <View style={styles.classInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Kode Kelas</Text>
            <Text style={styles.infoValue}>{item.id}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Jumlah Mahasiswa</Text>
            <Text style={styles.infoValue}>{item.student_count}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Jumlah Pertemuan</Text>
            <Text style={styles.infoValue}>{item.meeting_count}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, styles.activeStatus]}>Aktif</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchClasses}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddClass}
        label="Tambah Kelas"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  courseCard: {
    margin: 16,
    marginBottom: 0,
  },
  divider: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  classInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 14,
  },
  activeStatus: {
    color: 'green',
  },
});

export default CourseDetailScreen; 