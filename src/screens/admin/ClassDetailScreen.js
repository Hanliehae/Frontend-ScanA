import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  FAB,
  ActivityIndicator,
  Divider,
  Portal,
  Modal,
  TextInput,
  Checkbox,
  IconButton,
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Swipeable } from "react-native-gesture-handler";
import api from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

// Tab Screens
const MeetingsTab = ({ classData, course }) => {
  const navigation = useNavigation();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      fetchMeetings();
    }
  }, [isFocused]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await api.get(`/meetings/by-class/${classData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeetings(response.data.meetings || []);
    } catch (err) {
      showMessage({
        message: "Error",
        description: err.message || "Failed to load meetings",
        type: "danger",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeetings();
  };

  const handleMeetingPress = (meeting, index) => {
    navigation.navigate("MeetingDetail", {
      meeting,
      class: classData,
      course,
      meetingIndex: index,
    });
  };

  const renderMeetingItem = ({ item, index }) => {
    const now = new Date();
    const startDateTime = new Date(`${item.date}T${item.start_time}`);
    const endDateTime = new Date(`${item.date}T${item.end_time}`);

    let status = "";
    if (now < startDateTime) {
      status = "Belum dimulai";
    } else if (now >= startDateTime && now <= endDateTime) {
      status = "Sedang berlangsung";
    } else {
      status = "Sudah selesai";
    }

    return (
      <Card
        key={item.id}
        style={styles.card_meeting}
        onPress={() => handleMeetingPress(item, index)}
      >
        <Card.Content>
          <Title>Pertemuan {index + 1}</Title>
          <Paragraph>Tanggal: {item.date}</Paragraph>
          <Paragraph>
            Waktu: {item.start_time} - {item.end_time}
          </Paragraph>
          <Paragraph>Status: {status}</Paragraph>
        </Card.Content>
      </Card>
    );
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
      <FlatList
        data={meetings}
        renderItem={renderMeetingItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() =>
          navigation.navigate("CreateMeeting", { class_: classData, course })
        }
        label="Tambah Pertemuan"
      />
    </View>
  );
};

const StudentsTab = ({ classData, course }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchStudents();
    }
  }, [isFocused]);

  useEffect(() => {
    if (classData && course) {
      fetchAllStudents();
    }
  }, [classData, course, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await api.get(
        `/class-students/by-class/${classData.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudents(response.data.students || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch students");
      showMessage({
        message: "Error",
        description: err.message || "Failed to load students",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter out students who are already in the class
      const registeredStudentIds = students.map((student) => student.id);
      const availableStudents = (response.data.users || []).filter(
        (student) => !registeredStudentIds.includes(student.id)
      );

      setAllStudents(availableStudents);
    } catch (err) {
      showMessage({
        message: "Error",
        description: err.message || "Failed to load all students",
        type: "danger",
      });
    }
  };

  const handleAddStudents = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      await api.post(
        `/class-students/add`,
        {
          class_id: classData.id,
          student_ids: selectedStudents,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showMessage({
        message: "Success",
        description: "Mahasiswa berhasil ditambahkan",
        type: "success",
      });

      setVisible(false);
      setSelectedStudents([]);
      fetchStudents();
    } catch (err) {
      showMessage({
        message: "Error",
        description: err.message || "Gagal menambahkan mahasiswa",
        type: "danger",
      });
    }
  };

  const handleRemoveStudent = async (studentId) => {
    setSelectedStudent(students.find((s) => s.id === studentId));
    setDeleteModalVisible(true);
  };

  const confirmDeleteStudent = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      await api.post(
        `/class-students/remove`,
        {
          class_id: classData.id,
          student_ids: [selectedStudent.id],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showMessage({
        message: "Success",
        description: "Mahasiswa berhasil dihapus dari kelas",
        type: "success",
      });

      setDeleteModalVisible(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      showMessage({
        message: "Error",
        description: err.message || "Gagal menghapus mahasiswa dari kelas",
        type: "danger",
      });
    }
  };

  const renderRightActions = (studentId) => {
    return (
      <View style={styles.deleteAction}>
        <View style={styles.deleteButton}>
          <IconButton
            icon="delete"
            size={28}
            color="white"
            onPress={() => handleRemoveStudent(studentId)}
          />
          <Paragraph style={styles.deleteText}>Hapus</Paragraph>
        </View>
      </View>
    );
  };

  const renderStudentItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      friction={2}
      rightThreshold={40}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.studentCardContent}>
            <View style={styles.studentInfo}>
              <View style={styles.nameContainer}>
                <Title style={styles.studentName}>{item.name}</Title>
                <View style={styles.nimContainer}>
                  <Paragraph style={styles.nimLabel}>NIM</Paragraph>
                  <Paragraph style={styles.nimValue}>{item.nim}</Paragraph>
                </View>
              </View>
              <View style={styles.emailContainer}>
                <IconButton
                  icon="email"
                  size={16}
                  color="#666"
                  style={styles.emailIcon}
                />
                <Paragraph style={styles.emailText}>{item.email}</Paragraph>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Swipeable>
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
        <Button mode="contained" onPress={fetchStudents}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setVisible(true)}
        label="Tambah Mahasiswa"
      />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Tambah Mahasiswa</Text>
          <FlatList
            data={allStudents}
            renderItem={({ item }) => (
              <View style={styles.checkboxItem}>
                <Checkbox
                  status={
                    selectedStudents.includes(item.id) ? "checked" : "unchecked"
                  }
                  onPress={() => {
                    if (selectedStudents.includes(item.id)) {
                      setSelectedStudents(
                        selectedStudents.filter((id) => id !== item.id)
                      );
                    } else {
                      setSelectedStudents([...selectedStudents, item.id]);
                    }
                  }}
                />
                <Text>
                  {item.name} ({item.nim})
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          <Button
            mode="contained"
            onPress={handleAddStudents}
            style={styles.modalButton}
          >
            Tambah
          </Button>
        </Modal>

        <Modal
          visible={deleteModalVisible}
          onDismiss={() => {
            setDeleteModalVisible(false);
            setSelectedStudent(null);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <IconButton
              icon="alert-circle"
              size={40}
              color="#ff4444"
              style={styles.warningIcon}
            />
            <Title style={styles.modalTitle}>Hapus Mahasiswa</Title>
            <Paragraph style={styles.modalText}>
              Apakah Anda yakin ingin menghapus {selectedStudent?.name} dari
              kelas {classData.name}?
            </Paragraph>
            <Paragraph style={styles.warningText}>
              Tindakan ini tidak dapat dibatalkan.
            </Paragraph>
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setDeleteModalVisible(false);
                  setSelectedStudent(null);
                }}
                style={styles.modalButton}
              >
                Batal
              </Button>
              <Button
                mode="contained"
                onPress={confirmDeleteStudent}
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

const Tab = createMaterialTopTabNavigator();

const ClassDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { class: classData, course } = route.params;
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleDeleteClass = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      await api.delete(`/classes/${classData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showMessage({
        message: "Success",
        description: "Kelas berhasil dihapus",
        type: "success",
      });

      setDeleteModalVisible(false);
      navigation.goBack();
    } catch (err) {
      showMessage({
        message: "Error",
        description: err.message || "Gagal menghapus kelas",
        type: "danger",
      });
    }
  };

  useEffect(() => {
    if (classData && course) {
      setLoading(false);
    }
  }, [classData, course]);

  if (loading || !classData || !course) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Title>{course.name}</Title>
              <Paragraph>Kelas {classData.name}</Paragraph>
            </View>
            <IconButton
              icon="delete"
              size={24}
              color="#ff4444"
              onPress={() => setDeleteModalVisible(true)}
            />
          </View>
        </Card.Content>
      </Card>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#fff',
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#1976D2',
          },
          tabBarActiveTintColor: '#1976D2',
          tabBarInactiveTintColor: '#666',
        }}
      >
        <Tab.Screen
          name="Meetings"
          children={() => <MeetingsTab classData={classData} course={course} />}
          options={{ 
            tabBarLabel: "Pertemuan"
          }}
        />
        <Tab.Screen
          name="Students"
          children={() => <StudentsTab classData={classData} course={course} />}
          options={{ 
            tabBarLabel: "Mahasiswa"
          }}
        />
      </Tab.Navigator>

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
            <Title style={styles.modalTitle}>Hapus Kelas</Title>
            <Paragraph style={styles.modalText}>
              Apakah Anda yakin ingin menghapus kelas {classData.name} dari mata
              kuliah {course.name}?
            </Paragraph>
            <Paragraph style={styles.warningText}>
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
              terkait kelas ini.
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
                onPress={handleDeleteClass}
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
  },
  headerCard: {
    margin: 16,
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  card_meeting: {
    marginBottom: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalContent: {
    alignItems: "center",
  },
  warningIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 16,
  },
  warningText: {
    textAlign: "center",
    color: "#ff4444",
    marginBottom: 24,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  modalButton: {
    marginHorizontal: 8,
    minWidth: 100,
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  deleteText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 0,
    margin: 0,
    padding: 0,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerInfo: {
    flex: 1,
  },
  studentCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studentInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    flex: 1,
  },
  nimContainer: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  nimLabel: {
    fontSize: 10,
    color: "#1976D2",
    fontWeight: "bold",
    margin: 0,
    padding: 0,
  },
  nimValue: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "500",
    margin: 0,
    padding: 0,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  emailIcon: {
    margin: 0,
    marginRight: 4,
  },
  emailText: {
    fontSize: 14,
    color: "#666",
    margin: 0,
    padding: 0,
  },
  deleteAction: {
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    flex: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  // tab screen label color
  tabBarLabelStyle: {
    color: "#1976D2",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "none",
  },
  tabBarStyle: {
    backgroundColor: "#fff",
    elevation: 2,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabBarIndicatorStyle: {
    backgroundColor: "#1976D2",
    height: 3,
  },
  tabBarActiveTintColor: "#1976D2",
  tabBarInactiveTintColor: "#666",
  tabBarPressColor: "#e3f2fd",
  tabBarPressOpacity: 0.8,
  tabBarShowLabel: true,
  tabBarShowIcon: false,
});

export default ClassDetailScreen;
