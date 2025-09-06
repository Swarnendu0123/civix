import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import api from '@/services/api';

export default function RegisterUserScreen() {
  const { colorScheme } = useTheme();
  const { login } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.auth.register(name, email, password, 'citizen');
      
      // Update auth context with user data
      login({
        _id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        points: 0,
      });

      Alert.alert(
        'Registration Successful',
        `Welcome to Civix, ${response.user.name}! You can now start reporting civic issues.`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        'Failed to create your account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = createStyles(colorScheme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <Text style={styles.title}>Register as Citizen</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <IconSymbol name="person.fill" size={64} color="#3B82F6" />
          <Text style={styles.welcomeTitle}>Join Civix Community</Text>
          <Text style={styles.welcomeText}>
            Help make your community better by reporting civic issues and tracking their resolution.
          </Text>
        </View>

        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your full name"
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Email Input */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email"
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password (min 6 characters)"
              placeholderTextColor={Colors[colorScheme].tabIconDefault}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <IconSymbol 
                name={showPassword ? "eye.slash.fill" : "eye.fill"} 
                size={20} 
                color={Colors[colorScheme].tabIconDefault} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.section}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              placeholderTextColor={Colors[colorScheme].tabIconDefault}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <IconSymbol 
                name={showConfirmPassword ? "eye.slash.fill" : "eye.fill"} 
                size={20} 
                color={Colors[colorScheme].tabIconDefault} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.registerButton, isSubmitting && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <IconSymbol name="person.badge.plus.fill" size={24} color="white" />
            )}
            <Text style={styles.registerButtonText}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.loginSection}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>Login here</Text>
          </TouchableOpacity>
        </View>

        {/* Technician Link */}
        <View style={styles.technicianSection}>
          <Text style={styles.technicianText}>Are you a municipal technician?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/register-technician')}>
            <Text style={styles.technicianLink}>Register as Technician</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[colorScheme].background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors[colorScheme].tabIconDefault + '20',
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors[colorScheme].text,
    backgroundColor: Colors[colorScheme].background,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 12,
    backgroundColor: Colors[colorScheme].background,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors[colorScheme].text,
  },
  passwordToggle: {
    padding: 16,
  },
  submitSection: {
    marginTop: 32,
  },
  registerButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    marginBottom: 8,
  },
  loginLink: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  technicianSection: {
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors[colorScheme].tabIconDefault + '20',
  },
  technicianText: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    marginBottom: 8,
  },
  technicianLink: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: '600',
  },
});