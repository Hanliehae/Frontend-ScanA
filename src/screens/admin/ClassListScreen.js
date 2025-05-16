import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Button, IconButton, Portal, Modal, TextInput, HelperText } from 'react-native-paper';

const ClassListScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([
    { id: 1, name: 'Kelas A', course: 'Pemrograman Mobile', totalStudents: 30 },
    { id: 2, name: 'Kelas B', course: 'Basis Data', totalStudents: 25 },
  ]);
  const [visible, setVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    totalStudents: '',
  });

  const showModal = (classData = null) => {
    if (classData) {
      setEditingClass(classData);
      setFormData({
        name: classData.name,
        course: classData.course,
        totalStudents: classData.totalStudents.toString(),
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        course: '',
        totalStudents: '',
      });
    }
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setEditingClass(null);
    setFormData({
      name: '',
      course: '',
      totalStudents: '',
    });
  };

  const handleSave = () => {
    if (editingClass) {
      setClasses(classes.map(c => 
        c.id === editingClass.id 
          ? { ...c, ...formData, totalStudents: parseInt(formData.totalStudents) }
          : c
      ));
    } else {
      setClasses([...classes, {
        id: classes.length + 1,
        name: formData.name,
        course: formData.course,
        totalStudents: parseInt(formData.totalStudents),
      }]);
    }
    hideModal();
  };

  const handleDelete = (id) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  const renderClassItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.className}>{item.name}</Text>
            <Text style={styles.courseName}>{item.course}</Text>
            <Text style={styles.studentCount}>Jumlah Mahasiswa: {item.totalStudents}</Text>
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
        Tambah Kelas
      </Button>

      <FlatList
        data={classes}
        renderItem={renderClassItem}
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
            {editingClass ? 'Edit Kelas' : 'Tambah Kelas'}
          </Text>
          
          <TextInput
            label="Nama Kelas"
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            style={styles.input}
          />

          <TextInput
            label="Mata Kuliah"
            value={formData.course}
            onChangeText={text => setFormData({ ...formData, course: text })}
            style={styles.input}
          />

          <TextInput
            label="Jumlah Mahasiswa"
            value={formData.totalStudents}
            onChangeText={text => setFormData({ ...formData, totalStudents: text })}
            keyboardType="numeric"
            style={styles.input}
          />

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
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    margin: 16,
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
    alignItems: 'flex-start',
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  courseName: {
    color: '#666',
    marginTop: 4,
  },
  studentCount: {
    color: '#666',
    marginTop: 4,
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
    marginBottom: 16,
    backgroundColor: 'white',
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

export default ClassListScreen; 