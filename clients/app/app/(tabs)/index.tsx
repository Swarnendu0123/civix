import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import api from '@/services/api';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [user, setUser] = useState({ name: 'John Doe', points: 250 });
  const [analytics, setAnalytics] = useState({
    activeTickets: 0,
    resolvedToday: 0,
    inProgress: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // If user is authenticated, fetch real data
        try {
          const profileData = await api.user.getProfile();
          setUser({
            name: profileData.name,
            points: profileData.points || 250
          });
        } catch (error) {
          // User not authenticated, use sample data
          console.log('User not authenticated, using sample data');
        }

        // Fetch analytics data
        try {
          const analyticsData = await api.analytics.getAnalytics();
          setAnalytics({
            activeTickets: analyticsData.activeTickets,
            resolvedToday: analyticsData.resolvedToday,
            inProgress: analyticsData.inProgress
          });
        } catch (error) {
          console.log('Analytics not available, using sample data');
        }

        // Fetch recent tickets
        try {
          const ticketsResponse = await api.tickets.getTickets({ limit: 5 });
          const transformedTickets = ticketsResponse.tickets.map(api.transformers.ticketToMobileFormat);
          setRecentTickets(transformedTickets);
        } catch (error) {
          console.log('Tickets not available, using sample data');
          // Keep sample data as fallback
          setRecentTickets([
            {
              id: 'TICK-001',
              title: 'Pothole near MMM',
              location: 'Main Street, Sector 12',
              timestamp: '2 hours ago',
              upvotes: 15,
              distance: '0.5 km',
              status: 'Urgent',
              statusColor: 'red',
              description: 'Large pothole causing damage to vehicles. Urgent repair needed.',
              category: 'Roads',
              imageUrl: null,
              canUpvote: true
            },
            {
              id: 'TICK-002',
              title: 'Street light not working',
              location: 'Park Avenue, Block A',
              timestamp: '4 hours ago',
              upvotes: 8,
              distance: '1.2 km',
              status: 'Moderate',
              statusColor: 'orange',
              description: 'Street light has been non-functional for 3 days. Safety concern for residents.',
              category: 'Electricity',
              imageUrl: null,
              canUpvote: true
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
        Alert.alert('Error', 'Failed to load data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleReportIssue = () => {
    router.push('/raise-issue');
  };

  const handleMapView = () => {
    router.push('/map');
  };

  const handleTicketPress = (ticketId: string) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };

  const handleUpvote = async (ticketId: string) => {
    try {
      // Optimistically update the UI
      setRecentTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, upvotes: ticket.upvotes + 1, canUpvote: false }
          : ticket
      ));

      // Make API call
      await api.tickets.voteTicket(ticketId, 'upvote');
      
      Alert.alert('Success', 'Your upvote has been recorded!');
    } catch (error) {
      // Revert optimistic update on error
      setRecentTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, upvotes: ticket.upvotes - 1, canUpvote: true }
          : ticket
      ));
      
      Alert.alert('Error', 'Failed to record your upvote. Please try again.');
      console.error('Upvote error:', error);
    }
  };

  const styles = createStyles(colorScheme);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()}!</Text>
          <Text style={styles.userName}>{user.name}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <IconSymbol name="bell.fill" size={24} color={Colors[colorScheme ?? 'light'].tint} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Analytics Dashboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics Dashboard</Text>
          <View style={styles.analyticsGrid}>
            <View style={[styles.analyticsCard, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.analyticsNumber}>{analytics.activeTickets}</Text>
              <Text style={styles.analyticsLabel}>Active Tickets</Text>
            </View>
            <View style={[styles.analyticsCard, { backgroundColor: '#10B981' }]}>
              <Text style={styles.analyticsNumber}>{analytics.resolvedToday}</Text>
              <Text style={styles.analyticsLabel}>Resolved Today</Text>
            </View>
            <View style={[styles.analyticsCard, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.analyticsNumber}>{analytics.inProgress}</Text>
              <Text style={styles.analyticsLabel}>In Progress</Text>
            </View>
          </View>
        </View>

        {/* Area Overview Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Area Overview</Text>
          <TouchableOpacity style={styles.mapPreview} onPress={handleMapView}>
            <View style={styles.mapPlaceholder}>
              <IconSymbol name="map.fill" size={48} color="#6B7280" />
              <Text style={styles.mapText}>Tap to view map</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Tickets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Tickets</Text>
          {recentTickets.map((ticket) => (
            <TouchableOpacity 
              key={ticket.id} 
              style={styles.ticketCard} 
              onPress={() => handleTicketPress(ticket.id)}
            >
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle}>{ticket.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.statusColor) }]}>
                  <Text style={styles.statusText}>{ticket.status}</Text>
                </View>
              </View>
              <Text style={styles.ticketLocation}>{ticket.location}</Text>
              <View style={styles.ticketFooter}>
                <Text style={styles.ticketMeta}>{ticket.timestamp} • {ticket.distance}</Text>
                <View style={styles.upvoteContainer}>
                  <IconSymbol name="arrow.up" size={16} color="#6B7280" />
                  <Text style={styles.upvoteText}>{ticket.upvotes}</Text>
                </View>
              </View>
              
              {/* Expanded Details */}
              {expandedTicket === ticket.id && (
                <View style={styles.expandedDetails}>
                  <View style={styles.detailsDivider} />
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsTitle}>Issue Details</Text>
                    <Text style={styles.detailsDescription}>{ticket.description}</Text>
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <View style={styles.detailsItem}>
                      <Text style={styles.detailsLabel}>Category</Text>
                      <Text style={styles.detailsValue}>{ticket.category}</Text>
                    </View>
                    <View style={styles.detailsItem}>
                      <Text style={styles.detailsLabel}>Priority</Text>
                      <Text style={styles.detailsValue}>{ticket.status}</Text>
                    </View>
                  </View>
                  
                  {ticket.imageUrl && (
                    <View style={styles.detailsSection}>
                      <Text style={styles.detailsLabel}>Attached Image</Text>
                      <View style={styles.imagePlaceholder}>
                        <IconSymbol name="photo.fill" size={32} color="#6B7280" />
                        <Text style={styles.imagePlaceholderText}>Image would be displayed here</Text>
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity 
                      style={[styles.upvoteButton, !ticket.canUpvote && styles.upvoteButtonDisabled]}
                      onPress={() => handleUpvote(ticket.id)}
                      disabled={!ticket.canUpvote}
                    >
                      <IconSymbol name="arrow.up" size={20} color={ticket.canUpvote ? "white" : "#6B7280"} />
                      <Text style={[styles.upvoteButtonText, !ticket.canUpvote && styles.upvoteButtonTextDisabled]}>
                        {ticket.canUpvote ? 'Upvote' : 'Voted'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.shareButton}>
                      <IconSymbol name="square.and.arrow.up" size={20} color="#3B82F6" />
                      <Text style={styles.shareButtonText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleReportIssue}>
            <IconSymbol name="plus.circle.fill" size={24} color="white" />
            <Text style={styles.primaryButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>

        {/* Civix Points */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <IconSymbol name="star.fill" size={24} color="#F59E0B" />
            <Text style={styles.pointsTitle}>Civix Points</Text>
          </View>
          <Text style={styles.pointsValue}>{user.points}</Text>
          <Text style={styles.pointsSubtext}>Keep reporting issues to earn more points!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (color: string) => {
  switch (color) {
    case 'red': return '#EF4444';
    case 'orange': return '#F59E0B';
    case 'green': return '#10B981';
    default: return '#6B7280';
  }
};

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
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: Colors[colorScheme].text,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    color: Colors[colorScheme].text,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  analyticsLabel: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
  },
  mapPreview: {
    height: 120,
    borderRadius: 12,
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    marginTop: 8,
    color: Colors[colorScheme].tabIconDefault,
    fontSize: 16,
  },
  ticketCard: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  ticketLocation: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    marginBottom: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketMeta: {
    fontSize: 12,
    color: Colors[colorScheme].tabIconDefault,
  },
  upvoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upvoteText: {
    fontSize: 12,
    color: Colors[colorScheme].tabIconDefault,
  },
  actionSection: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 2,
    borderColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  pointsCard: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    marginBottom: 32,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  pointsSubtext: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors[colorScheme].background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors[colorScheme].text,
  },
  expandedDetails: {
    marginTop: 16,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: Colors[colorScheme].tabIconDefault + '20',
    marginBottom: 16,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginBottom: 8,
  },
  detailsDescription: {
    fontSize: 14,
    color: Colors[colorScheme].text,
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailsItem: {
    flex: 1,
    marginRight: 12,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors[colorScheme].tabIconDefault,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailsValue: {
    fontSize: 14,
    color: Colors[colorScheme].text,
    fontWeight: '500',
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: Colors[colorScheme].tabIconDefault + '10',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: Colors[colorScheme].tabIconDefault,
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  upvoteButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  upvoteButtonDisabled: {
    backgroundColor: Colors[colorScheme].tabIconDefault + '30',
  },
  upvoteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  upvoteButtonTextDisabled: {
    color: Colors[colorScheme].tabIconDefault,
  },
  shareButton: {
    flex: 1,
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
});
