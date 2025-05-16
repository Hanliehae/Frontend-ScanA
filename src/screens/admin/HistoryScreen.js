import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Text, ActivityIndicator, Portal, Modal, TextInput, Chip, Menu, Divider, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    class: '',
    student: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    semesters: [],
    academicYears: [],
    courses: [],
    classes: [],
    students: []
  });
  const [showSemesterMenu, setShowSemesterMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [showClassMenu, setShowClassMenu] = useState(false);
  const [showStudentMenu, setShowStudentMenu] = useState(false);

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

      const response = await api.get('/admin/history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setAllHistory(response.data.data.history);

        // Extract unique values for filters
        const semesters = [...new Set(response.data.data.history.map(h => h.course.semester))];
        const academicYears = [...new Set(response.data.data.history.map(h => h.course.academic_year))];
        const courses = [...new Set(response.data.data.history.map(h => h.course.name))];
        const classes = [...new Set(response.data.data.history.map(h => h.class.name))];
        const students = [...new Set(response.data.data.history.map(h => `${h.student.nim} - ${h.student.name}`))];

        setAvailableFilters({
          ...availableFilters,
          semesters,
          academicYears,
          courses,
          classes,
          students
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
    if (filters.student) {
      filtered = filtered.filter(h => `${h.student.nim} - ${h.student.name}` === filters.student);
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
      case 'student':
        setShowStudentMenu(false);
        break;
    }
  };

  const clearFilters = () => {
    setFilters({
      semester: '',
      academicYear: '',
      course: '',
      class: '',
      student: ''
    });
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
          {filters.student && (
            <Chip
              style={styles.chip}
              onClose={() => setFilters({ ...filters, student: '' })}
            >
              Mahasiswa: {filters.student.split(' - ')[0]}
            </Chip>
          )}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredHistory.map((record) => (
          <Card key={record.id} style={styles.card}>
            <Card.Content>
              <Title>{record.course.name}</Title>
              <Paragraph>Kelas {record.class.name}</Paragraph>
              <Paragraph>Mahasiswa: {record.student.nim} - {record.student.name}</Paragraph>
              <Paragraph>Tanggal: {record.meeting.date}</Paragraph>
              <Paragraph>Waktu: {record.meeting.start_time} - {record.meeting.end_time}</Paragraph>
              <Paragraph>Status: {record.status}</Paragraph>
              {record.check_in_time && (
                <Paragraph>Check In: {record.check_in_time}</Paragraph>
              )}
              {record.check_out_time && (
                <Paragraph>Check Out: {record.check_out_time}</Paragraph>
              )}
              <Paragraph>Semester: {record.course.semester}</Paragraph>
              <Paragraph>Tahun Akademik: {record.course.academic_year}</Paragraph>
            </Card.Content>
          </Card>
        ))}
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
                <List.Item
                  title={filters.semester || 'Pilih Semester'}
                  onPress={() => setShowSemesterMenu(true)}
                  right={props => <List.Icon {...props} icon="chevron-down" />}
                />
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
                <List.Item
                  title={filters.academicYear || 'Pilih Tahun'}
                  onPress={() => setShowYearMenu(true)}
                  right={props => <List.Icon {...props} icon="chevron-down" />}
                />
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
                <List.Item
                  title={filters.course || 'Pilih MK'}
                  onPress={() => setShowCourseMenu(true)}
                  right={props => <List.Icon {...props} icon="chevron-down" />}
                />
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
                <List.Item
                  title={filters.class || 'Pilih Kelas'}
                  onPress={() => setShowClassMenu(true)}
                  right={props => <List.Icon {...props} icon="chevron-down" />}
                />
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

            <List.Subheader>Mahasiswa</List.Subheader>
            <Menu
              visible={showStudentMenu}
              onDismiss={() => setShowStudentMenu(false)}
              anchor={
                <List.Item
                  title={filters.student || 'Pilih Mahasiswa'}
                  onPress={() => setShowStudentMenu(true)}
                  right={props => <List.Icon {...props} icon="chevron-down" />}
                />
              }
            >
              {availableFilters.students.map((student) => (
                <Menu.Item
                  key={student}
                  onPress={() => handleFilterSelect('student', student)}
                  title={student}
                />
              ))}
            </Menu>
          </List.Section>
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={clearFilters}
              style={styles.modalButton}
            >
              Hapus Filter
            </Button>
            <Button
              mode="contained"
              onPress={() => setShowFilterModal(false)}
              style={styles.modalButton}
            >
              Terapkan
            </Button>
          </View>
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
  },
  filterContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  filterButton: {
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
  },
  card: {
    margin: 8,
    marginHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});

export default HistoryScreen; 