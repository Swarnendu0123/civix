import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Login',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="register-user" 
        options={{ 
          title: 'Register as User',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="register-technician" 
        options={{ 
          title: 'Register as Technician',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}