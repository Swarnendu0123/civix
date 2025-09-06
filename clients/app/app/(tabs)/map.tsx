import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import api from '@/services/api';

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'urgent' | 'moderate' | 'resolved'>('all');
  const [expandedMarker, setExpandedMarker] = useState<string | null>(null);

  // Sample markers data - in real app would come from API
  const markers = [
    {
      id: 'M001',
      title: 'Pothole near MMM',
      status: 'urgent',
      coordinates: { lat: 28.7041, lng: 77.1025 },
      upvotes: 15,
      description: 'Large pothole causing damage to vehicles. Urgent repair needed.',
      category: 'Roads',
      location: 'Main Street, Sector 12',
      timestamp: '2 hours ago',
      imageUrl: null,
      canUpvote: true
    },
    {
      id: 'M002', 
      title: 'Street light not working',
      status: 'moderate',
      coordinates: { lat: 28.7051, lng: 77.1035 },
      upvotes: 8,
      description: 'Street light has been non-functional for 3 days. Safety concern for residents.',
      category: 'Electricity',
      location: 'Park Avenue, Block A',
      timestamp: '4 hours ago',
      imageUrl: null,
      canUpvote: true
    },
    {
      id: 'M003',
      title: 'Water leak fixed',
      status: 'resolved',
      coordinates: { lat: 28.7061, lng: 77.1045 },
      upvotes: 23,
      description: 'Water leak has been successfully repaired by municipal team.',
      category: 'Water',
      location: 'Central Park, Block B',
      timestamp: '1 day ago',
      imageUrl: null,
      canUpvote: false
    }
  ];

  const filteredMarkers = markers.filter(marker => 
    selectedFilter === 'all' || marker.status === selectedFilter
  );

  const handleMarkerPress = (marker: any) => {
    setExpandedMarker(expandedMarker === marker.id ? null : marker.id);
  };

  const handleUpvote = async (markerId: string) => {
    try {
      // Find the marker in the list
      const marker = markers.find(m => m.id === markerId);
      if (!marker?.canUpvote) return;

      // In a real app, you would update the markers state
      // For now, just show API call
      await api.tickets.voteTicket(markerId, 'upvote');
      
      Alert.alert('Success', 'Your upvote has been recorded!');
    } catch (error) {
      Alert.alert('Error', 'Failed to record your upvote. Please try again.');
      console.error('Upvote error:', error);
    }
  };

  const styles = createStyles(colorScheme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Map View</Text>
        <Text style={styles.subtitle}>Issues around you</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'urgent', 'moderate', 'resolved'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <View style={[styles.filterIndicator, { backgroundColor: getFilterColor(filter) }]} />
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextActive
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <IconSymbol name="map.fill" size={64} color="#6B7280" />
          <Text style={styles.mapPlaceholderText}>Interactive Map</Text>
          <Text style={styles.mapSubtext}>
            This would show an interactive map with issue markers
          </Text>
          
          {/* Sample Markers Display */}
          <View style={styles.markersContainer}>
            {filteredMarkers.map((marker) => (
              <TouchableOpacity
                key={marker.id}
                style={[styles.markerCard, { borderLeftColor: getStatusColor(marker.status) }]}
                onPress={() => handleMarkerPress(marker)}
              >
                <View style={styles.markerHeader}>
                  <Text style={styles.markerTitle}>{marker.title}</Text>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(marker.status) }]} />
                </View>
                <Text style={styles.markerStatus}>Status: {marker.status}</Text>
                <View style={styles.markerFooter}>
                  <Text style={styles.markerCoords}>
                    {marker.coordinates.lat.toFixed(4)}, {marker.coordinates.lng.toFixed(4)}
                  </Text>
                  <View style={styles.upvoteContainer}>
                    <IconSymbol name="arrow.up" size={14} color="#6B7280" />
                    <Text style={styles.upvoteText}>{marker.upvotes}</Text>
                  </View>
                </View>
                
                {/* Expanded Details */}
                {expandedMarker === marker.id && (
                  <View style={styles.expandedDetails}>
                    <View style={styles.detailsDivider} />
                    <View style={styles.detailsSection}>
                      <Text style={styles.detailsTitle}>Issue Details</Text>
                      <Text style={styles.detailsDescription}>{marker.description}</Text>
                    </View>
                    
                    <View style={styles.detailsRow}>
                      <View style={styles.detailsItem}>
                        <Text style={styles.detailsLabel}>Category</Text>
                        <Text style={styles.detailsValue}>{marker.category}</Text>
                      </View>
                      <View style={styles.detailsItem}>
                        <Text style={styles.detailsLabel}>Location</Text>
                        <Text style={styles.detailsValue}>{marker.location}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailsRow}>
                      <View style={styles.detailsItem}>
                        <Text style={styles.detailsLabel}>Reported</Text>
                        <Text style={styles.detailsValue}>{marker.timestamp}</Text>
                      </View>
                      <View style={styles.detailsItem}>
                        <Text style={styles.detailsLabel}>Priority</Text>
                        <Text style={styles.detailsValue}>{marker.status}</Text>
                      </View>
                    </View>
                    
                    {marker.imageUrl && (
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
                        style={[styles.upvoteButton, !marker.canUpvote && styles.upvoteButtonDisabled]}
                        onPress={() => handleUpvote(marker.id)}
                        disabled={!marker.canUpvote}
                      >
                        <IconSymbol name="arrow.up" size={20} color={marker.canUpvote ? "white" : "#6B7280"} />
                        <Text style={[styles.upvoteButtonText, !marker.canUpvote && styles.upvoteButtonTextDisabled]}>
                          {marker.canUpvote ? 'Upvote' : 'Voted'}
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
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Urgent Issues</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Moderate Priority</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Resolved Issues</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getFilterColor = (filter: string) => {
  switch (filter) {
    case 'urgent': return '#EF4444';
    case 'moderate': return '#F59E0B';
    case 'resolved': return '#10B981';
    default: return '#6B7280';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'urgent': return '#EF4444';
    case 'moderate': return '#F59E0B'; 
    case 'resolved': return '#10B981';
    default: return '#6B7280';
  }
};

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: Colors[colorScheme].tint + '20',
    borderColor: Colors[colorScheme].tint,
  },
  filterIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterText: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
  },
  filterTextActive: {
    color: Colors[colorScheme].tint,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors[colorScheme].text,
    marginTop: 16,
  },
  mapSubtext: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  markersContainer: {
    width: '100%',
    gap: 12,
  },
  markerCard: {
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
  },
  markerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  markerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  markerStatus: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  markerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markerCoords: {
    fontSize: 12,
    color: Colors[colorScheme].tabIconDefault,
    fontFamily: 'monospace',
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
  legend: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors[colorScheme].background,
    borderTopWidth: 1,
    borderTopColor: Colors[colorScheme].tabIconDefault + '20',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors[colorScheme].text,
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors[colorScheme].tabIconDefault,
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