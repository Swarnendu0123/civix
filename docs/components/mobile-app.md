# Mobile App Component

The Civix Mobile App is a React Native application built with Expo, designed for citizens to easily report civic issues and track their resolution. The app provides an intuitive interface for capturing issues with photos and location data while keeping users informed about progress.

## Overview

### Technology Stack
- **Framework**: React Native 0.79.6
- **Platform**: Expo 53.0.22
- **Language**: TypeScript 5.8.3
- **Routing**: Expo Router 5.1.5
- **Styling**: NativeWind 4.1.23 (Tailwind for React Native)
- **Navigation**: React Navigation 7.1.6
- **Authentication**: Firebase 12.2.1
- **Storage**: AsyncStorage 2.2.0

### Key Features
- **Issue Reporting**: Camera integration with GPS location
- **Photo Capture**: High-quality image capture and gallery selection
- **Real-time Tracking**: Live updates on issue status
- **User Authentication**: Secure login and registration
- **Offline Support**: Basic functionality without internet
- **Push Notifications**: Real-time alerts and updates
- **Map Integration**: View issues on interactive maps

## Project Structure

```
clients/app/
├── app/                    # File-based routing (Expo Router)
│   ├── (tabs)/            # Tab navigation routes
│   │   ├── index.tsx      # Home screen
│   │   ├── map.tsx        # Map view
│   │   ├── raise-issue.tsx # Issue reporting
│   │   ├── my-tickets.tsx  # User's issues
│   │   ├── my-tasks.tsx    # Technician tasks
│   │   └── profile.tsx     # User profile
│   ├── _layout.tsx        # Root layout
│   └── +not-found.tsx     # 404 page
├── components/             # Reusable components
│   ├── ui/                # Basic UI components
│   ├── forms/             # Form components
│   ├── camera/            # Camera components
│   └── AuthGate.tsx       # Authentication wrapper
├── hooks/                 # Custom hooks
├── services/              # API and external services
├── constants/             # App constants
├── assets/                # Static assets
├── app.json               # Expo configuration
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm 8+
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator (optional)
- Physical device with Expo Go app

### Installation
```bash
cd clients/app
npm install
```

### Development
```bash
# Start Expo development server
npx expo start

# Run on specific platforms
npx expo start --ios        # iOS Simulator
npx expo start --android    # Android Emulator
npx expo start --web        # Web browser

# Clear cache if needed
npx expo start --clear
```

### Device Testing
1. **Install Expo Go** on your mobile device
2. **Scan QR code** from the Expo development server
3. **Test** the app on actual hardware

## Core Screens

### Home Screen
**Location**: `app/(tabs)/index.tsx`

The main screen provides an overview of user activity and quick actions.

```typescript
import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { WelcomeCard } from '@/components/WelcomeCard';
import { QuickActions } from '@/components/QuickActions';
import { RecentIssues } from '@/components/RecentIssues';

export default function HomeScreen() {
  const { user } = useAuth();
  
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <WelcomeCard user={user} />
        <QuickActions />
        <RecentIssues />
      </View>
    </ScrollView>
  );
}
```

**Features**:
- Welcome message with user's name
- Quick action buttons (Report Issue, View Map, etc.)
- Recent issues overview
- Community statistics
- Important announcements

### Issue Reporting Screen
**Location**: `app/(tabs)/raise-issue.tsx`

Comprehensive issue reporting with camera integration and location services.

```typescript
import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { CameraView } from '@/components/camera/CameraView';
import { LocationPicker } from '@/components/LocationPicker';
import { IssueForm } from '@/components/forms/IssueForm';
import { useLocation } from '@/hooks/useLocation';
import { useCamera } from '@/hooks/useCamera';

export default function RaiseIssueScreen() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [formData, setFormData] = useState<IssueFormData>({});
  
  const { location, requestPermission } = useLocation();
  const { capturePhoto, selectFromGallery } = useCamera();
  
  const handleSubmit = async () => {
    try {
      await submitIssue({
        ...formData,
        photos,
        location
      });
      
      Alert.alert('Success', 'Issue reported successfully!');
      // Navigate back or reset form
    } catch (error) {
      Alert.alert('Error', 'Failed to submit issue');
    }
  };
  
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <CameraView 
          photos={photos}
          onPhotoCapture={capturePhoto}
          onPhotoSelect={selectFromGallery}
        />
        
        <LocationPicker 
          location={location}
          onLocationChange={setLocation}
        />
        
        <IssueForm 
          data={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
        />
      </View>
    </ScrollView>
  );
}
```

### Map Screen
**Location**: `app/(tabs)/map.tsx`

Interactive map showing community issues and user location.

```typescript
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useIssues } from '@/hooks/useIssues';
import { useLocation } from '@/hooks/useLocation';
import { IssueMarker } from '@/components/map/IssueMarker';
import { MapFilters } from '@/components/map/MapFilters';

export default function MapScreen() {
  const [region, setRegion] = useState<Region>();
  const [filters, setFilters] = useState<MapFilters>({});
  
  const { location } = useLocation();
  const { issues } = useIssues(filters);
  
  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);
  
  return (
    <View className="flex-1">
      <MapView
        className="flex-1"
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {issues.map((issue) => (
          <IssueMarker
            key={issue.id}
            issue={issue}
            onPress={() => navigateToIssue(issue.id)}
          />
        ))}
      </MapView>
      
      <MapFilters 
        filters={filters}
        onChange={setFilters}
      />
    </View>
  );
}
```

### My Tickets Screen
**Location**: `app/(tabs)/my-tickets.tsx`

Personal issue tracking and management interface.

```typescript
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useUserIssues } from '@/hooks/useUserIssues';
import { IssueCard } from '@/components/IssueCard';
import { StatusFilter } from '@/components/StatusFilter';
import { EmptyState } from '@/components/EmptyState';

export default function MyTicketsScreen() {
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const { issues, loading, refetch } = useUserIssues(statusFilter);
  
  const renderIssue = ({ item }: { item: Issue }) => (
    <IssueCard 
      issue={item}
      onPress={() => navigateToIssueDetail(item.id)}
    />
  );
  
  return (
    <View className="flex-1 bg-gray-50">
      <StatusFilter 
        value={statusFilter}
        onChange={setStatusFilter}
      />
      
      <FlatList
        data={issues}
        renderItem={renderIssue}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={refetch}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <EmptyState 
            title="No issues reported"
            subtitle="Start by reporting your first civic issue"
            action="Report Issue"
            onActionPress={() => navigateToRaiseIssue()}
          />
        }
      />
    </View>
  );
}
```

## Custom Components

### Camera Component
**Location**: `components/camera/CameraView.tsx`

Integrated camera functionality with photo management.

```typescript
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

interface CameraViewProps {
  photos: string[];
  onPhotoCapture: (uri: string) => void;
  onPhotoSelect: (uri: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  photos,
  onPhotoCapture,
  onPhotoSelect
}) => {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef<Camera>(null);
  
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      onPhotoCapture(photo.uri);
    }
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      onPhotoSelect(result.assets[0].uri);
    }
  };
  
  if (!permission) {
    return <Text>Requesting camera permission...</Text>;
  }
  
  if (!permission.granted) {
    return (
      <View className="p-4">
        <Text className="text-center mb-4">
          Camera access is required to take photos
        </Text>
        <TouchableOpacity 
          className="bg-blue-500 p-3 rounded-lg"
          onPress={requestPermission}
        >
          <Text className="text-white text-center">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View className="mb-4">
      <Camera
        ref={cameraRef}
        className="h-64 rounded-lg mb-4"
        type={type}
      >
        <View className="flex-1 bg-transparent flex-row">
          <TouchableOpacity
            className="flex-1 self-end items-center"
            onPress={takePicture}
          >
            <Text className="text-lg text-white font-bold m-4">
              Take Photo
            </Text>
          </TouchableOpacity>
        </View>
      </Camera>
      
      <View className="flex-row justify-center space-x-4">
        <TouchableOpacity 
          className="bg-gray-500 px-4 py-2 rounded-lg"
          onPress={() => setType(
            type === CameraType.back ? CameraType.front : CameraType.back
          )}
        >
          <Text className="text-white">Flip Camera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={pickImage}
        >
          <Text className="text-white">Choose from Gallery</Text>
        </TouchableOpacity>
      </View>
      
      {photos.length > 0 && (
        <View className="flex-row flex-wrap mt-4">
          {photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              className="w-20 h-20 rounded-lg mr-2 mb-2"
            />
          ))}
        </View>
      )}
    </View>
  );
};
```

### Location Picker
**Location**: `components/LocationPicker.tsx`

GPS location selection with map preview.

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

interface LocationPickerProps {
  location: LocationData | null;
  onLocationChange: (location: LocationData) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onLocationChange
}) => {
  const [loading, setLoading] = useState(false);
  
  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required');
        return;
      }
      
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      
      const locationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: formatAddress(address[0]),
      };
      
      onLocationChange(locationData);
    } catch (error) {
      Alert.alert('Error', 'Unable to get current location');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View className="mb-4">
      <Text className="text-lg font-semibold mb-2">Location</Text>
      
      {!location ? (
        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-lg"
          onPress={getCurrentLocation}
          disabled={loading}
        >
          <Text className="text-white text-center">
            {loading ? 'Getting Location...' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View>
          <MapView
            className="h-40 rounded-lg mb-2"
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Issue Location"
            />
          </MapView>
          
          <Text className="text-gray-600 mb-2">{location.address}</Text>
          
          <TouchableOpacity
            className="bg-gray-500 p-2 rounded-lg"
            onPress={getCurrentLocation}
          >
            <Text className="text-white text-center">Update Location</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
```

## Custom Hooks

### useAuth Hook
**Location**: `hooks/useAuth.tsx`

Authentication state management with Firebase.

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/services/firebase';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'technician';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from API
        const userData = await fetchUserData(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const register = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create user profile in API
    await createUserProfile(userCredential.user.uid, { email, name });
  };
  
  const logout = async () => {
    await signOut(auth);
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### useLocation Hook
**Location**: `hooks/useLocation.ts`

Location services with permissions handling.

```typescript
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      setError('Failed to request location permission');
      return false;
    }
  };
  
  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Location permission denied');
        return;
      }
      
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      
      // Get address if needed
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        
        if (addresses[0]) {
          locationData.address = formatAddress(addresses[0]);
        }
      } catch (addressError) {
        // Address lookup failed, but location is still valid
      }
      
      setLocation(locationData);
    } catch (err) {
      setError('Failed to get current location');
    } finally {
      setLoading(false);
    }
  };
  
  return {
    location,
    loading,
    error,
    getCurrentLocation,
    requestPermission,
  };
};
```

## Navigation Structure

### Tab Navigation
**Location**: `app/(tabs)/_layout.tsx`

Main tab navigation for the app.

```typescript
import React from 'react';
import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="map" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="raise-issue"
        options={{
          title: 'Report',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="plus-circle" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="my-tickets"
        options={{
          title: 'My Issues',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="list" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

## Deployment

### Build Configuration
**Location**: `app.json`

```json
{
  "expo": {
    "name": "Civix",
    "slug": "civix-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.civix.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.civix.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-camera",
      "expo-location",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

### Production Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both platforms
eas build --platform all
```

### App Store Deployment
```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

The Mobile App provides an intuitive interface for citizens to engage with their local government and contribute to community improvement through efficient issue reporting and tracking.