import React, { useState } from 'react';
import {
  Box,
  HStack,
  Button,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
// import { sampleIssues } from '../data/sampleIssues';
type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  upvotes: number;
  status: "pending" | "in_progress" | "resolved";
  priority: "high" | "medium" | "low";
  createdAt: Date;
};

export const sampleIssues: Issue[] = [
  {
    id: "1",
    title: "Pothole near bus stop",
    description: "Large pothole causing traffic issues",
    category: "Road",
    location: {
      address: "Main St, Mumbai",
      coordinates: { lat: 19.076, lng: 72.8777 }
    },
    upvotes: 12,
    status: "pending",
    priority: "high",
    createdAt: new Date()
  },
  // more issues...
];
type Priority = "high" | "medium" | "low" | string;
const MapView: React.FC = () => {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const mapContainerStyle = {
    width: '100%',
    height: '80vh'
  };

  const center = {
    lat: 19.0760,
    lng: 72.8777
  };

  const getMarkerIcon = (priority:Priority) => {
    switch (priority) {
      case 'high': return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'medium': return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'low': return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      default: return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }
  };

  return (
    <Box p={6}>
      <HStack mb={4} spacing={4}>
        <Select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          w="200px"
        >
          <option value="all">All Issues</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </Select>
      </HStack>

      <Box 
        borderRadius="lg" 
        overflow="hidden" 
        shadow="sm"
        bg={useColorModeValue('white', 'gray.800')}
      >
        <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
          >
            {sampleIssues
              .filter(issue => filterStatus === 'all' || issue.status === filterStatus)
              .map(issue => (
                <Marker
                  key={issue.id}
                  position={issue.location.coordinates}
                  icon={getMarkerIcon(issue.priority)}
                  onClick={() => setSelectedIssue(issue)}
                />
              ))}

            {selectedIssue && (
              <InfoWindow
                position={selectedIssue.location.coordinates}
                onCloseClick={() => setSelectedIssue(null)}
              >
                <Box p={2}>
                  <Box fontWeight="bold">{selectedIssue.title}</Box>
                  <Box fontSize="sm">{selectedIssue.location.address}</Box>
                  <Box fontSize="sm" color="gray.500">
                    Status: {selectedIssue.status}
                  </Box>
                </Box>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </Box>
    </Box>
  );
};

export default MapView;
