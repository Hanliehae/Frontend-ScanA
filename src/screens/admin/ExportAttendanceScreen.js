import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text, SegmentedButtons, Snackbar } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';

const ExportAttendanceScreen = ({ navigation, route }) => {
  const meeting = route.params?.meeting || {
    id: 1,
    course: 'Pemrograman Dasar',
    class: 'A',
    date: '2024-03-01',
    time: '08:00 - 10:00',
  };
  
  const [format, setFormat] = useState('csv');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleExport = async () => {
    try {
      // Simulasi data kehadiran
      const attendanceData = [
        { nim: '12345678', name: 'John Doe', status: 'Hadir', time: '08:00' },
        { nim: '87654321', name: 'Jane Smith', status: 'Terlambat', time: '08:15' },
      ];

      // Format data sesuai format yang dipilih
      let content = '';
      if (format === 'csv') {
        content = 'NIM,Nama,Status,Waktu\n';
        attendanceData.forEach(item => {
          content += `${item.nim},${item.name},${item.status},${item.time}\n`;
        });
      } else {
        content = JSON.stringify(attendanceData, null, 2);
      }

      // Simpan file sementara
      const filename = `kehadiran_${meeting.course.replace(/\s+/g, '_')}_${meeting.date}.${format}`;
      const filepath = `${FileSystem.cacheDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(filepath, content);
      
      setSnackbarMessage(`File ${filename} berhasil diekspor`);
      setShowSnackbar(true);
      
      // Navigasi kembali setelah 2 detik
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      setSnackbarMessage('Gagal mengekspor data');
      setShowSnackbar(true);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Detail Pertemuan</Title>
          <Paragraph>Mata Kuliah: {meeting.course}</Paragraph>
          <Paragraph>Kelas: {meeting.class}</Paragraph>
          <Paragraph>Tanggal: {meeting.date}</Paragraph>
          <Paragraph>Waktu: {meeting.time}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Format Export</Title>
          <SegmentedButtons
            value={format}
            onValueChange={setFormat}
            buttons={[
              { value: 'csv', label: 'CSV' },
              { value: 'json', label: 'JSON' },
            ]}
            style={styles.segmentedButtons}
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleExport}
        style={styles.exportButton}
      >
        Export Data
      </Button>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  exportButton: {
    marginTop: 16,
  },
});

export default ExportAttendanceScreen; 