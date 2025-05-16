import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const navigation = useNavigation();

  const todaySchedule = [
    {
      id: 1,
      course: 'Pemrograman Dasar',
      time: '08:00 - 10:00',
      room: 'Lab. Komputer 1',
      status: 'Belum Dimulai',
    },
    {
      id: 2,
      course: 'Struktur Data',
      time: '10:00 - 12:00',
      room: 'Lab. Komputer 2',
      status: 'Sedang Berlangsung',
    },
  ];

  const quickActions = [
    {
      title: 'Mata Kuliah',
      icon: 'book-open-page-variant',
      onPress: () => navigation.navigate('CoursesTab'),
    },
    {
      title: 'Riwayat',
      icon: 'history',
      onPress: () => navigation.navigate('HistoryTab'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Title>Selamat Datang!</Title>
          <Paragraph>Berikut adalah jadwal perkuliahan hari ini.</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.scheduleCard}>
        <Card.Content>
          <Title>Jadwal Hari Ini</Title>
          {todaySchedule.map((item) => (
            <View key={item.id} style={styles.scheduleItem}>
              <Text style={styles.courseName}>{item.course}</Text>
              <Text>Waktu: {item.time}</Text>
              <Text>Ruangan: {item.room}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <View style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <Card
            key={index}
            style={styles.actionCard}
            onPress={action.onPress}
          >
            <Card.Content style={styles.actionContent}>
              <Button
                icon={action.icon}
                mode="contained"
                style={styles.actionButton}
                onPress={action.onPress}
              >
                {action.title}
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
  },
  scheduleCard: {
    marginBottom: 16,
  },
  scheduleItem: {
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    marginTop: 4,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 16,
  },
  actionContent: {
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
  },
});

export default DashboardScreen; 