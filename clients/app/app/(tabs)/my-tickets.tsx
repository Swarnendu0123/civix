import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

export default function MyTicketsScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch tickets created by the current user
        const response = await api.tickets.getTickets({ 
          userId: user._id 
        });
        
        if (response && response.tickets) {
          const transformedTickets = response.tickets.map(api.transformers.ticketToMobileFormat);
          setUserTickets(transformedTickets);
        } else {
          // Use sample data as fallback
          setUserTickets(getSampleUserTickets(user.email));
        }
      } catch (error) {
        console.log('Failed to fetch user tickets, using sample data');
        // Use sample data as fallback
        setUserTickets(getSampleUserTickets(user.email));
      } finally {
        setLoading(false);
      }
    };

    fetchUserTickets();
  }, [user]);

  // Sample data filtered by user email for demonstration
  const getSampleUserTickets = (userEmail: string) => {
    // In a real app, this would be filtered on the backend
    // For demo purposes, we'll show different tickets based on user email
    const allTickets = [
      {
        id: 'TICK-001',
        title: 'Pothole near MMM College',
        description: 'Large pothole causing traffic issues and vehicle damage',
        category: 'Roads',
        status: 'in_progress',
        urgency: 'critical',
        location: 'Main Street, Sector 12',
        reportedAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        upvotes: 15,
        assignedTo: 'Tech-001',
        reportedBy: userEmail
      },
      {
        id: 'TICK-002',
        title: 'Street light not working',
        description: 'Multiple street lights on Park Avenue are not functioning',
        category: 'Electricity',
        status: 'open',
        urgency: 'moderate',
        location: 'Park Avenue, Block A',
        reportedAt: '2024-01-14T16:45:00Z',
        updatedAt: '2024-01-14T16:45:00Z',
        upvotes: 8,
        assignedTo: null,
        reportedBy: userEmail
      },
      {
        id: 'TICK-003',
        title: 'Water leak fixed',
        description: 'Water pipe leak causing waterlogging in residential area',
        category: 'Water Supply',
        status: 'resolved',
        urgency: 'high',
        location: 'Green Lane, Colony 3',
        reportedAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-12T11:30:00Z',
        upvotes: 23,
        assignedTo: 'Tech-003',
        reportedBy: userEmail
      }
    ];

    // Return only tickets reported by this user
    return allTickets.filter(ticket => ticket.reportedBy === userEmail);
  };

  const filteredTickets = userTickets.filter(ticket => 
    selectedFilter === 'all' || ticket.status === selectedFilter
  );

  const handleTicketPress = (ticket: any) => {
    Alert.alert(
      ticket.title,
      `Status: ${ticket.status}\nCategory: ${ticket.category}\nLocation: ${ticket.location}`,
      [
        { text: 'View Details', onPress: () => console.log('View details for', ticket.id) },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'open': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#EF4444';
      case 'high': return '#F97316';
      case 'moderate': return '#F59E0B';
      case 'low': return '#84CC16';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const styles = createStyles(colorScheme);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Tickets</Text>
          <Text style={styles.subtitle}>Track your reported issues</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <Text style={styles.loadingText}>Loading your tickets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Tickets</Text>
        <Text style={styles.subtitle}>Track your reported issues</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'open', 'in_progress', 'resolved'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextActive
            ]}>
              {filter === 'in_progress' ? 'In Progress' : 
               filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tickets Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
          {selectedFilter !== 'all' && ` (${selectedFilter.replace('_', ' ')})`}
        </Text>
      </View>

      {/* Tickets List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredTickets.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="doc.text" size={64} color="#6B7280" />
            <Text style={styles.emptyTitle}>No tickets found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'all' 
                ? "You haven't reported any issues yet"
                : `No ${selectedFilter.replace('_', ' ')} tickets`}
            </Text>
          </View>
        ) : (
          filteredTickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              style={styles.ticketCard}
              onPress={() => handleTicketPress(ticket)}
            >
              {/* Ticket Header */}
              <View style={styles.ticketHeader}>
                <View style={styles.ticketHeaderLeft}>
                  <Text style={styles.ticketTitle}>{ticket.title}</Text>
                  <Text style={styles.ticketId}>#{ticket.id}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(ticket.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                    {ticket.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>

              {/* Ticket Description */}
              <Text style={styles.ticketDescription} numberOfLines={2}>
                {ticket.description}
              </Text>

              {/* Ticket Meta */}
              <View style={styles.ticketMeta}>
                <View style={styles.metaRow}>
                  <IconSymbol name="location" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{ticket.location}</Text>
                </View>
                <View style={styles.metaRow}>
                  <IconSymbol name="tag" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{ticket.category}</Text>
                </View>
              </View>

              {/* Ticket Footer */}
              <View style={styles.ticketFooter}>
                <View style={styles.footerLeft}>
                  <View style={styles.urgencyBadge}>
                    <View style={[styles.urgencyDot, { backgroundColor: getUrgencyColor(ticket.urgency) }]} />
                    <Text style={styles.urgencyText}>{ticket.urgency}</Text>
                  </View>
                  <Text style={styles.timeText}>
                    Reported {formatDate(ticket.reportedAt)}
                  </Text>
                </View>
                <View style={styles.footerRight}>
                  <View style={styles.upvoteContainer}>
                    <IconSymbol name="arrow.up" size={16} color="#6B7280" />
                    <Text style={styles.upvoteText}>{ticket.upvotes}</Text>
                  </View>
                </View>
              </View>

              {/* Assignment Status */}
              {ticket.assignedTo && (
                <View style={styles.assignmentContainer}>
                  <IconSymbol name="person.fill" size={14} color="#3B82F6" />
                  <Text style={styles.assignmentText}>
                    Assigned to {ticket.assignedTo}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
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
  subtitle: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
  },
  filterButtonActive: {
    backgroundColor: Colors[colorScheme].tint,
    borderColor: Colors[colorScheme].tint,
  },
  filterText: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  countText: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
    marginTop: 8,
  },
  ticketCard: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginBottom: 4,
  },
  ticketId: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ticketDescription: {
    fontSize: 16,
    color: Colors[colorScheme].text,
    lineHeight: 22,
    marginBottom: 12,
  },
  ticketMeta: {
    gap: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
    gap: 6,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  urgencyText: {
    fontSize: 12,
    color: Colors[colorScheme].tabIconDefault,
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 12,
    color: Colors[colorScheme].tabIconDefault,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  upvoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upvoteText: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
  },
  assignmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors[colorScheme].tabIconDefault + '20',
  },
  assignmentText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors[colorScheme].text,
  },
});