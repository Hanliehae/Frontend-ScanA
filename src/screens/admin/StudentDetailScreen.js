import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

const StudentDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { student } = route.params;
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('token');
      const response = await api.get(`/user/${student.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    };
    fetchUser();
  }, []);

  if (!user) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Title>{user.name}</Title>
          <Paragraph>NIM: {user.nim}</Paragraph>
          <Paragraph>Email: {user.email}</Paragraph>
          <Paragraph>Phone: {user.phone}</Paragraph>
        </Card.Content>
        <Card.Content>
          <Paragraph>Username: {user.username}</Paragraph>
          <Paragraph>Password: {user.password}</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.goBack()}>Kembali</Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default StudentDetailScreen;
