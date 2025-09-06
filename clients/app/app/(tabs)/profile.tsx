import React from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ThemeToggle from '@/components/ThemeToggle';

export default function ProfileScreen() {
  const { colorScheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  // Default user data when not authenticated
  const defaultUser = {
    name: 'Guest User',
    email: 'guest@example.com',
    phone: 'Not provided',
    points: 0,
    joinedDate: new Date().toISOString().split('T')[0],
    isTechnician: false,
    location: 'Not specified'
  };

  const currentUser = isAuthenticated && user ? {
    name: user.name,
    email: user.email,
    phone: user.phone || 'Not provided',
    points: user.points || 0,
    joinedDate: user.joinedDate || new Date().toISOString().split('T')[0],
    isTechnician: user.role === 'technician',
    location: user.location || 'Not specified'
  } : defaultUser;

  // Sample user analytics - in real app would come from API
  const analytics = {
    ticketsReported: isAuthenticated ? 12 : 0,
    ticketsUpvoted: isAuthenticated ? 45 : 0,
    pointsEarned: currentUser.points,
    badgesEarned: isAuthenticated ? 3 : 0
  };

  const handleEditProfile = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to edit your profile');
      return;
    }
    Alert.alert('Edit Profile', 'Would navigate to edit profile screen');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Would navigate to settings screen');
  };

  const handleLogout = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          logout();
          Alert.alert('Logged Out', 'You have been logged out successfully');
        }}
      ]
    );
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleRegister = () => {
    Alert.alert(
      'Register',
      'Choose your account type',
      [
        { text: 'Citizen', onPress: () => router.push('/auth/register-user') },
        { text: 'Technician', onPress: () => router.push('/auth/register-technician') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Would open support contact options');
  };

  const handleAbout = () => {
    Alert.alert('About Civix', 'Civix v1.0.0\nMaking communities better together');
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const styles = createStyles(colorScheme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <IconSymbol name="pencil" size={20} color={Colors[colorScheme].tint} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <IconSymbol name="person.fill" size={48} color="white" />
            </View>
            {currentUser.isTechnician && (
              <View style={styles.technicianBadge}>
                <IconSymbol name="wrench.fill" size={16} color="white" />
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{currentUser.name}</Text>
            {currentUser.isTechnician && (
              <Text style={styles.technicianLabel}>Technician</Text>
            )}
            <Text style={styles.userEmail}>{currentUser.email}</Text>
            <Text style={styles.userPhone}>{currentUser.phone}</Text>
            <Text style={styles.userLocation}>
              <IconSymbol name="location" size={14} color={Colors[colorScheme].tabIconDefault} />
              {' '}{currentUser.location}
            </Text>
            <Text style={styles.joinDate}>
              Member since {formatJoinDate(currentUser.joinedDate)}
            </Text>
          </View>
        </View>

        {/* Civix Points */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <IconSymbol name="star.fill" size={24} color="#F59E0B" />
            <Text style={styles.pointsTitle}>Civix Points</Text>
          </View>
          <Text style={styles.pointsValue}>{currentUser.points}</Text>
          <Text style={styles.pointsSubtext}>
            {isAuthenticated 
              ? 'Keep reporting and engaging to earn more points!'
              : 'Login to start earning points!'
            }
          </Text>
        </View>

        {/* Analytics */}
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Your Impact</Text>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticItem}>
              <Text style={styles.analyticNumber}>{analytics.ticketsReported}</Text>
              <Text style={styles.analyticLabel}>Tickets Reported</Text>
            </View>
            <View style={styles.analyticItem}>
              <Text style={styles.analyticNumber}>{analytics.ticketsUpvoted}</Text>
              <Text style={styles.analyticLabel}>Tickets Upvoted</Text>
            </View>
            <View style={styles.analyticItem}>
              <Text style={styles.analyticNumber}>{analytics.pointsEarned}</Text>
              <Text style={styles.analyticLabel}>Points Earned</Text>
            </View>
            <View style={styles.analyticItem}>
              <Text style={styles.analyticNumber}>{analytics.badgesEarned}</Text>
              <Text style={styles.analyticLabel}>Badges Earned</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <ThemeToggle />
          
          {/* Auth Section for non-authenticated users */}
          {!isAuthenticated && (
            <>
              <TouchableOpacity style={styles.menuItem} onPress={handleLogin}>
                <View style={styles.menuItemLeft}>
                  <IconSymbol name="person.circle" size={24} color="#10B981" />
                  <Text style={[styles.menuItemText, { color: '#10B981' }]}>Login</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme].tabIconDefault} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleRegister}>
                <View style={styles.menuItemLeft}>
                  <IconSymbol name="person.badge.plus" size={24} color="#3B82F6" />
                  <Text style={[styles.menuItemText, { color: '#3B82F6' }]}>Register</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme].tabIconDefault} />
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
            <View style={styles.menuItemLeft}>
              <IconSymbol name="gear" size={24} color={Colors[colorScheme].text} />
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme].tabIconDefault} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleContactSupport}>
            <View style={styles.menuItemLeft}>
              <IconSymbol name="questionmark.circle" size={24} color={Colors[colorScheme].text} />
              <Text style={styles.menuItemText}>Contact Support</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme].tabIconDefault} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
            <View style={styles.menuItemLeft}>
              <IconSymbol name="info.circle" size={24} color={Colors[colorScheme].text} />
              <Text style={styles.menuItemText}>About Civix</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme].tabIconDefault} />
          </TouchableOpacity>
        </View>

        {/* Logout/Login Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <IconSymbol 
              name={isAuthenticated ? "arrow.right.square" : "arrow.right.circle"} 
              size={24} 
              color={isAuthenticated ? "#EF4444" : "#10B981"} 
            />
            <Text style={[
              styles.logoutText, 
              { color: isAuthenticated ? "#EF4444" : "#10B981" }
            ]}>
              {isAuthenticated ? 'Logout' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Civix Version 1.0.0</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors[colorScheme].background,
    borderBottomWidth: 1,
    borderBottomColor: Colors[colorScheme].tabIconDefault + '20',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors[colorScheme].tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  technicianBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors[colorScheme].background,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
    marginBottom: 4,
  },
  technicianLabel: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    marginBottom: 8,
  },
  userLocation: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinDate: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
  },
  pointsCard: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pointsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors[colorScheme].text,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 8,
  },
  pointsSubtext: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
  },
  analyticsCard: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginBottom: 16,
    textAlign: 'center',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  analyticItem: {
    width: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors[colorScheme].tabIconDefault + '10',
    borderRadius: 12,
  },
  analyticNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors[colorScheme].tint,
    marginBottom: 4,
  },
  analyticLabel: {
    fontSize: 12,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
  },
  menuSection: {
    marginTop: 24,
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors[colorScheme].tabIconDefault + '20',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors[colorScheme].text,
  },
  logoutSection: {
    marginTop: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  versionSection: {
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
  },
});