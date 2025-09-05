import React, { useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import api from '@/services/api';

export default function RaiseIssueScreen() {
  const { colorScheme } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [issueTitle, setIssueTitle] = useState('');
  const [location, setLocation] = useState('Auto-detecting location...');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = [
    'Sanitation',
    'Electricity', 
    'Water',
    'Roads',
    'Street Lights',
    'Drainage',
    'Traffic',
    'Others'
  ];

  const handleImageUpload = () => {
    Alert.alert(
      'Select Image Source',
      'Choose how you want to add an image',
      [
        { text: 'Camera', onPress: () => {
          setSelectedImage('camera');
          Alert.alert('Camera', 'Would open camera to take photo');
        }},
        { text: 'Gallery', onPress: () => {
          setSelectedImage('gallery'); 
          Alert.alert('Gallery', 'Would open gallery to select photo');
        }},
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleLocationDetect = () => {
    Alert.alert('Location', 'Would detect current GPS location');
    setLocation('Current Location: Main Street, Sector 12');
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!issueTitle.trim()) {
      Alert.alert('Error', 'Please provide a title for the issue');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description of the issue');
      return;
    }
    
    if (selectedTags.length === 0) {
      Alert.alert('Error', 'Please select at least one category tag');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for the API request
      const formData = new FormData();
      formData.append('issue_name', issueTitle);
      formData.append('issue_description', description);
      formData.append('issue_category', selectedTags[0]); // Use first selected tag as category
      formData.append('urgency', 'moderate'); // Default urgency
      formData.append('location_address', location === 'Auto-detecting location...' ? 'User Location' : location);
      formData.append('location_lat', '19.0760'); // Default coordinates - would be GPS in real app
      formData.append('location_lng', '72.8777');
      formData.append('tags', selectedTags.join(','));

      // If image is selected, you would add it here
      // formData.append('image', imageFile);

      await api.tickets.createTicket(formData);

      Alert.alert(
        'Issue Submitted',
        'Your civic issue has been reported successfully! You will be notified of updates.',
        [{ text: 'OK', onPress: () => {
          // Reset form
          setIssueTitle('');
          setDescription('');
          setSelectedImage(null);
          setSelectedTags([]);
          setLocation('Auto-detecting location...');
        }}]
      );
    } catch (error) {
      console.error('Error submitting issue:', error);
      Alert.alert(
        'Submission Failed',
        'Failed to submit your issue. Please try again.',
        [{ text: 'OK' }]
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
        <Text style={styles.title}>Report Issue</Text>
        <Text style={styles.subtitle}>Help make your community better</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photo</Text>
          <TouchableOpacity style={styles.imageUploadArea} onPress={handleImageUpload}>
            {selectedImage ? (
              <View style={styles.imagePreview}>
                <IconSymbol name="photo.fill" size={48} color="#10B981" />
                <Text style={styles.imageSelectedText}>Image Selected ({selectedImage})</Text>
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
          <Text style={styles.sectionTitle}>Issue Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Brief title for the issue..."
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            value={issueTitle}
            onChangeText={setIssueTitle}
          />
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationInput}>
              <IconSymbol name="location.fill" size={20} color="#3B82F6" />
              <Text style={styles.locationText}>{location}</Text>
            </View>
            <TouchableOpacity style={styles.detectButton} onPress={handleLocationDetect}>
              <IconSymbol name="location.magnifyingglass" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Map Preview */}
          <View style={styles.mapPreview}>
            <IconSymbol name="map.fill" size={32} color="#6B7280" />
            <Text style={styles.mapPreviewText}>Location Preview</Text>
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Tags</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.tagsContainer}>
            {availableTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.tagSelected
                ]}
                onPress={() => handleTagToggle(tag)}
              >
                <Text style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.tagTextSelected
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <IconSymbol name="paperplane.fill" size={24} color="white" />
            )}
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Issue'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.submitNote}>
            Your report will be reviewed and assigned to the appropriate authority
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderStyle: 'dashed',
  },
  imageUploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors[colorScheme].tint + '10',
    borderRadius: 10,
  },
  imageSelectedText: {
    fontSize: 16,
    color: '#10B981',
    marginTop: 8,
    fontWeight: '600',
  },
  imageTapText: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    marginTop: 4,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors[colorScheme].text,
    backgroundColor: Colors[colorScheme].background,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors[colorScheme].text,
    backgroundColor: Colors[colorScheme].background,
    minHeight: 100,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  locationInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
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
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 12,
  },
  mapPreview: {
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors[colorScheme].tabIconDefault + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPreviewText: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors[colorScheme].background,
    borderWidth: 1,
    borderColor: Colors[colorScheme].tabIconDefault + '30',
  },
  tagSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  tagText: {
    fontSize: 14,
    color: Colors[colorScheme].text,
  },
  tagTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  submitSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  submitNote: {
    fontSize: 14,
    color: Colors[colorScheme].tabIconDefault,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});