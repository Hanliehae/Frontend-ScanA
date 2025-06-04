import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, Card, Title, Paragraph, Button, Text, FAB, ActivityIndicator, IconButton, Portal, Modal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CourseListScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await api.get('/courses/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCourses(response.data.courses);
      setError(null);
    } catch (err) {
      setError('Failed to fetch courses');
      showMessage({
        message: 'Error',
        description: err.message || 'Failed to load courses',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      await api.delete(`/courses/${selectedCourse.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showMessage({
        message: 'Success',
        description: 'Mata kuliah berhasil dihapus',
        type: 'success',
      });

      setDeleteModalVisible(false);
      setSelectedCourse(null);
      fetchCourses(); // Refresh the list
    } catch (err) {
      showMessage({
        message: 'Error',
        description: err.message || 'Gagal menghapus mata kuliah',
        type: 'danger',
      });
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.course_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCourseItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>Kode: {item.course_id}</Paragraph>
        <Paragraph>Semester: {item.semester === 'ganjil' ? 'Ganjil' : 'Genap'}</Paragraph>
        <Paragraph>Tahun Akademik: {item.academic_year}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => navigation.navigate('CourseDetail', { course: item })}>
          Detail
        </Button>
        <IconButton
          icon="delete"
          size={24}
          onPress={() => {
            setSelectedCourse(item);
            setDeleteModalVisible(true);
          }}
        />
      </Card.Actions>
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
        <Button mode="contained" onPress={fetchCourses}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Cari mata kuliah..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddCourse')}
        label="Tambah Mata Kuliah"
      />

      <Portal>
        <Modal
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <IconButton
              icon="alert-circle"
              size={40}
              color="#ff4444"
              style={styles.warningIcon}
            />
            <Title style={styles.modalTitle}>Hapus Mata Kuliah</Title>
            <Paragraph style={styles.modalText}>
              Apakah Anda yakin ingin menghapus mata kuliah {selectedCourse?.name}?
            </Paragraph>
            <Paragraph style={styles.warningText}>
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait mata kuliah ini.
            </Paragraph>
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setDeleteModalVisible(false)}
                style={styles.modalButton}
              >
                Batal
              </Button>
              <Button
                mode="contained"
                onPress={handleDeleteCourse}
                style={[styles.modalButton, styles.deleteButton]}
                buttonColor="#ff4444"
              >
                Hapus
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
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
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalContent: {
    alignItems: 'center',
  },
  warningIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    marginBottom: 8,
    color: '#ff4444',
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  warningText: {
    textAlign: 'center',
    color: '#ff4444',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default CourseListScreen; 