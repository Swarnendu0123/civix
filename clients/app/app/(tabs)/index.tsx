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
import api from "@/services/api";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    activeTickets: 0,
    resolvedToday: 0,
    inProgress: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

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
          const transformedTickets = recentTicketsRaw.map(
            api.transformers.ticketToMobileFormat
          );
          setRecentTickets(transformedTickets);
        } catch (error) {
          console.log("Tickets not available, using sample data");
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

  const handleReportIssue = () => {
    router.push("/raise-issue");
  };

  const styles = createStyles(colorScheme);

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
        {/* Civix Points */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <IconSymbol name="star.fill" size={24} color="#F59E0B" />
            <Text style={styles.pointsTitle}>Civix Points</Text>
          </View>
          <Text style={styles.pointsValue}>{user.points}</Text>
          <Text style={styles.pointsSubtext}>
            Keep reporting issues to earn more points!
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleReportIssue}
          >
            <IconSymbol name="plus.circle.fill" size={24} color="white" />
            <Text style={styles.primaryButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Tickets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Tickets Feed</Text>
          {recentTickets.map((ticket) => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle}>{ticket.title}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(ticket.statusColor) },
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
                  <Text style={styles.upvoteText}>{ticket.upvotes}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (color: string) => {
  switch (color) {
    case "red":
      return "#EF4444";
    case "orange":
      return "#F59E0B";
    case "green":
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
