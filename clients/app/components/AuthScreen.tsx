import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { firebaseAuth } from '@/services/firebase';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

interface AuthScreenProps {
  initialMode?: 'signin' | 'signup';
  onClose?: () => void;
}

export default function AuthScreen({ initialMode = 'signin', onClose }: AuthScreenProps) {
  const { colorScheme } = useTheme();
  const { login } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Name validation for signup
    if (mode === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let result;
      
      if (mode === 'signin') {
        // Try backend API first
        try {
          result = await api.auth.login(formData.email, formData.password);
          
          if (result.user) {
            login(result.user);
            Alert.alert(
              'Success',
              'Welcome back!',
              [{ text: 'OK', onPress: onClose }]
            );
            return;
          }
        } catch (backendError) {
          console.log('Backend login failed, trying Firebase:', backendError);
          // Fallback to Firebase
          const firebaseResult = await firebaseAuth.signIn(formData.email, formData.password);
          
          if (firebaseResult.success && firebaseResult.user) {
            const userData = {
              _id: firebaseResult.user.uid,
              name: firebaseResult.user.displayName || formData.email.split('@')[0],
              email: firebaseResult.user.email,
              role: 'citizen',
              points: 0
            };
            login(userData);
            Alert.alert(
              'Success',
              'Welcome back!',
              [{ text: 'OK', onPress: onClose }]
            );
            return;
          }
          throw new Error(firebaseResult.error || 'Authentication failed');
        }
      } else {
        // Registration - Always use backend API to ensure sync
        try {
          result = await api.auth.register(formData.name, formData.email, formData.password, 'citizen');
          
          if (result.user) {
            login(result.user);
            Alert.alert(
              'Success',
              'Account created successfully! You can now report civic issues.',
              [{ text: 'OK', onPress: onClose }]
            );
            return;
          }
        } catch (backendError) {
          console.log('Backend registration failed, trying Firebase:', backendError);
          // Fallback to Firebase but also try to sync with backend
          const firebaseResult = await firebaseAuth.signUp(formData.email, formData.password, formData.name);
          
          if (firebaseResult.success && firebaseResult.user) {
            const userData = {
              _id: firebaseResult.user.uid,
              name: firebaseResult.user.displayName || formData.name,
              email: firebaseResult.user.email,
              role: 'citizen',
              points: 0
            };
            
            // Try to sync with backend in background (don't block UI on failure)
            try {
              await api.auth.register(formData.name, formData.email, 'synced-password', 'citizen');
              console.log('Successfully synced Firebase user with backend');
            } catch (syncError) {
              console.warn('Failed to sync Firebase user with backend:', syncError);
            }
            
            login(userData);
            Alert.alert(
              'Success',
              'Account created successfully!',
              [{ text: 'OK', onPress: onClose }]
            );
            return;
          }
          throw new Error(firebaseResult.error || 'Registration failed');
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrors({});
    setFormData({
      email: formData.email,
      password: '',
      name: '',
      confirmPassword: ''
    });
  };

  const styles = createStyles(colorScheme);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <IconSymbol name="building.2.fill" size={48} color={Colors[colorScheme].tint} />
              <Text style={styles.logoText}>Civix</Text>
            </View>
            <Text style={styles.subtitle}>
              {mode === 'signin' ? 'Welcome back!' : 'Create your account'}
            </Text>
            <Text style={styles.description}>
              {mode === 'signin' 
                ? 'Sign in to continue reporting civic issues'
                : 'Join the community and help make your city better'
              }
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors[colorScheme].tabIconDefault}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  autoCapitalize="words"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor={Colors[colorScheme].tabIconDefault}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Enter your password"
                placeholderTextColor={Colors[colorScheme].tabIconDefault}
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                secureTextEntry
                autoCapitalize="none"
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors[colorScheme].tabIconDefault}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <IconSymbol 
                    name={mode === 'signin' ? 'key.fill' : 'person.badge.plus.fill'} 
                    size={20} 
                    color="white" 
                  />
                  <Text style={styles.submitButtonText}>
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Switch Mode */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={switchMode}>
                <Text style={styles.switchLink}>
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[colorScheme].background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors[colorScheme].tint,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors[colorScheme].text,
    backgroundColor: Colors[colorScheme].background,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors[colorScheme].tint,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors[colorScheme].tabIconDefault,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  switchText: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
  },
  switchLink: {
    fontSize: 16,
    color: Colors[colorScheme].tint,
    fontWeight: '600',
  },
});