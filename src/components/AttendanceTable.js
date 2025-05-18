import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { DataTable, Text, Surface, useTheme } from 'react-native-paper';

const AttendanceTable = ({ data }) => {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const columnWidths = {
    tanggal: 100,
    matkul: 150,
    kelas: 80,
    nim: 100,
    nama: 150,
    waktu: 120,
    status: 80,
    checkIn: 100,
    checkOut: 100,
  };

  return (
    <Surface style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.header}>
            <DataTable.Title style={[styles.cell, styles.headerCell, { width: columnWidths.tanggal }]}>
              <Text style={styles.headerText}>Tanggal</Text>
            </DataTable.Title>
            <DataTable.Title style={[styles.cell, styles.headerCell, { width: columnWidths.matkul }]}>
              <Text style={styles.headerText}>Mata Kuliah</Text>
            </DataTable.Title>
            <DataTable.Title style={[styles.cell, styles.headerCell, { width: columnWidths.kelas }]}>
              <Text style={styles.headerText}>Kelas</Text>
            </DataTable.Title>
            <DataTable.Title style={[styles.cell, styles.headerCell, { width: columnWidths.nim }]}>
              <Text style={styles.headerText}>NIM</Text>
            </DataTable.Title>
            <DataTable.Title style={[styles.cell, styles.headerCell, { width: columnWidths.nama }]}>
              <Text style={styles.headerText}>Nama</Text>
            </DataTable.Title>
            <DataTable.Title style={[styles.cell, styles.headerCell, { width: columnWidths.waktu }]}>
              <Text style={styles.headerText}>Waktu</Text>
            </DataTable.Title>
            <DataTable.Title style={[styles.cell, styles.headerCell, { width: columnWidths.status }]}>
              <Text style={styles.headerText}>Status</Text>
            </DataTable.Title>
            <DataTable.Title style={[styles.cell, styles.headerCell, { width: columnWidths.checkIn }]}>
              <Text style={styles.headerText}>Check In</Text>
            </DataTable.Title>
            <DataTable.Title style={[styles.cell, styles.headerCell, { width: columnWidths.checkOut }]}>
              <Text style={styles.headerText}>Check Out</Text>
            </DataTable.Title>
          </DataTable.Header>

          {data.map((record, index) => (
            <DataTable.Row 
              key={record.id} 
              style={[
                styles.row,
                index % 2 === 0 ? styles.evenRow : styles.oddRow
              ]}
            >
              <DataTable.Cell style={[styles.cell, { width: columnWidths.tanggal }]}>
                <Text style={styles.cellText}>{record.meeting.date}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={[styles.cell, { width: columnWidths.matkul }]}>
                <Text style={styles.cellText} numberOfLines={2}>{record.course.name}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={[styles.cell, { width: columnWidths.kelas }]}>
                <Text style={styles.cellText}>{record.class.name}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={[styles.cell, { width: columnWidths.nim }]}>
                <Text style={styles.cellText}>{record.student.nim}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={[styles.cell, { width: columnWidths.nama }]}>
                <Text style={styles.cellText} numberOfLines={2}>{record.student.name}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={[styles.cell, { width: columnWidths.waktu }]}>
                <Text style={styles.cellText}>
                  {record.meeting.start_time}{'\n'}{record.meeting.end_time}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell style={[styles.cell, { width: columnWidths.status }]}>
                <View style={[
                  styles.statusContainer,
                  { backgroundColor: record.status === 'Hadir' ? '#E8F5E9' : '#FFEBEE' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: record.status === 'Hadir' ? '#2E7D32' : '#C62828' }
                  ]}>
                    {record.status}
                  </Text>
                </View>
              </DataTable.Cell>
              <DataTable.Cell style={[styles.cell, { width: columnWidths.checkIn }]}>
                <Text style={styles.cellText}>{record.check_in_time || '-'}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={[styles.cell, { width: columnWidths.checkOut }]}>
                <Text style={styles.cellText}>{record.check_out_time || '-'}</Text>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
    elevation: 4,
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  table: {
    minWidth: 1000,
  },
  header: {
    backgroundColor: '#1976D2',
    borderBottomWidth: 2,
    borderBottomColor: '#1565C0',
  },
  headerCell: {
    borderRightWidth: 1,
    borderRightColor: '#1565C0',
    paddingVertical: 12,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'white',
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 50,
  },
  evenRow: {
    backgroundColor: 'white',
  },
  oddRow: {
    backgroundColor: '#F5F5F5',
  },
  cell: {
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 18,
  },
  statusContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default AttendanceTable; 