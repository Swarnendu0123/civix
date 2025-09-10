import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";

import Feather from "@expo/vector-icons/Feather";
import Entypo from '@expo/vector-icons/Entypo';

export default function TabLayout() {
  const { colorScheme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />

      {/* Raise Ticket */}
      <Tabs.Screen
        name="raise_ticket"
        options={{
          title: "Raise Ticket",
          tabBarIcon: ({ color }) => (
            <Feather name="plus" size={24} color={color} />
          ),
        }}
      />

      {/* My-Tickets */}
      <Tabs.Screen
        name="my_tickets"
        options={{
          title: "My Tickets",
          tabBarIcon: ({ color }) => (
            <Entypo name="ticket" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
