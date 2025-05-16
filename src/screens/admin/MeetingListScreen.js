import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, IconButton, Portal, Modal, TextInput, HelperText, Title, Paragraph } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

const MeetingListScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { class: classData, course } = route.params;
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      courseName: 'Pemrograman Mobile',
      class: 'Kelas A',
      date: '2024-03-20',
      startTime: '08:00',
      endTime: '10:00',
      room: 'Lab. Komputer 1',
      totalStudents: 30,
      presentStudents: 25,
    },
    {
      id: 2,
      courseName: 'Basis Data',
      class: 'Kelas B',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '12:00',
      room: 'Lab. Komputer 2',
      totalStudents: 25,
      presentStudents: 20,
    },
  ]);
  const [visible, setVisible] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [formData, setFormData] = useState({
    courseName: '',
    class: '',
    date: '',
    startTime: '',
    endTime: '',
    room: '',
    totalStudents: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.courseName) newErrors.courseName = 'Mata kuliah harus diisi';
    if (!formData.class) newErrors.class = 'Kelas harus diisi';
    if (!formData.date) newErrors.date = 'Tanggal harus diisi';
    if (!formData.startTime) newErrors.startTime = 'Waktu mulai harus diisi';
    if (!formData.endTime) newErrors.endTime = 'Waktu selesai harus diisi';
    if (!formData.room) newErrors.room = 'Ruangan harus diisi';
    if (!formData.totalStudents) newErrors.totalStudents = 'Jumlah mahasiswa harus diisi';
    if (isNaN(formData.totalStudents)) newErrors.totalStudents = 'Jumlah mahasiswa harus berupa angka';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showModal = (meetingData = null) => {
    if (meetingData) {
      setEditingMeeting(meetingData);
      setFormData({
        courseName: meetingData.courseName,
        class: meetingData.class,
        date: meetingData.date,
        startTime: meetingData.startTime,
        endTime: meetingData.endTime,
        room: meetingData.room,
        totalStudents: meetingData.totalStudents.toString(),
      });
    } else {
      setEditingMeeting(null);
      setFormData({
        courseName: '',
        class: '',
        date: '',
        startTime: '',
        endTime: '',
        room: '',
        totalStudents: '',
      });
    }
    setErrors({});
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setEditingMeeting(null);
    setFormData({
      courseName: '',
      class: '',
      date: '',
      startTime: '',
      endTime: '',
      room: '',
      totalStudents: '',
    });
    setErrors({});
  };

  const handleSave = () => {
    if (validateForm()) {
      if (editingMeeting) {
        setMeetings(meetings.map(m => 
          m.id === editingMeeting.id 
            ? { ...m, ...formData, totalStudents: parseInt(formData.totalStudents) }
            : m
        ));
      } else {
        setMeetings([...meetings, {
          id: meetings.length + 1,
          courseName: formData.courseName,
          class: formData.class,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          room: formData.room,
          totalStudents: parseInt(formData.totalStudents),
          presentStudents: 0,
        }]);
      }
      hideModal();
    }
  };

  const handleDelete = (id) => {
    setMeetings(meetings.filter(m => m.id !== id));
  };

  const handleMeetingPress = (meeting) => {
    navigation.navigate('MeetingDetail', {
      meeting,
      class: classData,
      course
    });
  };

  const renderMeetingItem = ({ item }) => (
    <Card style={styles.card} onPress={() => handleMeetingPress(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.courseName}>{item.courseName}</Text>
            <Text style={styles.className}>Kelas {item.class}</Text>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.time}>
              {item.startTime} - {item.endTime}
            </Text>
            <Text style={styles.room}>Ruangan: {item.room}</Text>
            <Text style={styles.attendance}>
              Kehadiran: {item.presentStudents}/{item.totalStudents}
            </Text>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => showModal(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDelete(item.id)}
            />
          </View>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('HandScan', { meeting: item })}
        >
          Scan Kehadiran
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('ExportAttendance', { meeting: item })}
        >
          Export Data
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={() => showModal()}
        style={styles.addButton}
        icon="plus"
      >
        Tambah Pertemuan
      </Button>

      <FlatList
        data={meetings}
        renderItem={renderMeetingItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
      />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>
            {editingMeeting ? 'Edit Pertemuan' : 'Tambah Pertemuan'}
          </Text>
          
          <TextInput
            label="Mata Kuliah"
            value={formData.courseName}
            onChangeText={text => setFormData({ ...formData, courseName: text })}
            error={!!errors.courseName}
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.courseName}>
            {errors.courseName}
          </HelperText>

          <TextInput
            label="Kelas"
            value={formData.class}
            onChangeText={text => setFormData({ ...formData, class: text })}
            error={!!errors.class}
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.class}>
            {errors.class}
          </HelperText>

          <TextInput
            label="Tanggal"
            value={formData.date}
            onChangeText={text => setFormData({ ...formData, date: text })}
            placeholder="YYYY-MM-DD"
            error={!!errors.date}
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.date}>
            {errors.date}
          </HelperText>

          <TextInput
            label="Waktu Mulai"
            value={formData.startTime}
            onChangeText={text => setFormData({ ...formData, startTime: text })}
            placeholder="HH:MM"
            error={!!errors.startTime}
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.startTime}>
            {errors.startTime}
          </HelperText>

          <TextInput
            label="Waktu Selesai"
            value={formData.endTime}
            onChangeText={text => setFormData({ ...formData, endTime: text })}
            placeholder="HH:MM"
            error={!!errors.endTime}
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.endTime}>
            {errors.endTime}
          </HelperText>

          <TextInput
            label="Ruangan"
            value={formData.room}
            onChangeText={text => setFormData({ ...formData, room: text })}
            error={!!errors.room}
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.room}>
            {errors.room}
          </HelperText>

          <TextInput
            label="Jumlah Mahasiswa"
            value={formData.totalStudents}
            onChangeText={text => setFormData({ ...formData, totalStudents: text })}
            keyboardType="numeric"
            error={!!errors.totalStudents}
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.totalStudents}>
            {errors.totalStudents}
          </HelperText>

          <View style={styles.modalActions}>
            <Button onPress={hideModal} style={styles.modalButton}>
              Batal
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.modalButton}
            >
              Simpan
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
    padding: 16,
  },
  addButton: {
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  className: {
    fontSize: 16,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  room: {
    fontSize: 14,
    color: '#666',
  },
  attendance: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
  },
  modal: {
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
  input: {
    marginBottom: 8,
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

export default MeetingListScreen; 