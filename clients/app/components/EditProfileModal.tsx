import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth } from "@/hooks/useAuth";
import { userAPI } from "@/services/api";
import { UserDeails } from "@/Types/Index";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserDeails;
}

export default function EditProfileModal({
  visible,
  onClose,
  user,
}: EditProfileModalProps) {
  const { colorScheme } = useTheme();
  const { login } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Check if any changes were made
    const hasChanges =
      name.trim() !== (user.name || "") ||
      phone.trim() !== (user.phone || "") ||
      address.trim() !== (user.address || "");

    if (!hasChanges) {
      onClose();
      return;
    }

    setLoading(true);

    try {
      // Call the backend API to update user details
      const response = await userAPI.updateDetails(user.email, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        // Note: location field can be added here when GPS/location picker is implemented
      });

      if (response.user) {
        // Update local user context with the response from backend
        login(response.user);

        Alert.alert("Success", "Your profile has been updated successfully!", [
          { text: "OK", onPress: onClose },
        ]);
      } else {
        Alert.alert("Error", "Failed to update profile. Please try again.");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");
    setErrors({});
    onClose();
  };

  const styles = createStyles(colorScheme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={Colors[colorScheme].tint}
              />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Email Field (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{user.email}</Text>
              <Text style={styles.notEditableText}>Not editable</Text>
            </View>
          </View>

          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: "" }));
                }
              }}
              placeholder="Enter your full name"
              placeholderTextColor={Colors[colorScheme].tabIconDefault}
              autoCapitalize="words"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Phone Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) {
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }
              }}
              placeholder="Enter your phone number"
              placeholderTextColor={Colors[colorScheme].tabIconDefault}
              keyboardType="phone-pad"
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          {/* Address Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.address && styles.inputError,
              ]}
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (errors.address) {
                  setErrors((prev) => ({ ...prev, address: "" }));
                }
              }}
              placeholder="Enter your address"
              placeholderTextColor={Colors[colorScheme].tabIconDefault}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}
          </View>

          {/* Role Field (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{user.role}</Text>
              <Text style={styles.notEditableText}>Not editable</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <IconSymbol
              name="info.circle"
              size={20}
              color={Colors[colorScheme].tint}
            />
            <Text style={styles.infoText}>
              Your profile information will be updated. Email and role cannot be
              changed.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

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
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].tabIconDefault + "20",
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    cancelButton: {
      padding: 8,
    },
    cancelButtonText: {
      fontSize: 16,
      color: Colors[colorScheme].tabIconDefault,
    },
    saveButton: {
      padding: 8,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize: 16,
      color: Colors[colorScheme].tint,
      fontWeight: "600",
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].tabIconDefault + "30",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].background,
    },
    textArea: {
      height: 80,
      paddingTop: 14,
    },
    inputError: {
      borderColor: "#EF4444",
    },
    errorText: {
      fontSize: 14,
      color: "#EF4444",
      marginTop: 4,
    },
    readOnlyInput: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].tabIconDefault + "20",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: Colors[colorScheme].tabIconDefault + "10",
    },
    readOnlyText: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      marginBottom: 4,
    },
    notEditableText: {
      fontSize: 12,
      color: Colors[colorScheme].tabIconDefault,
      fontStyle: "italic",
    },
    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: Colors[colorScheme].tint + "10",
      borderRadius: 12,
      padding: 16,
      gap: 12,
      marginTop: 8,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: Colors[colorScheme].text,
      lineHeight: 20,
    },
  });
