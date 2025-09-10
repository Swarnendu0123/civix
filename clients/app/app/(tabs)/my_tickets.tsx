import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import TicketDetailModal from "@/components/TicketDetailModal";
import { ticketsAPI, userAPI } from "@/services/api";

export default function MyTicketsScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fetchingTicketDetails, setFetchingTicketDetails] = useState(false);

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    try {
      setLoading(true);

      // First try to get user profile with tickets
      try {
        const userProfile = await userAPI.getUserProfileWithTickets(
          user?.email
        );
        if (userProfile?.tickets) {
          setUserTickets(userProfile.tickets);
          return;
        }
      } catch (error) {
        console.log("Could not fetch user profile with tickets");
      }

      // Fallback: Get all tickets and filter by user
      const allTicketsResponse = await ticketsAPI.getTickets();
      const allTickets = allTicketsResponse.tickets || [];

      // Filter tickets created by the current user
      const myTickets = allTickets.filter(
        (ticket: any) =>
          ticket.creator_id === user?.email ||
          ticket.creator_email === user?.email
      );

      setUserTickets(myTickets);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      Alert.alert("Error", "Failed to load your tickets. Please try again.");

      // Mock data for demonstration
      setUserTickets([
        {
          _id: "demo-1",
          creator_id: user?.email,
          creator_name: user?.name,
          status: "open",
          issue_name: "Pothole on Main Street",
          issue_category: "infrastructure",
          issue_description: "Large pothole causing traffic issues",
          votes: { upvotes: 5, downvotes: 0 },
          urgency: "moderate",
          location: { latitude: 22.3215693, longitude: 87.3017214 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "demo-2",
          creator_id: user?.email,
          creator_name: user?.name,
          status: "in process",
          issue_name: "Street Light Not Working",
          issue_category: "electricity",
          issue_description: "Street light has been out for 3 days",
          votes: { upvotes: 8, downvotes: 1 },
          urgency: "low",
          location: { latitude: 22.32, longitude: 87.3 },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 43200000).toISOString(),
        },
        {
          _id: "demo-3",
          creator_id: user?.email,
          creator_name: user?.name,
          status: "resolved",
          issue_name: "Garbage Collection Missed",
          issue_category: "sanitation",
          issue_description: "Garbage not collected for 2 days in our area",
          votes: { upvotes: 12, downvotes: 0 },
          urgency: "moderate",
          location: { latitude: 22.322, longitude: 87.301 },
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserTickets();
    setRefreshing(false);
  };

  const handleTicketPress = async (ticket: any) => {
    try {
      setFetchingTicketDetails(true);
      setModalVisible(true);

      // Fetch fresh ticket details
      const freshTicketResponse = await ticketsAPI.getTicket(ticket._id);
      setSelectedTicket(freshTicketResponse.ticket);
    } catch (error) {
      console.error("Failed to fetch ticket details:", error);
      setSelectedTicket(ticket);
    } finally {
      setFetchingTicketDetails(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTicket(null);
  };

  const handleVote = async (
    ticketId: string,
    voteType: "upvote" | "downvote"
  ) => {
    // Implement voting logic here
    Alert.alert(
      "Info",
      "Voting feature will be implemented with backend integration"
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#EF4444";
      case "in process":
        return "#F59E0B";
      case "resolved":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "OPEN";
      case "in process":
        return "IN PROGRESS";
      case "resolved":
        return "RESOLVED";
      default:
        return "UNKNOWN";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "#FF4757";
      case "moderate":
        return "#FFA726";
      case "low":
        return "#66BB6A";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const styles = createStyles(colorScheme);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Tickets</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? "light"].tint}
          />
          <Text style={styles.loadingText}>Loading your tickets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tickets</Text>
        <Text style={styles.subtitle}>
          {userTickets.length} ticket{userTickets.length !== 1 ? "s" : ""}{" "}
          created
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {userTickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              name="list.bullet"
              size={64}
              color={Colors[colorScheme ?? "light"].tabIconDefault}
            />
            <Text style={styles.emptyTitle}>No Tickets Yet</Text>
            <Text style={styles.emptySubtitle}>
              You haven't created any tickets yet. Start by reporting an issue
              in your area.
            </Text>
          </View>
        ) : (
          <View style={styles.ticketsContainer}>
            {userTickets.map((ticket) => (
              <TouchableOpacity
                key={ticket._id}
                style={styles.ticketCard}
                onPress={() => handleTicketPress(ticket)}
              >
                <View style={styles.ticketHeader}>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(ticket.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusText(ticket.status)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.urgencyBadge,
                        { backgroundColor: getUrgencyColor(ticket.urgency) },
                      ]}
                    >
                      <Text style={styles.urgencyText}>
                        {ticket.urgency?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ticketDate}>
                    {formatDate(ticket.createdAt)}
                  </Text>
                </View>

                {/* Fix: Use fallback for ticket title if issue_name is missing */}
                <Text style={styles.ticketTitle}>
                  {ticket.issue_name ||
                    ticket.title ||
                    ticket.ticket_name ||
                    "Untitled Ticket"}
                </Text>

                <View style={styles.categoryContainer}>
                  <IconSymbol
                    name="tag"
                    size={16}
                    color={Colors[colorScheme ?? "light"].tint}
                  />
                  <Text style={styles.categoryText}>
                    {ticket.issue_category}
                  </Text>
                </View>

                <Text style={styles.ticketDescription} numberOfLines={2}>
                  {ticket.issue_description}
                </Text>

                <View style={styles.ticketFooter}>
                  <View style={styles.votesContainer}>
                    <View style={styles.voteItem}>
                      <IconSymbol name="arrow.up" size={16} color="#6B7280" />
                      <Text style={styles.voteCount}>
                        {ticket.votes?.upvotes || 0}
                      </Text>
                    </View>
                    <View style={styles.voteItem}>
                      <IconSymbol name="arrow.down" size={16} color="#6B7280" />
                      <Text style={styles.voteCount}>
                        {ticket.votes?.downvotes || 0}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.locationContainer}>
                    <IconSymbol
                      name="location"
                      size={16}
                      color={Colors[colorScheme ?? "light"].tabIconDefault}
                    />
                    <Text style={styles.locationText}>
                      {ticket.location?.latitude?.toFixed(4)},{" "}
                      {ticket.location?.longitude?.toFixed(4)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].tabIconDefault + "20",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: Colors[colorScheme].text,
    },
    subtitle: {
      fontSize: 14,
      color: Colors[colorScheme].tabIconDefault,
      marginTop: 4,
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: Colors[colorScheme].text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
      paddingTop: 100,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: Colors[colorScheme].text,
      marginTop: 20,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: Colors[colorScheme].tabIconDefault,
      textAlign: "center",
      lineHeight: 24,
    },
    ticketsContainer: {
      padding: 20,
    },
    ticketCard: {
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].tabIconDefault + "30",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    ticketHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    statusRow: {
      flexDirection: "row",
      gap: 8,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      color: "white",
      fontWeight: "600",
    },
    urgencyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    urgencyText: {
      fontSize: 12,
      color: "white",
      fontWeight: "600",
    },
    ticketDate: {
      fontSize: 12,
      color: Colors[colorScheme].tabIconDefault,
    },
    ticketTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors[colorScheme].text,
      marginBottom: 8,
    },
    categoryContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    categoryText: {
      fontSize: 14,
      color: Colors[colorScheme].text,
      marginLeft: 6,
      fontWeight: "500",
    },
    ticketDescription: {
      fontSize: 14,
      color: Colors[colorScheme].tabIconDefault,
      lineHeight: 20,
      marginBottom: 12,
    },
    ticketFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    votesContainer: {
      flexDirection: "row",
      gap: 16,
    },
    voteItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    // Removed voteIcon style since images are no longer used
    voteCount: {
      fontSize: 14,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    locationText: {
      fontSize: 12,
      color: Colors[colorScheme].tabIconDefault,
    },
  });
