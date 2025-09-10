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
import { useAuth } from '@/hooks/useAuth';
import EditProfileModal from '@/components/EditProfileModal';

export default function ProfileScreen() {
  const { colorScheme } = useTheme();
  const { user, logout } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleEditProfile = () => {
    setEditModalVisible(true);
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
          } catch {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        }}
      ]
    );
  };

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const styles = createStyles(colorScheme);

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
            {user.isTechnician && (
              <View style={styles.technicianBadge}>
                <IconSymbol name="wrench.fill" size={16} color="white" />
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name || 'User'}</Text>
            {user.isTechnician && (
              <Text style={styles.technicianLabel}>Technician</Text>
            )}
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.phone && (
              <Text style={styles.userPhone}>{user.phone}</Text>
            )}
            {user.address && (
              <Text style={styles.userLocation}>
                <IconSymbol name="location" size={14} color={Colors[colorScheme].tabIconDefault} />
                {' '}{user.address}
              </Text>
            )}
            <Text style={styles.joinDate}>
              Member since {formatJoinDate(user.createdAt)}
            </Text>
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <IconSymbol name="envelope" size={16} color={Colors[colorScheme].tabIconDefault} />
              <Text style={styles.detailLabel}>Email</Text>
            </View>
            <Text style={styles.detailValue}>{user.email}</Text>
            <Text style={styles.notEditable}>Not editable</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <IconSymbol name="person" size={16} color={Colors[colorScheme].tabIconDefault} />
              <Text style={styles.detailLabel}>Name</Text>
            </View>
            <Text style={styles.detailValue}>{user.name || 'Not set'}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <IconSymbol name="phone" size={16} color={Colors[colorScheme].tabIconDefault} />
              <Text style={styles.detailLabel}>Phone</Text>
            </View>
            <Text style={styles.detailValue}>{user.phone || 'Not set'}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <IconSymbol name="location" size={16} color={Colors[colorScheme].tabIconDefault} />
              <Text style={styles.detailLabel}>Address</Text>
            </View>
            <Text style={styles.detailValue}>{user.address || 'Not set'}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <IconSymbol name="shield" size={16} color={Colors[colorScheme].tabIconDefault} />
              <Text style={styles.detailLabel}>Role</Text>
            </View>
            <Text style={styles.detailValue}>{user.role}</Text>
          </View>
        </View>

        {/* Civix Points */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <IconSymbol name="star.fill" size={24} color="#F59E0B" />
            <Text style={styles.pointsTitle}>Civix Points</Text>
          </View>
          <Text style={styles.pointsValue}>{user.points || 0}</Text>
          <Text style={styles.pointsSubtext}>
            Keep reporting and engaging to earn more points!
          </Text>
        </View>

        {/* Ticket Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Tickets</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.tickets?.length || 0}</Text>
              <Text style={styles.statLabel}>Tickets Reported</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <IconSymbol name="arrow.right.square" size={24} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        user={user}
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
  detailsCard: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginBottom: 16,
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors[colorScheme].tabIconDefault + '20',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: Colors[colorScheme].text,
    marginBottom: 2,
  },
  notEditable: {
    fontSize: 12,
    color: Colors[colorScheme].tabIconDefault,
    fontStyle: 'italic',
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
  statsCard: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors[colorScheme].tabIconDefault + '10',
    borderRadius: 12,
    minWidth: 120,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors[colorScheme].tint,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
  },
  logoutSection: {
    marginTop: 24,
    marginBottom: 32,
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