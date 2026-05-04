import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    fullName: 'John Kamau',
    email: 'john.kamau@gmail.com',
    phone: '+254 712 345 678',
    location: 'Murang\'a Town, Kenya',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (isLoginMode) {
        // Login existing user
        if (!formData.email.trim() || !formData.password) {
          alert('Please enter email and password');
          return;
        }

        const response = await authAPI.login(formData.email, formData.password || '');
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));

        router.replace('/(tabs)/home');
      } else {
        // Register new user
        if (!formData.fullName.trim() || !formData.email.trim() || !formData.location.trim() || !formData.password) {
          alert('Please fill in all required fields, including password.');
          return;
        }

        const response = await authAPI.register({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone.trim(),
          location: formData.location,
          password: formData.password,
        });

        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));

        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.response?.data?.errors) {
        // Handle validation errors array from express-validator
        errorMessage = error.response.data.errors.map((err: any) => err.msg).join('\n');
      } else if (error.response?.data?.error) {
        // Handle single error message
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isLoginMode ? 'Login' : 'Create Account'}</Text>
      </View>

      <View style={styles.form}>
        {!isLoginMode && (
          <>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              placeholder="Enter your full name"
            />

            <Text style={styles.label}>Phone (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {!isLoginMode && (
          <>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
              placeholder="Enter your location"
            />
          </>
        )}

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={formData.password || ''}
          onChangeText={(text) => handleInputChange('password', text)}
          placeholder={isLoginMode ? "Enter your password" : "Create a password (min 6 chars)"}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Please wait...' : (isLoginMode ? 'Login' : 'Create Account')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchModeButton}
          onPress={() => setIsLoginMode(!isLoginMode)}
        >
          <Text style={styles.switchModeText}>
            {isLoginMode ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchModeButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  switchModeText: {
    color: '#4CAF50',
    fontSize: 16,
  },
});