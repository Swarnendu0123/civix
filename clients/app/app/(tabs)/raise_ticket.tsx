import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";

export default function Raiseticketscreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [ticketTitle, setticketTitle] = useState("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedticketType, setSelectedticketType] = useState<string>("");
  const [selectedUrgency, setSelectedUrgency] = useState<
    "critical" | "moderate" | "low"
  >("moderate");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ticketTypes = ["sanitation", "electricity", "water", "road", "other"];

  const urgencyLevels = [
    { value: "low", label: "Low Priority", color: "#10B981" },
    { value: "moderate", label: "Moderate", color: "#F59E0B" },
    { value: "critical", label: "Critical", color: "#EF4444" },
  ];

  const availableTags = [
    "Urgent",
    "Safety Concern",
    "Quality ticket",
    "Infrastructure",
    "Environment",
    "Public Health",
    "Accessibility",
  ];

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is required to report tickets accurately. Please enable location access.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Try Again", onPress: getCurrentLocation },
          ]
        );
        setLocationLoading(false);
        return;
      }

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocode to get address
      const reverseGeocodeResult = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const address = reverseGeocodeResult[0];
      const formattedAddress = address
        ? `${address.name || address.street || ""}, ${
            address.city || address.region || ""
          }`
        : `${currentLocation.coords.latitude.toFixed(
            4
          )}, ${currentLocation.coords.longitude.toFixed(4)}`;

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: formattedAddress,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Location Error",
        "Could not get your current location. You can manually set the location later.",
        [{ text: "OK" }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Request location permissions and get current location
  useEffect(() => {
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = () => {
    Alert.alert("Select Image Source", "Choose how you want to add an image", [
      {
        text: "Camera",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (permission.granted) {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
            }
          } else {
            Alert.alert(
              "Permission Required",
              "Camera permission is required to take photos."
            );
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (permission.granted) {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
            }
          } else {
            Alert.alert(
              "Permission Required",
              "Gallery permission is required to select photos."
            );
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleLocationDetect = () => {
    getCurrentLocation();
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!ticketTitle.trim()) {
      Alert.alert("Error", "Please provide a title for the ticket");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please provide a description of the ticket");
      return;
    }

    if (!selectedticketType) {
      Alert.alert("Error", "Please select an ticket type");
      return;
    }

    if (!location) {
      Alert.alert(
        "Error",
        "Location is required. Please allow location access or try again."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let currentUser = user;

      // If no user is logged in, create a demo user for testing
      if (!currentUser) {
        console.log("No user logged in, creating demo user...");
        try {
          currentUser = await api.user.createDemoUser();
          console.log("Demo user created:", currentUser);
        } catch (error) {
          console.error("Failed to create demo user:", error);
          Alert.alert(
            "Error",
            "Could not create user account. Please try again."
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare data in the format expected by the server API
      const ticketData = {
        creator_id: currentUser._id || currentUser.id || currentUser.uid,
        creator_name: currentUser.name || "Anonymous User",
        creator_email: currentUser.email || undefined, // Add email for backend user lookup/creation
        ticket_name: ticketTitle,
        ticket_description: description,
        ticket_category: selectedticketType,
        image_url: imageUri || undefined,
        tags: selectedTags,
        urgency: selectedUrgency,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        votes: { upvotes: [], downvotes: [] }, // Initialize votes
      };

      console.log("Submitting ticket data:", ticketData);

      const response = await api.tickets.createTicket(ticketData);

      // Prepare success message
      let successMessage = "Your civic ticket has been reported successfully!";
      let additionalInfo = "";

      if (response.ticket) {
        additionalInfo = `✅ Your ticket has been recorded with ID: ${response.ticket._id}`;
      } else {
        additionalInfo = `📋 Your ticket is now in the system for review.`;
      }

      Alert.alert(
        "ticket Submitted",
        `${successMessage}\n\n${additionalInfo}\n\nYou will be notified of all updates.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setticketTitle("");
              setDescription("");
              setImageUri(null);
              setSelectedTags([]);
              setSelectedticketType("");
              setSelectedUrgency("moderate");
              // Don't reset location as user might be reporting multiple tickets from same place
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting ticket:", error);
      Alert.alert(
        "Submission Failed",
        `Failed to submit your ticket: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please try again.`,
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = createStyles(colorScheme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Report ticket</Text>
        <Text style={styles.subtitle}>Help make your community better</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photo</Text>
          <TouchableOpacity
            style={styles.imageUploadArea}
            onPress={handleImageUpload}
          >
            {imageUri ? (
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.selectedImage}
                />
                <Text style={styles.imageSelectedText}>Image Selected</Text>
                <Text style={styles.imageTapText}>Tap to change</Text>
              </View>
            ) : (
              <View style={styles.imageUploadPlaceholder}>
                <IconSymbol name="camera.fill" size={48} color="#6B7280" />
                <Text style={styles.imageUploadText}>Tap to add photo</Text>
                <Text style={styles.imageUploadSubtext}>Camera or Gallery</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ticket Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Brief title for the ticket..."
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            value={ticketTitle}
            onChangeText={setticketTitle}
          />
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe the ticket in detail..."
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* ticket Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ticket Type</Text>
          <Text style={styles.sectionSubtitle}>
            Select the main category for this ticket
          </Text>
          <View style={styles.ticketTypeContainer}>
            {ticketTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.ticketTypeOption,
                  selectedticketType === type &&
                    styles.ticketTypeOptionSelected,
                ]}
                onPress={() => setSelectedticketType(type)}
              >
                <View
                  style={[
                    styles.radioButton,
                    selectedticketType === type && styles.radioButtonSelected,
                  ]}
                >
                  {selectedticketType === type && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.ticketTypeText,
                    selectedticketType === type &&
                      styles.ticketTypeTextSelected,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Smart Classification Info */}
          {selectedticketType === "other" && (
            <View style={styles.smartClassificationInfo}>
              <IconSymbol name="brain.head.profile" size={20} color="#8B5CF6" />
              <Text style={styles.smartClassificationText}>
                AI will analyze your description to automatically classify this
                ticket into the appropriate category
              </Text>
            </View>
          )}
        </View>

        {/* Urgency Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority Level</Text>
          <Text style={styles.sectionSubtitle}>How urgent is this ticket?</Text>
          <View style={styles.urgencyContainer}>
            {urgencyLevels.map((urgency) => (
              <TouchableOpacity
                key={urgency.value}
                style={[
                  styles.urgencyOption,
                  selectedUrgency === urgency.value && {
                    backgroundColor: urgency.color + "15",
                    borderColor: urgency.color,
                  },
                ]}
                onPress={() =>
                  setSelectedUrgency(
                    urgency.value as "critical" | "moderate" | "low"
                  )
                }
              >
                <View
                  style={[
                    styles.radioButton,
                    selectedUrgency === urgency.value && {
                      borderColor: urgency.color,
                    },
                  ]}
                >
                  {selectedUrgency === urgency.value && (
                    <View
                      style={[
                        styles.radioButtonInner,
                        { backgroundColor: urgency.color },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.urgencyText,
                    selectedUrgency === urgency.value && {
                      color: urgency.color,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {urgency.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationInput}>
              <IconSymbol name="location.fill" size={20} color="#3B82F6" />
              <Text style={styles.locationText}>
                {locationLoading
                  ? "Detecting location..."
                  : location
                  ? location.address
                  : "Location not available"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.detectButton}
              onPress={handleLocationDetect}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <IconSymbol
                  name="location.magnifyingglass"
                  size={20}
                  color="white"
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Map Preview */}
          <View style={styles.mapPreview}>
            <IconSymbol name="map.fill" size={32} color="#6B7280" />
            <Text style={styles.mapPreviewText}>
              {location
                ? `Lat: ${location.latitude.toFixed(
                    4
                  )}, Lng: ${location.longitude.toFixed(4)}`
                : "Location Preview"}
            </Text>
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Tags</Text>
          <Text style={styles.sectionSubtitle}>
            Select any that apply (optional)
          </Text>
          <View style={styles.tagsContainer}>
            {availableTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.tagSelected,
                ]}
                onPress={() => handleTagToggle(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <IconSymbol name="paperplane.fill" size={24} color="white" />
            )}
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Submitting..." : "Submit ticket"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.submitNote}>
            Your report will be reviewed and assigned to the appropriate
            authority
          </Text>
        </View>
      </ScrollView>
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
      backgroundColor: Colors[colorScheme].background,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].tabIconDefault + "20",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: Colors[colorScheme].text,
    },
    subtitle: {
      fontSize: 16,
      color: Colors[colorScheme].tabIconDefault,
      marginTop: 4,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    section: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: Colors[colorScheme].tabIconDefault,
      marginBottom: 12,
    },
    imageUploadArea: {
      height: 120,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: Colors[colorScheme].tabIconDefault + "30",
      borderStyle: "dashed",
    },
    imageUploadPlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    imageUploadText: {
      fontSize: 16,
      color: Colors[colorScheme].tabIconDefault,
      marginTop: 8,
    },
    imageUploadSubtext: {
      fontSize: 14,
      color: Colors[colorScheme].tabIconDefault,
      marginTop: 4,
    },
    imagePreview: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors[colorScheme].tint + "10",
      borderRadius: 10,
      position: "relative",
    },
    selectedImage: {
      width: "100%",
      height: "100%",
      borderRadius: 10,
      position: "absolute",
    },
    imageSelectedText: {
      fontSize: 16,
      color: "#10B981",
      marginTop: 8,
      fontWeight: "600",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    imageTapText: {
      fontSize: 14,
      color: Colors[colorScheme].tabIconDefault,
      marginTop: 4,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    titleInput: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].tabIconDefault + "30",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].background,
    },
    descriptionInput: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].tabIconDefault + "30",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].background,
      minHeight: 100,
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    locationInput: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].tabIconDefault + "30",
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].background,
      gap: 12,
    },
    locationText: {
      flex: 1,
      fontSize: 16,
      color: Colors[colorScheme].text,
    },
    detectButton: {
      backgroundColor: "#3B82F6",
      padding: 12,
      borderRadius: 12,
    },
    mapPreview: {
      height: 100,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].tabIconDefault + "10",
      justifyContent: "center",
      alignItems: "center",
    },
    mapPreviewText: {
      fontSize: 14,
      color: Colors[colorScheme].tabIconDefault,
      marginTop: 8,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    tag: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].tabIconDefault + "30",
    },
    tagSelected: {
      backgroundColor: "#3B82F6",
      borderColor: "#3B82F6",
    },
    tagText: {
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    tagTextSelected: {
      color: "white",
      fontWeight: "600",
    },
    ticketTypeContainer: {
      gap: 12,
    },
    ticketTypeOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].tabIconDefault + "30",
      gap: 12,
    },
    ticketTypeOptionSelected: {
      backgroundColor: "#3B82F6" + "15",
      borderColor: "#3B82F6",
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: Colors[colorScheme].tabIconDefault + "50",
      alignItems: "center",
      justifyContent: "center",
    },
    radioButtonSelected: {
      borderColor: "#3B82F6",
    },
    radioButtonInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#3B82F6",
    },
    ticketTypeText: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      flex: 1,
    },
    ticketTypeTextSelected: {
      color: "#3B82F6",
      fontWeight: "600",
    },
    smartClassificationInfo: {
      marginTop: 12,
      padding: 12,
      backgroundColor: "#8B5CF6" + "10",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#8B5CF6" + "30",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    smartClassificationText: {
      flex: 1,
      fontSize: 14,
      color: "#8B5CF6",
      lineHeight: 18,
    },
    submitSection: {
      marginTop: 32,
      marginBottom: 32,
    },
    submitButton: {
      backgroundColor: "#10B981",
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    submitButtonDisabled: {
      backgroundColor: "#6B7280",
    },
    submitButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
    },
    submitNote: {
      fontSize: 14,
      color: Colors[colorScheme].tabIconDefault,
      textAlign: "center",
      marginTop: 12,
      lineHeight: 20,
    },
    urgencyContainer: {
      gap: 12,
    },
    urgencyOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].tabIconDefault + "30",
      gap: 12,
    },
    urgencyText: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      flex: 1,
    },
  });
