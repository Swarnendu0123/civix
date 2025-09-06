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

export default function LoginScreen() {
  const { colorScheme } = useTheme();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'citizen' | 'technician'>('citizen');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.auth.login(email, password);
      
      // Update auth context with user data
      login({
        _id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        specialization: response.user.specialization, // For technicians
        points: response.user.points || 0,
      });

      Alert.alert(
        'Login Successful',
        `Welcome back, ${response.user.name}!`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        'Invalid credentials. Please check your email and password.',
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
        <Text style={styles.title}>Login</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Login as</Text>
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'citizen' && styles.userTypeButtonActive
              ]}
              onPress={() => setUserType('citizen')}
            >
              <IconSymbol 
                name="person.fill" 
                size={24} 
                color={userType === 'citizen' ? 'white' : Colors[colorScheme].tabIconDefault} 
              />
              <Text style={[
                styles.userTypeText,
                userType === 'citizen' && styles.userTypeTextActive
              ]}>
                Citizen
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'technician' && styles.userTypeButtonActive
              ]}
              onPress={() => setUserType('technician')}
            >
              <IconSymbol 
                name="wrench.and.screwdriver.fill" 
                size={24} 
                color={userType === 'technician' ? 'white' : Colors[colorScheme].tabIconDefault} 
              />
              <Text style={[
                styles.userTypeText,
                userType === 'technician' && styles.userTypeTextActive
              ]}>
                Technician
              </Text>
            </TouchableOpacity>
          </View>
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
              placeholder="Enter your password"
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

        {/* Login Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <IconSymbol name="arrow.right.circle.fill" size={24} color="white" />
            )}
            <Text style={styles.loginButtonText}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Links */}
        <View style={styles.registerSection}>
          <Text style={styles.registerText}>Don&apos;t have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/register-user')}>
            <Text style={styles.registerLink}>Register as Citizen</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/auth/register-technician')}>
            <Text style={styles.registerLink}>Register as Technician</Text>
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
    fontSize: 24,
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginBottom: 16,
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 2,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    gap: 8,
  },
  userTypeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors[colorScheme].tabIconDefault,
  },
  userTypeTextActive: {
    color: 'white',
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
  loginButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  registerSection: {
    marginTop: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    marginBottom: 16,
  },
  registerLink: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 8,
  },
});