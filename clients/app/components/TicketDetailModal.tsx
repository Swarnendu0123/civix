import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/hooks/useTheme';

interface Location {
  latitude: number;
  longitude: number;
}

interface Votes {
  upvotes: number;
  downvotes: number;
}

interface Ticket {
  _id: string;
  creator_id: string;
  creator_name: string;
  status: 'open' | 'resolved' | 'in process';
  ticket_name: string;
  ticket_category: string;
  ticket_description: string;
  image_url?: string;
  tags: string[];
  votes: Votes;
  urgency: 'critical' | 'moderate' | 'low';
  location: Location;
  opening_time: string;
  closing_time?: string;
  authority?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TicketDetailModalProps {
  visible: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onVote?: (ticketId: string, voteType: 'upvote' | 'downvote') => void;
  currentUserId?: string;
  loading?: boolean;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  visible,
  ticket,
  onClose,
  onVote,
  loading = false,
}) => {
  const { isDark } = useTheme();
  
  // Get theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = isDark ? '#333' : '#e1e1e1';

  // Debug logging
  console.log('TicketDetailModal render:', { visible, ticket: ticket ? { ...ticket } : null, loading });

  if (!visible) return null;

  if (!ticket) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={[styles.container, { backgroundColor }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              Ticket Details
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: textColor }]}>
              No ticket data available
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#FF6B6B';
      case 'in process':
        return '#4ECDC4';
      case 'resolved':
        return '#45B7D1';
      default:
        return textColor;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return '#FF4757';
      case 'moderate':
        return '#FFA726';
      case 'low':
        return '#66BB6A';
      default:
        return textColor;
    }
  };

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (onVote && ticket._id) {
      onVote(ticket._id, voteType);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openLocationInMaps = () => {
    if (!ticket.location?.latitude || !ticket.location?.longitude) {
      Alert.alert('Error', 'Location information is not available');
      return;
    }
    
    const { latitude, longitude } = ticket.location;
    const url = `https://maps.google.com/maps?q=${latitude},${longitude}`;
    Alert.alert(
      'Open Location',
      'Do you want to open this location in Google Maps?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open', 
          onPress: () => {
            // In a real app, you would use Linking.openURL(url)
            console.log('Opening location:', url);
          }
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Ticket Details
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tintColor} />
              <Text style={[styles.loadingText, { color: textColor }]}>
                Loading ticket details...
              </Text>
            </View>
          ) : ticket ? (
            <>
              {/* Status and Urgency Row */}
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                  <Text style={styles.statusText}>{ticket.status?.toUpperCase() || 'UNKNOWN'}</Text>
                </View>
                <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(ticket.urgency) }]}>
                  <Text style={styles.urgencyText}>{ticket.urgency?.toUpperCase() || 'LOW'}</Text>
                </View>
              </View>

          {/* ticket Title */}
          <Text style={[styles.ticketTitle, { color: textColor }]}>
            {ticket.ticket_name}
          </Text>

          {/* Category */}
          <View style={styles.categoryContainer}>
            <Ionicons name="pricetag" size={16} color={tintColor} />
            <Text style={[styles.categoryText, { color: textColor }]}>
              {ticket.ticket_category}
            </Text>
          </View>

          {/* Image */}
          {ticket.image_url && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: ticket.image_url }} style={styles.image} />
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Description</Text>
            <Text style={[styles.description, { color: textColor }]}>
              {ticket.ticket_description}
            </Text>
          </View>

          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Tags</Text>
              <View style={styles.tagsContainer}>
                {ticket.tags.map((tag, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: tintColor + '20' }]}>
                    <Text style={[styles.tagText, { color: tintColor }]}>
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Creator Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Reported By</Text>
            <View style={styles.creatorInfo}>
              <Ionicons name="person-circle" size={20} color={tintColor} />
              <Text style={[styles.creatorName, { color: textColor }]}>
                {ticket.creator_name}
              </Text>
            </View>
          </View>

          {/* Authority (if assigned) */}
          {ticket.authority && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Assigned To</Text>
              <View style={styles.authorityInfo}>
                <Ionicons name="shield-checkmark" size={20} color={tintColor} />
                <Text style={[styles.authorityName, { color: textColor }]}>
                  {ticket.authority.name}
                </Text>
              </View>
            </View>
          )}

          {/* Location */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Location</Text>
            <TouchableOpacity style={styles.locationContainer} onPress={openLocationInMaps}>
              <Ionicons name="location" size={20} color={tintColor} />
              <View style={styles.locationText}>
                <Text style={[styles.coordinates, { color: textColor }]}>
                  {ticket.location?.latitude?.toFixed(6) || '0.000000'}, {ticket.location?.longitude?.toFixed(6) || '0.000000'}
                </Text>
                <Text style={[styles.viewOnMap, { color: tintColor }]}>
                  Tap to view on map
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Voting */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Community Support</Text>
            <View style={styles.votingContainer}>
              <TouchableOpacity 
                style={[styles.voteButton, { backgroundColor: tintColor + '20' }]}
                onPress={() => handleVote('upvote')}
              >
                <Ionicons name="thumbs-up" size={20} color={tintColor} />
                <Text style={[styles.voteCount, { color: tintColor }]}>
                  {ticket.votes?.upvotes || 0}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.voteButton, { backgroundColor: '#FF6B6B20' }]}
                onPress={() => handleVote('downvote')}
              >
                <Ionicons name="thumbs-down" size={20} color="#FF6B6B" />
                <Text style={[styles.voteCount, { color: '#FF6B6B' }]}>
                  {ticket.votes?.downvotes || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Timestamps */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Timeline</Text>
            <View style={styles.timestampContainer}>
              <View style={styles.timestampItem}>
                <Ionicons name="time" size={16} color={tintColor} />
                <View>
                  <Text style={[styles.timestampLabel, { color: textColor }]}>
                    Reported
                  </Text>
                  <Text style={[styles.timestampValue, { color: textColor }]}>
                    {formatDate(ticket.createdAt)}
                  </Text>
                </View>
              </View>
              
              {ticket.closing_time && (
                <View style={styles.timestampItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#45B7D1" />
                  <View>
                    <Text style={[styles.timestampLabel, { color: textColor }]}>
                      Resolved
                    </Text>
                    <Text style={[styles.timestampValue, { color: textColor }]}>
                      {formatDate(ticket.closing_time)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

              {/* Bottom spacing */}
              <View style={styles.bottomSpacing} />
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: textColor }]}>
                No ticket data available
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flex: 1,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flex: 1,
    marginLeft: 8,
  },
  urgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  ticketTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorName: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  authorityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorityName: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    flex: 1,
  },
  coordinates: {
    fontSize: 16,
    fontWeight: '500',
  },
  viewOnMap: {
    fontSize: 14,
    marginTop: 2,
  },
  votingContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestampContainer: {
    gap: 16,
  },
  timestampItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timestampLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  timestampValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TicketDetailModal;
