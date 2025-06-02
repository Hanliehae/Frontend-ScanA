import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Button, Text, ActivityIndicator, Portal, Modal, Chip, Menu, Divider, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AttendanceTable from '../../components/AttendanceTableStudent';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allHistory, setAllHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    semester: '',
    academicYear: '',
    course: '',
    class: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    semesters: [],
    academicYears: [],
    courses: [],
    classes: []
  });
  const [showSemesterMenu, setShowSemesterMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [showClassMenu, setShowClassMenu] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allHistory]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const profile = await api.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } });
      const student_id = profile.data.id;


      const response = await api.get(`/history?student_id=${student_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setAllHistory(response.data.data.history);

        // Extract unique values for filters
        const semesters = [...new Set(response.data.data.history.map(h => h.course.semester))];
        const academicYears = [...new Set(response.data.data.history.map(h => h.course.academic_year))];
        const courses = [...new Set(response.data.data.history.map(h => h.course.name))];
        const classes = [...new Set(response.data.data.history.map(h => h.class.name))];

        setAvailableFilters({
          ...availableFilters,
          semesters,
          academicYears,
          courses,
          classes,
        });
      }
    } catch (err) {
      showMessage({
        message: 'Error',
        description: err.message || 'Failed to load history',
        type: 'danger',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allHistory];

    if (filters.semester) {
      filtered = filtered.filter(h => h.course.semester === filters.semester);
    }
    if (filters.academicYear) {
      filtered = filtered.filter(h => h.course.academic_year === filters.academicYear);
    }
    if (filters.course) {
      filtered = filtered.filter(h => h.course.name === filters.course);
    }
    if (filters.class) {
      filtered = filtered.filter(h => h.class.name === filters.class);
    }

    setFilteredHistory(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleFilterSelect = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    switch (type) {
      case 'semester':
        setShowSemesterMenu(false);
        break;
      case 'academicYear':
        setShowYearMenu(false);
        break;
      case 'course':
        setShowCourseMenu(false);
        break;
      case 'class':
        setShowClassMenu(false);
        break;
    }
  };

  const clearFilters = () => {
    setFilters({
      semester: '',
      academicYear: '',
      course: '',
      class: ''
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Memuat data kehadiran...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Button
          mode="contained"
          onPress={() => setShowFilterModal(true)}
          style={styles.filterButton}
        >
          Filter
        </Button>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.semester && (
            <Chip
              style={styles.chip}
              onClose={() => setFilters({ ...filters, semester: '' })}
            >
              Semester: {filters.semester}
            </Chip>
          )}
          {filters.academicYear && (
            <Chip
              style={styles.chip}
              onClose={() => setFilters({ ...filters, academicYear: '' })}
            >
              Tahun: {filters.academicYear}
            </Chip>
          )}
          {filters.course && (
            <Chip
              style={styles.chip}
              onClose={() => setFilters({ ...filters, course: '' })}
            >
              MK: {filters.course}
            </Chip>
          )}
          {filters.class && (
            <Chip
              style={styles.chip}
              onClose={() => setFilters({ ...filters, class: '' })}
            >
              Kelas: {filters.class}
            </Chip>
          )}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.tableContainer}
      >
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada data kehadiran</Text>
          </View>
        ) : (
          <AttendanceTable data={filteredHistory} />
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={showFilterModal}
          onDismiss={() => setShowFilterModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Filter Riwayat</Text>
          
          <List.Section>
            <List.Subheader>Semester</List.Subheader>
            <Menu
              visible={showSemesterMenu}
              onDismiss={() => setShowSemesterMenu(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setShowSemesterMenu(true)}
                  style={styles.menuButton}
                >
                  {filters.semester || 'Pilih Semester'}
                </Button>
              }
            >
              {availableFilters.semesters.map((semester) => (
                <Menu.Item
                  key={semester}
                  onPress={() => handleFilterSelect('semester', semester)}
                  title={semester}
                />
              ))}
            </Menu>

            <List.Subheader>Tahun Akademik</List.Subheader>
            <Menu
              visible={showYearMenu}
              onDismiss={() => setShowYearMenu(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setShowYearMenu(true)}
                  style={styles.menuButton}
                >
                  {filters.academicYear || 'Pilih Tahun'}
                </Button>
              }
            >
              {availableFilters.academicYears.map((year) => (
                <Menu.Item
                  key={year}
                  onPress={() => handleFilterSelect('academicYear', year)}
                  title={year}
                />
              ))}
            </Menu>

            <List.Subheader>Mata Kuliah</List.Subheader>
            <Menu
              visible={showCourseMenu}
              onDismiss={() => setShowCourseMenu(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setShowCourseMenu(true)}
                  style={styles.menuButton}
                >
                  {filters.course || 'Pilih Mata Kuliah'}
                </Button>
              }
            >
              {availableFilters.courses.map((course) => (
                <Menu.Item
                  key={course}
                  onPress={() => handleFilterSelect('course', course)}
                  title={course}
                />
              ))}
            </Menu>

            <List.Subheader>Kelas</List.Subheader>
            <Menu
              visible={showClassMenu}
              onDismiss={() => setShowClassMenu(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setShowClassMenu(true)}
                  style={styles.menuButton}
                >
                  {filters.class || 'Pilih Kelas'}
                </Button>
              }
            >
              {availableFilters.classes.map((class_) => (
                <Menu.Item
                  key={class_}
                  onPress={() => handleFilterSelect('class', class_)}
                  title={class_}
                />
              ))}
            </Menu>
          </List.Section>

          <Button
            mode="contained"
            onPress={clearFilters}
            style={styles.clearButton}
          >
            Hapus Semua Filter
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  filterButton: {
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  tableContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  menuButton: {
    marginBottom: 8,
  },
  clearButton: {
    marginTop: 16,
  },
});

export default HistoryScreen; 