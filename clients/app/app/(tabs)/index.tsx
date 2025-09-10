import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import api, { ticketsAPI } from "@/services/api";
import TicketDetailModal from "@/components/TicketDetailModal";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    activeTickets: 0,
    resolvedToday: 0,
    inProgress: 0,
  });
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fetchingTicketDetails, setFetchingTicketDetails] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // Fetch analytics data
        try {
          const analyticsData = await api.analytics.getAnalytics();
          setAnalytics({
            activeTickets: analyticsData.activeTickets,
            resolvedToday: analyticsData.resolvedToday,
            inProgress: analyticsData.inProgress,
          });
        } catch (error) {
          console.log("Analytics not available, using sample data");
        }

        // Fetch recent tickets
        try {
          const ticketsResponse = await api.tickets.getTickets();
          const allTickets = ticketsResponse.tickets || [];
          // Get the 5 most recent tickets
          const recentTicketsRaw = allTickets.slice(0, 5);
          const transformedTickets = recentTicketsRaw.map((ticket: any) => {
            const mobileFormat = api.transformers.ticketToMobileFormat(ticket);
            // Keep original data for modal access
            return {
              ...mobileFormat,
              _originalTicket: ticket
            };
          });
          setRecentTickets(transformedTickets);
        } catch (error: any) {
          console.log("Tickets not available, using sample data", error);
          // Keep sample data as fallback
          setRecentTickets([]);
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
        Alert.alert(
          "Error",
          "Failed to load data. Please check your connection."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleReportticket = () => {
    router.push("/raise-ticket");
  };

  const handleTicketPress = async (ticket: any) => {
    try {
      setFetchingTicketDetails(true);
      setModalVisible(true);
      
      // If we have the original ticket data, use it directly
      if (ticket._originalTicket) {
        setSelectedTicket(ticket._originalTicket);
        setFetchingTicketDetails(false);
        return;
      }
      
      // Try to fetch fresh ticket details from the server using the original ticket ID
      const ticketId = ticket._id || ticket.id;
      const freshTicketResponse = await ticketsAPI.getTicket(ticketId);
      console.log('Fresh ticket data:', freshTicketResponse.ticket);
      setSelectedTicket(freshTicketResponse.ticket);
    } catch (error: any) {
      console.error('Failed to fetch ticket details:', error);
      
      // Fallback: Convert the mobile format ticket back to server format for the modal
      const fallbackTicket = {
        _id: ticket._id || ticket.id,
        creator_name: ticket.creatorName || 'Unknown',
        creator_id: ticket.creatorId || 'unknown',
        status: ticket.actualStatus || ticket.status || 'open',
        ticket_name: ticket.title,
        ticket_category: ticket.category,
        ticket_description: ticket.description,
        image_url: ticket.imageUrl || null,
        tags: ticket.tags || [],
        votes: {
          upvotes: ticket.upvotes || 0,
          downvotes: ticket.downvotes || 0
        },
        urgency: ticket.status === 'red' ? 'critical' : 
                 ticket.status === 'orange' ? 'moderate' : 'low',
        location: {
          latitude: parseFloat(ticket.location?.split(',')[0]) || 0,
          longitude: parseFloat(ticket.location?.split(',')[1]) || 0
        },
        opening_time: ticket.timestamp,
        createdAt: ticket.timestamp,
        updatedAt: ticket.timestamp,
        closing_time: null,
        authority: null
      };
      
      setSelectedTicket(fallbackTicket);
      Alert.alert('Warning', 'Could not load latest ticket details. Showing cached data.');
    } finally {
      setFetchingTicketDetails(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTicket(null);
  };

  const handleVote = async (ticketId: string, voteType: 'upvote' | 'downvote') => {
    if (!user?.email) {
      Alert.alert('Error', 'You must be logged in to vote');
      return;
    }

    try {
      // For now, just update the vote count locally as server might not be available
      if (selectedTicket && typeof selectedTicket === 'object') {
        const currentVotes = (selectedTicket as any).votes || { upvotes: 0, downvotes: 0 };
        const updatedTicket = {
          ...(selectedTicket as any),
          votes: {
            upvotes: voteType === 'upvote' ? 
              currentVotes.upvotes + 1 : 
              currentVotes.upvotes,
            downvotes: voteType === 'downvote' ? 
              currentVotes.downvotes + 1 : 
              currentVotes.downvotes
          }
        };
        setSelectedTicket(updatedTicket);
        Alert.alert('Success', `Ticket ${voteType}d successfully! (Demo mode)`);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      Alert.alert('Error', 'Failed to submit vote. Please try again.');
    }
  };

  const styles = createStyles(colorScheme ?? 'light');

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? "light"].tint}
          />
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
          <IconSymbol
            name="bell.fill"
            size={24}
            color={Colors[colorScheme ?? "light"].tint}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleReportticket}
          >
            <IconSymbol name="plus.circle.fill" size={24} color="white" />
            <Text style={styles.primaryButtonText}>Report ticket</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Tickets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Tickets Feed</Text>
          {recentTickets.map((ticket: any) => (
            <TouchableOpacity 
              key={ticket.id || ticket._id} 
              style={styles.ticketCard}
              onPress={() => handleTicketPress(ticket)}
            >
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle}>{ticket.title || ticket.ticket_name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(ticket.statusColor || ticket.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{ticket.status}</Text>
                </View>
              </View>
              <Text style={styles.ticketLocation}>{ticket.location}</Text>
              <View style={styles.ticketFooter}>
                <Text style={styles.ticketMeta}>
                  {ticket.timestamp} • {ticket.distance}
                </Text>
                <View style={styles.upvoteContainer}>
                  <IconSymbol name="arrow.up" size={16} color="#6B7280" />
                  <Text style={styles.upvoteText}>{ticket.upvotes || ticket.votes?.upvotes || 0}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TicketDetailModal
        visible={modalVisible}
        ticket={selectedTicket}
        onClose={handleCloseModal}
        currentUserId={user?.email}
        loading={fetchingTicketDetails}
        onVote={handleVote}
      />
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "red":
    case "open":
      return "#EF4444";
    case "orange":
    case "in process":
      return "#F59E0B";
    case "green":
    case "resolved":
      return "#10B981";
    default:
      return "#6B7280";
  }
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: Colors[colorScheme].background,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].tabIconDefault + "20",
    },
    headerLeft: {
      flex: 1,
    },
    greeting: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      fontWeight: "500",
    },
    userName: {
      fontSize: 24,
      color: Colors[colorScheme].text,
      fontWeight: "bold",
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
      fontWeight: "bold",
      color: Colors[colorScheme].text,
      marginBottom: 16,
    },
    analyticsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    analyticsCard: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    analyticsNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
    },
    analyticsLabel: {
      fontSize: 12,
      color: "white",
      textAlign: "center",
      marginTop: 4,
    },
    mapPreview: {
      height: 120,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].tabIconDefault + "30",
    },
    mapPlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    mapText: {
      marginTop: 8,
      color: Colors[colorScheme].tabIconDefault,
      fontSize: 16,
    },
    ticketCard: {
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].tabIconDefault + "30",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    ticketHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    ticketTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
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
      color: "white",
      fontWeight: "500",
    },
    ticketLocation: {
      fontSize: 14,
      color: Colors[colorScheme].tabIconDefault,
      marginBottom: 8,
    },
    ticketFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    ticketMeta: {
      fontSize: 12,
      color: Colors[colorScheme].tabIconDefault,
    },
    upvoteContainer: {
      flexDirection: "row",
      alignItems: "center",
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
      backgroundColor: "#3B82F6",
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    primaryButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    secondaryButton: {
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 2,
      borderColor: "#3B82F6",
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    secondaryButtonText: {
      color: "#3B82F6",
      fontSize: 16,
      fontWeight: "600",
    },
    pointsCard: {
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: "#F59E0B",
      borderRadius: 12,
      padding: 20,
      marginTop: 24,
      marginBottom: 32,
      alignItems: "center",
    },
    pointsHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    pointsTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    pointsValue: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#F59E0B",
      marginBottom: 4,
    },
    pointsSubtext: {
      fontSize: 14,
      color: Colors[colorScheme].tabIconDefault,
      textAlign: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors[colorScheme].background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: Colors[colorScheme].text,
    },
  });
