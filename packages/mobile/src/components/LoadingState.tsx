import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading progression...'
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4caf50" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 20,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default LoadingState;