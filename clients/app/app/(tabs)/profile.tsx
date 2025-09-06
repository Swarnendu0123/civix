import React, { useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import EditProfileModal from '@/components/EditProfileModal';

export default function ProfileScreen() {
  const { colorScheme } = useTheme();
  const { user, logout } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Sample user analytics - in real app would come from API
  const analytics = {
    ticketsReported: 12,
    ticketsUpvoted: 45,
    pointsEarned: user?.points || 250,
    badgesEarned: 3
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Would navigate to settings screen');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        }}
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
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            {user.role === 'technician' && (
              <View style={styles.technicianBadge}>
                <IconSymbol name="wrench.fill" size={16} color="white" />
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name || 'User'}</Text>
            {user.role === 'technician' && (
              <Text style={styles.technicianLabel}>Technician</Text>
            )}
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.phone && (
              <Text style={styles.userPhone}>{user.phone}</Text>
            )}
            {user.location && (
              <Text style={styles.userLocation}>
                <IconSymbol name="location" size={14} color={Colors[colorScheme].tabIconDefault} />
                {' '}{user.location}
              </Text>
            )}
            <Text style={styles.joinDate}>
              Member since {formatJoinDate(user.joinedDate)}
            </Text>
          </View>
        </View>

        {/* Civix Points */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <IconSymbol name="star.fill" size={24} color="#F59E0B" />
            <Text style={styles.pointsTitle}>Civix Points</Text>
          </View>
          <Text style={styles.pointsValue}>{user.points}</Text>
          <Text style={styles.pointsSubtext}>
            Keep reporting and engaging to earn more points!
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

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <IconSymbol name="arrow.right.square" size={24} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Civix Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        currentName={user.name || ''}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors[colorScheme].text,
  },
});