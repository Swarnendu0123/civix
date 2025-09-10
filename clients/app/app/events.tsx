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
import { router } from 'expo-router';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  category: 'cleanup' | 'community' | 'awareness' | 'volunteer';
  isJoined: boolean;
}

export default function EventsScreen() {
  const { colorScheme } = useTheme();
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set());

  // Sample events data - in real app would come from API
  const events: Event[] = [
    {
      id: 'E001',
      title: 'Community Beach Cleanup',
      description: 'Join us for a community beach cleanup drive. Help make our beaches cleaner and safer for everyone.',
      date: '2024-01-15',
      time: '9:00 AM - 12:00 PM',
      location: 'Marine Drive Beach',
      participants: 25,
      maxParticipants: 50,
      category: 'cleanup',
      isJoined: false
    },
    {
      id: 'E002',
      title: 'Road Safety Awareness Campaign',
      description: 'Spread awareness about road safety and traffic rules in our neighborhood.',
      date: '2024-01-18',
      time: '6:00 PM - 8:00 PM',
      location: 'Central Park',
      participants: 15,
      maxParticipants: 30,
      category: 'awareness',
      isJoined: false
    },
    {
      id: 'E003',
      title: 'Tree Plantation Drive',
      description: 'Help us plant trees and make our city greener. All materials will be provided.',
      date: '2024-01-22',
      time: '7:00 AM - 10:00 AM',
      location: 'City Garden',
      participants: 40,
      maxParticipants: 100,
      category: 'community',
      isJoined: false
    },
    {
      id: 'E004',
      title: 'Volunteer at Local Food Bank',
      description: 'Help sort and distribute food to those in need in our community.',
      date: '2024-01-25',
      time: '2:00 PM - 6:00 PM',
      location: 'Community Center',
      participants: 12,
      maxParticipants: 20,
      category: 'volunteer',
      isJoined: false
    }
  ];

  const handleJoinEvent = (eventId: string) => {
    if (joinedEvents.has(eventId)) {
      Alert.alert(
        'Leave Event',
        'Are you sure you want to leave this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Leave', 
            style: 'destructive',
            onPress: () => {
              setJoinedEvents(prev => {
                const newSet = new Set(prev);
                newSet.delete(eventId);
                return newSet;
              });
              Alert.alert('Left Event', 'You have left this event successfully.');
            }
          }
        ]
      );
    } else {
      setJoinedEvents(prev => new Set([...prev, eventId]));
      Alert.alert(
        'Joined Event!', 
        'You have successfully joined this event. You will receive updates and reminders.',
        [{ text: 'OK' }]
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cleanup': return 'trash';
      case 'community': return 'person.3.fill';
      case 'awareness': return 'megaphone.fill';
      case 'volunteer': return 'heart.fill';
      default: return 'calendar';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cleanup': return '#10B981';
      case 'community': return '#3B82F6';
      case 'awareness': return '#F59E0B';
      case 'volunteer': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const styles = createStyles(colorScheme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <Text style={styles.title}>Community Events</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.subtitle}>Join local events and make a difference in your community</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{events.length}</Text>
              <Text style={styles.statLabel}>Events Available</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{joinedEvents.size}</Text>
              <Text style={styles.statLabel}>Events Joined</Text>
            </View>
          </View>
        </View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          {events.map((event) => {
            const isJoined = joinedEvents.has(event.id);
            return (
              <View key={event.id} style={styles.eventCard}>
                {/* Event Header */}
                <View style={styles.eventHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
                    <IconSymbol name={getCategoryIcon(event.category)} size={16} color="white" />
                    <Text style={styles.categoryText}>
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </Text>
                  </View>
                  {isJoined && (
                    <View style={styles.joinedBadge}>
                      <IconSymbol name="checkmark.circle.fill" size={16} color="#10B981" />
                      <Text style={styles.joinedText}>Joined</Text>
                    </View>
                  )}
                </View>

                {/* Event Content */}
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDescription}>{event.description}</Text>

                {/* Event Details */}
                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <IconSymbol name="calendar" size={16} color={Colors[colorScheme].tabIconDefault} />
                    <Text style={styles.detailText}>{formatDate(event.date)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <IconSymbol name="clock" size={16} color={Colors[colorScheme].tabIconDefault} />
                    <Text style={styles.detailText}>{event.time}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <IconSymbol name="location" size={16} color={Colors[colorScheme].tabIconDefault} />
                    <Text style={styles.detailText}>{event.location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <IconSymbol name="person.3" size={16} color={Colors[colorScheme].tabIconDefault} />
                    <Text style={styles.detailText}>
                      {event.participants}/{event.maxParticipants} participants
                    </Text>
                  </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    isJoined ? styles.leaveButton : styles.joinButton
                  ]}
                  onPress={() => handleJoinEvent(event.id)}
                >
                  <IconSymbol 
                    name={isJoined ? "minus.circle" : "plus.circle"} 
                    size={20} 
                    color="white" 
                  />
                  <Text style={styles.actionButtonText}>
                    {isJoined ? 'Leave Event' : 'Join Event'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Can't find what you're looking for? Contact the community organizers to suggest new events.
          </Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors[colorScheme].background,
    borderBottomWidth: 1,
    borderBottomColor: Colors[colorScheme].tabIconDefault + '20',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerInfo: {
    marginTop: 16,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors[colorScheme].tint,
  },
  statLabel: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    marginTop: 4,
  },
  eventsContainer: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 16,
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors[colorScheme].text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  joinButton: {
    backgroundColor: '#3B82F6',
  },
  leaveButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
    lineHeight: 20,
  },
});