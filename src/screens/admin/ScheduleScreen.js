import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Text, ActivityIndicator, Portal, Modal, TextInput, Chip, Menu, Divider, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ScheduleScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allMeetings, setAllMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    semester: '',
    academicYear: '',
    course: '',
    day: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    semesters: [],
    academicYears: [],
    courses: [],
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  });
  const [showSemesterMenu, setShowSemesterMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [showDayMenu, setShowDayMenu] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allMeetings]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get('/meetings/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setAllMeetings(response.data.data.meetings);

        // Extract unique values for filters
        const semesters = [...new Set(response.data.data.meetings.map(m => m.course.semester))];
        const academicYears = [...new Set(response.data.data.meetings.map(m => m.course.academic_year))];
        const courses = [...new Set(response.data.data.meetings.map(m => m.course.name))];

        setAvailableFilters({
          ...availableFilters,
          semesters,
          academicYears,
          courses
        });
      }
    } catch (err) {
      showMessage({
        message: 'Error',
        description: err.message || 'Failed to load meetings',
        type: 'danger',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allMeetings];

    if (filters.semester) {
      filtered = filtered.filter(m => m.course.semester === filters.semester);
    }
    if (filters.academicYear) {
      filtered = filtered.filter(m => m.course.academic_year === filters.academicYear);
    }
    if (filters.course) {
      filtered = filtered.filter(m => m.course.name === filters.course);
    }
    if (filters.day) {
      const dayMap = {
        'Senin': 'Monday',
        'Selasa': 'Tuesday',
        'Rabu': 'Wednesday',
        'Kamis': 'Thursday',
        'Jumat': 'Friday',
        'Sabtu': 'Saturday'
      };
      const englishDay = dayMap[filters.day];
      filtered = filtered.filter(m => {
        const date = new Date(m.date);
        return date.toLocaleDateString('en-US', { weekday: 'long' }) === englishDay;
      });
    }

    setFilteredMeetings(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeetings();
  };

  const handleMeetingPress = (meeting) => {
    navigation.navigate('ClassDetail', {
      class: { id: meeting.class.id, name: meeting.class.name },
      course: { id: meeting.course.id, name: meeting.course.name }
    });
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
      case 'day':
        setShowDayMenu(false);
        break;
    }
  };

  const clearFilters = () => {
    setFilters({
      semester: '',
      academicYear: '',
      course: '',
      day: ''
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
          {filters.day && (
            <Chip
              style={styles.chip}
              onClose={() => setFilters({ ...filters, day: '' })}
            >
              Hari: {filters.day}
            </Chip>
          )}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredMeetings.map((meeting) => (
          <Card
            key={meeting.id}
            style={styles.card}
            onPress={() => handleMeetingPress(meeting)}
          >
            <Card.Content>
              <Title>{meeting.course.name}</Title>
              <Paragraph>Kelas {meeting.class.name}</Paragraph>
              <Paragraph>Tanggal: {meeting.date}</Paragraph>
              <Paragraph>Waktu: {meeting.start_time} - {meeting.end_time}</Paragraph>
              <Paragraph>Semester: {meeting.course.semester}</Paragraph>
              <Paragraph>Tahun Akademik: {meeting.course.academic_year}</Paragraph>
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
          <Text style={styles.modalTitle}>Filter Jadwal</Text>
          
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

            <List.Subheader>Hari</List.Subheader>
            <Menu
              visible={showDayMenu}
              onDismiss={() => setShowDayMenu(false)}
              anchor={
                <List.Item
                  title={filters.day || 'Pilih Hari'}
                  onPress={() => setShowDayMenu(true)}
                  right={props => <List.Icon {...props} icon="chevron-down" />}
                />
              }
            >
              {availableFilters.days.map((day) => (
                <Menu.Item
                  key={day}
                  onPress={() => handleFilterSelect('day', day)}
                  title={day}
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

export default ScheduleScreen; 